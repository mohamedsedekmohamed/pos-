import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useBusinessSetup } from '../../hooks/useBusinessSetup';
import {
  FiMapPin,
  FiLock,
  FiLogIn,
  FiEye,
  FiEyeOff,
  FiLayers,
  FiArrowRight,
  FiUser,
} from 'react-icons/fi';

export const BranchLoginPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const { business, logoUrl } = useBusinessSetup();

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
      // Branch login strictly sends guard: 'branch'
      await login({ name: name.trim(), password, guard: 'branch' });
      navigate('/branches', { replace: true });
    } catch (err: unknown) {
      const axiosError = err as { response?: { data?: { message?: string } } };
      setError(
        axiosError.response?.data?.message ||
          'فشل تسجيل الدخول لحساب الفرع. يرجى التحقق من صحة اسم المستخدم وكلمة المرور.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen relative flex items-center justify-center bg-[#07070a] text-white p-4 overflow-hidden select-none"
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

      {/* Ambient Lighting Background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-32 -right-32 w-96 h-96 bg-emerald-600/20 rounded-full blur-[120px] animate-pulse-soft" />
        <div
          className="absolute -bottom-32 -left-32 w-96 h-96 bg-primary/20 rounded-full blur-[120px] animate-pulse-soft"
          style={{ animationDelay: '2.5s' }}
        />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-teal-600/10 rounded-full blur-[150px] pointer-events-none" />
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `radial-gradient(rgba(255, 255, 255, 0.4) 1px, transparent 1px)`,
            backgroundSize: '24px 24px',
          }}
        />
      </div>

      {/* Login Card Container */}
      <div className="relative w-full max-w-md z-10">
        {/* Brand Header */}
        <div className="text-center mb-7">
          <div className="relative inline-flex items-center justify-center mb-3 group">
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-emerald-500 to-primary blur-xl opacity-60 group-hover:opacity-100 transition-opacity animate-pulse-soft" />
            <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#121216] to-[#1a1e24] border border-white/15 flex items-center justify-center shadow-2xl overflow-hidden p-2">
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
                <FiMapPin className="w-8 h-8 text-emerald-400 drop-shadow-[0_0_12px_rgba(16,185,129,0.5)]" />
              )}
            </div>
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-xs font-bold mb-2">
            <FiLayers className="w-3.5 h-3.5" />
            <span>بوابة الفرع • Branch Portal</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            تسجيل دخول الفرع
          </h1>
          <p className="text-xs sm:text-sm text-neutral-400 mt-1">
            سجّل دخول حساب الفرع للوصول إلى إدارة الفروع والـ APIs
          </p>
        </div>

        {/* Card Body */}
        <div className="relative rounded-3xl bg-[#101014]/85 backdrop-blur-2xl border border-white/10 p-7 sm:p-8 shadow-2xl shadow-black/80">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Error Alert */}
            {error && (
              <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs sm:text-sm font-medium flex items-center gap-2 animate-in fade-in duration-300">
                <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-ping" />
                <span>{error}</span>
              </div>
            )}

            {/* Branch Username */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-neutral-300">
                اسم مستخدم الفرع (User Name)
              </label>
              <div className="relative group">
                <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-400 group-focus-within:text-emerald-400 transition-colors pointer-events-none">
                  <FiMapPin className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="مثال: branch_maadi"
                  required
                  autoFocus
                  dir="ltr"
                  className="w-full pr-10 pl-4 py-3.5 rounded-xl bg-white/[0.04] border border-white/10 text-white placeholder-neutral-500 text-sm focus:outline-none focus:border-emerald-500 focus:bg-white/[0.07] focus:ring-2 focus:ring-emerald-500/20 transition-all font-mono"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-neutral-300">
                كلمة المرور (Password)
              </label>
              <div className="relative group">
                <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-400 group-focus-within:text-emerald-400 transition-colors pointer-events-none">
                  <FiLock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  dir="ltr"
                  className="w-full pr-10 pl-11 py-3.5 rounded-xl bg-white/[0.04] border border-white/10 text-white placeholder-neutral-500 text-sm focus:outline-none focus:border-emerald-500 focus:bg-white/[0.07] focus:ring-2 focus:ring-emerald-500/20 transition-all font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white transition-colors cursor-pointer p-0.5"
                  title={showPassword ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور'}
                >
                  {showPassword ? <FiEyeOff className="w-4 h-4" /> : <FiEye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="relative w-full mt-3 py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-extrabold text-sm shadow-lg shadow-emerald-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed group overflow-hidden"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <FiLogIn className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
                  <span>دخول حساب الفرع</span>
                </>
              )}
            </button>
          </form>

          {/* Switch to Cashier Login */}
          <div className="mt-6 pt-5 border-t border-white/10 text-center">
            <p className="text-xs text-neutral-400 mb-2">
              هل أنت موظف كاشير وتريد فتح الوردية ونقطة البيع؟
            </p>
            <Link
              to="/login"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:text-primary-light hover:underline transition-colors cursor-pointer"
            >
              <FiUser className="w-3.5 h-3.5" />
              <span>الانتقال لتسجيل دخول الكاشير (Cashier Login) &larr;</span>
            </Link>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-neutral-500 mt-6 font-mono">
          Branch Role Authenticated • guard: branch
        </p>
      </div>
    </div>
  );
};

export default BranchLoginPage;
