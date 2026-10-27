import { Platform } from 'react-native';
import { create } from 'zustand';

import { api, setAuthToken } from '@/lib/api';

/**
 * Client-side account state.
 *
 * The session itself lives on the server: web keeps it in an HttpOnly cookie,
 * native keeps the bearer token in the iOS Keychain / Android Keystore.
 * This store only mirrors the current user for the UI.
 */

export type AuthUser = {
  id: string;
  email: string;
  name: string;
  phone: string | null;
  marketingOptIn: boolean;
  createdAt: string;
};

export type AuthStatus = 'loading' | 'signedIn' | 'signedOut';

type SessionResponse = { user: AuthUser | null; token?: string };

const TOKEN_KEY = 'rimas_session_token';

async function secureStore() {
  if (Platform.OS === 'web') return null;
  try {
    return await import('expo-secure-store');
  } catch {
    return null;
  }
}

async function loadStoredToken(): Promise<string | null> {
  const store = await secureStore();
  if (!store) return null;
  try {
    return await store.getItemAsync(TOKEN_KEY);
  } catch {
    return null;
  }
}

async function saveStoredToken(token: string | null) {
  const store = await secureStore();
  if (!store) return;
  try {
    if (token) {
      await store.setItemAsync(TOKEN_KEY, token);
    } else {
      await store.deleteItemAsync(TOKEN_KEY);
    }
  } catch {
    // Storage failures should never block signing in or out.
  }
}

type AuthState = {
  user: AuthUser | null;
  status: AuthStatus;
  /** Verifies an existing session. Safe to call more than once. */
  bootstrap: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<AuthUser>;
  signUp: (name: string, email: string, password: string) => Promise<AuthUser>;
  signOut: () => Promise<void>;
  /** Drops the local session after the server rejected it. */
  clearSession: () => void;
  updateUser: (user: AuthUser) => void;
};

let bootstrapInFlight: Promise<void> | null = null;

async function applySession(data: SessionResponse) {
  if (data.token) {
    setAuthToken(data.token);
    await saveStoredToken(data.token);
  }
  useAuth.setState({ user: data.user, status: data.user ? 'signedIn' : 'signedOut' });
}

export const useAuth = create<AuthState>((set, get) => ({
  user: null,
  status: 'loading',

  bootstrap: async () => {
    if (bootstrapInFlight) return bootstrapInFlight;

    bootstrapInFlight = (async () => {
      const token = await loadStoredToken();
      if (token) setAuthToken(token);

      try {
        const data = await api<SessionResponse>('/api/auth/session', { timeoutMs: 6000 });
        await applySession(data);
      } catch {
        // Offline or server hiccup: keep any stored token for the next launch
        // and let the app continue as a guest instead of blocking on a spinner.
        setAuthToken(null);
        set({ user: null, status: 'signedOut' });
      }
    })().finally(() => {
      bootstrapInFlight = null;
    });

    return bootstrapInFlight;
  },

  signIn: async (email, password) => {
    const data = await api<SessionResponse>('/api/auth/login', {
      method: 'POST',
      body: { email: email.trim(), password },
    });
    if (!data.user) throw new Error('Oturum açılamadı.');
    await applySession(data);
    return data.user;
  },

  signUp: async (name, email, password) => {
    const data = await api<SessionResponse>('/api/auth/register', {
      method: 'POST',
      body: { name: name.trim(), email: email.trim(), password },
    });
    if (!data.user) throw new Error('Hesap oluşturulamadı.');
    await applySession(data);
    return data.user;
  },

  signOut: async () => {
    try {
      await api('/api/auth/logout', { method: 'POST', timeoutMs: 6000 });
    } catch {
      // Even if the server is unreachable, clear the device session.
    }
    setAuthToken(null);
    await saveStoredToken(null);
    set({ user: null, status: 'signedOut' });
  },

  clearSession: () => {
    setAuthToken(null);
    void saveStoredToken(null);
    set({ user: null, status: 'signedOut' });
  },

  updateUser: (user) => {
    if (get().status === 'signedIn') set({ user });
  },
}));
