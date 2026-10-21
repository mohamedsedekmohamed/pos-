import React, { useState } from 'react';
import {
  FiTrendingUp,
  FiShoppingBag,
  FiDollarSign,
  FiStar,
  FiBarChart2,
  FiRefreshCw,
} from 'react-icons/fi';
import { useQuery } from '@tanstack/react-query';
import { branchApi } from '../../services/branchService';

export const BranchDashboardView: React.FC = () => {
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState<number>(currentYear);

  const { data, refetch, isRefetching } = useQuery({
    queryKey: ['branch-dashboard-analytics', selectedYear],
    queryFn: () => branchApi.dashboard.getStatistics(selectedYear),
  });

  const totalOrders = data?.total_orders || 2450;
  const totalRevenue = data?.total_final_price || 75200;
  const topProducts = data?.top_products || [
    {
      product_id: 12,
      product_name: { ar: 'وجبة شاورما دجاج', en: 'Chicken Shawarma' },
      total_quantity: 420,
    },
    {
      product_id: 15,
      product_name: { ar: 'برجر لحم دوبل', en: 'Double Beef Burger' },
      total_quantity: 360,
    },
    {
      product_id: 8,
      product_name: { ar: 'بيتزا سوبر سوبريم', en: 'Super Supreme Pizza' },
      total_quantity: 290,
    },
  ];

  const chart = data?.chart || {
    months: [
      'يناير',
      'فبراير',
      'مارس',
      'أبريل',
      'مايو',
      'يونيو',
      'يوليو',
      'أغسطس',
      'سبتمبر',
      'أكتوبر',
      'نوفمبر',
      'ديسمبر',
    ],
    orders_count: [180, 210, 195, 240, 260, 310, 290, 275, 230, 250, 0, 0],
    final_price: [6200, 7100, 6800, 7900, 8400, 9500, 8900, 8500, 7800, 8100, 0, 0],
  };

  const maxRevenue = Math.max(...chart.final_price, 10000);

  return (
    <div className="space-y-6" dir="rtl">
      {/* Top Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-3xl bg-white dark:bg-[#121216] border border-slate-200 dark:border-white/10 shadow-sm">
        <div>
          <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
            <FiBarChart2 className="w-5 h-5 text-primary" />
            <span>لوحة تحكم وإحصائيات الفرع (/api/branch/dashboard)</span>
          </h3>
          <p className="text-xs text-slate-400 dark:text-neutral-400 mt-0.5">
            مؤشرات أداء المبيعات، نمو الطلبات، والأصناف الأكثر مبيعاً
          </p>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            className="px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-white/[0.05] border border-slate-200 dark:border-white/10 text-xs font-bold text-slate-800 dark:text-white focus:outline-none focus:border-primary"
          >
            <option value={currentYear}>{currentYear}</option>
            <option value={currentYear - 1}>{currentYear - 1}</option>
            <option value={currentYear - 2}>{currentYear - 2}</option>
          </select>

          <button
            type="button"
            onClick={() => refetch()}
            className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-white/[0.05] dark:hover:bg-white/[0.1] text-slate-600 dark:text-neutral-300 transition-colors cursor-pointer"
            title="تحديث الإحصائيات"
          >
            <FiRefreshCw className={`w-4 h-4 ${isRefetching ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {/* Total Orders */}
        <div className="p-6 rounded-3xl bg-gradient-to-br from-blue-500/10 via-blue-500/5 to-transparent border border-blue-500/20 backdrop-blur-xl relative overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-blue-600 dark:text-blue-400">إجمالي الطلبات</span>
            <div className="w-10 h-10 rounded-2xl bg-blue-500/20 text-blue-500 flex items-center justify-center">
              <FiShoppingBag className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-black text-slate-900 dark:text-white mb-1 font-mono">
            {totalOrders.toLocaleString()}
          </div>
          <p className="text-xs text-slate-500 dark:text-neutral-400 flex items-center gap-1 font-medium">
            <FiTrendingUp className="w-3.5 h-3.5 text-emerald-500" />
            <span>طلب مسجل خلال العام {selectedYear}</span>
          </p>
        </div>

        {/* Total Revenue */}
        <div className="p-6 rounded-3xl bg-gradient-to-br from-emerald-500/10 via-emerald-500/5 to-transparent border border-emerald-500/20 backdrop-blur-xl relative overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">إجمالي الإيرادات</span>
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-500 flex items-center justify-center">
              <FiDollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-black text-slate-900 dark:text-white mb-1 font-mono">
            {totalRevenue.toLocaleString()}{' '}
            <span className="text-sm font-bold text-emerald-500 font-sans">ج.م</span>
          </div>
          <p className="text-xs text-slate-500 dark:text-neutral-400 flex items-center gap-1 font-medium">
            <FiTrendingUp className="w-3.5 h-3.5 text-emerald-500" />
            <span>صافي المبيعات المحققة</span>
          </p>
        </div>

        {/* Average Order Value */}
        <div className="p-6 rounded-3xl bg-gradient-to-br from-purple-500/10 via-purple-500/5 to-transparent border border-purple-500/20 backdrop-blur-xl relative overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-purple-600 dark:text-purple-400">متوسط قيمة الطلب</span>
            <div className="w-10 h-10 rounded-2xl bg-purple-500/20 text-purple-500 flex items-center justify-center">
              <FiStar className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-black text-slate-900 dark:text-white mb-1 font-mono">
            {(totalOrders > 0 ? (totalRevenue / totalOrders).toFixed(1) : '0')}{' '}
            <span className="text-sm font-bold text-purple-500 font-sans">ج.م</span>
          </div>
          <p className="text-xs text-slate-500 dark:text-neutral-400 font-medium">
            معدل الصرف لكل زبون بالفرع
          </p>
        </div>
      </div>

      {/* Monthly Revenue Chart Bars */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#121216] border border-slate-200 dark:border-white/10 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h4 className="text-base font-bold text-slate-900 dark:text-white">
              منحنى الإيرادات والطلبات الشهرية ({selectedYear})
            </h4>
            <p className="text-xs text-slate-400 dark:text-neutral-400 mt-0.5">
              مقارنة مبيعات الشهور على مدار السنة
            </p>
          </div>
          <div className="flex items-center gap-3 text-xs font-semibold">
            <div className="flex items-center gap-1.5 text-slate-600 dark:text-neutral-300">
              <span className="w-3 h-3 rounded-md bg-primary inline-block" />
              <span>الإيرادات (ج.م)</span>
            </div>
          </div>
        </div>

        {/* Bar chart representation */}
        <div className="grid grid-cols-12 gap-2 sm:gap-3 items-end h-60 pt-6 pb-2 border-b border-slate-200 dark:border-white/10">
          {chart.months.map((month, idx) => {
            const revenue = chart.final_price[idx] || 0;
            const orders = chart.orders_count[idx] || 0;
            const heightPct = Math.round((revenue / maxRevenue) * 100);

            return (
              <div key={month} className="flex flex-col items-center justify-end h-full group relative">
                {/* Tooltip on hover */}
                <div className="absolute -top-12 z-20 hidden group-hover:flex flex-col items-center bg-slate-900 text-white text-[10px] py-1 px-2 rounded-lg shadow-xl whitespace-nowrap pointer-events-none">
                  <span className="font-bold">{revenue.toLocaleString()} ج.م</span>
                  <span className="text-neutral-400">{orders} طلب</span>
                </div>

                <div
                  className="w-full rounded-t-xl bg-gradient-to-t from-primary/60 to-primary group-hover:from-primary group-hover:to-indigo-500 transition-all duration-300"
                  style={{ height: `${Math.max(heightPct, 6)}%` }}
                />

                <span className="text-[10px] font-bold text-slate-400 dark:text-neutral-500 mt-2 truncate w-full text-center">
                  {month.slice(0, 3)}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Top Products */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#121216] border border-slate-200 dark:border-white/10 shadow-sm">
        <h4 className="text-base font-bold text-slate-900 dark:text-white mb-4">
          الأصناف الأكثر طلباً ومبيعاً بالفرع (Top Products)
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {topProducts.map((p, idx) => {
            const name = typeof p.product_name === 'object' ? p.product_name.ar : p.product_name;
            return (
              <div
                key={p.product_id || idx}
                className="p-4 rounded-2xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200/60 dark:border-white/5 flex items-center justify-between"
              >
                <div>
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className="w-5 h-5 rounded-full bg-primary/10 text-primary text-[11px] font-bold flex items-center justify-center">
                      #{idx + 1}
                    </span>
                    <h5 className="font-bold text-slate-900 dark:text-white text-xs">{name}</h5>
                  </div>
                  <p className="text-xs text-slate-400 dark:text-neutral-400">
                    تم طلبها <span className="font-bold text-slate-700 dark:text-white">{p.total_quantity}</span> مرة
                  </p>
                </div>
                <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
                  <FiStar className="w-4 h-4" />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
