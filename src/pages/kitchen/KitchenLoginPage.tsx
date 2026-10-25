import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBusinessSetup } from '../../hooks/useBusinessSetup';
import { authApi } from '../../services/authService';
import { setKitchenToken, getKitchenToken } from '../../lib/axios';
import {
  FiUser,
  FiLock,
  FiLogIn,
  FiEye,
  FiEyeOff,
  FiShield,
  FiZap,
  FiLayers,
  FiArrowRight,
} from 'react-icons/fi';
import { GiCookingPot } from 'react-icons/gi';

const KitchenLoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { business, logoUrl } = useBusinessSetup();

  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // If already has kitchen token, redirect
  useEffect(() => {
    if (getKitchenToken()) {
      navigate('/kitchen', { replace: true });
    }
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const result = await authApi.login({
        name: name.trim(),
        password,
        guard: 'kitchen',
      });
      setKitchenToken(result.token);
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('pos_kitchen_user', JSON.stringify(result.user));
      }
      navigate('/kitchen', { replace: true });
    } catch (err: unknown) {
      const axiosError = err as { response?: { data?: { message?: string } } };
      setError(
        axiosError.response?.data?.message ||
          'فشل تسجيل الدخول للمطبخ. يرجى التحقق من صحة البيانات والمحاولة مجدداً.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen relative flex items-center justify-center bg-[#070709] text-white p-4 overflow-hidden select-none"
      dir="rtl"
    >
      {/* Top Back to Home Button */}
      <div className="absolute top-5 right-5 sm:top-6 sm:right-8 z-20">
        <button
          type="button"
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-xs font-bold text-neutral-400 hover:text-white bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 hover:border-white/20 px-3.5 py-2 rounded-xl transition-all cursor-pointer backdrop-blur-md group shadow-lg"
        >
          <FiArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          <span>العودة للرئيسية</span>
        </button>
      </div>

      {/* Animated Ambient Background - Kitchen Theme (Orange/Amber tones) */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-orange-600/20 rounded-full blur-[120px] animate-pulse-soft" />
        <div
          className="absolute -bottom-32 -right-32 w-96 h-96 bg-amber-500/20 rounded-full blur-[120px] animate-pulse-soft"
          style={{ animationDelay: '2.5s' }}
        />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-red-600/8 rounded-full blur-[140px] pointer-events-none" />
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `radial-gradient(rgba(255, 255, 255, 0.4) 1px, transparent 1px)`,
            backgroundSize: '24px 24px',
          }}
        />
      </div>

      {/* Floating Kitchen Icons */}
      <div className="absolute inset-0 pointer-events-none hidden md:block">
        <div className="absolute top-[18%] right-[14%] p-3.5 rounded-2xl bg-white/[0.03] border border-white/[0.08] backdrop-blur-md shadow-xl text-orange-400 animate-float-gentle">
          <GiCookingPot className="w-6 h-6" />
        </div>
        <div
          className="absolute bottom-[22%] right-[16%] p-3.5 rounded-2xl bg-white/[0.03] border border-white/[0.08] backdrop-blur-md shadow-xl text-amber-400 animate-float-reverse"
          style={{ animationDelay: '1s' }}
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.362 5.214A8.252 8.252 0 0112 21 8.25 8.25 0 016.038 7.047 8.287 8.287 0 009 9.601a8.983 8.983 0 013.361-6.867 8.21 8.21 0 003 2.48z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 18a3.75 3.75 0 00.495-7.468 5.99 5.99 0 00-1.925 3.547 5.975 5.975 0 01-2.133-1.001A3.75 3.75 0 0012 18z" />
          </svg>
        </div>
        <div
          className="absolute top-[24%] left-[14%] p-3.5 rounded-2xl bg-white/[0.03] border border-white/[0.08] backdrop-blur-md shadow-xl text-red-400 animate-float-reverse"
          style={{ animationDelay: '2s' }}
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div
          className="absolute bottom-[20%] left-[16%] p-3.5 rounded-2xl bg-white/[0.03] border border-white/[0.08] backdrop-blur-md shadow-xl text-emerald-400 animate-float-gentle"
          style={{ animationDelay: '3s' }}
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
      </div>

      {/* Login Container */}
      <div className="relative w-full max-w-md z-10">
        {/* Brand Header */}
        <div className="text-center mb-6">
          <div className="relative inline-flex items-center justify-center mb-3 group">
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-orange-500 to-red-600 blur-xl opacity-60 group-hover:opacity-100 transition-opacity animate-pulse-soft" />
            <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#121216] to-[#1e1e24] border border-white/15 flex items-center justify-center shadow-2xl animate-float-gentle overflow-hidden p-2">
              {logoUrl ? (
                <img
                  src={logoUrl}
                  alt={business?.name || 'Logo'}
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              ) : (
                <GiCookingPot className="w-8 h-8 text-orange-400 drop-shadow-[0_0_12px_rgba(251,146,60,0.6)]" />
              )}
            </div>
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/25 text-orange-400 text-xs font-bold mb-2">
            <GiCookingPot className="w-3.5 h-3.5" />
            <span>شاشة المطبخ • Kitchen Display</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            تسجيل دخول المطبخ
          </h1>
          <p className="text-xs sm:text-sm text-neutral-400 mt-1">
            سجّل دخولك لعرض الطلبات المطلوب تحضيرها في المطبخ
          </p>
        </div>

        {/* Glassmorphism Card */}
        <div className="relative rounded-3xl bg-[#101014]/85 backdrop-blur-2xl border border-white/10 p-7 sm:p-8 shadow-2xl shadow-black/80">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Error Message */}
            {error && (
              <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs sm:text-sm font-medium flex items-center gap-2 animate-in fade-in duration-300">
                <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-ping" />
                <span>{error}</span>
              </div>
            )}

            {/* Username Field */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-neutral-300">
                اسم مستخدم المطبخ (Username)
              </label>
              <div className="relative group">
                <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-400 group-focus-within:text-orange-400 transition-colors pointer-events-none">
                  <FiUser className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="أدخل اسم مستخدم المطبخ..."
                  required
                  autoFocus
                  className="w-full pr-10 pl-4 py-3.5 rounded-xl bg-white/[0.04] border border-white/10 text-white placeholder-neutral-500 text-sm focus:outline-none focus:border-orange-400 focus:bg-white/[0.07] focus:ring-2 focus:ring-orange-400/20 transition-all font-mono"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-neutral-300">
                كلمة المرور (Password)
              </label>
              <div className="relative group">
                <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-400 group-focus-within:text-orange-400 transition-colors pointer-events-none">
                  <FiLock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full pr-10 pl-11 py-3.5 rounded-xl bg-white/[0.04] border border-white/10 text-white placeholder-neutral-500 text-sm focus:outline-none focus:border-orange-400 focus:bg-white/[0.07] focus:ring-2 focus:ring-orange-400/20 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white transition-colors cursor-pointer p-0.5"
                  title={showPassword ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور'}
                >
                  {showPassword ? (
                    <FiEyeOff className="w-4 h-4" />
                  ) : (
                    <FiEye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="relative w-full mt-2 py-3.5 rounded-xl bg-gradient-to-l from-orange-500 to-red-600 hover:opacity-95 active:scale-[0.99] text-white font-bold text-sm shadow-lg shadow-orange-500/25 hover:shadow-orange-500/40 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed group overflow-hidden"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <FiLogIn className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
                  <span>دخول شاشة المطبخ</span>
                </>
              )}
            </button>
          </form>

          {/* System Badges */}
          <div className="mt-5 grid grid-cols-3 gap-2 text-center text-[11px] text-neutral-400">
            <div className="flex items-center justify-center gap-1.5 py-1 px-2 rounded-lg bg-white/[0.02]">
              <FiZap className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>تحديث تلقائي</span>
            </div>
            <div className="flex items-center justify-center gap-1.5 py-1 px-2 rounded-lg bg-white/[0.02]">
              <FiShield className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>آمن ومشفر</span>
            </div>
            <div className="flex items-center justify-center gap-1.5 py-1 px-2 rounded-lg bg-white/[0.02]">
              <FiLayers className="w-3.5 h-3.5 text-orange-400 shrink-0" />
              <span>عرض مباشر</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-neutral-500 mt-6 font-mono">
          Kitchen Display System • guard: kitchen
        </p>
      </div>
    </div>
  );
};

export default KitchenLoginPage;
