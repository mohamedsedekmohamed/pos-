import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { FiUser, FiMail, FiLogOut, FiSun, FiMoon, FiCheck, FiArrowRight, FiType, FiDroplet } from 'react-icons/fi';
import { renderName } from '../../utils/helpers';
import { Link, useLocation } from 'react-router-dom';

const colors = [
  { id: 'blue', color: '#3b82f6', name: 'أزرق' },
  { id: 'green', color: '#10b981', name: 'أخضر' },
  { id: 'red', color: '#ef4444', name: 'أحمر' },
  { id: 'purple', color: '#8b5cf6', name: 'بنفسجي' },
  { id: 'orange', color: '#f97316', name: 'برتقالي' },
  { id: 'teal', color: '#14b8a6', name: 'فيروزي' },
] as const;

const fontSizes = [
  { id: 'small', label: 'ص', desc: 'صغير' },
  { id: 'medium', label: 'م', desc: 'متوسط' },
  { id: 'large', label: 'ك', desc: 'كبير' },
] as const;

interface ProfilePageProps {
  backTo?: string;
}

const ProfilePage: React.FC<ProfilePageProps> = ({ backTo }) => {
  const { user, logout } = useAuth();
  const { theme, setTheme, themeColor, setThemeColor, fontSize, setFontSize } = useTheme();
  const location = useLocation();

  const resolvedBack = backTo || (location.pathname.startsWith('/table') ? '/table' : '/dashboard');

  return (
    <div className="min-h-screen w-full bg-slate-50 dark:bg-black text-slate-900 dark:text-white transition-colors" dir="rtl">
      <div className="max-w-6xl mx-auto pb-12 p-4 sm:p-6">
        {/* Header / Back Button */}
        <div className="flex items-center gap-4 mb-8">
          <Link 
            to={resolvedBack} 
            className="w-12 h-12 flex items-center justify-center rounded-2xl bg-white dark:bg-[#111111] text-slate-500 dark:text-neutral-300 hover:text-primary dark:hover:text-primary shadow-sm border border-slate-200/60 dark:border-white/10 hover:shadow-md transition-all cursor-pointer"
            title="الرجوع"
          >
            <FiArrowRight className="w-6 h-6" />
          </Link>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">إعدادات الحساب</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: User Profile (lg:col-span-4) */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white dark:bg-[#111111] rounded-[2rem] p-1.5 shadow-sm border border-slate-200/60 dark:border-white/10 overflow-hidden relative group">
              {/* Cover Banner */}
              <div className="h-36 bg-gradient-to-br from-primary via-primary-dark to-black rounded-t-[1.75rem] relative overflow-hidden">
                <div className="absolute inset-0 bg-white/10 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              </div>
              
              {/* Avatar */}
              <div className="px-6 pb-6 flex flex-col items-center text-center relative -mt-16">
                <div className="w-32 h-32 rounded-full bg-white dark:bg-[#111111] p-2 shadow-2xl mb-5 relative z-10">
                  <div className="w-full h-full rounded-full bg-primary/10 dark:bg-white/[0.05] flex items-center justify-center text-primary dark:text-primary text-5xl font-bold">
                    {user?.name?.charAt(0)?.toUpperCase() || <FiUser />}
                  </div>
                </div>
                
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                  {user ? renderName(user.name) : 'خدمة الطاولات'}
                </h2>
                <span className="px-5 py-2 bg-primary/10 text-primary rounded-2xl text-sm font-bold mb-8 shadow-inner">
                  {user?.role || 'جلسة طاولات عامة'}
                </span>
                
                {user?.email ? (
                  <div className="w-full bg-slate-50 dark:bg-white/[0.03] rounded-2xl p-4 mb-6 flex items-center gap-4 text-left border border-slate-100 dark:border-white/5">
                    <div className="w-12 h-12 rounded-xl bg-white dark:bg-white/[0.06] flex items-center justify-center text-slate-400 shadow-sm shrink-0">
                      <FiMail className="w-6 h-6" />
                    </div>
                    <div className="flex-1 min-w-0 overflow-hidden text-right">
                      <p className="text-xs text-slate-400 font-medium mb-1">البريد الإلكتروني</p>
                      <p className="text-sm font-bold text-slate-700 dark:text-slate-300 truncate" dir="ltr">{user.email}</p>
                    </div>
                  </div>
                ) : (
                  <div className="w-full bg-slate-50 dark:bg-white/[0.03] rounded-2xl p-4 mb-6 text-center border border-slate-100 dark:border-white/5">
                    <p className="text-xs text-slate-400">
                      يمكنك ضبط تفضيلات المظهر والخط والألوان لنظام الطاولات من هنا
                    </p>
                  </div>
                )}

                {user ? (
                  <button
                    onClick={logout}
                    className="w-full py-4 rounded-2xl bg-red-50 dark:bg-red-500/10 text-red-600 hover:bg-red-500 hover:text-white dark:hover:bg-red-500 transition-all font-bold text-base flex items-center justify-center gap-2 group cursor-pointer"
                  >
                    <FiLogOut className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                    تسجيل الخروج
                  </button>
                ) : (
                  <Link
                    to="/login"
                    className="w-full py-4 rounded-2xl bg-primary/10 hover:bg-primary text-primary hover:text-white transition-all font-bold text-base flex items-center justify-center gap-2 group cursor-pointer"
                  >
                    <FiUser className="w-5 h-5" />
                    تسجيل دخول موظف
                  </Link>
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Settings (lg:col-span-8) */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* Appearance Section */}
            <div className="bg-white dark:bg-[#111111] rounded-[2rem] p-8 shadow-sm border border-slate-200/60 dark:border-white/10 transition-all hover:shadow-md">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-14 h-14 rounded-2xl bg-amber-50 dark:bg-amber-500/10 flex items-center justify-center text-amber-500">
                  <FiSun className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white">المظهر العام</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">اختر وضع الإضاءة المناسب لعينيك</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => setTheme('light')}
                  className={`relative overflow-hidden flex flex-col items-center justify-center gap-4 p-6 rounded-2xl border-2 transition-all cursor-pointer ${
                    theme === 'light'
                      ? 'border-primary bg-primary/10 text-primary shadow-sm ring-4 ring-primary/10'
                      : 'border-slate-100 dark:border-white/10 dark:bg-white/[0.02] text-slate-500 dark:text-neutral-400 hover:border-slate-300 dark:hover:border-white/20'
                  }`}
                >
                  {theme === 'light' && <div className="absolute top-4 left-4 w-2.5 h-2.5 rounded-full bg-primary animate-pulse"></div>}
                  <FiSun className={`w-10 h-10 ${theme === 'light' ? 'text-amber-500' : ''}`} />
                  <span className="font-bold text-lg">الوضع الفاتح</span>
                </button>
                
                <button
                  onClick={() => setTheme('dark')}
                  className={`relative overflow-hidden flex flex-col items-center justify-center gap-4 p-6 rounded-2xl border-2 transition-all cursor-pointer ${
                    theme === 'dark'
                      ? 'border-primary bg-primary/10 text-primary shadow-sm ring-4 ring-primary/10'
                      : 'border-slate-100 dark:border-white/10 dark:bg-white/[0.02] text-slate-500 dark:text-neutral-400 hover:border-slate-300 dark:hover:border-white/20'
                  }`}
                >
                  {theme === 'dark' && <div className="absolute top-4 left-4 w-2.5 h-2.5 rounded-full bg-primary animate-pulse"></div>}
                  <FiMoon className={`w-10 h-10 ${theme === 'dark' ? 'text-primary' : ''}`} />
                  <span className="font-bold text-lg">الوضع الداكن</span>
                </button>
              </div>
            </div>

            {/* Accent Color Section */}
            <div className="bg-white dark:bg-[#111111] rounded-[2rem] p-8 shadow-sm border border-slate-200/60 dark:border-white/10 transition-all hover:shadow-md">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-14 h-14 rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                  <FiDroplet className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white">اللون الأساسي</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">قم بتخصيص لون النظام حسب رغبتك</p>
                </div>
              </div>

              <div className="grid grid-cols-3 sm:grid-cols-6 gap-6">
                {colors.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => setThemeColor(c.id as any)}
                    title={c.name}
                    className={`group relative flex flex-col items-center gap-3 cursor-pointer transition-transform ${themeColor === c.id ? '-translate-y-2' : 'hover:-translate-y-1'}`}
                  >
                    <div
                      className={`w-16 h-16 rounded-3xl flex items-center justify-center transition-all shadow-sm ${
                        themeColor === c.id ? 'ring-4 ring-offset-4 ring-offset-white dark:ring-offset-[#111111]' : 'opacity-80 hover:opacity-100 hover:shadow-md'
                      }`}
                      style={{ 
                        backgroundColor: c.color,
                        '--tw-ring-color': c.color 
                      } as React.CSSProperties}
                    >
                      {themeColor === c.id && <FiCheck className="text-white w-7 h-7 animate-in zoom-in duration-300" />}
                    </div>
                    <span className={`text-xs font-bold transition-colors ${themeColor === c.id ? 'text-slate-900 dark:text-white' : 'text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300'}`}>
                      {c.name}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Typography Section */}
            <div className="bg-white dark:bg-[#111111] rounded-[2rem] p-8 shadow-sm border border-slate-200/60 dark:border-white/10 transition-all hover:shadow-md">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-14 h-14 rounded-2xl bg-purple-50 dark:bg-purple-500/10 flex items-center justify-center text-purple-500">
                  <FiType className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white">حجم النصوص</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">اضبط حجم الخط ليتناسب مع شاشتك</p>
                </div>
              </div>

              <div className="flex items-center gap-3 bg-slate-50 dark:bg-white/[0.03] p-2.5 rounded-3xl border border-slate-100 dark:border-white/10">
                {fontSizes.map((fs) => (
                  <button
                    key={fs.id}
                    onClick={() => setFontSize(fs.id as any)}
                    className={`flex-1 py-5 rounded-2xl flex flex-col items-center gap-2 transition-all cursor-pointer ${
                      fontSize === fs.id
                        ? 'bg-white dark:bg-[#1a1a20] shadow-md text-primary dark:text-primary border border-slate-100 dark:border-white/10'
                        : 'text-slate-500 hover:bg-slate-200/50 dark:hover:bg-white/[0.05] border border-transparent'
                    }`}
                  >
                    <span className={`font-black ${fs.id === 'small' ? 'text-lg' : fs.id === 'medium' ? 'text-2xl' : 'text-3xl'}`}>
                      {fs.label}
                    </span>
                    <span className={`text-sm font-bold ${fontSize === fs.id ? 'text-primary dark:text-primary' : 'text-slate-400'}`}>
                      {fs.desc}
                    </span>
                  </button>
                ))}
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
