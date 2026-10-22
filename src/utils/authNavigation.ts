export const LAST_LOGIN_PATH_KEY = 'pos_last_login_path';
export const USER_GUARD_KEY = 'pos_user_guard';

/**
 * Returns the appropriate login URL based on context:
 * - If current route is branch-related (/branch, /branches), return '/branch/login'
 * - If stored last login path is '/branch/login', return '/branch/login'
 * - If stored user guard is 'branch', return '/branch/login'
 * - Otherwise return default cashier login '/login'
 */
export const getLoginRedirectPath = (): string => {
  if (typeof window !== 'undefined') {
    const currentPath = window.location.pathname;
    if (currentPath.startsWith('/branch') || currentPath.includes('/branches')) {
      return '/branch/login';
    }

    const storedGuard = localStorage.getItem(USER_GUARD_KEY);
    if (storedGuard === 'branch') {
      return '/branch/login';
    }

    const lastPath = localStorage.getItem(LAST_LOGIN_PATH_KEY);
    if (lastPath === '/branch/login') {
      return '/branch/login';
    }
  }

  return '/login';
};

/**
 * Saves the active login path to localStorage so any subsequent
 * session expirations or logouts remember where the user originated from.
 */
export const saveLastLoginPath = (path: '/login' | '/branch/login' | string): void => {
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem(LAST_LOGIN_PATH_KEY, path);
  }
};
