import { ApiError, api } from '@/lib/api';

import { useAuth } from './auth';
import { useShop } from './shop';

/**
 * Keeps local favorites in step with the account.
 *
 * Signing in merges both lists (nothing is lost on a new device), then every
 * change is pushed with a short debounce so rapid taps become one request.
 * Removals made on another device win only until this device changes something;
 * that is an accepted trade-off for a single-writer sync.
 */

let started = false;
let applying = false;
let timer: ReturnType<typeof setTimeout> | null = null;
let lastPushed = '';

const signature = (ids: string[]) => ids.join('|');

function whenHydrated(): Promise<void> {
  if (useShop.persist.hasHydrated()) return Promise.resolve();

  return new Promise((resolve) => {
    let unsubscribe: (() => void) | null = null;
    const finish = () => {
      unsubscribe?.();
      resolve();
    };

    unsubscribe = useShop.persist.onFinishHydration(finish);
    if (useShop.persist.hasHydrated()) finish();
  });
}

async function pushFavorites(): Promise<void> {
  if (useAuth.getState().status !== 'signedIn') return;

  const favorites = useShop.getState().favorites;
  const next = signature(favorites);
  if (next === lastPushed) return;

  try {
    await api('/api/favorites', { method: 'PUT', body: { favorites } });
    lastPushed = next;
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) {
      useAuth.getState().clearSession();
    }
  }
}

async function mergeFavorites(): Promise<void> {
  await whenHydrated();
  if (useAuth.getState().status !== 'signedIn') return;

  try {
    const data = await api<{ favorites: string[] }>('/api/favorites');
    const remote = data.favorites ?? [];
    const local = useShop.getState().favorites;
    const merged = Array.from(new Set([...local, ...remote]));
    const mergedSignature = signature(merged);

    if (signature(local) !== mergedSignature) {
      applying = true;
      try {
        useShop.setState({ favorites: merged });
      } finally {
        applying = false;
      }
    }

    if (signature(remote) === mergedSignature) {
      lastPushed = mergedSignature;
      return;
    }

    const response = await api<{ favorites: string[] }>('/api/favorites', {
      method: 'PUT',
      body: { favorites: merged },
    });
    lastPushed = signature(response.favorites ?? merged);
  } catch (error) {
    applying = false;
    if (error instanceof ApiError && error.status === 401) {
      useAuth.getState().clearSession();
    }
  }
}

export function startAccountSync() {
  if (started) return;
  started = true;

  let wasSignedIn = useAuth.getState().status === 'signedIn';

  useAuth.subscribe((state) => {
    if (state.status === 'signedIn' && !wasSignedIn) {
      wasSignedIn = true;
      void mergeFavorites();
      return;
    }
    if (state.status !== 'signedIn') wasSignedIn = false;
  });

  useShop.subscribe((state, previous) => {
    if (applying || state.favorites === previous.favorites) return;
    if (useAuth.getState().status !== 'signedIn') return;

    if (timer) clearTimeout(timer);
    timer = setTimeout(() => {
      timer = null;
      void pushFavorites();
    }, 900);
  });

  if (useAuth.getState().status === 'signedIn') void mergeFavorites();
}
