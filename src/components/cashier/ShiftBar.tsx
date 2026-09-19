import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiSquare, FiMonitor, FiClock, FiAlertCircle, FiSettings } from 'react-icons/fi';
import { useShift } from '../../context/ShiftContext';
import { useLanguage } from '../../context/LanguageContext';
import { EndShiftModal } from './EndShiftModal';

interface ShiftBarProps {
  currentShift?: any;
  onShiftChange?: (shift: any) => void;
}

const ShiftBar: React.FC<ShiftBarProps> = () => {
  const navigate = useNavigate();
  const { language, t } = useLanguage();
  const {
    activeShift,
    activeDevice,
    hasActiveShift,
    endShift,
    isEndingShift,
  } = useShift();

  const [isEndModalOpen, setIsEndModalOpen] = useState(false);
  const [elapsedTime, setElapsedTime] = useState<string>('');

  // Live timer for active shift duration
  useEffect(() => {
    if (!hasActiveShift) {
      setElapsedTime('');
      return;
    }

    const startTime = activeShift?.start || activeShift?.created_at;
    const startMs = startTime ? new Date(startTime).getTime() : Date.now();

    const updateTimer = () => {
      const now = Date.now();
      const diffSec = Math.max(0, Math.floor((now - startMs) / 1000));
      const hours = Math.floor(diffSec / 3600);
      const minutes = Math.floor((diffSec % 3600) / 60);
      const seconds = diffSec % 60;

      const pad = (n: number) => n.toString().padStart(2, '0');
      setElapsedTime(`${pad(hours)}:${pad(minutes)}:${pad(seconds)}`);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [hasActiveShift, activeShift]);

  const handleConfirmEndShift = async () => {
    try {
      await endShift(true);
      setIsEndModalOpen(false);
    } catch {
      // Error handled in context
    }
  };

  if (hasActiveShift) {
    const startTimeFormatted = activeShift?.start
      ? new Date(activeShift.start).toLocaleTimeString(language === 'ar' ? 'ar-SA' : 'en-US', {
          hour: '2-digit',
          minute: '2-digit',
        })
      : null;

    return (
      <>
        <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-2.5 bg-emerald-500/10 dark:bg-emerald-500/15 border-b border-emerald-500/20 text-slate-800 dark:text-emerald-300">
          <div className="flex items-center gap-3">
            {/* Pulsing indicator */}
            <div className="flex items-center gap-2">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
              </span>
              <span className="text-xs sm:text-sm font-bold text-emerald-700 dark:text-emerald-400">
                {t('shift_active')}
              </span>
            </div>

            {/* Device Name */}
            {activeDevice && (
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-xs font-semibold text-emerald-700 dark:text-emerald-300">
                <FiMonitor className="w-3.5 h-3.5" />
                <span>{activeDevice.name}</span>
              </div>
            )}

            {/* Start Time */}
            {startTimeFormatted && (
              <div className="hidden md:flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400/80">
                <span>{t('shift_started_at')}:</span>
                <span className="font-mono">{startTimeFormatted}</span>
              </div>
            )}

            {/* Live Elapsed Time */}
            {elapsedTime && (
              <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-white/50 dark:bg-black/30 border border-emerald-500/20 text-xs font-mono font-bold text-emerald-800 dark:text-emerald-300">
                <FiClock className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                <span>{t('shift_duration')}: {elapsedTime}</span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 ms-auto">
            {/* Link to Shift Page */}
            <button
              type="button"
              onClick={() => navigate('/dashboard/shift')}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white/60 dark:bg-slate-800/80 hover:bg-white dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200 text-xs font-semibold transition-colors cursor-pointer"
              title={t('manage_shift')}
            >
              <FiSettings className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{t('manage_shift')}</span>
            </button>

            {/* End Shift Button */}
            <button
              type="button"
              onClick={() => setIsEndModalOpen(true)}
              disabled={isEndingShift}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white text-xs font-bold transition-all shadow-md shadow-red-600/20 disabled:opacity-50 cursor-pointer"
            >
              <FiSquare className="w-3.5 h-3.5" />
              <span>{isEndingShift ? t('ending_in_progress') : t('ending_shift_btn')}</span>
            </button>
          </div>
        </div>

        <EndShiftModal
          isOpen={isEndModalOpen}
          onClose={() => setIsEndModalOpen(false)}
          onConfirm={handleConfirmEndShift}
          isEnding={isEndingShift}
          shift={activeShift}
          device={activeDevice}
        />
      </>
    );
  }

  // Not in active shift
  return (
    <div className="flex items-center justify-between gap-3 px-4 py-2.5 bg-amber-500/10 border-b border-amber-500/20 text-amber-800 dark:text-amber-300">
      <div className="flex items-center gap-2">
        <FiAlertCircle className="w-4 h-4 text-amber-500" />
        <span className="text-xs sm:text-sm font-bold">
          {t('shift_notice_required')}
        </span>
      </div>

      <button
        type="button"
        onClick={() => navigate('/dashboard/shift')}
        className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold transition-colors cursor-pointer"
      >
        <span>{t('go_to_start_shift')}</span>
      </button>
    </div>
  );
};

export default ShiftBar;
