import React, { useState } from 'react';
import {
  FiX,
  FiMapPin,
  FiNavigation,
  FiUser,
  FiCheckCircle,
  FiXCircle,
  FiCopy,
  FiCheck,
} from 'react-icons/fi';
import { FaWhatsapp, FaFacebookF } from 'react-icons/fa6';
import type { AdminBranch } from '../../types/branch';

interface BranchDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  branch: AdminBranch | null;
  onEdit?: (branch: AdminBranch) => void;
}

export const BranchDetailsModal: React.FC<BranchDetailsModalProps> = ({
  isOpen,
  onClose,
  branch,
  onEdit,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen || !branch) return null;

  const arName = typeof branch.name === 'object' ? branch.name.ar : branch.name;
  const enName = typeof branch.name === 'object' ? branch.name.en : '';

  const firstLocation = branch.location && branch.location.length > 0 ? branch.location[0] : null;
  const googleMapsUrl =
    firstLocation && firstLocation.lat && firstLocation.lng
      ? `https://www.google.com/maps?q=${firstLocation.lat},${firstLocation.lng}`
      : null;

  const handleCopyJSON = () => {
    navigator.clipboard.writeText(JSON.stringify(branch, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-3xl bg-white dark:bg-[#111116] border border-slate-200 dark:border-white/10 p-6 sm:p-8 shadow-2xl text-right animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
        dir="rtl"
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 left-5 w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-white/[0.05] dark:hover:bg-white/[0.1] border border-slate-200 dark:border-white/10 flex items-center justify-center text-slate-500 hover:text-slate-900 dark:text-neutral-400 dark:hover:text-white transition-colors cursor-pointer"
          title="إغلاق"
        >
          <FiX className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-primary/20 to-indigo-500/20 border border-primary/30 flex items-center justify-center text-primary shadow-lg shadow-primary/10">
            <FiMapPin className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                {arName || enName}
              </h2>
              <span
                className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                  branch.status
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400'
                    : 'bg-rose-500/10 border-rose-500/30 text-rose-600 dark:text-rose-400'
                }`}
              >
                {branch.status ? <FiCheckCircle className="w-3 h-3" /> : <FiXCircle className="w-3 h-3" />}
                <span>{branch.status ? 'نشط' : 'معطل'}</span>
              </span>
            </div>
            {enName && arName !== enName && (
              <p className="text-xs text-slate-400 dark:text-neutral-400 mt-0.5">{enName}</p>
            )}
          </div>
        </div>

        {/* Info Grid */}
        <div className="space-y-4 mb-6">
          {/* Identity & Role */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200/60 dark:border-white/5">
              <span className="text-[11px] font-semibold text-slate-400 dark:text-neutral-500 block mb-1">
                اسم المستخدم (Username)
              </span>
              <div className="flex items-center gap-1.5 font-mono text-sm font-bold text-slate-800 dark:text-white select-all">
                <FiUser className="w-3.5 h-3.5 text-primary" />
                <span>{branch.user_name}</span>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200/60 dark:border-white/5">
              <span className="text-[11px] font-semibold text-slate-400 dark:text-neutral-500 block mb-1">
                الدور المسجل (Role)
              </span>
              <span className="inline-block px-2.5 py-1 rounded-lg bg-primary/10 border border-primary/20 text-primary text-xs font-bold">
                {branch.role || 'branch'}
              </span>
            </div>
          </div>

          {/* Address */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200/60 dark:border-white/5">
            <span className="text-[11px] font-semibold text-slate-400 dark:text-neutral-500 block mb-1">
              العنوان
            </span>
            <p className="text-sm font-medium text-slate-800 dark:text-neutral-200 leading-relaxed">
              {branch.address || 'لم يتم تحديد عنوان تفصيلي.'}
            </p>
          </div>

          {/* GPS Location & Map */}
          {firstLocation && (
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200/60 dark:border-white/5 flex items-center justify-between">
              <div>
                <span className="text-[11px] font-semibold text-slate-400 dark:text-neutral-500 block mb-1">
                  الموقع الجغرافي (Coordinates)
                </span>
                <p className="text-xs font-mono font-bold text-slate-700 dark:text-neutral-300">
                  Lat: {firstLocation.lat} | Lng: {firstLocation.lng}
                </p>
              </div>
              {googleMapsUrl && (
                <a
                  href={googleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-blue-500 hover:bg-blue-600 text-white text-xs font-bold transition-all shadow-md shadow-blue-500/20"
                >
                  <FiNavigation className="w-3.5 h-3.5" />
                  <span>فتح في الخرائط</span>
                </a>
              )}
            </div>
          )}

          {/* Social Channels */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {branch.watts && (
              <a
                href={`https://wa.me/${branch.watts.replace(/[^0-9]/g, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="p-3.5 rounded-2xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/25 flex items-center gap-3 transition-all"
              >
                <div className="w-9 h-9 rounded-xl bg-emerald-500 text-white flex items-center justify-center shrink-0">
                  <FaWhatsapp className="w-5 h-5" />
                </div>
                <div className="overflow-hidden">
                  <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 block">
                    واتساب الفرع
                  </span>
                  <span className="text-xs font-bold text-slate-800 dark:text-white truncate block" dir="ltr">
                    {branch.watts}
                  </span>
                </div>
              </a>
            )}

            {branch.facebook && (
              <a
                href={branch.facebook}
                target="_blank"
                rel="noopener noreferrer"
                className="p-3.5 rounded-2xl bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/25 flex items-center gap-3 transition-all"
              >
                <div className="w-9 h-9 rounded-xl bg-blue-500 text-white flex items-center justify-center shrink-0">
                  <FaFacebookF className="w-5 h-5" />
                </div>
                <div className="overflow-hidden">
                  <span className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 block">
                    فيسبوك
                  </span>
                  <span className="text-xs font-bold text-slate-800 dark:text-white truncate block">
                    زيارة الصفحة
                  </span>
                </div>
              </a>
            )}
          </div>

          {/* Timestamps */}
          {(branch.created_at || branch.updated_at) && (
            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200/40 dark:border-white/5 flex items-center justify-between text-[11px] text-slate-400 dark:text-neutral-500 font-mono">
              {branch.created_at && (
                <span>أنشئ: {new Date(branch.created_at).toLocaleDateString('ar-EG')}</span>
              )}
              {branch.updated_at && (
                <span>آخر تعديل: {new Date(branch.updated_at).toLocaleDateString('ar-EG')}</span>
              )}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="pt-4 border-t border-slate-200 dark:border-white/10 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={handleCopyJSON}
            className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-white/[0.05] dark:hover:bg-white/[0.1] border border-slate-200 dark:border-white/10 text-xs font-semibold text-slate-700 dark:text-neutral-300 transition-all cursor-pointer"
            title="نسخ كـ JSON"
          >
            {copied ? <FiCheck className="w-4 h-4 text-emerald-500" /> : <FiCopy className="w-4 h-4" />}
            <span>{copied ? 'تم النسخ!' : 'نسخ كـ JSON'}</span>
          </button>

          <div className="flex items-center gap-2">
            {onEdit && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onEdit(branch);
                }}
                className="px-4 py-2.5 rounded-xl bg-primary hover:bg-primary-dark text-white font-bold text-xs shadow-md shadow-primary/20 transition-all cursor-pointer"
              >
                تعديل الفرع
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-white/[0.05] text-slate-700 dark:text-neutral-300 font-semibold text-xs transition-all cursor-pointer"
            >
              إغلاق
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
