import React from 'react';
import type { Category } from '../../types/cashier';
import { useLanguage } from '../../context/LanguageContext';

interface CategoryTabsProps {
  categories: Category[];
  selectedId: number | null;
  onSelect: (id: number | null) => void;
  isLoading: boolean;
}

const CategoryTabs: React.FC<CategoryTabsProps> = ({
  categories,
  selectedId,
  onSelect,
  isLoading,
}) => {
  const { t, renderLocalized } = useLanguage();

  if (isLoading) {
    return (
      <div className="flex gap-3 p-4 overflow-x-auto scrollbar-hide">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="h-12 w-32 rounded-xl bg-slate-200 dark:bg-slate-700 animate-pulse flex-shrink-0"
          />
        ))}
      </div>
    );
  }

  return (
    <div className="flex gap-2 p-3 overflow-x-auto scrollbar-hide">
      {/* All button */}
      <button
        onClick={() => onSelect(null)}
        className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold whitespace-nowrap transition-all duration-200 flex-shrink-0 cursor-pointer ${
          selectedId === null
            ? 'bg-gradient-to-l from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-500/30 scale-105'
            : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-600 hover:shadow-md'
        }`}
      >
        🍽️ {t('all_products')}
      </button>

      {categories.map((cat) => {
        const localizedCatName = renderLocalized(cat.name) || cat.name;
        return (
          <button
            key={cat.id}
            onClick={() => onSelect(cat.id)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold whitespace-nowrap transition-all duration-200 flex-shrink-0 cursor-pointer ${
              selectedId === cat.id
                ? 'bg-gradient-to-l from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-500/30 scale-105'
                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-600 hover:shadow-md'
            }`}
          >
            {cat.image && (
              <img
                src={cat.image}
                alt={localizedCatName}
                className="w-6 h-6 rounded-md object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            )}
            {localizedCatName}
          </button>
        );
      })}
    </div>
  );
};

export default CategoryTabs;
