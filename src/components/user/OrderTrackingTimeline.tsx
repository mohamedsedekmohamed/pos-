import React from 'react';
import {
  FiCheck,
  FiShoppingBag,
  FiPackage,
  FiCheckCircle,
  FiXCircle,
  FiAlertTriangle,
} from 'react-icons/fi';
import { FaUtensils, FaMotorcycle } from 'react-icons/fa6';
import type { UserOrderStatus, UserOrderModule } from '../../types/user';

interface OrderTrackingTimelineProps {
  status?: UserOrderStatus;
  module?: UserOrderModule;
  orderId?: number | string;
  className?: string;
}

interface TimelineStep {
  key: UserOrderStatus;
  label: string;
  description: string;
  icon: React.ReactNode;
  activeColor: string;
  badgeBg: string;
}

export const OrderTrackingTimeline: React.FC<OrderTrackingTimelineProps> = ({
  status,
  module = 'delivery',
  className = '',
}) => {
  // ── Determine default status if null / undefined ──
  // Guide: delivery / takeaway default to "preparing", dine-in defaults to "pickup"
  const activeStatus: UserOrderStatus =
    status || (module === 'dinein' ? 'pickup' : 'preparing');

  // Handle special end states
  const isCanceledOrReturned = activeStatus === 'return';
  const isFailedDelivery = activeStatus === 'failed_to_delivered';

  // ── Steps for Delivery ──
  const deliverySteps: TimelineStep[] = [
    {
      key: 'preparing',
      label: 'جاري التحضير',
      description: 'في المطبخ الآن',
      icon: <FaUtensils className="w-4 h-4" />,
      activeColor: 'text-amber-500 border-amber-500 bg-amber-500/10',
      badgeBg: 'bg-amber-500 text-white',
    },
    {
      key: 'done',
      label: 'تم التجهيز',
      description: 'في انتظار مندوب التوصيل',
      icon: <FiPackage className="w-4 h-4" />,
      activeColor: 'text-blue-500 border-blue-500 bg-blue-500/10',
      badgeBg: 'bg-blue-500 text-white',
    },
    {
      key: 'out_of_delivery',
      label: 'في الطريق إليك',
      description: 'الطيار في طريقه إلى موقعك',
      icon: <FaMotorcycle className="w-4 h-4" />,
      activeColor: 'text-orange-500 border-orange-500 bg-orange-500/10',
      badgeBg: 'bg-orange-500 text-white',
    },
    {
      key: 'delivered',
      label: 'تم التوصيل',
      description: 'بالهناء والشفاء',
      icon: <FiCheckCircle className="w-4 h-4" />,
      activeColor: 'text-emerald-500 border-emerald-500 bg-emerald-500/10',
      badgeBg: 'bg-emerald-500 text-white',
    },
  ];

  // ── Steps for Takeaway ──
  const takeawaySteps: TimelineStep[] = [
    {
      key: 'preparing',
      label: 'جاري التحضير',
      description: 'في المطبخ الآن',
      icon: <FaUtensils className="w-4 h-4" />,
      activeColor: 'text-amber-500 border-amber-500 bg-amber-500/10',
      badgeBg: 'bg-amber-500 text-white',
    },
    {
      key: 'done',
      label: 'تم التجهيز',
      description: 'تم تجهيز وجبتك بنجاح',
      icon: <FiCheck className="w-4 h-4" />,
      activeColor: 'text-blue-500 border-blue-500 bg-blue-500/10',
      badgeBg: 'bg-blue-500 text-white',
    },
    {
      key: 'pickup',
      label: 'تفضل بالاستلام',
      description: 'طلبك جاهز للتسليم في الفرع',
      icon: <FiShoppingBag className="w-4 h-4" />,
      activeColor: 'text-purple-500 border-purple-500 bg-purple-500/10',
      badgeBg: 'bg-purple-600 text-white',
    },
  ];

  // ── Steps for Dine-in ──
  const dineinSteps: TimelineStep[] = [
    {
      key: 'pickup',
      label: 'تم تقديم الطلب',
      description: 'نزل الطلب على الطاولة بالهناء والشفاء',
      icon: <FaUtensils className="w-4 h-4" />,
      activeColor: 'text-emerald-500 border-emerald-500 bg-emerald-500/10',
      badgeBg: 'bg-emerald-500 text-white',
    },
  ];

  const steps =
    module === 'takeaway'
      ? takeawaySteps
      : module === 'dinein'
      ? dineinSteps
      : deliverySteps;

  const currentStepIndex = steps.findIndex((s) => s.key === activeStatus);

  // Active status badge info
  const getStatusBadge = () => {
    switch (activeStatus) {
      case 'preparing':
        return {
          title: '🟡 جاري التحضير في المطبخ',
          desc: 'فريق العمل يقوم بتحضير طلبك بعناية واهتمام.',
          theme: 'bg-amber-500/10 border-amber-500/30 text-amber-600 dark:text-amber-400',
        };
      case 'done':
        return {
          title: '🔵 تم التجهيز بالكامل',
          desc:
            module === 'delivery'
              ? 'تم تجهيز الطلب وفي انتظار تسليمه لمندوب التوصيل.'
              : 'طلبك مجهز بالكامل وجاهز للتسليم.',
          theme: 'bg-blue-500/10 border-blue-500/30 text-blue-600 dark:text-blue-400',
        };
      case 'out_of_delivery':
        return {
          title: '🟠 في الطريق إليك الآن',
          desc: 'مندوب التوصيل استلم الطلب وهو في طريقه إلى عنوانك.',
          theme: 'bg-orange-500/10 border-orange-500/30 text-orange-600 dark:text-orange-400',
        };
      case 'delivered':
        return {
          title: '🟢 تم تسليم الطلب بنجاح',
          desc: 'نتمنى لك وجبة هنيئة ونسعد بخدمتك دائماً!',
          theme: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400',
        };
      case 'pickup':
        return {
          title:
            module === 'dinein'
              ? '🟢 نزل على الطاولة'
              : '🟣 تفضل بالاستلام من الفرع',
          desc:
            module === 'dinein'
              ? 'الطلب متوفر الآن على طاولتك بالهناء والشفاء.'
              : 'طلبك جاهز تماماً للاستلام، ننتظرك في أقرب وقت.',
          theme:
            module === 'dinein'
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400'
              : 'bg-purple-500/10 border-purple-500/30 text-purple-600 dark:text-purple-400',
        };
      case 'failed_to_delivered':
        return {
          title: '🔴 تعذر تسليم الطلب',
          desc: 'تعذر الوصول إلى العنوان أو لم يتم الرد على مندوب التوصيل.',
          theme: 'bg-red-500/10 border-red-500/30 text-red-600 dark:text-red-400',
        };
      case 'return':
        return {
          title: '⚪ الطلب ملغى أو مرتجع',
          desc: 'تم إلغاء هذا الطلب أو إرجاعه، يرجى التواصل مع المطعم للاستفسار.',
          theme: 'bg-slate-500/10 border-slate-500/30 text-slate-600 dark:text-slate-400',
        };
      default:
        return {
          title: 'جاري متابعة الطلب',
          desc: 'طلبك قيد المتابعة حالياً في المطعم.',
          theme: 'bg-primary/10 border-primary/30 text-primary',
        };
    }
  };

  const badge = getStatusBadge();

  return (
    <div
      className={`rounded-3xl bg-white dark:bg-[#121218]/90 border border-slate-200/80 dark:border-white/10 p-4 sm:p-6 shadow-xl backdrop-blur-xl text-right transition-all duration-300 ${className}`}
      dir="rtl"
    >
      {/* ── Status Header Card ── */}
      <div className={`p-3.5 sm:p-4 rounded-2xl border ${badge.theme} mb-6 transition-all`}>
        <div className="flex items-start gap-3">
          <div className="flex-1 min-w-0">
            <h3 className="text-sm sm:text-base font-black tracking-tight mb-1">
              {badge.title}
            </h3>
            <p className="text-xs sm:text-sm font-medium leading-relaxed opacity-90">
              {badge.desc}
            </p>
          </div>
        </div>
      </div>

      {/* ── Irregular status notification: Failed or Returned ── */}
      {isFailedDelivery && (
        <div className="mb-6 p-4 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 flex items-center gap-3">
          <FiAlertTriangle className="w-5 h-5 shrink-0" />
          <span className="text-xs sm:text-sm font-bold">
            حدث تعثر في توصيل الطلب. يرجى التواصل مع الفرع عبر واتساب لتأكيد موعد آخر.
          </span>
        </div>
      )}

      {isCanceledOrReturned && (
        <div className="mb-6 p-4 rounded-2xl bg-slate-500/10 border border-slate-500/30 text-slate-600 dark:text-slate-300 flex items-center gap-3">
          <FiXCircle className="w-5 h-5 shrink-0" />
          <span className="text-xs sm:text-sm font-bold">
            تم تسجيل الطلب كمرتجع / ملغي. لأي استفسار يسعدنا تواصلك مع خدمة العملاء.
          </span>
        </div>
      )}

      {/* ── Normal Stepper Progress Timeline ── */}
      {!isCanceledOrReturned && !isFailedDelivery && steps.length > 1 && (
        <div className="relative pt-2 pb-2">
          {/* Progress Bar line behind items */}
          <div className="absolute top-7 right-8 left-8 h-1 bg-slate-200 dark:bg-white/10 -z-0">
            <div
              className="h-full bg-gradient-to-l from-primary to-emerald-500 transition-all duration-700 ease-out"
              style={{
                width: `${
                  currentStepIndex >= 0
                    ? (currentStepIndex / (steps.length - 1)) * 100
                    : 0
                }%`,
              }}
            />
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 relative z-10">
            {steps.map((step, idx) => {
              const isPassed = currentStepIndex > idx;
              const isCurrent = currentStepIndex === idx;

              return (
                <div key={step.key} className="flex flex-col items-center text-center group">
                  {/* Step Bubble Icon */}
                  <div
                    className={`w-11 h-11 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center transition-all duration-500 relative mb-2.5 ${
                      isCurrent
                        ? `${step.badgeBg} shadow-lg ring-4 ring-primary/20 scale-110 animate-bounce-gentle`
                        : isPassed
                        ? 'bg-emerald-500 text-white shadow-md'
                        : 'bg-slate-100 dark:bg-[#1a1a24] text-slate-400 dark:text-neutral-500 border border-slate-200 dark:border-white/10'
                    }`}
                  >
                    {isPassed ? (
                      <FiCheck className="w-5 h-5 stroke-[3]" />
                    ) : (
                      step.icon
                    )}

                    {/* Current ping pulse */}
                    {isCurrent && (
                      <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-primary animate-ping" />
                    )}
                  </div>

                  {/* Step Titles */}
                  <span
                    className={`text-[11px] sm:text-xs font-black mb-0.5 transition-colors line-clamp-1 ${
                      isCurrent
                        ? 'text-primary dark:text-white'
                        : isPassed
                        ? 'text-slate-800 dark:text-neutral-200'
                        : 'text-slate-400 dark:text-neutral-500'
                    }`}
                  >
                    {step.label}
                  </span>

                  <span className="text-[9px] sm:text-[10px] text-slate-400 dark:text-neutral-500 line-clamp-1 hidden sm:block">
                    {step.description}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderTrackingTimeline;
