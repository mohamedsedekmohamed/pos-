import React from 'react';
import { FiAlertTriangle, FiTrash2, FiX } from 'react-icons/fi';
import type { AdminBranch } from '../../types/branch';

interface BranchDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  branch: AdminBranch | null;
  onConfirm: (branch: AdminBranch) => Promise<void>;
  isLoading?: boolean;
}

export const BranchDeleteModal: React.FC<BranchDeleteModalProps> = ({
  isOpen,
  onClose,
  branch,
  onConfirm,
  isLoading = false,
}) => {
  if (!isOpen || !branch) return null;

  const branchName =
    typeof branch.name === 'object' ? branch.name.ar || branch.name.en : branch.name;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md rounded-3xl bg-white dark:bg-[#121216] border border-slate-200 dark:border-white/10 p-6 sm:p-8 shadow-2xl text-center animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
        dir="rtl"
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 left-4 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-white/[0.05] dark:hover:bg-white/[0.1] border border-slate-200 dark:border-white/10 flex items-center justify-center text-slate-500 hover:text-slate-900 dark:text-neutral-400 dark:hover:text-white transition-colors cursor-pointer"
          title="إغلاق"
        >
          <FiX className="w-4 h-4" />
        </button>

        {/* Warning Icon */}
        <div className="w-16 h-16 mx-auto rounded-2xl bg-rose-500/15 border border-rose-500/25 flex items-center justify-center text-rose-500 shadow-lg shadow-rose-500/10 mb-4">
          <FiAlertTriangle className="w-8 h-8" />
        </div>

        <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight mb-2">
          تأكيد حذف الفرع
        </h3>

        <p className="text-xs sm:text-sm text-slate-500 dark:text-neutral-400 leading-relaxed mb-6">
          هل أنت متأكد من رغبتك في حذف فرع{' '}
          <span className="font-bold text-slate-900 dark:text-white">"{branchName}"</span>؟
          <br />
          سيؤدي هذا الإجراء إلى حذف بيانات الفرع وتعطيل الوصول إليه عبر هذا الحساب.
        </p>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => onConfirm(branch)}
            disabled={isLoading}
            className="flex-1 py-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-sm shadow-lg shadow-rose-600/25 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <FiTrash2 className="w-4 h-4" />
            <span>{isLoading ? 'جاري الحذف...' : 'نعم، احذف الفرع'}</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="px-5 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-white/[0.05] dark:hover:bg-white/[0.1] border border-slate-200 dark:border-white/10 text-slate-700 dark:text-neutral-300 font-semibold text-sm transition-all cursor-pointer"
          >
            إلغاء
          </button>
        </div>
      </div>
    </div>
  );
};
