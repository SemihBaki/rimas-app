import { db, newOrderNumber, nowIso } from './db';

export const FREE_SHIPPING_THRESHOLD = 2000;
export const STANDARD_SHIPPING = 49.9;
export const EXPRESS_SHIPPING = 89.9;

export type OrderItemInput = {
  productId: string;
  name: string;
  size: string;
  color: string;
  qty: number;
  price: number;
};

export type OrderInput = {
  email: string;
  name: string;
  phone?: string;
  address?: string;
  city?: string;
  district?: string;
  postalCode?: string;
  shipping: 'standart' | 'express';
  items: OrderItemInput[];
};

export type OrderItem = OrderItemInput;

export type OrderSummary = {
  number: string;
  email: string;
  name: string;
  phone: string | null;
  address: string | null;
  city: string | null;
  district: string | null;
  postalCode: string | null;
  shipping: 'standart' | 'express';
  itemCount: number;
  subtotal: number;
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
  shipping: 'standart' | 'express';
  item_count: number;
  subtotal: number;
  shipping_cost: number;
  total: number;
  delivery: string;
  created_at: string;
};

function round(value: number) {
  return Math.round(value * 100) / 100;
}

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

function sanitizeItems(items: unknown): OrderItemInput[] | null {
  if (!Array.isArray(items) || items.length === 0 || items.length > 40) return null;

  const clean: OrderItemInput[] = [];
  for (const entry of items) {
    if (!entry || typeof entry !== 'object') return null;
    const item = entry as Record<string, unknown>;
    const qty = Number(item.qty);
    const price = Number(item.price);
    const productId = typeof item.productId === 'string' ? item.productId.slice(0, 60) : '';
    const name = typeof item.name === 'string' ? item.name.slice(0, 120) : '';
    const size = typeof item.size === 'string' ? item.size.slice(0, 20) : '';
    const color = typeof item.color === 'string' ? item.color.slice(0, 40) : '';

    if (!productId || !name || !size) return null;
    if (!Number.isFinite(qty) || qty < 1 || qty > 10) return null;
    if (!Number.isFinite(price) || price < 0 || price > 100000) return null;

    clean.push({ productId, name, size, color, qty: Math.floor(qty), price: round(price) });
  }
  return clean;
}

export function createOrder(input: OrderInput, userId: string | null): OrderSummary {
  const items = sanitizeItems(input.items);
  if (!items) throw new Error('INVALID_ITEMS');

  const subtotal = round(items.reduce((sum, item) => sum + item.price * item.qty, 0));
  const shipping = input.shipping === 'express' ? 'express' : 'standart';
  const shippingCost =
    shipping === 'express' ? EXPRESS_SHIPPING : subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : STANDARD_SHIPPING;
  const total = round(subtotal + shippingCost);
  const itemCount = items.reduce((count, item) => count + item.qty, 0);
  const number = newOrderNumber();
  const createdAt = nowIso();
  const delivery = deliveryDate(shipping === 'express' ? 1 : 3);

  const database = db();
  database
    .prepare(
      `INSERT INTO orders (number, user_id, email, name, phone, address, city, district, postal_code,
                           shipping, subtotal, shipping_cost, total, item_count, delivery, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
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
      subtotal,
      shippingCost,
      total,
      itemCount,
      delivery,
      createdAt
    );

  const insertItem = database.prepare(
    `INSERT INTO order_items (order_number, product_id, name, size, color, qty, price)
     VALUES (?, ?, ?, ?, ?, ?, ?)`
  );
  for (const item of items) {
    insertItem.run(number, item.productId, item.name, item.size, item.color, item.qty, item.price);
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
    subtotal,
    shippingCost,
    total,
    delivery,
    status: 'hazirlaniyor',
    createdAt,
    items,
  };
}

function itemsFor(number: string): OrderItem[] {
  const rows = db()
    .prepare('SELECT product_id, name, size, color, qty, price FROM order_items WHERE order_number = ?')
    .all(number) as {
    product_id: string;
    name: string;
    size: string;
    color: string;
    qty: number;
    price: number;
  }[];

  return rows.map((row) => ({
    productId: row.product_id,
    name: row.name,
    size: row.size,
    color: row.color,
    qty: row.qty,
    price: row.price,
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
