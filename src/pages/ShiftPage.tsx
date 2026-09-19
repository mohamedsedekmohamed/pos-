import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  FiMonitor,
  FiPlay,
  FiSquare,
  FiClock,
  FiUser,
  FiCheckCircle,
  FiAlertCircle,
  FiArrowLeft,
  FiRefreshCw,
  FiLogOut,
  FiShoppingBag,
  FiLayers,
  FiSun,
  FiMoon,
} from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { useShift } from '../context/ShiftContext';
import { useTheme } from '../context/ThemeContext';
import { cashierApi } from '../services/cashierService';
import { EndShiftModal } from '../components/cashier/EndShiftModal';

const ShiftPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const {
    shiftStatus,
    isCheckingShift,
    activeShift,
    activeDevice,
    hasActiveShift,
    startShift,
    endShift,
    refetchShift,
    isStartingShift,
    isEndingShift,
    shiftError,
    clearShiftError,
  } = useShift();

  const [selectedCashierId, setSelectedCashierId] = useState<number | ''>('');
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  const [isEndModalOpen, setIsEndModalOpen] = useState(false);
  const [actionSuccessMessage, setActionSuccessMessage] = useState<string | null>(null);

  // Live Clock
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch Cashier Devices
  const { data: cashiers = [], isLoading: loadingCashiers } = useQuery({
    queryKey: ['cashiers'],
    queryFn: cashierApi.getCashiers,
  });

  // Auto-select first cashier if available and not selected
  useEffect(() => {
    if (cashiers.length > 0 && selectedCashierId === '') {
      setSelectedCashierId(cashiers[0].id);
    }
  }, [cashiers, selectedCashierId]);

  const handleStartShift = async () => {
    if (!selectedCashierId) return;
    clearShiftError();
    setActionSuccessMessage(null);
    try {
      const selectedDevice = cashiers.find((c) => c.id === Number(selectedCashierId));
      await startShift(Number(selectedCashierId), selectedDevice);
      setActionSuccessMessage('تم بدء الشيفت بنجاح! جاري التوجيه لنقطة البيع...');
      setTimeout(() => {
        navigate('/dashboard', { replace: true });
      }, 1000);
    } catch {
      // Error handled in context
    }
  };

  const handleConfirmEndShift = async () => {
    clearShiftError();
    try {
      await endShift(true);
      setIsEndModalOpen(false);
    } catch {
      // Error handled in context
    }
  };

  const selectedDevice = cashiers.find((c) => c.id === Number(selectedCashierId));

  return (
    <div
      className="min-h-screen relative flex flex-col justify-between bg-slate-50 dark:bg-[#070709] text-slate-900 dark:text-white p-4 sm:p-6 lg:p-8 overflow-x-hidden select-none w-full transition-colors duration-300"
      dir="rtl"
    >
      {/* Background Ambient Glows */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-32 -right-32 w-96 h-96 bg-primary/10 dark:bg-primary/20 rounded-full blur-[120px] animate-pulse-soft" />
        <div
          className="absolute -bottom-32 -left-32 w-96 h-96 bg-indigo-500/10 dark:bg-indigo-600/20 rounded-full blur-[120px] animate-pulse-soft"
          style={{ animationDelay: '2.5s' }}
        />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-violet-500/5 dark:bg-violet-600/10 rounded-full blur-[140px]" />
        <div
          className="absolute inset-0 opacity-[0.025] dark:opacity-[0.03]"
          style={{
            backgroundImage: `radial-gradient(currentColor 1px, transparent 1px)`,
            backgroundSize: '24px 24px',
          }}
        />
      </div>

      {/* Top Bar Header */}
      <header className="relative z-20 w-full flex items-center justify-between py-2">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-primary to-indigo-600 flex items-center justify-center shadow-lg shadow-primary/25">
            <FiShoppingBag className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
              بوابة الورديات <span className="text-primary font-normal">| Shift</span>
            </h1>
            <p className="text-xs text-slate-500 dark:text-neutral-400">إدارة وفتح الشيفت لموظفي الكاشير</p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Theme Toggle Button */}
          <button
            type="button"
            onClick={toggleTheme}
            title={theme === 'dark' ? 'الوضع الفاتح' : 'الوضع الداكن'}
            className="p-2.5 rounded-xl bg-white dark:bg-white/[0.04] hover:bg-slate-100 dark:hover:bg-white/[0.08] border border-slate-200 dark:border-white/10 text-slate-700 dark:text-neutral-300 hover:text-slate-900 dark:hover:text-white transition-all cursor-pointer shadow-sm"
          >
            {theme === 'dark' ? (
              <FiSun className="w-4 h-4 text-amber-400" />
            ) : (
              <FiMoon className="w-4 h-4 text-slate-600" />
            )}
          </button>

          {/* Refresh Shift Status */}
          <button
            type="button"
            onClick={() => refetchShift()}
            disabled={isCheckingShift}
            title="تحديث حالة الشيفت"
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white dark:bg-white/[0.04] hover:bg-slate-100 dark:hover:bg-white/[0.08] border border-slate-200 dark:border-white/10 text-xs font-semibold text-slate-700 dark:text-neutral-300 hover:text-slate-900 dark:hover:text-white transition-all cursor-pointer shadow-sm"
          >
            <FiRefreshCw className={`w-3.5 h-3.5 ${isCheckingShift ? 'animate-spin text-primary' : ''}`} />
            <span className="hidden sm:inline">تحديث الحالة</span>
          </button>

          {/* Logout */}
          <button
            type="button"
            onClick={logout}
            title="تسجيل الخروج"
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-red-50 dark:bg-red-500/10 hover:bg-red-100 dark:hover:bg-red-500/20 border border-red-200 dark:border-red-500/20 text-xs font-semibold text-red-600 dark:text-red-400 transition-all cursor-pointer shadow-sm"
          >
            <FiLogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">خروج</span>
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="relative z-10 flex-1 w-full flex flex-col justify-center py-6 sm:py-8">
        {/* User Badge & Real-time Clock */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-white/90 dark:bg-white/[0.03] border border-slate-200/80 dark:border-white/10 backdrop-blur-xl mb-6 shadow-md dark:shadow-xl">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-primary to-indigo-600 flex items-center justify-center text-white text-lg font-bold shadow-lg shadow-primary/20">
              {user?.name ? user.name.charAt(0).toUpperCase() : <FiUser className="w-6 h-6" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-slate-900 dark:text-white">{user?.name || 'الكاشير'}</span>
                <span className="px-2 py-0.5 rounded-full bg-primary/10 dark:bg-primary/20 border border-primary/20 dark:border-primary/30 text-primary text-[10px] font-bold">
                  كاشير معتمد
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-neutral-400 mt-0.5">{user?.email || 'حساب الكاشير'}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs font-medium text-slate-700 dark:text-neutral-300 bg-slate-100 dark:bg-white/[0.02] px-3 py-2 rounded-xl border border-slate-200 dark:border-white/5 self-start sm:self-auto">
            <FiClock className="w-4 h-4 text-amber-500 dark:text-amber-400" />
            <span className="font-mono">
              {currentTime.toLocaleTimeString('ar-SA', {
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
              })}
            </span>
            <span className="text-slate-400 dark:text-neutral-500">•</span>
            <span>
              {currentTime.toLocaleDateString('ar-SA', {
                weekday: 'short',
                day: 'numeric',
                month: 'short',
              })}
            </span>
          </div>
        </div>

        {/* Global Error Banner */}
        {shiftError && (
          <div className="mb-6 p-4 rounded-2xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-300 text-sm flex items-start gap-3 animate-in fade-in shadow-sm">
            <FiAlertCircle className="w-5 h-5 text-red-500 dark:text-red-400 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-bold">حدث خطأ</p>
              <p className="text-xs text-red-500/90 dark:text-red-400/90 mt-0.5">{shiftError}</p>
            </div>
          </div>
        )}

        {/* Success Banner */}
        {actionSuccessMessage && (
          <div className="mb-6 p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 text-emerald-700 dark:text-emerald-300 text-sm flex items-center gap-3 animate-in fade-in shadow-sm">
            <FiCheckCircle className="w-5 h-5 text-emerald-500 dark:text-emerald-400 shrink-0" />
            <span>{actionSuccessMessage}</span>
          </div>
        )}

        {/* Loading State */}
        {isCheckingShift ? (
          <div className="rounded-3xl bg-white/90 dark:bg-[#101014]/90 border border-slate-200 dark:border-white/10 p-10 flex flex-col items-center justify-center text-center shadow-xl backdrop-blur-2xl">
            <div className="w-12 h-12 border-3 border-primary/20 border-t-primary rounded-full animate-spin mb-4" />
            <p className="text-sm font-bold text-slate-900 dark:text-white">جاري التحقق من حالة الوردية والشيفت...</p>
            <p className="text-xs text-slate-500 dark:text-neutral-400 mt-1">يرجى الانتظار لحظات</p>
          </div>
        ) : hasActiveShift ? (
          /* ── Case 1: Shift is already ACTIVE or needs to be closed ── */
          <div className="rounded-3xl bg-white/95 dark:bg-[#101014]/90 border border-emerald-500/30 dark:border-emerald-500/20 p-7 sm:p-9 shadow-xl shadow-emerald-500/5 backdrop-blur-2xl relative overflow-hidden">
            {/* Ambient emerald glow */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

            {/* Status Header */}
            <div className="flex items-center gap-3 mb-5">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shadow-md shadow-emerald-500/10">
                <FiCheckCircle className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white">يوجد شيفت نشط حالياً</h2>
                </div>
                <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-0.5 font-semibold">
                  {shiftStatus?.message || 'تم فتح الوردية مسبقاً ويمكنك متابعة المبيعات أو إغلاقها'}
                </p>
              </div>
            </div>

            {/* Info Box */}
            <div className="rounded-2xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200/80 dark:border-white/10 p-5 mb-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
              <div className="space-y-1">
                <span className="text-slate-500 dark:text-neutral-400">حالة النظام:</span>
                <p className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  الشيفت جاهز للعمل
                </p>
              </div>

              {activeDevice && (
                <div className="space-y-1">
                  <span className="text-slate-500 dark:text-neutral-400">نقطة البيع (الجهاز):</span>
                  <p className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <FiMonitor className="w-4 h-4 text-primary" />
                    {activeDevice.name}
                  </p>
                </div>
              )}

              {activeShift?.start && (
                <div className="space-y-1">
                  <span className="text-slate-500 dark:text-neutral-400">وقت البدء:</span>
                  <p className="text-sm font-bold text-slate-900 dark:text-white font-mono">
                    {new Date(activeShift.start).toLocaleTimeString('ar-SA', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              )}

              <div className="space-y-1">
                <span className="text-slate-500 dark:text-neutral-400">إشعار الخادم:</span>
                <p className="text-xs font-semibold text-amber-600 dark:text-amber-300">
                  {shiftStatus?.message || 'يرجى غلق الشيفت السابق اولا عند الانتهاء'}
                </p>
              </div>
            </div>

            {/* Two Main Actions: Enter POS immediately OR End Shift */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Option 1: Continue to POS */}
              <button
                type="button"
                onClick={() => navigate('/dashboard')}
                className="w-full py-4 px-5 rounded-2xl bg-gradient-to-l from-primary to-indigo-600 hover:opacity-95 text-white font-bold text-sm shadow-xl shadow-primary/25 transition-all flex items-center justify-center gap-2 cursor-pointer group"
              >
                <span>الدخول مباشرة إلى نقطة البيع</span>
                <FiArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
              </button>

              {/* Option 2: End Shift */}
              <button
                type="button"
                onClick={() => setIsEndModalOpen(true)}
                disabled={isEndingShift}
                className="w-full py-4 px-5 rounded-2xl bg-red-50 dark:bg-red-500/10 hover:bg-red-100 dark:hover:bg-red-500/20 border border-red-200 dark:border-red-500/30 hover:border-red-300 dark:hover:border-red-500/50 text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 font-bold text-sm transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 shadow-sm"
              >
                <FiSquare className="w-5 h-5" />
                <span>إنهاء الشيفت وتسجيل الخروج</span>
              </button>
            </div>
          </div>
        ) : (
          /* ── Case 2: Ready to Start New Shift ── */
          <div className="rounded-3xl bg-white/95 dark:bg-[#101014]/90 border border-slate-200/90 dark:border-white/10 p-7 sm:p-9 shadow-xl dark:shadow-2xl shadow-slate-200/50 backdrop-blur-2xl relative overflow-hidden">
            {/* Ambient Glow */}
            <div className="absolute top-0 left-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl pointer-events-none" />

            {/* Section Header */}
            <div className="mb-6">
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold">
                  <FiLayers className="w-3.5 h-3.5" />
                  <span>خطوة إلزامية لبدء المبيعات</span>
                </div>
                {shiftStatus?.message && (
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-bold shadow-sm">
                    <FiCheckCircle className="w-3.5 h-3.5" />
                    <span>{shiftStatus.message}</span>
                  </div>
                )}
              </div>
              <h2 className="text-2xl font-black text-slate-900 dark:text-white">بدء وردية جديدة (Start Shift)</h2>
              <p className="text-sm text-slate-600 dark:text-neutral-400 mt-1">
                {shiftStatus?.message
                  ? `${shiftStatus.message} — يرجى تحديد جهاز الكاشير للبدء في استلام الطلبات.`
                  : 'يرجى تحديد جهاز ونقطة البيع التابع لها للبدء في استلام الطلبات وإصدار الفواتير.'}
              </p>
            </div>

            {/* Device Selector */}
            <div className="space-y-3 mb-8">
              <label className="block text-xs font-bold text-slate-700 dark:text-neutral-300">
                اختر جهاز الكاشير (نقطة البيع)
              </label>

              {loadingCashiers ? (
                <div className="p-4 rounded-xl bg-slate-100 dark:bg-white/[0.02] border border-slate-200 dark:border-white/5 text-center text-xs text-slate-500 dark:text-neutral-400">
                  جاري تحميل أجهزة الكاشير المتاحة...
                </div>
              ) : cashiers.length === 0 ? (
                <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 text-amber-700 dark:text-amber-400 text-xs shadow-sm">
                  لم يتم العثور على أجهزة كاشير مسجلة في الفرع. يرجى التواصل مع الإدارة.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                  {cashiers.map((cashier) => {
                    const isSelected = selectedCashierId === cashier.id;
                    return (
                      <div
                        key={cashier.id}
                        onClick={() => setSelectedCashierId(cashier.id)}
                        className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                          isSelected
                            ? 'bg-primary/10 dark:bg-primary/15 border-primary text-slate-900 dark:text-white shadow-md shadow-primary/10 ring-1 ring-primary/40'
                            : 'bg-slate-50 dark:bg-white/[0.02] hover:bg-slate-100 dark:hover:bg-white/[0.05] border-slate-200 dark:border-white/10 text-slate-700 dark:text-neutral-300'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
                              isSelected
                                ? 'bg-primary text-white shadow-sm'
                                : 'bg-slate-200 dark:bg-white/5 text-slate-600 dark:text-neutral-400'
                            }`}
                          >
                            <FiMonitor className="w-5 h-5" />
                          </div>
                          <div>
                            <span className="block text-sm font-bold text-slate-900 dark:text-white">{cashier.name}</span>
                            <span className="block text-[11px] text-slate-500 dark:text-neutral-400">
                              معرّف الجهاز: #{cashier.id}
                            </span>
                          </div>
                        </div>

                        <div
                          className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                            isSelected
                              ? 'border-primary bg-primary text-white'
                              : 'border-slate-300 dark:border-neutral-600'
                          }`}
                        >
                          {isSelected && <FiCheckCircle className="w-3.5 h-3.5" />}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Start Shift CTA */}
            <button
              type="button"
              onClick={handleStartShift}
              disabled={!selectedCashierId || isStartingShift || loadingCashiers}
              className="w-full py-4 px-6 rounded-2xl bg-gradient-to-l from-primary to-indigo-600 hover:opacity-95 text-white font-bold text-base shadow-xl shadow-primary/30 transition-all flex items-center justify-center gap-3 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed group"
            >
              {isStartingShift ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>جاري بدء الشيفت...</span>
                </>
              ) : (
                <>
                  <FiPlay className="w-5 h-5 fill-current group-hover:scale-110 transition-transform" />
                  <span>
                    بدء الشيفت الآن {selectedDevice ? `(${selectedDevice.name})` : ''}
                  </span>
                </>
              )}
            </button>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="relative z-10 w-full text-center py-4 border-t border-slate-200 dark:border-white/5 text-xs text-slate-500 dark:text-neutral-500">
        نظام الكاشير ونقاط البيع POS &copy; {new Date().getFullYear()} - جميع الحقوق محفوظة
      </footer>

      {/* End Shift Confirmation Modal */}
      <EndShiftModal
        isOpen={isEndModalOpen}
        onClose={() => setIsEndModalOpen(false)}
        onConfirm={handleConfirmEndShift}
        isEnding={isEndingShift}
        shift={activeShift}
        device={activeDevice}
      />
    </div>
  );
};

export default ShiftPage;
