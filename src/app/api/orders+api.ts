import { currentUser } from '@/server/auth';
import { EMAIL_PATTERN, fail, normalizeEmail, ok, readJson, text } from '@/server/http';
import { OrderError, createOrder, listOrders, type OrderInput } from '@/server/orders';

type Body = {
  email?: unknown;
  name?: unknown;
  phone?: unknown;
  address?: unknown;
  city?: unknown;
  district?: unknown;
  postalCode?: unknown;
  shipping?: unknown;
  items?: unknown;
};

export function GET(request: Request) {
  const user = currentUser(request);
  if (!user) return fail(401, 'UNAUTHORIZED', 'Siparişleri görmek için giriş yapın.');
  return ok({ orders: listOrders(user.id) });
}

export async function POST(request: Request) {
  const body = await readJson<Body>(request);
  if (!body) return fail(400, 'VALIDATION', 'İstek gövdesi okunamadı.');

  const email = normalizeEmail(body.email);
  const name = text(body.name, 80);
  const phone = text(body.phone, 30);
  const address = text(body.address, 300);
  const city = text(body.city, 60);
  const district = text(body.district, 60);

  if (!EMAIL_PATTERN.test(email)) {
    return fail(400, 'VALIDATION', 'Geçerli bir e-posta adresi girin.');
  }
  if (name.length < 3) return fail(400, 'VALIDATION', 'Ad ve soyadınızı girin.');
  if (phone.replace(/\D/g, '').length < 10) {
    return fail(400, 'VALIDATION', 'Geçerli bir telefon numarası girin.');
  }
  if (address.length < 8) return fail(400, 'VALIDATION', 'Teslimat adresinizi girin.');
  if (!city || !district) return fail(400, 'VALIDATION', 'İl ve ilçe bilgisini girin.');

  const input: OrderInput = {
    email,
    name,
    phone,
    address,
    city,
    district,
    postalCode: text(body.postalCode, 10),
    shipping: body.shipping === 'express' ? 'express' : 'standart',
    items: body.items,
  };

  const user = currentUser(request);

  try {
    const order = createOrder(input, user?.id ?? null);
    return ok({ order }, { status: 201 });
  } catch (error) {
    if (error instanceof OrderError && error.code === 'OUT_OF_STOCK') {
      return fail(409, 'OUT_OF_STOCK', error.message);
    }
    return fail(400, 'VALIDATION', 'Sepet bilgileri geçersiz.');
  }
}
