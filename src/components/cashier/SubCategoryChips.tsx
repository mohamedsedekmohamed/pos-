import React from 'react';
import type { SubCategory } from '../../types/cashier';
import { useLanguage } from '../../context/LanguageContext';

interface SubCategoryChipsProps {
  subCategories: SubCategory[];
  selectedId: number | null;
  onSelect: (id: number | null) => void;
  isLoading: boolean;
}

const SubCategoryChips: React.FC<SubCategoryChipsProps> = ({
  subCategories,
  selectedId,
  onSelect,
  isLoading,
}) => {
  const { t, renderLocalized } = useLanguage();

  if (isLoading) {
    return (
      <div className="flex gap-2 px-4 py-2 overflow-x-auto scrollbar-hide bg-slate-100/60 dark:bg-slate-800/40 border-b border-slate-200/60 dark:border-slate-700/60">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="h-8 w-24 rounded-lg bg-slate-200 dark:bg-slate-700 animate-pulse flex-shrink-0"
          />
        ))}
      </div>
    );
  }

  if (subCategories.length === 0) return null;

  return (
    <div className="flex items-center gap-1.5 px-4 py-2 overflow-x-auto scrollbar-hide bg-slate-100/80 dark:bg-slate-800/40 border-b border-slate-200/60 dark:border-slate-700/60">
      <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 shrink-0 me-1">
        {t('subcategories')}:
      </span>

      {/* All Subcategories Button */}
      <button
        type="button"
        onClick={() => onSelect(null)}
        className={`px-3 py-1 rounded-lg text-xs font-bold transition-all shrink-0 cursor-pointer ${
          selectedId === null
            ? 'bg-primary text-white shadow-sm'
            : 'bg-white dark:bg-slate-700/60 text-slate-600 dark:text-slate-300 hover:bg-slate-200/70 dark:hover:bg-slate-600 border border-slate-200/80 dark:border-slate-600/80'
        }`}
      >
        {t('all_subcategories')}
      </button>

      {subCategories.map((sub) => {
        const localizedName = renderLocalized(sub.name) || sub.name;
        const isSelected = selectedId === sub.id;
        return (
          <button
            key={sub.id}
            type="button"
            onClick={() => onSelect(sub.id)}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all shrink-0 cursor-pointer ${
              isSelected
                ? 'bg-primary text-white shadow-sm'
                : 'bg-white dark:bg-slate-700/60 text-slate-600 dark:text-slate-300 hover:bg-slate-200/70 dark:hover:bg-slate-600 border border-slate-200/80 dark:border-slate-600/80'
            }`}
          >
            {sub.image && (
              <img
                src={sub.image}
                alt={localizedName}
                className="w-4 h-4 rounded object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            )}
            <span>{localizedName}</span>
          </button>
        );
      })}
    </div>
  );
};

export default SubCategoryChips;
