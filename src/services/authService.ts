import { api } from '../lib/axios';
import type { AuthResponse, LoginCredentials, User } from '../types';

export const AUTH_KEY = 'auth';

export const authApi = {
  /**
   * Login with email & password
   * POST /api/auth/login
   */
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const { data } = await api.post<any>(
      '/api/auth/login',
      credentials
    );
    return {
      token: data.data?.access_token || data.access_token,
      user: data.data?.user || data.user
    };
  },

  /**
   * Get current authenticated user
   * GET /api/auth/me
   */
  me: async (): Promise<User> => {
    const { data } = await api.get<{ data: User }>('/api/auth/me');
    return data.data;
  },

  /**
   * Logout current user
   * POST /api/auth/logout
   */
  logout: async (): Promise<void> => {
    await api.post('/api/auth/logout');
  },

  /**
   * Refresh the auth token
   * POST /api/auth/refresh-token
   */
  refreshToken: async (): Promise<{ token: string }> => {
    const { data } = await api.post<{ data: { token: string } }>(
      '/api/auth/refresh-token'
    );
    return data.data;
  },
};
