import { createSession, findUserByEmail, sessionCookie, toApiUser, verifyPassword } from '@/server/auth';
import { clientKey, fail, normalizeEmail, ok, readJson, throttled } from '@/server/http';

type Body = { email?: unknown; password?: unknown };

export async function POST(request: Request) {
  if (throttled(`login:${clientKey(request)}`, 12, 10 * 60 * 1000)) {
    return fail(429, 'TOO_MANY_REQUESTS', 'Çok fazla deneme yapıldı. Biraz sonra tekrar deneyin.');
  }

  const body = await readJson<Body>(request);
  if (!body) return fail(400, 'VALIDATION', 'İstek gövdesi okunamadı.');

  const email = normalizeEmail(body.email);
  const password = typeof body.password === 'string' ? body.password : '';
  if (!email || !password) {
    return fail(400, 'VALIDATION', 'E-posta ve şifre gerekli.');
  }

  const user = findUserByEmail(email);
  // Same message for both cases so the endpoint does not reveal which emails exist.
  if (!user || !verifyPassword(password, user.password_hash)) {
    return fail(401, 'INVALID_CREDENTIALS', 'E-posta veya şifre hatalı.');
  }

  const token = createSession(user.id);
  return ok(
    { user: toApiUser(user), token },
    { headers: { 'Set-Cookie': sessionCookie(token, request) } }
  );
}
