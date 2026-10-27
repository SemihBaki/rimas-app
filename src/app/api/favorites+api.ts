import { currentUser } from '@/server/auth';
import { fail, ok, readJson } from '@/server/http';
import { listFavorites, replaceFavorites } from '@/server/favorites';

export function GET(request: Request) {
  const user = currentUser(request);
  if (!user) return fail(401, 'UNAUTHORIZED', 'Favorileri görmek için giriş yapın.');
  return ok({ favorites: listFavorites(user.id) });
}

export async function PUT(request: Request) {
  const user = currentUser(request);
  if (!user) return fail(401, 'UNAUTHORIZED', 'Favorileri kaydetmek için giriş yapın.');

  const body = await readJson<{ favorites?: unknown }>(request);
  if (!body || !Array.isArray(body.favorites)) {
    return fail(400, 'VALIDATION', 'Favori listesi geçersiz.');
  }

  const ids = Array.from(
    new Set(
      body.favorites
        .filter((value): value is string => typeof value === 'string')
        .map((value) => value.trim().slice(0, 60))
        .filter(Boolean)
    )
  ).slice(0, 200);

  return ok({ favorites: replaceFavorites(user.id, ids) });
}
