import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FiMapPin,
  FiPlus,
  FiSearch,
  FiGrid,
  FiList,
  FiRefreshCw,
  FiCheckCircle,
  FiXCircle,
  FiArrowRight,
  FiLayers,
  FiBarChart2,
  FiHome,
  FiLogIn,
  FiLogOut,
} from 'react-icons/fi';

import { BranchCard } from '../../components/branch/BranchCard';
import { BranchFormModal } from '../../components/branch/BranchFormModal';
import { BranchDetailsModal } from '../../components/branch/BranchDetailsModal';
import { BranchDeleteModal } from '../../components/branch/BranchDeleteModal';
import { BranchOperationsView } from '../../components/branch/BranchOperationsView';
import { BranchDashboardView } from '../../components/branch/BranchDashboardView';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';
import type { AdminBranch, CreateBranchPayload, UpdateBranchPayload } from '../../types/branch';

const initialDemoBranches: AdminBranch[] = [
  {
    id: 1,
    name: { ar: 'فرع المعادي الرئيسي', en: 'Maadi Main Branch' },
    user_name: 'branch_maadi',
    address: 'شارع النصر، المعادي، القاهرة',
    location: [{ lat: 29.9602, lng: 31.2569 }],
    watts: '+201000000001',
    facebook: 'https://facebook.com/branch-maadi',
    status: true,
    role: 'branch',
    created_at: '2026-10-12T01:58:00+03:00',
    updated_at: '2026-10-12T01:58:00+03:00',
  },
  {
    id: 2,
    name: { ar: 'فرع التجمع الخامس', en: 'Tagamoa 5th Settlement' },
    user_name: 'branch_tagamoa',
    address: 'شارع التسعين الشمالي، التجمع الخامس',
    location: [{ lat: 30.0298, lng: 31.4721 }],
    watts: '+201012345678',
    facebook: 'https://facebook.com/branch-tagamoa',
    status: true,
    role: 'branch',
    created_at: '2026-10-15T02:00:00+03:00',
    updated_at: '2026-10-15T02:00:00+03:00',
  },
  {
    id: 3,
    name: { ar: 'فرع الشيخ زايد', en: 'Sheikh Zayed Branch' },
    user_name: 'branch_zayed',
    address: 'وصلة دهشور، الشيخ زايد، الجيزة',
    location: [{ lat: 30.0524, lng: 30.9856 }],
    watts: '+201099887766',
    facebook: 'https://facebook.com/branch-zayed',
    status: false,
    role: 'branch',
    created_at: '2026-10-18T10:00:00+03:00',
    updated_at: '2026-10-18T10:00:00+03:00',
  },
];

