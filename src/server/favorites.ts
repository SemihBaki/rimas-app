import { db, nowIso } from './db';

export function listFavorites(userId: string): string[] {
  const rows = db()
    .prepare('SELECT product_id FROM favorites WHERE user_id = ? ORDER BY created_at DESC')
    .all(userId) as { product_id: string }[];
  return rows.map((row) => row.product_id);
}

/** Replaces the whole list; the client always sends its current favorites. */
export function replaceFavorites(userId: string, productIds: string[]): string[] {
  const database = db();
  const createdAt = nowIso();

  database.prepare('DELETE FROM favorites WHERE user_id = ?').run(userId);
  const insert = database.prepare(
    'INSERT OR IGNORE INTO favorites (user_id, product_id, created_at) VALUES (?, ?, ?)'
  );
  for (const productId of productIds) {
    insert.run(userId, productId, createdAt);
  }

  return listFavorites(userId);
}
