import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FiMonitor,
  FiCoffee,
  FiArrowLeft,
  FiLock,
  FiGlobe,
  FiCheckCircle,
  FiShoppingBag,
  FiZap,
} from 'react-icons/fi';

const HomePage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div
      className="min-h-screen relative flex flex-col justify-between bg-[#070709] text-white overflow-x-hidden selection:bg-primary selection:text-white"
      dir="rtl"
    >
      {/* Ambient Animated Lights */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Top-Right Ambient Glow */}
        <div className="absolute -top-32 -right-32 w-[500px] h-[500px] bg-primary/15 rounded-full blur-[140px] animate-pulse-soft" />

        {/* Bottom-Left Ambient Glow */}
        <div
          className="absolute -bottom-32 -left-32 w-[500px] h-[500px] bg-indigo-600/15 rounded-full blur-[140px] animate-pulse-soft"
          style={{ animationDelay: '3s' }}
        />

        {/* Center Soft Accent */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-violet-600/5 rounded-full blur-[160px]" />

        {/* Subtle grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `radial-gradient(rgba(255, 255, 255, 0.5) 1px, transparent 1px)`,
            backgroundSize: '28px 28px',
          }}
        />
      </div>

      {/* Top Navbar */}
      <header className="relative z-10 w-full border-b border-white/5 backdrop-blur-md bg-black/20 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-primary to-indigo-600 flex items-center justify-center shadow-lg shadow-primary/20">
              <FiShoppingBag className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="text-lg font-black tracking-tight text-white flex items-center gap-1.5">
                POS <span className="text-primary font-normal">SYSTEM</span>
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs font-semibold text-neutral-400 bg-white/[0.03] border border-white/10 px-3 py-1.5 rounded-full">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>النظام متصل ويعمل</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 flex-1 max-w-5xl mx-auto px-4 py-12 sm:py-16 flex flex-col items-center justify-center w-full">
        {/* Title & Introduction */}
        <div className="text-center max-w-2xl mb-12 animate-in fade-in zoom-in-95 duration-500">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/[0.04] border border-white/10 text-xs font-bold text-neutral-300 mb-4 shadow-sm">
            <FiZap className="w-3.5 h-3.5 text-amber-400" />
            <span>منظومة متكاملة لنقاط البيع وخدمة الطاولات</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
            مرحباً بك في نظام <span className="text-transparent bg-clip-text bg-gradient-to-l from-primary via-indigo-400 to-primary">POS</span>
          </h1>
          <p className="text-base sm:text-lg text-neutral-400 mt-3 leading-relaxed">
            يرجى تحديد بوابة الاستخدام للمتابعة إلى المسار المناسب
          </p>
        </div>

        {/* The Two Action Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 w-full">
          {/* Card 1: Cashier Route (Protected) */}
          <div
            onClick={() => navigate('/dashboard')}
            className="group relative rounded-3xl bg-[#101014]/90 border border-white/10 hover:border-primary/50 p-8 flex flex-col justify-between transition-all duration-300 hover:-translate-y-1.5 hover:shadow-2xl hover:shadow-primary/10 cursor-pointer overflow-hidden backdrop-blur-xl"
          >
            {/* Top Glowing Ambient in Card */}
            <div className="absolute top-0 right-0 w-44 h-44 bg-primary/10 rounded-full blur-3xl group-hover:bg-primary/20 transition-colors pointer-events-none" />

            <div>
              {/* Header inside Card */}
              <div className="flex items-center justify-between mb-6">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-primary/20 to-indigo-500/10 border border-primary/30 flex items-center justify-center text-primary group-hover:scale-110 transition-transform duration-300 shadow-lg shadow-primary/10">
                  <FiMonitor className="w-7 h-7" />
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-bold">
                  <FiLock className="w-3.5 h-3.5" />
                  <span>محمي (تسجيل دخول)</span>
                </div>
              </div>

              {/* Title & Description */}
              <h2 className="text-2xl font-bold text-white mb-2 group-hover:text-primary transition-colors">
                بوابة الكاشير والمبيعات
              </h2>
              <p className="text-sm text-neutral-400 leading-relaxed mb-6">
                المسار المخصص لموظفي الكاشير لإدارة الفواتير اليومية، سلة المشتريات، الدفع، والورديات.
              </p>

              {/* Feature Highlights */}
              <div className="space-y-2.5 mb-8 text-xs font-medium text-neutral-300">
                <div className="flex items-center gap-2.5">
                  <FiCheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>لوحة تحكم الكاشير ونقاط البيع</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <FiCheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>إدارة الورديات وفتح الصندوق</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <FiCheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>إتمام الدفع وطباعة الفواتير</span>
                </div>
              </div>
            </div>

            {/* Action Button */}
            <div className="pt-4 border-t border-white/5 flex items-center justify-between">
              <span className="text-sm font-bold text-white group-hover:text-primary transition-colors">
                الدخول لنظام الكاشير
              </span>
              <div className="w-9 h-9 rounded-xl bg-white/[0.04] border border-white/10 flex items-center justify-center text-neutral-300 group-hover:bg-primary group-hover:text-white group-hover:border-primary transition-all">
                <FiArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
              </div>
            </div>
          </div>

          {/* Card 2: Table Route (Public) */}
          <div
            onClick={() => navigate('/table')}
            className="group relative rounded-3xl bg-[#101014]/90 border border-white/10 hover:border-emerald-500/50 p-8 flex flex-col justify-between transition-all duration-300 hover:-translate-y-1.5 hover:shadow-2xl hover:shadow-emerald-500/10 cursor-pointer overflow-hidden backdrop-blur-xl"
          >
            {/* Top Glowing Ambient in Card */}
            <div className="absolute top-0 right-0 w-44 h-44 bg-emerald-500/10 rounded-full blur-3xl group-hover:bg-emerald-500/20 transition-colors pointer-events-none" />

            <div>
              {/* Header inside Card */}
              <div className="flex items-center justify-between mb-6">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-500/20 to-teal-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform duration-300 shadow-lg shadow-emerald-500/10">
                  <FiCoffee className="w-7 h-7" />
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold">
                  <FiGlobe className="w-3.5 h-3.5" />
                  <span>عام ومباشر (بدون تسجيل)</span>
                </div>
              </div>

              {/* Title & Description */}
              <h2 className="text-2xl font-bold text-white mb-2 group-hover:text-emerald-400 transition-colors">
                بوابة طلبات الطاولة
              </h2>
              <p className="text-sm text-neutral-400 leading-relaxed mb-6">
                مسار عام ومباشر للزبائن وخدمة الطاولات لاستعراض قائمة الطعام واختيار الطاولة وإنشاء الطلب.
              </p>

              {/* Feature Highlights */}
              <div className="space-y-2.5 mb-8 text-xs font-medium text-neutral-300">
                <div className="flex items-center gap-2.5">
                  <FiCheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>دخول فوري ومباشر دون حساب</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <FiCheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>تحديد رقم الصالة والطاولة</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <FiCheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>استعراض المنيو والطلبات الذاتية</span>
                </div>
              </div>
            </div>

            {/* Action Button */}
            <div className="pt-4 border-t border-white/5 flex items-center justify-between">
              <span className="text-sm font-bold text-white group-hover:text-emerald-400 transition-colors">
                بدء خدمة الطاولات (/table)
              </span>
              <div className="w-9 h-9 rounded-xl bg-white/[0.04] border border-white/10 flex items-center justify-center text-neutral-300 group-hover:bg-emerald-500 group-hover:text-white group-hover:border-emerald-500 transition-all">
                <FiArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 w-full border-t border-white/5 py-6 text-center text-xs text-neutral-500">
        <p>جميع الحقوق محفوظة &copy; {new Date().getFullYear()} POS System</p>
      </footer>
    </div>
  );
};

export default HomePage;
