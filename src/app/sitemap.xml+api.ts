import { CATEGORIES, PRODUCTS } from '@/data/catalog';
import { siteOrigin } from '@/lib/seo';

/** XML sitemap with every indexable route. Product and collection pages are static. */
export function GET(request: Request) {
  const origin = siteOrigin(request);

  const paths = [
    '/',
    '/collections',
    '/about',
    ...CATEGORIES.map((category) => `/collection/${category.id}`),
    ...PRODUCTS.map((product) => `/product/${product.id}`),
  ];

  const body = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...paths.map((path) => {
      const location = origin ? `${origin}${path}` : path;
      return `  <url><loc>${escapeXml(location)}</loc></url>`;
    }),
    '</urlset>',
    '',
  ].join('\n');

  return new Response(body, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  });
}

function escapeXml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;');
}
