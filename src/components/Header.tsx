import React from 'react';
import { FiSun, FiMoon, FiLogOut } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Link } from 'react-router-dom';

const Header: React.FC = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="sticky top-0 z-30 h-16 bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border-b border-slate-200 dark:border-slate-700 flex items-center justify-between px-6">
      {/* Left: Brand */}
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center shadow-lg shadow-primary/25">
          <span className="text-white font-bold text-sm">P</span>
        </div>
        <h1 className="text-lg font-bold bg-gradient-to-l from-primary to-primary-dark bg-clip-text text-transparent">
          POS الكاشير
        </h1>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-3">
        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer"
          title={theme === 'dark' ? 'الوضع الفاتح' : 'الوضع الداكن'}
        >
          {theme === 'dark' ? (
            <FiSun className="w-5 h-5 text-amber-400" />
          ) : (
            <FiMoon className="w-5 h-5 text-slate-500" />
          )}
        </button>

        {/* User Info */}
        {user && (
          <Link
            to="/dashboard/profile"
            className="flex items-center gap-3 pr-3 border-r border-slate-200 dark:border-slate-700 hover:opacity-80 transition-opacity cursor-pointer"
            title="الصفحة الشخصية"
          >
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center text-white text-sm font-bold shadow-lg shadow-primary/25">
              {user.name?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <div className="hidden sm:block text-right">
              <p className="text-sm font-medium text-slate-900 dark:text-white leading-tight">
                {user.name}
              </p>
              <p className="text-xs text-slate-400 dark:text-slate-500">
                كاشير
              </p>
            </div>
          </Link>
        )}

        {/* Logout */}
        <button
          onClick={logout}
          className="p-2.5 rounded-xl text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors cursor-pointer"
          title="تسجيل الخروج"
        >
          <FiLogOut className="w-5 h-5" />
        </button>
      </div>
    </header>
  );
};

export default Header;
