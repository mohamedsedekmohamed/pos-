import React, { createContext, useContext, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useQueryClient, useMutation, useQuery } from '@tanstack/react-query';
import {
  getCashierToken,
  setCashierToken,
  removeCashierToken,
  getBranchToken,
  setBranchToken,
  removeBranchToken,
} from '../lib/axios';
import { authApi } from '../services/authService';
import { saveLastLoginPath } from '../utils/authNavigation';
import type { User, LoginCredentials } from '../types';

export interface AuthContextType {
  // Context-aware user & auth state (automatically reflects Cashier or Branch based on active route):
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  // Dedicated Cashier state:
  cashierUser: User | null;
  isCashierAuthenticated: boolean;

  // Dedicated Branch state:
  branchUser: User | null;
  isBranchAuthenticated: boolean;

  // Unified actions:
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: (guard?: 'cashier_man' | 'branch' | unknown) => void;
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

// ── Helpers to read cached user records from localStorage ──
const getInitialCashierUser = (): User | null => {
  if (typeof localStorage === 'undefined') return null;
  const specific = localStorage.getItem('pos_cashier_user');
  if (specific) {
    try {
      return JSON.parse(specific);
    } catch {
      /* ignore */
    }
  }
  // Fallback to legacy pos_user if guard is not branch
  const guard = localStorage.getItem('pos_user_guard');
  if (guard !== 'branch') {
    const legacy = localStorage.getItem('pos_user');
    if (legacy) {
      try {
        return JSON.parse(legacy);
      } catch {
        /* ignore */
      }
    }
  }
  return null;
};

const getInitialBranchUser = (): User | null => {
  if (typeof localStorage === 'undefined') return null;
  const specific = localStorage.getItem('pos_branch_user');
  if (specific) {
    try {
      return JSON.parse(specific);
    } catch {
      /* ignore */
    }
  }
  // Fallback to legacy pos_user if guard is branch
  const guard = localStorage.getItem('pos_user_guard');
  if (guard === 'branch') {
    const legacy = localStorage.getItem('pos_user');
    if (legacy) {
      try {
        return JSON.parse(legacy);
      } catch {
        /* ignore */
      }
    }
  }
  return null;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const [loginError, setLoginError] = React.useState<string | null>(null);

  // Check token existence per model/guard
  const hasCashierToken = Boolean(getCashierToken());
  const hasBranchToken = Boolean(getBranchToken());

  // ── 1. Fetch Cashier User data independently ──
  const { data: cashierUser = null, isLoading: isLoadingCashier } = useQuery({
    queryKey: ['auth', 'me', 'cashier'],
    queryFn: () => authApi.me('cashier_man'),
    enabled: hasCashierToken,
    retry: false,
    staleTime: Infinity,
    initialData: getInitialCashierUser,
  });

  // ── 2. Fetch Branch User data independently ──
  const { data: branchUser = null, isLoading: isLoadingBranch } = useQuery({
    queryKey: ['auth', 'me', 'branch'],
    queryFn: () => authApi.me('branch'),
    enabled: hasBranchToken,
    retry: false,
    staleTime: Infinity,
    initialData: getInitialBranchUser,
  });

  const isCashierAuthenticated = Boolean(cashierUser || hasCashierToken);
  const isBranchAuthenticated = Boolean(branchUser || hasBranchToken);

  // Determine active context based on current path
  const isBranchContext =
    location.pathname.startsWith('/branch') || location.pathname.includes('/branches');
  const user = isBranchContext ? branchUser : cashierUser;
  const isAuthenticated = isBranchContext ? isBranchAuthenticated : isCashierAuthenticated;

  // ── Login Mutation with Model Separation ──
  const loginMutation = useMutation({
    mutationFn: authApi.login,
    onSuccess: (data, variables) => {
      const guard = variables.guard || data.guard || 'cashier_man';

      if (guard === 'branch' || data.user?.role === 'branch') {
        // Save to isolated Branch storage
        setBranchToken(data.token);
        queryClient.setQueryData(['auth', 'me', 'branch'], data.user);
        if (typeof localStorage !== 'undefined') {
          localStorage.setItem('pos_branch_user', JSON.stringify(data.user));
          localStorage.setItem('pos_user_guard', 'branch');
        }
        saveLastLoginPath('/branch/login');
        navigate('/branches', { replace: true });
      } else {
        // Save to isolated Cashier storage
        setCashierToken(data.token);
        queryClient.setQueryData(['auth', 'me', 'cashier'], data.user);
        if (typeof localStorage !== 'undefined') {
          localStorage.setItem('pos_cashier_user', JSON.stringify(data.user));
          localStorage.setItem('pos_user_guard', 'cashier_man');
        }
        saveLastLoginPath('/login');
        navigate('/dashboard/shift', { replace: true });
      }
    },
    onError: (error: any) => {
      setLoginError(error.response?.data?.message || 'فشل تسجيل الدخول...');
    },
  });

  // ── Logout with Model Separation ──
  const logout = (guardOrEvent?: 'cashier_man' | 'branch' | unknown) => {
    const specifiedGuard =
      typeof guardOrEvent === 'string' &&
      (guardOrEvent === 'branch' || guardOrEvent === 'cashier_man')
        ? guardOrEvent
        : undefined;

    const effectiveGuard: 'cashier_man' | 'branch' =
      specifiedGuard || (isBranchContext ? 'branch' : 'cashier_man');

    if (effectiveGuard === 'branch') {
      removeBranchToken();
      if (typeof localStorage !== 'undefined') {
        localStorage.removeItem('pos_branch_user');
      }
      queryClient.removeQueries({ queryKey: ['auth', 'me', 'branch'] });
      saveLastLoginPath('/branch/login');
      navigate('/branch/login', { replace: true });
    } else {
      removeCashierToken();
      if (typeof localStorage !== 'undefined') {
        localStorage.removeItem('pos_cashier_user');
        localStorage.removeItem('pos_active_shift');
      }
      queryClient.removeQueries({ queryKey: ['auth', 'me', 'cashier'] });
      saveLastLoginPath('/login');
      navigate('/login', { replace: true });
    }

    // Call server logout silently in background with guard header
    authApi.logout(effectiveGuard).catch(() => {
      /* ignore */
    });
  };

  const login = async (credentials: LoginCredentials) => {
    setLoginError(null);
    await loginMutation.mutateAsync(credentials);
  };

  // ── Listen for forced logout events from Axios Interceptor ──
  useEffect(() => {
    const handleBranchLogout = () => {
      removeBranchToken();
      if (typeof localStorage !== 'undefined') {
        localStorage.removeItem('pos_branch_user');
      }
      queryClient.removeQueries({ queryKey: ['auth', 'me', 'branch'] });
      navigate('/branch/login', { replace: true });
    };

    const handleCashierLogout = () => {
      removeCashierToken();
      if (typeof localStorage !== 'undefined') {
        localStorage.removeItem('pos_cashier_user');
        localStorage.removeItem('pos_active_shift');
      }
      queryClient.removeQueries({ queryKey: ['auth', 'me', 'cashier'] });
      navigate('/login', { replace: true });
    };

    const handleGenericLogout = (e?: Event) => {
      const customEvent = e as CustomEvent<{ targetPath?: string }>;
      const target = customEvent?.detail?.targetPath;
      if (target === '/branch/login') {
        handleBranchLogout();
      } else {
        handleCashierLogout();
      }
    };

    window.addEventListener('auth:logout:branch', handleBranchLogout);
    window.addEventListener('auth:logout:cashier', handleCashierLogout);
    window.addEventListener('auth:logout', handleGenericLogout);

    return () => {
      window.removeEventListener('auth:logout:branch', handleBranchLogout);
      window.removeEventListener('auth:logout:cashier', handleCashierLogout);
      window.removeEventListener('auth:logout', handleGenericLogout);
    };
  }, [navigate, queryClient]);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isLoading: isLoadingCashier || isLoadingBranch || loginMutation.isPending,
        cashierUser,
        isCashierAuthenticated,
        branchUser,
        isBranchAuthenticated,
        login,
        logout,
        loginError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
