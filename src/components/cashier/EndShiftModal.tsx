import React, { useState, useEffect, useRef } from 'react';
import {
  FiAlertTriangle,
  FiClock,
  FiMonitor,
  FiUser,
  FiX,
  FiCheck,
  FiDollarSign,
  FiTrendingDown,
  FiTrendingUp,
  FiPrinter,
  FiLogOut,
  FiCheckCircle,
  FiRefreshCw,
  FiAlertCircle,
} from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { useShift } from '../../context/ShiftContext';
import type { Shift, CashierDevice } from '../../types/cashier';

export interface EndShiftModalProps {
  isOpen?: boolean;
  onClose?: () => void;
  onConfirm?: (totalMony: number) => Promise<Shift | void>;
  isEnding?: boolean;
  shift?: Shift | null;
  device?: CashierDevice | null;
}

export const EndShiftModal: React.FC<EndShiftModalProps> = ({
  isOpen: propIsOpen,
  onClose: propOnClose,
  onConfirm,
  shift: propShift,
  device: propDevice,
}) => {
  const { user, logout } = useAuth();
  const { language, dir, t } = useLanguage();
  const navigate = useNavigate();

  const {
    activeShift: contextShift,
    activeDevice: contextDevice,
    endShift,
    isEndingShift,
    isEndModalOpen,
    closeEndModal,
    shiftError,
    clearShiftError,
  } = useShift();

  // Use props if provided, otherwise context
  const isOpen = propIsOpen !== undefined ? propIsOpen : isEndModalOpen;
  const handleClose = propOnClose || closeEndModal;
  const currentShift = propShift !== undefined ? propShift : contextShift;
  const currentDevice = propDevice !== undefined ? propDevice : contextDevice;

  // Local state
  const [step, setStep] = useState<'input' | 'result'>('input');
  const [enteredAmount, setEnteredAmount] = useState<string>('');
  const [validationError, setValidationError] = useState<string | null>(null);
  const [shiftResult, setShiftResult] = useState<Shift | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const printAreaRef = useRef<HTMLDivElement>(null);
  const prevIsOpenRef = useRef(false);

  // Reset states ONLY when modal transitions from closed to open
  useEffect(() => {
    if (isOpen && !prevIsOpenRef.current) {
      setStep('input');
      setEnteredAmount('');
      setValidationError(null);
      setShiftResult(null);
      setIsSubmitting(false);
      clearShiftError();
    }
    prevIsOpenRef.current = Boolean(isOpen);
  }, [isOpen, clearShiftError]);

  if (!isOpen) return null;

  // Formatted start time (checked from shiftResult first, then currentShift)
  const rawStartTime = shiftResult?.start || currentShift?.start || currentShift?.created_at;
  const startTime = rawStartTime
    ? new Date(rawStartTime).toLocaleTimeString(language === 'ar' ? 'ar-SA' : 'en-US', {
        hour: '2-digit',
        minute: '2-digit',
      })
    : null;

  const startDateFormatted = rawStartTime
    ? new Date(rawStartTime).toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    : null;

  // Formatted end time (for result stage)
  const rawEndTime = shiftResult?.end || shiftResult?.updated_at || new Date().toISOString();
  const endTime = new Date(rawEndTime).toLocaleTimeString(language === 'ar' ? 'ar-SA' : 'en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });
  const endDateFormatted = new Date(rawEndTime).toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  // Currency symbol
  const currencyLabel = t('currency');

  // Quick addition buttons
  const quickIncrements = [10, 50, 100, 200, 500];

  const handleAddQuickAmount = (inc: number) => {
    const current = parseFloat(enteredAmount) || 0;
    const nextVal = (current + inc).toString();
    setEnteredAmount(nextVal);
    if (validationError) setValidationError(null);
  };

  const handleClearAmount = () => {
    setEnteredAmount('');
    if (validationError) setValidationError(null);
  };

  // Submission handler
  const handleSubmitReconcile = async (e: React.FormEvent) => {
    e.preventDefault();
    clearShiftError();

    if (enteredAmount.trim() === '') {
      setValidationError(t('cash_required_error'));
      return;
    }

    const numericAmount = Number(enteredAmount);
    if (isNaN(numericAmount) || numericAmount < 0) {
      setValidationError(t('cash_required_error'));
      return;
    }

    setIsSubmitting(true);
    try {
      let res: Shift;
      if (onConfirm) {
        const externalResult = await onConfirm(numericAmount);
        res = (externalResult as Shift) || {
          ...(currentShift || ({} as Shift)),
          total_mony: numericAmount,
          default_total_amount: currentShift?.default_total_amount ?? 0,
          deficit: (currentShift?.default_total_amount ?? 0) - numericAmount,
        };
      } else {
        res = await endShift(numericAmount, false);
      }

      setShiftResult(res);
      setStep('result');
    } catch {
      // Error handled by ShiftContext / shiftError
    } finally {
      setIsSubmitting(false);
    }
  };

  // Reconcile calculations for Result stage
  const expectedAmount = Number(shiftResult?.default_total_amount ?? 0);
  const actualAmount = Number(shiftResult?.total_mony ?? (Number(enteredAmount) || 0));

  // The backend defines deficit = default_total_amount - total_mony:
  // deficit > 0 means shortage (عجز)
  // deficit == 0 means exact (مظبوط)
  // deficit < 0 means more / extra (اكتر / زيادة)
  const deficitValue = Number(
    shiftResult?.deficit !== undefined
      ? shiftResult.deficit
      : (expectedAmount - actualAmount)
  );

  const isExact = Math.abs(deficitValue) < 0.01;
  const isDeficit = !isExact && deficitValue > 0.01;
  const isSurplus = !isExact && deficitValue < -0.01;
  const diffMagnitude = Math.abs(deficitValue);

  const handlePrint = () => {
    window.print();
  };

  const handleLogout = () => {
    handleClose();
    logout();
  };

  const handleStartNewShift = () => {
    handleClose();
    navigate('/dashboard/shift', { replace: true });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/70 backdrop-blur-md animate-in fade-in duration-200 overflow-y-auto"
      dir={dir}
    >
      {/* Print Specific Styles */}
      <style>
        {`
          @media print {
            body * {
              visibility: hidden !important;
            }
            #printable-shift-summary, #printable-shift-summary * {
              visibility: visible !important;
            }
            #printable-shift-summary {
              position: absolute !important;
              left: 0 !important;
              top: 0 !important;
              width: 100% !important;
              color: black !important;
              background: white !important;
              padding: 20px !important;
            }
            .no-print {
              display: none !important;
            }
          }
        `}
      </style>

      {/* Modal Card */}
      <div className="relative w-full max-w-lg my-auto rounded-3xl bg-white dark:bg-[#121217] border border-slate-200 dark:border-white/10 p-6 sm:p-7 shadow-2xl shadow-slate-900/15 dark:shadow-black/80 text-slate-900 dark:text-white transition-all">
        {/* Close Button (only allowed on input stage, on result user must choose logout or new shift) */}
        {step === 'input' && (
          <button
            type="button"
            onClick={handleClose}
            disabled={isSubmitting || isEndingShift}
            className="absolute top-4 rtl:left-4 ltr:right-4 p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:text-neutral-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 transition-colors cursor-pointer disabled:opacity-50"
          >
            <FiX className="w-5 h-5" />
          </button>
        )}

        {/* ═══════════════════════════════════════════════════ */}
        {/* STAGE 1: CASH ENTRY BEFORE ENDING SHIFT           */}
        {/* ═══════════════════════════════════════════════════ */}
        {step === 'input' && (
          <form onSubmit={handleSubmitReconcile}>
            {/* Header Icon */}
            <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-500 dark:text-amber-400 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-amber-500/5">
              <FiDollarSign className="w-7 h-7" />
            </div>

            {/* Title & Description */}
            <h2 className="text-xl font-bold text-center text-slate-900 dark:text-white mb-1.5">
              {t('confirm_end_shift_title')}
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-neutral-400 text-center mb-5 leading-relaxed">
              {t('confirm_end_shift_desc')}
            </p>

            {/* Shift Info Bar */}
            <div className="rounded-2xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200/80 dark:border-white/5 p-3.5 space-y-2 mb-5 text-xs">
              <div className="flex items-center justify-between text-slate-700 dark:text-neutral-300">
                <span className="flex items-center gap-2 text-slate-500 dark:text-neutral-400">
                  <FiUser className="w-3.5 h-3.5 text-primary" />
                  <span>{t('registered_cashier')}:</span>
                </span>
                <span className="font-semibold text-slate-900 dark:text-white">
                  {user?.name || currentShift?.cashier_man_name || t('unspecified')}
                </span>
              </div>

              {currentDevice && (
                <div className="flex items-center justify-between text-slate-700 dark:text-neutral-300">
                  <span className="flex items-center gap-2 text-slate-500 dark:text-neutral-400">
                    <FiMonitor className="w-3.5 h-3.5 text-primary" />
                    <span>{t('terminal_device')}:</span>
                  </span>
                  <span className="font-semibold text-slate-900 dark:text-white">
                    {currentDevice.name}
                  </span>
                </div>
              )}

              {startTime && (
                <div className="flex items-center justify-between text-slate-700 dark:text-neutral-300">
                  <span className="flex items-center gap-2 text-slate-500 dark:text-neutral-400">
                    <FiClock className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400" />
                    <span>{t('start_time')}:</span>
                  </span>
                  <span className="font-semibold text-slate-900 dark:text-white font-mono">
                    {startDateFormatted ? `${startDateFormatted} - ${startTime}` : startTime}
                  </span>
                </div>
              )}
            </div>

            {/* Cash Input Section */}
            <div className="mb-5">
              <label className="block text-xs font-bold text-slate-700 dark:text-neutral-300 mb-2">
                {t('actual_cash_in_drawer')}{' '}
                <span className="text-red-500">*</span>
              </label>

              <div className="relative flex items-center">
                <input
                  type="number"
                  step="any"
                  min="0"
                  autoFocus
                  required
                  value={enteredAmount}
                  onChange={(e) => {
                    setEnteredAmount(e.target.value);
                    if (validationError) setValidationError(null);
                  }}
                  placeholder={t('actual_cash_placeholder')}
                  className={`w-full py-3.5 px-4 rtl:pl-16 ltr:pr-16 text-xl sm:text-2xl font-black font-mono tracking-wide rounded-2xl bg-slate-100 dark:bg-black/40 border transition-all outline-none ${
                    validationError
                      ? 'border-red-500 ring-2 ring-red-500/20 text-red-600 dark:text-red-400'
                      : 'border-slate-300 dark:border-white/10 text-slate-900 dark:text-white focus:border-primary focus:ring-2 focus:ring-primary/20'
                  }`}
                />
                <span className="absolute rtl:left-4 ltr:right-4 text-xs sm:text-sm font-bold text-slate-400 dark:text-neutral-500 pointer-events-none">
                  {currencyLabel}
                </span>
              </div>

              {/* Validation or API Error */}
              {(validationError || shiftError) && (
                <div className="flex items-center gap-1.5 mt-2 text-xs font-semibold text-red-500 animate-in fade-in">
                  <FiAlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
                  <span>{validationError || shiftError}</span>
                </div>
              )}

              {/* Quick Amount Pills */}
              <div className="flex flex-wrap items-center gap-1.5 mt-3">
                <span className="text-[11px] font-semibold text-slate-400 dark:text-neutral-500 ml-1">
                  إضافة سريعة:
                </span>
                {quickIncrements.map((inc) => (
                  <button
                    key={inc}
                    type="button"
                    onClick={() => handleAddQuickAmount(inc)}
                    className="px-2.5 py-1 rounded-lg text-xs font-bold font-mono bg-slate-100 hover:bg-primary/10 text-slate-700 hover:text-primary dark:bg-white/[0.05] dark:hover:bg-primary/20 dark:text-neutral-300 dark:hover:text-primary transition-colors cursor-pointer border border-slate-200 dark:border-white/5"
                  >
                    +{inc}
                  </button>
                ))}
                {enteredAmount && (
                  <button
                    key="clear"
                    type="button"
                    onClick={handleClearAmount}
                    className="px-2.5 py-1 rounded-lg text-xs font-bold bg-red-50 hover:bg-red-100 text-red-600 dark:bg-red-500/10 dark:hover:bg-red-500/20 dark:text-red-400 transition-colors cursor-pointer"
                  >
                    {t('clear_amount')}
                  </button>
                )}
              </div>
            </div>

            {/* Note banner */}
            <div className="flex items-start gap-2.5 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-400 text-xs mb-6">
              <FiAlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <p className="leading-relaxed">
                سيتم إرسال هذا المبلغ لمطابقته مع مبيعات النظام واحتساب أي عجز أو زيادة فوراً قبل الإغلاق.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleClose}
                disabled={isSubmitting || isEndingShift}
                className="flex-1 py-3 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-white/[0.05] dark:hover:bg-white/[0.1] text-slate-700 hover:text-slate-900 dark:text-neutral-300 dark:hover:text-white font-semibold text-sm transition-colors cursor-pointer disabled:opacity-50"
              >
                {t('cancel')}
              </button>
              <button
                type="submit"
                disabled={isSubmitting || isEndingShift || enteredAmount.trim() === ''}
                className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-bold text-sm shadow-lg shadow-red-600/25 hover:shadow-red-600/35 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isSubmitting || isEndingShift ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>{t('reconciling_in_progress')}</span>
                  </>
                ) : (
                  <>
                    <FiCheck className="w-4 h-4" />
                    <span>{t('confirm_and_reconcile')}</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}

        {/* ═══════════════════════════════════════════════════ */}
        {/* STAGE 2: RECONCILIATION RESULT REPORT              */}
        {/* ═══════════════════════════════════════════════════ */}
        {step === 'result' && (
          <div className="animate-in fade-in zoom-in-95 duration-200" id="printable-shift-summary" ref={printAreaRef}>
            {/* Status Highlight Banner */}
            {isExact && (
              <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-800 dark:text-emerald-300 mb-5 text-center">
                <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto mb-2.5 shadow-md shadow-emerald-500/10">
                  <FiCheckCircle className="w-6 h-6" />
                </div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 text-xs font-black uppercase tracking-wider mb-1.5">
                  <span>الرقم مظبوط ✅</span>
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">
                  الرصيد متطابق تماماً ومظبوط
                </h3>
                <p className="text-xs text-slate-600 dark:text-neutral-400 leading-relaxed max-w-sm mx-auto">
                  {t('shift_exact_msg')}
                </p>
              </div>
            )}

            {isDeficit && (
              <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-800 dark:text-rose-300 mb-5 text-center">
                <div className="w-12 h-12 rounded-full bg-rose-500/20 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto mb-2.5 shadow-md shadow-rose-500/10">
                  <FiTrendingDown className="w-6 h-6" />
                </div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/20 text-rose-700 dark:text-rose-300 text-xs font-black uppercase tracking-wider mb-1.5">
                  <span>يوجد عجز في الصندوق ⚠️</span>
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">
                  تم رصد عجز (نقص) في الدرج
                </h3>
                <p className="text-xs text-slate-600 dark:text-neutral-400 leading-relaxed max-w-sm mx-auto">
                  {t('shift_deficit_msg')}{' '}
                  <span className="font-bold font-mono text-rose-600 dark:text-rose-400 text-sm">
                    -{diffMagnitude.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {currencyLabel}
                  </span>
                </p>
              </div>
            )}

            {isSurplus && (
              <div className="p-4 rounded-2xl bg-sky-500/10 border border-sky-500/30 text-sky-800 dark:text-sky-300 mb-5 text-center">
                <div className="w-12 h-12 rounded-full bg-sky-500/20 text-sky-600 dark:text-sky-400 flex items-center justify-center mx-auto mb-2.5 shadow-md shadow-sky-500/10">
                  <FiTrendingUp className="w-6 h-6" />
                </div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-500/20 text-sky-700 dark:text-sky-300 text-xs font-black uppercase tracking-wider mb-1.5">
                  <span>المبلغ اكتر من المتوقع (زيادة) 📈</span>
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">
                  تم رصد مبلغ إضافي (اكتر) في الدرج
                </h3>
                <p className="text-xs text-slate-600 dark:text-neutral-400 leading-relaxed max-w-sm mx-auto">
                  {t('shift_surplus_msg')}{' '}
                  <span className="font-bold font-mono text-sky-600 dark:text-sky-400 text-sm">
                    +{diffMagnitude.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {currencyLabel}
                  </span>
                </p>
              </div>
            )}

            {/* 3 Metric Cards Grid */}
            <div className="grid grid-cols-3 gap-2.5 mb-5">
              {/* Card 1: Expected */}
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/5 text-center flex flex-col justify-center">
                <span className="text-[11px] font-semibold text-slate-400 dark:text-neutral-400 mb-1 leading-tight">
                  {t('expected_system_amount')}
                </span>
                <span className="text-sm sm:text-base font-black font-mono text-slate-900 dark:text-white">
                  {expectedAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
                <span className="text-[10px] text-slate-400 dark:text-neutral-500">{currencyLabel}</span>
              </div>

              {/* Card 2: Actual */}
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/5 text-center flex flex-col justify-center">
                <span className="text-[11px] font-semibold text-slate-400 dark:text-neutral-400 mb-1 leading-tight">
                  {t('actual_drawer_amount')}
                </span>
                <span className="text-sm sm:text-base font-black font-mono text-slate-900 dark:text-white">
                  {actualAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
                <span className="text-[10px] text-slate-400 dark:text-neutral-500">{currencyLabel}</span>
              </div>

              {/* Card 3: Difference */}
              <div
                className={`p-3 rounded-2xl border text-center flex flex-col justify-center ${
                  isExact
                    ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-700 dark:text-emerald-400'
                    : isDeficit
                    ? 'bg-rose-500/10 border-rose-500/20 text-rose-700 dark:text-rose-400'
                    : 'bg-sky-500/10 border-sky-500/20 text-sky-700 dark:text-sky-400'
                }`}
              >
                <span className="text-[11px] font-semibold mb-1 leading-tight">
                  {t('deficit_or_surplus')}
                </span>
                <span className="text-sm sm:text-base font-black font-mono">
                  {isExact
                    ? '0.00'
                    : isDeficit
                    ? `-${diffMagnitude.toFixed(2)}`
                    : `+${diffMagnitude.toFixed(2)}`}
                </span>
                <span className="text-[10px] font-bold">
                  {isExact ? 'مظبوط' : isDeficit ? 'عجز' : 'اكتر (زيادة)'}
                </span>
              </div>
            </div>

            {/* Audit Details */}
            <div className="rounded-2xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200/80 dark:border-white/5 p-3.5 space-y-2 mb-6 text-xs">
              <div className="flex items-center justify-between text-slate-700 dark:text-neutral-300">
                <span className="text-slate-400 dark:text-neutral-500">{t('registered_cashier')}:</span>
                <span className="font-semibold text-slate-900 dark:text-white">
                  {shiftResult?.cashier_man_name || shiftResult?.cashier_man?.name || user?.name || t('unspecified')}
                </span>
              </div>

              {(shiftResult?.cashier_name || currentDevice?.name) && (
                <div className="flex items-center justify-between text-slate-700 dark:text-neutral-300">
                  <span className="text-slate-400 dark:text-neutral-500">{t('terminal_device')}:</span>
                  <span className="font-semibold text-slate-900 dark:text-white">
                    {shiftResult?.cashier_name || currentDevice?.name}
                  </span>
                </div>
              )}

              {(shiftResult?.branch?.address || shiftResult?.branch_name) && (
                <div className="flex items-center justify-between text-slate-700 dark:text-neutral-300">
                  <span className="text-slate-400 dark:text-neutral-500">{t('branch')}:</span>
                  <span className="font-semibold text-slate-900 dark:text-white">
                    {shiftResult?.branch?.address || shiftResult?.branch_name}
                  </span>
                </div>
              )}

              {shiftResult?.id && (
                <div className="flex items-center justify-between text-slate-700 dark:text-neutral-300">
                  <span className="text-slate-400 dark:text-neutral-500">{t('shift_id')}:</span>
                  <span className="font-mono font-bold text-slate-900 dark:text-white">
                    #{shiftResult.id}
                  </span>
                </div>
              )}

              {startTime && (
                <div className="flex items-center justify-between text-slate-700 dark:text-neutral-300">
                  <span className="text-slate-400 dark:text-neutral-500">{t('start_time')}:</span>
                  <span className="font-mono text-slate-700 dark:text-neutral-300">
                    {startDateFormatted ? `${startDateFormatted} ${startTime}` : startTime}
                  </span>
                </div>
              )}

              <div className="flex items-center justify-between text-slate-700 dark:text-neutral-300">
                <span className="text-slate-400 dark:text-neutral-500">{t('shift_end_time')}:</span>
                <span className="font-mono text-slate-700 dark:text-neutral-300">
                  {endDateFormatted} {endTime}
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-2.5 no-print">
              <div className="flex items-center gap-2.5">
                {/* Print Button */}
                <button
                  type="button"
                  onClick={handlePrint}
                  className="flex-1 py-3 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-white/[0.05] dark:hover:bg-white/[0.1] text-slate-800 dark:text-white font-bold text-xs sm:text-sm transition-colors flex items-center justify-center gap-2 cursor-pointer border border-slate-200 dark:border-white/5"
                >
                  <FiPrinter className="w-4 h-4 text-primary" />
                  <span>{t('print_shift_report')}</span>
                </button>

                {/* Start New Shift Button */}
                <button
                  type="button"
                  onClick={handleStartNewShift}
                  className="flex-1 py-3 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-white/[0.05] dark:hover:bg-white/[0.1] text-slate-800 dark:text-white font-bold text-xs sm:text-sm transition-colors flex items-center justify-center gap-2 cursor-pointer border border-slate-200 dark:border-white/5"
                >
                  <FiRefreshCw className="w-4 h-4 text-indigo-500" />
                  <span>{t('start_new_shift_btn')}</span>
                </button>
              </div>

              {/* Primary Logout Button */}
              <button
                type="button"
                onClick={handleLogout}
                className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-bold text-sm shadow-lg shadow-red-600/25 hover:shadow-red-600/35 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <FiLogOut className="w-4 h-4" />
                <span>{t('logout_and_exit')}</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EndShiftModal;
