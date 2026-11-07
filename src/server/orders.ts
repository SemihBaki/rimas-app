import {
  PRODUCTS,
  packAvailable,
  packLabel,
  packNetPrice,
  packPieces,
} from '@/data/catalog';
import {
  VAT_RATE,
  calculateTotals,
  roundMoney,
  type ShippingMethod,
} from '@/lib/pricing';

import { db, newOrderNumber, nowIso } from './db';
import { soldOutSizesFor } from './stock';

export { FREE_SHIPPING_THRESHOLD, STANDARD_SHIPPING, EXPRESS_SHIPPING } from '@/lib/pricing';

/**
 * Orders never carry prices from the client. The API resolves each line
 * against the catalogue and derives the amount, so a tampered request cannot
 * change what a pack costs.
 */
export type OrderItemInput = {
  productId: string;
  packId: string | null;
  size: string | null;
  color: string;
  qty: number;
};

/** What gets stored and shown: a frozen copy of the catalogue at order time. */
export type OrderItem = {
  productId: string;
  name: string;
  /** Pack lines store an empty string; single pieces store the size. */
  size: string;
  color: string;
  /** Number of packs (or pieces on single-piece lines). */
  qty: number;
  /** Net price of one cart unit. */
  price: number;
  packId: string | null;
  packLabel: string | null;
  /** Pieces included in one cart unit. */
  packPieces: number;
  /** Net price of one piece. */
  unitPrice: number;
  vatRate: number;
};

export type OrderInput = {
  email: string;
  name: string;
  phone?: string;
  address?: string;
  city?: string;
  district?: string;
  postalCode?: string;
  shipping: ShippingMethod;
  items: unknown;
};

export type OrderSummary = {
  number: string;
  email: string;
  name: string;
  phone: string | null;
  address: string | null;
  city: string | null;
  district: string | null;
  postalCode: string | null;
  shipping: ShippingMethod;
  itemCount: number;
  subtotal: number;
  vatTotal: number;
  shippingCost: number;
  total: number;
  delivery: string;
  status: 'hazirlaniyor' | 'kargoda' | 'teslim';
  createdAt: string;
  items: OrderItem[];
};

type OrderRow = {
  number: string;
  user_id: string | null;
  email: string;
  name: string;
  phone: string | null;
  address: string | null;
  city: string | null;
  district: string | null;
  postal_code: string | null;
  shipping: ShippingMethod;
  subtotal: number;
  vat_total: number;
  shipping_cost: number;
  total: number;
  item_count: number;
  delivery: string;
  created_at: string;
};

/** DD.MM in Turkish convention, skipping weekends. */
function deliveryDate(businessDays: number): string {
  const date = new Date();
  let remaining = businessDays;
  while (remaining > 0) {
    date.setDate(date.getDate() + 1);
    const day = date.getDay();
    if (day !== 0 && day !== 6) remaining -= 1;
  }
  const dd = String(date.getDate()).padStart(2, '0');
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  return `${dd}.${mm}`;
}

function resolveItems(input: unknown): OrderItem[] | null {
  if (!Array.isArray(input) || input.length === 0 || input.length > 40) return null;

  const clean: OrderItem[] = [];
  for (const entry of input) {
    if (!entry || typeof entry !== 'object') return null;
    const raw = entry as Record<string, unknown>;

    const productId = typeof raw.productId === 'string' ? raw.productId : '';
    const product = PRODUCTS.find((item) => item.id === productId);
    if (!product) return null;

    const qty = Number(raw.qty);
    if (!Number.isInteger(qty) || qty < 1 || qty > 50) return null;

    const color = typeof raw.color === 'string' ? raw.color.trim().slice(0, 40) : '';
    if (!color) return null;

    const vatRate = product.vatRate ?? VAT_RATE;
    const packId = typeof raw.packId === 'string' && raw.packId ? raw.packId : null;
    // Warehouse snapshot wins over the catalogue's demo availability.
    const soldOut = soldOutSizesFor(product.id, product.soldOutSizes);

    if (packId) {
      const pack = product.packs.find((item) => item.id === packId);
      if (!pack || !packAvailable(product, pack, soldOut)) return null;
      clean.push({
        productId,
        name: product.name,
        size: '',
        color,
        qty,
        price: packNetPrice(product, pack),
        packId: pack.id,
        packLabel: packLabel(pack),
        packPieces: packPieces(pack),
        unitPrice: product.unitPrice,
        vatRate,
      });
      continue;
    }

    // Single-piece lines exist only where the company enabled the exception.
    if (!product.allowSinglePiece) return null;
    const size = typeof raw.size === 'string' ? raw.size : '';
    if (!size || !product.sizes.includes(size)) return null;
    if (soldOut.includes(size)) return null;

    clean.push({
      productId,
      name: product.name,
      size,
      color,
      qty,
      price: product.unitPrice,
      packId: null,
      packLabel: null,
      packPieces: 1,
      unitPrice: product.unitPrice,
      vatRate,
    });
  }

  return clean;
}

