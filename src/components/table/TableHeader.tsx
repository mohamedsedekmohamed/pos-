import React from 'react';
import { Link } from 'react-router-dom';
import { useTableContext } from '../../context/TableContext';
import {
  FiArrowRight,
  FiCoffee,
  FiUser,
  FiGlobe,
  FiMapPin,
  FiEdit2,
} from 'react-icons/fi';

interface TableHeaderProps {
  onOpenTableModal?: () => void;
}

export const TableHeader: React.FC<TableHeaderProps> = ({ onOpenTableModal }) => {
  const { tableInfo, lang, setLang } = useTableContext();

  const toggleLanguage = () => {
    setLang(lang === 'ar' ? 'en' : 'ar');
  };

  return (
    <header className="sticky top-0 z-30 w-full bg-[#070709]/85 backdrop-blur-xl border-b border-white/10 px-4 py-3 sm:px-6 transition-all">
      <div className="max-w-6xl mx-auto flex items-center justify-between gap-3">
        {/* Start: Back to Home + Table/Branch Info */}
        <div className="flex items-center gap-3 min-w-0">
          <Link
            to="/"
            className="w-9 h-9 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 flex items-center justify-center text-neutral-300 hover:text-white transition-colors shrink-0"
            title="الرئيسية"
          >
            <FiArrowRight className="w-4 h-4" />
          </Link>

          <div className="flex items-center gap-2.5 min-w-0">
            {/* Table Indicator Badge */}
            {tableInfo ? (
              <button
                type="button"
                onClick={onOpenTableModal}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500/15 to-teal-500/15 border border-emerald-500/30 text-emerald-400 hover:border-emerald-500/50 transition-all text-right group cursor-pointer"
                title="تغيير الطاولة"
              >
                <div className="w-6 h-6 rounded-lg bg-emerald-500/20 flex items-center justify-center shrink-0">
                  <FiCoffee className="w-3.5 h-3.5 text-emerald-400" />
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-bold text-white flex items-center gap-1.5 leading-tight">
                    <span>طاولة {tableInfo.name}</span>
                    <FiEdit2 className="w-2.5 h-2.5 text-emerald-400 opacity-60 group-hover:opacity-100" />
                  </div>
                  <p className="text-[10px] text-emerald-400/80 truncate">
                    {tableInfo.hall?.name || 'الصالة'} {tableInfo.branch?.name ? `· ${tableInfo.branch.name}` : ''}
                  </p>
                </div>
              </button>
            ) : (
              <button
                type="button"
                onClick={onOpenTableModal}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 hover:bg-amber-500/20 transition-all text-xs font-bold cursor-pointer"
              >
                <FiMapPin className="w-3.5 h-3.5 animate-bounce" />
                <span>اختر رقم الطاولة</span>
              </button>
            )}
          </div>
        </div>

        {/* End: Actions (Language Toggle + Profile) */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Language Switcher */}
          <button
            type="button"
            onClick={toggleLanguage}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-neutral-300 hover:text-white text-xs font-bold transition-all cursor-pointer"
            title="تبديل اللغة"
          >
            <FiGlobe className="w-3.5 h-3.5 text-primary" />
            <span className="uppercase">{lang}</span>
          </button>

          {/* Profile & Settings */}
          <Link
            to="/table/profile"
            className="w-9 h-9 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 flex items-center justify-center text-neutral-300 hover:text-white transition-colors"
            title="الملف الشخصي والإعدادات"
          >
            <FiUser className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </header>
  );
};
