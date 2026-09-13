/**
 * MediCore HMS - Central API Client
 *
 * Real backend API client.
 *
 * Frontend:
 *   http://localhost:5173
 *
 * Backend:
 *   http://localhost:5000
 *
 * API:
 *   http://localhost:5000/api/v1
 */

const API_SERVER =
  import.meta.env.VITE_API_URL ||
  (import.meta.env.PROD
    ? 'https://backend-production-7b43.up.railway.app'
    : 'http://localhost:5000');

const BASE_URL = API_SERVER.replace(/\/+$/, '');

export const IS_MOCK_MODE = false;

const TOKEN_KEY = 'medicore_jwt_token';
const REFRESH_KEY = 'medicore_refresh_token';

// -----------------------------------------------------------------------------
// Token Helpers
// -----------------------------------------------------------------------------

export function getAccessToken(): string | null {
  return (
    localStorage.getItem(TOKEN_KEY) ||
    sessionStorage.getItem(TOKEN_KEY)
  );
}

export function getRefreshToken(): string | null {
  return (
    localStorage.getItem(REFRESH_KEY) ||
    sessionStorage.getItem(REFRESH_KEY)
  );
}

export function setTokens(
  accessToken: string,
  refreshToken: string,
  persistent = true
): void {
  console.log('[MediCore Auth] setTokens called');
  console.log(
    '[MediCore Auth] access token received:',
    !!accessToken
  );
  console.log(
    '[MediCore Auth] refresh token received:',
    !!refreshToken
  );
  console.log(
    '[MediCore Auth] persistent:',
    persistent
  );

  if (!accessToken) {
    throw new Error(
      'Login failed: accessToken was not returned by the backend.'
    );
  }

  if (!refreshToken) {
    throw new Error(
      'Login failed: refreshToken was not returned by the backend.'
    );
  }

  const store = persistent
    ? localStorage
    : sessionStorage;

  const otherStore = persistent
    ? sessionStorage
    : localStorage;

  // Remove stale tokens first.
  otherStore.removeItem(TOKEN_KEY);
  otherStore.removeItem(REFRESH_KEY);

  // Store the new tokens.
  store.setItem(TOKEN_KEY, accessToken);
  store.setItem(REFRESH_KEY, refreshToken);

  console.log(
    '[MediCore Auth] token stored successfully:',
    !!store.getItem(TOKEN_KEY)
  );
}

// -----------------------------------------------------------------------------
// API Error
// -----------------------------------------------------------------------------

export interface ApiFieldError {
  field: string;
  message: string;
}

export class ApiError extends Error {
  public statusCode: number;
  public errors?: ApiFieldError[];

  constructor(
    message: string,
    statusCode: number,
    errors?: ApiFieldError[]
  ) {
    super(message);

    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.errors = errors;

    Object.setPrototypeOf(this, ApiError.prototype);
  }
}

// -----------------------------------------------------------------------------
// Token Refresh
// -----------------------------------------------------------------------------

let isRefreshing = false;

let refreshQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: unknown) => void;
}> = [];

async function attemptTokenRefresh(): Promise<string> {
  const refreshToken = getRefreshToken();

  if (!refreshToken) {
    clearTokens();

    window.dispatchEvent(
      new Event('medicore:session-expired')
    );

    throw new ApiError(
      'Session expired. Please log in again.',
      401
    );
  }

  const response = await fetch(
    `${BASE_URL}/api/v1/auth/refresh`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        refreshToken,
      }),
    }
  );

  if (!response.ok) {
    clearTokens();

    window.dispatchEvent(
      new Event('medicore:session-expired')
    );

    throw new ApiError(
      'Session expired. Please log in again.',
      401
    );
  }

  let json: any;

  try {
    json = await response.json();
  } catch {
    clearTokens();

    throw new ApiError(
      'Invalid token refresh response.',
      401
    );
  }

  const accessToken = json?.data?.accessToken;
  const newRefreshToken =
    json?.data?.refreshToken;

  if (!accessToken || !newRefreshToken) {
    clearTokens();

    throw new ApiError(
      'Invalid token refresh response.',
      401
    );
  }

  const persistent =
    !!localStorage.getItem(TOKEN_KEY);

  setTokens(
    accessToken,
    newRefreshToken,
    persistent
  );

  return accessToken;
}

// -----------------------------------------------------------------------------
// Build URL
// -----------------------------------------------------------------------------

function buildUrl(path: string): string {
  // If a complete URL is supplied, use it directly.
  if (/^https?:\/\//i.test(path)) {
    return path;
  }

  const normalizedPath = path.startsWith('/')
    ? path
    : `/${path}`;

  return `${BASE_URL}${normalizedPath}`;
}

// -----------------------------------------------------------------------------
// Core Request
// -----------------------------------------------------------------------------

