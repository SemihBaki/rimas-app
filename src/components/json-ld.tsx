import { useEffect } from 'react';
import { Platform } from 'react-native';

/**
 * Adds a JSON-LD block to the document head on web.
 *
 * Expo Router's metadata API has no script support, so structured data is
 * injected after hydration. Search engines that render JavaScript pick it up;
 * native builds have no `<head>` and simply skip this component.
 */
export function JsonLd({ json }: { json: string }) {
  useEffect(() => {
    if (Platform.OS !== 'web' || !json) return;

    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.textContent = json;
    script.dataset.rimas = 'jsonld';
    document.head.appendChild(script);

    return () => {
      script.remove();
    };
  }, [json]);

  return null;
}
