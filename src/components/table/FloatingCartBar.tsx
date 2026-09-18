import React from 'react';
import { useTableCart } from '../../context/TableCartContext';
import { FiShoppingBag, FiArrowLeft } from 'react-icons/fi';

export const FloatingCartBar: React.FC = () => {
  const { totalItems, totalPrice, setIsCartOpen } = useTableCart();

  if (totalItems === 0) return null;

  return (
    <div className="fixed bottom-4 inset-x-4 max-w-lg mx-auto z-40 animate-in slide-in-from-bottom duration-300 select-none">
      <button
        type="button"
        onClick={() => setIsCartOpen(true)}
        className="w-full p-3.5 sm:p-4 rounded-3xl bg-gradient-to-l from-primary via-indigo-600 to-primary bg-[length:200%_auto] text-white shadow-2xl shadow-primary/35 hover:shadow-primary/50 border border-white/20 flex items-center justify-between transition-all duration-300 hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
      >
        {/* Left / Items Count */}
        <div className="flex items-center gap-3">
          <div className="relative w-10 h-10 rounded-2xl bg-black/30 border border-white/15 flex items-center justify-center">
            <FiShoppingBag className="w-5 h-5 text-white" />
            <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-red-500 text-white font-black text-[10px] flex items-center justify-center shadow-md animate-pulse">
              {totalItems}
            </span>
          </div>

          <div className="text-right">
            <span className="text-[11px] text-white/80 block leading-tight">
              سلة الطلبات
            </span>
            <span className="text-base sm:text-lg font-black tracking-tight text-white">
              {totalPrice.toFixed(2)} ر.س
            </span>
          </div>
        </div>

        {/* Right / CTA Button */}
        <div className="flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-white/15 hover:bg-white/25 border border-white/20 text-xs sm:text-sm font-black transition-colors">
          <span>عرض السلة</span>
          <FiArrowLeft className="w-4 h-4 -translate-x-0.5" />
        </div>
      </button>
    </div>
  );
};
