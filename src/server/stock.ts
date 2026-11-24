import { PRODUCTS, type StockLevels } from '@/data/catalog';

import { db, nowIso } from './db';

/**
 * Stock comes from Nebim; it is the source of truth.
 *
 * A provider reads on-hand quantities per model + colour + size and writes a
 * snapshot into SQLite (`stock_levels`). The client and the order API only
 * ever read that snapshot, so Nebim being slow or down never stops the shop,
 * and swapping the mock provider for the real Nebim endpoint touches nothing
 * else. Orders take their pieces out of the snapshot right away, so the same
 * pieces cannot be sold twice before the next sync overwrites it.
 */

export type StockSource = 'catalog' | 'mock' | 'nebim';

/** One Nebim stock line: model (ItemCode) + colour (ColorCode) + size (ItemDim1Code). */
export type StockRow = {
  itemCode: string;
  colorCode: string;
  size: string;
  /** Pieces on hand. */
  qty: number;
};

/** productId -> colour code -> size -> pieces on hand. */
export type StockMap = Record<string, Record<string, Record<string, number>>>;

export type StockSnapshot = {
  source: StockSource;
  updatedAt: string;
  levels: StockMap;
};

export type StockProvider = {
  name: Exclude<StockSource, 'catalog'>;
  load: () => Promise<StockRow[]>;
};

/* ------------------------------ demo stock ------------------------------- */

/** Pieces per size per colour in the demo, unless overridden below. */
const DEMO_PIECES = 40;

/**
 * Demo exceptions, so every state shows up on screen:
 * a colour whose series is sold out, a colour with only a few series left and
 * a sold-out size outside the series.
 */
const DEMO_OVERRIDES: StockRow[] = [
  // 9990 Trençkot: Siyah L bitti → Siyah seri kapalı, Kum ve Zeytin açık.
  { itemCode: '9990', colorCode: '001', size: 'L', qty: 0 },
  { itemCode: '9990', colorCode: '010', size: 'XS', qty: 0 },
  // 9992 Saten elbise: Siyah L bitti; Gümüş L'den 2 adet → 2 seri kaldı.
  { itemCode: '9992', colorCode: '001', size: 'L', qty: 0 },
  { itemCode: '9992', colorCode: '040', size: 'L', qty: 2 },
  // 9994 Jean: 24 beden yok (seride de yok).
  { itemCode: '9994', colorCode: '031', size: '24', qty: 0 },
  { itemCode: '9994', colorCode: '032', size: '24', qty: 0 },
  // 9995 Çanta: Siyah tükendi.
  { itemCode: '9995', colorCode: '001', size: 'Tek Beden', qty: 0 },
];

function demoRows(): StockRow[] {
  const key = (row: Omit<StockRow, 'qty'>) => `${row.itemCode}|${row.colorCode}|${row.size}`;
  const overrides = new Map(DEMO_OVERRIDES.map((row) => [key(row), row.qty]));

  return PRODUCTS.flatMap((product) =>
    product.colors.flatMap((color) =>
      product.sizes.map((size) => {
        const row = { itemCode: product.code, colorCode: color.code, size };
        return { ...row, qty: overrides.get(key(row)) ?? DEMO_PIECES };
      })
    )
  );
}

/* ------------------------------- providers ------------------------------- */

/** Demo provider used until Nebim is connected (`NEBIM_MODE=mock`). */
export const mockProvider: StockProvider = {
  name: 'mock',
  async load() {
    return demoRows();
  },
};

/**
 * Nebim provider placeholder.
 *
 * What this needs to return is fixed: one `StockRow` per model + colour +
 * size with the pieces on hand. Waiting on the company for the endpoint,
 * auth method, IP allow-list and rate limits; until then it refuses to run
 * instead of inventing a contract.
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

    // TODO(nebim): call the stock endpoint and map each line to
    // { itemCode, colorCode, size, qty } (ItemCode, ColorCode, ItemDim1Code, on-hand qty).
    throw new Error(
      'Nebim canlı sağlayıcısı henüz bağlanmadı. Stok uç noktası bilgisi bekleniyor.'
    );
  },
};

export function activeProvider(): StockProvider {
  return process.env.NEBIM_MODE?.trim().toLowerCase() === 'live'
    ? nebimProvider
    : mockProvider;
}

/* ------------------------------- snapshot -------------------------------- */

