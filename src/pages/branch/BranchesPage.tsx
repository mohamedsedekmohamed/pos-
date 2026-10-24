import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FiLayers,
  FiBarChart2,
  FiLogIn,
  FiLogOut,
} from 'react-icons/fi';

import { BranchOperationsView } from '../../components/branch/BranchOperationsView';
import { BranchDashboardView } from '../../components/branch/BranchDashboardView';
import { useAuth } from '../../context/AuthContext';

export const BranchesPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();

  // Active top-level page tab: default to operations hub
  const [activePageTab, setActivePageTab] = useState<'operations' | 'dashboard'>('operations');

  return (
    <div
      className="min-h-screen bg-slate-50 dark:bg-[#09090b] text-slate-900 dark:text-white pb-20 selection:bg-primary selection:text-white"
      dir="rtl"
    >
      {/* Top Banner Navigation */}
      <div className="border-b border-slate-200 dark:border-white/10 bg-white/80 dark:bg-[#0d0d12]/80 backdrop-blur-xl sticky top-0 z-30 px-4 sm:px-8 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-primary animate-pulse" />
              <h1 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">
                نظام إدارة الفرع (Branch Operations Hub)
              </h1>
            </div>
            <p className="text-[11px] text-slate-400 dark:text-neutral-400">
              إدارة خدمات وتشغيل الفرع وإحصائيات المبيعات
            </p>
          </div>
        </div>

        {/* Top Actions: Auth Status */}
        <div className="flex items-center gap-2">
          {isAuthenticated && user ? (
            <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="font-bold">
                {typeof user.name === 'object' ? user.name?.ar || user.name?.en : user.name || 'حساب الفرع'}
              </span>
              <button
                type="button"
                onClick={logout}
                className="text-neutral-400 hover:text-red-400 mr-1 p-0.5 cursor-pointer"
                title="تسجيل الخروج من حساب الفرع"
              >
                <FiLogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => navigate('/branch/login')}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-black shadow-md shadow-emerald-500/20 transition-all cursor-pointer"
            >
              <FiLogIn className="w-3.5 h-3.5" />
              <span>تسجيل دخول الفرع</span>
            </button>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-8 space-y-8">
        {/* Navigation Tabs (Operations vs Dashboard Analytics) */}
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/10 pb-4 overflow-x-auto scrollbar-none gap-4">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setActivePageTab('operations')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-black transition-all cursor-pointer whitespace-nowrap ${
                activePageTab === 'operations'
                  ? 'bg-primary text-white shadow-lg shadow-primary/25 scale-[1.02]'
                  : 'text-slate-600 dark:text-neutral-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/[0.05]'
              }`}
            >
              <FiLayers className="w-4 h-4" />
              <span>خدمات الفرع (Operations Hub)</span>
            </button>

            <button
              type="button"
              onClick={() => setActivePageTab('dashboard')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-black transition-all cursor-pointer whitespace-nowrap ${
                activePageTab === 'dashboard'
                  ? 'bg-primary text-white shadow-lg shadow-primary/25 scale-[1.02]'
                  : 'text-slate-600 dark:text-neutral-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/[0.05]'
              }`}
            >
              <FiBarChart2 className="w-4 h-4" />
              <span>إحصائيات المبيعات (Analytics)</span>
            </button>
          </div>
        </div>

        {/* Tab 1: Branch Operations Hub */}
        {activePageTab === 'operations' && <BranchOperationsView />}

        {/* Tab 2: Dashboard Analytics */}
        {activePageTab === 'dashboard' && <BranchDashboardView />}
      </div>
    </div>
  );
};

export default BranchesPage;
