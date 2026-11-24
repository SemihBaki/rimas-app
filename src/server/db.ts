import { mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { DatabaseSync } from 'node:sqlite';

/**
 * Server-side persistence for accounts, sessions, orders and favorites.
 *
 * SQLite keeps the demo self-contained: no external service, no credentials.
 * The schema is intentionally plain SQL so it can be moved to Postgres later
 * without touching the route handlers.
 */

let handle: DatabaseSync | null = null;

const SCHEMA = `
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  phone TEXT,
  password_hash TEXT NOT NULL,
  marketing_opt_in INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS sessions (
  token_hash TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TEXT NOT NULL,
  expires_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS sessions_user ON sessions (user_id);

CREATE TABLE IF NOT EXISTS orders (
  number TEXT PRIMARY KEY,
  user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
  email TEXT NOT NULL,
  name TEXT NOT NULL,
  phone TEXT,
  address TEXT,
  city TEXT,
  district TEXT,
  postal_code TEXT,
  shipping TEXT NOT NULL,
  subtotal REAL NOT NULL,
  vat_total REAL NOT NULL DEFAULT 0,
  shipping_cost REAL NOT NULL,
  total REAL NOT NULL,
  item_count INTEGER NOT NULL,
  delivery TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'hazirlaniyor',
  created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS orders_user ON orders (user_id, created_at DESC);

CREATE TABLE IF NOT EXISTS order_items (
  order_number TEXT NOT NULL REFERENCES orders(number) ON DELETE CASCADE,
  product_id TEXT NOT NULL,
  name TEXT NOT NULL,
  size TEXT NOT NULL DEFAULT '',
  color TEXT NOT NULL,
  qty INTEGER NOT NULL,
  price REAL NOT NULL,
  pack_id TEXT,
  pack_label TEXT,
  pack_pieces INTEGER NOT NULL DEFAULT 1,
  unit_price REAL NOT NULL DEFAULT 0,
  vat_rate REAL NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS favorites (
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  product_id TEXT NOT NULL,
  created_at TEXT NOT NULL,
  PRIMARY KEY (user_id, product_id)
);

CREATE TABLE IF NOT EXISTS stock_availability (
  product_id TEXT NOT NULL,
  size TEXT NOT NULL,
  available INTEGER NOT NULL DEFAULT 1,
  updated_at TEXT NOT NULL,
  PRIMARY KEY (product_id, size)
);

CREATE TABLE IF NOT EXISTS stock_meta (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
);
`;

function databasePath() {
  const configured = process.env.RIMAS_DB_PATH?.trim();
  if (configured) return configured;
  return join(process.cwd(), '.data', 'rimas.db');
}

/**
 * Databases created before the wholesale model keep their data; missing
 * columns are added in place instead of dropping tables.
 */
function addColumnIfMissing(
  instance: DatabaseSync,
  table: string,
  column: string,
  definition: string
) {
  const columns = instance.prepare(`PRAGMA table_info(${table})`).all() as { name: string }[];
  if (columns.some((entry) => entry.name === column)) return;
  instance.exec(`ALTER TABLE ${table} ADD COLUMN ${column} ${definition}`);
}

function migrate(instance: DatabaseSync) {
  addColumnIfMissing(instance, 'orders', 'vat_total', 'REAL NOT NULL DEFAULT 0');
  addColumnIfMissing(instance, 'orders', 'status', "TEXT NOT NULL DEFAULT 'hazirlaniyor'");
  addColumnIfMissing(instance, 'order_items', 'pack_id', 'TEXT');
  addColumnIfMissing(instance, 'order_items', 'pack_label', 'TEXT');
  addColumnIfMissing(instance, 'order_items', 'pack_pieces', 'INTEGER NOT NULL DEFAULT 1');
  addColumnIfMissing(instance, 'order_items', 'unit_price', 'REAL NOT NULL DEFAULT 0');
  addColumnIfMissing(instance, 'order_items', 'vat_rate', 'REAL NOT NULL DEFAULT 0');
}

export function db(): DatabaseSync {
  if (handle) return handle;

  const file = databasePath();
  if (file !== ':memory:') {
    mkdirSync(dirname(file), { recursive: true });
  }

  const instance = new DatabaseSync(file);
  instance.exec('PRAGMA busy_timeout = 3000');
  // Each API route gets its own module instance, so several connections can
  // open at once; WAL is set once and stays on the file, hence the guard.
  try {
    instance.exec('PRAGMA journal_mode = WAL');
  } catch {
    // Another connection may be switching the journal mode right now.
  }
  instance.exec('PRAGMA foreign_keys = ON');
  instance.exec(SCHEMA);
  migrate(instance);
  handle = instance;
  return instance;
}

export function nowIso() {
  return new Date().toISOString();
}

export function addDays(days: number) {
  return new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString();
}

/** Short, readable, collision-checked order number: RM-8F3K-2041. */
export function newOrderNumber(): string {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const pick = () =>
    Array.from({ length: 4 }, () => alphabet[Math.floor(Math.random() * alphabet.length)]).join('');

  for (let attempt = 0; attempt < 20; attempt += 1) {
    const stamp = new Date();
    const suffix = `${String(stamp.getFullYear()).slice(2)}${String(stamp.getMonth() + 1).padStart(2, '0')}`;
    const candidate = `RM-${pick()}-${suffix}`;
    const existing = db()
      .prepare('SELECT 1 AS present FROM orders WHERE number = ?')
      .get(candidate) as { present: number } | undefined;
    if (!existing) return candidate;
  }

  return `RM-${Date.now().toString(36).toUpperCase()}`;
}
