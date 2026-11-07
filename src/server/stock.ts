import { PRODUCTS } from '@/data/catalog';

import { db, nowIso } from './db';

/**
 * Stock availability is the first piece of the Nebim integration.
 *
 * The warehouse stays the source of truth: a provider reads availability and
 * writes a snapshot into SQLite. The client and the order API only ever read
 * the snapshot, so swapping the mock provider for the real Nebim endpoint
 * later does not touch any screen or business rule.
 */

export type StockSource = 'catalog' | 'mock' | 'nebim';

export type StockRow = {
  productId: string;
  size: string;
  available: boolean;
};

export type StockSnapshot = {
  source: StockSource;
  updatedAt: string;
  /** productId -> sizes that cannot ship. Empty when everything is in stock. */
  soldOut: Record<string, string[]>;
};

export type StockProvider = {
  name: Exclude<StockSource, 'catalog'>;
  load: () => Promise<StockRow[]>;
};

/** Demo provider: mirrors the sold-out sizes written in the catalogue. */
export const mockProvider: StockProvider = {
  name: 'mock',
  async load() {
    return catalogRows();
  },
};

/**
 * Nebim provider placeholder.
 *
 * Waiting on the company for: endpoint + auth method, IP allow-list, rate
 * limits and how lot distributions are returned. Until those arrive this
 * provider refuses to run instead of inventing a contract.
 */
export const nebimProvider: StockProvider = {
  name: 'nebim',
  async load() {
    const baseUrl = process.env.NEBIM_BASE_URL?.trim();
    const apiKey = process.env.NEBIM_API_KEY?.trim();
    const companyCode = process.env.NEBIM_COMPANY_CODE?.trim();

    if (!baseUrl || !apiKey || !companyCode) {
      throw new Error(
        'Nebim bağlantısı yapılandırılmadı: NEBIM_BASE_URL, NEBIM_API_KEY ve NEBIM_COMPANY_CODE gerekli.'
      );
    }

    // TODO(nebim): map the stock endpoint response to StockRow[].
    // Needed before this can work: lot/barcode semantics, size mapping and the
    // company's stock query. See README › Stok ve Nebim.
    throw new Error(
      'Nebim canlı sağlayıcısı henüz bağlanmadı. Stok uç noktası ve lot dağılımı bilgisi bekleniyor.'
    );
  },
};

export function activeProvider(): StockProvider {
  return process.env.NEBIM_MODE?.trim().toLowerCase() === 'live'
    ? nebimProvider
    : mockProvider;
}

function catalogRows(): StockRow[] {
  return PRODUCTS.flatMap((product) =>
    product.sizes.map((size) => ({
      productId: product.id,
      size,
      available: !product.soldOutSizes?.includes(size),
    }))
  );
}

/** The stock table starts as a copy of the catalogue's demo availability. */
export function ensureStockSeeded(): void {
  const row = db()
    .prepare('SELECT COUNT(*) AS total FROM stock_availability')
    .get() as { total: number };
  if (row.total > 0) return;
  writeStock(catalogRows(), 'catalog');
}

function writeStock(rows: StockRow[], source: StockSource): void {
  const database = db();
  const stamp = nowIso();
  const insert = database.prepare(
    `INSERT OR REPLACE INTO stock_availability (product_id, size, available, updated_at)
     VALUES (?, ?, ?, ?)`
  );
  const meta = database.prepare('INSERT OR REPLACE INTO stock_meta (key, value) VALUES (?, ?)');

  database.exec('BEGIN');
  try {
    database.exec('DELETE FROM stock_availability');
    for (const row of rows) {
      insert.run(row.productId, row.size, row.available ? 1 : 0, stamp);
    }
    meta.run('source', source);
    meta.run('updatedAt', stamp);
    database.exec('COMMIT');
  } catch (error) {
    database.exec('ROLLBACK');
    throw error;
  }
}

export function readStock(): StockSnapshot {
  ensureStockSeeded();

  const rows = db()
    .prepare('SELECT product_id, size, available FROM stock_availability')
    .all() as { product_id: string; size: string; available: number }[];

  const soldOut: Record<string, string[]> = {};
  for (const row of rows) {
    if (row.available) continue;
    (soldOut[row.product_id] ??= []).push(row.size);
  }

  const metaRows = db().prepare('SELECT key, value FROM stock_meta').all() as {
    key: string;
    value: string;
  }[];
  const meta = Object.fromEntries(metaRows.map((entry) => [entry.key, entry.value]));

  return {
    source: (meta.source as StockSource | undefined) ?? 'catalog',
    updatedAt: meta.updatedAt ?? nowIso(),
    soldOut,
  };
}

/** Pull a fresh snapshot from the active provider and store it. */
export async function syncStock(): Promise<StockSnapshot> {
  const provider = activeProvider();
  const rows = await provider.load();
  writeStock(rows, provider.name);
  return readStock();
}

/** Manual override, used by the future admin screen. */
export function setStockAvailability(
  productId: string,
  size: string,
  available: boolean
): boolean {
  const product = PRODUCTS.find((item) => item.id === productId);
  if (!product || !product.sizes.includes(size)) return false;

  ensureStockSeeded();
  db()
    .prepare(
      `INSERT OR REPLACE INTO stock_availability (product_id, size, available, updated_at)
       VALUES (?, ?, ?, ?)`
    )
    .run(productId, size, available ? 1 : 0, nowIso());
  return true;
}

/** Sold-out sizes for one product, falling back to the catalogue definition. */
export function soldOutSizesFor(productId: string, fallback?: string[]): string[] {
  const snapshot = readStock();
  return snapshot.soldOut[productId] ?? fallback ?? [];
}
