import React from 'react';
import { FiAlertTriangle, FiCheck, FiX, FiLoader } from 'react-icons/fi';
import { useLanguage } from '../../context/LanguageContext';

interface StockRecipeConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isSubmitting?: boolean;
  serverMessage?: string;
  productName?: string;
}

const StockRecipeConfirmModal: React.FC<StockRecipeConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  isSubmitting = false,
  serverMessage,
  productName,
}) => {
  const { dir, t } = useLanguage();

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
      dir={dir}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0"
        onClick={!isSubmitting ? onClose : undefined}
      />

      {/* Modal Content */}
      <div className="relative w-full max-w-md bg-white dark:bg-slate-800 rounded-3xl shadow-2xl border border-slate-100 dark:border-slate-700 overflow-hidden p-6 z-10 animate-in zoom-in-95 duration-200">
        {/* Warning Icon */}
        <div className="w-16 h-16 rounded-2xl bg-amber-500/10 text-amber-500 dark:text-amber-400 border border-amber-500/20 flex items-center justify-center mx-auto mb-4 shadow-inner">
          <FiAlertTriangle className="w-8 h-8" />
        </div>

        {/* Title */}
        <div className="text-center mb-3">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">
            {t('recipe_stock_alert_title', 'الستوك غير كافٍ / نفدت مكونات الوصفة')}
          </h3>
          {productName && (
            <span className="inline-block mt-1 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-700/60 text-slate-700 dark:text-slate-300 text-xs font-semibold">
              {productName}
            </span>
          )}
        </div>

        {/* Server Message if exists */}
        {serverMessage && (
          <div className="mb-4 p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50 text-xs text-amber-800 dark:text-amber-200 text-center leading-relaxed">
            {serverMessage}
          </div>
        )}

        {/* Description / Prompt */}
        <div className="text-center space-y-2 mb-6 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
          <p>
            {t(
              'recipe_stock_alert_desc',
              'كمية المنتج أو بعض مكونات الوصفة (Recipe) غير متوفرة في المخزون حالياً.'
            )}
          </p>
          <p className="font-semibold text-slate-800 dark:text-slate-200">
            {t(
              'recipe_stock_alert_prompt',
              'هل ترغب في المتابعة وإضافة المنتج للسلة بدون خصم من الوصفة (Without Recipe)؟'
            )}
          </p>
        </div>

        {/* Actions (Yes / No) */}
        <div className="grid grid-cols-2 gap-3">
          {/* No / Cancel */}
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="flex items-center justify-center gap-2 px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-sm hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors disabled:opacity-50 cursor-pointer"
          >
            <FiX className="w-4 h-4" />
            <span>{t('cancel_action', 'لا، إلغاء')}</span>
          </button>

          {/* Yes / Confirm without recipe */}
          <button
            type="button"
            onClick={onConfirm}
            disabled={isSubmitting}
            className="flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-semibold text-sm shadow-lg shadow-amber-500/25 transition-all duration-200 disabled:opacity-50 cursor-pointer"
          >
            {isSubmitting ? (
              <>
                <FiLoader className="w-4 h-4 animate-spin" />
                <span>{t('loading', 'جاري الإضافة...')}</span>
              </>
            ) : (
              <>
                <FiCheck className="w-4 h-4" />
                <span>{t('add_without_recipe', 'نعم، أضف بدون خصم')}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default StockRecipeConfirmModal;
