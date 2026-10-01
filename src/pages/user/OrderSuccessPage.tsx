import React from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  FiCheckCircle,
  FiMapPin,
  FiPhone,
  FiUser,
  FiTruck,
  FiPackage,
  FiArrowRight,
  FiShoppingBag,
  FiLoader,
} from 'react-icons/fi';
import { FaWhatsapp } from 'react-icons/fa6';
import { userApi } from '../../services/userService';
import { useBusinessSetup } from '../../hooks/useBusinessSetup';
import type { UserOrderData } from '../../types/user';

export const OrderSuccessPage: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { business } = useBusinessSetup();

  // Check if order was passed via navigation state
  const stateOrder = location.state?.order as UserOrderData | undefined;
  const distanceKm = location.state?.distance_km as number | undefined;

  // Query order if not available in state or for refresh
  const {
    data: fetchedOrder,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['user-order-detail', orderId],
    queryFn: () => userApi.getOrder(orderId!),
    enabled: Boolean(orderId) && !stateOrder,
    staleTime: 1000 * 60 * 10,
  });

  const order = stateOrder || fetchedOrder;

  // WhatsApp Helper
  const getWhatsAppLink = (orderNum?: number | string) => {
    const raw = business?.whats || business?.phone || '';
    const cleaned = raw.replace(/[^0-9]/g, '');
    if (!cleaned) return null;
    const text = encodeURIComponent(
      `مرحباً، أود الاستفسار عن حالة طلبي رقم #${orderNum || orderId}`
    );
    return `https://wa.me/${cleaned}?text=${text}`;
  };

  const whatsappUrl = getWhatsAppLink(order?.id);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#08080b] flex flex-col items-center justify-center text-slate-800 dark:text-white p-4" dir="rtl">
        <FiLoader className="w-10 h-10 animate-spin text-primary mb-4" />
        <h2 className="text-base font-bold">جاري تحميل تفاصيل الطلب...</h2>
      </div>
    );
  }

  if (isError && !order) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#08080b] flex flex-col items-center justify-center text-slate-800 dark:text-white p-4 text-center" dir="rtl">
        <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-500 text-2xl mb-4">
          ⚠️
        </div>
        <h2 className="text-xl font-bold mb-2">تعذر العثور على الطلب</h2>
        <p className="text-xs text-slate-500 dark:text-neutral-400 max-w-sm mb-6">
          لم نتمكن من الوصول لبيانات الطلب رقم #{orderId}. قد يكون المعرّف غير صحيح.
        </p>
        <button
          type="button"
          onClick={() => navigate('/order')}
          className="px-6 py-2.5 rounded-2xl bg-primary text-white text-xs font-bold shadow-lg shadow-primary/20 cursor-pointer"
        >
          العودة لقائمة الطعام
        </button>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen relative flex flex-col bg-slate-50 dark:bg-[#08080b] text-slate-900 dark:text-white selection:bg-primary selection:text-white transition-colors duration-300"
      dir="rtl"
    >
      {/* Ambient background glows */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-0 right-1/3 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[160px]" />
        <div className="absolute bottom-10 left-1/4 w-[400px] h-[400px] bg-primary/10 rounded-full blur-[140px]" />
      </div>

      <div className="relative z-10 max-w-2xl w-full mx-auto px-3 sm:px-4 py-6 sm:py-16 flex-1 flex flex-col justify-center">
        
        {/* Success Card */}
        <div className="rounded-2xl sm:rounded-3xl bg-white dark:bg-[#121218]/90 border border-slate-200/80 dark:border-white/10 p-4 sm:p-8 shadow-xl dark:shadow-2xl backdrop-blur-xl text-center space-y-4 sm:space-y-6 animate-in zoom-in-95 duration-400">
          
          {/* Animated Celebration Icon */}
          <div className="relative inline-flex items-center justify-center">
            <div className="absolute inset-0 rounded-full bg-emerald-500/20 blur-xl animate-pulse" />
            <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 border border-emerald-400/40 flex items-center justify-center text-white shadow-xl shadow-emerald-500/20">
              <FiCheckCircle className="w-8 h-8 sm:w-10 sm:h-10 stroke-[2.5]" />
            </div>
          </div>

          {/* Title & Order ID */}
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-bold mb-2.5 sm:mb-3">
              <span>تم إنشاء الطلب بنجاح</span>
            </div>

            <h1 className="text-xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              شكراً لك، تم استلام طلبك!
            </h1>

            <p className="text-xs sm:text-sm text-slate-600 dark:text-neutral-300 mt-1.5 sm:mt-2">
              رقم الطلب الخاص بك:{' '}
              <span className="font-mono font-black text-primary text-sm sm:text-base">
                #{order?.id || orderId}
              </span>
            </p>
          </div>

          {/* Quick Info Grid */}
          <div className="grid grid-cols-2 gap-3 text-right bg-slate-50 dark:bg-white/[0.02] p-4 rounded-2xl border border-slate-200/60 dark:border-white/5 text-xs">
            <div>
              <span className="text-slate-500 dark:text-neutral-400 block mb-1">نوع الطلب</span>
              <div className="flex items-center gap-1.5 font-bold text-slate-900 dark:text-white">
                {order?.module === 'delivery' ? (
                  <>
                    <FiTruck className="w-3.5 h-3.5 text-primary" />
                    <span>توصيل للمنزل</span>
                  </>
                ) : (
                  <>
                    <FiPackage className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    <span>استلام من الفرع</span>
                  </>
                )}
              </div>
            </div>

            <div>
              <span className="text-slate-500 dark:text-neutral-400 block mb-1">الفرع المسؤول</span>
              <div className="flex items-center gap-1.5 font-bold text-slate-900 dark:text-white">
                <FiMapPin className="w-3.5 h-3.5 text-primary" />
                <span>{order?.branch?.name || 'الفرع الرئيسي'}</span>
                {distanceKm !== undefined && (
                  <span className="text-[10px] text-slate-400 dark:text-neutral-400 font-normal">
                    ({distanceKm} كم)
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Customer & Address Details */}
          {order && (
            <div className="bg-slate-50 dark:bg-white/[0.02] p-4 rounded-2xl border border-slate-200/60 dark:border-white/5 text-right text-xs space-y-2.5">
              <div className="flex items-center justify-between border-b border-slate-200/60 dark:border-white/5 pb-2">
                <span className="text-slate-500 dark:text-neutral-400 flex items-center gap-1.5">
                  <FiUser className="w-3.5 h-3.5 text-slate-400 dark:text-neutral-500" />
                  <span>اسم المستلم:</span>
                </span>
                <span className="font-bold text-slate-900 dark:text-white">{order.name}</span>
              </div>

              <div className="flex items-center justify-between border-b border-slate-200/60 dark:border-white/5 pb-2">
                <span className="text-slate-500 dark:text-neutral-400 flex items-center gap-1.5">
                  <FiPhone className="w-3.5 h-3.5 text-slate-400 dark:text-neutral-500" />
                  <span>رقم الهاتف:</span>
                </span>
                <span className="font-bold text-slate-900 dark:text-white" dir="ltr">{order.phone}</span>
              </div>

              <div className="flex items-start justify-between">
                <span className="text-slate-500 dark:text-neutral-400 flex items-center gap-1.5 shrink-0">
                  <FiMapPin className="w-3.5 h-3.5 text-slate-400 dark:text-neutral-500" />
                  <span>عنوان التوصيل:</span>
                </span>
                <span className="font-semibold text-slate-700 dark:text-neutral-200 text-left max-w-xs leading-relaxed">
                  {order.address}
                </span>
              </div>

              {order.note && (
                <div className="pt-2 border-t border-slate-200/60 dark:border-white/5 text-amber-600 dark:text-amber-300/90 italic">
                  ملاحظة: {order.note}
                </div>
              )}
            </div>
          )}

          {/* Total Payment Breakdown */}
          {order && (
            <div className="bg-slate-100 dark:bg-[#0e0e14] p-4 rounded-2xl border border-slate-200/60 dark:border-white/5 text-xs space-y-2 text-right">
              <div className="flex justify-between text-slate-500 dark:text-neutral-400">
                <span>إجمالي المنتجات</span>
                <span className="text-slate-900 dark:text-white font-semibold">
                  {Number(order.total).toFixed(2)} ج.م
                </span>
              </div>

              {order.total_discount > 0 && (
                <div className="flex justify-between text-emerald-600 dark:text-emerald-400">
                  <span>الخصم</span>
                  <span className="font-semibold">
                    - {Number(order.total_discount).toFixed(2)} ج.م
                  </span>
                </div>
              )}

              {order.total_tax > 0 && (
                <div className="flex justify-between text-slate-500 dark:text-neutral-400">
                  <span>الضريبة المضافة</span>
                  <span className="text-slate-900 dark:text-white font-semibold">
                    {Number(order.total_tax).toFixed(2)} ج.م
                  </span>
                </div>
              )}

              <div className="pt-2 border-t border-slate-200 dark:border-white/10 flex justify-between items-baseline text-slate-900 dark:text-white">
                <span className="text-sm font-bold">المبلغ المطلوب سداده</span>
                <div className="flex items-baseline gap-1">
                  <span className="text-xl font-black text-primary">
                    {Number(order.final_price).toFixed(2)}
                  </span>
                  <span className="text-xs font-bold text-slate-500 dark:text-neutral-400">ج.م</span>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-2.5 pt-2">
            {whatsappUrl && (
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 font-bold text-xs sm:text-sm transition-all shadow-sm"
              >
                <FaWhatsapp className="w-4 h-4" />
                <span>متابعة الطلب عبر واتساب المطعم</span>
              </a>
            )}

            <button
              type="button"
              onClick={() => navigate('/order')}
              className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-2xl bg-gradient-to-r from-primary to-indigo-600 hover:from-primary/90 hover:to-indigo-500 text-white font-bold text-xs sm:text-sm shadow-xl shadow-primary/25 transition-all cursor-pointer"
            >
              <FiShoppingBag className="w-4 h-4" />
              <span>طلب جديد من القائمة</span>
            </button>

            <button
              type="button"
              onClick={() => navigate('/')}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-white/[0.03] dark:hover:bg-white/[0.08] text-slate-600 hover:text-slate-900 dark:text-neutral-400 dark:hover:text-white text-xs font-semibold transition-all cursor-pointer"
            >
              <FiArrowRight className="w-3.5 h-3.5" />
              <span>العودة إلى الصفحة الرئيسية</span>
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default OrderSuccessPage;
