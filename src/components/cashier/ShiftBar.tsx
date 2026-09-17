import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { FiPlay, FiSquare, FiMonitor, FiClock } from 'react-icons/fi';
import { cashierApi } from '../../services/cashierService';
import type { Shift } from '../../types/cashier';

interface ShiftBarProps {
  currentShift: Shift | null;
  onShiftChange: (shift: Shift | null) => void;
}

const ShiftBar: React.FC<ShiftBarProps> = ({ currentShift, onShiftChange }) => {
  const queryClient = useQueryClient();
  const [selectedCashierId, setSelectedCashierId] = useState<number | ''>('');

  const { data: cashiers = [], isLoading: loadingCashiers } = useQuery({
    queryKey: ['cashiers'],
    queryFn: cashierApi.getCashiers,
  });

  const startShiftMutation = useMutation({
    mutationFn: cashierApi.startShift,
    onSuccess: (shift) => {
      onShiftChange(shift);
    },
  });

  const endShiftMutation = useMutation({
    mutationFn: cashierApi.endShift,
    onSuccess: (shift) => {
      onShiftChange(null);
    },
  });

  const handleStartShift = () => {
    if (!selectedCashierId) return;
    startShiftMutation.mutate({ cashier_id: Number(selectedCashierId) });
  };

  const handleEndShift = () => {
    endShiftMutation.mutate();
  };

  if (currentShift) {
    return (
      <div className="flex items-center gap-4 px-4 py-2.5 bg-emerald-50 dark:bg-emerald-500/10 border-b border-emerald-200 dark:border-emerald-500/20">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-sm font-semibold text-emerald-700 dark:text-emerald-400">
            الشيفت نشط
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400/70">
          <FiClock className="w-3.5 h-3.5" />
          <span>
            بدأ: {new Date(currentShift.start).toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
        <div className="mr-auto">
          <button
            onClick={handleEndShift}
            disabled={endShiftMutation.isPending}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-red-500 text-white text-sm font-medium hover:bg-red-600 transition-colors disabled:opacity-50 cursor-pointer"
          >
            <FiSquare className="w-3.5 h-3.5" />
            {endShiftMutation.isPending ? 'جاري...' : 'إنهاء الشيفت'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3 px-4 py-2.5 bg-amber-50 dark:bg-amber-500/10 border-b border-amber-200 dark:border-amber-500/20">
      <div className="flex items-center gap-2">
        <FiMonitor className="w-4 h-4 text-amber-600 dark:text-amber-400" />
        <span className="text-sm font-semibold text-amber-700 dark:text-amber-400">
          ابدأ الشيفت
        </span>
      </div>
      <select
        value={selectedCashierId}
        onChange={(e) => setSelectedCashierId(e.target.value ? Number(e.target.value) : '')}
        className="px-3 py-1.5 rounded-lg bg-white dark:bg-slate-700 border border-amber-300 dark:border-amber-500/30 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50"
        disabled={loadingCashiers}
      >
        <option value="">اختر الكاشير</option>
        {cashiers.map((c) => (
          <option key={c.id} value={c.id}>
            {c.name}
          </option>
        ))}
      </select>
      <button
        onClick={handleStartShift}
        disabled={!selectedCashierId || startShiftMutation.isPending}
        className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-emerald-500 text-white text-sm font-medium hover:bg-emerald-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
      >
        <FiPlay className="w-3.5 h-3.5" />
        {startShiftMutation.isPending ? 'جاري...' : 'بدء'}
      </button>
    </div>
  );
};

export default ShiftBar;
