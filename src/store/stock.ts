import { create } from 'zustand';

import { api } from '@/lib/api';

/**
 * Client-side stock overlay.
 *
 * The catalogue still ships with demo availability so the app works offline.
 * When the stock API answers, its snapshot replaces that demo data for every
 * product it mentions. Screens subscribe to this store, so a warehouse update
 * closes packs and sizes without a redeploy.
 */

export type StockSource = 'catalog' | 'mock' | 'nebim';

type StockSnapshot = {
  source: StockSource;
  updatedAt: string;
  /** productId -> sizes that cannot ship. */
  soldOut: Record<string, string[]>;
};

type StockState = StockSnapshot & {
  loaded: boolean;
  loading: boolean;
  refresh: () => Promise<void>;
};

const EMPTY: string[] = [];

export const useStock = create<StockState>()((set, get) => ({
  source: 'catalog',
  updatedAt: '',
  soldOut: {},
  loaded: false,
  loading: false,

  async refresh() {
    if (get().loading) return;
    set({ loading: true });
    try {
      const snapshot = await api<StockSnapshot>('/api/stock', { timeoutMs: 8000 });
      set({
        source: snapshot.source ?? 'catalog',
        updatedAt: snapshot.updatedAt ?? '',
        soldOut: snapshot.soldOut ?? {},
        loaded: true,
        loading: false,
      });
    } catch {
      // Keep the catalogue's demo availability when the API is unreachable.
      set({ loading: false });
    }
  },
}));

/** Sold-out sizes for one product, falling back to the catalogue defaults. */
export function soldOutSizesFor(productId: string, fallback: string[] = EMPTY): string[] {
  const state = useStock.getState();
  if (!state.loaded) return fallback;
  return state.soldOut[productId] ?? EMPTY;
}

/** Reactive variant: re-renders the caller when availability changes. */
export function useSoldOutSizes(productId: string, fallback: string[] = EMPTY): string[] {
  return useStock((state) =>
    state.loaded ? state.soldOut[productId] ?? EMPTY : fallback
  );
}
