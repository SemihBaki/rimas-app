import { clearedCookie, destroySession, tokenFromRequest } from '@/server/auth';
import { ok } from '@/server/http';

export function POST(request: Request) {
  const token = tokenFromRequest(request);
  if (token) destroySession(token);

  return ok({ ok: true }, { headers: { 'Set-Cookie': clearedCookie(request) } });
}
