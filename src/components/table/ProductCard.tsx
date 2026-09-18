import React from 'react';
import type { TableProduct } from '../../types/table';
import { FiPlus, FiTag, FiImage } from 'react-icons/fi';

interface ProductCardProps {
  product: TableProduct;
  onSelectProduct: (product: TableProduct) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onSelectProduct,
}) => {
  const hasDiscount = product.discount_val > 0 && product.price > product.final_price;
  const discountPercent = hasDiscount
    ? Math.round(((product.price - product.final_price) / product.price) * 100)
    : 0;

  return (
    <div
      onClick={() => onSelectProduct(product)}
      className="group relative rounded-2xl sm:rounded-3xl bg-[#101014]/90 hover:bg-[#15151b] border border-white/10 hover:border-primary/40 p-2.5 sm:p-3.5 flex flex-col justify-between transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-black/60 cursor-pointer overflow-hidden backdrop-blur-md select-none"
    >
      {/* Top Image Container */}
      <div className="relative w-full h-32 sm:h-44 rounded-xl sm:rounded-2xl overflow-hidden bg-white/[0.03] mb-2.5 flex items-center justify-center">
        {product.image ? (
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
            onError={(e) => {
              (e.target as HTMLElement).style.display = 'none';
            }}
          />
        ) : (
          <div className="flex flex-col items-center justify-center text-neutral-600 gap-1">
            <FiImage className="w-8 h-8" />
          </div>
        )}

        {/* Discount Badge */}
        {hasDiscount && (
          <div className="absolute top-2 right-2 px-2 py-0.5 rounded-lg bg-red-600/90 text-white text-[10px] sm:text-xs font-black shadow-md flex items-center gap-1 backdrop-blur-sm">
            <FiTag className="w-2.5 h-2.5" />
            <span>خصم {discountPercent}%</span>
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="flex-1 flex flex-col justify-between">
        <div>
          <h3 className="font-bold text-xs sm:text-sm text-white line-clamp-1 group-hover:text-primary transition-colors mb-1">
            {product.name}
          </h3>
          {product.description && (
            <p className="text-[11px] sm:text-xs text-neutral-400 line-clamp-2 leading-relaxed mb-2.5">
              {product.description}
            </p>
          )}
        </div>

        {/* Pricing & Add Button */}
        <div className="flex items-center justify-between pt-2 border-t border-white/5 mt-auto">
          <div className="flex flex-col">
            <div className="flex items-baseline gap-1.5">
              <span className="text-sm sm:text-base font-black text-primary">
                {product.final_price?.toFixed(2)}
              </span>
              <span className="text-[10px] text-neutral-400">ر.س</span>
            </div>

            {hasDiscount && (
              <span className="text-[10px] text-neutral-500 line-through">
                {product.price?.toFixed(2)} ر.س
              </span>
            )}
          </div>

          {/* Quick Action / Open Modal */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onSelectProduct(product);
            }}
            className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-primary/20 hover:bg-primary text-primary hover:text-white border border-primary/30 flex items-center justify-center transition-all shadow-md shadow-primary/10 active:scale-95 cursor-pointer"
            title="تخصيص وإضافة"
          >
            <FiPlus className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
