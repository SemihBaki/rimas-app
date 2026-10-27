import { currentUser } from '@/server/auth';
import { ok } from '@/server/http';

export function GET(request: Request) {
  return ok({ user: currentUser(request) });
}