/** The stock table starts with the demo stock until the first sync. */
export function ensureStockSeeded(): void {
  const row = db()
    .prepare('SELECT COUNT(*) AS total FROM stock_levels')
    .get() as { total: number };
  if (row.total > 0) return;
  writeStock(demoRows(), 'catalog');
}

/**
 * Replace the snapshot. Lines for models or colours the app does not sell
 * are skipped; Nebim carries far more than the online catalogue.
 */
function writeStock(rows: StockRow[], source: StockSource): void {
  const productByCode = new Map(PRODUCTS.map((product) => [product.code, product]));
  const database = db();
  const stamp = nowIso();
  const insert = database.prepare(
    `INSERT OR REPLACE INTO stock_levels (product_id, color_code, size, qty, updated_at)
     VALUES (?, ?, ?, ?, ?)`
  );
  const meta = database.prepare('INSERT OR REPLACE INTO stock_meta (key, value) VALUES (?, ?)');

  database.exec('BEGIN');
  try {
    database.exec('DELETE FROM stock_levels');
    for (const row of rows) {
      const product = productByCode.get(row.itemCode);
      if (!product || !product.colors.some((color) => color.code === row.colorCode)) continue;
      insert.run(product.id, row.colorCode, row.size, Math.max(0, Math.floor(row.qty)), stamp);
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
    .prepare('SELECT product_id, color_code, size, qty FROM stock_levels')
    .all() as { product_id: string; color_code: string; size: string; qty: number }[];

  const levels: StockMap = {};
  for (const row of rows) {
    ((levels[row.product_id] ??= {})[row.color_code] ??= {})[row.size] = row.qty;
  }

  const metaRows = db().prepare('SELECT key, value FROM stock_meta').all() as {
    key: string;
    value: string;
  }[];
  const meta = Object.fromEntries(metaRows.map((entry) => [entry.key, entry.value]));

  return {
    source: (meta.source as StockSource | undefined) ?? 'catalog',
    updatedAt: meta.updatedAt ?? nowIso(),
    levels,
  };
}

/** Pull a fresh snapshot from the active provider and store it. */
export async function syncStock(): Promise<StockSnapshot> {
  const provider = activeProvider();
  const rows = await provider.load();
  writeStock(rows, provider.name);
  return readStock();
}

/**
 * Stock of one product colour. A colour missing from the snapshot has
 * nothing on hand: the server never guesses availability.
 */
export function stockLevelsFor(
  snapshot: StockSnapshot,
  productId: string,
  colorCode: string
): NonNullable<StockLevels> {
  return snapshot.levels[productId]?.[colorCode] ?? {};
}

/** Pieces one order needs, keyed by `productId|colorCode|size`. */
export type StockDemand = Map<string, number>;

export function demandKey(productId: string, colorCode: string, size: string): string {
  return `${productId}|${colorCode}|${size}`;
}

/**
 * Take an order's pieces out of the snapshot. Must run inside the order's
 * write transaction; throws when any line is short, so the caller rolls back.
 */
export function takeStock(demand: StockDemand): void {
  const update = db().prepare(
    `UPDATE stock_levels SET qty = qty - ?, updated_at = ?
     WHERE product_id = ? AND color_code = ? AND size = ? AND qty >= ?`
  );
  const stamp = nowIso();
  for (const [key, pieces] of demand) {
    const [productId, colorCode, size] = key.split('|');
    const result = update.run(pieces, stamp, productId, colorCode, size, pieces);
    if (Number(result.changes) !== 1) throw new Error('OUT_OF_STOCK');
  }
}
