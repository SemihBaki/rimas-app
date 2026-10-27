import { appendFileSync } from 'node:fs';
import { join } from 'node:path';

/** Temporary: records what the device reports so the safe-area maths can be
 * calibrated against the real iPhone instead of guesses. Removed after tuning. */
export async function POST(request: Request) {
  const body = await request.text();
  appendFileSync(
    join(process.cwd(), '.data', 'diag.log'),
    `${new Date().toISOString()} ${body}\n`
  );
  return Response.json({ ok: true });
}
