import { api, getCashierToken } from '../lib/axios';
import type { AuthResponse, LoginCredentials, User } from '../types';

export const AUTH_KEY = 'auth';

export const authApi = {
  /**
   * Login with email & password + guard
   * POST /api/auth/login
   */
  login: async (credentials: LoginCredentials): Promise<AuthResponse & { guard: string }> => {
    const guard = credentials.guard || 'cashier_man';
    const { data } = await api.post<any>(
      '/api/auth/login',
      credentials,
      {
        headers: {
          'X-Auth-Guard': guard,
        },
      }
    );
    return {
      token: data.data?.access_token || data.access_token,
      user: data.data?.user || data.user,
      guard,
    };
  },

  /**
   * Get current authenticated user
   * GET /api/auth/me
   */
  me: async (guard?: string): Promise<User> => {
    const headers: Record<string, string> = {};
    if (guard) {
      headers['X-Auth-Guard'] = guard;
    }
    const { data } = await api.get<{ data: User }>('/api/auth/me', { headers });
    return data.data;
  },

  /**
   * Logout current user
   * POST /api/auth/logout
   */
  logout: async (guard?: string): Promise<void> => {
    const headers: Record<string, string> = {};
    if (guard) {
      headers['X-Auth-Guard'] = guard;
    }
    await api.post('/api/auth/logout', {}, { headers });
  },

  /**
   * Refresh the auth token (supported for cashier)
   * POST /api/auth/refresh-token
   */
  refreshToken: async (): Promise<{ token: string }> => {
    const cashierToken = getCashierToken();
    if (!cashierToken) {
      throw new Error('No cashier token to refresh');
    }
    const { data } = await api.post<{ data: { token: string } }>(
      '/api/auth/refresh-token',
      {},
      {
        headers: {
          Authorization: `Bearer ${cashierToken}`,
          'X-Auth-Guard': 'cashier_man',
        },
      }
    );
    return data.data;
  },
};
