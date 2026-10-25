import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { kitchenApi } from '../../services/kitchenService';
import { getKitchenToken, removeKitchenToken } from '../../lib/axios';
import { useBusinessSetup } from '../../hooks/useBusinessSetup';
import type { KitchenOrder, KitchenOrderItem } from '../../types/kitchen';
import { GiCookingPot } from 'react-icons/gi';
import {
  FiLogOut,
  FiClock,
  FiCheck,
  FiCheckCircle,
  FiRefreshCw,
  FiPackage,
  FiAlertCircle,
  FiChevronDown,
  FiChevronUp,
  FiHash,
  FiX,
} from 'react-icons/fi';

// ── Helper: Time elapsed since creation ──
const getElapsedTime = (createdAt: string): { minutes: number; label: string; urgency: 'new' | 'normal' | 'warning' | 'critical' } => {
  const created = new Date(createdAt);
  const now = new Date();
  const diffMs = now.getTime() - created.getTime();
  const minutes = Math.floor(diffMs / 60000);

  let label: string;
  if (minutes < 1) label = 'الآن';
  else if (minutes < 60) label = `${minutes} د`;
  else {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    label = `${hours} س ${mins > 0 ? `${mins} د` : ''}`;
  }

  let urgency: 'new' | 'normal' | 'warning' | 'critical';
  if (minutes <= 2) urgency = 'new';
  else if (minutes <= 10) urgency = 'normal';
  else if (minutes <= 20) urgency = 'warning';
  else urgency = 'critical';

  return { minutes, label, urgency };
};

