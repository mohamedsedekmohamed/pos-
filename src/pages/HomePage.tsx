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
  FiTruck,
  FiMapPin,
  FiLayers,
  FiUser,
} from 'react-icons/fi';
import { FaWhatsapp, FaFacebookF, FaInstagram, FaPhone } from 'react-icons/fa6';
import { GiCookingPot } from 'react-icons/gi';
import { useBusinessSetup } from '../hooks/useBusinessSetup';
import { getCashierToken, getKitchenToken, getBranchToken } from '../lib/axios';

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

  // Helper to format social links safely (blocks javascript:/data: URIs)
  const formatSocialLink = (url?: string | null, platform?: 'fb' | 'insta') => {
    if (!url) return null;
    const trimmed = url.trim();
    if (/^(javascript|data|vbscript):/i.test(trimmed)) {
      return null;
    }
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

  // Smart portal navigation: check auth directly to avoid intermediate redirects/flickers
  const handlePortalClick = (target: 'order' | 'cashier' | 'kitchen' | 'branches') => {
    switch (target) {
      case 'order':
        navigate('/order');
        break;
      case 'cashier':
        if (getCashierToken()) {
          navigate('/dashboard');
        } else {
          navigate('/login');
        }
        break;
      case 'kitchen':
        if (getKitchenToken()) {
          navigate('/kitchen');
        } else {
          navigate('/kitchen/login');
        }
        break;
      case 'branches':
        if (getBranchToken()) {
          navigate('/branches');
        } else {
          navigate('/branch/login');
        }
        break;
    }
  };

  const portalCards = [
    {
      id: 'order' as const,
      title: 'الطلب والتوصيل أونلاين',
      tag: 'خدمة عامة',
      icon: FiTruck,
      glowColor: 'bg-sky-500',
      topLineGradient: 'from-sky-500 via-blue-500 to-transparent',
      cardBg: 'from-sky-950/20 via-[#10131c]/95 to-[#090b10]',
      cardBorder: 'border-sky-500/20 hover:border-sky-400/60',
      cardShadow: 'hover:shadow-[0_20px_50px_rgba(14,165,233,0.18)]',
      iconBoxBg: 'from-sky-500/25 to-blue-600/10',
      iconBorder: 'border-sky-500/30 group-hover:border-sky-400/70',
      iconGlow: 'bg-sky-500/30',
      iconColor: 'text-sky-400',
      titleGradient: 'from-white via-sky-100 to-sky-400',
      tagStyle: 'bg-sky-500/10 text-sky-400 border-sky-500/25',
      btnHover: 'group-hover:bg-sky-500 group-hover:text-white group-hover:border-sky-400 group-hover:shadow-lg group-hover:shadow-sky-500/30',
    },
    {
      id: 'cashier' as const,
      title: 'بوابة الكاشير والمبيعات',
      tag: 'نظام المبيعات',
      icon: FiMonitor,
      glowColor: 'bg-indigo-500',
      topLineGradient: 'from-primary via-indigo-500 to-transparent',
      cardBg: 'from-indigo-950/20 via-[#11101a]/95 to-[#0a0910]',
      cardBorder: 'border-primary/25 hover:border-primary-light/70',
      cardShadow: 'hover:shadow-[0_20px_50px_rgba(99,102,241,0.2)]',
      iconBoxBg: 'from-primary/25 to-indigo-600/10',
      iconBorder: 'border-primary/30 group-hover:border-primary-light/70',
      iconGlow: 'bg-primary/30',
      iconColor: 'text-primary-light',
      titleGradient: 'from-white via-indigo-100 to-primary-light',
      tagStyle: 'bg-primary/10 text-primary-light border-primary/25',
      btnHover: 'group-hover:bg-primary group-hover:text-white group-hover:border-primary-light group-hover:shadow-lg group-hover:shadow-primary/30',
    },
    {
      id: 'kitchen' as const,
      title: 'شاشة ونظام المطبخ',
      tag: 'شاشة KDS',
      icon: GiCookingPot,
      glowColor: 'bg-orange-500',
      topLineGradient: 'from-orange-500 via-amber-500 to-transparent',
      cardBg: 'from-orange-950/20 via-[#17110e]/95 to-[#0d0907]',
      cardBorder: 'border-orange-500/25 hover:border-orange-400/70',
      cardShadow: 'hover:shadow-[0_20px_50px_rgba(249,115,22,0.2)]',
      iconBoxBg: 'from-orange-500/25 to-amber-600/10',
      iconBorder: 'border-orange-500/30 group-hover:border-orange-400/70',
      iconGlow: 'bg-orange-500/30',
      iconColor: 'text-orange-400',
      titleGradient: 'from-white via-amber-100 to-orange-400',
      tagStyle: 'bg-orange-500/10 text-orange-400 border-orange-500/25',
      btnHover: 'group-hover:bg-orange-500 group-hover:text-white group-hover:border-orange-400 group-hover:shadow-lg group-hover:shadow-orange-500/30',
    },
    {
      id: 'branches' as const,
      title: 'منظومة وإدارة الفروع',
      tag: 'إدارة مركزية',
      icon: FiMapPin,
      glowColor: 'bg-purple-500',
      topLineGradient: 'from-purple-500 via-fuchsia-500 to-transparent',
      cardBg: 'from-purple-950/20 via-[#150f1d]/95 to-[#0d0714]',
      cardBorder: 'border-purple-500/25 hover:border-purple-400/70',
      cardShadow: 'hover:shadow-[0_20px_50px_rgba(168,85,247,0.2)]',
      iconBoxBg: 'from-purple-500/25 to-fuchsia-600/10',
      iconBorder: 'border-purple-500/30 group-hover:border-purple-400/70',
      iconGlow: 'bg-purple-500/30',
      iconColor: 'text-purple-400',
      titleGradient: 'from-white via-purple-100 to-purple-400',
      tagStyle: 'bg-purple-500/10 text-purple-400 border-purple-500/25',
      btnHover: 'group-hover:bg-purple-500 group-hover:text-white group-hover:border-purple-400 group-hover:shadow-lg group-hover:shadow-purple-500/30',
    },
  ];

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

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => navigate('/login')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary/10 hover:bg-primary/20 border border-primary/25 text-xs font-bold text-primary hover:text-primary-light transition-all cursor-pointer"
            >
              <FiUser className="w-3.5 h-3.5" />
              <span>دخول الكاشير</span>
            </button>

            <button
              type="button"
              onClick={() => navigate('/branch/login')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/25 text-xs font-bold text-emerald-400 hover:text-emerald-300 transition-all cursor-pointer"
            >
              <FiMapPin className="w-3.5 h-3.5" />
              <span>دخول الفرع</span>
            </button>

            <button
              type="button"
              onClick={() => navigate('/kitchen/login')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-orange-500/10 hover:bg-orange-500/20 border border-orange-500/25 text-xs font-bold text-orange-400 hover:text-orange-300 transition-all cursor-pointer"
            >
              <GiCookingPot className="w-3.5 h-3.5" />
              <span>دخول المطبخ</span>
            </button>

            <div className="hidden sm:flex items-center gap-2 text-xs font-semibold text-neutral-400 bg-white/[0.03] border border-white/10 px-3 py-1.5 rounded-full mr-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>النظام متصل</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 flex-1 mx-auto px-4 py-6 sm:py-8 flex flex-col items-center justify-center w-full">
        {/* Business Showcase Card (Only shown if data exists, otherwise kept blank) */}
        {hasBusinessData && (
          <div
            data-aos="zoom-in"
            data-aos-duration="600"
            className="w-full max-w-xl mb-6 p-5 sm:p-6 rounded-3xl bg-gradient-to-b from-white/[0.06] to-white/[0.02] border border-white/10 backdrop-blur-xl shadow-2xl relative overflow-hidden text-center"
          >
            <div className="absolute top-0 right-0 w-60 h-60 bg-primary/10 rounded-full blur-3xl pointer-events-none" />

            {/* Business Logo */}
            {logoUrl && (
              <div className="relative inline-flex items-center justify-center mb-3">
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-primary to-indigo-500 blur-xl opacity-40 animate-pulse-soft" />
                <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-[#0e0e12] border border-white/15 p-2 shadow-xl flex items-center justify-center overflow-hidden">
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
              <h1 className="text-xl sm:text-3xl font-black text-white tracking-tight mb-1.5">
                {business.name}
              </h1>
            )}

            {/* Business Description */}
            {business?.description && (
              <p className="text-xs sm:text-sm text-neutral-300 max-w-lg mx-auto leading-relaxed mb-4">
                {business.description}
              </p>
            )}

            {/* Social & Contact Actions */}
            <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
              {business?.phone && (
                <a
                  href={`tel:${business.phone}`}
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 text-xs font-semibold text-neutral-200 hover:text-white transition-all shadow-sm"
                  title="اتصال هاتفياً"
                >
                  <FaPhone className="w-3 h-3 text-primary" />
                  <span dir="ltr">{business.phone}</span>
                </a>
              )}

              {whatsappUrl && (
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 text-xs font-semibold text-emerald-400 transition-all shadow-sm"
                  title="تواصل عبر واتساب"
                >
                  <FaWhatsapp className="w-3.5 h-3.5 text-emerald-400" />
                  <span>واتساب</span>
                </a>
              )}

              {facebookUrl && (
                <a
                  href={facebookUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20 text-xs font-semibold text-blue-400 transition-all shadow-sm"
                  title="صفحة فيسبوك"
                >
                  <FaFacebookF className="w-3 h-3 text-blue-400" />
                  <span>فيسبوك</span>
                </a>
              )}

              {instagramUrl && (
                <a
                  href={instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-pink-500/10 hover:bg-pink-500/20 border border-pink-500/20 text-xs font-semibold text-pink-400 transition-all shadow-sm"
                  title="حساب انستجرام"
                >
                  <FaInstagram className="w-3.5 h-3.5 text-pink-400" />
                  <span>انستجرام</span>
                </a>
              )}
            </div>
          </div>
        )}

        {/* Title & Introduction */}
        <div data-aos="fade-up" data-aos-duration="600" className="text-center mb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.04] border border-white/10 text-xs font-bold text-neutral-300 mb-3 shadow-sm">
            <FiZap className="w-3.5 h-3.5 text-amber-400" />
            <span>منظومة متكاملة لنقاط البيع، خدمة الطاولات، والطلب أونلاين</span>
          </div>

          <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight leading-tight">
            مرحباً بك في نظام <span className="text-transparent bg-clip-text bg-gradient-to-l from-primary via-indigo-400 to-primary">POS</span>
          </h2>
          <p className="text-sm sm:text-base text-neutral-400 mt-2 leading-relaxed">
            يرجى تحديد بوابة الاستخدام للمتابعة إلى المسار المناسب
          </p>
        </div>

        {/* The Action Cards (Premium Bento Grid) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 w-full max-w-6xl">
          {portalCards.map((card, idx) => {
            const Icon = card.icon;
            return (
              <div
                key={card.id}
                onClick={() => handlePortalClick(card.id)}
                data-aos="fade-up"
                data-aos-delay={(idx + 1) * 80}
                data-aos-duration="600"
                className={`group relative rounded-[28px] bg-gradient-to-b ${card.cardBg} border ${card.cardBorder} p-6 sm:p-7 flex flex-col justify-between items-center text-center transition-all duration-500 hover:-translate-y-2 hover:scale-[1.02] ${card.cardShadow} cursor-pointer overflow-hidden backdrop-blur-2xl min-h-[255px]`}
              >
                {/* Top Accent Gradient Light Line */}
                <div
                  className={`absolute top-0 inset-x-0 h-1 bg-gradient-to-r ${card.topLineGradient} opacity-30 group-hover:opacity-100 transition-opacity duration-500`}
                />

                {/* Atmospheric Ambient Glow */}
                <div
                  className={`absolute -top-12 -right-12 w-48 h-48 rounded-full blur-[70px] pointer-events-none transition-all duration-700 opacity-20 group-hover:opacity-60 ${card.glowColor}`}
                />

                {/* Subtle Inner Glow */}
                <div
                  className={`absolute -bottom-16 -left-16 w-40 h-40 rounded-full blur-[60px] pointer-events-none transition-all duration-700 opacity-0 group-hover:opacity-30 ${card.glowColor}`}
                />

                {/* Top: Status / Category Tag */}
                <div className="w-full flex justify-center mb-5">
                  <span
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold tracking-wider uppercase border transition-all duration-300 group-hover:scale-105 ${card.tagStyle}`}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
                    <span>{card.tag}</span>
                  </span>
                </div>

                {/* Center: Heroic Floating Icon */}
                <div className="relative mb-5 flex items-center justify-center">
                  <div
                    className={`absolute inset-0 rounded-2xl blur-xl opacity-0 group-hover:opacity-80 transition-all duration-500 ${card.iconGlow}`}
                  />
                  <div
                    className={`relative w-20 h-20 rounded-2xl bg-gradient-to-tr ${card.iconBoxBg} border ${card.iconBorder} flex items-center justify-center ${card.iconColor} shadow-2xl transition-all duration-500 group-hover:scale-110 group-hover:-translate-y-1`}
                  >
                    <Icon className="w-9 h-9 transition-transform duration-500 group-hover:scale-105" />
                  </div>
                </div>

                {/* Title (Only Name - High Contrast & Gradient Hover) */}
                <h2
                  className={`text-xl sm:text-2xl font-black text-white group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-l ${card.titleGradient} transition-all duration-300 tracking-tight leading-snug px-2`}
                >
                  {card.title}
                </h2>

                {/* Bottom Interactive Launcher Bar */}
                <div className="mt-6 w-full pt-4 border-t border-white/5 flex items-center justify-between text-xs font-bold text-neutral-400 group-hover:text-white transition-colors">
                  <span className="tracking-wide">انقر للدخول</span>
                  <div
                    className={`w-8 h-8 rounded-xl bg-white/[0.04] border border-white/10 flex items-center justify-center text-neutral-300 transition-all duration-300 ${card.btnHover}`}
                  >
                    <FiArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
                  </div>
                </div>
              </div>
            );
          })}
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
      <footer data-aos="fade-up" data-aos-duration="500" className="relative z-10 w-full border-t border-white/5 py-6 text-center text-xs text-neutral-500">
        <p>
          جميع الحقوق محفوظة &copy; {new Date().getFullYear()} {business?.name || 'POS System'}
        </p>
      </footer>
    </div>
  );
};

export default HomePage;
