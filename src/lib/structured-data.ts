import {
  categoryName,
  colorInStock,
  type ColorOption,
  type Product,
  type StockLevels,
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
  levelsFor: (color: ColorOption) => StockLevels = () => null
): string {
  const vatRate = product.vatRate ?? VAT_RATE;
  const price = roundMoney(product.unitPrice * (1 + vatRate));

  const inStock = product.colors.some((color) => colorInStock(product, levelsFor(color)));

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
