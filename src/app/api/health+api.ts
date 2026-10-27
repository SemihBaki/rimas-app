import { db } from '@/server/db';

/** Readiness probe: confirms the server runtime and the database both work. */
export function GET() {
  const row = db().prepare('SELECT COUNT(*) AS users FROM users').get() as { users: number };
  return Response.json({ ok: true, users: row.users });
}
