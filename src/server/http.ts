/** Small helpers shared by the API routes: JSON responses, parsing, throttling. */

export type ApiErrorCode =
  | 'VALIDATION'
  | 'EMAIL_TAKEN'
  | 'INVALID_CREDENTIALS'
  | 'UNAUTHORIZED'
  | 'NOT_FOUND'
  | 'TOO_MANY_REQUESTS'
  | 'OUT_OF_STOCK'
  | 'SERVER_ERROR';

export function fail(status: number, code: ApiErrorCode, message: string) {
  return Response.json({ error: { code, message } }, { status });
}

export function ok<T>(data: T, init?: ResponseInit) {
  return Response.json(data, init);
}

export async function readJson<T>(request: Request): Promise<T | null> {
  try {
    const parsed = await request.json();
    if (!parsed || typeof parsed !== 'object') return null;
    return parsed as T;
  } catch {
    return null;
  }
}

export function text(value: unknown, max = 200): string {
  if (typeof value !== 'string') return '';
  return value.trim().slice(0, max);
}

const buckets = new Map<string, { count: number; resetAt: number }>();

/**
 * Fixed-window throttle. Enough for a single-process demo server; a shared
 * store (Redis) would replace this when the API runs on more than one node.
 */
export function throttled(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const bucket = buckets.get(key);

  if (!bucket || bucket.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return false;
  }

  bucket.count += 1;
  if (bucket.count > limit) return true;

  // Keep the map from growing without bound on a long-running server.
  if (buckets.size > 5000) {
    for (const [entryKey, entry] of buckets) {
      if (entry.resetAt <= now) buckets.delete(entryKey);
    }
  }
  return false;
}

export function clientKey(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0].trim();
  return request.headers.get('x-real-ip') ?? 'local';
}

export const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function normalizeEmail(value: unknown): string {
  return text(value, 160).toLowerCase();
}
