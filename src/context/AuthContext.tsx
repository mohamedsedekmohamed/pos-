import React, { createContext, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueryClient, useMutation, useQuery } from '@tanstack/react-query';
import { getToken, setToken, removeToken } from '../lib/axios';
import { authApi } from '../services/authService';
import type { User, LoginCredentials } from '../types';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
  loginError: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [loginError, setLoginError] = React.useState<string | null>(null);

  const hasToken = Boolean(getToken());

  // ── Fetch user data if token exists ──
  const { data: user = null, isLoading: isLoadingUser } = useQuery({
    queryKey: ['auth', 'me'],
    queryFn: authApi.me,
    enabled: hasToken,
    retry: false,
    staleTime: Infinity,
  });

  const isAuthenticated = Boolean(user);

  // ── Login Mutation ──
  const loginMutation = useMutation({
    mutationFn: authApi.login,
    onSuccess: (data) => {
      setToken(data.token);
      queryClient.setQueryData(['auth', 'me'], data.user);
      navigate('/dashboard', { replace: true });
    },
    onError: (error: any) => {
      setLoginError(error.response?.data?.message || 'فشل تسجيل الدخول...');
    },
  });

  // ── Logout Mutation ──
  const logoutMutation = useMutation({
    mutationFn: authApi.logout,
    onSettled: () => {
      removeToken();
      queryClient.clear();
      navigate('/login', { replace: true });
    },
  });

  const login = async (credentials: LoginCredentials) => {
    setLoginError(null);
    await loginMutation.mutateAsync(credentials);
  };

  const logout = () => {
    logoutMutation.mutate();
  };

  // ── Listen for forced logout from interceptor ──
  useEffect(() => {
    const handleForcedLogout = () => {
      removeToken();
      queryClient.clear();
      navigate('/login', { replace: true });
    };

    window.addEventListener('auth:logout', handleForcedLogout);
    return () => window.removeEventListener('auth:logout', handleForcedLogout);
  }, [navigate, queryClient]);

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated,
      isLoading: isLoadingUser || loginMutation.isPending,
      login,
      logout,
      loginError
    }}>
      {children}
    </AuthContext.Provider>
  );
};
