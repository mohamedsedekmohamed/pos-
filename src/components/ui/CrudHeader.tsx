import React from 'react';
import { FiPlus, FiSearch } from 'react-icons/fi';

interface CrudHeaderProps {
  title: string;
  searchValue: string;
  onSearchChange: (value: string) => void;
  onAdd?: () => void;
  addLabel?: string;
  searchPlaceholder?: string;
}

const CrudHeader: React.FC<CrudHeaderProps> = ({
  title,
  searchValue,
  onSearchChange,
  onAdd,
  addLabel = 'إضافة جديد',
  searchPlaceholder = 'بحث...',
}) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{title}</h1>

      <div className="flex items-center gap-3">
        {/* Search */}
        <div className="relative">
          <FiSearch className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
          <input
            type="text"
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={searchPlaceholder}
            className="w-full sm:w-64 pr-10 pl-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-600 transition-all"
          />
        </div>

        {/* Add Button */}
        {onAdd && (
          <button
            onClick={onAdd}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-medium hover:bg-violet-600 active:scale-[0.98] transition-all shadow-lg shadow-indigo-500/25"
          >
            <FiPlus className="w-4 h-4" />
            <span className="hidden sm:inline">{addLabel}</span>
          </button>
        )}
      </div>
    </div>
  );
};

export default CrudHeader;
