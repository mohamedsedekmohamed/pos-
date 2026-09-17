import React, { useState } from 'react';
import { FiX, FiCheck } from 'react-icons/fi';
import type { CheckoutPayload } from '../../types/cashier';
import TableSelector from './TableSelector';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCheckout: (payload: CheckoutPayload) => void;
  isSubmitting: boolean;
}

const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  onCheckout,
  isSubmitting,
}) => {
  const [moduleType, setModuleType] = useState<'takeaway' | 'dinein' | 'delivery'>('takeaway');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [note, setNote] = useState('');
  const [hallTableId, setHallTableId] = useState<number | ''>('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (moduleType === 'dinein' && hallTableId === '') {
      return; // Prevent submission if no table is selected
    }
    onCheckout({
      module: moduleType,
      name: name || null,
      phone: phone || null,
      address: moduleType === 'delivery' ? (address || null) : null,
      note: note || null,
      hall_table_id: moduleType === 'dinein' && hallTableId !== '' ? Number(hallTableId) : null,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" dir="rtl">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={!isSubmitting ? onClose : undefined} />

      {/* Modal */}
      <div className={`relative w-full transition-all duration-300 ${moduleType === 'dinein' ? 'max-w-3xl' : 'max-w-md'} bg-white dark:bg-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col animate-in slide-in-from-bottom-4`}>
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">إتمام الطلب</h2>
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="p-2 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-500 hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors disabled:opacity-50"
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto">
          <form id="checkout-form" onSubmit={handleSubmit} className="space-y-4">
            
            {/* Module Selection */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">نوع الطلب</label>
              <div className="flex gap-2">
                {(['takeaway', 'dinein', 'delivery'] as const).map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setModuleType(type)}
                    className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                      moduleType === type
                        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30'
                        : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                    }`}
                  >
                    {type === 'takeaway' && 'سفري'}
                    {type === 'dinein' && 'محلي'}
                    {type === 'delivery' && 'توصيل'}
                  </button>
                ))}
              </div>
            </div>

            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">اسم العميل</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={255}
                className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-600 transition-all dark:text-white"
                placeholder="اختياري..."
              />
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">رقم الجوال</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                maxLength={50}
                className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-600 transition-all dark:text-white"
                placeholder="اختياري..."
              />
            </div>

            {/* Address (Only for delivery) */}
            {moduleType === 'delivery' && (
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">العنوان</label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-600 transition-all dark:text-white"
                  placeholder="عنوان التوصيل..."
                  required
                />
              </div>
            )}

            {/* Hall Table (Only for dine-in) */}
            {moduleType === 'dinein' && (
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">اختر الطاولة</label>
                <TableSelector
                  selectedTableId={hallTableId}
                  onSelectTable={(id) => setHallTableId(id)}
                />
                {hallTableId === '' && (
                  <p className="text-xs text-red-500 mt-2">الرجاء اختيار طاولة لإتمام الطلب</p>
                )}
              </div>
            )}

            {/* Note */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">ملاحظات الطلب</label>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={2}
                className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-600 transition-all resize-none dark:text-white"
                placeholder="أي تعليمات إضافية..."
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
            className="w-full py-3.5 rounded-xl bg-gradient-to-l from-emerald-600 to-teal-600 text-white font-bold text-base hover:from-emerald-700 hover:to-teal-700 active:scale-[0.98] transition-all shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <FiCheck className="w-5 h-5" />
                تأكيد الطلب
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
};

export default CheckoutModal;
