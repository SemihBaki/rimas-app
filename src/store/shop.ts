import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { PRODUCTS, type Product } from '@/data/catalog';

export type CartLine = {
  id: string;
  productId: string;
  size: string;
  color: string;
  qty: number;
};

export type Order = {
  number: string;
  total: number;
  itemCount: number;
  email: string;
  delivery: string;
};

type ShopState = {
  lines: CartLine[];
  favorites: string[];
  recent: string[];
  lastOrder: Order | null;
  addToCart: (productId: string, size: string, color: string, qty?: number) => void;
  setQty: (lineId: string, qty: number) => void;
  removeLine: (lineId: string) => void;
  clearCart: () => void;
  toggleFavorite: (productId: string) => void;
  addRecent: (term: string) => void;
  clearRecent: () => void;
  completeOrder: (order: Order) => void;
};

const lineId = (productId: string, size: string, color: string) =>
  `${productId}::${size}::${color}`;

export const useShop = create<ShopState>()(
  persist(
    (set, get) => ({
      lines: [],
      favorites: [],
      recent: [],
      lastOrder: null,

      addToCart: (productId, size, color, qty = 1) => {
        const id = lineId(productId, size, color);
        const existing = get().lines.find((line) => line.id === id);
        if (existing) {
          set({
            lines: get().lines.map((line) =>
              line.id === id ? { ...line, qty: Math.min(line.qty + qty, 10) } : line
            ),
          });
          return;
        }
        set({ lines: [...get().lines, { id, productId, size, color, qty }] });
      },

      setQty: (id, qty) => {
        if (qty <= 0) {
          set({ lines: get().lines.filter((line) => line.id !== id) });
          return;
        }
        set({
          lines: get().lines.map((line) =>
            line.id === id ? { ...line, qty: Math.min(qty, 10) } : line
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
      name: 'rimas-shop-v1',
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

export type ResolvedLine = CartLine & { product: Product; lineTotal: number };

export function useCartLines(): ResolvedLine[] {
  const lines = useShop((state) => state.lines);
  return lines
    .map((line) => {
      const product = PRODUCTS.find((item) => item.id === line.productId);
      if (!product) return null;
      return { ...line, product, lineTotal: product.price * line.qty };
    })
    .filter((line): line is ResolvedLine => line !== null);
}

export function useCartCount(): number {
  return useShop((state) => state.lines.reduce((total, line) => total + line.qty, 0));
}

export function useCartSubtotal(): number {
  return useShop((state) =>
    state.lines.reduce((total, line) => {
      const product = PRODUCTS.find((item) => item.id === line.productId);
      return total + (product ? product.price * line.qty : 0);
    }, 0)
  );
}

export function useFavorites(): Product[] {
  const favorites = useShop((state) => state.favorites);
  return favorites
    .map((id) => PRODUCTS.find((product) => product.id === id))
    .filter((product): product is Product => Boolean(product));
}

export const FREE_SHIPPING_THRESHOLD = 2000;
