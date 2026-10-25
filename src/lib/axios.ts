import axios from 'axios';
import type { AxiosError, InternalAxiosRequestConfig } from 'axios';
import Cookies from 'js-cookie';

export type AuthGuard = 'cashier_man' | 'branch' | 'kitchen';

// ── Cookie Storage Keys per Model / Guard ──
export const CASHIER_TOKEN_KEY = 'pos_cashier_token';
export const BRANCH_TOKEN_KEY = 'pos_branch_token';
export const KITCHEN_TOKEN_KEY = 'pos_kitchen_token';
export const LEGACY_TOKEN_KEY = 'auth_token';

// ── Cashier Token Helpers ──
export const getCashierToken = (): string | null => {
  return Cookies.get(CASHIER_TOKEN_KEY) || Cookies.get(LEGACY_TOKEN_KEY) || null;
};

export const setCashierToken = (token: string): void => {
  Cookies.set(CASHIER_TOKEN_KEY, token, { expires: 7, sameSite: 'lax' });
  Cookies.set(LEGACY_TOKEN_KEY, token, { expires: 7, sameSite: 'lax' });
};

export const removeCashierToken = (): void => {
  Cookies.remove(CASHIER_TOKEN_KEY);
  if (Cookies.get(LEGACY_TOKEN_KEY) === Cookies.get(CASHIER_TOKEN_KEY)) {
    Cookies.remove(LEGACY_TOKEN_KEY);
  }
};

// ── Branch Token Helpers ──
export const getBranchToken = (): string | null => {
  return Cookies.get(BRANCH_TOKEN_KEY) || null;
};

export const setBranchToken = (token: string): void => {
  Cookies.set(BRANCH_TOKEN_KEY, token, { expires: 7, sameSite: 'lax' });
};

export const removeBranchToken = (): void => {
  Cookies.remove(BRANCH_TOKEN_KEY);
};

// ── Kitchen Token Helpers ──
export const getKitchenToken = (): string | null => {
  return Cookies.get(KITCHEN_TOKEN_KEY) || null;
};

export const setKitchenToken = (token: string): void => {
  Cookies.set(KITCHEN_TOKEN_KEY, token, { expires: 7, sameSite: 'lax' });
};

export const removeKitchenToken = (): void => {
  Cookies.remove(KITCHEN_TOKEN_KEY);
};

// ── Context-Aware Token Helper ──
export const getAuthToken = (guard?: AuthGuard | string): string | null => {
  if (guard === 'branch') return getBranchToken();
  if (guard === 'cashier_man') return getCashierToken();
  if (guard === 'kitchen') return getKitchenToken();

  if (typeof window !== 'undefined') {
    const path = window.location.pathname;
    if (path.startsWith('/branch') || path.includes('/branches')) {
      return getBranchToken() || getCashierToken();
    }
    if (path.startsWith('/kitchen')) {
      return getKitchenToken();
    }
  }

  return getCashierToken() || getBranchToken();
};

export const setAuthToken = (token: string, guard: AuthGuard | string = 'cashier_man'): void => {
  if (guard === 'branch') {
    setBranchToken(token);
  } else if (guard === 'kitchen') {
    setKitchenToken(token);
  } else {
    setCashierToken(token);
  }
};

export const removeAuthToken = (guard?: AuthGuard | string): void => {
  if (guard === 'branch') {
    removeBranchToken();
  } else if (guard === 'kitchen') {
    removeKitchenToken();
  } else if (guard === 'cashier_man') {
    removeCashierToken();
  } else {
    removeCashierToken();
    removeBranchToken();
    removeKitchenToken();
    Cookies.remove(LEGACY_TOKEN_KEY);
  }
};

// ── Backward Compatible Aliases ──
export const TOKEN_KEY = LEGACY_TOKEN_KEY;
export const getToken = (): string | null => getAuthToken();
export const setToken = (token: string): void => setCashierToken(token);
export const removeToken = (): void => removeAuthToken();

// ── Axios instance ──
export const api = axios.create({
  baseURL: 'https://ecommerce.mazoom.online',
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
  timeout: 15_000,
});