export function createOrder(input: OrderInput, userId: string | null): OrderSummary {
  const items = resolveItems(input.items);
  if (!items) throw new Error('INVALID_ITEMS');

  const shipping: ShippingMethod = input.shipping === 'express' ? 'express' : 'standart';

  const totals = calculateTotals(
    items.map((item) => ({ net: roundMoney(item.price * item.qty), vatRate: item.vatRate })),
    shipping
  );

  const itemCount = items.reduce((count, item) => count + item.packPieces * item.qty, 0);
  const number = newOrderNumber();
  const createdAt = nowIso();
  const delivery = deliveryDate(shipping === 'express' ? 1 : 3);

  const database = db();
  database
    .prepare(
      `INSERT INTO orders (number, user_id, email, name, phone, address, city, district, postal_code,
                           shipping, subtotal, vat_total, shipping_cost, total, item_count, delivery, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    )
    .run(
      number,
      userId,
      input.email,
      input.name,
      input.phone ?? null,
      input.address ?? null,
      input.city ?? null,
      input.district ?? null,
      input.postalCode ?? null,
      shipping,
      totals.netTotal,
      totals.vatTotal,
      totals.shippingCost,
      totals.total,
      itemCount,
      delivery,
      createdAt
    );

  const insertItem = database.prepare(
    `INSERT INTO order_items (order_number, product_id, name, size, color, qty, price,
                              pack_id, pack_label, pack_pieces, unit_price, vat_rate)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  );
  for (const item of items) {
    insertItem.run(
      number,
      item.productId,
      item.name,
      item.size,
      item.color,
      item.qty,
      item.price,
      item.packId,
      item.packLabel,
      item.packPieces,
      item.unitPrice,
      item.vatRate
    );
  }

  return {
    number,
    email: input.email,
    name: input.name,
    phone: input.phone ?? null,
    address: input.address ?? null,
    city: input.city ?? null,
    district: input.district ?? null,
    postalCode: input.postalCode ?? null,
    shipping,
    itemCount,
    subtotal: totals.netTotal,
    vatTotal: totals.vatTotal,
    shippingCost: totals.shippingCost,
    total: totals.total,
    delivery,
    status: 'hazirlaniyor',
    createdAt,
    items,
  };
}

type ItemRow = {
  product_id: string;
  name: string;
  size: string;
  color: string;
  qty: number;
  price: number;
  pack_id: string | null;
  pack_label: string | null;
  pack_pieces: number;
  unit_price: number;
  vat_rate: number;
};

function itemsFor(number: string): OrderItem[] {
  const rows = db()
    .prepare(
      `SELECT product_id, name, size, color, qty, price, pack_id, pack_label,
              pack_pieces, unit_price, vat_rate
       FROM order_items WHERE order_number = ?`
    )
    .all(number) as ItemRow[];

  return rows.map((row) => ({
    productId: row.product_id,
    name: row.name,
    size: row.size,
    color: row.color,
    qty: row.qty,
    price: row.price,
    packId: row.pack_id,
    packLabel: row.pack_label,
    packPieces: row.pack_pieces || 1,
    unitPrice: row.unit_price || row.price,
    vatRate: row.vat_rate || VAT_RATE,
  }));
}

function toSummary(row: OrderRow, withItems: boolean): OrderSummary {
  return {
    number: row.number,
    email: row.email,
    name: row.name,
    phone: row.phone,
    address: row.address,
    city: row.city,
    district: row.district,
    postalCode: row.postal_code,
    shipping: row.shipping,
    itemCount: row.item_count,
    subtotal: row.subtotal,
    vatTotal: row.vat_total,
    shippingCost: row.shipping_cost,
    total: row.total,
    delivery: row.delivery,
    status: 'hazirlaniyor',
    createdAt: row.created_at,
    items: withItems ? itemsFor(row.number) : [],
  };
}

export function listOrders(userId: string, limit = 25): OrderSummary[] {
  const rows = db()
    .prepare('SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC LIMIT ?')
    .all(userId, Math.min(Math.max(limit, 1), 50)) as OrderRow[];
  return rows.map((row) => toSummary(row, false));
}

export function findOrder(number: string, userId: string | null): OrderSummary | null {
  if (!userId) return null;

  const row = db().prepare('SELECT * FROM orders WHERE number = ?').get(number) as OrderRow | undefined;
  if (!row || row.user_id !== userId) return null;

  return toSummary(row, true);
}
