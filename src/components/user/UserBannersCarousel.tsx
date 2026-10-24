import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  FiChevronLeft,
  FiChevronRight,
  FiMaximize2,
  FiX,
  FiImage,
} from 'react-icons/fi';
import { userApi } from '../../services/userService';
import { useLanguage } from '../../context/LanguageContext';
import { formatImageUrl } from '../../hooks/useBusinessSetup';
import type { UserBanner } from '../../types/user';

export const UserBannersCarousel: React.FC = () => {
  const { language } = useLanguage();
  const isRtl = language === 'ar';

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);
  const [imageErrorMap, setImageErrorMap] = useState<Record<number, boolean>>({});

  // Touch swipe support
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

  // Fetch banners
  const {
    data: banners = [],
    isLoading,
    isError,
  } = useQuery<UserBanner[]>({
    queryKey: ['user-banners', language],
    queryFn: () => userApi.getBanners(language),
    staleTime: 1000 * 60 * 10, // 10 minutes cache
  });

  const totalBanners = banners.length;

  // Next Slide
  const handleNext = useCallback(() => {
    if (totalBanners <= 1) return;
    setCurrentIndex((prev) => (prev < totalBanners - 1 ? prev + 1 : 0));
  }, [totalBanners]);

  // Prev Slide
  const handlePrev = useCallback(() => {
    if (totalBanners <= 1) return;
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : totalBanners - 1));
  }, [totalBanners]);

  // Autoplay Effect (4.5s)
  useEffect(() => {
    if (isPaused || totalBanners <= 1) return;
    const interval = setInterval(() => {
      handleNext();
    }, 4500);

    return () => clearInterval(interval);
  }, [isPaused, totalBanners, handleNext]);

  // Touch handlers for mobile swipe
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.targetTouches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return;
    const diff = touchStartX.current - touchEndX.current;
    // threshold 50px
    if (Math.abs(diff) > 50) {
      if (diff > 0) {
        // Swiped Left
        if (isRtl) handlePrev();
        else handleNext();
      } else {
        // Swiped Right
        if (isRtl) handleNext();
        else handlePrev();
      }
    }
    touchStartX.current = null;
    touchEndX.current = null;
  };

  // If loading skeleton
  if (isLoading) {
    return (
      <div className="w-full mb-6 animate-pulse">
        <div className="w-full h-40 sm:h-56 md:h-64 lg:h-72 rounded-3xl bg-slate-200/80 dark:bg-white/5 border border-slate-200 dark:border-white/10" />
      </div>
    );
  }

  // If no banners or error
  if (isError || totalBanners === 0) {
    return null;
  }

  const currentBanner = banners[currentIndex];
  const formattedImageUrl = currentBanner ? formatImageUrl(currentBanner.image) : '';

  return (
    <div
      data-aos="fade-down"
      data-aos-duration="600"
      className="relative w-full mb-6 select-none group"
      dir="rtl"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Ambient colorful backdrop glow */}
      <div className="absolute -inset-1 bg-gradient-to-r from-primary/30 via-indigo-600/20 to-purple-600/30 rounded-[32px] blur-xl opacity-30 group-hover:opacity-60 transition duration-700 pointer-events-none" />

      {/* Main Carousel Frame */}
      <div
        className="relative w-full h-36 xs:h-44 sm:h-56 md:h-64 lg:h-72 rounded-2xl sm:rounded-3xl overflow-hidden bg-slate-900 shadow-xl border border-slate-200/60 dark:border-white/10"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* All Slides Container with CSS transform */}
        <div
          className="flex h-full w-full transition-transform duration-500 ease-out"
          style={{
            transform: `translateX(${isRtl ? currentIndex * 100 : -currentIndex * 100}%)`,
          }}
        >
          {banners.map((banner, index) => {
            const imgUrl = formatImageUrl(banner.image);
            const isFailed = imageErrorMap[banner.id];

            return (
              <div
                key={banner.id}
                className="w-full h-full shrink-0 relative cursor-pointer"
                onClick={() => {
                  if (imgUrl) setLightboxImage(imgUrl);
                }}
              >
                {!isFailed && imgUrl ? (
                  <img
                    src={imgUrl}
                    alt={`Banner ${index + 1}`}
                    className="w-full h-full object-cover sm:object-fill hover:scale-[1.01] transition-transform duration-700"
                    onError={() =>
                      setImageErrorMap((prev) => ({ ...prev, [banner.id]: true }))
                    }
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-slate-800 to-slate-900 text-slate-400 p-4">
                    <FiImage className="w-10 h-10 mb-2 opacity-50" />
                    <span className="text-xs font-semibold">تعذر تحميل صورة البانر</span>
                  </div>
                )}

                {/* Subtle gradient overlay at bottom for depth */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 pointer-events-none" />
              </div>
            );
          })}
        </div>

        {/* Top Badges: Slide Counter & Zoom Button */}
        <div className="absolute top-3 left-3 sm:left-4 flex items-center gap-2 pointer-events-auto z-10">
          <span className="px-2.5 py-1 rounded-xl bg-black/60 backdrop-blur-md border border-white/20 text-white text-[11px] font-mono font-bold shadow-md">
            {currentIndex + 1} / {totalBanners}
          </span>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              if (formattedImageUrl) setLightboxImage(formattedImageUrl);
            }}
            className="p-1.5 rounded-xl bg-black/60 hover:bg-black/85 backdrop-blur-md border border-white/20 text-white text-xs transition-all hover:scale-105 active:scale-95 shadow-md"
            title="تكبير صورة البانر"
          >
            <FiMaximize2 className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Navigation Arrows (Prev / Next) */}
        {totalBanners > 1 && (
          <>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                if (isRtl) handlePrev();
                else handleNext();
              }}
              className="absolute left-2.5 sm:left-4 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-black/50 hover:bg-black/80 backdrop-blur-md border border-white/20 text-white flex items-center justify-center transition-all opacity-80 group-hover:opacity-100 hover:scale-110 active:scale-95 shadow-lg z-10"
              title="السابق"
            >
              {isRtl ? (
                <FiChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
              ) : (
                <FiChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
              )}
            </button>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                if (isRtl) handleNext();
                else handlePrev();
              }}
              className="absolute right-2.5 sm:right-4 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-black/50 hover:bg-black/80 backdrop-blur-md border border-white/20 text-white flex items-center justify-center transition-all opacity-80 group-hover:opacity-100 hover:scale-110 active:scale-95 shadow-lg z-10"
              title="التالي"
            >
              {isRtl ? (
                <FiChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
              ) : (
                <FiChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
              )}
            </button>
          </>
        )}

        {/* Bottom Pagination Dots */}
        {totalBanners > 1 && (
          <div className="absolute bottom-3 inset-x-0 flex items-center justify-center gap-1.5 z-10">
            {banners.map((_, dotIdx) => {
              const isActive = dotIdx === currentIndex;
              return (
                <button
                  key={dotIdx}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrentIndex(dotIdx);
                  }}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    isActive
                      ? 'w-7 sm:w-8 bg-primary shadow-md shadow-primary/50'
                      : 'w-2 bg-white/40 hover:bg-white/70'
                  }`}
                  title={`انتقال للبانر ${dotIdx + 1}`}
                />
              );
            })}
          </div>
        )}
      </div>

      {/* Lightbox / Full Image Preview Modal */}
      {lightboxImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/90 backdrop-blur-md animate-in fade-in"
          onClick={() => setLightboxImage(null)}
        >
          <div className="relative max-w-5xl max-h-[90vh] flex flex-col items-center">
            <button
              type="button"
              onClick={() => setLightboxImage(null)}
              className="absolute -top-12 left-0 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all"
              title="إغلاق"
            >
              <FiX className="w-6 h-6" />
            </button>
            <img
              src={lightboxImage}
              alt="Banner Preview"
              className="max-w-full max-h-[85vh] object-contain rounded-2xl shadow-2xl border border-white/10"
            />
          </div>
        </div>
      )}
    </div>
  );
};
