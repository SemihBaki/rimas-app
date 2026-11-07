import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import {
  PRODUCTS,
  packAvailable,
  packDistribution,
  packLabel,
  packNetPrice,
  packPieces,
  type Product,
  type ProductPack,
} from '@/data/catalog';
import { sizeLabel } from '@/lib/format';
import {
  VAT_RATE,
  calculateTotals,
  roundMoney,
  type ShippingMethod,
  type Totals,
} from '@/lib/pricing';

import { soldOutSizesFor, useStock } from './stock';

/** Wholesale shoppers buy many packs; ten was a retail limit. */
export const MAX_LINE_QTY = 50;

export type CartLine = {
  id: string;
  productId: string;
  /** null means a single-piece line (exception products only). */
  packId: string | null;
  /** Size of the single piece; null for pack lines. */
  size: string | null;
  color: string;
  /** Number of packs (or pieces, for single-piece lines). */
  qty: number;
};

export type AddToCartInput = {
  productId: string;
  packId: string | null;
  color: string;
  qty?: number;
  size?: string | null;
};

export type Order = {
  number: string;
  total: number;
  itemCount: number;
  email: string;
  delivery: string;
  netTotal?: number;
  vatTotal?: number;
  shippingCost?: number;
};

type ShopState = {
  lines: CartLine[];
  favorites: string[];
  recent: string[];
  lastOrder: Order | null;
  addToCart: (input: AddToCartInput) => void;
  setQty: (lineId: string, qty: number) => void;
  removeLine: (lineId: string) => void;
  clearCart: () => void;
  toggleFavorite: (productId: string) => void;
  addRecent: (term: string) => void;
  clearRecent: () => void;
  completeOrder: (order: Order) => void;
};

const lineId = (
  productId: string,
  packId: string | null,
  size: string | null,
  color: string
) => `${productId}::${packId ?? 'tek'}::${size ?? ''}::${color}`;

export const useShop = create<ShopState>()(
  persist(
    (set, get) => ({
      lines: [],
      favorites: [],
      recent: [],
      lastOrder: null,

      addToCart: ({ productId, packId, color, qty = 1, size = null }) => {
        const id = lineId(productId, packId, packId ? null : size, color);
        const existing = get().lines.find((line) => line.id === id);
        if (existing) {
          set({
            lines: get().lines.map((line) =>
              line.id === id
                ? { ...line, qty: Math.min(line.qty + qty, MAX_LINE_QTY) }
                : line
            ),
          });
          return;
        }
        set({
          lines: [
            ...get().lines,
            {
              id,
              productId,
              packId,
              size: packId ? null : size,
              color,
              qty: Math.min(qty, MAX_LINE_QTY),
            },
          ],
        });
      },

      setQty: (id, qty) => {
        if (qty <= 0) {
          set({ lines: get().lines.filter((line) => line.id !== id) });
          return;
        }
        set({
          lines: get().lines.map((line) =>
            line.id === id ? { ...line, qty: Math.min(qty, MAX_LINE_QTY) } : line
          ),
        });
      },

      removeLine: (id) => set({ lines: get().lines.filter((line) => line.id !== id) }),

      clearCart: () => set({ lines: [] }),

      toggleFavorite: (productId) => {
        const favorites = get().favorites;
        set({
          favorites: favorites.includes(productId)
            ? favorites.filter((id) => id !== productId)
            : [productId, ...favorites],
        });
      },

      addRecent: (term) => {
        const clean = term.trim();
        if (!clean) return;
        set({ recent: [clean, ...get().recent.filter((item) => item !== clean)].slice(0, 6) });
      },

      clearRecent: () => set({ recent: [] }),

      completeOrder: (order) => set({ lastOrder: order, lines: [] }),
    }),
    {
      name: 'rimas-shop-v2',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        lines: state.lines,
        favorites: state.favorites,
        recent: state.recent,
        lastOrder: state.lastOrder,
      }),
    }
  )
);

export type ResolvedLine = CartLine & {
  product: Product;
  pack: ProductPack | null;
  /** Pieces included in one cart unit (pack size, or 1 for a single piece). */
  piecesPerUnit: number;
  /** Pieces included in the whole line. */
  pieceCount: number;
  /** Net price of one cart unit. */
  unitNet: number;
  lineNet: number;
  vatRate: number;
  lineVat: number;
  /** "6'lı seri" or "Tek parça" */
  title: string;
  /** "S ×2 · M ×2 · L ×2" or "M beden" */
  detail: string;
};

export function resolveLine(line: CartLine): ResolvedLine | null {
  const product = PRODUCTS.find((item) => item.id === line.productId);
  if (!product) return null;

  const pack = line.packId
    ? product.packs.find((entry) => entry.id === line.packId) ?? null
    : null;

  const soldOut = soldOutSizesFor(product.id, product.soldOutSizes);

  // A retired pack, or a pack that can no longer ship, is dropped from totals
  // instead of silently selling something the warehouse cannot fulfil.
  if (line.packId && (!pack || !packAvailable(product, pack, soldOut))) return null;

  // Same rule for single pieces: a size the warehouse marked sold out leaves
  // the cart instead of reaching checkout.
  if (!line.packId && line.size && soldOut.includes(line.size)) return null;

  const piecesPerUnit = pack ? packPieces(pack) : 1;
  const unitNet = pack ? packNetPrice(product, pack) : product.unitPrice;
  const lineNet = roundMoney(unitNet * line.qty);
  const vatRate = product.vatRate ?? VAT_RATE;

  return {
    ...line,
    product,
    pack,
    piecesPerUnit,
    pieceCount: piecesPerUnit * line.qty,
    unitNet,
    lineNet,
    vatRate,
    lineVat: roundMoney(lineNet * vatRate),
    title: pack ? packLabel(pack) : 'Tek parça',
    detail: pack ? packDistribution(pack) : sizeLabel(line.size),
  };
}

export function resolveLines(lines: CartLine[]): ResolvedLine[] {
  return lines
    .map(resolveLine)
    .filter((line): line is ResolvedLine => line !== null);
}

export function useCartLines(): ResolvedLine[] {
  const lines = useShop((state) => state.lines);
  // Availability feeds the totals, so recompute when the snapshot changes.
  useStock((state) => state.soldOut);
  return resolveLines(lines);
}

/** Number of physical pieces in the cart, not the number of packs. */
export function useCartCount(): number {
  useStock((state) => state.soldOut);
  return resolveLines(useShop((state) => state.lines)).reduce(
    (total, line) => total + line.pieceCount,
    0
  );
}

/** Net (VAT-excluded) subtotal — the base for the free-shipping threshold. */
export function useCartSubtotal(): number {
  useStock((state) => state.soldOut);
  return resolveLines(useShop((state) => state.lines)).reduce(
    (total, line) => total + line.lineNet,
    0
  );
}

export function useCartTotals(shipping: ShippingMethod = 'standart'): Totals {
  const lines = useCartLines();
  return calculateTotals(
    lines.map((line) => ({ net: line.lineNet, vatRate: line.vatRate })),
    shipping
  );
}

export function useFavorites(): Product[] {
  const favorites = useShop((state) => state.favorites);
  return favorites
    .map((id) => PRODUCTS.find((product) => product.id === id))
    .filter((product): product is Product => Boolean(product));
}
