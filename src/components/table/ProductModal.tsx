import React, { useState, useEffect, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { tableApi } from '../../services/tableService';
import { useTableContext } from '../../context/TableContext';
import { useTableCart } from '../../context/TableCartContext';
import type {
  TableProduct,
  TableAddon,
  SelectedVariationState,
  SelectedAddonState,
} from '../../types/table';
import {
  FiX,
  FiPlus,
  FiMinus,
  FiCheck,
  FiAlertCircle,
  FiShoppingBag,
  FiImage,
} from 'react-icons/fi';

interface ProductModalProps {
  product: TableProduct | null;
  onClose: () => void;
  availableAddons: TableAddon[];
}

export const ProductModal: React.FC<ProductModalProps> = ({
  product,
  onClose,
  availableAddons,
}) => {
  const { lang } = useTableContext();
  const { addToCart } = useTableCart();

  const [quantity, setQuantity] = useState(1);
  const [selectedVariations, setSelectedVariations] = useState<Record<number, SelectedVariationState>>({});
  const [selectedAddons, setSelectedAddons] = useState<Record<number, SelectedAddonState>>({});
  const [notes, setNotes] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);

  // Fetch Full Product Detail with Variations
  const { data: productDetail, isLoading } = useQuery({
    queryKey: ['tableProductDetail', product?.id, lang],
    queryFn: () => tableApi.getProductDetail(product!.id, lang),
    enabled: !!product?.id,
  });

  // Reset state when product changes
  useEffect(() => {
    setQuantity(1);
    setSelectedVariations({});
    setSelectedAddons({});
    setNotes('');
    setValidationError(null);
  }, [product?.id]);

  // Pre-select first option for required variations if available
  useEffect(() => {
    if (productDetail?.variations) {
      const initialVars: Record<number, SelectedVariationState> = {};
      productDetail.variations.forEach((v) => {
        if (v.required && v.options?.length > 0) {
          const firstOpt = v.options[0];
          initialVars[v.id] = {
            variationId: v.id,
            variationName: v.name,
            optionId: firstOpt.id,
            optionName: firstOpt.name,
            price: firstOpt.price || firstOpt.final_price || 0,
          };
        }
      });
      setSelectedVariations(initialVars);
    }
  }, [productDetail]);

  // Calculate Dynamic Total Price
  const grandTotal = useMemo(() => {
    const basePrice = productDetail?.final_price ?? product?.final_price ?? 0;
    const variationsSum = Object.values(selectedVariations).reduce(
      (sum, v) => sum + (v.price || 0),
      0
    );
    const addonsSum = Object.values(selectedAddons).reduce(
      (sum, a) => sum + (a.price || 0) * (a.quantity || 1),
      0
    );
    const perUnit = basePrice + variationsSum + addonsSum;
    return perUnit * quantity;
  }, [productDetail, product, selectedVariations, selectedAddons, quantity]);

  if (!product) return null;

  // Handle Variation Option Select
  const handleSelectOption = (
    variationId: number,
    variationName: string,
    optionId: number,
    optionName: string,
    price: number
  ) => {
    setSelectedVariations((prev) => ({
      ...prev,
      [variationId]: {
        variationId,
        variationName,
        optionId,
        optionName,
        price,
      },
    }));
    setValidationError(null);
  };

  // Handle Addon Toggle
  const handleToggleAddon = (addon: TableAddon) => {
    setSelectedAddons((prev) => {
      const updated = { ...prev };
      if (updated[addon.id]) {
        delete updated[addon.id];
      } else {
        updated[addon.id] = {
          addonId: addon.id,
          name: addon.name,
          price: addon.final_price || addon.price || 0,
          quantity: 1,
        };
      }
      return updated;
    });
  };

  // Submit to Cart
  const handleAddToCart = () => {
    // Validate required variations
    if (productDetail?.variations) {
      for (const variation of productDetail.variations) {
        if (variation.required && !selectedVariations[variation.id]) {
          setValidationError(`يرجى اختيار أحد خيارات "${variation.name}" للمتابعة.`);
          return;
        }
      }
    }

    addToCart({
      productId: product.id,
      name: product.name,
      image: product.image,
      unitPrice: product.final_price ?? product.price ?? 0,
      quantity,
      selectedVariations: Object.values(selectedVariations),
      selectedAddons: Object.values(selectedAddons),
      notes: notes.trim() || undefined,
    });

    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200 select-none"
      dir="rtl"
      onClick={onClose}
    >
      {/* Modal / Bottom Sheet Window */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-lg max-h-[90vh] sm:max-h-[85vh] flex flex-col bg-[#0e0e12] border border-white/15 rounded-t-[2.5rem] sm:rounded-3xl shadow-2xl shadow-black overflow-hidden animate-in slide-in-from-bottom duration-300"
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 left-4 z-20 w-9 h-9 rounded-full bg-black/60 hover:bg-black text-white/80 hover:text-white border border-white/10 flex items-center justify-center backdrop-blur-md transition-all cursor-pointer"
        >
          <FiX className="w-5 h-5" />
        </button>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-white/10 pb-24">
          {/* Hero Image */}
          <div className="relative w-full h-52 sm:h-64 bg-white/[0.03] overflow-hidden flex items-center justify-center">
            {product.image ? (
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <FiImage className="w-12 h-12 text-neutral-600" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-[#0e0e12] via-transparent to-black/30" />
          </div>

          {/* Product Header */}
          <div className="px-5 pt-3 pb-4">
            <h2 className="text-xl sm:text-2xl font-black text-white mb-1.5">
              {product.name}
            </h2>
            {product.description && (
              <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed mb-3">
                {product.description}
              </p>
            )}

            <div className="flex items-baseline gap-2">
              <span className="text-xl sm:text-2xl font-black text-primary">
                {(product.final_price || product.price || 0).toFixed(2)}
              </span>
              <span className="text-xs text-neutral-400">ر.س السعر الأساسي</span>
            </div>
          </div>

          {/* Error message */}
          {validationError && (
            <div className="mx-5 mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-bold flex items-center gap-2 animate-in shake duration-200">
              <FiAlertCircle className="w-4 h-4 shrink-0" />
              <span>{validationError}</span>
            </div>
          )}

          {/* Loading Indicator */}
          {isLoading && (
            <div className="py-8 flex flex-col items-center justify-center gap-2 text-neutral-400">
              <div className="w-7 h-7 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              <span className="text-xs">جاري تحميل خيارات المنتج...</span>
            </div>
          )}

          {/* Variations Section */}
          {productDetail?.variations && productDetail.variations.length > 0 && (
            <div className="px-5 space-y-6 pt-2">
              {productDetail.variations.map((v) => (
                <div key={v.id} className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-sm text-white flex items-center gap-1.5">
                      <span>{v.name}</span>
                      {v.required && (
                        <span className="text-red-500 font-bold text-xs">* (إجباري)</span>
                      )}
                    </h4>
                    <span className="text-[11px] text-neutral-500">اختر خياراً واحداً</span>
                  </div>

                  {/* Options List */}
                  <div className="space-y-2">
                    {v.options.map((opt) => {
                      const isSelected = selectedVariations[v.id]?.optionId === opt.id;
                      const optPrice = opt.price || opt.final_price || 0;

                      return (
                        <div
                          key={opt.id}
                          onClick={() =>
                            handleSelectOption(v.id, v.name, opt.id, opt.name, optPrice)
                          }
                          className={`flex items-center justify-between p-3.5 rounded-2xl border transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-primary/10 border-primary shadow-sm'
                              : 'bg-white/[0.03] hover:bg-white/[0.06] border-white/10'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-5 h-5 rounded-full border flex items-center justify-center transition-all ${
                                isSelected
                                  ? 'border-primary bg-primary text-white'
                                  : 'border-white/30 bg-transparent'
                              }`}
                            >
                              {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
                            </div>
                            <span
                              className={`text-sm font-bold ${
                                isSelected ? 'text-white' : 'text-neutral-300'
                              }`}
                            >
                              {opt.name}
                            </span>
                          </div>

                          {optPrice > 0 ? (
                            <span className="text-xs font-bold text-primary">
                              +{optPrice.toFixed(2)} ر.س
                            </span>
                          ) : (
                            <span className="text-[11px] text-neutral-500">مشول بالسعر</span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Addons Cross-Selling Section */}
          {availableAddons && availableAddons.length > 0 && (
            <div className="px-5 mt-6 pt-5 border-t border-white/5 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-sm text-white">إضافات ننصح بها</h4>
                <span className="text-[11px] text-neutral-500">اختياري</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {availableAddons.map((addon) => {
                  const isChecked = !!selectedAddons[addon.id];
                  const addonPrice = addon.final_price || addon.price || 0;

                  return (
                    <div
                      key={addon.id}
                      onClick={() => handleToggleAddon(addon)}
                      className={`flex items-center justify-between p-3 rounded-2xl border transition-all cursor-pointer ${
                        isChecked
                          ? 'bg-primary/10 border-primary'
                          : 'bg-white/[0.03] hover:bg-white/[0.05] border-white/10'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div
                          className={`w-5 h-5 rounded-lg border flex items-center justify-center transition-all ${
                            isChecked
                              ? 'bg-primary border-primary text-white'
                              : 'border-white/30 bg-transparent'
                          }`}
                        >
                          {isChecked && <FiCheck className="w-3.5 h-3.5" />}
                        </div>
                        <span className="text-xs font-bold text-neutral-200 truncate">
                          {addon.name}
                        </span>
                      </div>

                      <span className="text-xs font-bold text-primary shrink-0">
                        +{addonPrice.toFixed(2)} ر.س
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Customer Special Notes */}
          <div className="px-5 mt-6 pt-5 border-t border-white/5 space-y-2">
            <label className="block text-xs font-bold text-neutral-300">
              ملاحظات خاصة على الطلب
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="مثلاً: بدون بصل، زيادة صوص، مقرمش..."
              className="w-full px-4 py-3 rounded-2xl bg-white/[0.04] border border-white/10 text-white placeholder-neutral-500 text-xs focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
            />
          </div>
        </div>

        {/* Fixed Bottom Action Bar */}
        <div className="absolute bottom-0 inset-x-0 bg-[#0e0e12]/95 backdrop-blur-xl border-t border-white/10 p-4 sm:p-5 flex items-center gap-3">
          {/* Quantity Stepper */}
          <div className="flex items-center gap-2 bg-white/[0.05] border border-white/10 px-2 py-1.5 rounded-2xl">
            <button
              type="button"
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              disabled={quantity <= 1}
              className="w-8 h-8 rounded-xl bg-white/[0.05] hover:bg-white/10 text-white flex items-center justify-center transition-colors disabled:opacity-40 cursor-pointer"
            >
              <FiMinus className="w-3.5 h-3.5" />
            </button>
            <span className="w-6 text-center font-black text-sm text-white">
              {quantity}
            </span>
            <button
              type="button"
              onClick={() => setQuantity((q) => q + 1)}
              className="w-8 h-8 rounded-xl bg-white/[0.05] hover:bg-white/10 text-white flex items-center justify-center transition-colors cursor-pointer"
            >
              <FiPlus className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Submit Button */}
          <button
            type="button"
            onClick={handleAddToCart}
            className="flex-1 py-3.5 px-4 rounded-2xl bg-gradient-to-l from-primary to-indigo-600 hover:opacity-95 active:scale-[0.99] text-white font-bold text-sm shadow-xl shadow-primary/25 flex items-center justify-between transition-all cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <FiShoppingBag className="w-4 h-4" />
              <span>إضافة إلى السلة</span>
            </div>
            <span className="font-black text-base">{grandTotal.toFixed(2)} ر.س</span>
          </button>
        </div>
      </div>
    </div>
  );
};
