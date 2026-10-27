import { createSession, createUser, findUserByEmail, sessionCookie, toApiUser } from '@/server/auth';
import {
  EMAIL_PATTERN,
  clientKey,
  fail,
  normalizeEmail,
  ok,
  readJson,
  text,
  throttled,
} from '@/server/http';

type Body = { name?: unknown; email?: unknown; password?: unknown };

export async function POST(request: Request) {
  if (throttled(`register:${clientKey(request)}`, 8, 10 * 60 * 1000)) {
    return fail(429, 'TOO_MANY_REQUESTS', 'Çok fazla deneme yapıldı. Biraz sonra tekrar deneyin.');
  }

  const body = await readJson<Body>(request);
  if (!body) return fail(400, 'VALIDATION', 'İstek gövdesi okunamadı.');

  const name = text(body.name, 80);
  const email = normalizeEmail(body.email);
  const password = typeof body.password === 'string' ? body.password : '';

  if (name.length < 2) return fail(400, 'VALIDATION', 'Adınızı girin.');
  if (!EMAIL_PATTERN.test(email)) {
    return fail(400, 'VALIDATION', 'Geçerli bir e-posta adresi girin.');
  }
  if (password.length < 8) {
    return fail(400, 'VALIDATION', 'Şifre en az 8 karakter olmalı.');
  }
  if (password.length > 200) {
    return fail(400, 'VALIDATION', 'Şifre çok uzun.');
  }
  if (findUserByEmail(email)) {
    return fail(409, 'EMAIL_TAKEN', 'Bu e-posta ile bir hesap zaten var.');
  }

  const user = createUser({ email, name, password });
  const token = createSession(user.id);

  return ok(
    { user: toApiUser(user), token },
    { headers: { 'Set-Cookie': sessionCookie(token, request) } }
  );
}
