import type { Metadata } from 'expo-router/server';

/**
 * RİMAS web metadata.
 *
 * These helpers are only referenced from `generateMetadata` exports, so they are
 * stripped from the client bundle and evaluated by the server renderer before
 * the HTML stream starts.
 */

const SITE_NAME = 'RİMAS';

const DEFAULT_DESCRIPTION =
  'RİMAS: az sayıda, uzun ömürlü parça. Sonbahar / Kış 26 koleksiyonu; Türkiye’de üretim, ücretsiz kargo ve 30 gün içinde iade.';

const OG_IMAGE_PATH = '/og-image.png';
const OG_IMAGE_WIDTH = 1200;
const OG_IMAGE_HEIGHT = 630;

/**
 * Absolute origin for canonical and Open Graph URLs.
 *
 * Production should set `EXPO_PUBLIC_SITE_URL` (e.g. https://rimas.com.tr).
 * Without it the request origin is used, which keeps previews correct and
 * avoids pointing search engines at a domain that is not live yet.
 */
export function siteOrigin(request?: { url: string } | null): string {
  const configured =
    process.env.EXPO_PUBLIC_SITE_URL?.trim() || process.env.SITE_URL?.trim();
  if (configured) return configured.replace(/\/+$/, '');

  if (request?.url) {
    try {
      return new URL(request.url).origin;
    } catch {
      // Fall through: no usable origin.
    }
  }

  return '';
}

type PageMetadataInput = {
  title: string;
  description?: string;
  /** Shopping flow screens should not appear in search results. */
  noIndex?: boolean;
  /** Path on this site, e.g. `/product/trench`. Enables canonical + OG URL. */
  path?: string;
};

export function buildMetadata(
  { title, description = DEFAULT_DESCRIPTION, noIndex = false, path }: PageMetadataInput,
  request?: { url: string } | null
): Metadata {
  const origin = siteOrigin(request);
  const canonical = origin && path ? `${origin}${path}` : undefined;
  const image = origin ? `${origin}${OG_IMAGE_PATH}` : undefined;

  return {
    title,
    description,
    applicationName: SITE_NAME,
    ...(noIndex ? { robots: { index: false, follow: false } } : {}),
    ...(canonical ? { alternates: { canonical } } : null),
    openGraph: {
      title,
      description,
      siteName: SITE_NAME,
      locale: 'tr_TR',
      type: 'website',
      ...(canonical ? { url: canonical } : null),
      ...(image
        ? {
            images: [
              {
                url: image,
                width: OG_IMAGE_WIDTH,
                height: OG_IMAGE_HEIGHT,
                alt: `${SITE_NAME} — ${title}`,
              },
            ],
          }
        : null),
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      ...(image ? { images: [image] } : null),
    },
  };
}

export function firstParam(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}
