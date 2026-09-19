import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { FiX, FiPlus, FiMinus, FiCheck } from 'react-icons/fi';
import { cashierApi } from '../../services/cashierService';
import { useOrderType } from '../../context/OrderTypeContext';
import { useLanguage } from '../../context/LanguageContext';
import type { Product, Addon, SelectedVariation, SelectedAddon, AddToCartPayload } from '../../types/cashier';

interface ProductModalProps {
  product: Product | null;
  addons: Addon[];
  onClose: () => void;
  onAddToCart: (payload: AddToCartPayload) => void;
}

const ProductModal: React.FC<ProductModalProps> = ({
  product,
  addons,
  onClose,
  onAddToCart,
}) => {
  const { orderType } = useOrderType();
  const { dir, t, renderLocalized } = useLanguage();
  const [quantity, setQuantity] = useState(1);
  const [selectedVariations, setSelectedVariations] = useState<SelectedVariation[]>([]);
  const [selectedAddons, setSelectedAddons] = useState<SelectedAddon[]>([]);
  const [notes, setNotes] = useState('');

  // Fetch product detail with variations
  const { data: detail, isLoading } = useQuery({
    queryKey: ['product-detail', product?.id],
    queryFn: () => cashierApi.getProductDetail(product!.id),
    enabled: !!product,
  });

  // Reset state when product changes
  useEffect(() => {
    setQuantity(1);
    setSelectedVariations([]);
    setSelectedAddons([]);
    setNotes('');
  }, [product?.id]);

  if (!product) return null;

  const handleVariationSelect = (
    variationId: number,
    variationName: string,
    optionId: number,
    optionName: string,
    price: number
  ) => {
    setSelectedVariations((prev) => {
      const filtered = prev.filter((v) => v.variationId !== variationId);
      return [...filtered, { variationId, variationName, optionId, optionName, price }];
    });
  };

  const handleAddonToggle = (addon: Addon) => {
    setSelectedAddons((prev) => {
      const exists = prev.find((a) => a.addonId === addon.id);
      if (exists) {
        return prev.filter((a) => a.addonId !== addon.id);
      }
      return [...prev, { addonId: addon.id, name: addon.name, price: addon.final_price, quantity: 1 }];
    });
  };

  const handleAddonQty = (addonId: number, delta: number) => {
    setSelectedAddons((prev) =>
      prev.map((a) =>
        a.addonId === addonId ? { ...a, quantity: Math.max(1, a.quantity + delta) } : a
      )
    );
  };

  // Calculate total
  const variationsTotal = selectedVariations.reduce((sum, v) => sum + v.price, 0);
  const addonsTotal = selectedAddons.reduce((sum, a) => sum + a.price * a.quantity, 0);
  const unitPrice = product.final_price + variationsTotal + addonsTotal;
  const totalPrice = unitPrice * quantity;

  // Check if required variations are selected
  const missingRequired = detail?.variations
    ?.filter((v) => v.required && v.status)
    .filter((v) => !selectedVariations.find((sv) => sv.variationId === v.id)) || [];

  const canAdd = missingRequired.length === 0;

  const handleAdd = () => {
    if (!canAdd) return;

    // Group options by variation_id
    const variationsPayload: { variation_id: number; option_ids: number[] }[] = [];
    selectedVariations.forEach((sv) => {
      let existing = variationsPayload.find((v) => v.variation_id === sv.variationId);
      if (!existing) {
        existing = { variation_id: sv.variationId, option_ids: [] };
        variationsPayload.push(existing);
      }
      existing.option_ids.push(sv.optionId);
    });

    // Expand addons based on quantity
    const addonsPayload: { addon_id: number }[] = [];
    selectedAddons.forEach((a) => {
      for (let i = 0; i < a.quantity; i++) {
        addonsPayload.push({ addon_id: a.addonId });
      }
    });

    onAddToCart({
      module: orderType,
      product_id: product.id,
      quantity,
      notes: notes || null,
      variations: variationsPayload.length > 0 ? variationsPayload : null,
      addons: addonsPayload.length > 0 ? addonsPayload : null,
    });
    onClose();
  };

  const localizedProductName = renderLocalized(product.name) || product.name;
  const localizedProductDesc = renderLocalized(product.description) || product.description;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" dir={dir}>
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-lg max-h-[90vh] bg-white dark:bg-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col animate-in slide-in-from-bottom-4 duration-300">
        {/* Header with image */}
        <div className="relative h-48 bg-slate-100 dark:bg-slate-700 flex-shrink-0">
          {product.image && (
            <img
              src={product.image}
              alt={localizedProductName}
              className="w-full h-full object-cover"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <button
            onClick={onClose}
            className="absolute top-3 rtl:left-3 ltr:right-3 p-2 rounded-full bg-black/30 text-white hover:bg-black/50 transition-colors cursor-pointer"
          >
            <FiX className="w-5 h-5" />
          </button>
          <div className="absolute bottom-4 start-4 end-4">
            <h2 className="text-xl font-bold text-white mb-1">{localizedProductName}</h2>
            {localizedProductDesc && (
              <p className="text-white/70 text-sm line-clamp-1">{localizedProductDesc}</p>
            )}
          </div>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {isLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-20 bg-slate-100 dark:bg-slate-700 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : (
            <>
              {/* Variations */}
              {detail?.variations?.filter((v) => v.status).map((variation) => (
                <div key={variation.id}>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
                    {renderLocalized(variation.name)}
                    {variation.required && (
                      <span className="text-[10px] bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-400 px-2 py-0.5 rounded-full font-medium">
                        {t('required_field')}
                      </span>
                    )}
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {variation.options
                      .filter((o) => o.status)
                      .map((option) => {
                        const isSelected = selectedVariations.find(
                          (sv) => sv.variationId === variation.id && sv.optionId === option.id
                        );
                        return (
                          <button
                            key={option.id}
                            onClick={() =>
                              handleVariationSelect(
                                variation.id,
                                variation.name,
                                option.id,
                                option.name,
                                option.final_price
                              )
                            }
                            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all cursor-pointer ${
                              isSelected
                                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30'
                                : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                            }`}
                          >
                            {renderLocalized(option.name)}
                            {option.final_price > 0 && (
                              <span className="ms-1 opacity-75">
                                +{option.final_price.toFixed(2)}
                              </span>
                            )}
                          </button>
                        );
                      })}
                  </div>
                </div>
              ))}

              {/* Addons */}
              {addons.length > 0 && (
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-2">
                    {t('addons')}
                  </h3>
                  <div className="space-y-2">
                    {addons.map((addon) => {
                      const selected = selectedAddons.find((a) => a.addonId === addon.id);
                      return (
                        <div
                          key={addon.id}
                          className={`flex items-center gap-3 p-3 rounded-xl border transition-all cursor-pointer ${
                            selected
                              ? 'border-indigo-600 bg-indigo-500/10 dark:bg-indigo-500/10 dark:border-indigo-500/50'
                              : 'border-slate-200 dark:border-slate-700 hover:border-indigo-200 dark:hover:border-indigo-600'
                          }`}
                          onClick={() => handleAddonToggle(addon)}
                        >
                          <div
                            className={`w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                              selected
                                ? 'bg-indigo-600 border-indigo-600'
                                : 'border-slate-300 dark:border-slate-600'
                            }`}
                          >
                            {selected && <FiCheck className="w-3 h-3 text-white" />}
                          </div>
                          {addon.image && (
                            <img
                              src={addon.image}
                              alt={renderLocalized(addon.name)}
                              className="w-8 h-8 rounded-lg object-cover"
                            />
                          )}
                          <span className="text-sm font-medium text-slate-700 dark:text-slate-200 flex-1">
                            {renderLocalized(addon.name)}
                          </span>
                          {selected && (
                            <div
                              className="flex items-center gap-2"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <button
                                onClick={() => handleAddonQty(addon.id, -1)}
                                className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-600 flex items-center justify-center hover:bg-slate-300 dark:hover:bg-slate-500 cursor-pointer"
                              >
                                <FiMinus className="w-3 h-3" />
                              </button>
                              <span className="text-sm font-semibold w-5 text-center">
                                {selected.quantity}
                              </span>
                              <button
                                onClick={() => handleAddonQty(addon.id, 1)}
                                className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-600 flex items-center justify-center hover:bg-slate-300 dark:hover:bg-slate-500 cursor-pointer"
                              >
                                <FiPlus className="w-3 h-3" />
                              </button>
                            </div>
                          )}
                          <span className="text-sm font-semibold text-indigo-600 dark:text-indigo-600">
                            +{addon.final_price.toFixed(2)}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Notes */}
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-2">
                  {t('notes')}
                </h3>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder={t('notes_placeholder')}
                  rows={2}
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-600 resize-none transition-all"
                />
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="flex-shrink-0 p-4 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
          {/* Quantity */}
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-slate-600 dark:text-slate-300">{t('quantity')}</span>
            <div className="flex items-center gap-3 bg-white dark:bg-slate-700 rounded-xl border border-slate-200 dark:border-slate-600 px-1 py-1">
              <button
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-600 flex items-center justify-center hover:bg-slate-200 dark:hover:bg-slate-500 transition-colors cursor-pointer"
              >
                <FiMinus className="w-4 h-4" />
              </button>
              <span className="text-lg font-bold w-8 text-center text-slate-900 dark:text-white">
                {quantity}
              </span>
              <button
                onClick={() => setQuantity((q) => q + 1)}
                className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-600 flex items-center justify-center hover:bg-slate-200 dark:hover:bg-slate-500 transition-colors cursor-pointer"
              >
                <FiPlus className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Add button */}
          <button
            onClick={handleAdd}
            disabled={!canAdd}
            className="w-full py-3.5 rounded-xl bg-gradient-to-l from-indigo-600 to-violet-600 text-white font-bold text-base hover:from-violet-600 hover:to-violet-600 active:scale-[0.98] transition-all shadow-lg shadow-indigo-500/25 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 cursor-pointer"
          >
            <FiPlus className="w-5 h-5" />
            <span>{t('add_to_cart')}</span>
            <span className="bg-white/20 px-3 py-0.5 rounded-full text-sm">
              {totalPrice.toFixed(2)} {t('currency')}
            </span>
          </button>

          {missingRequired.length > 0 && (
            <p className="text-center text-xs text-red-500 mt-2">
              {t('please_select')}: {missingRequired.map((v) => renderLocalized(v.name) || v.name).join('، ')}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductModal;
