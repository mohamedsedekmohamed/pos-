import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  FiUser,
  FiLock,
  FiLogIn,
  FiEye,
  FiEyeOff,
  FiShoppingBag,
  FiCreditCard,
  FiCoffee,
  FiTag,
  FiShield,
  FiZap,
  FiLayers,
  FiArrowRight,
} from 'react-icons/fi';

const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await login({ name, password, guard: 'cashier_man' });
      navigate('/dashboard', { replace: true });
    } catch (err: unknown) {
      const axiosError = err as { response?: { data?: { message?: string } } };
      setError(axiosError.response?.data?.message || 'فشل تسجيل الدخول. تحقق من صحة البيانات.');
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
      {/* Dynamic Animated Ambient Background Orbs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Top-Left Orb */}
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-indigo-600/20 rounded-full blur-[120px] animate-pulse-soft" />

        {/* Bottom-Right Orb */}
        <div
          className="absolute -bottom-32 -right-32 w-96 h-96 bg-primary/20 rounded-full blur-[120px] animate-pulse-soft"
          style={{ animationDelay: '2.5s' }}
        />

        {/* Center Accent Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-violet-600/10 rounded-full blur-[140px] pointer-events-none" />

        {/* Grid pattern overlay */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `radial-gradient(rgba(255, 255, 255, 0.4) 1px, transparent 1px)`,
            backgroundSize: '24px 24px',
          }}
        />
      </div>

      {/* Floating Animated Retail & POS Icons (Ambient) */}
      <div className="absolute inset-0 pointer-events-none hidden md:block">
        {/* Icon 1: Shopping Bag */}
        <div className="absolute top-[18%] right-[14%] p-3.5 rounded-2xl bg-white/[0.03] border border-white/[0.08] backdrop-blur-md shadow-xl text-primary animate-float-gentle">
          <FiShoppingBag className="w-6 h-6" />
        </div>

        {/* Icon 2: Credit Card */}
        <div
          className="absolute bottom-[22%] right-[16%] p-3.5 rounded-2xl bg-white/[0.03] border border-white/[0.08] backdrop-blur-md shadow-xl text-indigo-400 animate-float-reverse"
          style={{ animationDelay: '1s' }}
        >
          <FiCreditCard className="w-6 h-6" />
        </div>

        {/* Icon 3: Coffee */}
        <div
          className="absolute top-[24%] left-[14%] p-3.5 rounded-2xl bg-white/[0.03] border border-white/[0.08] backdrop-blur-md shadow-xl text-amber-400 animate-float-reverse"
          style={{ animationDelay: '2s' }}
        >
          <FiCoffee className="w-6 h-6" />
        </div>

        {/* Icon 4: Tag */}
        <div
          className="absolute bottom-[20%] left-[16%] p-3.5 rounded-2xl bg-white/[0.03] border border-white/[0.08] backdrop-blur-md shadow-xl text-emerald-400 animate-float-gentle"
          style={{ animationDelay: '3s' }}
        >
          <FiTag className="w-6 h-6" />
        </div>
      </div>

      {/* Login Container */}
      <div className="relative w-full max-w-md z-10">
        {/* Animated Brand Header */}
        <div className="text-center mb-7">
          <div className="relative inline-flex items-center justify-center mb-3 group">
            {/* Animated Glow Halo */}
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-primary to-violet-600 blur-xl opacity-60 group-hover:opacity-100 transition-opacity animate-pulse-soft" />

            {/* Icon Box */}
            <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#121216] to-[#1e1e24] border border-white/15 flex items-center justify-center shadow-2xl animate-float-gentle">
              <FiShoppingBag className="w-8 h-8 text-primary drop-shadow-[0_0_12px_var(--color-primary)]" />
            </div>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            نظام نقطة البيع <span className="text-primary">POS</span>
          </h1>
          <p className="text-sm text-neutral-400 mt-1">
            سجّل دخولك للوصول إلى لوحة المبيعات
          </p>
        </div>

        {/* Glassmorphism Card */}
        <div className="relative rounded-3xl bg-[#101014]/80 backdrop-blur-2xl border border-white/10 p-7 sm:p-8 shadow-2xl shadow-black/80">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Error Message */}
            {error && (
              <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-medium flex items-center gap-2 animate-in fade-in duration-300">
                <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-ping" />
                {error}
              </div>
            )}

            {/* Username Field */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-neutral-300">
                اسم المستخدم
              </label>
              <div className="relative group">
                <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-400 group-focus-within:text-primary transition-colors pointer-events-none">
                  <FiUser className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="أدخل اسم المستخدم..."
                  required
                  className="w-full pr-10 pl-4 py-3 rounded-xl bg-white/[0.04] border border-white/10 text-white placeholder-neutral-500 text-sm focus:outline-none focus:border-primary focus:bg-white/[0.07] focus:ring-2 focus:ring-primary/20 transition-all"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-neutral-300">
                كلمة المرور
              </label>
              <div className="relative group">
                <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-400 group-focus-within:text-primary transition-colors pointer-events-none">
                  <FiLock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full pr-10 pl-11 py-3 rounded-xl bg-white/[0.04] border border-white/10 text-white placeholder-neutral-500 text-sm focus:outline-none focus:border-primary focus:bg-white/[0.07] focus:ring-2 focus:ring-primary/20 transition-all"
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
              className="relative w-full mt-2 py-3.5 rounded-xl bg-gradient-to-l from-primary to-indigo-600 hover:opacity-95 active:scale-[0.99] text-white font-bold text-sm shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed group overflow-hidden"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <FiLogIn className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
                  <span>تسجيل الدخول</span>
                </>
              )}
            </button>
          </form>

          {/* Quick System Badges */}
          <div className="mt-6 pt-5 border-t border-white/5 grid grid-cols-3 gap-2 text-center text-[11px] text-neutral-400">
            <div className="flex items-center justify-center gap-1.5 py-1 px-2 rounded-lg bg-white/[0.02]">
              <FiZap className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>فوري وسريع</span>
            </div>
            <div className="flex items-center justify-center gap-1.5 py-1 px-2 rounded-lg bg-white/[0.02]">
              <FiShield className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>مشفر وآمن</span>
            </div>
            <div className="flex items-center justify-center gap-1.5 py-1 px-2 rounded-lg bg-white/[0.02]">
              <FiLayers className="w-3.5 h-3.5 text-primary shrink-0" />
              <span>سحابي متكامل</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-neutral-500 mt-6">
          جميع الحقوق محفوظة &copy; {new Date().getFullYear()} POS System
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
