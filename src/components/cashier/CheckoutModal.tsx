import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { FiX, FiCheck, FiShoppingBag, FiCoffee, FiTruck, FiCreditCard } from 'react-icons/fi';
import { useOrderType } from '../../context/OrderTypeContext';
import { useLanguage } from '../../context/LanguageContext';
import { useShift } from '../../context/ShiftContext';
import { cashierApi } from '../../services/cashierService';
import type { CheckoutPayload } from '../../types/cashier';

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
  const { dir, t, language } = useLanguage();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [deliveryId, setDeliveryId] = useState<number | ''>('');
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

  // Fetch delivery personnel when order is delivery
  const { data: deliveries = [], isLoading: loadingDeliveries } = useQuery({
    queryKey: ['cashier', 'deliveries'],
    queryFn: cashierApi.getDeliveries,
    enabled: isOpen && orderType === 'delivery',
  });

  // Combine API accounts, shift account, and guaranteed fallbacks so the select is NEVER empty
  const availableAccounts = React.useMemo(() => {
    const list = [...accounts];

    if (activeShift?.financial_account_id && !list.some((a) => a.id === activeShift.financial_account_id)) {
      list.unshift({
        id: activeShift.financial_account_id,
        name: activeShift.financial_account?.name || (language === 'en' ? 'Shift Account' : 'خزينة الوردية الحالية'),
        icon: activeShift.financial_account?.icon || null,
      });
    }

    return list;
  }, [accounts, activeShift, language]);

  // Keep selected financialAccountId in sync with available accounts
  useEffect(() => {
    if (availableAccounts.length > 0) {
      const exists = availableAccounts.some((a) => a.id === Number(financialAccountId));
      if (!exists || financialAccountId === '') {
        const preferred = activeShift?.financial_account_id
          ? availableAccounts.find((a) => a.id === activeShift.financial_account_id)
          : null;
        setFinancialAccountId(preferred ? preferred.id : availableAccounts[0].id);
      }
    }
  }, [availableAccounts, activeShift, financialAccountId]);

  useEffect(() => {
    if (selectedTable) {
      setHallTableId(selectedTable.id);
      setTableName(selectedTable.name);
    }
  }, [selectedTable]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (orderType === 'delivery') {
      if (!name.trim()) {
        alert(language === 'ar' ? 'اسم العميل مطلوب لطلبات التوصيل' : 'Customer name is required for delivery orders');
        return;
      }
      if (!phone.trim()) {
        alert(language === 'ar' ? 'رقم هاتف العميل مطلوب لطلبات التوصيل' : 'Customer phone is required for delivery orders');
        return;
      }
      if (!address.trim()) {
        alert(language === 'ar' ? 'عنوان التوصيل مطلوب' : 'Delivery address is required');
        return;
      }
    }

    const selectedAcc = availableAccounts.find((a) => a.id === Number(financialAccountId));
    const finalAccountId = selectedAcc
      ? selectedAcc.id
      : (availableAccounts[0]?.id || (activeShift?.financial_account_id ? Number(activeShift.financial_account_id) : undefined));

    const finalTableId = hallTableId !== ''
      ? Number(hallTableId)
      : (selectedTable?.id ? Number(selectedTable.id) : null);

    onCheckout(
      {
        module: orderType,
        financial_account_id: finalAccountId,
        name: name.trim() || null,
        phone: phone.trim() || null,
        address: orderType === 'delivery' ? (address.trim() || null) : null,
        delivery_id: orderType === 'delivery' && deliveryId !== '' ? Number(deliveryId) : undefined,
        note: note.trim() || null,
        hall_table_id: orderType === 'dinein' ? finalTableId : null,
      },
      {
        tableName: orderType === 'dinein' ? (tableName || selectedTable?.name) : undefined,
      }
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" dir={dir}>
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={!isSubmitting ? onClose : undefined} />

      {/* Modal */}
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col animate-in slide-in-from-bottom-4">
        
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
                    {orderType === 'dinein' && (tableName || selectedTable?.name) && (
                      <span className="text-primary font-bold ms-1">
                        ({tableName || selectedTable?.name})
                      </span>
                    )}
                  </span>
                </div>
              </div>
              {orderType === 'dinein' && (tableName || selectedTable?.name) ? (
                <span className="text-[11px] text-indigo-700 dark:text-indigo-300 bg-white/80 dark:bg-slate-700 px-2.5 py-1 rounded-lg border border-indigo-200 dark:border-slate-600 font-bold">
                  طاولة معتمدة
                </span>
              ) : (
                <span className="text-[11px] text-slate-400 dark:text-slate-500 bg-white/60 dark:bg-slate-700/50 px-2.5 py-1 rounded-lg border border-slate-200/50 dark:border-slate-600/50">
                  {t('set_from_navbar')}
                </span>
              )}
            </div>

            {/* Financial Account Selection (Select Dropdown) */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-neutral-300 mb-1.5 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <FiCreditCard className="w-3.5 h-3.5 text-primary" />
                  <span>{t('payment_account')}</span>
                  <span className="text-red-500">*</span>
                </span>
                {loadingAccounts && (
                  <span className="text-[11px] text-slate-400 font-normal">{t('loading')}</span>
                )}
              </label>

              <select
                value={financialAccountId}
                onChange={(e) => setFinancialAccountId(e.target.value ? Number(e.target.value) : '')}
                required
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 text-sm font-semibold text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer"
              >
                <option value="">{t('choose_financial_account', 'اختر حساب الدفع / الخزينة')}</option>
                {availableAccounts.map((acc) => {
                  const accName = typeof acc.name === 'string'
                    ? acc.name
                    : (acc.name as any)?.[language] || (acc.name as any)?.ar || `حساب #${acc.id}`;
                  const isShift = acc.id === activeShift?.financial_account_id;
                  return (
                    <option key={acc.id} value={acc.id}>
                      {accName} {isShift ? ' (خزينة الوردية)' : ''}
                    </option>
                  );
                })}
              </select>
            </div>

            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                {t('customer_name')}
                {orderType === 'delivery' && <span className="text-red-500 ms-1">*</span>}
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={255}
                required={orderType === 'delivery'}
                className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-600 transition-all dark:text-white"
                placeholder={
                  orderType === 'delivery'
                    ? (language === 'ar' ? 'اسم العميل (مطلوب للتوصيل)' : 'Customer name (required)')
                    : t('optional')
                }
              />
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                {t('customer_phone')}
                {orderType === 'delivery' && <span className="text-red-500 ms-1">*</span>}
              </label>
              <input
                type="tel"
                value={phone}
              
                onChange={(e) => setPhone(e.target.value)}
                maxLength={50}
                required={orderType === 'delivery'}
                className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-600 transition-all dark:text-white"
                placeholder={
                  orderType === 'delivery'
                    ? (language === 'ar' ? 'رقم الهاتف (مطلوب للتوصيل)' : 'Phone number (required)')
                    : t('optional')
                }
              />
            </div>

            {/* Address & Driver (Only for delivery) */}
            {orderType === 'delivery' && (
              <>
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

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-neutral-300 mb-1.5 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <FiTruck className="w-3.5 h-3.5 text-primary" />
                      <span>{t('delivery_driver')}</span>
                    </span>
                    {loadingDeliveries && (
                      <span className="text-[11px] text-slate-400 font-normal">{t('loading')}</span>
                    )}
                  </label>
                  <select
                    value={deliveryId}
                    onChange={(e) => setDeliveryId(e.target.value ? Number(e.target.value) : '')}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 text-sm font-semibold text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer"
                  >
                    <option value="">{t('choose_delivery_driver')}</option>
                    {deliveries.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name} {d.phone ? `(${d.phone})` : ''}
                      </option>
                    ))}
                  </select>
                </div>
              </>
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
            disabled={isSubmitting}
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
