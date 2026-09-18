import React, { useState } from 'react';
import { useTableCart } from '../../context/TableCartContext';
import { useTableContext } from '../../context/TableContext';
import {
  FiX,
  FiTrash2,
  FiPlus,
  FiMinus,
  FiShoppingBag,
  FiCheckCircle,
  FiFileText,
} from 'react-icons/fi';

export const TableCartDrawer: React.FC = () => {
  const { tableInfo } = useTableContext();
  const {
    cart,
    isCartOpen,
    setIsCartOpen,
    updateQuantity,
    removeFromCart,
    clearCart,
    totalItems,
    subtotal,
    totalPrice,
  } = useTableCart();

  const [orderSent, setOrderSent] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isCartOpen) return null;

  const handleSendOrder = async () => {
    setIsSubmitting(true);
    // Simulate API call for table order placement
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsSubmitting(false);
    setOrderSent(true);
    clearCart();
  };

  const handleClose = () => {
    setIsCartOpen(false);
    setOrderSent(false);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200 select-none"
      dir="rtl"
      onClick={handleClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-lg max-h-[90vh] flex flex-col bg-[#0e0e12] border border-white/15 rounded-t-[2.5rem] sm:rounded-3xl shadow-2xl shadow-black overflow-hidden animate-in slide-in-from-bottom duration-300"
      >
        {/* Drawer Header */}
        <div className="p-4 sm:p-5 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-primary/20 border border-primary/30 flex items-center justify-center text-primary">
              <FiShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">سلة الطلبات</h3>
              <p className="text-xs text-neutral-400">
                {tableInfo ? `طاولة ${tableInfo.name} · ${tableInfo.hall?.name || ''}` : 'طلب طاولة'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {cart.length > 0 && (
              <button
                type="button"
                onClick={clearCart}
                className="text-xs text-red-400 hover:text-red-300 font-semibold px-2.5 py-1.5 rounded-xl hover:bg-red-500/10 transition-colors cursor-pointer"
              >
                مسح الكل
              </button>
            )}
            <button
              type="button"
              onClick={handleClose}
              className="w-9 h-9 rounded-full bg-white/[0.04] hover:bg-white/[0.08] text-neutral-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
            >
              <FiX className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3 scrollbar-thin scrollbar-thumb-white/10">
          {orderSent ? (
            /* Success State */
            <div className="py-12 flex flex-col items-center justify-center text-center space-y-4 animate-in zoom-in-95 duration-300">
              <div className="w-20 h-20 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 flex items-center justify-center shadow-2xl shadow-emerald-500/20">
                <FiCheckCircle className="w-10 h-10" />
              </div>
              <div className="space-y-1">
                <h4 className="text-xl font-bold text-white">تم إرسال طلبك بنجاح!</h4>
                <p className="text-xs text-neutral-400 max-w-xs leading-relaxed">
                  يتم الآن تجهيز طلبك في المطبخ لتقديمه على طاولتك رقم{' '}
                  <span className="text-emerald-400 font-bold">{tableInfo?.name || 'المحددة'}</span>.
                </p>
              </div>

              <button
                type="button"
                onClick={handleClose}
                className="mt-4 px-6 py-2.5 rounded-2xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 text-white font-bold text-xs transition-all cursor-pointer"
              >
                العودة لقائمة الطعام
              </button>
            </div>
          ) : cart.length === 0 ? (
            /* Empty Cart */
            <div className="py-16 flex flex-col items-center justify-center text-center space-y-3">
              <div className="w-16 h-16 rounded-2xl bg-white/[0.03] border border-white/5 flex items-center justify-center text-neutral-600">
                <FiShoppingBag className="w-8 h-8" />
              </div>
              <h4 className="font-bold text-sm text-neutral-300">السلة فارغة حالياً</h4>
              <p className="text-xs text-neutral-500 max-w-xs">
                تصفح قائمة الطعام وأضف وجباتك ومشروباتك المفضلة لبدء الطلب.
              </p>
            </div>
          ) : (
            /* Cart Items List */
            cart.map((item) => (
              <div
                key={item.id}
                className="p-3.5 rounded-2xl bg-[#14141a]/90 border border-white/10 flex flex-col gap-2.5 transition-all"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    {item.image && (
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-12 h-12 rounded-xl object-cover shrink-0"
                      />
                    )}
                    <div className="min-w-0">
                      <h4 className="font-bold text-sm text-white truncate">{item.name}</h4>
                      <span className="text-xs font-black text-primary">
                        {item.totalPrice.toFixed(2)} ر.س
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => removeFromCart(item.id)}
                    className="p-1.5 rounded-lg text-neutral-500 hover:text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
                    title="حذف الصنف"
                  >
                    <FiTrash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Selected Variations Badges */}
                {item.selectedVariations.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 text-[10px] text-neutral-400">
                    {item.selectedVariations.map((v) => (
                      <span
                        key={v.variationId}
                        className="px-2 py-0.5 rounded-md bg-white/[0.04] border border-white/5"
                      >
                        {v.variationName}: <strong className="text-white">{v.optionName}</strong>
                      </span>
                    ))}
                  </div>
                )}

                {/* Selected Addons Badges */}
                {item.selectedAddons.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 text-[10px] text-emerald-400">
                    {item.selectedAddons.map((a) => (
                      <span
                        key={a.addonId}
                        className="px-2 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/20"
                      >
                        + {a.name} ({a.price.toFixed(2)} ر.س)
                      </span>
                    ))}
                  </div>
                )}

                {/* Notes */}
                {item.notes && (
                  <div className="flex items-center gap-1.5 text-[10px] text-amber-400/90 bg-amber-500/10 px-2 py-1 rounded-lg">
                    <FiFileText className="w-3 h-3 shrink-0" />
                    <span className="truncate">ملاحظة: {item.notes}</span>
                  </div>
                )}

                {/* Quantity Controls */}
                <div className="flex items-center justify-between pt-2 border-t border-white/5">
                  <span className="text-[11px] text-neutral-400">الكمية</span>
                  <div className="flex items-center gap-2 bg-black/40 border border-white/10 px-2 py-1 rounded-xl">
                    <button
                      type="button"
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="w-6 h-6 rounded-lg bg-white/[0.05] hover:bg-white/10 text-white flex items-center justify-center transition-colors cursor-pointer"
                    >
                      <FiMinus className="w-3 h-3" />
                    </button>
                    <span className="w-5 text-center font-bold text-xs text-white">
                      {item.quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="w-6 h-6 rounded-lg bg-white/[0.05] hover:bg-white/10 text-white flex items-center justify-center transition-colors cursor-pointer"
                    >
                      <FiPlus className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer / Submit Order */}
        {cart.length > 0 && !orderSent && (
          <div className="p-4 sm:p-5 border-t border-white/10 bg-[#070709] space-y-3">
            <div className="space-y-1 text-xs">
              <div className="flex justify-between text-neutral-400">
                <span>إجمالي الأصناف ({totalItems})</span>
                <span>{subtotal.toFixed(2)} ر.س</span>
              </div>
              <div className="flex justify-between font-black text-base text-white pt-2 border-t border-white/5">
                <span>المجموع الكلي</span>
                <span className="text-primary text-lg">{totalPrice.toFixed(2)} ر.س</span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleSendOrder}
              disabled={isSubmitting}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-l from-primary to-indigo-600 hover:opacity-95 text-white font-bold text-sm shadow-xl shadow-primary/25 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-60"
            >
              {isSubmitting ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <FiCheckCircle className="w-4 h-4" />
                  <span>تأكيد وإرسال الطلب للمطبخ</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
