import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  FiX,
  FiShoppingBag,
  FiTruck,
  FiCoffee,
  FiUsers,
  FiCheckCircle,
  FiClock,
  FiPrinter,
  FiDollarSign,
  FiSearch,
  FiFilter,
} from 'react-icons/fi';
import { cashierApi } from '../../services/cashierService';
import { useLanguage } from '../../context/LanguageContext';
import { useShift } from '../../context/ShiftContext';
import type { Order, Delivery, UnpaidDeliveryOrdersParams } from '../../types/cashier';

export type OrdersModalTab = 'all' | 'delivery' | 'takeaway' | 'dinein' | 'settlement';

interface OrdersManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  onReprintReceipt?: (order: Order) => void;
}

export const OrdersManagementModal: React.FC<OrdersManagementModalProps> = ({
  isOpen,
  onClose,
  onReprintReceipt,
}) => {
  const queryClient = useQueryClient();
  const { dir, t, language } = useLanguage();
  const { activeShift } = useShift();

  // ── Tabs: 'all' | 'delivery' | 'takeaway' | 'dinein' | 'settlement' ──
  const [activeTab, setActiveTab] = useState<OrdersModalTab>('all');

  // ── Filters ──
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDriverId, setSelectedDriverId] = useState<number | ''>('');
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [selectedPaymentFilter, setSelectedPaymentFilter] = useState<'all' | 'paid' | 'unpaid'>('all');

  // ── Status Updating & Settlement State ──
  const [selectedUnpaidIds, setSelectedUnpaidIds] = useState<number[]>([]);
  const [updatingOrderId, setUpdatingOrderId] = useState<number | null>(null);
  const [selectedNewStatus, setSelectedNewStatus] = useState<string>('');
  const [assignDriverId, setAssignDriverId] = useState<number | ''>('');

  // ── Module Allowed Status Mapping (Backend validation rules) ──
  // 'delivery' => ['done', 'out_of_delivery', 'delivered', 'return', 'failed_to_delivered', 'faild_to_delivered']
  // 'takeaway' => ['done', 'pickup', 'return']
  // 'dinein'   => ['return']
  const getStatusOptionsForModule = (module: string) => {
    switch (module) {
      case 'delivery':
        return [
          { value: 'done', label: t('status_done') },
          { value: 'out_of_delivery', label: t('status_out_of_delivery') },
          { value: 'delivered', label: t('status_delivered') },
          { value: 'return', label: t('status_return') },
          { value: 'failed_to_delivered', label: t('status_failed') },
        ];
      case 'takeaway':
        return [
          { value: 'done', label: t('status_done') },
          { value: 'pickup', label: t('status_pickup') },
          { value: 'return', label: t('status_return') },
        ];
      case 'dinein':
        return [
          { value: 'return', label: t('status_return') },
        ];
      default:
        return [
          { value: 'done', label: t('status_done') },
          { value: 'return', label: t('status_return') },
        ];
    }
  };

  const handleTabChange = (tab: OrdersModalTab) => {
    setActiveTab(tab);
    setSelectedStatus('');
    setUpdatingOrderId(null);
  };

  // ── Queries ──
  // 1. Deliveries list for dropdowns
  const { data: deliveries = [] } = useQuery<Delivery[]>({
    queryKey: ['cashier', 'deliveries'],
    queryFn: cashierApi.getDeliveries,
    enabled: isOpen,
  });

  // Current module filter for orders query
  const currentModule =
    activeTab === 'all' || activeTab === 'settlement'
      ? undefined
      : (activeTab as 'delivery' | 'takeaway' | 'dinein');

  // 2. Orders query (filtered per tab)
  const { data: ordersResponse, isLoading: loadingOrders } = useQuery({
    queryKey: ['cashier', 'orders', activeShift?.id, currentModule, searchTerm],
    queryFn: () =>
      cashierApi.getOrders({
        search: searchTerm || undefined,
        shift_id: activeShift?.id,
        module: currentModule,
        per_page: 50,
      }),
    enabled: isOpen && activeTab !== 'settlement',
  });

  // 3. Unpaid delivery orders (used for badge count & settlement tab)
  const unpaidParams: UnpaidDeliveryOrdersParams = {
    delivery_id: selectedDriverId !== '' ? Number(selectedDriverId) : undefined,
    search: searchTerm || undefined,
    per_page: 50,
  };

  const { data: unpaidResponse, isLoading: loadingUnpaid } = useQuery({
    queryKey: ['cashier', 'unpaid-deliveries', unpaidParams, activeShift?.id],
    queryFn: async () => {
      // 1. Try dedicated unpaid deliveries endpoint
      try {
        const dedicatedRes = await cashierApi.getUnpaidDeliveryOrders(unpaidParams);
        if (dedicatedRes?.data && dedicatedRes.data.length > 0) {
          return dedicatedRes;
        }
      } catch (err) {
        console.warn('Error fetching /delivery-orders/unpaid, falling back to /orders?module=delivery', err);
      }

      // 2. Fallback: Fetch delivery orders via /orders?module=delivery
      const fallbackRes = await cashierApi.getOrders({
        module: 'delivery',
        search: searchTerm || undefined,
        shift_id: activeShift?.id,
        per_page: 50,
      });

      const filteredOrders = (fallbackRes?.data || []).filter((o) => {
        const isUnpaid = o.paid === false || (o.paid as any) === 0;
        const matchesDriver =
          selectedDriverId !== ''
            ? Number(o.delivery_id) === Number(selectedDriverId)
            : true;
        return isUnpaid && matchesDriver;
      });

      return {
        ...fallbackRes,
        data: filteredOrders,
      };
    },
    enabled: isOpen,
  });

  // ── Mutations ──
  // Update Order Status
  const updateStatusMutation = useMutation({
    mutationFn: ({ orderId, status, deliveryId }: { orderId: number; status: string; deliveryId?: number }) =>
      cashierApi.updateOrderStatus(orderId, {
        status: status as any,
        delivery_id: deliveryId,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cashier', 'orders'] });
      queryClient.invalidateQueries({ queryKey: ['cashier', 'unpaid-deliveries'] });
      setUpdatingOrderId(null);
      setSelectedNewStatus('');
      setAssignDriverId('');
    },
    onError: (err: any) => {
      alert(err?.response?.data?.message || err?.message || t('error_occurred'));
    },
  });

  // Settle Delivery Payment
  const settleMutation = useMutation({
    mutationFn: (orderIds: number[]) => cashierApi.settleDeliveryPayment({ order_ids: orderIds }),
    onSuccess: (data) => {
      alert(data.message || t('settled_success'));
      setSelectedUnpaidIds([]);
      queryClient.invalidateQueries({ queryKey: ['cashier', 'unpaid-deliveries'] });
      queryClient.invalidateQueries({ queryKey: ['cashier', 'orders'] });
      queryClient.invalidateQueries({ queryKey: ['shift'] });
    },
    onError: (err: any) => {
      alert(err?.response?.data?.message || err?.message || t('error_occurred'));
    },
  });

  if (!isOpen) return null;

  const rawOrdersList: Order[] = ordersResponse?.data || [];

  // Filter orders according to active filters on this tab
  const ordersList = rawOrdersList.filter((order) => {
    // 1. Driver filter (for delivery tab)
    if (activeTab === 'delivery' && selectedDriverId !== '') {
      if (Number(order.delivery_id) !== Number(selectedDriverId)) return false;
    }
    // 2. Status filter
    if (selectedStatus && order.status !== selectedStatus) {
      return false;
    }
    // 3. Payment filter
    if (selectedPaymentFilter === 'paid' && !order.paid) return false;
    if (selectedPaymentFilter === 'unpaid' && order.paid) return false;

    return true;
  });

  const unpaidList: Order[] = unpaidResponse?.data || [];

  const handleSelectAllUnpaid = (checked: boolean) => {
    if (checked) {
      setSelectedUnpaidIds(unpaidList.map((o) => o.id));
    } else {
      setSelectedUnpaidIds([]);
    }
  };

  const handleToggleUnpaid = (id: number) => {
    setSelectedUnpaidIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const totalUnpaidSelectedAmount = unpaidList
    .filter((o) => selectedUnpaidIds.includes(o.id))
    .reduce((sum, o) => sum + (Number(o.final_price) || Number(o.total) || 0), 0);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'done':
        return <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300">{t('status_done')}</span>;
      case 'out_of_delivery':
        return <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-indigo-100 text-indigo-800 dark:bg-indigo-900/40 dark:text-indigo-300">{t('status_out_of_delivery')}</span>;
      case 'delivered':
        return <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-teal-100 text-teal-800 dark:bg-teal-900/40 dark:text-teal-300">{t('status_delivered')}</span>;
      case 'pickup':
        return <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300">{t('status_pickup')}</span>;
      case 'return':
        return <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300">{t('status_return')}</span>;
      case 'failed_to_delivered':
      case 'faild_to_delivered':
        return <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300">{t('status_failed')}</span>;
      default:
        return <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300">{status || t('status_pending')}</span>;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5" dir={dir}>
      {/* Backdrop */}
      <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm transition-opacity" onClick={onClose} />

      {/* Modal Card */}
      <div className="relative w-full max-w-4xl max-h-[92vh] flex flex-col bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-primary/10 text-primary border border-primary/20">
              <FiShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-900 dark:text-white">
                {t('orders_management')}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {activeShift ? `${t('shift_portal')} #${activeShift.id}` : t('pos_cashier')}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>

        {/* ── Main Tab Navigation ── */}
        <div className="flex items-center justify-between px-6 py-2.5 bg-slate-100/70 dark:bg-slate-800/40 border-b border-slate-200 dark:border-slate-800 gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 flex-wrap">
            {/* 1. All */}
            <button
              type="button"
              onClick={() => handleTabChange('all')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'all'
                  ? 'bg-primary text-white shadow-md shadow-primary/25'
                  : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              <FiShoppingBag className="w-3.5 h-3.5" />
              <span>{t('tab_all')}</span>
            </button>

            {/* 2. Delivery */}
            <button
              type="button"
              onClick={() => handleTabChange('delivery')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'delivery'
                  ? 'bg-primary text-white shadow-md shadow-primary/25'
                  : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              <FiTruck className="w-3.5 h-3.5" />
              <span>{t('tab_delivery')}</span>
            </button>

            {/* 3. Takeaway */}
            <button
              type="button"
              onClick={() => handleTabChange('takeaway')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'takeaway'
                  ? 'bg-primary text-white shadow-md shadow-primary/25'
                  : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              <FiCoffee className="w-3.5 h-3.5" />
              <span>{t('tab_takeaway')}</span>
            </button>

            {/* 4. Dine-in */}
            <button
              type="button"
              onClick={() => handleTabChange('dinein')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'dinein'
                  ? 'bg-primary text-white shadow-md shadow-primary/25'
                  : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              <FiUsers className="w-3.5 h-3.5" />
              <span>{t('tab_dinein')}</span>
            </button>

            {/* 5. Settlement */}
            <button
              type="button"
              onClick={() => handleTabChange('settlement')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'settlement'
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/25'
                  : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              <FiDollarSign className="w-3.5 h-3.5" />
              <span>{t('tab_settlement')}</span>
              {unpaidList.length > 0 && (
                <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-red-500 text-white font-mono">
                  {unpaidList.length}
                </span>
              )}
            </button>
          </div>

          {/* Search Input */}
          <div className="relative min-w-[170px] sm:min-w-[210px]">
            <FiSearch className="absolute start-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={t('search_products')}
              className="w-full ps-8 pe-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>

        {/* ── Content Body ── */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 min-h-[350px]">
          {activeTab !== 'settlement' ? (
            /* ═══════════════════════════════════════════════════ */
            /* TAB 1-4: ORDERS VIEW WITH SPECIFIC FILTERS        */
            /* ═══════════════════════════════════════════════════ */
            <div>
              {/* Dedicated Filter Bar per Section */}
              <div className="flex items-center gap-2 mb-4 flex-wrap bg-slate-50 dark:bg-slate-800/40 p-2.5 rounded-2xl border border-slate-200/60 dark:border-slate-700/60 text-xs">
                <span className="flex items-center gap-1 font-bold text-slate-500 dark:text-slate-400">
                  <FiFilter className="w-3.5 h-3.5" />
                  <span>{t('filter_by_status')}:</span>
                </span>

                {/* Status Filter Dropdown */}
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="px-2.5 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-semibold cursor-pointer text-xs"
                >
                  <option value="">{t('all_statuses')}</option>
                  {activeTab === 'all' && (
                    <>
                      <option value="done">{t('status_done')}</option>
                      <option value="pickup">{t('status_pickup')}</option>
                      <option value="out_of_delivery">{t('status_out_of_delivery')}</option>
                      <option value="delivered">{t('status_delivered')}</option>
                      <option value="return">{t('status_return')}</option>
                      <option value="failed_to_delivered">{t('status_failed')}</option>
                    </>
                  )}
                  {activeTab === 'delivery' && (
                    <>
                      <option value="done">{t('status_done')}</option>
                      <option value="out_of_delivery">{t('status_out_of_delivery')}</option>
                      <option value="delivered">{t('status_delivered')}</option>
                      <option value="return">{t('status_return')}</option>
                      <option value="failed_to_delivered">{t('status_failed')}</option>
                    </>
                  )}
                  {activeTab === 'takeaway' && (
                    <>
                      <option value="done">{t('status_done')}</option>
                      <option value="pickup">{t('status_pickup')}</option>
                      <option value="return">{t('status_return')}</option>
                    </>
                  )}
                  {activeTab === 'dinein' && (
                    <option value="return">{t('status_return')}</option>
                  )}
                </select>

                {/* Payment Status Filter Dropdown */}
                <select
                  value={selectedPaymentFilter}
                  onChange={(e) => setSelectedPaymentFilter(e.target.value as any)}
                  className="px-2.5 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-semibold cursor-pointer text-xs"
                >
                  <option value="all">{t('all_payments')}</option>
                  <option value="paid">{t('paid_only')}</option>
                  <option value="unpaid">{t('unpaid_only')}</option>
                </select>

                {/* Driver Filter (Dedicated for Delivery Tab) */}
                {activeTab === 'delivery' && (
                  <select
                    value={selectedDriverId}
                    onChange={(e) => setSelectedDriverId(e.target.value ? Number(e.target.value) : '')}
                    className="px-2.5 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-semibold cursor-pointer text-xs"
                  >
                    <option value="">{t('all_drivers')}</option>
                    {deliveries.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                )}

                {/* Active items counter */}
                <span className="ms-auto text-[11px] font-bold text-slate-400">
                  {ordersList.length} {language === 'ar' ? 'طلب' : 'orders'}
                </span>
              </div>

              {loadingOrders ? (
                <div className="space-y-3">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="h-16 bg-slate-100 dark:bg-slate-800 rounded-2xl animate-pulse" />
                  ))}
                </div>
              ) : ordersList.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center text-slate-400">
                  <FiShoppingBag className="w-12 h-12 mb-3 opacity-40" />
                  <p className="text-sm font-bold">{t('no_orders_found')}</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {ordersList.map((order) => {
                    const isUpdating = updatingOrderId === order.id;
                    const orderPrice = Number(order.final_price || order.total || 0).toFixed(2);
                    const orderDate = new Date(order.created_at).toLocaleTimeString(
                      language === 'ar' ? 'ar-SA' : 'en-US',
                      { hour: '2-digit', minute: '2-digit' }
                    );

                    return (
                      <div
                        key={order.id}
                        className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 flex flex-col gap-3 transition-all hover:border-primary/40"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          {/* Order Number & Type */}
                          <div className="flex items-center gap-2.5">
                            <span className="font-mono font-black text-sm text-slate-900 dark:text-white bg-white dark:bg-slate-700 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-600">
                              #{order.id}
                            </span>
                            <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-md uppercase">
                              {order.module}
                            </span>
                            {getStatusBadge(order.status)}
                            {order.paid ? (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300">
                                مدفوع
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300">
                                غير مدفوع
                              </span>
                            )}
                          </div>

                          {/* Price & Time */}
                          <div className="flex items-center gap-3">
                            <span className="text-xs text-slate-400 flex items-center gap-1">
                              <FiClock className="w-3.5 h-3.5" />
                              {orderDate}
                            </span>
                            <span className="text-base font-black text-emerald-600 dark:text-emerald-400">
                              {orderPrice} {t('currency')}
                            </span>
                          </div>
                        </div>

                        {/* Customer / Table Info */}
                        <div className="flex flex-wrap items-center justify-between text-xs text-slate-600 dark:text-slate-300 pt-2 border-t border-slate-200/50 dark:border-slate-700/50">
                          <div className="flex items-center gap-3">
                            {order.name && (
                              <span>
                                <strong>{t('customer_label')}:</strong> {order.name}
                              </span>
                            )}
                            {order.phone && (
                              <span>
                                <strong>{t('phone_label')}:</strong> {order.phone}
                              </span>
                            )}
                            {order.delivery && (
                              <span className="text-indigo-600 dark:text-indigo-400 font-semibold">
                                <strong>{t('delivery_driver')}:</strong> {order.delivery.name}
                              </span>
                            )}
                          </div>

                          {/* Action buttons */}
                          <div className="flex items-center gap-2 ms-auto">
                            {onReprintReceipt && (
                              <button
                                type="button"
                                onClick={() => onReprintReceipt(order)}
                                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-700 hover:bg-slate-100 dark:hover:bg-slate-600 border border-slate-200 dark:border-slate-600 text-[11px] font-bold text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
                                title={t('reprint_receipt')}
                              >
                                <FiPrinter className="w-3.5 h-3.5" />
                                <span>{t('reprint_receipt')}</span>
                              </button>
                            )}

                            <button
                              type="button"
                              onClick={() => {
                                if (isUpdating) {
                                  setUpdatingOrderId(null);
                                } else {
                                  setUpdatingOrderId(order.id);
                                  const validOptions = getStatusOptionsForModule(order.module);
                                  const isCurrentValid = validOptions.some((opt) => opt.value === order.status);
                                  setSelectedNewStatus(isCurrentValid ? order.status : (validOptions[0]?.value || ''));
                                  setAssignDriverId(order.delivery_id || '');
                                }
                              }}
                              className="px-2.5 py-1.5 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 text-[11px] font-bold transition-colors cursor-pointer"
                            >
                              {t('order_status')}
                            </button>
                          </div>
                        </div>

                        {/* Quick Status Updater Dropdown */}
                        {isUpdating && (
                          <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-primary/30 flex flex-wrap items-center gap-3 animate-in fade-in">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                                {t('order_status')}:
                              </span>
                              <select
                                value={selectedNewStatus}
                                onChange={(e) => setSelectedNewStatus(e.target.value)}
                                className="px-2.5 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs font-semibold cursor-pointer"
                              >
                                {getStatusOptionsForModule(order.module).map((opt) => (
                                  <option key={opt.value} value={opt.value}>
                                    {opt.label}
                                  </option>
                                ))}
                              </select>
                            </div>

                            {order.module === 'delivery' && selectedNewStatus === 'out_of_delivery' && (
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                                  {t('delivery_driver')}: <span className="text-red-500">*</span>
                                </span>
                                <select
                                  value={assignDriverId}
                                  onChange={(e) => setAssignDriverId(e.target.value ? Number(e.target.value) : '')}
                                  className="px-2.5 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs font-semibold cursor-pointer"
                                >
                                  <option value="">{t('choose_delivery_driver')}</option>
                                  {deliveries.map((d) => (
                                    <option key={d.id} value={d.id}>
                                      {d.name}
                                    </option>
                                  ))}
                                </select>
                              </div>
                            )}

                            <button
                              type="button"
                              disabled={updateStatusMutation.isPending}
                              onClick={() => {
                                if (order.module === 'delivery' && selectedNewStatus === 'out_of_delivery' && !assignDriverId) {
                                  alert(t('driver_required_for_out_of_delivery'));
                                  return;
                                }
                                updateStatusMutation.mutate({
                                  orderId: order.id,
                                  status: selectedNewStatus,
                                  deliveryId: assignDriverId !== '' ? Number(assignDriverId) : undefined,
                                });
                              }}
                              className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-colors cursor-pointer disabled:opacity-50 ms-auto"
                            >
                              {updateStatusMutation.isPending ? t('please_wait') : t('confirm_and_reconcile')}
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ) : (
            /* ═══════════════════════════════════════════════════ */
            /* TAB 5: UNPAID DELIVERIES & CASH SETTLEMENT         */
            /* ═══════════════════════════════════════════════════ */
            <div>
              {/* Driver Filter Header */}
              <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
                <div className="flex items-center gap-2">
                  <FiTruck className="w-4 h-4 text-primary" />
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    {t('filter_by_driver')}:
                  </span>
                  <select
                    value={selectedDriverId}
                    onChange={(e) => setSelectedDriverId(e.target.value ? Number(e.target.value) : '')}
                    className="px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold cursor-pointer"
                  >
                    <option value="">{t('all_drivers')}</option>
                    {deliveries.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleSelectAllUnpaid(selectedUnpaidIds.length !== unpaidList.length)}
                    className="text-xs font-bold text-primary hover:underline cursor-pointer"
                  >
                    {selectedUnpaidIds.length === unpaidList.length ? 'إلغاء تحديد الكل' : 'تحديد الكل'}
                  </button>
                </div>
              </div>

              {loadingUnpaid ? (
                <div className="space-y-3">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="h-16 bg-slate-100 dark:bg-slate-800 rounded-2xl animate-pulse" />
                  ))}
                </div>
              ) : unpaidList.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center text-slate-400">
                  <FiCheckCircle className="w-12 h-12 mb-3 text-emerald-500 opacity-60" />
                  <p className="text-sm font-bold">{t('no_unpaid_deliveries')}</p>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {unpaidList.map((order) => {
                    const isChecked = selectedUnpaidIds.includes(order.id);
                    const amount = Number(order.final_price || order.total || 0).toFixed(2);

                    return (
                      <div
                        key={order.id}
                        onClick={() => handleToggleUnpaid(order.id)}
                        className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                          isChecked
                            ? 'bg-primary/10 border-primary shadow-xs'
                            : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => {}} // handled by parent div
                            className="w-4 h-4 rounded text-primary focus:ring-primary cursor-pointer"
                          />
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-mono font-bold text-xs text-slate-900 dark:text-white">
                                #{order.id}
                              </span>
                              {order.delivery ? (
                                <span className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400">
                                  {order.delivery.name}
                                </span>
                              ) : (
                                <span className="text-[10px] font-medium text-amber-500 bg-amber-500/10 px-1.5 py-0.5 rounded-md">
                                  {t('no_driver_assigned')}
                                </span>
                              )}
                              {getStatusBadge(order.status)}
                            </div>
                            <p className="text-[11px] text-slate-500 truncate max-w-[280px]">
                              {order.name ? `${order.name} - ` : ''}
                              {order.address || order.phone || ''}
                            </p>
                          </div>
                        </div>

                        <div className="text-end">
                          <span className="text-sm font-black text-emerald-600 dark:text-emerald-400 block">
                            {amount} {t('currency')}
                          </span>
                          <span className="text-[10px] text-slate-400">
                            {order.delivery?.name ? `نقدى مع المندوب (${order.delivery.name})` : 'نقدى توصيل'}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        {/* ── Footer for Settlement Tab ── */}
        {activeTab === 'settlement' && unpaidList.length > 0 && (
          <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/80 flex items-center justify-between gap-4 flex-wrap">
            <div>
              <span className="text-xs text-slate-500 block">
                {t('selected_orders_count')}: <strong className="text-slate-900 dark:text-white font-mono">{selectedUnpaidIds.length}</strong>
              </span>
              <span className="text-sm font-black text-emerald-600 dark:text-emerald-400">
                {t('total_to_collect')}: {totalUnpaidSelectedAmount.toFixed(2)} {t('currency')}
              </span>
            </div>

            <button
              type="button"
              disabled={selectedUnpaidIds.length === 0 || settleMutation.isPending}
              onClick={() => settleMutation.mutate(selectedUnpaidIds)}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-emerald-500/25 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {settleMutation.isPending ? (
                <span>{t('please_wait')}</span>
              ) : (
                <>
                  <FiDollarSign className="w-4 h-4" />
                  <span>{t('settle_payments')}</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrdersManagementModal;
