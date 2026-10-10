import React from 'react';
import { FiClock, FiAlertOctagon } from 'react-icons/fi';
import { useBusinessSetup } from '../../hooks/useBusinessSetup';

interface UserClosedBannerProps {
  className?: string;
}

export const UserClosedBanner: React.FC<UserClosedBannerProps> = ({ className = '' }) => {
  const { isClosed, startDay, endDay, workingHoursText } = useBusinessSetup();

  if (!isClosed) return null;

  // Format the text according to guide:
  // "المطعم مغلق الان مواعيد العمل من {start_day} الى {end_day}" (أو استخدام working_hours_text المستلم من الـ API).
  let bannerText = workingHoursText;
  if (!bannerText) {
    if (startDay && endDay) {
      bannerText = `المطعم مغلق الان مواعيد العمل من ${startDay} الى ${endDay}`;
    } else {
      bannerText = 'المطعم مغلق الآن، نعتذر عن استقبال الطلبات في الوقت الحالي';
    }
  } else if (!bannerText.includes('المطعم مغلق')) {
    bannerText = `المطعم مغلق الان ${bannerText}`;
  }

  return (
    <div
      className={`sticky top-14 sm:top-20 z-30 w-full bg-gradient-to-r from-red-600 via-rose-600 to-red-700 text-white shadow-lg shadow-red-950/20 border-b border-red-500/40 py-2.5 px-3 sm:px-6 transition-all duration-300 animate-in slide-in-from-top-2 ${className}`}
      dir="rtl"
    >
      <div className="max-w-7xl mx-auto flex items-center justify-center gap-2.5 text-center">
        <div className="w-6 h-6 rounded-lg bg-white/20 border border-white/30 flex items-center justify-center shrink-0 animate-pulse">
          <FiClock className="w-3.5 h-3.5 text-white" />
        </div>

        <div className="flex items-center gap-2 flex-wrap justify-center text-xs sm:text-sm font-bold tracking-tight">
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-black/25 text-[11px] font-black border border-white/20">
            <FiAlertOctagon className="w-3 h-3 text-red-200" />
            <span>مغلق</span>
          </span>
          <span className="leading-normal">{bannerText}</span>
        </div>
      </div>
    </div>
  );
};

export default UserClosedBanner;
