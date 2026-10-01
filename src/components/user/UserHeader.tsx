import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FiShoppingBag,
  FiArrowRight,
  FiGlobe,
  FiTruck,
  FiPackage,
  FiPhone,
  FiSliders,
} from 'react-icons/fi';
import { useLanguage } from '../../context/LanguageContext';
import { useUserCart } from '../../context/UserCartContext';
import { useBusinessSetup } from '../../hooks/useBusinessSetup';

export const UserHeader: React.FC = () => {
  const navigate = useNavigate();
  const { language, toggleLanguage } = useLanguage();
  const { business, logoUrl } = useBusinessSetup();
  const { module, setModule, itemCount, grandTotals, openCart } = useUserCart();

  const isRtl = language === 'ar';
  const [isBumping, setIsBumping] = useState(false);

  useEffect(() => {
    if (itemCount > 0) {
      setIsBumping(true);
      const timer = setTimeout(() => setIsBumping(false), 500);
      return () => clearTimeout(timer);
    }
  }, [itemCount, grandTotals.grand_final_price]);

  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-[#0a0a0e]/95 backdrop-blur-2xl border-b border-slate-200/80 dark:border-white/10 shadow-sm dark:shadow-2xl transition-colors duration-300">
      <div className="w-full px-3 sm:px-6 lg:px-10">
        <div className="flex items-center justify-between h-14 sm:h-20 gap-2 sm:gap-3">
          
          {/* Brand and Return Home */}
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <button
              type="button"
              onClick={() => navigate('/')}
              className="p-1.5 sm:p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-white/[0.04] dark:hover:bg-white/[0.08] border border-slate-200 dark:border-white/10 text-slate-700 dark:text-neutral-300 hover:text-slate-900 dark:hover:text-white transition-all group shrink-0"
              title="العودة للرئيسية"
            >
              <FiArrowRight
                className={`w-4 h-4 sm:w-5 sm:h-5 transition-transform ${
                  isRtl ? 'group-hover:translate-x-0.5' : 'group-hover:-translate-x-0.5 rotate-180'
                }`}
              />
            </button>

            <div className="flex items-center gap-2 sm:gap-3 min-w-0">
              {logoUrl ? (
                <div className="w-8 h-8 sm:w-11 sm:h-11 rounded-xl bg-slate-100 dark:bg-[#14141a] border border-slate-200 dark:border-white/10 p-1 flex items-center justify-center overflow-hidden shrink-0 shadow-sm">
                  <img
                    src={logoUrl}
                    alt={business?.name || 'Logo'}
                    className="w-full h-full object-contain"
                  />
                </div>
              ) : (
                <div className="w-8 h-8 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-tr from-primary to-indigo-600 flex items-center justify-center text-white font-bold text-sm sm:text-lg shadow-md shadow-primary/20 shrink-0">
                  {business?.name ? business.name.charAt(0) : 'M'}
                </div>
              )}

              <div className="min-w-0">
                <h1 className="text-xs sm:text-base font-bold text-slate-900 dark:text-white tracking-tight leading-tight truncate max-w-[110px] xs:max-w-[150px] sm:max-w-none">
                  {business?.name || 'قائمة الطعام والتوصيل'}
                </h1>
                <p className="text-[10px] sm:text-xs text-slate-500 dark:text-neutral-400 truncate hidden xs:block">
                  {module === 'delivery'
                    ? (isRtl ? 'توصيل حتى باب المنزل' : 'Delivery to your door')
                    : (isRtl ? 'استلام من الفرع' : 'Takeaway / Pickup')}
                </p>
              </div>
            </div>
          </div>

          {/* Desktop/Tablet Center: Module Switcher (Delivery vs Takeaway) */}
          <div className="hidden md:flex items-center bg-slate-100 dark:bg-[#15151c] p-1 rounded-2xl border border-slate-200 dark:border-white/10 shadow-inner">
            <button
              type="button"
              onClick={() => setModule('delivery')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                module === 'delivery'
                  ? 'bg-primary text-white shadow-md shadow-primary/30 scale-[1.02]'
                  : 'text-slate-600 dark:text-neutral-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <FiTruck className="w-4 h-4" />
              <span>{isRtl ? 'توصيل' : 'Delivery'}</span>
            </button>

            <button
              type="button"
              onClick={() => setModule('takeaway')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                module === 'takeaway'
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30 scale-[1.02]'
                  : 'text-slate-600 dark:text-neutral-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <FiPackage className="w-4 h-4" />
              <span>{isRtl ? 'استلام' : 'Takeaway'}</span>
            </button>
          </div>

          {/* Actions: Phone, Settings, Language, Cart Button */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
            {business?.phone && (
              <a
                href={`tel:${business.phone}`}
                className="hidden lg:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-white/[0.04] dark:hover:bg-white/[0.08] border border-slate-200 dark:border-white/10 text-xs font-semibold text-slate-700 dark:text-neutral-300 hover:text-slate-900 dark:hover:text-white transition-all"
                title="اتصال هاتفياً"
              >
                <FiPhone className="w-3.5 h-3.5 text-primary" />
                <span dir="ltr">{business.phone}</span>
              </a>
            )}

            {/* Profile & Theme Settings Button */}
            <button
              type="button"
              onClick={() => navigate('/order/profile')}
              className="p-1.5 sm:p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-white/[0.04] dark:hover:bg-white/[0.08] border border-slate-200 dark:border-white/10 text-slate-700 dark:text-neutral-300 hover:text-primary dark:hover:text-primary transition-all text-xs font-bold flex items-center gap-1.5 shadow-sm"
              title="تخصيص المظهر، الألوان، وحجم الخط (Settings)"
            >
              <FiSliders className="w-4 h-4 text-primary" />
              <span className="hidden xl:inline text-xs font-semibold">المظهر</span>
            </button>

            {/* Language Switcher */}
            <button
              type="button"
              onClick={toggleLanguage}
              className="p-1.5 sm:p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-white/[0.04] dark:hover:bg-white/[0.08] border border-slate-200 dark:border-white/10 text-slate-700 dark:text-neutral-300 hover:text-slate-900 dark:hover:text-white transition-all text-xs font-bold flex items-center gap-1"
              title="تغيير اللغة"
            >
              <FiGlobe className="w-4 h-4 text-slate-500 dark:text-neutral-400" />
              <span className="uppercase text-[11px] sm:text-xs">{language}</span>
            </button>

            {/* Cart Trigger Button */}
            <button
              type="button"
              onClick={openCart}
              className={`relative flex items-center gap-1.5 sm:gap-2 px-2.5 py-1.5 sm:px-4 sm:py-2.5 rounded-xl bg-gradient-to-r from-primary to-indigo-600 hover:from-primary/90 hover:to-indigo-500 text-white font-bold text-xs sm:text-sm shadow-md sm:shadow-lg shadow-primary/25 transition-all hover:scale-105 active:scale-95 ${
                isBumping ? 'animate-cart-bump ring-2 ring-primary/50' : ''
              }`}
            >
              <FiShoppingBag className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="hidden sm:inline">
                {grandTotals.grand_final_price > 0
                  ? `${grandTotals.grand_final_price.toFixed(2)} ج.م`
                  : isRtl
                  ? 'السلة'
                  : 'Cart'}
              </span>

              {itemCount > 0 && (
                <span className="flex items-center justify-center min-w-[18px] sm:min-w-[20px] h-4 sm:h-5 px-1 rounded-full bg-white text-primary text-[10px] sm:text-xs font-black shadow">
                  {itemCount}
                </span>
              )}
            </button>
          </div>

        </div>

        {/* Mobile-Only Secondary Bar: Full-Width Module Switcher */}
        <div className="md:hidden pb-2.5 pt-0.5">
          <div className="grid grid-cols-2 bg-slate-100 dark:bg-[#13131a] p-1 rounded-xl border border-slate-200/90 dark:border-white/10 shadow-inner">
            <button
              type="button"
              onClick={() => setModule('delivery')}
              className={`flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                module === 'delivery'
                  ? 'bg-primary text-white shadow-md shadow-primary/30'
                  : 'text-slate-600 dark:text-neutral-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <FiTruck className="w-3.5 h-3.5" />
              <span>{isRtl ? 'توصيل للمنزل' : 'Delivery'}</span>
            </button>

            <button
              type="button"
              onClick={() => setModule('takeaway')}
              className={`flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                module === 'takeaway'
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                  : 'text-slate-600 dark:text-neutral-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <FiPackage className="w-3.5 h-3.5" />
              <span>{isRtl ? 'استلام من الفرع' : 'Takeaway'}</span>
            </button>
          </div>
        </div>

      </div>
    </header>
  );
};
