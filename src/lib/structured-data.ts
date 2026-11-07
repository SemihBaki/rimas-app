import {
  categoryName,
  packAvailable,
  type Product,
} from '@/data/catalog';
import { VAT_RATE, roundMoney } from '@/lib/pricing';

/**
 * schema.org JSON-LD for search engines.
 *
 * Prices are advertised gross (VAT included) because that is what a shopper
 * pays at checkout; the catalogue stores them net.
 */
export function productJsonLd(
  product: Product,
  origin: string,
  soldOut: string[] = []
): string {
  const vatRate = product.vatRate ?? VAT_RATE;
  const price = roundMoney(product.unitPrice * (1 + vatRate));

  const inStock =
    product.packs.length > 0
      ? product.packs.some((pack) => packAvailable(product, pack, soldOut))
      : product.sizes.some((size) => !soldOut.includes(size));

  const data = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.summary,
    sku: product.id,
    category: categoryName(product.category),
    brand: { '@type': 'Brand', name: 'RİMAS' },
    offers: {
      '@type': 'Offer',
      price: price.toFixed(2),
      priceCurrency: 'TRY',
      availability: inStock
        ? 'https://schema.org/InStock'
        : 'https://schema.org/OutOfStock',
      ...(origin ? { url: `${origin}/product/${product.id}` } : null),
      seller: { '@type': 'Organization', name: 'RİMAS' },
    },
  };

  return JSON.stringify(data);
}

export function organizationJsonLd(origin: string): string {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'RİMAS',
    description:
      'İstanbul’da az sayıda üretilen, uzun ömürlü giyim parçaları.',
    ...(origin ? { url: origin, logo: `${origin}/icon-512.png` } : null),
    sameAs: ['https://www.instagram.com/rimas_turkey/'],
    areaServed: 'TR',
  };

  return JSON.stringify(data);
}
