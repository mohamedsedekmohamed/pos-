import React from 'react';
import { FiAlertTriangle, FiClock, FiMonitor, FiUser, FiX, FiCheck } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import type { Shift, CashierDevice } from '../../types/cashier';

interface EndShiftModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isEnding: boolean;
  shift?: Shift | null;
  device?: CashierDevice | null;
}

export const EndShiftModal: React.FC<EndShiftModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  isEnding,
  shift,
  device,
}) => {
  const { user } = useAuth();

  if (!isOpen) return null;

  // Format start time if available
  const startTime = shift?.start
    ? new Date(shift.start).toLocaleTimeString('ar-SA', {
        hour: '2-digit',
        minute: '2-digit',
      })
    : shift?.created_at
    ? new Date(shift.created_at).toLocaleTimeString('ar-SA', {
        hour: '2-digit',
        minute: '2-digit',
      })
    : null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
      dir="rtl"
    >
      <div className="relative w-full max-w-md rounded-3xl bg-white dark:bg-[#121217] border border-slate-200 dark:border-white/10 p-6 sm:p-7 shadow-2xl shadow-slate-900/10 dark:shadow-black/80 text-slate-900 dark:text-white">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          disabled={isEnding}
          className="absolute top-4 left-4 p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:text-neutral-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 transition-colors cursor-pointer"
        >
          <FiX className="w-5 h-5" />
        </button>

        {/* Warning Icon */}
        <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-500 dark:text-amber-400 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-amber-500/5">
          <FiAlertTriangle className="w-7 h-7" />
        </div>

        {/* Title */}
        <h2 className="text-xl font-bold text-center text-slate-900 dark:text-white mb-2">
          إنهاء الشيفت وتسجيل الخروج
        </h2>
        <p className="text-sm text-slate-500 dark:text-neutral-400 text-center mb-6 leading-relaxed">
          هل أنت متأكد من رغبتك في إنهاء الشيفت الحالي؟ سيتم إغلاق الوردية وتسجيل الخروج من الموقع والعودة لصفحة تسجيل الدخول.
        </p>

        {/* Shift Details Box */}
        <div className="rounded-2xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/5 p-4 space-y-3 mb-6 text-xs">
          <div className="flex items-center justify-between text-slate-700 dark:text-neutral-300">
            <span className="flex items-center gap-2 text-slate-500 dark:text-neutral-400">
              <FiUser className="w-4 h-4 text-primary" />
              <span>الكاشير المسجل:</span>
            </span>
            <span className="font-semibold text-slate-900 dark:text-white">{user?.name || 'غير محدد'}</span>
          </div>

          {device && (
            <div className="flex items-center justify-between text-slate-700 dark:text-neutral-300">
              <span className="flex items-center gap-2 text-slate-500 dark:text-neutral-400">
                <FiMonitor className="w-4 h-4 text-primary" />
                <span>جهاز الكاشير:</span>
              </span>
              <span className="font-semibold text-slate-900 dark:text-white">{device.name}</span>
            </div>
          )}

          {startTime && (
            <div className="flex items-center justify-between text-slate-700 dark:text-neutral-300">
              <span className="flex items-center gap-2 text-slate-500 dark:text-neutral-400">
                <FiClock className="w-4 h-4 text-amber-500 dark:text-amber-400" />
                <span>وقت بدء الشيفت:</span>
              </span>
              <span className="font-semibold text-slate-900 dark:text-white font-mono">{startTime}</span>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isEnding}
            className="flex-1 py-3 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-white/[0.05] dark:hover:bg-white/[0.1] text-slate-700 hover:text-slate-900 dark:text-neutral-300 dark:hover:text-white font-semibold text-sm transition-colors cursor-pointer disabled:opacity-50"
          >
            إلغاء
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isEnding}
            className="flex-1 py-3 px-4 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-sm shadow-lg shadow-red-600/20 hover:shadow-red-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {isEnding ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <FiCheck className="w-4 h-4" />
                <span>إنهاء الشيفت والخروج</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
