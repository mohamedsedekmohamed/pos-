import React, { useState } from 'react';
import {
  FiMonitor,
  FiCoffee,
  FiTruck,
  FiDollarSign,
  FiClock,
  FiRefreshCw,
  FiGrid,
} from 'react-icons/fi';
import { useQuery } from '@tanstack/react-query';
import { branchApi } from '../../services/branchService';

export const BranchOperationsView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<
    'cashiers' | 'halls' | 'kitchens' | 'safes' | 'deliveries' | 'shifts' | 'manufacturing'
  >('cashiers');

  // Load Cashiers
  const {
    data: cashiersData,
    isLoading: loadingCashiers,
    refetch: refetchCashiers,
  } = useQuery({
    queryKey: ['branch-cashiers-list'],
    queryFn: () => branchApi.cashiers.list(),
  });

  // Load Halls
  const {
    data: hallsData,
    isLoading: loadingHalls,
    refetch: refetchHalls,
  } = useQuery({
    queryKey: ['branch-halls-list'],
    queryFn: () => branchApi.halls.list(),
  });

  // Load Kitchens
  const {
    data: kitchensData,
    isLoading: loadingKitchens,
    refetch: refetchKitchens,
  } = useQuery({
    queryKey: ['branch-kitchens-list'],
    queryFn: () => branchApi.kitchens.list(),
  });

  // Load Financial Accounts
  const {
    data: accountsData,
    isLoading: loadingAccounts,
    refetch: refetchAccounts,
  } = useQuery({
    queryKey: ['branch-financial-accounts-list'],
    queryFn: () => branchApi.financialAccounts.list(),
  });

  // Load Deliveries
  const {
    data: deliveriesData,
    isLoading: loadingDeliveries,
    refetch: refetchDeliveries,
  } = useQuery({
    queryKey: ['branch-deliveries-list'],
    queryFn: () => branchApi.deliveries.list(),
  });

  // Load Shifts
  const {
    data: shiftsData,
    isLoading: loadingShifts,
    refetch: refetchShifts,
  } = useQuery({
    queryKey: ['branch-shifts-list'],
    queryFn: () => branchApi.shifts.list(),
  });

  const cashiers = cashiersData?.data || [];
  const halls = hallsData?.data || [];
  const kitchens = kitchensData?.data || [];
  const accounts = accountsData?.data || [];
  const deliveries = deliveriesData?.data || [];
  const shifts = shiftsData?.data || [];

  return (
    <div className="space-y-6" dir="rtl">
      {/* Sub-navigation tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
        <button
          type="button"
          onClick={() => setActiveTab('cashiers')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'cashiers'
              ? 'bg-primary text-white shadow-lg shadow-primary/25'
              : 'bg-white dark:bg-white/[0.04] border border-slate-200 dark:border-white/10 text-slate-700 dark:text-neutral-300 hover:bg-slate-100 dark:hover:bg-white/[0.08]'
          }`}
        >
          <FiMonitor className="w-4 h-4" />
          <span>نقاط الكاشير والموظفون</span>
          <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-white/20">{cashiers.length}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('halls')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'halls'
              ? 'bg-primary text-white shadow-lg shadow-primary/25'
              : 'bg-white dark:bg-white/[0.04] border border-slate-200 dark:border-white/10 text-slate-700 dark:text-neutral-300 hover:bg-slate-100 dark:hover:bg-white/[0.08]'
          }`}
        >
          <FiCoffee className="w-4 h-4" />
          <span>الصالات والطاولات</span>
          <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-white/20">{halls.length}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('kitchens')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'kitchens'
              ? 'bg-primary text-white shadow-lg shadow-primary/25'
              : 'bg-white dark:bg-white/[0.04] border border-slate-200 dark:border-white/10 text-slate-700 dark:text-neutral-300 hover:bg-slate-100 dark:hover:bg-white/[0.08]'
          }`}
        >
          <FiGrid className="w-4 h-4" />
          <span>المطابخ والشاشات</span>
          <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-white/20">{kitchens.length}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('safes')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'safes'
              ? 'bg-primary text-white shadow-lg shadow-primary/25'
              : 'bg-white dark:bg-white/[0.04] border border-slate-200 dark:border-white/10 text-slate-700 dark:text-neutral-300 hover:bg-slate-100 dark:hover:bg-white/[0.08]'
          }`}
        >
          <FiDollarSign className="w-4 h-4" />
          <span>الخزن والحسابات</span>
          <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-white/20">{accounts.length}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('deliveries')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'deliveries'
              ? 'bg-primary text-white shadow-lg shadow-primary/25'
              : 'bg-white dark:bg-white/[0.04] border border-slate-200 dark:border-white/10 text-slate-700 dark:text-neutral-300 hover:bg-slate-100 dark:hover:bg-white/[0.08]'
          }`}
        >
          <FiTruck className="w-4 h-4" />
          <span>طيارو التوصيل</span>
          <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-white/20">{deliveries.length}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('shifts')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'shifts'
              ? 'bg-primary text-white shadow-lg shadow-primary/25'
              : 'bg-white dark:bg-white/[0.04] border border-slate-200 dark:border-white/10 text-slate-700 dark:text-neutral-300 hover:bg-slate-100 dark:hover:bg-white/[0.08]'
          }`}
        >
          <FiClock className="w-4 h-4" />
          <span>الورديات والشيفتات</span>
          <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-white/20">{shifts.length}</span>
        </button>
      </div>

      {/* Content Area Based on Active Tab */}
      {activeTab === 'cashiers' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-base font-bold text-slate-900 dark:text-white">
              نقاط الكاشير النشطة في الفرع (/api/branch/cashiers)
            </h4>
            <button
              type="button"
              onClick={() => refetchCashiers()}
              className="inline-flex items-center gap-1.5 text-xs text-primary hover:underline cursor-pointer"
            >
              <FiRefreshCw className={`w-3.5 h-3.5 ${loadingCashiers ? 'animate-spin' : ''}`} />
              <span>تحديث القائمة</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {cashiers.map((c) => (
              <div
                key={c.id}
                className="p-5 rounded-2xl bg-white dark:bg-[#121216] border border-slate-200 dark:border-white/10 flex items-center justify-between"
              >
                <div>
                  <h5 className="font-bold text-slate-800 dark:text-white text-sm mb-1">{c.name}</h5>
                  <p className="text-xs text-slate-400 dark:text-neutral-400">
                    كاشير ID: #{c.id} • مسؤول: {c.cashier_man?.name || 'غير معين'}
                  </p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                  <FiMonitor className="w-5 h-5" />
                </div>
              </div>
            ))}
            {cashiers.length === 0 && (
              <div className="col-span-full p-8 text-center bg-white dark:bg-[#121216] rounded-2xl border border-slate-200 dark:border-white/10 text-slate-400 dark:text-neutral-500 text-xs">
                لم يتم تسجيل أجهزة كاشير بعد في هذا الفرع.
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'halls' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-base font-bold text-slate-900 dark:text-white">
              صالات الفرع ومناطق الجلوس (/api/branch/halls)
            </h4>
            <button
              type="button"
              onClick={() => refetchHalls()}
              className="inline-flex items-center gap-1.5 text-xs text-primary hover:underline cursor-pointer"
            >
              <FiRefreshCw className={`w-3.5 h-3.5 ${loadingHalls ? 'animate-spin' : ''}`} />
              <span>تحديث القائمة</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {halls.map((h) => {
              const nameAr = typeof h.name === 'object' ? h.name.ar : h.name;
              return (
                <div
                  key={h.id}
                  className="p-5 rounded-2xl bg-white dark:bg-[#121216] border border-slate-200 dark:border-white/10 flex items-center justify-between"
                >
                  <div>
                    <h5 className="font-bold text-slate-800 dark:text-white text-sm mb-1">{nameAr}</h5>
                    <span className="text-[11px] px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-500 font-bold">
                      {h.status ? 'نشطة' : 'معطلة'}
                    </span>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500">
                    <FiCoffee className="w-5 h-5" />
                  </div>
                </div>
              );
            })}
            {halls.length === 0 && (
              <div className="col-span-full p-8 text-center bg-white dark:bg-[#121216] rounded-2xl border border-slate-200 dark:border-white/10 text-slate-400 dark:text-neutral-500 text-xs">
                لا توجد صالات مسجلة للفرع.
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'kitchens' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-base font-bold text-slate-900 dark:text-white">
              مطابخ الفرع وشاشات التحضير KDS (/api/branch/kitchens)
            </h4>
            <button
              type="button"
              onClick={() => refetchKitchens()}
              className="inline-flex items-center gap-1.5 text-xs text-primary hover:underline cursor-pointer"
            >
              <FiRefreshCw className={`w-3.5 h-3.5 ${loadingKitchens ? 'animate-spin' : ''}`} />
              <span>تحديث القائمة</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {kitchens.map((k) => {
              const nameAr = typeof k.name === 'object' ? k.name.ar : k.name;
              return (
                <div
                  key={k.id}
                  className="p-5 rounded-2xl bg-white dark:bg-[#121216] border border-slate-200 dark:border-white/10 flex items-center justify-between"
                >
                  <div>
                    <h5 className="font-bold text-slate-800 dark:text-white text-sm mb-1">{nameAr}</h5>
                    <p className="text-xs text-slate-400 dark:text-neutral-400 font-mono">
                      مستخدم: {k.user_name}
                    </p>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-500">
                    <FiGrid className="w-5 h-5" />
                  </div>
                </div>
              );
            })}
            {kitchens.length === 0 && (
              <div className="col-span-full p-8 text-center bg-white dark:bg-[#121216] rounded-2xl border border-slate-200 dark:border-white/10 text-slate-400 dark:text-neutral-500 text-xs">
                لا توجد مطابخ مسجلة للفرع.
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'safes' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-base font-bold text-slate-900 dark:text-white">
              الخزن والحسابات المالية (/api/branch/financial-accounts)
            </h4>
            <button
              type="button"
              onClick={() => refetchAccounts()}
              className="inline-flex items-center gap-1.5 text-xs text-primary hover:underline cursor-pointer"
            >
              <FiRefreshCw className={`w-3.5 h-3.5 ${loadingAccounts ? 'animate-spin' : ''}`} />
              <span>تحديث القائمة</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {accounts.map((a) => {
              const nameAr = typeof a.name === 'object' ? a.name.ar : a.name;
              return (
                <div
                  key={a.id}
                  className="p-5 rounded-2xl bg-white dark:bg-[#121216] border border-slate-200 dark:border-white/10 flex items-center justify-between"
                >
                  <div>
                    <h5 className="font-bold text-slate-800 dark:text-white text-sm mb-1">{nameAr}</h5>
                    <p className="text-sm font-black text-emerald-500 font-mono">
                      {a.balance?.toLocaleString()} ج.م
                    </p>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500">
                    <FiDollarSign className="w-5 h-5" />
                  </div>
                </div>
              );
            })}
            {accounts.length === 0 && (
              <div className="col-span-full p-8 text-center bg-white dark:bg-[#121216] rounded-2xl border border-slate-200 dark:border-white/10 text-slate-400 dark:text-neutral-500 text-xs">
                لا توجد خزن مسجلة للفرع.
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'deliveries' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-base font-bold text-slate-900 dark:text-white">
              طيارو التوصيل المسجلون بالفرع (/api/branch/deliveries)
            </h4>
            <button
              type="button"
              onClick={() => refetchDeliveries()}
              className="inline-flex items-center gap-1.5 text-xs text-primary hover:underline cursor-pointer"
            >
              <FiRefreshCw className={`w-3.5 h-3.5 ${loadingDeliveries ? 'animate-spin' : ''}`} />
              <span>تحديث القائمة</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {deliveries.map((d) => (
              <div
                key={d.id}
                className="p-5 rounded-2xl bg-white dark:bg-[#121216] border border-slate-200 dark:border-white/10 flex items-center justify-between"
              >
                <div>
                  <h5 className="font-bold text-slate-800 dark:text-white text-sm mb-1">{d.name}</h5>
                  <p className="text-xs text-slate-400 dark:text-neutral-400 font-mono" dir="ltr">
                    {d.phone}
                  </p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-500">
                  <FiTruck className="w-5 h-5" />
                </div>
              </div>
            ))}
            {deliveries.length === 0 && (
              <div className="col-span-full p-8 text-center bg-white dark:bg-[#121216] rounded-2xl border border-slate-200 dark:border-white/10 text-slate-400 dark:text-neutral-500 text-xs">
                لم يتم تسجيل طياري توصيل بالفرع حتى الآن.
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'shifts' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-base font-bold text-slate-900 dark:text-white">
              ورديات وشيفتات العمل للفرع (/api/branch/shifts)
            </h4>
            <button
              type="button"
              onClick={() => refetchShifts()}
              className="inline-flex items-center gap-1.5 text-xs text-primary hover:underline cursor-pointer"
            >
              <FiRefreshCw className={`w-3.5 h-3.5 ${loadingShifts ? 'animate-spin' : ''}`} />
              <span>تحديث القائمة</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {shifts.map((s) => {
              const nameAr = typeof s.name === 'object' ? s.name.ar : s.name;
              return (
                <div
                  key={s.id}
                  className="p-5 rounded-2xl bg-white dark:bg-[#121216] border border-slate-200 dark:border-white/10 flex items-center justify-between"
                >
                  <div>
                    <h5 className="font-bold text-slate-800 dark:text-white text-sm mb-1">{nameAr}</h5>
                    <p className="text-xs text-slate-400 dark:text-neutral-400 font-mono" dir="ltr">
                      {s.start_time} &rarr; {s.end_time} {s.is_tomorrow ? '(اليوم التالي)' : ''}
                    </p>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-500">
                    <FiClock className="w-5 h-5" />
                  </div>
                </div>
              );
            })}
            {shifts.length === 0 && (
              <div className="col-span-full p-8 text-center bg-white dark:bg-[#121216] rounded-2xl border border-slate-200 dark:border-white/10 text-slate-400 dark:text-neutral-500 text-xs">
                لا توجد شيفتات مسجلة للفرع.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
