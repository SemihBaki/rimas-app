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

type PageMetadataInput = {
  title: string;
  description?: string;
  /** Shopping flow screens should not appear in search results. */
  noIndex?: boolean;
};

export function buildMetadata({
  title,
  description = DEFAULT_DESCRIPTION,
  noIndex = false,
}: PageMetadataInput): Metadata {
  return {
    title,
    description,
    applicationName: SITE_NAME,
    ...(noIndex ? { robots: { index: false, follow: false } } : {}),
    openGraph: {
      title,
      description,
      siteName: SITE_NAME,
      locale: 'tr_TR',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
  };
}

export function firstParam(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}
