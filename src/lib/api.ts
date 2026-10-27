import Constants from 'expo-constants';
import { Platform } from 'react-native';

/**
 * Base URL for the API.
 *
 * - Web: same origin, so paths stay relative (cookies are sent automatically).
 * - Native in development: the machine running `expo start`, taken from the
 *   Expo host URI, so Expo Go on the same Wi-Fi can reach the API routes.
 * - Native in production: set EXPO_PUBLIC_API_URL (or the Expo Router `origin`).
 */
const configured = process.env.EXPO_PUBLIC_API_URL?.trim();

function developmentOrigin(): string {
  const hostUri = Constants.expoConfig?.hostUri ?? '';
  const [host, port] = hostUri.split(':');
  return host ? `http://${host}:${port || '8081'}` : '';
}

export const API_BASE = configured
  ? configured.replace(/\/+$/, '')
  : Platform.OS === 'web'
    ? ''
    : developmentOrigin();

let authToken: string | null = null;

/** Native builds have no cookies, so the session token travels as a bearer. */
export function setAuthToken(token: string | null) {
  authToken = token;
}

export class ApiError extends Error {
  readonly status: number;
  readonly code: string;

  constructor(status: number, code: string, message: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
  }
}

type RequestOptions = {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  body?: unknown;
  timeoutMs?: number;
};

export async function api<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = 'GET', body, timeoutMs = 12000 } = options;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(`${API_BASE}${path}`, {
      method,
      credentials: 'include',
      headers: {
        Accept: 'application/json',
        ...(body ? { 'Content-Type': 'application/json' } : null),
        ...(authToken ? { Authorization: `Bearer ${authToken}` } : null),
      },
      body: body ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    });

    const payload = await response.json().catch(() => null);

    if (!response.ok) {
      const error = payload?.error;
      throw new ApiError(
        response.status,
        typeof error?.code === 'string' ? error.code : 'SERVER_ERROR',
        typeof error?.message === 'string' ? error.message : 'Bir şeyler ters gitti.'
      );
    }

    return payload as T;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(0, 'NETWORK', 'Bağlantı kurulamadı. Tekrar deneyin.');
  } finally {
    clearTimeout(timer);
  }
}
