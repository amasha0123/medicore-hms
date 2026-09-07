/**
 * MediCore HMS — Central API Client
 *
 * Thin HTTP client that wraps fetch with:
 *  - Base URL from VITE_API_URL env var (falls back to mock mode)
 *  - Automatic JWT Bearer token injection from localStorage / sessionStorage
 *  - Centralised error handling with typed ApiError
 *  - Token refresh on 401 responses
 */

const BASE_URL = import.meta.env.VITE_API_URL || '';

/** When VITE_API_URL is empty the app falls back to localStorage (demo) mode */
export const IS_MOCK_MODE = !import.meta.env.VITE_API_URL;

const TOKEN_KEY = 'medicore_jwt_token';
const REFRESH_KEY = 'medicore_refresh_token';

// ─── Token Helpers ────────────────────────────────────────────────────────────

export function getAccessToken(): string | null {
  return localStorage.getItem(TOKEN_KEY) || sessionStorage.getItem(TOKEN_KEY);
}

export function getRefreshToken(): string | null {
  return localStorage.getItem(REFRESH_KEY) || sessionStorage.getItem(REFRESH_KEY);
}

export function setTokens(
  accessToken: string,
  refreshToken: string,
  persistent: boolean
): void {
  const store = persistent ? localStorage : sessionStorage;
  store.setItem(TOKEN_KEY, accessToken);
  store.setItem(REFRESH_KEY, refreshToken);
}

export function clearTokens(): void {
  [localStorage, sessionStorage].forEach((s) => {
    s.removeItem(TOKEN_KEY);
    s.removeItem(REFRESH_KEY);
  });
}

// ─── API Error ────────────────────────────────────────────────────────────────

export interface ApiFieldError {
  field: string;
  message: string;
}

export class ApiError extends Error {
  statusCode: number;
  errors?: ApiFieldError[];

  constructor(message: string, statusCode: number, errors?: ApiFieldError[]) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.errors = errors;
  }
}

// ─── Core Fetch ───────────────────────────────────────────────────────────────

let isRefreshing = false;
let refreshQueue: Array<(token: string) => void> = [];

async function attemptTokenRefresh(): Promise<string> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) throw new ApiError('Session expired. Please log in again.', 401);

  const res = await fetch(`${BASE_URL}/api/v1/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken }),
  });

  if (!res.ok) {
    clearTokens();
    window.dispatchEvent(new Event('medicore:session-expired'));
    throw new ApiError('Session expired. Please log in again.', 401);
  }

  const json = await res.json();
  const { accessToken, refreshToken: newRefresh } = json.data;
  const persistent = !!localStorage.getItem(TOKEN_KEY);
  setTokens(accessToken, newRefresh, persistent);
  return accessToken;
}

async function request<T>(
  path: string,
  options: RequestInit = {},
  retried = false
): Promise<T> {
  const token = getAccessToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) headers['Authorization'] = `Bearer ${token}`;

  // Remove Content-Type for FormData so browser sets multipart boundary
  if (options.body instanceof FormData) {
    delete headers['Content-Type'];
  }

  const res = await fetch(`${BASE_URL}${path}`, { ...options, headers });

  // Handle 401 — try refresh once
  if (res.status === 401 && !retried) {
    if (isRefreshing) {
      // Queue this call until refresh completes
      return new Promise((resolve, reject) => {
        refreshQueue.push(async (newToken) => {
          try {
            resolve(
              await request<T>(path, {
                ...options,
                headers: { ...headers, Authorization: `Bearer ${newToken}` },
              }, true)
            );
          } catch (e) {
            reject(e);
          }
        });
      });
    }

    isRefreshing = true;
    try {
      const newToken = await attemptTokenRefresh();
      refreshQueue.forEach((cb) => cb(newToken));
      refreshQueue = [];
      isRefreshing = false;
      return request<T>(path, options, true);
    } catch (err) {
      isRefreshing = false;
      refreshQueue = [];
      throw err;
    }
  }

  if (!res.ok) {
    let body: { message?: string; errors?: ApiFieldError[] } = {};
    try {
      body = await res.json();
    } catch {
      // ignore JSON parse failure
    }
    throw new ApiError(body.message || `HTTP ${res.status}`, res.status, body.errors);
  }

  // 204 No Content
  if (res.status === 204) return undefined as T;

  return res.json().then((j) => j.data ?? j);
}

// ─── Public API ───────────────────────────────────────────────────────────────

export const apiClient = {
  get: <T>(path: string) => request<T>(path, { method: 'GET' }),

  post: <T>(path: string, body?: unknown) =>
    request<T>(path, {
      method: 'POST',
      body: body instanceof FormData ? body : JSON.stringify(body),
    }),

  put: <T>(path: string, body?: unknown) =>
    request<T>(path, {
      method: 'PUT',
      body: body instanceof FormData ? body : JSON.stringify(body),
    }),

  patch: <T>(path: string, body?: unknown) =>
    request<T>(path, {
      method: 'PATCH',
      body: body instanceof FormData ? body : JSON.stringify(body),
    }),

  delete: <T>(path: string) => request<T>(path, { method: 'DELETE' }),
};
