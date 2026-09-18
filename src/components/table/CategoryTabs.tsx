import React, { useRef } from 'react';
import type { TableCategory, TableSubCategory } from '../../types/table';
import { FiGrid } from 'react-icons/fi';

interface CategoryTabsProps {
  categories: TableCategory[];
  selectedCategoryId: number | null;
  onSelectCategory: (id: number | null) => void;
  subCategories: TableSubCategory[];
  selectedSubCategoryId: number | null;
  onSelectSubCategory: (id: number | null) => void;
  loadingSubCategories?: boolean;
}

export const CategoryTabs: React.FC<CategoryTabsProps> = ({
  categories,
  selectedCategoryId,
  onSelectCategory,
  subCategories,
  selectedSubCategoryId,
  onSelectSubCategory,
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  return (
    <div className="sticky top-[57px] z-20 bg-[#070709]/95 backdrop-blur-md pt-3 pb-2 border-b border-white/5 shadow-lg shadow-black/40">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-2.5">
        {/* Parent Categories Horizontal Scroll */}
        <div
          ref={scrollContainerRef}
          className="flex items-center gap-2.5 overflow-x-auto pb-1 scrollbar-none select-none scroll-smooth"
        >
          {/* 'All Categories' Button */}
          <button
            type="button"
            onClick={() => onSelectCategory(null)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
              selectedCategoryId === null
                ? 'bg-primary text-white shadow-lg shadow-primary/30 scale-[1.02]'
                : 'bg-white/[0.04] hover:bg-white/[0.08] text-neutral-300 hover:text-white border border-white/10'
            }`}
          >
            <FiGrid className="w-3.5 h-3.5" />
            <span>الكل</span>
          </button>

          {/* Categories List */}
          {categories.map((cat) => {
            const isSelected = selectedCategoryId === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => onSelectCategory(cat.id)}
                className={`flex items-center gap-2.5 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                  isSelected
                    ? 'bg-primary text-white shadow-lg shadow-primary/30 scale-[1.02]'
                    : 'bg-white/[0.04] hover:bg-white/[0.08] text-neutral-300 hover:text-white border border-white/10'
                }`}
              >
                {cat.image ? (
                  <img
                    src={cat.image}
                    alt={cat.name}
                    className="w-5 h-5 rounded-lg object-cover"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                ) : null}
                <span>{cat.name}</span>
              </button>
            );
          })}
        </div>

        {/* Sub-categories (Chips) if available */}
        {selectedCategoryId !== null && subCategories.length > 0 && (
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none animate-in fade-in slide-in-from-top-1 duration-200">
            {/* All Subcategories */}
            <button
              type="button"
              onClick={() => onSelectSubCategory(null)}
              className={`px-3 py-1 rounded-xl text-[11px] font-bold transition-all shrink-0 cursor-pointer ${
                selectedSubCategoryId === null
                  ? 'bg-white/20 text-white border border-white/30'
                  : 'bg-white/[0.02] text-neutral-400 hover:text-white border border-white/5'
              }`}
            >
              جميع {categories.find((c) => c.id === selectedCategoryId)?.name || 'الأصناف'}
            </button>

            {subCategories.map((sub) => {
              const isSubSelected = selectedSubCategoryId === sub.id;
              return (
                <button
                  key={sub.id}
                  type="button"
                  onClick={() => onSelectSubCategory(sub.id)}
                  className={`px-3 py-1 rounded-xl text-[11px] font-bold transition-all shrink-0 cursor-pointer ${
                    isSubSelected
                      ? 'bg-white/20 text-white border border-white/30'
                      : 'bg-white/[0.02] text-neutral-400 hover:text-white border border-white/5'
                  }`}
                >
                  {sub.name}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
