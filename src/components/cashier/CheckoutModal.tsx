import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { FiX, FiCheck, FiShoppingBag, FiCoffee, FiTruck, FiCreditCard } from 'react-icons/fi';
import { useOrderType } from '../../context/OrderTypeContext';
import { useLanguage } from '../../context/LanguageContext';
import { useShift } from '../../context/ShiftContext';
import { cashierApi } from '../../services/cashierService';
import type { CheckoutPayload } from '../../types/cashier';
import TableSelector from './TableSelector';

export interface CheckoutMeta {
  tableName?: string;
}

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCheckout: (payload: CheckoutPayload, meta?: CheckoutMeta) => void;
  isSubmitting: boolean;
}

const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  onCheckout,
  isSubmitting,
}) => {
  const { orderType, orderTypeLabel, selectedTable } = useOrderType();
  const { activeShift } = useShift();
  const { dir, t, language, renderLocalized } = useLanguage();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [note, setNote] = useState('');
  const [hallTableId, setHallTableId] = useState<number | ''>(selectedTable?.id ?? '');
  const [tableName, setTableName] = useState<string>(selectedTable?.name ?? '');
  const [financialAccountId, setFinancialAccountId] = useState<number | ''>('');

  // Fetch financial accounts
  const { data: accounts = [], isLoading: loadingAccounts } = useQuery({
    queryKey: ['cashier', 'financial-accounts', language],
    queryFn: () => cashierApi.getFinancialAccounts({ lang: language }),
    enabled: isOpen,
  });

  // Auto-select first account or shift account if available
  useEffect(() => {
    if (accounts.length > 0) {
      if (financialAccountId === '') {
        const preferred = activeShift?.financial_account_id
          ? accounts.find((a) => a.id === activeShift.financial_account_id)
          : null;
        setFinancialAccountId(preferred ? preferred.id : accounts[0].id);
      }
    } else if (activeShift?.financial_account_id && financialAccountId === '') {
      setFinancialAccountId(activeShift.financial_account_id);
    } else if (financialAccountId === '') {
      setFinancialAccountId(1);
    }
  }, [accounts, activeShift, financialAccountId]);

  useEffect(() => {
    if (selectedTable) {
      setHallTableId(selectedTable.id);
      setTableName(selectedTable.name);
    }
  }, [selectedTable]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalAccountId = financialAccountId !== ''
      ? Number(financialAccountId)
      : (activeShift?.financial_account_id ? Number(activeShift.financial_account_id) : 1);

    if (orderType === 'dinein' && hallTableId === '') {
      return; // Prevent submission if no table is selected
    }
    onCheckout(
      {
        module: orderType,
        financial_account_id: finalAccountId,
        name: name || null,
        phone: phone || null,
        address: orderType === 'delivery' ? (address || null) : null,
        note: note || null,
        hall_table_id: orderType === 'dinein' && hallTableId !== '' ? Number(hallTableId) : null,
      },
      {
        tableName: orderType === 'dinein' ? tableName : undefined,
      }
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" dir={dir}>
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={!isSubmitting ? onClose : undefined} />

      {/* Modal */}
      <div className={`relative w-full transition-all duration-300 ${orderType === 'dinein' ? 'max-w-3xl' : 'max-w-md'} bg-white dark:bg-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col animate-in slide-in-from-bottom-4`}>
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">{t('checkout')}</h2>
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="p-2 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-500 hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors disabled:opacity-50 cursor-pointer"
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto">
          <form id="checkout-form" onSubmit={handleSubmit} className="space-y-4">
            
            {/* Active Order Type Banner */}
            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-indigo-50/80 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/20">
              <div className="flex items-center gap-2.5">
                <span className="p-2 rounded-xl bg-gradient-to-tr from-primary to-indigo-600 text-white text-xs shadow-md shadow-primary/20">
                  {orderType === 'takeaway' && <FiShoppingBag className="w-4 h-4" />}
                  {orderType === 'dinein' && <FiCoffee className="w-4 h-4" />}
                  {orderType === 'delivery' && <FiTruck className="w-4 h-4" />}
                </span>
                <div>
                  <span className="block text-[11px] text-slate-500 dark:text-slate-400">{t('order_type_confirmed')}:</span>
                  <span className="block text-sm font-bold text-slate-900 dark:text-white">
                    {orderTypeLabel}
                  </span>
                </div>
              </div>
              <span className="text-[11px] text-slate-400 dark:text-slate-500 bg-white/60 dark:bg-slate-700/50 px-2.5 py-1 rounded-lg border border-slate-200/50 dark:border-slate-600/50">
                {t('set_from_navbar')}
              </span>
            </div>

            {/* Financial Account Payment Selector (Required) */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-sm font-bold text-slate-800 dark:text-white flex items-center gap-1.5">
                  <FiCreditCard className="w-4 h-4 text-primary" />
                  <span>{t('payment_account')}</span>
                  <span className="text-red-500">*</span>
                </label>
                {loadingAccounts && (
                  <span className="text-xs text-slate-400">...</span>
                )}
              </div>

              {accounts.length === 0 && !loadingAccounts ? (
                <div className="space-y-1">
                  <div
                    onClick={() => setFinancialAccountId(activeShift?.financial_account_id || 1)}
                    className="p-3 rounded-2xl bg-primary/10 border-2 border-primary text-primary flex items-center justify-between cursor-pointer shadow-xs"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-primary/20 text-primary flex items-center justify-center shrink-0">
                        <FiCreditCard className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="block text-xs font-bold text-slate-900 dark:text-white">
                          {activeShift?.financial_account?.name || 'الخزينة النقدية الرئيسية (معتمد)'}
                        </span>
                        <span className="block text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                          تم اعتماد حساب الدفع التلقائي للوردية
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs font-bold text-primary">
                      <FiCheck className="w-4 h-4 shrink-0" />
                      <span className="text-[11px] bg-primary/15 px-2 py-0.5 rounded-md">محدد</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {accounts.map((acc) => {
                    const isSelected = financialAccountId === acc.id;
                    const accName = renderLocalized(acc.name) || (typeof acc.name === 'string' ? acc.name : `Account #${acc.id}`);
                    return (
                      <button
                        key={acc.id}
                        type="button"
                        onClick={() => setFinancialAccountId(acc.id)}
                        className={`flex items-center gap-2 p-2.5 rounded-xl border text-start transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-primary/10 border-primary dark:bg-primary/20 dark:border-primary text-primary shadow-xs ring-2 ring-primary/30'
                            : 'bg-slate-50 dark:bg-slate-700/40 border-slate-200 dark:border-slate-600/80 text-slate-700 dark:text-slate-300 hover:border-primary/50'
                        }`}
                      >
                        {acc.icon ? (
                          <img
                            src={acc.icon}
                            alt=""
                            className="w-6 h-6 object-contain rounded-md shrink-0"
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display = 'none';
                            }}
                          />
                        ) : (
                          <div
                            className={`w-6 h-6 rounded-md flex items-center justify-center shrink-0 text-xs ${
                              isSelected
                                ? 'bg-primary text-white'
                                : 'bg-slate-200 dark:bg-slate-600 text-slate-600 dark:text-slate-300'
                            }`}
                          >
                            <FiCreditCard className="w-3.5 h-3.5" />
                          </div>
                        )}
                        <span className="text-xs font-bold truncate leading-tight">
                          {accName}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
              {accounts.length > 0 && financialAccountId === '' && (
                <p className="text-xs text-red-500">{t('payment_account_required')}</p>
              )}
            </div>

            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{t('customer_name')}</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={255}
                className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-600 transition-all dark:text-white"
                placeholder={t('optional')}
              />
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{t('customer_phone')}</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                maxLength={50}
                className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-600 transition-all dark:text-white"
                placeholder={t('optional')}
              />
            </div>

            {/* Address (Only for delivery) */}
            {orderType === 'delivery' && (
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{t('delivery_address')}</label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-600 transition-all dark:text-white"
                  placeholder={t('delivery_address_placeholder')}
                  required
                />
              </div>
            )}

            {/* Hall Table (Only for dine-in) */}
            {orderType === 'dinein' && (
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">{t('choose_table')}</label>
                <TableSelector
                  selectedTableId={hallTableId}
                  onSelectTable={(id, name) => {
                    setHallTableId(id);
                    if (name) setTableName(name);
                  }}
                />
                {hallTableId === '' && (
                  <p className="text-xs text-red-500 mt-2">{t('select_table_error')}</p>
                )}
              </div>
            )}

            {/* Note */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{t('order_notes')}</label>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={2}
                className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-600 transition-all resize-none dark:text-white"
                placeholder={t('notes_placeholder')}
              />
            </div>

          </form>
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 mt-auto">
          <button
            type="submit"
            form="checkout-form"
            disabled={isSubmitting || (orderType === 'dinein' && hallTableId === '')}
            className="w-full py-3.5 rounded-xl bg-gradient-to-l from-emerald-600 to-teal-600 text-white font-bold text-base hover:from-emerald-700 hover:to-teal-700 active:scale-[0.98] transition-all shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <FiCheck className="w-5 h-5" />
                {t('confirm_order')}
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
};

export default CheckoutModal;
