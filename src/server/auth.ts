import { createHash, randomBytes, randomUUID, scryptSync, timingSafeEqual } from 'node:crypto';

import { addDays, db, nowIso } from './db';

export type ApiUser = {
  id: string;
  email: string;
  name: string;
  phone: string | null;
  marketingOptIn: boolean;
  createdAt: string;
};

type UserRow = {
  id: string;
  email: string;
  name: string;
  phone: string | null;
  password_hash: string;
  marketing_opt_in: number;
  created_at: string;
};

export const SESSION_COOKIE = 'rimas_session';
export const SESSION_DAYS = 30;

/** Password hashing: scrypt with a per-user salt, compared in constant time. */
export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString('hex');
  const derived = scryptSync(password, salt, 64).toString('hex');
  return `scrypt$${salt}$${derived}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  const [scheme, salt, expected] = stored.split('$');
  if (scheme !== 'scrypt' || !salt || !expected) return false;

  const derived = scryptSync(password, salt, 64);
  const expectedBuffer = Buffer.from(expected, 'hex');
  if (expectedBuffer.length !== derived.length) return false;
  return timingSafeEqual(derived, expectedBuffer);
}

export function toApiUser(row: UserRow): ApiUser {
  return {
    id: row.id,
    email: row.email,
    name: row.name,
    phone: row.phone,
    marketingOptIn: row.marketing_opt_in === 1,
    createdAt: row.created_at,
  };
}

export function findUserByEmail(email: string): UserRow | undefined {
  return db().prepare('SELECT * FROM users WHERE email = ?').get(email) as UserRow | undefined;
}

export function findUserById(id: string): UserRow | undefined {
  return db().prepare('SELECT * FROM users WHERE id = ?').get(id) as UserRow | undefined;
}

export function createUser(input: { email: string; name: string; password: string }): UserRow {
  const row: UserRow = {
    id: randomUUID(),
    email: input.email,
    name: input.name,
    phone: null,
    password_hash: hashPassword(input.password),
    marketing_opt_in: 1,
    created_at: nowIso(),
  };

  db()
    .prepare(
      `INSERT INTO users (id, email, name, phone, password_hash, marketing_opt_in, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)`
    )
    .run(
      row.id,
      row.email,
      row.name,
      row.phone,
      row.password_hash,
      row.marketing_opt_in,
      row.created_at
    );

  return row;
}

/**
 * Sessions are stored as a SHA-256 hash of the token, so a database leak does
 * not hand out live sessions.
 */
function hashToken(token: string) {
  return createHash('sha256').update(token).digest('hex');
}

export function createSession(userId: string): string {
  const token = randomBytes(32).toString('base64url');
  db()
    .prepare('INSERT INTO sessions (token_hash, user_id, created_at, expires_at) VALUES (?, ?, ?, ?)')
    .run(hashToken(token), userId, nowIso(), addDays(SESSION_DAYS));
  return token;
}

export function destroySession(token: string) {
  db().prepare('DELETE FROM sessions WHERE token_hash = ?').run(hashToken(token));
}

export function tokenFromRequest(request: Request): string | null {
  const header = request.headers.get('authorization');
  if (header?.toLowerCase().startsWith('bearer ')) {
    const token = header.slice(7).trim();
    if (token) return token;
  }

  const cookie = request.headers.get('cookie');
  if (!cookie) return null;
  for (const part of cookie.split(';')) {
    const [name, ...rest] = part.trim().split('=');
    if (name === SESSION_COOKIE) return decodeURIComponent(rest.join('='));
  }
  return null;
}

export function currentUser(request: Request): ApiUser | null {
  const token = tokenFromRequest(request);
  if (!token) return null;

  const row = db()
    .prepare(
      `SELECT users.* , sessions.expires_at AS session_expires
       FROM sessions JOIN users ON users.id = sessions.user_id
       WHERE sessions.token_hash = ?`
    )
    .get(hashToken(token)) as (UserRow & { session_expires: string }) | undefined;

  if (!row) return null;

  if (new Date(row.session_expires).getTime() <= Date.now()) {
    destroySession(token);
    return null;
  }

  return toApiUser(row);
}

function isSecure(request: Request) {
  if (new URL(request.url).protocol === 'https:') return true;
  return request.headers.get('x-forwarded-proto') === 'https';
}

export function sessionCookie(token: string, request: Request): string {
  const parts = [
    `${SESSION_COOKIE}=${encodeURIComponent(token)}`,
    'Path=/',
    'HttpOnly',
    'SameSite=Lax',
    `Max-Age=${SESSION_DAYS * 24 * 60 * 60}`,
  ];
  if (isSecure(request)) parts.push('Secure');
  return parts.join('; ');
}

export function clearedCookie(request: Request): string {
  const parts = [`${SESSION_COOKIE}=`, 'Path=/', 'HttpOnly', 'SameSite=Lax', 'Max-Age=0'];
  if (isSecure(request)) parts.push('Secure');
  return parts.join('; ');
}