export const BranchesPage: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { user, isAuthenticated, logout } = useAuth();

  // Active top-level page tab
  const [activePageTab, setActivePageTab] = useState<'crud' | 'dashboard' | 'operations'>(
    'crud'
  );

  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  // Modal states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [branchToEdit, setBranchToEdit] = useState<AdminBranch | null>(null);

  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [selectedBranch, setSelectedBranch] = useState<AdminBranch | null>(null);

  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [branchToDelete, setBranchToDelete] = useState<AdminBranch | null>(null);

  // Branches list state
  const [displayBranches, setDisplayBranches] = useState<AdminBranch[]>(initialDemoBranches);
  const [isLoading] = useState(false);
  const [isRefetching, setIsRefetching] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const refetch = () => {
    setIsRefetching(true);
    setTimeout(() => {
      setIsRefetching(false);
      showToast('تم تحديث قائمة الفروع', 'info');
    }, 400);
  };

  // ── Filtered Branches ──
  const filteredBranches = useMemo(() => {
    return displayBranches.filter((b) => {
      // Status filter
      if (statusFilter === 'active' && !b.status) return false;
      if (statusFilter === 'inactive' && b.status) return false;

      // Search filter
      if (!searchTerm.trim()) return true;
      const term = searchTerm.toLowerCase();

      const nameAr = (b.name?.ar || '').toLowerCase();
      const nameEn = (b.name?.en || '').toLowerCase();
      const userName = b.user_name?.toLowerCase() || '';
      const address = b.address?.toLowerCase() || '';
      const watts = b.watts?.toLowerCase() || '';

      return (
        nameAr.includes(term) ||
        nameEn.includes(term) ||
        userName.includes(term) ||
        address.includes(term) ||
        watts.includes(term)
      );
    });
  }, [displayBranches, statusFilter, searchTerm]);

  // Stats calculation
  const totalCount = displayBranches.length;
  const activeCount = displayBranches.filter((b) => b.status).length;
  const inactiveCount = totalCount - activeCount;

  const handleFormSubmit = async (payload: CreateBranchPayload | UpdateBranchPayload) => {
    setIsSubmitting(true);
    try {
      if (branchToEdit) {
        setDisplayBranches((prev) =>
          prev.map((b) =>
            b.id === branchToEdit.id
              ? ({
                  ...b,
                  ...payload,
                  updated_at: new Date().toISOString(),
                } as AdminBranch)
              : b
          )
        );
        showToast('تم تعديل بيانات الفرع بنجاح', 'success');
        setIsFormOpen(false);
        setBranchToEdit(null);
      } else {
        const createPayload = payload as CreateBranchPayload;
        const newId = displayBranches.length > 0 ? Math.max(...displayBranches.map((b) => b.id)) + 1 : 1;
        const newBranch: AdminBranch = {
          id: newId,
          name: createPayload.name,
          user_name: createPayload.user_name,
          address: createPayload.address,
          location: createPayload.location,
          watts: createPayload.watts,
          facebook: createPayload.facebook,
          status: createPayload.status ?? true,
          role: 'branch',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        setDisplayBranches((prev) => [newBranch, ...prev]);
        showToast('تمت إضافة الفرع الجديد بنجاح', 'success');
        setIsFormOpen(false);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteConfirm = async (branch: AdminBranch) => {
    setIsDeleting(true);
    try {
      setDisplayBranches((prev) => prev.filter((b) => b.id !== branch.id));
      showToast('تم حذف الفرع بنجاح', 'success');
      setIsDeleteOpen(false);
      setBranchToDelete(null);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#09090b] text-slate-900 dark:text-white pb-20 selection:bg-primary selection:text-white" dir="rtl">
      {/* Top Banner Navigation */}
      <div className="border-b border-slate-200 dark:border-white/10 bg-white/80 dark:bg-[#0d0d12]/80 backdrop-blur-xl sticky top-0 z-30 px-4 sm:px-8 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate('/dashboard')}
            className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-white/[0.05] dark:hover:bg-white/[0.1] border border-slate-200 dark:border-white/10 flex items-center justify-center text-slate-600 dark:text-neutral-300 transition-colors cursor-pointer"
            title="العودة لنقطة البيع (Dashboard)"
          >
            <FiArrowRight className="w-4 h-4" />
          </button>

          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-primary animate-pulse" />
              <h1 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">
                الفروع (Branches)
              </h1>
            </div>
            <p className="text-[11px] text-slate-400 dark:text-neutral-400">
              إدارة خدمات الفرع والعمليات التشغيلية
            </p>
          </div>
        </div>

        {/* Top Actions */}
        <div className="flex items-center gap-2">
          {isAuthenticated && user ? (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-400">
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
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-black shadow-md shadow-emerald-500/20 transition-all cursor-pointer"
            >
              <FiLogIn className="w-3.5 h-3.5" />
              <span>تسجيل دخول الفرع</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => navigate('/')}
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-white/[0.05] dark:hover:bg-white/[0.1] border border-slate-200 dark:border-white/10 text-xs font-bold text-slate-700 dark:text-neutral-300 transition-colors cursor-pointer"
          >
            <FiHome className="w-3.5 h-3.5" />
            <span>الرئيسية</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setBranchToEdit(null);
              setIsFormOpen(true);
            }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-primary to-indigo-600 hover:from-primary-dark hover:to-indigo-700 text-white text-xs font-bold shadow-lg shadow-primary/25 transition-all cursor-pointer"
          >
            <FiPlus className="w-4 h-4" />
            <span>إضافة فرع جديد</span>
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-8 space-y-8">
        {/* Navigation Tabs (CRUD vs Dashboard vs Operations vs API Docs) */}
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/10 pb-4 overflow-x-auto scrollbar-none gap-4">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setActivePageTab('crud')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-black transition-all cursor-pointer whitespace-nowrap ${
                activePageTab === 'crud'
                  ? 'bg-primary text-white shadow-lg shadow-primary/25 scale-[1.02]'
                  : 'text-slate-600 dark:text-neutral-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/[0.05]'
              }`}
            >
              <FiMapPin className="w-4 h-4" />
              <span>الفروع (Branches)</span>
              <span className="px-2 py-0.5 rounded-full text-xs bg-white/20">{totalCount}</span>
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
          </div>
        </div>

        {/* Tab 1: Admin Branches CRUD */}
        {activePageTab === 'crud' && (
          <div className="space-y-6">
            {/* Stats Overview */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-5 rounded-3xl bg-white dark:bg-[#121216] border border-slate-200 dark:border-white/10 shadow-sm flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-slate-400 dark:text-neutral-400">إجمالي الفروع المسجلة</p>
                  <h3 className="text-2xl font-black text-slate-900 dark:text-white font-mono mt-0.5">
                    {totalCount}
                  </h3>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
                  <FiMapPin className="w-6 h-6" />
                </div>
              </div>

              <div className="p-5 rounded-3xl bg-white dark:bg-[#121216] border border-slate-200 dark:border-white/10 shadow-sm flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-slate-400 dark:text-neutral-400">فروع قيد العمل (نشطة)</p>
                  <h3 className="text-2xl font-black text-emerald-500 font-mono mt-0.5">
                    {activeCount}
                  </h3>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                  <FiCheckCircle className="w-6 h-6" />
                </div>
              </div>

              <div className="p-5 rounded-3xl bg-white dark:bg-[#121216] border border-slate-200 dark:border-white/10 shadow-sm flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-slate-400 dark:text-neutral-400">فروع معطلة مؤقتاً</p>
                  <h3 className="text-2xl font-black text-rose-500 font-mono mt-0.5">
                    {inactiveCount}
                  </h3>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-500 flex items-center justify-center">
                  <FiXCircle className="w-6 h-6" />
                </div>
              </div>
            </div>

            {/* Filter and Control Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-3xl bg-white dark:bg-[#121216] border border-slate-200 dark:border-white/10 shadow-sm">
              {/* Search Bar */}
              <div className="relative w-full sm:max-w-md">
                <FiSearch className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-neutral-500" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="بحث باسم الفرع، اسم المستخدم، العنوان، أو الهاتف..."
                  className="w-full pr-11 pl-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white text-xs sm:text-sm focus:outline-none focus:border-primary transition-all placeholder:text-slate-400 dark:placeholder:text-neutral-500"
                />
              </div>

              {/* Status Filter and View Mode */}
              <div className="flex items-center gap-2.5 w-full sm:w-auto justify-between sm:justify-end">
                <div className="flex items-center bg-slate-100 dark:bg-white/[0.04] p-1 rounded-2xl border border-slate-200 dark:border-white/10 text-xs">
                  <button
                    type="button"
                    onClick={() => setStatusFilter('all')}
                    className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                      statusFilter === 'all'
                        ? 'bg-white dark:bg-white/10 text-slate-900 dark:text-white shadow-sm'
                        : 'text-slate-500 dark:text-neutral-400'
                    }`}
                  >
                    الكل
                  </button>
                  <button
                    type="button"
                    onClick={() => setStatusFilter('active')}
                    className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                      statusFilter === 'active'
                        ? 'bg-emerald-500 text-white shadow-sm'
                        : 'text-slate-500 dark:text-neutral-400'
                    }`}
                  >
                    النشطة
                  </button>
                  <button
                    type="button"
                    onClick={() => setStatusFilter('inactive')}
                    className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                      statusFilter === 'inactive'
                        ? 'bg-rose-500 text-white shadow-sm'
                        : 'text-slate-500 dark:text-neutral-400'
                    }`}
                  >
                    المعطلة
                  </button>
                </div>

                {/* View Mode Toggle */}
                <div className="flex items-center bg-slate-100 dark:bg-white/[0.04] p-1 rounded-2xl border border-slate-200 dark:border-white/10">
                  <button
                    type="button"
                    onClick={() => setViewMode('grid')}
                    className={`p-2 rounded-xl transition-all cursor-pointer ${
                      viewMode === 'grid'
                        ? 'bg-white dark:bg-white/10 text-primary shadow-sm'
                        : 'text-slate-400 dark:text-neutral-500'
                    }`}
                    title="عرض البطاقات (Grid)"
                  >
                    <FiGrid className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewMode('table')}
                    className={`p-2 rounded-xl transition-all cursor-pointer ${
                      viewMode === 'table'
                        ? 'bg-white dark:bg-white/10 text-primary shadow-sm'
                        : 'text-slate-400 dark:text-neutral-500'
                    }`}
                    title="عرض الجدول (Table)"
                  >
                    <FiList className="w-4 h-4" />
                  </button>
                </div>

                {/* Refresh */}
                <button
                  type="button"
                  onClick={() => refetch()}
                  className="p-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-white/[0.04] dark:hover:bg-white/[0.08] border border-slate-200 dark:border-white/10 text-slate-600 dark:text-neutral-300 transition-colors cursor-pointer"
                  title="تحديث البيانات"
                >
                  <FiRefreshCw className={`w-4 h-4 ${isRefetching ? 'animate-spin' : ''}`} />
                </button>
              </div>
            </div>

            {/* Branches List Display */}
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="h-72 rounded-3xl bg-white dark:bg-[#121216] border border-slate-200 dark:border-white/10 animate-pulse"
                  />
                ))}
              </div>
            ) : filteredBranches.length === 0 ? (
              <div className="p-12 text-center rounded-3xl bg-white dark:bg-[#121216] border border-slate-200 dark:border-white/10">
                <div className="w-16 h-16 mx-auto rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-4">
                  <FiMapPin className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-1">
                  لم يتم العثور على أي فروع مطابقة
                </h3>
                <p className="text-xs text-slate-400 dark:text-neutral-400 mb-6 max-w-sm mx-auto">
                  جرب تغيير كلمات البحث أو إعادة ضبط فلاتر الحالة، أو أضف فرعاً جديداً.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setBranchToEdit(null);
                    setIsFormOpen(true);
                  }}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary hover:bg-primary-dark text-white text-xs font-bold transition-all shadow-md shadow-primary/20 cursor-pointer"
                >
                  <FiPlus className="w-4 h-4" />
                  <span>إضافة فرع الآن</span>
                </button>
              </div>
            ) : viewMode === 'grid' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredBranches.map((b) => (
                  <BranchCard
                    key={b.id}
                    branch={b}
                    onView={(branch) => {
                      setSelectedBranch(branch);
                      setIsDetailsOpen(true);
                    }}
                    onEdit={(branch) => {
                      setBranchToEdit(branch);
                      setIsFormOpen(true);
                    }}
                    onDelete={(branch) => {
                      setBranchToDelete(branch);
                      setIsDeleteOpen(true);
                    }}
                  />
                ))}
              </div>
            ) : (
              <div className="overflow-x-auto rounded-3xl bg-white dark:bg-[#121216] border border-slate-200 dark:border-white/10 shadow-sm">
                <table className="w-full text-right text-xs">
                  <thead className="bg-slate-50 dark:bg-white/[0.02] border-b border-slate-200 dark:border-white/10 text-slate-400 dark:text-neutral-400 font-semibold">
                    <tr>
                      <th className="py-4 px-6">المعرف</th>
                      <th className="py-4 px-6">اسم الفرع</th>
                      <th className="py-4 px-6">اسم المستخدم</th>
                      <th className="py-4 px-6">العنوان</th>
                      <th className="py-4 px-6">رقم الواتساب</th>
                      <th className="py-4 px-6">الحالة</th>
                      <th className="py-4 px-6 text-center">الإجراءات</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                    {filteredBranches.map((b) => {
                      const arName = typeof b.name === 'object' ? b.name.ar : b.name;
                      return (
                        <tr
                          key={b.id}
                          className="hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors"
                        >
                          <td className="py-4 px-6 font-mono font-bold text-slate-500 dark:text-neutral-400">
                            #{b.id}
                          </td>
                          <td className="py-4 px-6 font-bold text-slate-900 dark:text-white">
                            {arName}
                          </td>
                          <td className="py-4 px-6 font-mono font-medium text-slate-600 dark:text-neutral-300">
                            {b.user_name}
                          </td>
                          <td className="py-4 px-6 text-slate-500 dark:text-neutral-400 max-w-xs truncate">
                            {b.address || '—'}
                          </td>
                          <td className="py-4 px-6 font-mono text-slate-600 dark:text-neutral-300" dir="ltr">
                            {b.watts || '—'}
                          </td>
                          <td className="py-4 px-6">
                            <span
                              className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                                b.status
                                  ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                                  : 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
                              }`}
                            >
                              {b.status ? 'نشط' : 'معطل'}
                            </span>
                          </td>
                          <td className="py-4 px-6 text-center">
                            <div className="inline-flex items-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedBranch(b);
                                  setIsDetailsOpen(true);
                                }}
                                className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-white/[0.05] hover:bg-primary/10 hover:text-primary text-slate-700 dark:text-neutral-300 font-bold text-[11px] transition-colors"
                              >
                                تفاصيل
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setBranchToEdit(b);
                                  setIsFormOpen(true);
                                }}
                                className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-white/[0.05] hover:bg-amber-500/10 hover:text-amber-600 text-slate-700 dark:text-neutral-300 font-bold text-[11px] transition-colors"
                              >
                                تعديل
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setBranchToDelete(b);
                                  setIsDeleteOpen(true);
                                }}
                                className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-white/[0.05] hover:bg-rose-500/10 hover:text-rose-600 text-slate-700 dark:text-neutral-300 font-bold text-[11px] transition-colors"
                              >
                                حذف
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Dashboard Analytics */}
        {activePageTab === 'dashboard' && <BranchDashboardView />}

        {/* Tab 3: Branch Operations Hub */}
        {activePageTab === 'operations' && <BranchOperationsView />}
      </div>

      {/* Modals */}
      <BranchFormModal
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setBranchToEdit(null);
        }}
        branchToEdit={branchToEdit}
        onSubmit={handleFormSubmit}
        isLoading={isSubmitting}
      />

      <BranchDetailsModal
        isOpen={isDetailsOpen}
        onClose={() => {
          setIsDetailsOpen(false);
          setSelectedBranch(null);
        }}
        branch={selectedBranch}
        onEdit={(b) => {
          setBranchToEdit(b);
          setIsFormOpen(true);
        }}
      />

      <BranchDeleteModal
        isOpen={isDeleteOpen}
        onClose={() => {
          setIsDeleteOpen(false);
          setBranchToDelete(null);
        }}
        branch={branchToDelete}
        onConfirm={handleDeleteConfirm}
        isLoading={isDeleting}
      />
    </div>
  );
};

export default BranchesPage;
