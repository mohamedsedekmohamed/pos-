import React from 'react';
import {
  FiMapPin,
  FiFacebook,
  FiEdit2,
  FiTrash2,
  FiEye,
  FiNavigation,
  FiCheckCircle,
  FiXCircle,
  FiUser,
} from 'react-icons/fi';
import { FaWhatsapp } from 'react-icons/fa6';
import type { AdminBranch } from '../../types/branch';

interface BranchCardProps {
  branch: AdminBranch;
  onView: (branch: AdminBranch) => void;
  onEdit: (branch: AdminBranch) => void;
  onDelete: (branch: AdminBranch) => void;
}

export const BranchCard: React.FC<BranchCardProps> = ({
  branch,
  onView,
  onEdit,
  onDelete,
}) => {
  const arName = typeof branch.name === 'object' ? branch.name.ar : branch.name;
  const enName = typeof branch.name === 'object' ? branch.name.en : '';

  // WhatsApp link formatter
  const getWhatsAppLink = (watts?: string | null) => {
    if (!watts) return null;
    const cleaned = watts.replace(/[^0-9]/g, '');
    return cleaned ? `https://wa.me/${cleaned}` : null;
  };

  // Google Maps link from first coordinate
  const firstLocation = branch.location && branch.location.length > 0 ? branch.location[0] : null;
  const googleMapsUrl =
    firstLocation && firstLocation.lat && firstLocation.lng
      ? `https://www.google.com/maps?q=${firstLocation.lat},${firstLocation.lng}`
      : null;

  const waLink = getWhatsAppLink(branch.watts);

  return (
    <div className="group relative rounded-3xl bg-white dark:bg-[#121216] border border-slate-200 dark:border-white/10 hover:border-primary/50 dark:hover:border-primary/50 p-6 flex flex-col justify-between transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/10 overflow-hidden">
      {/* Top subtle glow */}
      <div className="absolute top-0 right-0 w-36 h-36 bg-gradient-to-bl from-primary/10 to-transparent rounded-full blur-2xl pointer-events-none group-hover:from-primary/20 transition-all" />

      <div>
        {/* Header: Status & ID */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${
                branch.status
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400'
                  : 'bg-rose-500/10 border-rose-500/30 text-rose-600 dark:text-rose-400'
              }`}
            >
              {branch.status ? (
                <>
                  <FiCheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                  <span>نشط</span>
                </>
              ) : (
                <>
                  <FiXCircle className="w-3.5 h-3.5 text-rose-500" />
                  <span>معطل</span>
                </>
              )}
            </span>

            <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-white/[0.06] text-slate-500 dark:text-neutral-400 border border-slate-200 dark:border-white/5">
              ID #{branch.id}
            </span>
          </div>

          <span className="text-xs px-2.5 py-0.5 rounded-lg bg-primary/10 border border-primary/20 text-primary font-bold">
            {branch.role || 'branch'}
          </span>
        </div>

        {/* Branch Title (Arabic & English) */}
        <div className="mb-3">
          <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight group-hover:text-primary transition-colors">
            {arName || enName || 'بدون اسم'}
          </h3>
          {enName && arName !== enName && (
            <p className="text-xs text-slate-400 dark:text-neutral-400 font-medium tracking-wide">
              {enName}
            </p>
          )}
        </div>

        {/* Username */}
        <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-neutral-300 bg-slate-50 dark:bg-white/[0.03] p-2.5 rounded-xl border border-slate-200/60 dark:border-white/5 mb-4">
          <FiUser className="w-4 h-4 text-primary shrink-0" />
          <span className="text-slate-400 dark:text-neutral-500">اسم المستخدم:</span>
          <span className="font-mono font-bold text-slate-800 dark:text-white select-all">
            {branch.user_name}
          </span>
        </div>

        {/* Address */}
        {branch.address && (
          <div className="flex items-start gap-2 text-xs text-slate-600 dark:text-neutral-300 mb-3">
            <FiMapPin className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
            <span className="line-clamp-2 leading-relaxed">{branch.address}</span>
          </div>
        )}

        {/* GPS Coordinates Badge */}
        {firstLocation && (
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-neutral-400 mb-4 p-2 rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200/50 dark:border-white/5">
            <div className="flex items-center gap-1.5 font-mono text-[11px]">
              <FiNavigation className="w-3.5 h-3.5 text-blue-500 shrink-0" />
              <span>
                {firstLocation.lat?.toFixed(4)}, {firstLocation.lng?.toFixed(4)}
              </span>
            </div>
            {googleMapsUrl && (
              <a
                href={googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[11px] font-bold text-blue-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer"
                title="فتح في خرائط Google"
              >
                الخريطة &larr;
              </a>
            )}
          </div>
        )}

        {/* Social / Contact Badges */}
        <div className="flex flex-wrap items-center gap-2 mb-5">
          {waLink && (
            <a
              href={waLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 text-xs font-semibold text-emerald-600 dark:text-emerald-400 transition-all cursor-pointer shadow-sm"
              title="واتساب الفرع"
            >
              <FaWhatsapp className="w-3.5 h-3.5 text-emerald-500" />
              <span dir="ltr">{branch.watts}</span>
            </a>
          )}

          {branch.facebook && (
            <a
              href={branch.facebook}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20 text-xs font-semibold text-blue-600 dark:text-blue-400 transition-all cursor-pointer shadow-sm"
              title="صفحة فيسبوك"
            >
              <FiFacebook className="w-3.5 h-3.5 text-blue-500" />
              <span>فيسبوك</span>
            </a>
          )}
        </div>
      </div>

      {/* Card Actions Footer */}
      <div className="pt-4 border-t border-slate-200 dark:border-white/10 flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={() => onView(branch)}
          className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-slate-100 dark:bg-white/[0.05] hover:bg-primary/10 hover:text-primary dark:hover:bg-primary/20 dark:hover:text-primary-light text-slate-700 dark:text-neutral-200 text-xs font-bold transition-all cursor-pointer"
          title="عرض التفاصيل الكاملة"
        >
          <FiEye className="w-3.5 h-3.5" />
          <span>تفاصيل</span>
        </button>

        <button
          type="button"
          onClick={() => onEdit(branch)}
          className="inline-flex items-center justify-center p-2 rounded-xl bg-slate-100 dark:bg-white/[0.05] hover:bg-amber-500/10 hover:text-amber-600 dark:hover:bg-amber-500/20 dark:hover:text-amber-400 text-slate-700 dark:text-neutral-300 text-xs font-bold transition-all cursor-pointer"
          title="تعديل بيانات الفرع"
        >
          <FiEdit2 className="w-3.5 h-3.5" />
        </button>

        <button
          type="button"
          onClick={() => onDelete(branch)}
          className="inline-flex items-center justify-center p-2 rounded-xl bg-slate-100 dark:bg-white/[0.05] hover:bg-rose-500/10 hover:text-rose-600 dark:hover:bg-rose-500/20 dark:hover:text-rose-400 text-slate-700 dark:text-neutral-300 text-xs font-bold transition-all cursor-pointer"
          title="حذف الفرع"
        >
          <FiTrash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
