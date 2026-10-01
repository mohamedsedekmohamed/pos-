import React, { useRef } from 'react';
import { FiChevronLeft, FiChevronRight, FiGrid } from 'react-icons/fi';
import { formatImageUrl } from '../../hooks/useBusinessSetup';
import type { UserCategory, UserSubCategory } from '../../types/user';

interface UserCategoryNavProps {
  categories: UserCategory[];
  subCategories: UserSubCategory[];
  selectedCategoryId: number | null;
  selectedSubCategoryId: number | null;
  onSelectCategory: (id: number | null) => void;
  onSelectSubCategory: (id: number | null) => void;
  isLoading?: boolean;
}

export const UserCategoryNav: React.FC<UserCategoryNavProps> = ({
  categories,
  subCategories,
  selectedCategoryId,
  selectedSubCategoryId,
  onSelectCategory,
  onSelectSubCategory,
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  const handleScroll = (offset: number) => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: offset, behavior: 'smooth' });
    }
  };

  // Filter subcategories for the selected parent category
  const activeSubCategories = selectedCategoryId
    ? subCategories.filter((sub) => sub.category_id === selectedCategoryId)
    : [];

  return (
    <div className="w-full space-y-2 sm:space-y-3">
      {/* Parent Categories Horizontal Scroll */}
      <div className="relative group">
        {/* Scroll Left Button */}
        <button
          type="button"
          onClick={() => handleScroll(-220)}
          className="hidden sm:flex absolute right-0 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full bg-white/90 dark:bg-[#181824]/90 backdrop-blur-md border border-slate-200 dark:border-white/15 text-slate-700 dark:text-neutral-300 hover:text-slate-900 dark:hover:text-white items-center justify-center shadow-lg transition-all opacity-0 group-hover:opacity-100 hover:scale-110 active:scale-95"
          aria-label="Scroll right"
        >
          <FiChevronRight className="w-4 h-4" />
        </button>

        {/* Scroll Right Button */}
        <button
          type="button"
          onClick={() => handleScroll(220)}
          className="hidden sm:flex absolute left-0 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full bg-white/90 dark:bg-[#181824]/90 backdrop-blur-md border border-slate-200 dark:border-white/15 text-slate-700 dark:text-neutral-300 hover:text-slate-900 dark:hover:text-white items-center justify-center shadow-lg transition-all opacity-0 group-hover:opacity-100 hover:scale-110 active:scale-95"
          aria-label="Scroll left"
        >
          <FiChevronLeft className="w-4 h-4" />
        </button>

        <div
          ref={scrollRef}
          className="flex items-center gap-2 sm:gap-3 overflow-x-auto no-scrollbar scroll-smooth py-1 sm:py-2 px-0.5"
        >
          {/* All Categories Option */}
          <button
            type="button"
            onClick={() => {
              onSelectCategory(null);
              onSelectSubCategory(null);
            }}
            className={`flex items-center gap-1.5 sm:gap-2.5 px-3 sm:px-5 py-2 sm:py-3 rounded-xl sm:rounded-2xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all duration-300 shrink-0 hover:scale-105 active:scale-95 ${
              selectedCategoryId === null
                ? 'bg-gradient-to-r from-primary to-indigo-600 text-white shadow-lg sm:shadow-xl shadow-primary/30 ring-2 ring-primary/40 scale-[1.02]'
                : 'bg-white dark:bg-[#121218]/90 hover:bg-slate-100 dark:hover:bg-[#181822] text-slate-700 dark:text-neutral-300 border border-slate-200/80 dark:border-white/10 shadow-sm dark:shadow-none'
            }`}
          >
            <FiGrid className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span>جميع الأصناف</span>
          </button>

          {/* List of Parent Categories */}
          {categories.map((cat) => {
            const isSelected = selectedCategoryId === cat.id;
            const imageUrl = formatImageUrl(cat.image);

            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => {
                  onSelectCategory(cat.id);
                  onSelectSubCategory(null);
                }}
                className={`flex items-center gap-1.5 sm:gap-2.5 px-3 sm:px-5 py-2 sm:py-3 rounded-xl sm:rounded-2xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all duration-300 shrink-0 hover:scale-105 active:scale-95 ${
                  isSelected
                    ? 'bg-gradient-to-r from-primary to-indigo-600 text-white shadow-lg sm:shadow-xl shadow-primary/30 ring-2 ring-primary/40 scale-[1.02]'
                    : 'bg-white dark:bg-[#121218]/90 hover:bg-slate-100 dark:hover:bg-[#181822] text-slate-700 dark:text-neutral-300 border border-slate-200/80 dark:border-white/10 shadow-sm dark:shadow-none'
                }`}
              >
                {imageUrl && (
                  <div className="w-5 h-5 sm:w-8 sm:h-8 rounded-lg sm:rounded-xl bg-slate-100 dark:bg-black/40 overflow-hidden shrink-0 p-0.5 border border-slate-200 dark:border-white/10 transition-transform group-hover:scale-105">
                    <img
                      src={imageUrl}
                      alt={cat.name}
                      className="w-full h-full object-cover rounded-md sm:rounded-lg"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  </div>
                )}
                <span>{cat.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Sub Categories Pills */}
      {activeSubCategories.length > 0 && (
        <div className="flex items-center gap-1.5 sm:gap-2.5 overflow-x-auto no-scrollbar py-1 px-0.5 animate-in fade-in slide-in-from-top-2 duration-300">
          <button
            type="button"
            onClick={() => onSelectSubCategory(null)}
            className={`px-2.5 sm:px-3.5 py-1 sm:py-1.5 rounded-lg sm:rounded-xl text-[11px] sm:text-xs font-semibold whitespace-nowrap transition-all duration-200 shrink-0 hover:scale-105 active:scale-95 ${
              selectedSubCategoryId === null
                ? 'bg-slate-200 dark:bg-white/20 text-slate-900 dark:text-white border border-slate-300 dark:border-white/30 shadow-sm ring-1 ring-slate-300 dark:ring-white/20'
                : 'bg-white dark:bg-white/[0.04] text-slate-600 dark:text-neutral-400 hover:text-slate-900 dark:hover:text-white border border-slate-200/80 dark:border-white/5 shadow-sm dark:shadow-none'
            }`}
          >
            الكل بالقسم
          </button>

          {activeSubCategories.map((sub) => {
            const isSubSelected = selectedSubCategoryId === sub.id;
            return (
              <button
                key={sub.id}
                type="button"
                onClick={() => onSelectSubCategory(sub.id)}
                className={`px-2.5 sm:px-3.5 py-1 sm:py-1.5 rounded-lg sm:rounded-xl text-[11px] sm:text-xs font-semibold whitespace-nowrap transition-all duration-200 shrink-0 hover:scale-105 active:scale-95 ${
                  isSubSelected
                    ? 'bg-primary/20 text-primary border border-primary/40 shadow-sm ring-1 ring-primary/30 font-bold'
                    : 'bg-white dark:bg-white/[0.04] text-slate-600 dark:text-neutral-400 hover:text-slate-900 dark:hover:text-white border border-slate-200/80 dark:border-white/5 shadow-sm dark:shadow-none'
                }`}
              >
                {sub.name}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
