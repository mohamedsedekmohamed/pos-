import React from 'react';
import { FiTrash2, FiPlus, FiMinus, FiShoppingCart } from 'react-icons/fi';
import { useOrderType } from '../../context/OrderTypeContext';
import { useLanguage } from '../../context/LanguageContext';
import type { ApiCartItem, ApiCartGrandTotals } from '../../types/cashier';

interface CartProps {
  items: ApiCartItem[];
  grandTotals?: ApiCartGrandTotals;
  isLoading?: boolean;
  onUpdateQuantity: (id: number, delta: number) => void;
  onRemoveItem: (id: number) => void;
  onClearCart: () => void;
  onCheckoutClick: () => void;
}

const Cart: React.FC<CartProps> = ({
  items,
  grandTotals,
  isLoading,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  onCheckoutClick,
}) => {
  const { orderTypeLabel } = useOrderType();
  const { t, renderLocalized } = useLanguage();
  const subtotal = grandTotals?.grand_total_price || 0;
  const taxAmount = grandTotals?.grand_total_tax || 0;
  const total = grandTotals?.grand_final_price || 0;

  return (
    <div className="flex flex-col h-full bg-white dark:bg-slate-800 border-e border-slate-200 dark:border-slate-700">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700">
        <div className="flex items-center gap-2">
          <FiShoppingCart className="w-5 h-5 text-indigo-600 dark:text-indigo-600" />
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            {t('cart')}
          </h2>
          <span className="px-2 py-0.5 rounded-lg bg-primary/10 text-primary text-xs font-bold border border-primary/20">
            {orderTypeLabel}
          </span>
          {items.length > 0 && (
            <span className="bg-indigo-500/20 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-600 text-xs font-bold px-2 py-0.5 rounded-full">
              {items.reduce((sum, i) => sum + i.quantity, 0)}
            </span>
          )}
        </div>
        {items.length > 0 && (
          <button
            onClick={onClearCart}
            className="text-xs text-red-500 hover:text-red-600 font-medium hover:bg-red-50 dark:hover:bg-red-500/10 px-2 py-1 rounded-lg transition-colors cursor-pointer"
          >
            {t('clear_all')}
          </button>
        )}
      </div>

      {/* Items */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center py-16 text-center">
            <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center mb-4">
              <FiShoppingCart className="w-8 h-8 text-slate-300 dark:text-slate-600" />
            </div>
            <p className="text-sm text-slate-400 font-medium">
              {t('cart_empty')}
            </p>
            <p className="text-xs text-slate-300 dark:text-slate-600 mt-1">
              {t('click_product_to_add')}
            </p>
          </div>
        ) : (
          items.map((item) => (
            <div
              key={item.id}
              className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-3 border border-slate-100 dark:border-slate-700 group hover:border-indigo-200 dark:hover:border-indigo-500/50 transition-all"
            >
              <div className="flex gap-3">
                {/* Image */}
                {item.product?.image && (
                  <img
                    src={item.product.image}
                    alt={renderLocalized(item.product.name) || 'product'}
                    className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
                  />
                )}

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                    {renderLocalized(item.product?.name) || 'Unknown'}
                  </h4>

                  {/* Variations */}
                  {item.variations?.length > 0 && (
                    <p className="text-[11px] text-slate-400 truncate mt-0.5">
                      {item.variations.flatMap((v) => v.options.map((o) => renderLocalized(o.name))).join(' · ')}
                    </p>
                  )}

                  {/* Addons */}
                  {item.addons?.length > 0 && (
                    <p className="text-[11px] text-indigo-600 truncate">
                      + {item.addons.map((a) => renderLocalized(a.name)).join(', ')}
                    </p>
                  )}

                  {/* Notes */}
                  {item.notes && (
                    <p className="text-[10px] text-amber-500 truncate mt-0.5">
                      📝 {item.notes}
                    </p>
                  )}
                </div>

                {/* Delete */}
                <button
                  onClick={() => onRemoveItem(item.id)}
                  className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-red-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all flex-shrink-0 self-start cursor-pointer"
                >
                  <FiTrash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Quantity + Price */}
              <div className="flex items-center justify-between mt-2.5">
                <div className="flex items-center gap-1.5 bg-white dark:bg-slate-700 rounded-lg border border-slate-200 dark:border-slate-600 px-0.5 py-0.5">
                  <button
                    onClick={() => onUpdateQuantity(item.id, -1)}
                    disabled={isLoading}
                    className="w-6 h-6 rounded-md bg-slate-50 dark:bg-slate-600 flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-500 transition-colors cursor-pointer disabled:opacity-50"
                  >
                    <FiMinus className="w-3 h-3" />
                  </button>
                  <span className="text-sm font-bold w-5 text-center text-slate-900 dark:text-white">
                    {typeof item.quantity === 'number' ? item.quantity : 1}
                  </span>
                  <button
                    onClick={() => onUpdateQuantity(item.id, 1)}
                    disabled={isLoading}
                    className="w-6 h-6 rounded-md bg-slate-50 dark:bg-slate-600 flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-500 transition-colors cursor-pointer disabled:opacity-50"
                  >
                    <FiPlus className="w-3 h-3" />
                  </button>
                </div>
                <span className="text-sm font-bold text-indigo-600 dark:text-indigo-600">
                  {(item.total_final_price || 0).toFixed(2)} {t('currency')}
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Summary */}
      {items.length > 0 && (
        <div className="flex-shrink-0 border-t border-slate-200 dark:border-slate-700 p-4 space-y-3 bg-slate-50/50 dark:bg-slate-800/50">
          <div className="space-y-1.5 text-sm">
            <div className="flex justify-between text-slate-500">
              <span>{t('subtotal')}</span>
              <span>{subtotal.toFixed(2)} {t('currency')}</span>
            </div>
            <div className="flex justify-between text-slate-500">
              <span>{t('tax_15')}</span>
              <span>{taxAmount.toFixed(2)} {t('currency')}</span>
            </div>
            <div className="h-px bg-slate-200 dark:bg-slate-700 my-1" />
            <div className="flex justify-between text-lg font-bold text-slate-900 dark:text-white">
              <span>{t('total')}</span>
              <span className="text-indigo-600 dark:text-indigo-600">
                {total.toFixed(2)} {t('currency')}
              </span>
            </div>
          </div>

          {/* Checkout */}
          <button
            onClick={onCheckoutClick}
            disabled={isLoading}
            className="w-full py-3.5 rounded-xl bg-gradient-to-l from-emerald-600 to-teal-600 text-white font-bold text-base hover:from-emerald-700 hover:to-teal-700 active:scale-[0.98] transition-all shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
          >
            ✅ {t('checkout')}
          </button>
        </div>
      )}
    </div>
  );
};

export default Cart;
