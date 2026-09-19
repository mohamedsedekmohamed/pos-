import React, { createContext, useContext, useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { cashierApi } from '../services/cashierService';
import { useAuth } from './AuthContext';
import type { Shift, CashierDevice } from '../types/cashier';

export interface CheckShiftResponse {
  status: boolean;
  message?: string;
  data?: any;
}

interface StoredShiftData {
  shift: Shift;
  device?: CashierDevice | null;
}

const STORAGE_KEY_SHIFT = 'pos_active_shift';

interface ShiftContextType {
  shiftStatus: CheckShiftResponse | null;
  isCheckingShift: boolean;
  activeShift: Shift | null;
  activeDevice: CashierDevice | null;
  hasActiveShift: boolean;
  canStartNewShift: boolean;
  startShift: (cashierId: number, device?: CashierDevice) => Promise<Shift>;
  endShift: (shouldLogout?: boolean) => Promise<Shift>;
  refetchShift: () => Promise<any>;
  isStartingShift: boolean;
  isEndingShift: boolean;
  shiftError: string | null;
  clearShiftError: () => void;
}

const ShiftContext = createContext<ShiftContextType | undefined>(undefined);

export const useShift = (): ShiftContextType => {
  const context = useContext(ShiftContext);
  if (!context) {
    throw new Error('useShift must be used within a ShiftProvider');
  }
  return context;
};

export const ShiftProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const queryClient = useQueryClient();
  const { user, isAuthenticated, logout } = useAuth();

  const [activeShift, setActiveShift] = useState<Shift | null>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_SHIFT);
      if (stored) {
        const parsed: StoredShiftData = JSON.parse(stored);
        return parsed.shift;
      }
    } catch {
      // Ignore parse errors
    }
    return null;
  });

  const [activeDevice, setActiveDevice] = useState<CashierDevice | null>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_SHIFT);
      if (stored) {
        const parsed: StoredShiftData = JSON.parse(stored);
        return parsed.device || null;
      }
    } catch {
      // Ignore parse errors
    }
    return null;
  });

  const [shiftError, setShiftError] = useState<string | null>(null);

  // ── Query: Check Shift Status ──
  const {
    data: shiftStatus = null,
    isLoading: isCheckingShift,
    refetch: refetchShift,
  } = useQuery({
    queryKey: ['cashier', 'check-start-shift'],
    queryFn: cashierApi.checkStartShift,
    enabled: isAuthenticated,
    staleTime: 10_000,
    retry: 1,
  });

  // ── Determine Active Shift State ──
  // If API returns { status: false, message: "يرجى غلق الشيفت السابق اولا" },
  // it means a shift is ALREADY ACTIVE and needs to be closed before starting a new one.
  // If API returns { status: true, message: "تقدر تبدأ الشيفت" }, it means NO shift is active,
  // and the cashier is ready to start one. The server is the authoritative source of truth.
  const hasActiveShift = Boolean(
    shiftStatus?.status === true
      ? false
      : (
          activeShift ||
          (shiftStatus && shiftStatus.status === false)
        )
  );

  const canStartNewShift = Boolean(
    shiftStatus?.status === true || (!hasActiveShift && !activeShift)
  );

  // Clear stale local shift if server explicitly reports status: true (ready to start)
  useEffect(() => {
    if (shiftStatus && shiftStatus.status === true && activeShift) {
      setActiveShift(null);
      setActiveDevice(null);
      localStorage.removeItem(STORAGE_KEY_SHIFT);
    }
  }, [shiftStatus, activeShift]);

  // ── Start Shift Mutation ──
  const startShiftMutation = useMutation({
    mutationFn: (params: { cashierId: number; device?: CashierDevice }) =>
      cashierApi.startShift({
        cashier_id: params.cashierId,
        cashier_man_id: user?.id ?? null,
      }),
    onSuccess: (shift, variables) => {
      setActiveShift(shift);
      if (variables.device) {
        setActiveDevice(variables.device);
      }
      const dataToStore: StoredShiftData = {
        shift,
        device: variables.device || activeDevice,
      };
      localStorage.setItem(STORAGE_KEY_SHIFT, JSON.stringify(dataToStore));
      setShiftError(null);
      queryClient.invalidateQueries({ queryKey: ['cashier', 'check-start-shift'] });
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message || err.message || 'فشل في بدء الشيفت';
      setShiftError(msg);
    },
  });

  // ── End Shift Mutation ──
  const endShiftMutation = useMutation({
    mutationFn: cashierApi.endShift,
    onSuccess: (shift) => {
      setActiveShift(null);
      setActiveDevice(null);
      localStorage.removeItem(STORAGE_KEY_SHIFT);
      setShiftError(null);
      queryClient.invalidateQueries({ queryKey: ['cashier', 'check-start-shift'] });
      return shift;
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message || err.message || 'فشل في إنهاء الشيفت';
      setShiftError(msg);
    },
  });

  const startShift = async (cashierId: number, device?: CashierDevice): Promise<Shift> => {
    setShiftError(null);
    return await startShiftMutation.mutateAsync({ cashierId, device });
  };

  const endShift = async (shouldLogout: boolean = true): Promise<Shift> => {
    setShiftError(null);
    const result = await endShiftMutation.mutateAsync();
    if (shouldLogout) {
      logout();
    }
    return result;
  };

  const clearShiftError = () => setShiftError(null);

  // Keep localStorage updated if activeShift changes
  useEffect(() => {
    if (activeShift) {
      const dataToStore: StoredShiftData = {
        shift: activeShift,
        device: activeDevice,
      };
      localStorage.setItem(STORAGE_KEY_SHIFT, JSON.stringify(dataToStore));
    }
  }, [activeShift, activeDevice]);

  return (
    <ShiftContext.Provider
      value={{
        shiftStatus,
        isCheckingShift,
        activeShift,
        activeDevice,
        hasActiveShift,
        canStartNewShift,
        startShift,
        endShift,
        refetchShift,
        isStartingShift: startShiftMutation.isPending,
        isEndingShift: endShiftMutation.isPending,
        shiftError,
        clearShiftError,
      }}
    >
      {children}
    </ShiftContext.Provider>
  );
};
