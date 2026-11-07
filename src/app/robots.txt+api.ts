import { siteOrigin } from '@/lib/seo';

/** Crawl rules: storefront pages are public, account and checkout flows are not. */
export function GET(request: Request) {
  const origin = siteOrigin(request);

  const lines = [
    'User-agent: *',
    'Allow: /',
    'Disallow: /api/',
    'Disallow: /cart',
    'Disallow: /checkout',
    'Disallow: /orders',
    'Disallow: /order/',
    'Disallow: /sign-in',
    'Disallow: /account',
    'Disallow: /favorites',
    'Disallow: /search',
    ...(origin ? ['', `Sitemap: ${origin}/sitemap.xml`] : []),
    '',
  ];

  return new Response(lines.join('\n'), {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  });
}
