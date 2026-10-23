import React, { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useQuery } from '@tanstack/react-query';
import {
  FiX,
  FiBookOpen,
  FiChevronLeft,
  FiChevronRight,
  FiMaximize2,
  FiZoomIn,
  FiZoomOut,
  FiRotateCcw,
  FiLoader,
  FiAlertCircle,
  FiFileText,
} from 'react-icons/fi';
import { userApi } from '../../services/userService';
import { useLanguage } from '../../context/LanguageContext';

interface UserPaperMenuModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const UserPaperMenuModal: React.FC<UserPaperMenuModalProps> = ({ isOpen, onClose }) => {
  const { language } = useLanguage();
  const [activePageIndex, setActivePageIndex] = useState(0);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [failedImages, setFailedImages] = useState<Record<string, boolean>>({});

  const { data: menuImages = [], isLoading } = useQuery<string[]>({
    queryKey: ['user-menu-images', language],
    queryFn: () => userApi.getMenuImages(language),
    enabled: isOpen,
    staleTime: 1000 * 60 * 10,
  });

  const totalPages = menuImages.length;
  const currentImage = menuImages[activePageIndex];
  const isCurrentFailed = Boolean(currentImage && failedImages[currentImage]);

  // Reset zoom on page change
  useEffect(() => {
    setZoomLevel(1);
  }, [activePageIndex]);

  // Keyboard navigation
  const handlePrev = useCallback(() => {
    if (totalPages > 1) {
      setActivePageIndex((prev) => (prev > 0 ? prev - 1 : totalPages - 1));
    }
  }, [totalPages]);

