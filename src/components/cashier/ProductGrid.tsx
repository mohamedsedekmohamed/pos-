import React from 'react';
import type { Product } from '../../types/cashier';
import { FiPackage } from 'react-icons/fi';
import { useLanguage } from '../../context/LanguageContext';

interface ProductGridProps {
  products: Product[];
  isLoading: boolean;
  onProductClick: (product: Product) => void;
}

const ProductGrid: React.FC<ProductGridProps> = ({
  products,
  isLoading,
  onProductClick,
}) => {
  const { t, renderLocalized } = useLanguage();

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 p-4">
        {Array.from({ length: 10 }).map((_, i) => (
          <div
            key={i}
            className="rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 overflow-hidden animate-pulse"
          >
            <div className="aspect-square bg-slate-200 dark:bg-slate-700" />
            <div className="p-3 space-y-2">
              <div className="h-4 w-3/4 bg-slate-200 dark:bg-slate-700 rounded" />
              <div className="h-4 w-1/2 bg-slate-200 dark:bg-slate-700 rounded" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center p-12">
        <div className="text-center">
          <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
            <FiPackage className="w-10 h-10 text-slate-400" />
          </div>
          <h3 className="text-lg font-semibold text-slate-600 dark:text-slate-300 mb-1">
            {t('no_products')}
          </h3>
          <p className="text-sm text-slate-400">
            {t('try_different_category')}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 p-4 overflow-y-auto">
      {products.map((product) => {
        const localizedName = renderLocalized(product.name) || product.name;
        return (
          <button
            key={product.id}
            onClick={() => onProductClick(product)}
            className="group rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 overflow-hidden text-start transition-all duration-200 hover:shadow-xl hover:shadow-indigo-500/10 hover:border-indigo-300 dark:hover:border-indigo-600 hover:-translate-y-1 cursor-pointer"
          >
            {/* Image */}
            <div className="aspect-square bg-slate-100 dark:bg-slate-700 relative overflow-hidden">
              {product.image ? (
                <img
                  src={product.image}
                  alt={localizedName}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                    (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden');
                  }}
                />
              ) : null}
              <div className={`absolute inset-0 flex items-center justify-center ${product.image ? 'hidden' : ''}`}>
                <FiPackage className="w-10 h-10 text-slate-300 dark:text-slate-600" />
              </div>

              {/* Discount Badge */}
              {product.discount_val > 0 && (
                <div className="absolute top-2 start-2 bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-lg">
                  {t('discount')}
                </div>
              )}

              {/* Out of stock */}
              {product.stock === 0 && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center backdrop-blur-sm">
                  <span className="text-white font-bold text-sm bg-red-500 px-3 py-1 rounded-full">
                    {t('out_of_stock')}
                  </span>
                </div>
              )}
            </div>

            {/* Info */}
            <div className="p-3">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white truncate mb-1.5">
                {localizedName}
              </h3>
              <div className="flex items-center gap-2">
                <span className="text-base font-bold text-indigo-600 dark:text-indigo-600">
                  {product.final_price.toFixed(2)}
                </span>
                {product.discount_val > 0 && (
                  <span className="text-xs text-slate-400 line-through">
                    {product.price.toFixed(2)}
                  </span>
                )}
                <span className="text-[10px] text-slate-400 ms-auto">{t('currency')}</span>
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
};

export default ProductGrid;
