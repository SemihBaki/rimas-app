import { create } from 'zustand';

import type { StockLevels } from '@/data/catalog';
import { api } from '@/lib/api';

/**
 * Client-side copy of the Nebim stock snapshot (`/api/stock`).
 *
 * Until the first answer arrives every lookup returns `null` ("not known"),
 * which blocks nothing; the order API checks stock again anyway. Screens
 * subscribe to this store, so a warehouse update closes colours and series
 * without a redeploy.
 */

export type StockSource = 'catalog' | 'mock' | 'nebim';

/** productId -> colour code -> size -> pieces on hand. */
type StockMap = Record<string, Record<string, Record<string, number>>>;

type StockSnapshot = {
  source: StockSource;
  updatedAt: string;
  levels: StockMap;
};

type StockState = StockSnapshot & {
  loaded: boolean;
  loading: boolean;
  refresh: () => Promise<void>;
};

const NOTHING: Readonly<Record<string, number>> = Object.freeze({});

export const useStock = create<StockState>()((set, get) => ({
  source: 'catalog',
  updatedAt: '',
  levels: {},
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
        levels: snapshot.levels ?? {},
        loaded: true,
        loading: false,
      });
    } catch {
      // Stay "not known" when the API is unreachable; checkout still validates.
      set({ loading: false });
    }
  },
}));

function pick(state: StockState, productId: string, colorCode: string): StockLevels {
  if (!state.loaded) return null;
  return state.levels[productId]?.[colorCode] ?? NOTHING;
}

/** Stock of one product colour, read once (outside React). */
export function stockLevelsFor(productId: string, colorCode: string): StockLevels {
  return pick(useStock.getState(), productId, colorCode);
}

/** Reactive variant: re-renders the caller when the snapshot changes. */
export function useStockLevels(productId: string, colorCode: string): StockLevels {
  return useStock((state) => pick(state, productId, colorCode));
}

/**
 * Reactive lookup for every colour of a product (cards, listings).
 * Returns a function so the caller can ask per colour without extra hooks.
 */
export function useStockLookup(productId: string): (colorCode: string) => StockLevels {
  const loaded = useStock((state) => state.loaded);
  const byColor = useStock((state) => state.levels[productId]);
  return (colorCode) => (loaded ? byColor?.[colorCode] ?? NOTHING : null);
}
