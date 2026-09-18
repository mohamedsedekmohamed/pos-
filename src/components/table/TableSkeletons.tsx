import React from 'react';

export const CategoryTabsSkeleton: React.FC = () => {
  return (
    <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-none animate-pulse">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <div
          key={i}
          className="flex-shrink-0 flex items-center gap-2.5 px-4 py-2.5 rounded-2xl bg-white/[0.04] border border-white/5 w-32 h-11"
        >
          <div className="w-6 h-6 rounded-lg bg-white/10" />
          <div className="h-3 w-16 bg-white/10 rounded-full" />
        </div>
      ))}
    </div>
  );
};

export const ProductCardSkeleton: React.FC = () => {
  return (
    <div className="rounded-2xl bg-[#121216]/60 border border-white/5 p-3 flex flex-col justify-between h-72 animate-pulse overflow-hidden">
      {/* Image Skeleton */}
      <div className="w-full h-36 rounded-xl bg-white/[0.06] mb-3 relative overflow-hidden">
        <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.8s_infinite] bg-gradient-to-r from-transparent via-white/[0.05] to-transparent" />
      </div>

      {/* Info Skeleton */}
      <div className="space-y-2 flex-1">
        <div className="h-4 w-3/4 bg-white/10 rounded-md" />
        <div className="h-3 w-1/2 bg-white/[0.06] rounded-md" />
      </div>

      {/* Price & Button Skeleton */}
      <div className="flex items-center justify-between pt-3 border-t border-white/5 mt-2">
        <div className="h-5 w-16 bg-white/10 rounded-md" />
        <div className="w-8 h-8 rounded-xl bg-white/10" />
      </div>
    </div>
  );
};

export const ProductGridSkeleton: React.FC<{ count?: number }> = ({ count = 6 }) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
};
