import React from 'react';
import {
  FiX,
  FiTrash2,
  FiPlus,
  FiMinus,
  FiShoppingBag,
  FiArrowLeft,
  FiLoader,
  FiTruck,
  FiPackage,
} from 'react-icons/fi';
import { useUserCart } from '../../context/UserCartContext';
import { formatImageUrl } from '../../hooks/useBusinessSetup';

interface UserCartDrawerProps {
  onProceedToCheckout: () => void;
}

export const UserCartDrawer: React.FC<UserCartDrawerProps> = ({ onProceedToCheckout }) => {
  const {
    isCartOpen,
    closeCart,
    cartItems,
    grandTotals,
    itemCount,
    module,
    setModule,
    updateItemQuantity,
    removeItem,
    clearCart,
    isLoading,
    isUpdating,
    isRemoving,
    isClearing,
  } = useUserCart();

  if (!isCartOpen) return null;

  const isBusy = isUpdating || isRemoving || isClearing;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden" dir="rtl">
      {/* Backdrop */}
      <div
        onClick={closeCart}
        className="absolute inset-0 bg-black/60 dark:bg-black/75 backdrop-blur-sm transition-opacity animate-in fade-in duration-300"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-0 sm:pl-10">
        <div className="w-screen max-w-md bg-white dark:bg-[#101015] border-l border-slate-200 dark:border-white/10 shadow-2xl flex flex-col text-slate-900 dark:text-white animate-in slide-in-from-right duration-300 transition-colors">
          
          {/* Header */}
          <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-white/10 flex items-center justify-between bg-slate-50 dark:bg-[#14141c]">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-primary/10 dark:bg-primary/20 border border-primary/20 dark:border-primary/30 flex items-center justify-center text-primary shadow-sm">
                <FiShoppingBag className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <span>سلة الطلبات</span>
                  {itemCount > 0 && (
                    <span className="px-2 py-0.5 rounded-full bg-primary text-white text-[11px] font-black">
                      {itemCount}
                    </span>
                  )}
                </h2>
                <p className="text-[11px] text-slate-500 dark:text-neutral-400">
                  {module === 'delivery' ? 'طلب توصيل للمنزل' : 'استلام ذاتي من الفرع'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {cartItems.length > 0 && (
                <button
                  type="button"
                  onClick={() => clearCart()}
                  disabled={isBusy}
                  className="p-2 rounded-xl bg-red-50 hover:bg-red-100 dark:bg-red-500/10 dark:hover:bg-red-500/20 text-red-500 dark:text-red-400 border border-red-200 dark:border-red-500/20 text-xs font-bold transition-all disabled:opacity-50"
                  title="تفريغ السلة بالكامل"
                >
                  <FiTrash2 className="w-4 h-4" />
                </button>
              )}

              <button
                type="button"
                onClick={closeCart}
                className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-white/[0.04] dark:hover:bg-white/[0.08] text-slate-600 dark:text-neutral-300 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-white/10 transition-all"
                aria-label="إغلاق السلة"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Module Switcher Inside Cart */}
          <div className="p-3 bg-slate-100 dark:bg-[#0d0d12] border-b border-slate-200 dark:border-white/5 flex items-center gap-2">
            <button
              type="button"
              onClick={() => setModule('delivery')}
              className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-bold transition-all ${
                module === 'delivery'
                  ? 'bg-primary text-white shadow-md shadow-primary/20'
                  : 'text-slate-600 dark:text-neutral-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <FiTruck className="w-3.5 h-3.5" />
              <span>توصيل</span>
            </button>

            <button
              type="button"
              onClick={() => setModule('takeaway')}
              className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-bold transition-all ${
                module === 'takeaway'
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                  : 'text-slate-600 dark:text-neutral-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <FiPackage className="w-3.5 h-3.5" />
              <span>استلام من الفرع</span>
            </button>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 no-scrollbar">
            {isLoading ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 dark:text-neutral-400 gap-2">
                <FiLoader className="w-6 h-6 animate-spin text-primary" />
                <span className="text-xs">جاري جلب محتويات السلة...</span>
              </div>
            ) : cartItems.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4">
                <div className="w-20 h-20 rounded-full bg-slate-100 dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 flex items-center justify-center text-3xl text-slate-400 dark:text-neutral-500">
                  🛒
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">
                    السلة فارغة حالياً
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-neutral-400 max-w-xs">
                    اختر أشهى الوجبات والمشروبات من القائمة وأضفها لسلتك لإتمام الطلب.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={closeCart}
                  className="px-5 py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-white/[0.06] dark:hover:bg-white/[0.1] border border-slate-200 dark:border-white/10 text-slate-800 dark:text-white text-xs font-bold transition-all"
                >
                  تصفح قائمة الطعام
                </button>
              </div>
            ) : (
              cartItems.map((item) => {
                const imageUrl = formatImageUrl(item.image);

                return (
                  <div
                    key={item.id}
                    className="p-3.5 rounded-2xl bg-slate-50 hover:bg-slate-100/80 dark:bg-white/[0.03] dark:hover:bg-white/[0.05] border border-slate-200/80 dark:border-white/5 space-y-3 transition-colors relative"
                  >
                    <div className="flex items-start gap-3">
                      {/* Product Thumbnail */}
                      <div className="w-14 h-14 rounded-xl bg-slate-200 dark:bg-black/40 border border-slate-300 dark:border-white/10 overflow-hidden shrink-0">
                        {imageUrl ? (
                          <img
                            src={imageUrl}
                            alt={item.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-lg">
                            🍽️
                          </div>
                        )}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="text-sm font-bold text-slate-900 dark:text-white line-clamp-1">
                            {item.name}
                          </h4>
                          <button
                            type="button"
                            onClick={() => removeItem(item.id)}
                            disabled={isBusy}
                            className="text-slate-400 hover:text-red-500 dark:text-neutral-500 dark:hover:text-red-400 p-1 transition-colors"
                            title="حذف من السلة"
                          >
                            <FiTrash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {/* Variations list */}
                        {item.variations && item.variations.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1">
                            {item.variations.map((v) => (
                              <span
                                key={v.id}
                                className="px-2 py-0.5 rounded-md bg-primary/10 text-primary text-[10px] font-semibold"
                              >
                                {v.name}: {v.options.map((o) => o.name).join(', ')}
                              </span>
                            ))}
                          </div>
                        )}

                        {/* Addons list */}
                        {item.addons && item.addons.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1">
                            {item.addons.map((a) => (
                              <span
                                key={a.id}
                                className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-semibold"
                              >
                                + {a.name}
                              </span>
                            ))}
                          </div>
                        )}

                        {/* Notes */}
                        {item.notes && (
                          <p className="text-[11px] text-amber-600 dark:text-amber-300/80 mt-1 italic line-clamp-1">
                            ملاحظة: {item.notes}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Stepper & Price */}
                    <div className="flex items-center justify-between pt-2 border-t border-slate-200/80 dark:border-white/5">
                      {/* Stepper */}
                      <div className="flex items-center bg-white dark:bg-black/40 p-0.5 rounded-xl border border-slate-200 dark:border-white/10 shadow-sm">
                        <button
                          type="button"
                          onClick={() => updateItemQuantity(item.id, item.quantity - 1, item)}
                          disabled={isBusy}
                          className="w-6 h-6 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-white/[0.04] dark:hover:bg-white/[0.1] text-slate-800 dark:text-white flex items-center justify-center transition-all disabled:opacity-40"
                        >
                          <FiMinus className="w-3 h-3" />
                        </button>

                        <span className="w-7 text-center text-xs font-black text-slate-900 dark:text-white">
                          {item.quantity}
                        </span>

                        <button
                          type="button"
                          onClick={() => updateItemQuantity(item.id, item.quantity + 1, item)}
                          disabled={isBusy}
                          className="w-6 h-6 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-white/[0.04] dark:hover:bg-white/[0.1] text-slate-800 dark:text-white flex items-center justify-center transition-all disabled:opacity-40"
                        >
                          <FiPlus className="w-3 h-3" />
                        </button>
                      </div>

                      {/* Total Item Price */}
                      <div className="text-left">
                        <span className="text-sm font-black text-slate-900 dark:text-white">
                          {Number(item.item_final_price || item.final_price * item.quantity).toFixed(2)}
                        </span>
                        <span className="text-[10px] text-slate-500 dark:text-neutral-400 mr-1 font-semibold">ج.م</span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer Totals & Checkout Button */}
          {cartItems.length > 0 && (
            <div className="p-4 sm:p-5 bg-slate-50 dark:bg-[#14141c] border-t border-slate-200 dark:border-white/10 space-y-3">
              {/* Breakdown */}
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between text-slate-500 dark:text-neutral-400">
                  <span>المجموع الفرعي</span>
                  <span className="font-semibold text-slate-800 dark:text-neutral-200">
                    {Number(grandTotals.grand_total_price).toFixed(2)} ج.م
                  </span>
                </div>

                {grandTotals.grand_total_discount > 0 && (
                  <div className="flex justify-between text-emerald-600 dark:text-emerald-400">
                    <span>إجمالي الخصم</span>
                    <span className="font-semibold">
                      - {Number(grandTotals.grand_total_discount).toFixed(2)} ج.م
                    </span>
                  </div>
                )}

                {grandTotals.grand_total_tax > 0 && (
                  <div className="flex justify-between text-slate-500 dark:text-neutral-400">
                    <span>ضريبة القيمة المضافة</span>
                    <span className="font-semibold text-slate-800 dark:text-neutral-200">
                      {Number(grandTotals.grand_total_tax).toFixed(2)} ج.م
                    </span>
                  </div>
                )}

                <div className="pt-2 border-t border-slate-200 dark:border-white/10 flex justify-between items-baseline text-slate-900 dark:text-white">
                  <span className="text-sm font-bold">المبلغ الإجمالي</span>
                  <div className="flex items-baseline gap-1">
                    <span className="text-xl font-black text-primary">
                      {Number(grandTotals.grand_final_price).toFixed(2)}
                    </span>
                    <span className="text-xs font-bold text-slate-500 dark:text-neutral-400">ج.م</span>
                  </div>
                </div>
              </div>

              {/* Proceed Button */}
              <button
                type="button"
                onClick={() => {
                  closeCart();
                  onProceedToCheckout();
                }}
                disabled={isBusy}
                className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-2xl bg-gradient-to-r from-primary to-indigo-600 hover:from-primary/90 hover:to-indigo-500 text-white font-bold text-sm shadow-xl shadow-primary/25 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 cursor-pointer"
              >
                <span>متابعة إتمام الطلب</span>
                <FiArrowLeft className="w-4 h-4" />
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
