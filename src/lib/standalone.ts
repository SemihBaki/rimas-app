import { Platform } from 'react-native';

let cached: boolean | null = null;

/**
 * True when the web build runs as an installed app ("Ana Ekrana Ekle" on iOS,
 * installed PWA elsewhere) instead of a browser tab.
 *
 * Layout uses this to tell the two cases apart when the safe-area inset is 0:
 * on an installed iPhone app the viewport already starts below the status bar,
 * so the bar needs its own breathing room, while a desktop browser window wants
 * a slightly tighter one. Server rendering and the native app report false.
 */
export function isStandaloneWebApp(): boolean {
  if (Platform.OS !== 'web' || typeof window === 'undefined') return false;
  if (cached !== null) return cached;

  cached =
    window.matchMedia('(display-mode: standalone)').matches ||
    (navigator as Navigator & { standalone?: boolean }).standalone === true;
  return cached;
}