// ── Request interceptor: attach Guard-specific Bearer token & language headers ──
api.interceptors.request.use(
  (config) => {
    // 1. Determine which token to attach based on endpoint and headers
    const explicitGuard = config.headers['X-Auth-Guard'] as string | undefined;
    let token: string | null = null;

    if (explicitGuard === 'branch' || config.url?.includes('/api/branch')) {
      token = getBranchToken();
    } else if (explicitGuard === 'kitchen' || config.url?.includes('/api/kitchen')) {
      token = getKitchenToken();
    } else if (explicitGuard === 'cashier_man' || config.url?.includes('/api/cashier')) {
      token = getCashierToken();
    } else {
      // General endpoints like /api/auth/*: check current route context
      token = getAuthToken(explicitGuard);
    }

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Clean up internal header before sending to server
    if (config.headers['X-Auth-Guard']) {
      delete config.headers['X-Auth-Guard'];
    }

    const currentLang = (typeof localStorage !== 'undefined' ? localStorage.getItem('pos_language') : null) || 'ar';
    config.headers['Accept-Language'] = currentLang;
    config.headers['lang'] = currentLang;

    config.params = {
      lang: currentLang,
      ...config.params,
    };

    return config;
  },
  (error) => Promise.reject(error)
);

// ── Response interceptor: handle 401 with per-model isolation + auto token refresh ──
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value: unknown) => void;
  reject: (reason?: unknown) => void;
}> = [];

const processQueue = (error: AxiosError | null, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    // Only handle 401 errors
    if (error.response?.status !== 401 || originalRequest._retry) {
      return Promise.reject(error);
    }

    // NEVER attempt token refresh on auth endpoints (login, logout, refresh-token)
    const isAuthEndpoint =
      originalRequest.url?.includes('/api/auth/login') ||
      originalRequest.url?.includes('/api/auth/logout') ||
      originalRequest.url?.includes('/api/auth/refresh-token');

    if (isAuthEndpoint) {
      return Promise.reject(error);
    }

    const isBranchRequest =
      originalRequest.url?.includes('/api/branch') ||
      (typeof window !== 'undefined' &&
        (window.location.pathname.startsWith('/branch') ||
          window.location.pathname.includes('/branches')));

    // ── 1. BRANCH 401: Branches do not support refresh-token on backend ──
    if (isBranchRequest) {
      removeBranchToken();
      if (typeof localStorage !== 'undefined') {
        localStorage.removeItem('pos_branch_user');
      }
      window.dispatchEvent(
        new CustomEvent('auth:logout:branch', { detail: { targetPath: '/branch/login' } })
      );
      return Promise.reject(error);
    }

    const isKitchenRequest =
      originalRequest.url?.includes('/api/kitchen') ||
      (typeof window !== 'undefined' && window.location.pathname.startsWith('/kitchen'));

    // ── 2. KITCHEN 401: Kitchen isolation, clear token and notify ──
    if (isKitchenRequest) {
      removeKitchenToken();
      if (typeof localStorage !== 'undefined') {
        localStorage.removeItem('pos_kitchen_user');
      }
      window.dispatchEvent(
        new CustomEvent('auth:logout:kitchen', { detail: { targetPath: '/kitchen/login' } })
      );
      return Promise.reject(error);
    }

    // ── 3. CASHIER 401: Auto-refresh with cashier token ──
    const cashierToken = getCashierToken();
    if (!cashierToken) {
      removeCashierToken();
      if (typeof localStorage !== 'undefined') {
        localStorage.removeItem('pos_cashier_user');
        localStorage.removeItem('pos_active_shift');
      }
      window.dispatchEvent(
        new CustomEvent('auth:logout:cashier', { detail: { targetPath: '/login' } })
      );
      return Promise.reject(error);
    }

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      })
        .then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return api(originalRequest);
        })
        .catch((err) => Promise.reject(err));
    }

    originalRequest._retry = true;
    isRefreshing = true;

    try {
      const { data } = await axios.post(
        `${api.defaults.baseURL}/api/auth/refresh-token`,
        {},
        {
          headers: {
            Authorization: `Bearer ${cashierToken}`,
          },
        }
      );

      const newToken = data.data?.token || data.token;
      setCashierToken(newToken);
      processQueue(null, newToken);

      originalRequest.headers.Authorization = `Bearer ${newToken}`;
      return api(originalRequest);
    } catch (refreshError) {
      processQueue(refreshError as AxiosError, null);
      removeCashierToken();
      if (typeof localStorage !== 'undefined') {
        localStorage.removeItem('pos_cashier_user');
        localStorage.removeItem('pos_active_shift');
      }
      window.dispatchEvent(
        new CustomEvent('auth:logout:cashier', { detail: { targetPath: '/login' } })
      );
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);
