import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  FiX,
  FiMapPin,
  FiPhone,
  FiUser,
  FiFileText,
  FiTruck,
  FiPackage,
  FiCheckCircle,
  FiAlertTriangle,
  FiLoader,
  FiNavigation,
  FiCreditCard,
  FiDollarSign,
  FiUploadCloud,
  FiImage,
  FiTrash2,
} from 'react-icons/fi';
import { userApi } from '../../services/userService';
import { useUserCart } from '../../context/UserCartContext';
import { useUserUUID } from '../../hooks/useUserUUID';
import { useBusinessSetup } from '../../hooks/useBusinessSetup';
import type { UserPaymentMethod } from '../../types/user';

interface UserCheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const DEFAULT_PAYMENT_METHODS: UserPaymentMethod[] = [
  { id: 1, name: 'نقداً عند الاستلام', is_cash: true },
  { id: 2, name: 'فودافون كاش / إنستاباي', is_cash: false },
];

export const UserCheckoutModal: React.FC<UserCheckoutModalProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const { uuId } = useUserUUID();
  const { module, setModule, grandTotals, itemCount, clearCart } = useUserCart();
  const { isClosed, workingHoursText } = useBusinessSetup();

  // Form State
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [note, setNote] = useState('');
  const [lat, setLat] = useState<number | null>(null);
  const [lng, setLng] = useState<number | null>(null);

  // Payment State
  const [selectedMethodId, setSelectedMethodId] = useState<number | null>(null);
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [receiptPreview, setReceiptPreview] = useState<string | null>(null);

  // Query Payment Methods
  const { data: paymentMethods = [] } = useQuery<UserPaymentMethod[]>({
    queryKey: ['user-payment-methods'],
    queryFn: () => userApi.getPaymentMethods(),
    enabled: isOpen,
    staleTime: 1000 * 60 * 5,
  });

  const availableMethods = paymentMethods.length > 0 ? paymentMethods : DEFAULT_PAYMENT_METHODS;
  const selectedMethod = availableMethods.find((m) => m.id === selectedMethodId) || availableMethods[0];

  // Auto select default cash payment method
  useEffect(() => {
    if (availableMethods.length > 0 && selectedMethodId === null) {
      const defaultCash = availableMethods.find((m) => m.is_cash);
      setSelectedMethodId(defaultCash ? defaultCash.id : availableMethods[0].id);
    }
  }, [availableMethods, selectedMethodId]);

  // Clean up receipt state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setReceiptFile(null);
      setReceiptPreview(null);
      setErrorMessage(null);
      setOutOfRangeData(null);
    }
  }, [isOpen]);

  // GPS State
  const [isLocating, setIsLocating] = useState(false);
  const [locationStatus, setLocationStatus] = useState<string | null>(null);

  // Submission State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [outOfRangeData, setOutOfRangeData] = useState<{
    distance?: number;
    max_cover?: number;
  } | null>(null);

  // Load saved contact info from localStorage if available
  useEffect(() => {
    try {
      const savedName = localStorage.getItem('pos_user_name');
      const savedPhone = localStorage.getItem('pos_user_phone');
      const savedAddress = localStorage.getItem('pos_user_address');
      if (savedName) setName(savedName);
      if (savedPhone) setPhone(savedPhone);
      if (savedAddress) setAddress(savedAddress);
    } catch {
      // Ignore
    }
  }, []);

  // Request browser geolocation
  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      setLocationStatus('المتصفح لا يدعم تحديد الموقع الجغرافي');
      return;
    }

    setIsLocating(true);
    setLocationStatus('جاري تحديد موقعك بدقة عالية...');

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setLat(latitude);
        setLng(longitude);
        setIsLocating(false);
        setLocationStatus('تم تحديد إحداثيات موقعك بنجاح ✅');
        setErrorMessage(null);
        setOutOfRangeData(null);
      },
      (error) => {
        setIsLocating(false);
        let errorMsg = 'تعذر الوصول إلى موقعك الحالي.';
        if (error.code === error.PERMISSION_DENIED) {
          errorMsg = 'تم رفض إذن تحديد الموقع. يرجى السماح بالوصول للموقع للمتابعة.';
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          errorMsg = 'معلومات الموقع غير متاحة حالياً.';
        } else if (error.code === error.TIMEOUT) {
          errorMsg = 'انتهت مهلة طلب تحديد الموقع.';
        }
        setLocationStatus(errorMsg);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  // Handle Receipt File Upload
  const handleReceiptChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setErrorMessage('يجب أن يكون إيصال الدفع ملف صورة (JPG, PNG, WebP)');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setErrorMessage('حجم صورة الإيصال يجب ألا يتجاوز 5 ميجابايت');
        return;
      }
      setReceiptFile(file);
      setErrorMessage(null);
      const reader = new FileReader();
      reader.onload = (ev) => {
        setReceiptPreview(ev.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveReceipt = () => {
    setReceiptFile(null);
    setReceiptPreview(null);
  };

  // Auto trigger location request once modal opens if delivery module
  useEffect(() => {
    if (isOpen && module === 'delivery' && lat === null) {
      handleGetLocation();
    }
  }, [isOpen, module]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setOutOfRangeData(null);

    if (isClosed) {
      setErrorMessage(
        workingHoursText
          ? `المطعم مغلق الان ${workingHoursText}`
          : 'المطعم مغلق حالياً، نعتذر عن استقبال الطلبات في الوقت الحالي.'
      );
      return;
    }

    // Validation
    if (!name.trim()) {
      setErrorMessage('يرجى إدخال اسم العميل');
      return;
    }

    if (!phone.trim()) {
      setErrorMessage('يرجى إدخال رقم الهاتف للتواصل');
      return;
    }

    if (!address.trim()) {
      setErrorMessage('يرجى كتابة تفاصيل العنوان');
      return;
    }

    const effectiveMethodId = selectedMethodId || (availableMethods[0] ? availableMethods[0].id : 1);
    const activeMethod = availableMethods.find((m) => m.id === effectiveMethodId);

    // If electronic payment (non-cash), receipt is required
    if (activeMethod && !activeMethod.is_cash && !receiptFile) {
      setErrorMessage('إيصال الدفع مطلوب عند اختيار طريقة دفع غير نقدية. يرجى إرفاق صورة إيصال التحويل.');
      return;
    }

    // Default to fallback coordinates if user hasn't gotten GPS yet
    const finalLat = lat ?? 29.965;
    const finalLng = lng ?? 31.258;

    setIsSubmitting(true);

    try {
      // Save contact info for future orders
      try {
        localStorage.setItem('pos_user_name', name.trim());
        localStorage.setItem('pos_user_phone', phone.trim());
        localStorage.setItem('pos_user_address', address.trim());
      } catch {
        // Ignore
      }

      const res = await userApi.checkout({
        uu_id: uuId,
        payment_method_id: effectiveMethodId,
        receipt: receiptFile,
        lat: finalLat,
        lng: finalLng,
        address: address.trim(),
        phone: phone.trim(),
        name: name.trim(),
        note: note.trim() || undefined,
        module,
      });

      if (res.status && res.data) {
        // Clear local cart
        await clearCart();
        onClose();
        // Redirect to success page
        navigate(`/order/success/${res.data.id}`, {
          state: { order: res.data, distance_km: res.distance_km },
        });
      } else {
        setErrorMessage(res.message || 'حدث خطأ غير متوقع أثناء إتمام الطلب');
      }
    } catch (err: any) {
      const responseData = err.response?.data;
      if (err.response?.status === 422) {
        if (responseData?.distance !== undefined && responseData?.max_cover !== undefined) {
          // Out of delivery coverage range
          setErrorMessage(
            responseData?.message ||
              'عذراً، موقعك الحالي خارج نطاق التوصيل المتاح لأقرب فرع.'
          );
          setOutOfRangeData({
            distance: responseData?.distance,
            max_cover: responseData?.max_cover,
          });
        } else {
          // Validation error (payment method or receipt)
          const validationMsg =
            responseData?.errors?.receipt?.[0] ||
            responseData?.errors?.payment_method_id?.[0] ||
            responseData?.message ||
            'يرجى التحقق من صحة البيانات المدخلة وطريقة الدفع.';
          setErrorMessage(validationMsg);
        }
      } else {
        setErrorMessage(
          responseData?.message ||
            'تعذر إتمام الطلب، يرجى التأكد من البيانات أو مراجعة سلة الطلبات.'
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/60 dark:bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-lg max-h-[94vh] sm:max-h-[92vh] bg-white dark:bg-[#121218] border border-slate-200 dark:border-white/10 rounded-2xl sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden text-right text-slate-900 dark:text-white transition-colors"
        dir="rtl"
      >
        {/* Header */}
        <div className="p-3.5 sm:p-5 border-b border-slate-200 dark:border-white/10 flex items-center justify-between bg-slate-50 dark:bg-[#15151e]">
          <div className="flex items-center gap-2 sm:gap-2.5">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-primary to-indigo-600 flex items-center justify-center text-white shadow-md shadow-primary/20 shrink-0">
              <FiCheckCircle className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div>
              <h2 className="text-sm sm:text-lg font-bold text-slate-900 dark:text-white">
                إتمام وتأكيد الطلب
              </h2>
              <p className="text-[11px] sm:text-xs text-slate-500 dark:text-neutral-400">
                {itemCount} أصناف • الإجمالي: {grandTotals.grand_final_price.toFixed(2)} ج.م
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 sm:p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-white/[0.04] dark:hover:bg-white/[0.08] text-slate-600 dark:text-neutral-300 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-white/10 transition-all"
            aria-label="إغلاق"
          >
            <FiX className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>

        {/* Scrollable Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3.5 sm:space-y-4 no-scrollbar">
          
          {/* Module Selector */}
          <div className="flex items-center bg-slate-100 dark:bg-[#0e0e13] p-0.5 sm:p-1 rounded-xl sm:rounded-2xl border border-slate-200 dark:border-white/10">
            <button
              type="button"
              onClick={() => {
                setModule('delivery');
                setErrorMessage(null);
                setOutOfRangeData(null);
              }}
              className={`flex-1 flex items-center justify-center gap-1.5 sm:gap-2 py-2 sm:py-2.5 rounded-lg sm:rounded-xl text-xs sm:text-sm font-bold transition-all ${
                module === 'delivery'
                  ? 'bg-primary text-white shadow-md shadow-primary/20'
                  : 'text-slate-600 dark:text-neutral-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <FiTruck className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span>توصيل للمنزل</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setModule('takeaway');
                setErrorMessage(null);
                setOutOfRangeData(null);
              }}
              className={`flex-1 flex items-center justify-center gap-1.5 sm:gap-2 py-2 sm:py-2.5 rounded-lg sm:rounded-xl text-xs sm:text-sm font-bold transition-all ${
                module === 'takeaway'
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                  : 'text-slate-600 dark:text-neutral-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <FiPackage className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span>استلام من الفرع</span>
            </button>
          </div>

          {/* Out of range alert with switch action */}
          {outOfRangeData && (
            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-800 dark:text-amber-300 space-y-2 animate-in fade-in">
              <div className="flex items-start gap-2.5">
                <FiAlertTriangle className="w-5 h-5 shrink-0 text-amber-500 dark:text-amber-400 mt-0.5" />
                <div className="text-xs leading-relaxed">
                  <p className="font-bold mb-1">الموقع خارج نطاق التوصيل المباشر</p>
                  <p>
                    المسافة الحالية ({outOfRangeData.distance || 0} كم) تتجاوز الحد الأقصى للتوصيل ({outOfRangeData.max_cover || 5} كم).
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setModule('takeaway');
                  setErrorMessage(null);
                  setOutOfRangeData(null);
                }}
                className="w-full mt-2 py-2 px-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-black text-xs font-black transition-all cursor-pointer"
              >
                تغيير الطلب إلى "استلام من الفرع" والمتابعة
              </button>
            </div>
          )}

          {/* Error Message */}
          {errorMessage && !outOfRangeData && (
            <div className="p-3 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-500 dark:text-red-400 text-xs font-bold flex items-center gap-2">
              <FiAlertTriangle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Full Name */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-neutral-300 flex items-center gap-1.5">
              <FiUser className="w-3.5 h-3.5 text-primary" />
              <span>اسم العميل <span className="text-red-500">*</span></span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="مثال: أحمد يحيى"
              className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white text-xs placeholder:text-slate-400 dark:placeholder:text-neutral-500 focus:outline-none focus:border-primary transition-all"
            />
          </div>

          {/* Phone Number */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-neutral-300 flex items-center gap-1.5">
              <FiPhone className="w-3.5 h-3.5 text-primary" />
              <span>رقم الهاتف <span className="text-red-500">*</span></span>
            </label>
            <input
              type="tel"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="01012345678"
              className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white text-xs placeholder:text-slate-400 dark:placeholder:text-neutral-500 focus:outline-none focus:border-primary transition-all text-left"
              dir="ltr"
            />
          </div>

          {/* GPS Location Button */}
          {module === 'delivery' && (
            <div className="p-3.5 rounded-2xl bg-primary/5 border border-primary/20 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800 dark:text-white flex items-center gap-1.5">
                  <FiNavigation className="w-3.5 h-3.5 text-primary" />
                  <span>تحديد موقع التوصيل الجغرافي</span>
                </span>
                {lat && lng && (
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold">
                    تم التحديد ✅
                  </span>
                )}
              </div>

              <button
                type="button"
                onClick={handleGetLocation}
                disabled={isLocating}
                className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-white dark:bg-white/[0.05] hover:bg-slate-100 dark:hover:bg-white/[0.1] border border-slate-200 dark:border-white/10 text-slate-800 dark:text-white text-xs font-semibold transition-all disabled:opacity-50 cursor-pointer shadow-sm"
              >
                {isLocating ? (
                  <>
                    <FiLoader className="w-3.5 h-3.5 animate-spin text-primary" />
                    <span>جاري جلب إحداثيات GPS...</span>
                  </>
                ) : (
                  <>
                    <FiMapPin className="w-3.5 h-3.5 text-primary" />
                    <span>{lat ? 'إعادة تحديد موقعي الحالي (GPS)' : 'تحديد موقعي الحالي تلقائياً'}</span>
                  </>
                )}
              </button>

              {locationStatus && (
                <p className="text-[11px] text-slate-500 dark:text-neutral-400 leading-tight">
                  {locationStatus}
                </p>
              )}
            </div>
          )}

          {/* Detailed Address */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-neutral-300 flex items-center gap-1.5">
              <FiMapPin className="w-3.5 h-3.5 text-primary" />
              <span>
                {module === 'delivery' ? 'تفاصيل عنوان التوصيل' : 'العنوان / المنطقة'}{' '}
                <span className="text-red-500">*</span>
              </span>
            </label>
            <textarea
              required
              rows={2}
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="مثال: المعادي، شارع 9، عمارة 15، الدور 3، شقة 6"
              className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white text-xs placeholder:text-slate-400 dark:placeholder:text-neutral-500 focus:outline-none focus:border-primary transition-all resize-none"
            />
          </div>

          {/* Order Note */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-neutral-300 flex items-center gap-1.5">
              <FiFileText className="w-3.5 h-3.5 text-slate-400 dark:text-neutral-400" />
              <span>ملاحظات إضافية للطلب أو التوصيل (اختياري)</span>
            </label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="مثال: يرجى ترك الطلب عند الباب، أو الاتصال قبل الوصول"
              className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white text-xs placeholder:text-slate-400 dark:placeholder:text-neutral-500 focus:outline-none focus:border-primary transition-all"
            />
          </div>

          {/* ── Payment Methods Selector ── */}
          <div className="space-y-2 pt-2 border-t border-slate-200/60 dark:border-white/10">
            <label className="text-xs font-bold text-slate-700 dark:text-neutral-300 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <FiCreditCard className="w-3.5 h-3.5 text-primary" />
                <span>طريقة الدفع <span className="text-red-500">*</span></span>
              </span>
              {selectedMethod && (
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  selectedMethod.is_cash
                    ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                    : 'bg-primary/10 text-primary border border-primary/20'
                }`}>
                  {selectedMethod.is_cash ? 'دفع نقدي' : 'دفع إلكتروني (يتطلب إيصال)'}
                </span>
              )}
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {availableMethods.map((method) => {
                const isSelected = selectedMethod.id === method.id;
                return (
                  <button
                    key={method.id}
                    type="button"
                    onClick={() => {
                      setSelectedMethodId(method.id);
                      setErrorMessage(null);
                    }}
                    className={`flex items-center justify-between p-3 rounded-2xl border text-right transition-all cursor-pointer ${
                      isSelected
                        ? 'border-primary bg-primary/10 dark:bg-primary/15 shadow-sm ring-1 ring-primary'
                        : 'border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/[0.03] hover:border-slate-300 dark:hover:border-white/20'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                        method.is_cash
                          ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                          : 'bg-primary/15 text-primary'
                      }`}>
                        {method.icon ? (
                          <img src={method.icon} alt="" className="w-5 h-5 object-contain" />
                        ) : method.is_cash ? (
                          <FiDollarSign className="w-4 h-4" />
                        ) : (
                          <FiCreditCard className="w-4 h-4" />
                        )}
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-800 dark:text-white leading-tight">
                          {typeof method.name === 'object'
                            ? (method.name as any)?.ar || (method.name as any)?.en
                            : method.name}
                        </p>
                        <p className="text-[10px] text-slate-400 dark:text-neutral-400 mt-0.5">
                          {method.is_cash ? 'عند الاستلام' : 'تحويل / محفظة'}
                        </p>
                      </div>
                    </div>

                    <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                      isSelected
                        ? 'border-primary bg-primary text-white'
                        : 'border-slate-300 dark:border-white/20'
                    }`}>
                      {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* ── Receipt Upload Box (Shown when is_cash is false) ── */}
          {selectedMethod && !selectedMethod.is_cash && (
            <div className="p-3.5 rounded-2xl bg-amber-500/5 dark:bg-amber-500/10 border border-amber-500/25 space-y-2.5 animate-in fade-in duration-200">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-700 dark:text-amber-300 flex items-center gap-1.5">
                  <FiUploadCloud className="w-4 h-4 text-amber-500" />
                  <span>إرفاق إيصال التحويل (صورة) <span className="text-red-500">*</span></span>
                </span>
                <span className="text-[10px] text-amber-600 dark:text-amber-400/90 font-medium">
                  مطلوب لإتمام الطلب
                </span>
              </div>

              {receiptPreview ? (
                <div className="relative rounded-xl border border-amber-500/30 overflow-hidden bg-white dark:bg-black/40 p-2.5 flex items-center justify-between gap-3 shadow-sm">
                  <div className="flex items-center gap-2.5 overflow-hidden">
                    <img
                      src={receiptPreview}
                      alt="Receipt Preview"
                      className="w-12 h-12 object-cover rounded-lg border border-slate-200 dark:border-white/10 shrink-0"
                    />
                    <div className="overflow-hidden">
                      <p className="text-xs font-bold text-slate-800 dark:text-white truncate">
                        {receiptFile?.name || 'receipt.jpg'}
                      </p>
                      <p className="text-[10px] text-slate-400 dark:text-neutral-400">
                        {receiptFile ? (receiptFile.size / 1024).toFixed(0) + ' KB' : ''} • تم إرفاق صورة الإيصال بنجاح
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleRemoveReceipt}
                    className="p-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-500 transition-colors shrink-0 cursor-pointer"
                    title="حذف الإيصال"
                  >
                    <FiTrash2 className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-amber-500/40 hover:border-amber-500 rounded-xl bg-white/50 dark:bg-black/20 hover:bg-amber-500/5 transition-all cursor-pointer text-center group">
                  <FiImage className="w-7 h-7 text-amber-500 group-hover:scale-110 transition-transform mb-1.5" />
                  <p className="text-xs font-bold text-slate-700 dark:text-neutral-200">
                    اضغط هنا لاختيار صورة إيصال التحويل
                  </p>
                  <p className="text-[10px] text-slate-400 dark:text-neutral-400 mt-0.5">
                    يدعم صور JPEG, PNG, JPG, WebP (حتى 5 ميجابايت)
                  </p>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/jpg,image/webp"
                    onChange={handleReceiptChange}
                    className="hidden"
                  />
                </label>
              )}
            </div>
          )}

          {/* Submit Action */}
          <div className="pt-3">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex items-center justify-between px-5 py-3.5 rounded-2xl bg-gradient-to-r from-primary to-indigo-600 hover:from-primary/90 hover:to-indigo-500 text-white font-bold text-sm shadow-xl shadow-primary/25 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 cursor-pointer"
            >
              <div className="flex items-center gap-2">
                {isSubmitting ? (
                  <FiLoader className="w-4 h-4 animate-spin" />
                ) : (
                  <FiCheckCircle className="w-4 h-4" />
                )}
                <span>{isSubmitting ? 'جاري تأكيد الطلب...' : 'تأكيد الطلب الآن'}</span>
              </div>

              <div className="flex items-baseline gap-1">
                <span className="text-base font-black">
                  {grandTotals.grand_final_price.toFixed(2)}
                </span>
                <span className="text-xs font-semibold opacity-90">ج.م</span>
              </div>
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