  const handleNext = useCallback(() => {
    if (totalPages > 1) {
      setActivePageIndex((prev) => (prev < totalPages - 1 ? prev + 1 : 0));
    }
  }, [totalPages]);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowRight') {
        handlePrev(); // in RTL, arrow right is previous/forward depending on perspective
      } else if (e.key === 'ArrowLeft') {
        handleNext();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    // Prevent background scrolling
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen, onClose, handlePrev, handleNext]);

  // Zoom helpers
  const handleZoomIn = () => setZoomLevel((prev) => Math.min(prev + 0.3, 2.5));
  const handleZoomOut = () => setZoomLevel((prev) => Math.max(prev - 0.3, 0.7));
  const handleResetZoom = () => setZoomLevel(1);

  if (!isOpen) return null;

  const modalContent = (
    <div
      className="fixed inset-0 z-[99999] flex items-center justify-center p-3 sm:p-5 md:p-8 bg-black/85 backdrop-blur-xl animate-in fade-in duration-200"
      dir="rtl"
      onClick={(e) => {
        // Close if backdrop clicked directly
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="relative w-full max-w-5xl h-[92vh] max-h-[880px] bg-[#0d0d12] border border-white/10 rounded-2xl sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden text-right text-white selection:bg-primary selection:text-white"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header Bar */}
        <div className="px-4 py-3 sm:px-6 sm:py-4 border-b border-white/10 flex items-center justify-between bg-[#13131b] shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-primary/15 border border-primary/25 flex items-center justify-center text-primary shrink-0 shadow-sm">
              <FiBookOpen className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-black text-white flex items-center gap-2">
                <span>المنيو الورقي المصور</span>
                {totalPages > 0 && (
                  <span className="px-2 py-0.5 rounded-full bg-white/10 text-neutral-300 text-[11px] font-mono">
                    {activePageIndex + 1} / {totalPages}
                  </span>
                )}
              </h3>
              <p className="text-[11px] text-neutral-400">
                استعرض صفحات قائمة الطعام الأصلية بدقة عالية
              </p>
            </div>
          </div>

          {/* Action Toolbar */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Zoom Controls */}
            {totalPages > 0 && !isCurrentFailed && (
              <div className="hidden sm:flex items-center bg-white/[0.04] border border-white/10 rounded-xl p-0.5">
                <button
                  type="button"
                  onClick={handleZoomIn}
                  className="p-1.5 rounded-lg hover:bg-white/10 text-neutral-300 hover:text-white transition-colors cursor-pointer"
                  title="تكبير الصورة (+)"
                >
                  <FiZoomIn className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={handleZoomOut}
                  className="p-1.5 rounded-lg hover:bg-white/10 text-neutral-300 hover:text-white transition-colors cursor-pointer"
                  title="تصغير الصورة (-)"
                >
                  <FiZoomOut className="w-4 h-4" />
                </button>
                {zoomLevel !== 1 && (
                  <button
                    type="button"
                    onClick={handleResetZoom}
                    className="p-1.5 rounded-lg hover:bg-white/10 text-neutral-300 hover:text-white transition-colors cursor-pointer text-xs"
                    title="إعادة ضبط الحجم"
                  >
                    <FiRotateCcw className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            )}

            {currentImage && (
              <a
                href={currentImage}
                target="_blank"
                rel="noreferrer"
                className="p-2 rounded-xl bg-white/[0.04] hover:bg-white/10 text-neutral-300 hover:text-white border border-white/10 transition-colors shadow-sm cursor-pointer"
                title="فتح الصورة في تبويب جديد"
              >
                <FiMaximize2 className="w-4 h-4" />
              </a>
            )}

            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl bg-white/[0.04] hover:bg-red-500/20 text-neutral-300 hover:text-red-400 border border-white/10 hover:border-red-500/30 transition-all shadow-sm cursor-pointer"
              aria-label="إغلاق"
              title="إغلاق (Esc)"
            >
              <FiX className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Center Main Stage (Image Area) */}
        <div className="flex-1 overflow-hidden relative flex items-center justify-center bg-black/60 select-none">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center gap-3">
              <FiLoader className="w-10 h-10 animate-spin text-primary" />
              <p className="text-xs text-neutral-400 font-semibold">
                جاري تحميل صفحات المنيو...
              </p>
            </div>
          ) : totalPages > 0 ? (
            <div className="w-full h-full flex items-center justify-center p-3 sm:p-6 overflow-auto">
              {isCurrentFailed ? (
                /* Fallback if backend image URL 404s */
                <div className="p-8 max-w-md rounded-2xl bg-[#161622] border border-white/10 text-center space-y-3 shadow-xl">
                  <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center mx-auto text-xl">
                    <FiAlertCircle className="w-6 h-6" />
                  </div>
                  <h4 className="text-sm font-bold text-white">
                    تعذر عرض الصفحة رقم {activePageIndex + 1}
                  </h4>
                  <p className="text-xs text-neutral-400 leading-relaxed">
                    ملف صورة هذه الصفحة غير متاح حالياً على السيرفر (404). يمكنك الانتقال لتصفح باقي الصفحات المتاحة.
                  </p>
                  {totalPages > 1 && (
                    <button
                      type="button"
                      onClick={handleNext}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-white text-xs font-bold shadow-md cursor-pointer hover:bg-primary/90 transition-all"
                    >
                      <span>الانتقال للصفحة التالية &larr;</span>
                    </button>
                  )}
                </div>
              ) : (
                <div
                  className="transition-transform duration-200 ease-out flex items-center justify-center max-w-full max-h-full"
                  style={{ transform: `scale(${zoomLevel})` }}
                >
                  <img
                    key={currentImage}
                    src={currentImage}
                    alt={`Menu Page ${activePageIndex + 1}`}
                    onError={() => {
                      if (currentImage) {
                        setFailedImages((prev) => ({ ...prev, [currentImage]: true }));
                      }
                    }}
                    className="max-h-[66vh] max-w-full w-auto object-contain rounded-xl shadow-2xl border border-white/10 transition-all"
                  />
                </div>
              )}

              {/* Side Navigation Arrows */}
              {totalPages > 1 && (
                <>
                  <button
                    type="button"
                    onClick={handlePrev}
                    className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 w-11 h-11 rounded-2xl bg-black/75 hover:bg-black text-white hover:text-primary border border-white/15 flex items-center justify-center shadow-2xl transition-all cursor-pointer backdrop-blur-md active:scale-95 group"
                    title="الصفحة السابقة (السهم الأيمن)"
                  >
                    <FiChevronRight className="w-6 h-6 group-hover:scale-110 transition-transform" />
                  </button>

                  <button
                    type="button"
                    onClick={handleNext}
                    className="absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 w-11 h-11 rounded-2xl bg-black/75 hover:bg-black text-white hover:text-primary border border-white/15 flex items-center justify-center shadow-2xl transition-all cursor-pointer backdrop-blur-md active:scale-95 group"
                    title="الصفحة التالية (السهم الأيسر)"
                  >
                    <FiChevronLeft className="w-6 h-6 group-hover:scale-110 transition-transform" />
                  </button>
                </>
              )}
            </div>
          ) : (
            /* Empty State */
            <div className="text-center p-8 max-w-md space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto text-2xl">
                📖
              </div>
              <h4 className="text-base font-bold text-white">
                المنيو الورقي غير متوفر حالياً
              </h4>
              <p className="text-xs text-neutral-400 leading-relaxed">
                لم يتم رفع صور للمنيو الورقي بعد. بإمكانك استعراض الأقسام والمنتجات وتأكيد طلبك مباشرة عبر المتجر الإلكتروني.
              </p>
            </div>
          )}
        </div>

        {/* Bottom Thumbnail Strip */}
        {totalPages > 1 && (
          <div className="p-3 border-t border-white/10 bg-[#13131b] flex items-center justify-center gap-2.5 overflow-x-auto scrollbar-none shrink-0">
            {menuImages.map((img, idx) => {
              const isSelected = activePageIndex === idx;
              const isFailed = Boolean(failedImages[img]);

              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setActivePageIndex(idx)}
                  className={`relative w-14 h-16 sm:w-16 sm:h-20 rounded-xl overflow-hidden border-2 transition-all shrink-0 cursor-pointer flex flex-col items-center justify-center bg-black/40 ${
                    isSelected
                      ? 'border-primary ring-2 ring-primary/40 scale-105 shadow-lg'
                      : 'border-white/10 opacity-60 hover:opacity-100 hover:border-white/30'
                  }`}
                >
                  {isFailed ? (
                    <div className="w-full h-full flex flex-col items-center justify-center text-amber-400 bg-amber-500/10">
                      <FiFileText className="w-5 h-5 mb-0.5" />
                      <span className="text-[9px] font-bold">ص {idx + 1}</span>
                    </div>
                  ) : (
                    <>
                      <img
                        src={img}
                        alt=""
                        onError={() => setFailedImages((prev) => ({ ...prev, [img]: true }))}
                        className="w-full h-full object-cover"
                      />
                      <span className="absolute bottom-0 inset-x-0 bg-black/80 text-[10px] text-white text-center font-bold py-0.5">
                        صفحة {idx + 1}
                      </span>
                    </>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );

  return typeof document !== 'undefined' ? createPortal(modalContent, document.body) : null;
};