async function request<T>(
  path: string,
  options: RequestInit = {},
  retried = false
): Promise<T> {
  const token = getAccessToken();

  const headers = new Headers(
    options.headers || {}
  );

  if (!headers.has('Accept')) {
    headers.set('Accept', 'application/json');
  }

  // Do not manually set Content-Type for FormData.
  if (!(options.body instanceof FormData)) {
    if (!headers.has('Content-Type')) {
      headers.set(
        'Content-Type',
        'application/json'
      );
    }
  }

  if (token) {
    headers.set(
      'Authorization',
      `Bearer ${token}`
    );
  }

  const url = buildUrl(path);

  console.log(
    `[MediCore API] ${options.method || 'GET'} ${url}`
  );

  let response: Response;
  try {
    response = await fetch(
      url,
      {
        ...options,
        headers,
      }
    );
  } catch (netErr: any) {
    console.error(`[MediCore API Network Error] Failed to reach ${url}:`, netErr);
    const msg = netErr?.message || '';
    if (msg === 'Load failed' || msg.includes('Failed to fetch') || netErr?.name === 'TypeError') {
      throw new ApiError(
        `Unable to reach backend server at ${url || 'current domain'}. If you deployed the app, make sure your backend server is deployed and online, and VITE_API_URL is configured in your hosting environment variables.`,
        0
      );
    }
    throw netErr;
  }

  // ---------------------------------------------------------------------------
  // Handle 401 - Refresh token once
  // ---------------------------------------------------------------------------

  const isAuthRoute =
    path.includes('/auth/login') ||
    path.includes('/auth/refresh') ||
    path.includes('/auth/register');

  const hasRefreshToken = !!getRefreshToken();

  if (
    response.status === 401 &&
    !retried &&
    !isAuthRoute &&
    hasRefreshToken
  ) {
    if (isRefreshing) {
      return new Promise<T>(
        (resolve, reject) => {
          refreshQueue.push({
            resolve: async (newToken) => {
              try {
                const result =
                  await request<T>(
                    path,
                    {
                      ...options,
                      headers: {
                        ...Object.fromEntries(
                          headers.entries()
                        ),
                        Authorization:
                          `Bearer ${newToken}`,
                      },
                    },
                    true
                  );

                resolve(result);
              } catch (error) {
                reject(error);
              }
            },
            reject,
          });
        }
      );
    }

    isRefreshing = true;

    try {
      const newToken =
        await attemptTokenRefresh();

      const queuedRequests =
        [...refreshQueue];

      refreshQueue = [];

      queuedRequests.forEach(
        ({ resolve }) => {
          resolve(newToken);
        }
      );

      isRefreshing = false;

      return request<T>(
        path,
        options,
        true
      );
    } catch (error) {
      const queuedRequests =
        [...refreshQueue];

      refreshQueue = [];
      isRefreshing = false;

      queuedRequests.forEach(
        ({ reject }) => {
          reject(error);
        }
      );

      throw error;
    }
  }

  // ---------------------------------------------------------------------------
  // Handle API Errors
  // ---------------------------------------------------------------------------

  if (!response.ok) {
    let body: {
      success?: boolean;
      message?: string;
      errors?: ApiFieldError[];
    } = {};

    try {
      body = await response.json();
    } catch {
      // Response was not JSON.
    }

    throw new ApiError(
      body.message ||
      `HTTP ${response.status}`,
      response.status,
      body.errors
    );
  }

  // ---------------------------------------------------------------------------
  // 204 No Content
  // ---------------------------------------------------------------------------

  if (response.status === 204) {
    return undefined as T;
  }

  // ---------------------------------------------------------------------------
  // Parse response
  // ---------------------------------------------------------------------------

  const json = await response.json();

  return json?.data ?? json;
}

// -----------------------------------------------------------------------------
// Public API
// -----------------------------------------------------------------------------

export const apiClient = {
  get: <T>(path: string): Promise<T> =>
    request<T>(path, {
      method: 'GET',
    }),

  post: <T>(
    path: string,
    body?: unknown
  ): Promise<T> =>
    request<T>(path, {
      method: 'POST',
      body:
        body instanceof FormData
          ? body
          : JSON.stringify(body ?? {}),
    }),

  put: <T>(
    path: string,
    body?: unknown
  ): Promise<T> =>
    request<T>(path, {
      method: 'PUT',
      body:
        body instanceof FormData
          ? body
          : JSON.stringify(body ?? {}),
    }),

  patch: <T>(
    path: string,
    body?: unknown
  ): Promise<T> =>
    request<T>(path, {
      method: 'PATCH',
      body:
        body instanceof FormData
          ? body
          : JSON.stringify(body ?? {}),
    }),

  delete: <T>(path: string): Promise<T> =>
    request<T>(path, {
      method: 'DELETE',
    }),
};

export function clearTokens(): void {
  try {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_KEY);
    localStorage.removeItem('medicore_current_user');
    sessionStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(REFRESH_KEY);
    sessionStorage.removeItem('medicore_current_user');
  } catch (err) {
    console.error('[MediCore Auth] Failed to clear tokens from storage:', err);
  }
}

