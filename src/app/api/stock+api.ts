import { fail, ok } from '@/server/http';
import { readStock, syncStock } from '@/server/stock';

/** Public availability snapshot: productId -> sold-out sizes. */
export function GET() {
  try {
    return ok(readStock(), {
      headers: { 'Cache-Control': 'no-store' },
    });
  } catch {
    return fail(500, 'SERVER_ERROR', 'Stok bilgisi okunamadı.');
  }
}

/**
 * Refresh the snapshot from the active provider (mock or Nebim).
 * `STOCK_SYNC_TOKEN` is required in production; development may call it as-is.
 */
export async function POST(request: Request) {
  const token = process.env.STOCK_SYNC_TOKEN?.trim() ?? '';
  const provided = request.headers.get('x-stock-token')?.trim() ?? '';
  const isProduction = process.env.NODE_ENV === 'production';

  if ((isProduction && !token) || (token && provided !== token)) {
    return fail(401, 'UNAUTHORIZED', 'Stok senkronizasyonu için yetki gerekli.');
  }

  try {
    return ok(await syncStock());
  } catch (error) {
    const message =
      !isProduction && error instanceof Error
        ? error.message
        : 'Stok senkronizasyonu başarısız oldu.';
    return fail(503, 'SERVER_ERROR', message);
  }
}
