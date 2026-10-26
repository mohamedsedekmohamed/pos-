import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  FiCheckCircle,
  FiClock,
  FiShoppingBag,
  FiTruck,
  FiMapPin,
  FiPhone,
  FiUser,
  FiCreditCard,
  FiCopy,
  FiCheck,
  FiRefreshCw,
  FiPrinter,
  FiArrowRight,
  FiArrowLeft,
  FiAlertCircle,
  FiSearch,
  FiGift,
  FiCoffee,
  FiMoon,
  FiSun,
  FiGlobe,
  FiShare2,
  FiX,
  FiEye,
} from 'react-icons/fi';
import { FaWhatsapp } from 'react-icons/fa6';
import { GiCookingPot } from 'react-icons/gi';
import { orderTrackingApi } from '../services/orderTrackingService';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { useToast } from '../context/ToastContext';
import { useBusinessSetup } from '../hooks/useBusinessSetup';
import type { OrderStatusType } from '../types/orderTracking';

export const MyOrderPage: React.FC = () => {
  const { code } = useParams<{ code?: string }>();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const { language, toggleLanguage, dir } = useLanguage();
  const { showSuccess, showError } = useToast();
  const { business, logoUrl } = useBusinessSetup();

  const [inputCode, setInputCode] = useState('');
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [previewReceiptUrl, setPreviewReceiptUrl] = useState<string | null>(null);

  const activeCode = code?.trim() || '';

  // Query order by public code with live polling
  const {
    data: order,
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: ['public-order-tracking', activeCode, language],
    queryFn: () => orderTrackingApi.getOrderByCode(activeCode, language),
    enabled: Boolean(activeCode),
    refetchInterval: (query) => {
      const currentStatus = query.state.data?.status;
      // Stop polling once order is finalized
      if (
        currentStatus === 'delivered' ||
        currentStatus === 'failed_to_delivered' ||
        currentStatus === 'return' ||
        currentStatus === 'cancelled' ||
        currentStatus === 'canceled'
      ) {
        return false;
      }
      return 10_000; // Poll every 10 seconds while active
    },
    staleTime: 1000 * 5,
  });

  const isRtl = dir === 'rtl';

  // Helper for localized text
  const getLocalized = (val: any, fallback: string = ''): string => {
    if (!val) return fallback;
    if (typeof val === 'string') return val;
    if (typeof val === 'number') return String(val);
    if (typeof val === 'object') {
      return (language === 'en' ? val.en || val.ar : val.ar || val.en) || fallback;
    }
    return fallback;
  };

  // Format date safely
  const formatDateTime = (dateString?: string) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      return new Intl.DateTimeFormat(language === 'ar' ? 'ar-EG' : 'en-US', {
        dateStyle: 'medium',
        timeStyle: 'short',
      }).format(date);
    } catch {
      return dateString;
    }
  };

  // Relative time helper
  const getRelativeTime = (dateString?: string) => {
    if (!dateString) return '';
    try {
      const now = new Date();
      const orderDate = new Date(dateString);
      const diffMinutes = Math.floor((now.getTime() - orderDate.getTime()) / 60000);
      if (diffMinutes < 1) return language === 'ar' ? 'الآن' : 'Just now';
      if (diffMinutes < 60) {
        return language === 'ar' ? `منذ ${diffMinutes} دقيقة` : `${diffMinutes} mins ago`;
      }
      const diffHours = Math.floor(diffMinutes / 60);
      if (diffHours < 24) {
        return language === 'ar' ? `منذ ${diffHours} ساعة` : `${diffHours} hrs ago`;
      }
      const diffDays = Math.floor(diffHours / 24);
      return language === 'ar' ? `منذ ${diffDays} يوم` : `${diffDays} days ago`;
    } catch {
      return '';
    }
  };

  // Copy tracking code
  const handleCopyCode = async () => {
    if (!activeCode) return;
    try {
      await navigator.clipboard.writeText(activeCode);
      setCopiedCode(true);
      showSuccess(
        language === 'ar' ? 'تم نسخ كود الطلب بنجاح' : 'Order code copied to clipboard!'
      );
      setTimeout(() => setCopiedCode(false), 2000);
    } catch {
      showError(language === 'ar' ? 'تعذر نسخ الكود' : 'Failed to copy code');
    }
  };

  // Copy shareable page link
  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      showSuccess(
        language === 'ar' ? 'تم نسخ رابط التتبع للمشاركة' : 'Tracking link copied!'
      );
      setTimeout(() => setCopiedLink(false), 2000);
    } catch {
      showError(language === 'ar' ? 'تعذر نسخ الرابط' : 'Failed to copy link');
    }
  };

  // Print receipt
  const handlePrint = () => {
    window.print();
  };

  // Handle Search submit
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputCode.trim()) return;
    navigate(`/my_order/${encodeURIComponent(inputCode.trim())}`);
  };

  // WhatsApp Contact link
  const getWhatsAppLink = () => {
    const raw = business?.whats || business?.phone || '';
    const cleaned = raw.replace(/[^0-9]/g, '');
    if (!cleaned) return null;
    const text = encodeURIComponent(
      language === 'ar'
        ? `مرحباً، أود الاستفسار بخصوص طلبي رقم #${order?.id || ''} (كود: ${activeCode})`
        : `Hello, I'd like to inquire about my order #${order?.id || ''} (Code: ${activeCode})`
    );
    return `https://wa.me/${cleaned}?text=${text}`;
  };

  // Status visual configurations
  const getStatusConfig = (status: OrderStatusType) => {
    switch (status) {
      case 'preparing':
        return {
          label: language === 'ar' ? 'جاري التحضير في المطبخ' : 'Preparing in Kitchen',
          desc: language === 'ar' ? 'يقوم فريق المطبخ بتجهيز وجبتك الطازجة الآن' : 'Our team is preparing your fresh meal now',
          badgeClass: 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30',
          gradientBg: 'from-amber-500/20 via-orange-500/10 to-transparent',
          icon: <GiCookingPot className="w-6 h-6 animate-pulse" />,
          color: 'amber',
          stepIndex: 1,
        };
      case 'done':
        return {
          label: language === 'ar' ? 'تم التجهيز' : 'Order Ready',
          desc: language === 'ar' ? 'طلبك جاهز تماماً للاستلام أو التوصيل' : 'Your order is ready for pickup or delivery',
          badgeClass: 'bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/30',
          gradientBg: 'from-blue-500/20 via-indigo-500/10 to-transparent',
          icon: <FiCheckCircle className="w-6 h-6" />,
          color: 'blue',
          stepIndex: 2,
        };
      case 'pickup':
        return {
          label: language === 'ar' ? 'جاهز للاستلام من الفرع' : 'Ready for Pickup',
          desc: language === 'ar' ? 'تفضل بزيارة الفرع لاستلام طلبك' : 'Please visit the branch to pick up your order',
          badgeClass: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30',
          gradientBg: 'from-emerald-500/20 via-teal-500/10 to-transparent',
          icon: <FiShoppingBag className="w-6 h-6" />,
          color: 'emerald',
          stepIndex: 2,
        };
      case 'out_of_delivery':
        return {
          label: language === 'ar' ? 'في الطريق إليك' : 'Out for Delivery',
          desc: language === 'ar' ? 'مندوب التوصيل في طريقه إلى موقعك' : 'Driver is on the way to your location',
          badgeClass: 'bg-orange-500/15 text-orange-600 dark:text-orange-400 border-orange-500/30',
          gradientBg: 'from-orange-500/20 via-amber-500/10 to-transparent',
          icon: <FiTruck className="w-6 h-6 animate-bounce" />,
          color: 'orange',
          stepIndex: 2,
        };
      case 'delivered':
        return {
          label: language === 'ar' ? 'تم التسليم بنجاح' : 'Delivered Successfully',
          desc: language === 'ar' ? 'نتمنى لك وجبة شهية! شكراً لثقتك بنا' : 'Enjoy your meal! Thank you for ordering with us',
          badgeClass: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30',
          gradientBg: 'from-emerald-500/20 via-green-500/10 to-transparent',
          icon: <FiCheckCircle className="w-6 h-6" />,
          color: 'emerald',
          stepIndex: 3,
        };
      case 'cancelled':
      case 'canceled':
      case 'return':
      case 'failed_to_delivered':
        return {
          label: language === 'ar' ? 'تم إلغاء الطلب / مرتجع' : 'Order Cancelled / Returned',
          desc: language === 'ar' ? 'تم إلغاء هذا الطلب. يرجى التواصل مع الفرع لأي استفسار' : 'This order has been cancelled. Contact support for inquiries',
          badgeClass: 'bg-red-500/15 text-red-600 dark:text-red-400 border-red-500/30',
          gradientBg: 'from-red-500/20 via-rose-500/10 to-transparent',
          icon: <FiAlertCircle className="w-6 h-6" />,
          color: 'red',
          stepIndex: -1,
        };
      default:
        return {
          label: language === 'ar' ? 'تم استلام الطلب' : 'Order Received',
          desc: language === 'ar' ? 'تم تسجيل طلبك بنجاح وفي انتظار التحضير' : 'Your order has been recorded and awaits preparation',
          badgeClass: 'bg-primary/15 text-primary border-primary/30',
          gradientBg: 'from-primary/20 via-blue-500/10 to-transparent',
          icon: <FiClock className="w-6 h-6" />,
          color: 'primary',
          stepIndex: 0,
        };
    }
  };

  // Module localized title
  const getModuleTitle = (mod: string) => {
    switch (mod) {
      case 'takeaway':
        return language === 'ar' ? 'استلام من الفرع (سفري)' : 'Takeaway / Pickup';
      case 'delivery':
        return language === 'ar' ? 'توصيل منزلي' : 'Home Delivery';
      case 'dinein':
        return language === 'ar' ? 'طلب صالة (طاولة)' : 'Dine-In (Table)';
      default:
        return mod;
    }
  };

  // ─────────────────────────────────────────────────────────────
  // 1. STATE: NO CODE PROVIDED (Search / Input Screen)
  // ─────────────────────────────────────────────────────────────
  if (!activeCode) {
    return (
      <div
        className="min-h-screen bg-slate-50 dark:bg-[#08080b] text-slate-900 dark:text-white flex flex-col justify-between selection:bg-primary selection:text-white transition-colors duration-300"
        dir={dir}
      >
        {/* Ambient background glows */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
          <div className="absolute top-10 right-1/4 w-[450px] h-[450px] bg-primary/15 rounded-full blur-[150px]" />
          <div className="absolute bottom-10 left-1/4 w-[400px] h-[400px] bg-emerald-500/10 rounded-full blur-[140px]" />
        </div>

        {/* Top Navbar */}
        <header className="relative z-10 w-full max-w-4xl mx-auto px-4 py-4 sm:py-6 flex items-center justify-between">
          <Link
            to="/"
            className="flex items-center gap-2 text-sm font-bold text-slate-600 dark:text-neutral-300 hover:text-primary transition-colors"
          >
            {isRtl ? <FiArrowRight className="w-4 h-4" /> : <FiArrowLeft className="w-4 h-4" />}
            <span>{language === 'ar' ? 'الرئيسية' : 'Home'}</span>
          </Link>

          <div className="flex items-center gap-2">
            <button
              onClick={toggleLanguage}
              className="px-3 py-1.5 rounded-xl bg-white dark:bg-[#15151e] border border-slate-200 dark:border-white/10 text-xs font-bold text-slate-700 dark:text-neutral-200 hover:border-primary/50 transition-all flex items-center gap-1.5 shadow-sm"
              title="تغيير اللغة"
            >
              <FiGlobe className="w-3.5 h-3.5 text-primary" />
              <span>{language === 'ar' ? 'English' : 'العربية'}</span>
            </button>

            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl bg-white dark:bg-[#15151e] border border-slate-200 dark:border-white/10 text-slate-700 dark:text-neutral-200 hover:border-primary/50 transition-all shadow-sm"
              title="تغيير المظهر"
            >
              {theme === 'dark' ? <FiSun className="w-4 h-4 text-amber-400" /> : <FiMoon className="w-4 h-4 text-slate-600" />}
            </button>
          </div>
        </header>

        {/* Main Search Hero */}
        <main className="relative z-10 w-full max-w-lg mx-auto px-4 py-8 flex-1 flex flex-col justify-center">
          <div className="bg-white dark:bg-[#121218]/90 border border-slate-200/80 dark:border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl text-center space-y-6 animate-fade-in-up">
            <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto rounded-3xl bg-gradient-to-tr from-primary to-blue-400 border border-primary/30 flex items-center justify-center text-white shadow-xl shadow-primary/25">
              <FiShoppingBag className="w-8 h-8 sm:w-10 sm:h-10" />
            </div>

            <div className="space-y-2">
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
                {language === 'ar' ? 'تتبع حالة طلبك' : 'Track Your Order'}
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-neutral-400 max-w-sm mx-auto leading-relaxed">
                {language === 'ar'
                  ? 'أدخل كود تتبع الطلب الخاص بك لمعرفة مرحلة التحضير، تفاصيل الفاتورة، وحالة التوصيل مباشرة.'
                  : 'Enter your order tracking code to check real-time kitchen progress, receipt details, and delivery status.'}
              </p>
            </div>

            <form onSubmit={handleSearchSubmit} className="space-y-3">
              <div className="relative">
                <input
                  type="text"
                  value={inputCode}
                  onChange={(e) => setInputCode(e.target.value)}
                  placeholder={
                    language === 'ar'
                      ? 'مثال: bc776d3e-6614-4a35-a188-d136082ffb67'
                      : 'e.g. bc776d3e-6614-4a35-a188-d136082ffb67'
                  }
                  className="w-full pl-4 pr-11 py-3.5 rounded-2xl bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/10 focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none text-xs sm:text-sm font-mono text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-neutral-500 transition-all text-center"
                />
                <FiSearch className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-neutral-500 pointer-events-none" />
              </div>

              <button
                type="submit"
                disabled={!inputCode.trim()}
                className="w-full py-3.5 px-6 rounded-2xl bg-primary hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-sm shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <FiSearch className="w-4 h-4" />
                <span>{language === 'ar' ? 'تتبع الطلب الآن' : 'Track Order Now'}</span>
              </button>
            </form>

            {/* Quick Demo Helper */}
            <div className="pt-2 border-t border-slate-100 dark:border-white/5">
              <p className="text-[11px] text-slate-400 dark:text-neutral-500 mb-2">
                {language === 'ar' ? 'أو جرب طلب تجريبي للاختبار:' : 'Or try a live demo order:'}
              </p>
              <button
                type="button"
                onClick={() => navigate('/my_order/bc776d3e-6614-4a35-a188-d136082ffb67')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-white/5 hover:bg-primary/10 hover:text-primary border border-slate-200 dark:border-white/10 text-[11px] font-mono text-slate-600 dark:text-neutral-300 transition-all cursor-pointer"
              >
                <span>bc776d3e-6614-4a35-a188-d136082ffb67</span>
              </button>
            </div>
          </div>
        </main>

        <footer className="relative z-10 py-6 text-center text-xs text-slate-400 dark:text-neutral-600">
          © {new Date().getFullYear()} {business?.name || 'POS'}. {language === 'ar' ? 'جميع الحقوق محفوظة' : 'All rights reserved'}.
        </footer>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────
  // 2. STATE: LOADING
  // ─────────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div
        className="min-h-screen bg-slate-50 dark:bg-[#08080b] flex flex-col items-center justify-center p-4 text-slate-800 dark:text-white"
        dir={dir}
      >
        <div className="relative mb-6">
          <div className="w-20 h-20 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center">
            <FiShoppingBag className="w-8 h-8 text-primary animate-pulse" />
          </div>
        </div>
        <h2 className="text-lg font-bold mb-1">
          {language === 'ar' ? 'جاري تحميل تفاصيل الطلب...' : 'Loading order details...'}
        </h2>
        <p className="text-xs text-slate-400 font-mono">{activeCode}</p>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────
  // 3. STATE: ERROR / ORDER NOT FOUND
  // ─────────────────────────────────────────────────────────────
  if (isError || !order) {
    return (
      <div
        className="min-h-screen bg-slate-50 dark:bg-[#08080b] text-slate-900 dark:text-white flex flex-col justify-center items-center p-4 text-center selection:bg-primary selection:text-white"
        dir={dir}
      >
        <div className="max-w-md w-full bg-white dark:bg-[#121218] border border-slate-200 dark:border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-5 animate-fade-in-up">
          <div className="w-16 h-16 mx-auto rounded-3xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-500 text-2xl">
            <FiAlertCircle className="w-8 h-8" />
          </div>

          <div className="space-y-1">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              {language === 'ar' ? 'الطلب غير موجود' : 'Order Not Found'}
            </h2>
            <p className="text-xs text-slate-500 dark:text-neutral-400 leading-relaxed">
              {language === 'ar'
                ? `لم نتمكن من العثور على أي طلب مسجل بهذا الكود (${activeCode}). يرجى التأكد من صحة الرابط أو إدخال كود آخر.`
                : `We could not find any order with code (${activeCode}). Please check the link or try another code.`}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-2 pt-2">
            <button
              type="button"
              onClick={() => navigate('/my_order')}
              className="flex-1 py-3 px-4 rounded-xl bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-xs font-bold text-slate-700 dark:text-neutral-200 transition-colors cursor-pointer"
            >
              {language === 'ar' ? 'إدخال كود آخر' : 'Enter Another Code'}
            </button>
            <button
              type="button"
              onClick={() => refetch()}
              className="flex-1 py-3 px-4 rounded-xl bg-primary text-white text-xs font-bold hover:bg-primary-dark transition-colors cursor-pointer shadow-md shadow-primary/20"
            >
              {language === 'ar' ? 'إعادة المحاولة' : 'Try Again'}
            </button>
          </div>

          <Link
            to="/order"
            className="inline-block text-xs font-semibold text-primary hover:underline pt-2"
          >
            {language === 'ar' ? 'تصفح قائمة الطعام وإنشاء طلب جديد' : 'Browse Menu & Place New Order'}
          </Link>
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────
  // 4. MAIN STATE: ORDER FOUND & DISPLAY
  // ─────────────────────────────────────────────────────────────
  const statusConfig = getStatusConfig(order.status);
  const whatsappUrl = getWhatsAppLink();

  // Step tracker steps
  const isTakeaway = order.module === 'takeaway';
  const isDinein = order.module === 'dinein';

  const timelineSteps = [
    {
      title: language === 'ar' ? 'استلام الطلب' : 'Order Received',
      sub: language === 'ar' ? 'تم تسجيل الطلب' : 'Recorded',
    },
    {
      title: language === 'ar' ? 'المطبخ والتحضير' : 'In the Kitchen',
      sub: language === 'ar' ? 'جاري الطهي والتجهيز' : 'Cooking & Packing',
    },
    {
      title: isTakeaway
        ? language === 'ar' ? 'جاهز للاستلام' : 'Ready for Pickup'
        : isDinein
        ? language === 'ar' ? 'تقديم للطاولة' : 'Serving to Table'
        : language === 'ar' ? 'خروج للتوصيل' : 'Out for Delivery',
      sub: isTakeaway
        ? language === 'ar' ? 'في الفرع' : 'At Branch'
        : isDinein
        ? language === 'ar' ? 'بالصالة' : 'At Table'
        : language === 'ar' ? 'مع المندوب' : 'With Courier',
    },
    {
      title: language === 'ar' ? 'تم الاستلام' : 'Completed',
      sub: language === 'ar' ? 'بالهناء والشفاء' : 'Bon Appétit',
    },
  ];

  return (
    <div
      className="min-h-screen relative flex flex-col bg-slate-50 dark:bg-[#08080b] text-slate-900 dark:text-white selection:bg-primary selection:text-white transition-colors duration-300 pb-16"
      dir={dir}
    >
      {/* Ambient background glows */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0 print:hidden">
        <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[160px]" />
        <div className="absolute bottom-20 left-1/4 w-[450px] h-[450px] bg-emerald-500/10 rounded-full blur-[150px]" />
      </div>

      {/* ── Main Content Container (Wide / Full Page Layout) ── */}
      <main className="relative z-10 w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 space-y-6">

        {/* ── Big Restaurant / Store Header (اسم المطعم بشكل كبير) ── */}
        <div className="text-center space-y-3 pb-2 pt-2">
          <div className="inline-flex items-center justify-center">
            {logoUrl ? (
              <img
                src={logoUrl}
                alt={order.cashier?.name || business?.name || 'Restaurant Logo'}
                className="w-16 h-16 sm:w-24 sm:h-24 rounded-2xl sm:rounded-3xl object-contain bg-white dark:bg-[#121218] border border-slate-200/80 dark:border-white/10 p-2 shadow-xl"
              />
            ) : (
              <div className="w-16 h-16 sm:w-24 sm:h-24 rounded-2xl sm:rounded-3xl bg-gradient-to-tr from-primary to-blue-600 border border-primary/30 flex items-center justify-center text-white shadow-xl shadow-primary/25">
                <FiCoffee className="w-8 h-8 sm:w-12 sm:h-12" />
              </div>
            )}
          </div>

          <div>
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-slate-900 dark:text-white tracking-tight">
              {order.cashier?.name || business?.name || 'V60 COFFEE'}
            </h1>
            <p className="text-xs sm:text-base text-slate-500 dark:text-neutral-400 font-semibold mt-1.5">
              {language === 'ar' ? 'متابعة تفاصيل وحالة الطلب' : 'Order Details & Live Status'}
            </p>
          </div>
        </div>

        {/* ── 1. HERO STATUS CARD ── */}
        <section className={`w-full rounded-3xl bg-white dark:bg-[#121218]/90 border border-slate-200/80 dark:border-white/10 p-5 sm:p-8 shadow-xl dark:shadow-2xl backdrop-blur-xl relative overflow-hidden bg-gradient-to-br ${statusConfig.gradientBg}`}>
          <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-5 border-b border-slate-200/60 dark:border-white/10">
            {/* Left/Start: Order Number & Code */}
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-xs uppercase font-extrabold tracking-wider text-primary">
                  {language === 'ar' ? 'طلب رقم' : 'Order'}
                </span>
                <span className="text-2xl sm:text-3xl font-black font-mono text-slate-900 dark:text-white">
                  #{order.id}
                </span>
                {order.paid && (
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-[10px] font-extrabold">
                    {language === 'ar' ? 'مدفوع' : 'Paid'}
                  </span>
                )}
              </div>

              {/* Code Chip with Copy Button */}
              <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-neutral-400">
                <span className="font-mono text-[11px] sm:text-xs truncate max-w-[200px] sm:max-w-xs">
                  {activeCode}
                </span>
                <button
                  type="button"
                  onClick={handleCopyCode}
                  className="p-1 rounded-md hover:bg-slate-200 dark:hover:bg-white/10 text-slate-500 dark:text-neutral-400 transition-colors cursor-pointer"
                  title={language === 'ar' ? 'نسخ الكود' : 'Copy Code'}
                >
                  {copiedCode ? (
                    <FiCheck className="w-3.5 h-3.5 text-emerald-500" />
                  ) : (
                    <FiCopy className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
            </div>

            {/* Right/End: Status Badge */}
            <div className="flex flex-col sm:items-end">
              <div className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-2xl border text-xs sm:text-sm font-black ${statusConfig.badgeClass} shadow-sm`}>
                {statusConfig.icon}
                <span>{statusConfig.label}</span>
              </div>
              <span className="text-[11px] text-slate-500 dark:text-neutral-400 mt-1.5 flex items-center gap-1">
                <FiClock className="w-3 h-3" />
                <span>{formatDateTime(order.created_at)}</span>
                <span className="font-semibold text-primary">({getRelativeTime(order.created_at)})</span>
              </span>
            </div>
          </div>

          {/* Description banner (شرح الطلب بعرض الصفحة) */}
          <div className="w-full my-4 py-3.5 px-4 sm:px-6 rounded-2xl bg-white/70 dark:bg-white/[0.04] border border-slate-200/60 dark:border-white/10 text-xs sm:text-base font-semibold text-slate-800 dark:text-neutral-200 shadow-sm leading-relaxed text-center sm:text-start">
            {statusConfig.desc}
          </div>

          {/* Visual Step Timeline */}
          {statusConfig.stepIndex >= 0 && (
            <div className="pt-3">
              <div className="grid grid-cols-4 gap-2 relative">
                {timelineSteps.map((step, idx) => {
                  const isDone = idx < statusConfig.stepIndex;
                  const isCurrent = idx === statusConfig.stepIndex;

                  return (
                    <div key={idx} className="flex flex-col items-center text-center relative group">
                      {/* Step Circle */}
                      <div
                        className={`w-9 h-9 sm:w-11 sm:h-11 rounded-2xl flex items-center justify-center font-bold text-xs transition-all duration-300 ${
                          isDone
                            ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20'
                            : isCurrent
                            ? 'bg-primary text-white ring-4 ring-primary/20 shadow-lg shadow-primary/30 scale-105'
                            : 'bg-slate-100 dark:bg-white/5 text-slate-400 dark:text-neutral-500 border border-slate-200 dark:border-white/10'
                        }`}
                      >
                        {isDone ? (
                          <FiCheck className="w-4 h-4 sm:w-5 sm:h-5 stroke-[3]" />
                        ) : (
                          <span>{idx + 1}</span>
                        )}
                      </div>

                      {/* Step Labels */}
                      <span
                        className={`text-[10px] sm:text-xs font-bold mt-2 leading-tight ${
                          isCurrent
                            ? 'text-primary'
                            : isDone
                            ? 'text-slate-800 dark:text-neutral-200'
                            : 'text-slate-400 dark:text-neutral-500'
                        }`}
                      >
                        {step.title}
                      </span>
                      <span className="text-[9px] sm:text-[10px] text-slate-400 dark:text-neutral-500 hidden sm:block">
                        {step.sub}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </section>

        {/* ── 2. QUICK DETAILS & PAYMENT METADATA ── */}
        <section className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {/* Order Module & Branch Info */}
          <div className="rounded-2xl bg-white dark:bg-[#121218]/90 border border-slate-200/80 dark:border-white/10 p-4 shadow-sm text-xs space-y-2.5">
            <h3 className="font-extrabold text-slate-900 dark:text-white flex items-center gap-1.5 pb-1 border-b border-slate-100 dark:border-white/5">
              <FiShoppingBag className="w-3.5 h-3.5 text-primary" />
              <span>{language === 'ar' ? 'نوع وبيانات الطلب' : 'Order Information'}</span>
            </h3>

            <div className="flex items-center justify-between">
              <span className="text-slate-500 dark:text-neutral-400">
                {language === 'ar' ? 'نوع الخدمة:' : 'Service Type:'}
              </span>
              <span className="font-bold text-slate-800 dark:text-neutral-100 px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-white/5">
                {getModuleTitle(order.module)}
              </span>
            </div>

            {order.cashier?.name && (
              <div className="flex items-center justify-between">
                <span className="text-slate-500 dark:text-neutral-400">
                  {language === 'ar' ? 'نقطة البيع:' : 'POS Point:'}
                </span>
                <span className="font-bold text-slate-800 dark:text-neutral-100">
                  {order.cashier.name}
                </span>
              </div>
            )}

            {(order.cashier?.cashier_man_name || order.cashier_man?.name) && (
              <div className="flex items-center justify-between">
                <span className="text-slate-500 dark:text-neutral-400">
                  {language === 'ar' ? 'الكاشير:' : 'Cashier Staff:'}
                </span>
                <span className="font-semibold text-slate-700 dark:text-neutral-300">
                  {order.cashier?.cashier_man_name || order.cashier_man?.name}
                </span>
              </div>
            )}

            {order.hall_table?.name && (
              <div className="flex items-center justify-between">
                <span className="text-slate-500 dark:text-neutral-400">
                  {language === 'ar' ? 'الطاولة:' : 'Table:'}
                </span>
                <span className="font-bold text-primary">
                  {order.hall_table.name}
                </span>
              </div>
            )}
          </div>

          {/* Payment & Financial Account Info */}
          <div className="rounded-2xl bg-white dark:bg-[#121218]/90 border border-slate-200/80 dark:border-white/10 p-4 shadow-sm text-xs space-y-2.5">
            <h3 className="font-extrabold text-slate-900 dark:text-white flex items-center gap-1.5 pb-1 border-b border-slate-100 dark:border-white/5">
              <FiCreditCard className="w-3.5 h-3.5 text-primary" />
              <span>{language === 'ar' ? 'بيانات الدفع والحساب' : 'Payment & Account'}</span>
            </h3>

            <div className="flex items-center justify-between">
              <span className="text-slate-500 dark:text-neutral-400">
                {language === 'ar' ? 'حالة السداد:' : 'Payment Status:'}
              </span>
              <span
                className={`font-bold px-2 py-0.5 rounded-lg ${
                  order.paid
                    ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                    : 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                }`}
              >
                {order.paid
                  ? language === 'ar' ? 'مدفوع بالكامل' : 'Paid in Full'
                  : language === 'ar' ? 'في انتظار الدفع' : 'Pending Payment'}
              </span>
            </div>

            {order.financial_account && (
              <div className="flex items-center justify-between">
                <span className="text-slate-500 dark:text-neutral-400">
                  {language === 'ar' ? 'طريقة / حساب الدفع:' : 'Payment Account:'}
                </span>
                <div className="flex items-center gap-1.5 font-bold text-slate-800 dark:text-neutral-100">
                  {order.financial_account.icon && (
                    <img
                      src={order.financial_account.icon}
                      alt=""
                      className="w-4 h-4 object-contain rounded"
                    />
                  )}
                  <span>{getLocalized(order.financial_account.name)}</span>
                </div>
              </div>
            )}

            {(order.receipt || order.reciept) && (
              <div className="flex items-center justify-between pt-1">
                <span className="text-slate-500 dark:text-neutral-400">
                  {language === 'ar' ? 'إيصال التحويل:' : 'Transfer Receipt:'}
                </span>
                <button
                  type="button"
                  onClick={() => setPreviewReceiptUrl(order.receipt || order.reciept || null)}
                  className="inline-flex items-center gap-1 text-[11px] font-bold text-primary hover:underline cursor-pointer"
                >
                  <FiEye className="w-3 h-3" />
                  <span>{language === 'ar' ? 'عرض الإيصال' : 'View Receipt'}</span>
                </button>
              </div>
            )}
          </div>
        </section>

        {/* Customer / Delivery Info if available */}
        {(order.name || order.phone || order.address || order.note) && (
          <section className="rounded-2xl bg-white dark:bg-[#121218]/90 border border-slate-200/80 dark:border-white/10 p-4 shadow-sm text-xs space-y-2">
            <h3 className="font-extrabold text-slate-900 dark:text-white flex items-center gap-1.5 pb-1 border-b border-slate-100 dark:border-white/5">
              <FiUser className="w-3.5 h-3.5 text-primary" />
              <span>{language === 'ar' ? 'بيانات العميل والتوصيل' : 'Customer & Delivery Info'}</span>
            </h3>

            {order.name && (
              <div className="flex items-center justify-between">
                <span className="text-slate-500 dark:text-neutral-400">{language === 'ar' ? 'الاسم:' : 'Name:'}</span>
                <span className="font-bold text-slate-800 dark:text-neutral-100">{order.name}</span>
              </div>
            )}

            {order.phone && (
              <div className="flex items-center justify-between">
                <span className="text-slate-500 dark:text-neutral-400">{language === 'ar' ? 'الهاتف:' : 'Phone:'}</span>
                <span className="font-bold font-mono text-slate-800 dark:text-neutral-100" dir="ltr">{order.phone}</span>
              </div>
            )}

            {order.address && (
              <div className="flex items-start justify-between gap-3">
                <span className="text-slate-500 dark:text-neutral-400 shrink-0">{language === 'ar' ? 'العنوان:' : 'Address:'}</span>
                <span className="font-semibold text-slate-700 dark:text-neutral-300 text-left">{order.address}</span>
              </div>
            )}

            {order.note && (
              <div className="pt-1 border-t border-slate-100 dark:border-white/5 text-amber-600 dark:text-amber-400 bg-amber-500/5 p-2 rounded-xl">
                <span className="font-bold block mb-0.5">{language === 'ar' ? 'ملاحظة الطلب:' : 'Order Note:'}</span>
                <p className="font-normal text-[11px]">{order.note}</p>
              </div>
            )}
          </section>
        )}

        {/* ── 3. ORDER PRODUCTS ITEMS LIST ── */}
        <section className="rounded-3xl bg-white dark:bg-[#121218]/90 border border-slate-200/80 dark:border-white/10 p-5 sm:p-6 shadow-xl dark:shadow-2xl backdrop-blur-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200/60 dark:border-white/10">
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                {language === 'ar' ? 'محتويات الطلب' : 'Order Items'}
              </h2>
              <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-bold">
                {order.products?.length || 0} {language === 'ar' ? 'أصناف' : 'items'}
              </span>
            </div>
            <span className="text-xs text-slate-400 dark:text-neutral-500 hidden sm:inline">
              {language === 'ar' ? 'الأسعار تشمل الضرائب' : 'All prices include taxes'}
            </span>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-white/5 space-y-3">
            {order.products?.map((item) => {
              const productName =
                getLocalized(item.name_translations) ||
                getLocalized(item.product?.name) ||
                item.name;

              const productImage = item.product?.image || null;
              const isGift = Boolean(item.is_gift);
              const itemTotal = item.price * item.quantity;

              return (
                <div
                  key={item.id}
                  className="pt-3 first:pt-0 flex items-start gap-3 sm:gap-4 hover:bg-slate-50/50 dark:hover:bg-white/[0.02] p-2 rounded-2xl transition-colors"
                >
                  {/* Thumbnail */}
                  <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-slate-100 dark:bg-white/5 border border-slate-200/80 dark:border-white/10 overflow-hidden shrink-0 flex items-center justify-center">
                    {productImage ? (
                      <img
                        src={productImage}
                        alt={productName}
                        className="w-full h-full object-cover"
                        loading="lazy"
                        onError={(e) => {
                          // Fallback to icon if broken link
                          (e.currentTarget as HTMLElement).style.display = 'none';
                        }}
                      />
                    ) : (
                      <FiCoffee className="w-6 h-6 text-slate-400 dark:text-neutral-500" />
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate">
                        {productName}
                      </h4>
                      {isGift && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-[10px] font-extrabold animate-pulse">
                          <FiGift className="w-3 h-3" />
                          <span>{language === 'ar' ? 'هدية مجانية' : 'Free Gift'}</span>
                        </span>
                      )}
                    </div>

                    {/* Quantity & Unit price */}
                    <div className="flex items-center gap-2 mt-1 text-xs text-slate-500 dark:text-neutral-400">
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-white/5 font-mono font-bold text-slate-700 dark:text-neutral-200">
                        x{item.quantity}
                      </span>
                      <span>×</span>
                      <span className="font-mono">
                        {isGift ? 0 : item.price} {language === 'ar' ? 'ج.م' : 'EGP'}
                      </span>
                    </div>

                    {/* Item Notes */}
                    {item.note && (
                      <p className="text-[11px] text-amber-600 dark:text-amber-400 mt-1 italic">
                        "{item.note}"
                      </p>
                    )}

                    {/* Variations if any */}
                    {item.variations && item.variations.length > 0 && (
                      <div className="mt-1 flex flex-wrap gap-1">
                        {item.variations.map((v, i) => (
                          <span
                            key={i}
                            className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-neutral-300"
                          >
                            {getLocalized(v.name)}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Line Total */}
                  <div className="text-right shrink-0">
                    <span className="text-xs sm:text-sm font-black font-mono text-slate-900 dark:text-white block">
                      {isGift ? 0 : itemTotal} {language === 'ar' ? 'ج.م' : 'EGP'}
                    </span>
                    {isGift && (
                      <span className="text-[10px] text-emerald-500 font-bold block">
                        {language === 'ar' ? 'مجاني' : 'FREE'}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* ── 4. FINANCIAL BILL SUMMARY ── */}
        <section className="rounded-3xl bg-white dark:bg-[#121218]/90 border border-slate-200/80 dark:border-white/10 p-5 sm:p-6 shadow-xl dark:shadow-2xl backdrop-blur-xl space-y-3">
          <h2 className="text-sm font-black text-slate-900 dark:text-white pb-2 border-b border-slate-200/60 dark:border-white/10">
            {language === 'ar' ? 'تفاصيل الحساب والفاتورة' : 'Invoice & Financial Breakdown'}
          </h2>

          <div className="space-y-2 text-xs sm:text-sm">
            {/* Subtotal */}
            <div className="flex items-center justify-between text-slate-600 dark:text-neutral-300">
              <span>{language === 'ar' ? 'المجموع الفرعي:' : 'Subtotal:'}</span>
              <span className="font-mono font-bold text-slate-800 dark:text-neutral-100">
                {order.total} {language === 'ar' ? 'ج.م' : 'EGP'}
              </span>
            </div>

            {/* Tax */}
            <div className="flex items-center justify-between text-slate-600 dark:text-neutral-300">
              <span>{language === 'ar' ? 'ضريبة القيمة المضافة:' : 'VAT / Tax:'}</span>
              <span className="font-mono font-bold text-slate-800 dark:text-neutral-100">
                +{order.total_tax} {language === 'ar' ? 'ج.م' : 'EGP'}
              </span>
            </div>

            {/* Discount */}
            {order.total_discount > 0 && (
              <div className="flex items-center justify-between text-emerald-600 dark:text-emerald-400 font-semibold">
                <span>{language === 'ar' ? 'إجمالي الخصم:' : 'Total Discount:'}</span>
                <span className="font-mono font-bold">
                  -{order.total_discount} {language === 'ar' ? 'ج.م' : 'EGP'}
                </span>
              </div>
            )}

            {/* Final Grand Total */}
            <div className="pt-3 border-t border-slate-200/80 dark:border-white/10 flex items-center justify-between">
              <div>
                <span className="text-sm sm:text-base font-black text-slate-900 dark:text-white block">
                  {language === 'ar' ? 'الإجمالي النهائي' : 'Grand Total'}
                </span>
                <span className="text-[10px] text-slate-400 dark:text-neutral-500">
                  {language === 'ar' ? 'المبلغ المستحق الدفع' : 'Total Payable Amount'}
                </span>
              </div>
              <div className="text-right">
                <span className="text-xl sm:text-2xl font-black font-mono text-primary block">
                  {order.final_price} {language === 'ar' ? 'ج.م' : 'EGP'}
                </span>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* ── Receipt Image Preview Modal ── */}
      {previewReceiptUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div className="relative max-w-lg w-full bg-white dark:bg-[#121218] rounded-3xl overflow-hidden shadow-2xl border border-slate-200 dark:border-white/10">
            <div className="p-4 flex items-center justify-between border-b border-slate-200 dark:border-white/10">
              <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                {language === 'ar' ? 'صورة إيصال التحويل' : 'Transfer Receipt'}
              </h4>
              <button
                type="button"
                onClick={() => setPreviewReceiptUrl(null)}
                className="p-1 rounded-xl hover:bg-slate-100 dark:hover:bg-white/10 text-slate-500 transition-colors cursor-pointer"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 max-h-[75vh] overflow-auto flex items-center justify-center bg-slate-50 dark:bg-black/40">
              <img
                src={previewReceiptUrl}
                alt="Receipt"
                className="max-w-full h-auto rounded-xl shadow"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyOrderPage;
