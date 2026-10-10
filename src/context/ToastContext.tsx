import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { FiAlertCircle, FiCheckCircle, FiInfo, FiAlertTriangle, FiX, FiClock } from 'react-icons/fi';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastMessage {
  id: string;
  type: ToastType;
  message: string;
  title?: string;
  duration?: number;
}

export interface ModalAlertData {
  isOpen: boolean;
  title?: string;
  message: string;
  isClosedRestaurant?: boolean;
}

interface ToastContextType {
  toasts: ToastMessage[];
  showToast: (message: string, type?: ToastType, title?: string, duration?: number) => void;
  showError: (message: string, title?: string) => void;
  showSuccess: (message: string, title?: string) => void;
  showWarning: (message: string, title?: string) => void;
  showInfo: (message: string, title?: string) => void;
  showClosedAlert: (message: string) => void;
  dismissToast: (id: string) => void;
  closeModalAlert: () => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

// Standalone trigger helper for Axios interceptor and external calls
export const notifyApiError = (message: string, isClosedStatus: boolean = false) => {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent('app:notify-error', {
        detail: { message, isClosedStatus },
      })
    );
  }
};

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [modalAlert, setModalAlert] = useState<ModalAlertData>({
    isOpen: false,
    message: '',
  });

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    (message: string, type: ToastType = 'info', title?: string, duration: number = 4500) => {
      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      setToasts((prev) => [...prev, { id, type, message, title, duration }]);

      if (duration > 0) {
        setTimeout(() => {
          dismissToast(id);
        }, duration);
      }
    },
    [dismissToast]
  );

  const showError = useCallback(
    (message: string, title?: string) => showToast(message, 'error', title),
    [showToast]
  );

  const showSuccess = useCallback(
    (message: string, title?: string) => showToast(message, 'success', title),
    [showToast]
  );

  const showWarning = useCallback(
    (message: string, title?: string) => showToast(message, 'warning', title),
    [showToast]
  );

  const showInfo = useCallback(
    (message: string, title?: string) => showToast(message, 'info', title),
    [showToast]
  );

  const showClosedAlert = useCallback((message: string) => {
    setModalAlert({
      isOpen: true,
      title: 'المطعم مغلق حالياً',
      message,
      isClosedRestaurant: true,
    });
  }, []);

  const closeModalAlert = useCallback(() => {
    setModalAlert((prev) => ({ ...prev, isOpen: false }));
  }, []);

  // Listen to external window events from axios interceptors
  useEffect(() => {
    const handleNotify = (e: Event) => {
      const customEvent = e as CustomEvent<{ message: string; isClosedStatus?: boolean }>;
      const { message, isClosedStatus } = customEvent.detail || {};
      if (!message) return;

      if (isClosedStatus || message.includes('المطعم مغلق') || message.includes('مواعيد العمل')) {
        showClosedAlert(message);
      } else {
        showError(message);
      }
    };

    window.addEventListener('app:notify-error', handleNotify);
    return () => {
      window.removeEventListener('app:notify-error', handleNotify);
    };
  }, [showClosedAlert, showError]);

  return (
    <ToastContext.Provider
      value={{
        toasts,
        showToast,
        showError,
        showSuccess,
        showWarning,
        showInfo,
        showClosedAlert,
        dismissToast,
        closeModalAlert,
      }}
    >
      {children}

      {/* ── Toast Container (Top Right/Center) ── */}
      <div
        className="fixed top-4 left-1/2 -translate-x-1/2 sm:translate-x-0 sm:left-auto sm:right-4 z-50 flex flex-col gap-2.5 max-w-[92vw] sm:max-w-md w-full pointer-events-none"
        dir="rtl"
      >
        {toasts.map((toast) => {
          const typeStyles = {
            error: {
              border: 'border-red-500/40 dark:border-red-500/30',
              bg: 'bg-red-500/95 dark:bg-[#1f0f12]/95',
              glow: 'shadow-red-500/20',
              icon: <FiAlertCircle className="w-5 h-5 text-white dark:text-red-400 shrink-0" />,
              text: 'text-white dark:text-red-100',
              subtext: 'text-white/90 dark:text-red-200/80',
            },
            warning: {
              border: 'border-amber-500/40 dark:border-amber-500/30',
              bg: 'bg-amber-500/95 dark:bg-[#231808]/95',
              glow: 'shadow-amber-500/20',
              icon: <FiAlertTriangle className="w-5 h-5 text-white dark:text-amber-400 shrink-0" />,
              text: 'text-white dark:text-amber-100',
              subtext: 'text-white/90 dark:text-amber-200/80',
            },
            success: {
              border: 'border-emerald-500/40 dark:border-emerald-500/30',
              bg: 'bg-emerald-600/95 dark:bg-[#081f14]/95',
              glow: 'shadow-emerald-500/20',
              icon: <FiCheckCircle className="w-5 h-5 text-white dark:text-emerald-400 shrink-0" />,
              text: 'text-white dark:text-emerald-100',
              subtext: 'text-white/90 dark:text-emerald-200/80',
            },
            info: {
              border: 'border-blue-500/40 dark:border-blue-500/30',
              bg: 'bg-blue-600/95 dark:bg-[#0a1628]/95',
              glow: 'shadow-blue-500/20',
              icon: <FiInfo className="w-5 h-5 text-white dark:text-blue-400 shrink-0" />,
              text: 'text-white dark:text-blue-100',
              subtext: 'text-white/90 dark:text-blue-200/80',
            },
          }[toast.type];

          return (
            <div
              key={toast.id}
              className={`pointer-events-auto p-3.5 sm:p-4 rounded-2xl border ${typeStyles.border} ${typeStyles.bg} shadow-2xl ${typeStyles.glow} backdrop-blur-xl flex items-start gap-3 transition-all duration-300 animate-in slide-in-from-top-4`}
            >
              <div className="pt-0.5">{typeStyles.icon}</div>
              <div className="flex-1 min-w-0 text-right">
                {toast.title && (
                  <h4 className={`text-xs sm:text-sm font-bold ${typeStyles.text} leading-tight mb-0.5`}>
                    {toast.title}
                  </h4>
                )}
                <p className={`text-xs sm:text-sm font-semibold leading-relaxed ${typeStyles.subtext}`}>
                  {toast.message}
                </p>
              </div>
              <button
                type="button"
                onClick={() => dismissToast(toast.id)}
                className="p-1 rounded-lg text-white/70 hover:text-white dark:text-white/50 dark:hover:text-white hover:bg-white/10 transition-colors"
                title="إغلاق"
              >
                <FiX className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>

      {/* ── High-Priority Red Modal for Restaurant Closed Alert (400) ── */}
      {modalAlert.isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200"
          dir="rtl"
        >
          <div className="relative w-full max-w-md bg-white dark:bg-[#150a0c] border border-red-500/30 rounded-3xl p-6 sm:p-7 shadow-2xl shadow-red-950/50 text-center space-y-5 animate-in zoom-in-95 duration-200">
            {/* Glowing Icon Header */}
            <div className="relative inline-flex items-center justify-center">
              <div className="absolute inset-0 rounded-full bg-red-500/25 blur-xl animate-pulse" />
              <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-tr from-red-600 to-rose-500 border border-red-400/40 flex items-center justify-center text-white shadow-xl shadow-red-500/30">
                <FiClock className="w-8 h-8" />
              </div>
            </div>

            <div>
              <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white mb-2">
                {modalAlert.title || 'تنبيه مهم'}
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-neutral-300 leading-relaxed font-semibold">
                {modalAlert.message}
              </p>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={closeModalAlert}
                className="w-full py-3 px-5 rounded-2xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-bold text-xs sm:text-sm shadow-xl shadow-red-600/30 active:scale-98 transition-all cursor-pointer"
              >
                حسناً، فهمت
              </button>
            </div>
          </div>
        </div>
      )}
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
