import React from 'react';
import { FiSun, FiMoon, FiLogOut, FiClock, FiShoppingBag, FiCoffee, FiTruck, FiGlobe } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useShift } from '../context/ShiftContext';
import { useOrderType } from '../context/OrderTypeContext';
import { useLanguage } from '../context/LanguageContext';
import { Link } from 'react-router-dom';

const Header: React.FC = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { hasActiveShift } = useShift();
  const { orderType, setOrderType } = useOrderType();
  const { language, toggleLanguage, t } = useLanguage();

  return (
    <header className="sticky top-0 z-30 h-16 bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border-b border-slate-200 dark:border-slate-700 flex items-center justify-between px-4 sm:px-6">
      {/* Left: Brand */}
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center shadow-lg shadow-primary/25">
          <span className="text-white font-bold text-sm">P</span>
        </div>
        <h1 className="text-lg font-bold bg-gradient-to-l from-primary to-primary-dark bg-clip-text text-transparent hidden sm:block">
          {t('pos_cashier')}
        </h1>
      </div>

      {/* Center: Order Type Selector (نوع الطلب) */}
      <div className="flex items-center bg-slate-100 dark:bg-slate-900/90 p-1 sm:p-1.5 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-inner gap-1 sm:gap-2">
        <button
          type="button"
          onClick={() => setOrderType('takeaway')}
          className={`flex items-center justify-center gap-2 px-4 sm:px-7 py-2 sm:py-2.5 min-w-[95px] sm:min-w-[130px] rounded-xl text-xs sm:text-sm font-extrabold transition-all cursor-pointer ${
            orderType === 'takeaway'
              ? 'bg-gradient-to-r from-primary to-indigo-600 text-white shadow-lg shadow-primary/25 scale-[1.02]'
              : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/70 dark:hover:bg-slate-800'
          }`}
          title={t('takeaway')}
        >
          <FiShoppingBag className="w-4 h-4 sm:w-4.5 sm:h-4.5 shrink-0" />
          <span>{t('takeaway')}</span>
        </button>

        <button
          type="button"
          onClick={() => setOrderType('dinein')}
          className={`flex items-center justify-center gap-2 px-4 sm:px-7 py-2 sm:py-2.5 min-w-[95px] sm:min-w-[130px] rounded-xl text-xs sm:text-sm font-extrabold transition-all cursor-pointer ${
            orderType === 'dinein'
              ? 'bg-gradient-to-r from-primary to-indigo-600 text-white shadow-lg shadow-primary/25 scale-[1.02]'
              : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/70 dark:hover:bg-slate-800'
          }`}
          title={t('dinein')}
        >
          <FiCoffee className="w-4 h-4 sm:w-4.5 sm:h-4.5 shrink-0" />
          <span>{t('dinein')}</span>
        </button>

        <button
          type="button"
          onClick={() => setOrderType('delivery')}
          className={`flex items-center justify-center gap-2 px-4 sm:px-7 py-2 sm:py-2.5 min-w-[95px] sm:min-w-[130px] rounded-xl text-xs sm:text-sm font-extrabold transition-all cursor-pointer ${
            orderType === 'delivery'
              ? 'bg-gradient-to-r from-primary to-indigo-600 text-white shadow-lg shadow-primary/25 scale-[1.02]'
              : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/70 dark:hover:bg-slate-800'
          }`}
          title={t('delivery')}
        >
          <FiTruck className="w-4 h-4 sm:w-4.5 sm:h-4.5 shrink-0" />
          <span>{t('delivery')}</span>
        </button>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2.5">
        {/* Language Switcher */}
        <button
          type="button"
          onClick={toggleLanguage}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-white/[0.04] dark:hover:bg-white/[0.08] border border-slate-200 dark:border-white/10 text-xs font-bold text-slate-700 dark:text-neutral-300 transition-all cursor-pointer shadow-sm"
          title={t('language')}
        >
          <FiGlobe className="w-3.5 h-3.5 text-primary" />
          <span className="uppercase text-[11px]">{language === 'ar' ? 'EN' : 'عربي'}</span>
        </button>

        {/* Shift Badge */}
        <Link
          to="/dashboard/shift"
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
            hasActiveShift
              ? 'bg-emerald-500/10 hover:bg-emerald-500/20 border-emerald-500/30 text-emerald-600 dark:text-emerald-400'
              : 'bg-amber-500/10 hover:bg-amber-500/20 border-amber-500/30 text-amber-600 dark:text-amber-400'
          }`}
          title={hasActiveShift ? t('shift_active_tooltip') : t('shift_inactive_tooltip')}
        >
          {hasActiveShift ? (
            <>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>{t('shift_active')}</span>
            </>
          ) : (
            <>
              <FiClock className="w-3.5 h-3.5" />
              <span>{t('open_shift')}</span>
            </>
          )}
        </Link>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer"
          title={theme === 'dark' ? t('light_mode') : t('dark_mode')}
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
            className="flex items-center gap-3 pr-2 border-r border-slate-200 dark:border-slate-700 hover:opacity-80 transition-opacity cursor-pointer"
            title={t('profile')}
          >
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center text-white text-sm font-bold shadow-lg shadow-primary/25">
              {user.name?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <div className="hidden sm:block text-right">
              <p className="text-sm font-medium text-slate-900 dark:text-white leading-tight">
                {user.name}
              </p>
              <p className="text-xs text-slate-400 dark:text-slate-500">
                {t('cashier')}
              </p>
            </div>
          </Link>
        )}

        {/* Logout */}
        <button
          onClick={logout}
          className="p-2.5 rounded-xl text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors cursor-pointer"
          title={t('logout')}
        >
          <FiLogOut className="w-5 h-5" />
        </button>
      </div>
    </header>
  );
};

export default Header;
