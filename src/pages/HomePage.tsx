import React, { useState } from 'react';
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
  FiX,
} from 'react-icons/fi';
import { FaWhatsapp, FaFacebookF, FaInstagram, FaPhone } from 'react-icons/fa6';
import { useBusinessSetup } from '../hooks/useBusinessSetup';

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { business, logoUrl, hasBusinessData } = useBusinessSetup();
  const [isTableCodeModalOpen, setIsTableCodeModalOpen] = useState(false);
  const [tableCodeInput, setTableCodeInput] = useState('');

  // Helper to format whatsapp link
  const getWhatsAppLink = (whats?: string | null, phone?: string | null) => {
    const raw = whats || phone || '';
    const cleaned = raw.replace(/[^0-9]/g, '');
    if (!cleaned) return null;
    return `https://wa.me/${cleaned}`;
  };

  // Helper to format social links
  const formatSocialLink = (url?: string | null, platform?: 'fb' | 'insta') => {
    if (!url) return null;
    const trimmed = url.trim();
    if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
      return trimmed;
    }
    if (platform === 'fb') {
      return `https://facebook.com/${trimmed.replace(/^@/, '')}`;
    }
    if (platform === 'insta') {
      return `https://instagram.com/${trimmed.replace(/^@/, '')}`;
    }
    return `https://${trimmed}`;
  };

  const whatsappUrl = getWhatsAppLink(business?.whats, business?.phone);
  const facebookUrl = formatSocialLink(business?.face, 'fb');
  const instagramUrl = formatSocialLink(business?.instagram, 'insta');

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
            {logoUrl ? (
              <div className="relative w-10 h-10 rounded-xl bg-white/[0.04] border border-white/10 p-1 flex items-center justify-center overflow-hidden shadow-lg shadow-primary/20">
                <img
                  src={logoUrl}
                  alt={business?.name || 'Store Logo'}
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              </div>
            ) : (
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-primary to-indigo-600 flex items-center justify-center shadow-lg shadow-primary/20">
                <FiShoppingBag className="w-5 h-5 text-white" />
              </div>
            )}
            <div>
              <span className="text-lg font-black tracking-tight text-white flex items-center gap-1.5">
                {business?.name ? (
                  <span>{business.name}</span>
                ) : (
                  <>
                    POS <span className="text-primary font-normal">SYSTEM</span>
                  </>
                )}
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
        {/* Business Showcase Card (Only shown if data exists, otherwise kept blank) */}
        {hasBusinessData && (
          <div className="w-full max-w-2xl mb-10 p-6 sm:p-8 rounded-3xl bg-gradient-to-b from-white/[0.06] to-white/[0.02] border border-white/10 backdrop-blur-xl shadow-2xl relative overflow-hidden text-center animate-in fade-in duration-500">
            <div className="absolute top-0 right-0 w-60 h-60 bg-primary/10 rounded-full blur-3xl pointer-events-none" />

            {/* Business Logo */}
            {logoUrl && (
              <div className="relative inline-flex items-center justify-center mb-4">
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-primary to-indigo-500 blur-xl opacity-40 animate-pulse-soft" />
                <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-[#0e0e12] border border-white/15 p-2 shadow-xl flex items-center justify-center overflow-hidden">
                  <img
                    src={logoUrl}
                    alt={business?.name || 'Logo'}
                    className="w-full h-full object-contain"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                </div>
              </div>
            )}

            {/* Business Name */}
            {business?.name && (
              <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight mb-2">
                {business.name}
              </h1>
            )}

            {/* Business Description */}
            {business?.description && (
              <p className="text-sm sm:text-base text-neutral-300 max-w-xl mx-auto leading-relaxed mb-6">
                {business.description}
              </p>
            )}

            {/* Social & Contact Actions */}
            <div className="flex flex-wrap items-center justify-center gap-2.5 sm:gap-3 pt-2">
              {business?.phone && (
                <a
                  href={`tel:${business.phone}`}
                  className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 text-xs sm:text-sm font-semibold text-neutral-200 hover:text-white transition-all shadow-sm"
                  title="اتصال هاتفياً"
                >
                  <FaPhone className="w-3.5 h-3.5 text-primary" />
                  <span dir="ltr">{business.phone}</span>
                </a>
              )}

              {whatsappUrl && (
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 text-xs sm:text-sm font-semibold text-emerald-400 transition-all shadow-sm"
                  title="تواصل عبر واتساب"
                >
                  <FaWhatsapp className="w-4 h-4 text-emerald-400" />
                  <span>واتساب</span>
                </a>
              )}

              {facebookUrl && (
                <a
                  href={facebookUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20 text-xs sm:text-sm font-semibold text-blue-400 transition-all shadow-sm"
                  title="صفحة فيسبوك"
                >
                  <FaFacebookF className="w-3.5 h-3.5 text-blue-400" />
                  <span>فيسبوك</span>
                </a>
              )}

              {instagramUrl && (
                <a
                  href={instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-pink-500/10 hover:bg-pink-500/20 border border-pink-500/20 text-xs sm:text-sm font-semibold text-pink-400 transition-all shadow-sm"
                  title="حساب انستجرام"
                >
                  <FaInstagram className="w-4 h-4 text-pink-400" />
                  <span>انستجرام</span>
                </a>
              )}
            </div>
          </div>
        )}

        {/* Title & Introduction */}
        <div className="text-center max-w-2xl mb-12 animate-in fade-in zoom-in-95 duration-500">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/[0.04] border border-white/10 text-xs font-bold text-neutral-300 mb-4 shadow-sm">
            <FiZap className="w-3.5 h-3.5 text-amber-400" />
            <span>منظومة متكاملة لنقاط البيع وخدمة الطاولات</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
            مرحباً بك في نظام <span className="text-transparent bg-clip-text bg-gradient-to-l from-primary via-indigo-400 to-primary">POS</span>
          </h2>
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
            onClick={() => {
              setTableCodeInput('');
              setIsTableCodeModalOpen(true);
            }}
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
                  <span>عبر رمز الطاولة (Table Code)</span>
                </div>
              </div>

              {/* Title & Description */}
              <h2 className="text-2xl font-bold text-white mb-2 group-hover:text-emerald-400 transition-colors">
                بوابة طلبات الطاولة
              </h2>
              <p className="text-sm text-neutral-400 leading-relaxed mb-6">
                مسار مباشر ومخصص للزبائن عبر رمز الطاولة المحدد أو مسح QR لاستعراض القائمة وإنشاء الطلب.
              </p>

              {/* Feature Highlights */}
              <div className="space-y-2.5 mb-8 text-xs font-medium text-neutral-300">
                <div className="flex items-center gap-2.5">
                  <FiCheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>دخول مباشر برمز الطاولة الخاص بك</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <FiCheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>فتح الطاولة المحددة تلقائياً</span>
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
                طلب الطاولة عبر الكود
              </span>
              <div className="w-9 h-9 rounded-xl bg-white/[0.04] border border-white/10 flex items-center justify-center text-neutral-300 group-hover:bg-emerald-500 group-hover:text-white group-hover:border-emerald-500 transition-all">
                <FiArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Table Code Modal Prompt ("اكتب كود عشان تخش") */}
      {isTableCodeModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
          onClick={() => setIsTableCodeModalOpen(false)}
        >
          <div
            className="relative w-full max-w-md rounded-3xl bg-[#101014] border border-white/15 p-6 sm:p-8 shadow-2xl shadow-black text-center animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={() => setIsTableCodeModalOpen(false)}
              className="absolute top-4 left-4 w-8 h-8 rounded-full bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 flex items-center justify-center text-neutral-400 hover:text-white transition-colors cursor-pointer"
              title="إغلاق"
            >
              <FiX className="w-4 h-4" />
            </button>

            <div className="w-16 h-16 mx-auto rounded-2xl bg-emerald-500/15 border border-emerald-500/25 flex items-center justify-center text-emerald-400 shadow-lg shadow-emerald-500/10 mb-4">
              <FiCoffee className="w-8 h-8" />
            </div>

            <h3 className="text-2xl font-black text-white tracking-tight mb-2">
              اكتب كود عشان تخش
            </h3>
            <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed mb-6">
              يرجى إدخال رمز الطاولة الموضح على طاولتك (أو مسح رمز QR) للوصول لقائمة الطعام والطلب.
            </p>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                const code = tableCodeInput.trim();
                if (code) {
                  setIsTableCodeModalOpen(false);
                  navigate(`/table/${encodeURIComponent(code)}`);
                }
              }}
              className="space-y-4"
            >
              <div className="text-right">
                <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                  رمز الطاولة (Table Code)
                </label>
                <input
                  type="text"
                  value={tableCodeInput}
                  onChange={(e) => setTableCodeInput(e.target.value)}
                  placeholder="اكتب رمز الطاولة هنا..."
                  autoFocus
                  required
                  dir="ltr"
                  className="w-full px-4 py-3.5 rounded-xl bg-white/[0.05] border border-white/15 text-white text-sm font-mono focus:outline-none focus:border-emerald-500 transition-all text-center tracking-wider placeholder:text-neutral-600"
                />
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="submit"
                  disabled={!tableCodeInput.trim()}
                  className="flex-1 py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-40 disabled:cursor-not-allowed text-black font-bold text-sm shadow-lg shadow-emerald-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>دخول إلى قائمة الطعام</span>
                  <FiArrowLeft className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setIsTableCodeModalOpen(false)}
                  className="px-5 py-3.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 text-neutral-300 hover:text-white font-semibold text-sm transition-all cursor-pointer"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="relative z-10 w-full border-t border-white/5 py-6 text-center text-xs text-neutral-500">
        <p>
          جميع الحقوق محفوظة &copy; {new Date().getFullYear()} {business?.name || 'POS System'}
        </p>
      </footer>
    </div>
  );
};

export default HomePage;
