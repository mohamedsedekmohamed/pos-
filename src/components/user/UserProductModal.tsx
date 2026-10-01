import React, { useState, useEffect, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  FiX,
  FiPlus,
  FiMinus,
  FiCheck,
  FiShoppingBag,
  FiAlertCircle,
  FiLoader,
} from 'react-icons/fi';
import { userApi } from '../../services/userService';
import { formatImageUrl } from '../../hooks/useBusinessSetup';
import { useLanguage } from '../../context/LanguageContext';
import { useUserCart } from '../../context/UserCartContext';
import type {
  UserProduct,
  UserProductDetail,
  UserAddon,
  UserCartVariationPayload,
  UserCartAddonPayload,
} from '../../types/user';

interface UserProductModalProps {
  product: UserProduct | null;
  onClose: () => void;
  onSuccess?: () => void;
}

export const UserProductModal: React.FC<UserProductModalProps> = ({
  product,
  onClose,
  onSuccess,
}) => {
  const { language } = useLanguage();
  const { addToCart, isAdding, openCart } = useUserCart();

  const [quantity, setQuantity] = useState(1);
  const [notes, setNotes] = useState('');
  // Map of variationId -> selected optionId
  const [selectedVariations, setSelectedVariations] = useState<Record<number, number>>({});
  // Set of selected addon IDs
  const [selectedAddonIds, setSelectedAddonIds] = useState<Set<number>>(new Set());
  const [validationError, setValidationError] = useState<string | null>(null);

  // Fetch full product detail with variations
  const { data: productDetail, isLoading: isLoadingDetail } = useQuery<UserProductDetail>({
    queryKey: ['user-product-detail', product?.id, language],
    queryFn: () => userApi.getProductDetail(product!.id, language),
    enabled: Boolean(product?.id),
    staleTime: 1000 * 60 * 5,
  });

  // Fetch addons
  const { data: addons = [] } = useQuery<UserAddon[]>({
    queryKey: ['user-addons', language],
    queryFn: () => userApi.getAddons(language),
    staleTime: 1000 * 60 * 10,
  });

  // Reset state when product changes
  useEffect(() => {
    if (product) {
      setQuantity(1);
      setNotes('');
      setSelectedAddonIds(new Set());
      setValidationError(null);
    }
  }, [product]);

  // Set default selection for required variations once loaded
  useEffect(() => {
    if (productDetail?.variations) {
      const initial: Record<number, number> = {};
      productDetail.variations.forEach((v) => {
        if (v.required && v.options && v.options.length > 0) {
          initial[v.id] = v.options[0].id;
        }
      });
      setSelectedVariations(initial);
    }
  }, [productDetail]);

  // Price calculations
  const basePrice = Number(productDetail?.final_price || product?.final_price || product?.price || 0);

  const variationsExtra = useMemo(() => {
    if (!productDetail?.variations) return 0;
    let sum = 0;
    productDetail.variations.forEach((v) => {
      const selectedOptionId = selectedVariations[v.id];
      if (selectedOptionId) {
        const opt = v.options.find((o) => o.id === selectedOptionId);
        if (opt) {
          sum += Number(opt.final_price || opt.price || 0);
        }
      }
    });
    return sum;
  }, [productDetail, selectedVariations]);

  const addonsExtra = useMemo(() => {
    let sum = 0;
    addons.forEach((addon) => {
      if (selectedAddonIds.has(addon.id)) {
        sum += Number(addon.final_price || addon.price || 0);
      }
    });
    return sum;
  }, [addons, selectedAddonIds]);

  const itemUnitPrice = basePrice + variationsExtra + addonsExtra;
  const totalPrice = itemUnitPrice * quantity;

  // Handlers
  const handleVariationSelect = (variationId: number, optionId: number) => {
    setSelectedVariations((prev) => ({
      ...prev,
      [variationId]: optionId,
    }));
    setValidationError(null);
  };

  const handleToggleAddon = (addonId: number) => {
    setSelectedAddonIds((prev) => {
      const next = new Set(prev);
      if (next.has(addonId)) {
        next.delete(addonId);
      } else {
        next.add(addonId);
      }
      return next;
    });
  };

  const handleAddToCart = async () => {
    if (!product) return;

    // Validate required variations
    if (productDetail?.variations) {
      for (const v of productDetail.variations) {
        if (v.required && !selectedVariations[v.id]) {
          setValidationError(`يرجى تحديد اختيار لـ: ${v.name}`);
          return;
        }
      }
    }

    const variationsPayload: UserCartVariationPayload[] = Object.entries(selectedVariations).map(
      ([varId, optId]) => ({
        variation_id: Number(varId),
        option_ids: [optId],
      })
    );

    const addonsPayload: UserCartAddonPayload[] = Array.from(selectedAddonIds).map((addonId) => ({
      addon_id: addonId,
    }));

    try {
      await addToCart({
        product_id: product.id,
        quantity,
        notes: notes.trim() || undefined,
        variations: variationsPayload.length > 0 ? variationsPayload : undefined,
        addons: addonsPayload.length > 0 ? addonsPayload : undefined,
      });

      onClose();
      openCart();
      if (onSuccess) onSuccess();
    } catch (err: any) {
      const message = err.response?.data?.message || 'حدث خطأ أثناء الإضافة إلى السلة';
      setValidationError(message);
    }
  };

  if (!product) return null;

  const imageUrl = formatImageUrl(product.image);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/60 dark:bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-lg max-h-[92vh] sm:max-h-[90vh] bg-white dark:bg-[#121218] border border-slate-200 dark:border-white/10 rounded-2xl sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden text-right text-slate-900 dark:text-white transition-colors"
        dir="rtl"
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-3 left-3 sm:top-4 sm:left-4 z-20 w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-black/50 hover:bg-black/70 border border-white/20 text-white flex items-center justify-center transition-all backdrop-blur-sm cursor-pointer shadow-md"
          aria-label="Close"
        >
          <FiX className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto no-scrollbar">
          {/* Hero Image */}
          <div className="relative aspect-[2/1] sm:aspect-[16/9] w-full bg-slate-100 dark:bg-[#0c0c10] overflow-hidden">
            {imageUrl ? (
              <img
                src={imageUrl}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-4xl sm:text-5xl">
                🍽️
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-white/90 dark:from-[#121218] via-transparent to-black/30 pointer-events-none" />
          </div>

          <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
            {/* Title & Description */}
            <div>
              <div className="flex items-start justify-between gap-3 mb-1.5 sm:mb-2">
                <h2 className="text-lg sm:text-2xl font-bold text-slate-900 dark:text-white leading-tight">
                  {product.name}
                </h2>
                <div className="text-left shrink-0">
                  <span className="text-base sm:text-lg font-black text-primary">
                    {basePrice.toFixed(2)}
                  </span>
                  <span className="text-xs text-slate-500 dark:text-neutral-400 mr-1 font-semibold">ج.م</span>
                </div>
              </div>

              {product.description && (
                <p className="text-sm text-slate-600 dark:text-neutral-300 leading-relaxed">
                  {product.description}
                </p>
              )}
            </div>

            {/* Error Banner */}
            {validationError && (
              <div className="flex items-center gap-2 p-3 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-500 dark:text-red-400 text-xs font-bold animate-in fade-in">
                <FiAlertCircle className="w-4 h-4 shrink-0" />
                <span>{validationError}</span>
              </div>
            )}

            {/* Variations Section */}
            {isLoadingDetail ? (
              <div className="flex items-center justify-center py-6 text-slate-400 dark:text-neutral-400 gap-2 text-xs">
                <FiLoader className="w-4 h-4 animate-spin text-primary" />
                <span>جاري تحميل خيارات المنتج...</span>
              </div>
            ) : (
              productDetail?.variations &&
              productDetail.variations.length > 0 && (
                <div className="space-y-4">
                  {productDetail.variations.map((variation) => (
                    <div
                      key={variation.id}
                      className="p-4 rounded-2xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200/80 dark:border-white/5 space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-bold text-slate-900 dark:text-white">
                          {variation.name}
                        </span>
                        {variation.required ? (
                          <span className="px-2 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-600 dark:text-amber-400 text-[10px] font-bold">
                            إجباري
                          </span>
                        ) : (
                          <span className="text-[11px] text-slate-400 dark:text-neutral-500">اختياري</span>
                        )}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {variation.options.map((option) => {
                          const isSelected = selectedVariations[variation.id] === option.id;
                          const optPrice = Number(option.final_price || option.price || 0);

                          return (
                            <button
                              key={option.id}
                              type="button"
                              onClick={() => handleVariationSelect(variation.id, option.id)}
                              className={`flex items-center justify-between p-3 rounded-xl border text-right transition-all cursor-pointer ${
                                isSelected
                                  ? 'bg-primary/10 border-primary text-primary dark:text-white shadow-sm'
                                  : 'bg-white dark:bg-black/20 hover:bg-slate-100 dark:hover:bg-black/40 border-slate-200 dark:border-white/5 text-slate-700 dark:text-neutral-300'
                              }`}
                            >
                              <div className="flex items-center gap-2">
                                <div
                                  className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                                    isSelected
                                      ? 'border-primary bg-primary text-white'
                                      : 'border-slate-300 dark:border-white/20 bg-slate-100 dark:bg-black/40'
                                  }`}
                                >
                                  {isSelected && <FiCheck className="w-3 h-3 stroke-[3]" />}
                                </div>
                                <span className="text-xs font-bold">{option.name}</span>
                              </div>

                              {optPrice > 0 && (
                                <span className="text-xs font-semibold text-primary">
                                  +{optPrice.toFixed(2)} ج.م
                                </span>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )
            )}

            {/* Addons Section */}
            {addons.length > 0 && (
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200/80 dark:border-white/5 space-y-3">
                <span className="text-sm font-bold text-slate-900 dark:text-white block">
                  إضافات جانبية (اختياري)
                </span>

                <div className="space-y-2">
                  {addons.map((addon) => {
                    const isSelected = selectedAddonIds.has(addon.id);
                    const addonPrice = Number(addon.final_price || addon.price || 0);
                    const addonImg = formatImageUrl(addon.image);

                    return (
                      <button
                        key={addon.id}
                        type="button"
                        onClick={() => handleToggleAddon(addon.id)}
                        className={`w-full flex items-center justify-between p-2.5 rounded-xl border text-right transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-800 dark:text-white'
                            : 'bg-white dark:bg-black/20 hover:bg-slate-100 dark:hover:bg-black/40 border-slate-200 dark:border-white/5 text-slate-700 dark:text-neutral-300'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <div
                            className={`w-4 h-4 rounded-md border flex items-center justify-center ${
                              isSelected
                                ? 'border-emerald-500 bg-emerald-500 text-white'
                                : 'border-slate-300 dark:border-white/20 bg-slate-100 dark:bg-black/40'
                            }`}
                          >
                            {isSelected && <FiCheck className="w-3 h-3 stroke-[3]" />}
                          </div>

                          {addonImg && (
                            <img
                              src={addonImg}
                              alt={addon.name}
                              className="w-8 h-8 rounded-lg object-cover"
                            />
                          )}

                          <span className="text-xs font-bold">{addon.name}</span>
                        </div>

                        <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                          +{addonPrice.toFixed(2)} ج.م
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Special Instructions / Notes */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 dark:text-neutral-300 block">
                ملاحظات خاصة (مثال: بدون بصل، صوص خارجي)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
                placeholder="أضف أي تعليمات ترغب في إبلاغ الشيف بها..."
                className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white text-xs placeholder:text-slate-400 dark:placeholder:text-neutral-500 focus:outline-none focus:border-primary transition-all resize-none"
              />
            </div>
          </div>
        </div>

        {/* Footer: Quantity Stepper & Add to Cart Button */}
        <div className="p-3 sm:p-5 bg-slate-50 dark:bg-[#0e0e14] border-t border-slate-200 dark:border-white/10 flex items-center justify-between gap-2.5 sm:gap-3">
          {/* Quantity Stepper */}
          <div className="flex items-center bg-white dark:bg-black/40 p-0.5 sm:p-1 rounded-xl sm:rounded-2xl border border-slate-200 dark:border-white/10 shadow-sm">
            <button
              type="button"
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              disabled={quantity <= 1}
              className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg sm:rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-white/[0.04] dark:hover:bg-white/[0.08] disabled:opacity-30 text-slate-800 dark:text-white flex items-center justify-center transition-all cursor-pointer"
            >
              <FiMinus className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
            </button>
            <span className="w-7 sm:w-8 text-center text-xs sm:text-sm font-black text-slate-900 dark:text-white">
              {quantity}
            </span>
            <button
              type="button"
              onClick={() => setQuantity((q) => q + 1)}
              className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg sm:rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-white/[0.04] dark:hover:bg-white/[0.08] text-slate-800 dark:text-white flex items-center justify-center transition-all cursor-pointer"
            >
              <FiPlus className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
            </button>
          </div>

          {/* Submit Add to Cart Button */}
          <button
            type="button"
            onClick={handleAddToCart}
            disabled={isAdding}
            className="flex-1 flex items-center justify-between px-3.5 sm:px-5 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl bg-gradient-to-r from-primary to-indigo-600 hover:from-primary/90 hover:to-indigo-500 disabled:opacity-50 text-white font-bold text-xs sm:text-sm shadow-xl shadow-primary/20 transition-all hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
          >
            <div className="flex items-center gap-1.5 sm:gap-2">
              {isAdding ? (
                <FiLoader className="w-3.5 h-3.5 sm:w-4 sm:h-4 animate-spin" />
              ) : (
                <FiShoppingBag className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              )}
              <span>{isAdding ? 'جاري الإضافة...' : 'إضافة إلى السلة'}</span>
            </div>

            <div className="flex items-baseline gap-1">
              <span className="text-sm sm:text-base font-black">{totalPrice.toFixed(2)}</span>
              <span className="text-[10px] sm:text-xs font-semibold opacity-90">ج.م</span>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};
