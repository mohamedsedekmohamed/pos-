import React, { useState, useEffect } from 'react';
import {
  FiX,
  FiMapPin,
  FiNavigation,
  FiLock,
  FiEye,
  FiEyeOff,
  FiSave,
  FiUser,
} from 'react-icons/fi';
import { FaWhatsapp, FaFacebookF } from 'react-icons/fa6';
import type { AdminBranch, CreateBranchPayload, UpdateBranchPayload } from '../../types/branch';

interface BranchFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  branchToEdit?: AdminBranch | null;
  onSubmit: (payload: CreateBranchPayload | UpdateBranchPayload) => Promise<void>;
  isLoading?: boolean;
}

export const BranchFormModal: React.FC<BranchFormModalProps> = ({
  isOpen,
  onClose,
  branchToEdit,
  onSubmit,
  isLoading = false,
}) => {
  const isEdit = Boolean(branchToEdit);

  // Form State
  const [nameAr, setNameAr] = useState('');
  const [nameEn, setNameEn] = useState('');
  const [userName, setUserName] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [address, setAddress] = useState('');
  const [lat, setLat] = useState<number>(30.0444);
  const [lng, setLng] = useState<number>(31.2357);
  const [watts, setWatts] = useState('');
  const [facebook, setFacebook] = useState('');
  const [status, setStatus] = useState<boolean>(true);
  const [locating, setLocating] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Populate data when editing
  useEffect(() => {
    if (branchToEdit) {
      const ar =
        typeof branchToEdit.name === 'object' ? branchToEdit.name.ar || '' : branchToEdit.name || '';
      const en =
        typeof branchToEdit.name === 'object' ? branchToEdit.name.en || '' : '';
      setNameAr(ar);
      setNameEn(en);
      setUserName(branchToEdit.user_name || '');
      setPassword('');
      setAddress(branchToEdit.address || '');
      setWatts(branchToEdit.watts || '');
      setFacebook(branchToEdit.facebook || '');
      setStatus(branchToEdit.status ?? true);

      if (branchToEdit.location && branchToEdit.location.length > 0) {
        setLat(branchToEdit.location[0].lat || 30.0444);
        setLng(branchToEdit.location[0].lng || 31.2357);
      }
    } else {
      // Default reset for new branch
      setNameAr('');
      setNameEn('');
      setUserName('');
      setPassword('');
      setAddress('');
      setLat(30.0444);
      setLng(31.2357);
      setWatts('');
      setFacebook('');
      setStatus(true);
    }
    setFormError(null);
  }, [branchToEdit, isOpen]);

  if (!isOpen) return null;

  // Handle GPS location
  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert('خدمة تحديد الموقع الجغرافي غير مدعومة في متصفحك.');
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLat(Number(pos.coords.latitude.toFixed(6)));
        setLng(Number(pos.coords.longitude.toFixed(6)));
        setLocating(false);
      },
      (err) => {
        console.warn('Geolocation error:', err);
        setLocating(false);
        alert('تعذر تحديد الموقع الجغرافي. يرجى إدخال الإحداثيات يدوياً.');
      },
      { timeout: 10000 }
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!nameAr.trim() && !nameEn.trim()) {
      setFormError('يرجى إدخال اسم الفرع بالعربية أو الإنجليزية على الأقل.');
      return;
    }

    if (!isEdit && !userName.trim()) {
      setFormError('يرجى تحديد اسم مستخدم للفرع.');
      return;
    }

    if (!isEdit && !password.trim()) {
      setFormError('يرجى تحديد كلمة مرور للفرع الجديد.');
      return;
    }

    const payload: CreateBranchPayload = {
      name: {
        ar: nameAr.trim() || nameEn.trim(),
        en: nameEn.trim() || nameAr.trim(),
      },
      user_name: userName.trim(),
      address: address.trim(),
      location: [{ lat: Number(lat), lng: Number(lng) }],
      watts: watts.trim() || undefined,
      facebook: facebook.trim() || undefined,
      status,
    };

    if (password.trim()) {
      payload.password = password.trim();
    }

    try {
      await onSubmit(payload);
      onClose();
    } catch (err: any) {
      console.error(err);
      const msg =
        err.response?.data?.message ||
        err.message ||
        'حدث خطأ أثناء حفظ بيانات الفرع، يرجى المحاولة مجدداً.';
      setFormError(msg);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl bg-white dark:bg-[#111116] border border-slate-200 dark:border-white/10 p-6 sm:p-8 shadow-2xl text-right animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
        dir="rtl"
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 left-5 w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-white/[0.05] dark:hover:bg-white/[0.1] border border-slate-200 dark:border-white/10 flex items-center justify-center text-slate-500 hover:text-slate-900 dark:text-neutral-400 dark:hover:text-white transition-colors cursor-pointer"
          title="إغلاق"
        >
          <FiX className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-primary/20 to-indigo-500/20 border border-primary/30 flex items-center justify-center text-primary shadow-lg shadow-primary/10">
            <FiMapPin className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              {isEdit ? 'تعديل بيانات الفرع' : 'إضافة فرع جديد للنظام'}
            </h2>
            <p className="text-xs text-slate-400 dark:text-neutral-400 mt-0.5">
              {isEdit
                ? `تحديث إعدادات وبيانات ${branchToEdit?.user_name || ''}`
                : 'تسجيل فرع جديد وتعيين حساب الدخول والإحداثيات الجغرافية'}
            </p>
          </div>
        </div>

        {formError && (
          <div className="mb-6 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs font-semibold leading-relaxed">
            {formError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Section: Names (AR & EN) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-neutral-300 mb-1.5">
                اسم الفرع (بالعربية) <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={nameAr}
                onChange={(e) => setNameAr(e.target.value)}
                placeholder="مثال: فرع المعادي"
                required
                className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-primary transition-all placeholder:text-slate-400 dark:placeholder:text-neutral-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-neutral-300 mb-1.5">
                اسم الفرع (بالإنجليزية) <span className="text-slate-400 text-[11px]">(اختياري)</span>
              </label>
              <input
                type="text"
                value={nameEn}
                onChange={(e) => setNameEn(e.target.value)}
                placeholder="e.g. Maadi Branch"
                dir="ltr"
                className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-primary transition-all placeholder:text-slate-400 dark:placeholder:text-neutral-500"
              />
            </div>
          </div>

          {/* Section: Credentials */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-neutral-300 mb-1.5 flex items-center gap-1.5">
                <FiUser className="w-3.5 h-3.5 text-primary" />
                <span>اسم المستخدم للفرع (Username)</span> <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                placeholder="مثال: branch_maadi"
                required={!isEdit}
                dir="ltr"
                className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white text-sm font-mono focus:outline-none focus:border-primary transition-all placeholder:text-slate-400 dark:placeholder:text-neutral-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-neutral-300 mb-1.5 flex items-center gap-1.5">
                <FiLock className="w-3.5 h-3.5 text-primary" />
                <span>كلمة المرور</span>{' '}
                {isEdit ? (
                  <span className="text-slate-400 font-normal text-[10px]">(اتركه فارغاً للتخطي)</span>
                ) : (
                  <span className="text-rose-500">*</span>
                )}
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={isEdit ? 'كلمة مرور جديدة (اختياري)' : 'كلمة المرور للدخول'}
                  required={!isEdit}
                  dir="ltr"
                  className="w-full px-4 py-3 pl-11 rounded-xl bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white text-sm font-mono focus:outline-none focus:border-primary transition-all placeholder:text-slate-400 dark:placeholder:text-neutral-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors cursor-pointer"
                >
                  {showPassword ? <FiEyeOff className="w-4 h-4" /> : <FiEye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>

          {/* Section: Address */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-neutral-300 mb-1.5">
              العنوان التفصيلي <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="مثال: شارع النصر، المعادي، القاهرة"
              required
              className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-primary transition-all placeholder:text-slate-400 dark:placeholder:text-neutral-500"
            />
          </div>

          {/* Section: Location (Lat / Lng) with Smart GPS button */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800 dark:text-neutral-200 flex items-center gap-1.5">
                <FiNavigation className="w-3.5 h-3.5 text-blue-500" />
                <span>الإحداثيات الجغرافية (GPS Location)</span>
              </span>
              <button
                type="button"
                onClick={handleGetCurrentLocation}
                disabled={locating}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 text-blue-600 dark:text-blue-400 text-xs font-bold transition-all cursor-pointer disabled:opacity-50"
              >
                <FiNavigation className={`w-3.5 h-3.5 ${locating ? 'animate-spin' : ''}`} />
                <span>{locating ? 'جاري التحديد...' : 'موقعي الحالي'}</span>
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3" dir="ltr">
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 dark:text-neutral-400 mb-1">
                  Latitude (خط العرض)
                </label>
                <input
                  type="number"
                  step="any"
                  value={lat}
                  onChange={(e) => setLat(parseFloat(e.target.value) || 0)}
                  placeholder="30.0444"
                  className="w-full px-3 py-2 rounded-xl bg-white dark:bg-white/[0.05] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white text-xs font-mono focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-500 dark:text-neutral-400 mb-1">
                  Longitude (خط الطول)
                </label>
                <input
                  type="number"
                  step="any"
                  value={lng}
                  onChange={(e) => setLng(parseFloat(e.target.value) || 0)}
                  placeholder="31.2357"
                  className="w-full px-3 py-2 rounded-xl bg-white dark:bg-white/[0.05] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white text-xs font-mono focus:outline-none focus:border-primary"
                />
              </div>
            </div>
          </div>

          {/* Section: Contact & Social */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-neutral-300 mb-1.5 flex items-center gap-1.5">
                <FaWhatsapp className="w-3.5 h-3.5 text-emerald-500" />
                <span>رقم الواتساب</span>
              </label>
              <input
                type="text"
                value={watts}
                onChange={(e) => setWatts(e.target.value)}
                placeholder="+201012345678"
                dir="ltr"
                className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-primary transition-all placeholder:text-slate-400 dark:placeholder:text-neutral-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-neutral-300 mb-1.5 flex items-center gap-1.5">
                <FaFacebookF className="w-3.5 h-3.5 text-blue-500" />
                <span>رابط صفحة فيسبوك</span>
              </label>
              <input
                type="url"
                value={facebook}
                onChange={(e) => setFacebook(e.target.value)}
                placeholder="https://facebook.com/branch"
                dir="ltr"
                className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-primary transition-all placeholder:text-slate-400 dark:placeholder:text-neutral-500"
              />
            </div>
          </div>

          {/* Section: Status Toggle */}
          <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/10">
            <div>
              <p className="text-sm font-bold text-slate-800 dark:text-white">حالة الفرع</p>
              <p className="text-xs text-slate-400 dark:text-neutral-400">
                تفعيل أو تعطيل استقبال الطلبات والورديات في هذا الفرع
              </p>
            </div>
            <button
              type="button"
              onClick={() => setStatus(!status)}
              className={`relative inline-flex h-7 w-13 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                status ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-neutral-700'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                  status ? '-translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 pt-3">
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 py-3.5 rounded-xl bg-gradient-to-r from-primary to-indigo-600 hover:from-primary-dark hover:to-indigo-700 text-white font-bold text-sm shadow-lg shadow-primary/25 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <FiSave className="w-4 h-4" />
              <span>{isLoading ? 'جاري الحفظ...' : isEdit ? 'حفظ التعديلات' : 'إضافة الفرع'}</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="px-6 py-3.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-white/[0.05] dark:hover:bg-white/[0.1] border border-slate-200 dark:border-white/10 text-slate-700 dark:text-neutral-300 font-semibold text-sm transition-all cursor-pointer"
            >
              إلغاء
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
