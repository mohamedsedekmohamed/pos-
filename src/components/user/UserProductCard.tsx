import React from 'react';
import { FiPlus, FiTag } from 'react-icons/fi';
import { formatImageUrl } from '../../hooks/useBusinessSetup';
import type { UserProduct } from '../../types/user';

interface UserProductCardProps {
  product: UserProduct;
  onSelect: (product: UserProduct) => void;
  index?: number;
}

export const UserProductCard: React.FC<UserProductCardProps> = ({
  product,
  onSelect,
  index = 0,
}) => {
  const imageUrl = formatImageUrl(product.image);
  const hasDiscount = product.discount_val > 0;

  return (
    <div
      onClick={() => onSelect(product)}
      style={{
        animationDelay: `${Math.min(index * 45, 600)}ms`,
      }}
      className="group relative rounded-2xl sm:rounded-3xl bg-white dark:bg-[#111116]/95 hover:bg-slate-50/80 dark:hover:bg-[#15151e] border border-slate-200/80 dark:border-white/10 hover:border-primary/50 p-2.5 sm:p-4 md:p-5 flex flex-col justify-between transition-all duration-300 hover:-translate-y-1.5 shadow-sm hover:shadow-xl hover:shadow-primary/15 cursor-pointer overflow-hidden backdrop-blur-xl animate-fade-in-up"
    >
      {/* Dynamic Animated Ambient Glow */}
      <div className="absolute -top-10 -right-10 w-36 h-36 bg-gradient-to-br from-primary/20 to-indigo-500/10 rounded-full blur-2xl group-hover:scale-150 group-hover:opacity-100 opacity-20 dark:opacity-30 transition-all duration-500 pointer-events-none" />

      <div>
        {/* Product Image */}
        <div className="relative aspect-[4/3] w-full rounded-xl sm:rounded-2xl bg-slate-100 dark:bg-[#09090d] border border-slate-200/60 dark:border-white/5 overflow-hidden mb-2 sm:mb-4 shadow-inner">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
              loading="lazy"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-neutral-400 dark:text-neutral-600 font-bold text-2xl sm:text-3xl">
              🍽️
            </div>
          )}

          {/* Discount Badge */}
          {hasDiscount && (
            <div className="absolute top-1.5 right-1.5 sm:top-2.5 sm:right-2.5 flex items-center gap-1 px-1.5 sm:px-2.5 py-0.5 sm:py-1 rounded-lg sm:rounded-xl bg-gradient-to-r from-red-500 to-rose-600 text-white text-[9px] sm:text-[11px] font-black shadow-lg backdrop-blur-sm animate-pulse-soft">
              <FiTag className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
              <span>خصم {product.discount?.name || `${product.discount_val} ج.م`}</span>
            </div>
          )}
        </div>

        {/* Product Details */}
        <h3 className="text-xs sm:text-base font-bold text-slate-900 dark:text-white group-hover:text-primary transition-colors line-clamp-1 mb-1 sm:mb-1.5">
          {product.name}
        </h3>

        {product.description && (
          <p className="text-[11px] sm:text-xs text-slate-500 dark:text-neutral-400 line-clamp-2 leading-relaxed mb-2 sm:mb-4 min-h-[26px] sm:min-h-[32px]">
            {product.description}
          </p>
        )}
      </div>

      {/* Price & Action Button */}
      <div className="pt-2 sm:pt-3 border-t border-slate-100 dark:border-white/5 flex items-center justify-between gap-1 sm:gap-2 mt-auto">
        <div className="flex flex-col min-w-0">
          {hasDiscount && (
            <span className="text-[9px] sm:text-[11px] text-slate-400 dark:text-neutral-500 line-through truncate">
              {Number(product.price).toFixed(2)}
            </span>
          )}
          <div className="flex items-baseline gap-0.5 sm:gap-1">
            <span className="text-xs sm:text-base md:text-lg font-black text-slate-900 dark:text-white group-hover:text-primary transition-colors">
              {Number(product.final_price || product.price).toFixed(2)}
            </span>
            <span className="text-[9px] sm:text-[11px] text-slate-500 dark:text-neutral-400 font-semibold">ج.م</span>
          </div>
        </div>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onSelect(product);
          }}
          className="flex items-center gap-1 p-1.5 sm:px-3 sm:py-2 rounded-lg sm:rounded-xl bg-slate-100 dark:bg-white/[0.06] group-hover:bg-primary text-slate-700 dark:text-neutral-200 group-hover:text-white border border-slate-200 dark:border-white/10 group-hover:border-primary text-xs font-bold transition-all duration-300 shadow-sm shrink-0 active:scale-90"
          title="إضافة للسلة"
        >
          <FiPlus className="w-3.5 h-3.5 sm:w-4 sm:h-4 transition-transform group-hover:rotate-90 duration-300" />
          <span className="hidden xs:inline">إضافة</span>
        </button>
      </div>
    </div>
  );
};