// ── Helper: Module label ──
const getModuleLabel = (module: string): { label: string; color: string } => {
  switch (module) {
    case 'dinein': return { label: 'داخلي', color: 'bg-blue-500/15 text-blue-400 border-blue-500/25' };
    case 'takeaway': return { label: 'سفري', color: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/25' };
    case 'delivery': return { label: 'توصيل', color: 'bg-violet-500/15 text-violet-400 border-violet-500/25' };
    default: return { label: module, color: 'bg-neutral-500/15 text-neutral-400 border-neutral-500/25' };
  }
};

// ── Urgency border color map ──
const urgencyBorder: Record<string, string> = {
  new: 'border-emerald-500/40',
  normal: 'border-orange-500/30',
  warning: 'border-amber-500/50',
  critical: 'border-red-500/60',
};
const urgencyGlow: Record<string, string> = {
  new: '',
  normal: '',
  warning: 'shadow-amber-500/10',
  critical: 'shadow-red-500/20 animate-pulse',
};

// ═══════════ ORDER ITEM ROW ═══════════
const OrderItemRow: React.FC<{ item: KitchenOrderItem; idx: number }> = ({ item, idx }) => (
  <div
    className={`flex items-start gap-3 py-2.5 px-3 rounded-lg transition-colors ${idx % 2 === 0 ? 'bg-white/[0.02]' : ''}`}
  >
    {/* Quantity Badge */}
    <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-orange-500/15 border border-orange-500/25 flex items-center justify-center text-orange-400 font-black text-sm">
      {item.quantity}
    </div>

    {/* Product Details */}
    <div className="flex-1 min-w-0">
      <p className="text-sm font-bold text-white leading-snug truncate">
        {item.product_name || `منتج #${item.product_id}`}
      </p>

      {/* Variations */}
      {item.variations?.length > 0 && item.variations.some(v => v.name) && (
        <div className="flex flex-wrap gap-1 mt-1">
          {item.variations.filter(v => v.name).map((v, i) => (
            <span
              key={i}
              className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded bg-violet-500/10 text-violet-300 border border-violet-500/15"
            >
              {v.name}: {v.options?.filter(Boolean).join(', ')}
            </span>
          ))}
        </div>
      )}

      {/* Addons */}
      {item.addons?.length > 0 && item.addons.some(a => a.name) && (
        <div className="flex flex-wrap gap-1 mt-1">
          {item.addons.filter(a => a.name).map((a, i) => (
            <span
              key={i}
              className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/15"
            >
              + {a.name}
            </span>
          ))}
        </div>
      )}

      {/* Note */}
      {item.note && (
        <p className="text-[11px] text-yellow-400/80 mt-1 flex items-center gap-1">
          <FiAlertCircle className="w-3 h-3 shrink-0" />
          <span className="truncate">{item.note}</span>
        </p>
      )}
    </div>
  </div>
);

// ═══════════ ORDER CARD ═══════════
const OrderCard: React.FC<{
  order: KitchenOrder;
  onMarkDone: (id: number) => void;
  isMarking: boolean;
}> = ({ order, onMarkDone, isMarking }) => {
  const elapsed = getElapsedTime(order.created_at);
  const moduleInfo = getModuleLabel(order.module);

  return (
    <div
      className={`relative rounded-2xl bg-[#111116]/90 backdrop-blur-xl border-2 ${urgencyBorder[elapsed.urgency]} 
        shadow-xl ${urgencyGlow[elapsed.urgency]} transition-all duration-500 flex flex-col overflow-hidden group
        hover:border-orange-500/50 hover:shadow-orange-500/10`}
    >
      {/* ── Card Header ── */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/5 bg-white/[0.02]">
        <div className="flex items-center gap-2.5 min-w-0">
          {/* Order Number */}
          <div className="flex items-center gap-1 text-white font-black text-base">
            <FiHash className="w-4 h-4 text-orange-400" />
            <span>{order.order_id}</span>
          </div>

          {/* Module Badge */}
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${moduleInfo.color}`}>
            {moduleInfo.label}
          </span>
        </div>

        {/* Timer */}
        <div
          className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-lg border ${
            elapsed.urgency === 'critical'
              ? 'bg-red-500/15 text-red-400 border-red-500/30 animate-pulse'
              : elapsed.urgency === 'warning'
              ? 'bg-amber-500/15 text-amber-400 border-amber-500/30'
              : elapsed.urgency === 'new'
              ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
              : 'bg-white/5 text-neutral-300 border-white/10'
          }`}
        >
          <FiClock className="w-3 h-3" />
          <span>{elapsed.label}</span>
        </div>
      </div>

      {/* ── Table / Captain Info ── */}
      {(order.table?.name || order.captain_order?.user_name) && (
        <div className="flex items-center gap-3 px-4 py-2 text-[11px] text-neutral-400 border-b border-white/5">
          {order.table?.name && (
            <span className="flex items-center gap-1">
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 12h18M3 6h18M3 18h18" />
              </svg>
              {order.table.name}
              {order.table.hall_name?.filter(Boolean).length > 0 && (
                <span className="text-neutral-500">({order.table.hall_name.filter(Boolean).join(', ')})</span>
              )}
            </span>
          )}
          {order.captain_order?.user_name && (
            <span className="flex items-center gap-1">
              <FiPackage className="w-3 h-3" />
              {order.captain_order.user_name}
            </span>
          )}
        </div>
      )}

      {/* ── Items List ── */}
      <div className="flex-1 px-3 py-2 space-y-0.5 overflow-y-auto max-h-72 scrollbar-thin">
        {order.items.map((item, idx) => (
          <OrderItemRow key={item.id} item={item} idx={idx} />
        ))}
      </div>

      {/* ── Card Footer: Mark Done Button ── */}
      <div className="px-3 pb-3 pt-2 border-t border-white/5">
        <button
          onClick={() => onMarkDone(order.id)}
          disabled={isMarking}
          className="w-full py-2.5 rounded-xl bg-gradient-to-l from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 
            active:scale-[0.98] text-white font-bold text-sm shadow-lg shadow-emerald-500/20 
            hover:shadow-emerald-500/40 transition-all flex items-center justify-center gap-2 
            cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed group/btn"
        >
          {isMarking ? (
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              <FiCheck className="w-4 h-4 group-hover/btn:scale-110 transition-transform" />
              <span>تم التحضير</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};

// ═══════════ DONE ORDER MODAL ═══════════
const DoneOrdersPanel: React.FC<{
  isOpen: boolean;
  onClose: () => void;
}> = ({ isOpen, onClose }) => {
  const today = new Date().toISOString().split('T')[0];
  const { data, isLoading } = useQuery({
    queryKey: ['kitchen', 'done-orders', today],
    queryFn: () => kitchenApi.getDoneOrders({ date: today, per_page: 50 }),
    enabled: isOpen,
    refetchInterval: 30000,
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div
        className="relative w-full max-w-2xl max-h-[85vh] bg-[#101014]/95 border border-white/10 rounded-3xl shadow-2xl flex flex-col overflow-hidden m-4"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/15 border border-emerald-500/25 flex items-center justify-center">
              <FiCheckCircle className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <h2 className="text-lg font-black text-white">الطلبات المكتملة</h2>
              <p className="text-xs text-neutral-400">طلبات اليوم التي تم تحضيرها</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-neutral-400 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
          >
            <FiX className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <div className="w-8 h-8 border-3 border-emerald-500/30 border-t-emerald-400 rounded-full animate-spin" />
            </div>
          ) : !data?.data?.length ? (
            <div className="flex flex-col items-center justify-center py-20 text-neutral-500">
              <FiCheckCircle className="w-12 h-12 mb-3 opacity-30" />
              <p className="text-sm font-medium">لا توجد طلبات مكتملة اليوم</p>
            </div>
          ) : (
            data.data.map((order) => (
              <div
                key={order.id}
                className="rounded-xl bg-white/[0.03] border border-white/8 p-4 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-white font-bold text-sm flex items-center gap-1">
                      <FiHash className="w-3.5 h-3.5 text-emerald-400" />
                      {order.order_id}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getModuleLabel(order.module).color}`}>
                      {getModuleLabel(order.module).label}
                    </span>
                  </div>
                  {order.completed_at && (
                    <span className="text-[11px] text-emerald-400 font-medium">
                      ✓ {new Date(order.completed_at).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  )}
                </div>
                <div className="space-y-1">
                  {order.items.map((item) => (
                    <div key={item.id} className="flex items-center gap-2 text-xs text-neutral-300">
                      <span className="w-5 h-5 rounded bg-emerald-500/10 text-emerald-400 flex items-center justify-center text-[10px] font-bold">
                        {item.quantity}
                      </span>
                      <span>{item.product_name || `#${item.product_id}`}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer count */}
        {data?.count !== undefined && (
          <div className="px-6 py-3 border-t border-white/10 text-center">
            <span className="text-xs text-neutral-400">
              إجمالي: <span className="font-bold text-emerald-400">{data.count}</span> طلب مكتمل
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

// ── Refresh interval constant ──
const REFRESH_INTERVAL = 15; // seconds

// ═══════════ MAIN KITCHEN DISPLAY ═══════════
const KitchenDisplayPage: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { business, logoUrl } = useBusinessSetup();
  const [showDone, setShowDone] = useState(false);
  const [markingId, setMarkingId] = useState<number | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [countdown, setCountdown] = useState(REFRESH_INTERVAL);
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Redirect if no kitchen token
  useEffect(() => {
    if (!getKitchenToken()) {
      navigate('/kitchen/login', { replace: true });
    }
  }, [navigate]);

  // Real-time clock
  useEffect(() => {
    const interval = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  // ── Countdown timer: ticks every second from REFRESH_INTERVAL → 0 ──
  useEffect(() => {
    countdownRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) return REFRESH_INTERVAL;
        return prev - 1;
      });
    }, 1000);
    return () => {
      if (countdownRef.current) clearInterval(countdownRef.current);
    };
  }, []);

  // ── Fetch current orders (auto-refresh every 15 seconds) ──
  const { data: ordersData, isLoading, isFetching, isError, error, dataUpdatedAt } = useQuery({
    queryKey: ['kitchen', 'orders'],
    queryFn: () => kitchenApi.getOrders('ar'),
    refetchInterval: REFRESH_INTERVAL * 1000,
    refetchIntervalInBackground: true,
    retry: 2,
  });

  // Reset countdown when data is freshly fetched
  useEffect(() => {
    if (dataUpdatedAt) {
      setCountdown(REFRESH_INTERVAL);
    }
  }, [dataUpdatedAt]);

  const orders: KitchenOrder[] = ordersData?.data || [];

  // ── Check for new orders (polling alongside) ──
  const orderCountRef = useRef<number>(0);
  useEffect(() => {
    orderCountRef.current = orders.length;
  }, [orders.length]);

  useQuery({
    queryKey: ['kitchen', 'check-new', orderCountRef.current],
    queryFn: () => kitchenApi.checkNewOrders(orderCountRef.current, 'ar'),
    refetchInterval: 15000,
    refetchIntervalInBackground: true,
    enabled: orders.length > 0,
  });

  // ── Mark order done mutation ──
  const markDoneMutation = useMutation({
    mutationFn: kitchenApi.markOrderDone,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['kitchen', 'orders'] });
      queryClient.invalidateQueries({ queryKey: ['kitchen', 'done-orders'] });
      setMarkingId(null);
    },
    onError: () => {
      setMarkingId(null);
    },
  });

  const handleMarkDone = useCallback((id: number) => {
    setMarkingId(id);
    markDoneMutation.mutate(id);
  }, [markDoneMutation]);

  // ── Logout ──
  const handleLogout = () => {
    removeKitchenToken();
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem('pos_kitchen_user');
    }
    navigate('/kitchen/login', { replace: true });
  };

  const timeStr = currentTime.toLocaleTimeString('ar-EG', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  });
  const dateStr = currentTime.toLocaleDateString('ar-EG', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="min-h-screen bg-[#070709] text-white flex flex-col select-none" dir="rtl">
      {/* ═══════ TOP BAR ═══════ */}
      <header className="sticky top-0 z-40 bg-[#0c0c10]/90 backdrop-blur-2xl border-b border-white/8">
        <div className="flex items-center justify-between px-4 sm:px-6 py-3">
          {/* Left: Logo + Title */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-orange-500/20 to-red-600/20 border border-orange-500/25 flex items-center justify-center shadow-lg overflow-hidden p-1.5">
              {logoUrl ? (
                <img src={logoUrl} alt="" className="w-full h-full object-contain" />
              ) : (
                <GiCookingPot className="w-5 h-5 text-orange-400" />
              )}
            </div>
            <div className="hidden sm:block">
              <h1 className="text-sm font-black text-white leading-none">
                {typeof business?.name === 'string' ? business.name : 'شاشة المطبخ'}
              </h1>
              <p className="text-[10px] text-neutral-500 mt-0.5">Kitchen Display System</p>
            </div>
          </div>

          {/* Center: Orders Count + Countdown */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-orange-500/10 border border-orange-500/20">
              <GiCookingPot className="w-4 h-4 text-orange-400" />
              <span className="text-orange-400 font-black text-sm">{orders.length}</span>
              <span className="text-neutral-400 text-xs hidden sm:inline">طلب معلّق</span>
            </div>
            {/* Countdown Pill */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/[0.03] border border-white/8 min-w-[110px]">
              <FiRefreshCw className={`w-3.5 h-3.5 shrink-0 ${isFetching ? 'text-orange-400 animate-spin' : 'text-emerald-400'}`} />
              {/* Mini progress bar inside pill */}
              <div className="flex-1 h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-1000 ease-linear ${
                    isFetching
                      ? 'bg-orange-400 w-full animate-pulse'
                      : countdown > 10
                      ? 'bg-emerald-400'
                      : countdown > 5
                      ? 'bg-amber-400'
                      : 'bg-red-400'
                  }`}
                  style={{ width: isFetching ? '100%' : `${(countdown / REFRESH_INTERVAL) * 100}%` }}
                />
              </div>
              <span className={`text-[11px] font-bold tabular-nums font-mono min-w-[22px] text-center ${
                isFetching
                  ? 'text-orange-400'
                  : countdown <= 5
                  ? 'text-red-400'
                  : countdown <= 10
                  ? 'text-amber-400'
                  : 'text-neutral-300'
              }`}>
                {isFetching ? '...' : `${countdown}`}
              </span>
            </div>
          </div>

          {/* Right: Time + Done + Logout */}
          <div className="flex items-center gap-2">
            {/* Time */}
            <div className="hidden md:flex flex-col items-end">
              <span className="text-xs font-bold text-white font-mono tabular-nums">{timeStr}</span>
              <span className="text-[10px] text-neutral-500">{dateStr}</span>
            </div>

            {/* Done Orders Button */}
            <button
              onClick={() => setShowDone(true)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold hover:bg-emerald-500/20 transition-all cursor-pointer"
            >
              <FiCheckCircle className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">المكتملة</span>
            </button>

            {/* Logout */}
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-bold hover:bg-red-500/20 transition-all cursor-pointer"
            >
              <FiLogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">خروج</span>
            </button>
          </div>
        </div>
        {/* ═══ Full-Width Countdown Progress Bar ═══ */}
        <div className="w-full h-[3px] bg-white/[0.04]">
          <div
            className={`h-full transition-all duration-1000 ease-linear ${
              isFetching
                ? 'bg-gradient-to-l from-orange-400 to-amber-400 animate-pulse'
                : countdown > 10
                ? 'bg-gradient-to-l from-emerald-400 to-green-500'
                : countdown > 5
                ? 'bg-gradient-to-l from-amber-400 to-yellow-500'
                : 'bg-gradient-to-l from-red-400 to-rose-500'
            }`}
            style={{ width: isFetching ? '100%' : `${(countdown / REFRESH_INTERVAL) * 100}%` }}
          />
        </div>
      </header>

      {/* ═══════ MAIN CONTENT ═══════ */}
      <main className="flex-1 p-4 sm:p-6">
        {/* Error State */}
        {isError && (
          <div className="mb-4 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-medium flex items-center gap-2">
            <FiAlertCircle className="w-4 h-4 shrink-0" />
            <span>خطأ في تحميل الطلبات: {(error as any)?.message || 'حاول مرة أخرى'}</span>
          </div>
        )}

        {/* Loading State */}
        {isLoading && !ordersData && (
          <div className="flex flex-col items-center justify-center py-32">
            <div className="relative">
              <div className="w-16 h-16 rounded-2xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center">
                <GiCookingPot className="w-8 h-8 text-orange-400 animate-pulse" />
              </div>
              <div className="absolute inset-0 w-16 h-16 border-2 border-orange-500/20 border-t-orange-400 rounded-2xl animate-spin" />
            </div>
            <p className="text-sm text-neutral-400 mt-4 font-medium">جارٍ تحميل الطلبات...</p>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && orders.length === 0 && (
          <div className="flex flex-col items-center justify-center py-32">
            <div className="relative mb-4">
              <div className="w-24 h-24 rounded-3xl bg-white/[0.02] border border-white/8 flex items-center justify-center">
                <GiCookingPot className="w-12 h-12 text-neutral-600" />
              </div>
              <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-emerald-500/15 border border-emerald-500/25 flex items-center justify-center">
                <FiCheck className="w-3 h-3 text-emerald-400" />
              </div>
            </div>
            <h2 className="text-xl font-black text-white mb-1">لا توجد طلبات حالياً</h2>
            <p className="text-sm text-neutral-400 mb-4">المطبخ جاهز — سيتم عرض الطلبات الجديدة تلقائياً</p>
            <div className="flex items-center gap-1.5 text-xs text-neutral-500 bg-white/[0.03] border border-white/8 rounded-lg px-3 py-1.5">
              <FiRefreshCw className="w-3 h-3 animate-spin-slow" />
              <span>تحديث تلقائي خلال <span className="font-bold text-neutral-300 tabular-nums">{countdown}</span> ثانية</span>
            </div>
          </div>
        )}

        {/* Orders Grid */}
        {orders.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
            {orders.map((order) => (
              <OrderCard
                key={order.id}
                order={order}
                onMarkDone={handleMarkDone}
                isMarking={markingId === order.id}
              />
            ))}
          </div>
        )}
      </main>

      {/* ═══════ DONE ORDERS MODAL ═══════ */}
      <DoneOrdersPanel isOpen={showDone} onClose={() => setShowDone(false)} />

      {/* ═══════ AMBIENT BACKGROUND EFFECTS ═══════ */}
      <div className="fixed inset-0 pointer-events-none z-[-1] overflow-hidden">
        <div className="absolute -top-64 -right-64 w-[500px] h-[500px] bg-orange-600/5 rounded-full blur-[180px] animate-float-orb" />
        <div
          className="absolute -bottom-64 -left-64 w-[500px] h-[500px] bg-red-600/5 rounded-full blur-[180px] animate-float-orb"
          style={{ animationDelay: '6s' }}
        />
      </div>
    </div>
  );
};

export default KitchenDisplayPage;
