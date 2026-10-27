import { currentUser } from '@/server/auth';
import { fail, ok } from '@/server/http';
import { findOrder } from '@/server/orders';

export function GET(request: Request, { number }: Record<string, string>) {
  const user = currentUser(request);
  if (!user) return fail(401, 'UNAUTHORIZED', 'Siparişi görmek için giriş yapın.');

  const order = findOrder(number, user.id);
  if (!order) return fail(404, 'NOT_FOUND', 'Sipariş bulunamadı.');

  return ok({ order });
}
