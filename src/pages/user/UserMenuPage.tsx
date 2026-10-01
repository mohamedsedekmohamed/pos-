import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  FiSearch,
  FiX,
  FiTruck,
  FiShoppingBag,
  FiTrash2,
  FiPlus,
  FiMinus,
  FiArrowLeft,
  FiSidebar,
  FiMaximize2,
  FiPackage,
} from 'react-icons/fi';
import { userApi } from '../../services/userService';
import { useLanguage } from '../../context/LanguageContext';
import { UserCartProvider, useUserCart } from '../../context/UserCartContext';
import { useBusinessSetup, formatImageUrl } from '../../hooks/useBusinessSetup';
import { UserHeader } from '../../components/user/UserHeader';
import { UserCategoryNav } from '../../components/user/UserCategoryNav';
import { UserProductCard } from '../../components/user/UserProductCard';
import { UserProductModal } from '../../components/user/UserProductModal';
import { UserCartDrawer } from '../../components/user/UserCartDrawer';
import { UserCheckoutModal } from '../../components/user/UserCheckoutModal';
import type { UserProduct } from '../../types/user';

const UserMenuContent: React.FC = () => {
  const { language } = useLanguage();
  const { business } = useBusinessSetup();
  const {
    itemCount,
    grandTotals,
    cartItems,
    module,
    setModule,
    updateItemQuantity,
    removeItem,
    clearCart,
    openCart,
    isUpdating,
    isRemoving,
    isClearing,
  } = useUserCart();

  const isBusy = isUpdating || isRemoving || isClearing;

  // Navigation & Filtering State
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [selectedSubCategoryId, setSelectedSubCategoryId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Desktop side-cart toggle (enabled by default on wide screens)
  const [showDesktopCart, setShowDesktopCart] = useState(true);

  // Modals State
  const [selectedProduct, setSelectedProduct] = useState<UserProduct | null>(null);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  // ── 1. Fetch Parent Categories ──
  const { data: parentCategories = [] } = useQuery({
    queryKey: ['user-parent-categories', language],
    queryFn: () => userApi.getParentCategories(language),
    staleTime: 1000 * 60 * 15,
  });

  // ── 2. Fetch Sub Categories ──
  const { data: subCategories = [] } = useQuery({
    queryKey: ['user-sub-categories', selectedCategoryId, language],
    queryFn: () => userApi.getSubCategories(selectedCategoryId, language),
    staleTime: 1000 * 60 * 15,
  });

  // ── 3. Fetch Products ──
  const { data: products = [], isLoading: isLoadingProducts } = useQuery({
    queryKey: [
      'user-products',
      selectedCategoryId,
      selectedSubCategoryId,
      language,
    ],
    queryFn: () =>
      userApi.getProducts({
        category_id: selectedCategoryId,
        sub_category_id: selectedSubCategoryId,
        lang: language,
      }),
    staleTime: 1000 * 60 * 5,
  });

  // Client-side search filtering
  const filteredProducts = useMemo(() => {
    if (!searchTerm.trim()) return products;
    const term = searchTerm.toLowerCase().trim();
    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(term) ||
        (p.description && p.description.toLowerCase().includes(term))
    );
  }, [products, searchTerm]);

  return (
    <div
      className="min-h-screen relative flex flex-col bg-slate-50 dark:bg-[#07070a] text-slate-900 dark:text-white selection:bg-primary selection:text-white transition-colors duration-300"
      dir="rtl"
    >
      {/* Background Animated Dynamic Light Orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-32 right-1/4 w-[600px] h-[600px] bg-primary/10 dark:bg-primary/15 rounded-full blur-[150px] animate-float-orb" />
        <div className="absolute top-1/2 -left-32 w-[500px] h-[500px] bg-indigo-500/10 dark:bg-indigo-500/15 rounded-full blur-[150px] animate-pulse-soft" />
        <div className="absolute -bottom-32 right-10 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[160px] animate-float-gentle" />
      </div>

      {/* Main Full-Width Header */}
      <UserHeader />

      {/* Hero Notice Banner with Ambient Animation */}
      {business?.branch_cover && (
        <div className="relative z-10 bg-primary/10 dark:bg-gradient-to-r dark:from-primary/10 dark:via-indigo-600/10 dark:to-primary/10 border-b border-primary/20 py-2 px-3 sm:px-4 text-center overflow-hidden">
          <div className="w-full flex items-center justify-center gap-2 text-[11px] sm:text-xs font-bold text-slate-800 dark:text-neutral-200">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping shrink-0" />
            <FiTruck className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary shrink-0" />
            <span className="truncate">
              نطاق خدمة وتغطية التوصيل لأقرب فرع يصل إلى{' '}
              <strong className="text-primary dark:text-white underline underline-offset-4 decoration-primary decoration-2">
                {business.branch_cover} كم
              </strong>{' '}
              من موقعك
            </span>
          </div>
        </div>
      )}

      {/* Main Full-Width Container (takes entire screen width) */}
      <main className="relative z-10 flex-1 w-full px-3 sm:px-6 lg:px-8 xl:px-10 py-4 sm:py-8 pb-28 sm:pb-32 xl:pb-10">
        
        {/* Top Controls: Search Bar, Stats, and Desktop View Toggle */}
        <div className="flex items-center justify-between gap-2 sm:gap-3 mb-4 sm:mb-6">
          
          {/* Search Input */}
          <div className="relative flex-1 max-w-md group">
            <FiSearch className="absolute right-3.5 sm:right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-neutral-400 group-focus-within:text-primary transition-colors" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="ابحث عن وجبة، ساندوتش، مشروب..."
              className="w-full pl-9 sm:pl-10 pr-10 sm:pr-11 py-2.5 sm:py-3 rounded-2xl bg-white dark:bg-[#121218]/90 border border-slate-200/80 dark:border-white/10 text-slate-900 dark:text-white text-xs sm:text-sm placeholder:text-slate-400 dark:placeholder:text-neutral-500 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all shadow-sm"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                className="absolute left-2.5 sm:left-3 top-1/2 -translate-y-1/2 p-1 rounded-full text-slate-400 hover:text-slate-700 dark:text-neutral-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 transition-all"
                title="مسح البحث"
              >
                <FiX className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Desktop Side-Cart Visibility Toggle */}
            <button
              type="button"
              onClick={() => setShowDesktopCart((prev) => !prev)}
              className="hidden xl:flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white dark:bg-white/[0.04] hover:bg-slate-100 dark:hover:bg-white/[0.08] border border-slate-200/80 dark:border-white/10 text-xs font-semibold text-slate-700 dark:text-neutral-300 hover:text-slate-900 dark:hover:text-white transition-all shadow-sm"
              title={showDesktopCart ? 'توسيع عرض المنيو بالكامل' : 'إظهار السلة الجانبية'}
            >
              {showDesktopCart ? (
                <>
                  <FiMaximize2 className="w-3.5 h-3.5 text-primary" />
                  <span>توسيع العرض</span>
                </>
              ) : (
                <>
                  <FiSidebar className="w-3.5 h-3.5 text-primary" />
                  <span>السلة الجانبية ({itemCount})</span>
                </>
              )}
            </button>

            <div className="text-[11px] sm:text-xs text-slate-500 dark:text-neutral-400 font-semibold px-2.5 sm:px-3 py-2 sm:py-2.5 rounded-2xl bg-white dark:bg-white/[0.03] border border-slate-200/80 dark:border-white/5 shadow-sm dark:shadow-none whitespace-nowrap">
              <span>{filteredProducts.length} صنف</span>
            </div>
          </div>
        </div>

        {/* Categories Bar */}
        <div className="mb-4 sm:mb-6">
          <UserCategoryNav
            categories={parentCategories}
            subCategories={subCategories}
            selectedCategoryId={selectedCategoryId}
            selectedSubCategoryId={selectedSubCategoryId}
            onSelectCategory={setSelectedCategoryId}
            onSelectSubCategory={setSelectedSubCategoryId}
          />
        </div>

        {/* Content Area: Main Products Grid + Optional Desktop Live Cart */}
        <div className="flex items-start gap-6 xl:gap-8 w-full">
          
          {/* Main Products Grid Column (stretches to full width when cart is hidden) */}
          <div className="flex-1 min-w-0 w-full">
            {isLoadingProducts ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-2.5 sm:gap-4 md:gap-6">
                {Array.from({ length: 12 }).map((_, idx) => (
                  <div
                    key={idx}
                    className="rounded-2xl sm:rounded-3xl bg-white/70 dark:bg-[#121218]/50 border border-slate-200/60 dark:border-white/5 p-3 sm:p-4 space-y-2 sm:space-y-3 animate-pulse shadow-sm"
                  >
                    <div className="aspect-[4/3] rounded-xl sm:rounded-2xl bg-slate-100 dark:bg-white/5" />
                    <div className="h-3.5 sm:h-4 bg-slate-200 dark:bg-white/10 rounded-lg w-2/3" />
                    <div className="h-3 bg-slate-100 dark:bg-white/5 rounded-lg w-full" />
                    <div className="flex justify-between items-center pt-2">
                      <div className="h-4 sm:h-5 bg-slate-200 dark:bg-white/10 rounded-lg w-12 sm:w-16" />
                      <div className="h-7 sm:h-8 bg-slate-200 dark:bg-white/10 rounded-lg sm:rounded-xl w-12 sm:w-16" />
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="py-16 sm:py-20 text-center space-y-4 rounded-3xl bg-white/80 dark:bg-[#121218]/40 border border-slate-200/80 dark:border-white/5 p-6 sm:p-8 shadow-sm">
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-slate-100 dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 mx-auto flex items-center justify-center text-2xl sm:text-3xl text-slate-400 dark:text-neutral-500">
                  🔍
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white mb-1">لم يتم العثور على نتائج</h3>
                  <p className="text-xs text-slate-500 dark:text-neutral-400 max-w-sm mx-auto leading-relaxed">
                    جرب البحث بكلمات أخرى أو اختر قسماً آخر من شريط الأقسام أعلاه.
                  </p>
                </div>
              </div>
            ) : (
              <div
                className={`grid gap-2.5 sm:gap-4 md:gap-6 ${
                  showDesktopCart
                    ? 'grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5'
                    : 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7'
                }`}
              >
                {filteredProducts.map((product, idx) => (
                  <UserProductCard
                    key={product.id}
                    product={product}
                    index={idx}
                    onSelect={setSelectedProduct}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Desktop Live Cart Sidebar (Fixed on wide screens like DashboardHome) */}
          {showDesktopCart && (
            <aside className="hidden xl:flex w-[360px] 2xl:w-[400px] shrink-0 sticky top-24 rounded-3xl bg-white/95 dark:bg-[#101015]/95 backdrop-blur-2xl border border-slate-200/80 dark:border-white/10 shadow-xl dark:shadow-2xl flex-col max-h-[calc(100vh-7.5rem)] overflow-hidden animate-in fade-in slide-in-from-left-4 duration-300">
              
              {/* Sidebar Header */}
              <div className="p-4 sm:p-5 border-b border-slate-200/80 dark:border-white/10 flex items-center justify-between bg-slate-50 dark:bg-[#14141c]">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-2xl bg-primary/10 dark:bg-gradient-to-tr dark:from-primary/30 dark:to-indigo-600/20 border border-primary/20 dark:border-primary/40 flex items-center justify-center text-primary shadow-sm dark:shadow-lg dark:shadow-primary/20">
                    <FiShoppingBag className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <span>سلة الطلبات</span>
                      {itemCount > 0 && (
                        <span className="px-2 py-0.5 rounded-full bg-primary text-white text-[11px] font-black">
                          {itemCount}
                        </span>
                      )}
                    </h3>
                    <p className="text-[11px] text-slate-500 dark:text-neutral-400">
                      {module === 'delivery' ? 'توصيل للمنزل' : 'استلام من الفرع'}
                    </p>
                  </div>
                </div>

                {cartItems.length > 0 && (
                  <button
                    type="button"
                    onClick={() => clearCart()}
                    disabled={isBusy}
                    className="p-2 rounded-xl bg-red-50 hover:bg-red-100 dark:bg-red-500/10 dark:hover:bg-red-500/20 text-red-500 dark:text-red-400 border border-red-200 dark:border-red-500/20 text-xs font-bold transition-all disabled:opacity-50 hover:scale-105 active:scale-95"
                    title="تفريغ السلة"
                  >
                    <FiTrash2 className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Module Toggle inside Desktop Cart */}
              <div className="p-2.5 bg-slate-100 dark:bg-[#0c0c10] border-b border-slate-200/60 dark:border-white/5 flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setModule('delivery')}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    module === 'delivery'
                      ? 'bg-primary text-white shadow-md shadow-primary/20'
                      : 'text-slate-600 dark:text-neutral-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <FiTruck className="w-3.5 h-3.5" />
                  <span>توصيل</span>
                </button>

                <button
                  type="button"
                  onClick={() => setModule('takeaway')}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    module === 'takeaway'
                      ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                      : 'text-slate-600 dark:text-neutral-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <FiPackage className="w-3.5 h-3.5" />
                  <span>استلام</span>
                </button>
              </div>

              {/* Items List */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3 no-scrollbar">
                {cartItems.length === 0 ? (
                  <div className="h-64 flex flex-col items-center justify-center text-center p-6 space-y-3">
                    <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 flex items-center justify-center text-2xl text-slate-400 dark:text-neutral-500">
                      🛒
                    </div>
                    <p className="text-xs text-slate-500 dark:text-neutral-400">
                      اختر الأصناف المفضلة لديك لإضافتها هنا ومتابعة طلبك مباشرة.
                    </p>
                  </div>
                ) : (
                  cartItems.map((item) => {
                    const imageUrl = formatImageUrl(item.image);

                    return (
                      <div
                        key={item.id}
                        className="p-3 rounded-2xl bg-slate-50 hover:bg-slate-100/80 dark:bg-white/[0.03] dark:hover:bg-white/[0.05] border border-slate-200/60 dark:border-white/5 space-y-2.5 transition-all"
                      >
                        <div className="flex items-start gap-2.5">
                          {/* Thumbnail */}
                          <div className="w-12 h-12 rounded-xl bg-slate-200 dark:bg-black/40 border border-slate-300 dark:border-white/10 overflow-hidden shrink-0">
                            {imageUrl ? (
                              <img
                                src={imageUrl}
                                alt={item.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-base">
                                🍽️
                              </div>
                            )}
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-1">
                              <h4 className="text-xs font-bold text-slate-900 dark:text-white line-clamp-1">
                                {item.name}
                              </h4>
                              <button
                                type="button"
                                onClick={() => removeItem(item.id)}
                                disabled={isBusy}
                                className="text-slate-400 hover:text-red-500 dark:text-neutral-500 dark:hover:text-red-400 p-0.5 transition-colors"
                              >
                                <FiTrash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>

                            {/* Variations & Addons Pills */}
                            {item.variations && item.variations.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-1">
                                {item.variations.map((v) => (
                                  <span
                                    key={v.id}
                                    className="px-1.5 py-0.5 rounded bg-primary/10 text-primary text-[9px] font-semibold"
                                  >
                                    {v.options.map((o) => o.name).join(', ')}
                                  </span>
                                ))}
                              </div>
                            )}

                            {item.addons && item.addons.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-1">
                                {item.addons.map((a) => (
                                  <span
                                    key={a.id}
                                    className="px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[9px] font-semibold"
                                  >
                                    +{a.name}
                                  </span>
                                ))}
                              </div>
                            )}

                            {item.notes && (
                              <p className="text-[10px] text-amber-600 dark:text-amber-300/80 mt-1 italic line-clamp-1">
                                {item.notes}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Stepper & Price */}
                        <div className="flex items-center justify-between pt-2 border-t border-slate-200/60 dark:border-white/5">
                          <div className="flex items-center bg-white dark:bg-black/40 p-0.5 rounded-lg border border-slate-200 dark:border-white/10 shadow-sm">
                            <button
                              type="button"
                              onClick={() => updateItemQuantity(item.id, item.quantity - 1, item)}
                              disabled={isBusy}
                              className="w-5 h-5 rounded bg-slate-100 hover:bg-slate-200 dark:bg-white/[0.04] dark:hover:bg-white/[0.1] text-slate-800 dark:text-white flex items-center justify-center transition-all disabled:opacity-40"
                            >
                              <FiMinus className="w-2.5 h-2.5" />
                            </button>

                            <span className="w-6 text-center text-xs font-black text-slate-900 dark:text-white">
                              {item.quantity}
                            </span>

                            <button
                              type="button"
                              onClick={() => updateItemQuantity(item.id, item.quantity + 1, item)}
                              disabled={isBusy}
                              className="w-5 h-5 rounded bg-slate-100 hover:bg-slate-200 dark:bg-white/[0.04] dark:hover:bg-white/[0.1] text-slate-800 dark:text-white flex items-center justify-center transition-all disabled:opacity-40"
                            >
                              <FiPlus className="w-2.5 h-2.5" />
                            </button>
                          </div>

                          <div className="text-left">
                            <span className="text-xs font-black text-slate-900 dark:text-white">
                              {Number(item.item_final_price || item.final_price * item.quantity).toFixed(2)}
                            </span>
                            <span className="text-[9px] text-slate-500 dark:text-neutral-400 mr-1 font-semibold">ج.م</span>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Sidebar Footer Totals & Checkout Button */}
              {cartItems.length > 0 && (
                <div className="p-4 bg-slate-50 dark:bg-[#14141c] border-t border-slate-200/80 dark:border-white/10 space-y-3">
                  <div className="space-y-1.5 text-xs">
                    <div className="flex justify-between text-slate-500 dark:text-neutral-400">
                      <span>المجموع الفرعي</span>
                      <span className="font-semibold text-slate-800 dark:text-neutral-200">
                        {Number(grandTotals.grand_total_price).toFixed(2)} ج.م
                      </span>
                    </div>

                    {grandTotals.grand_total_discount > 0 && (
                      <div className="flex justify-between text-emerald-600 dark:text-emerald-400">
                        <span>الخصم</span>
                        <span className="font-semibold">
                          - {Number(grandTotals.grand_total_discount).toFixed(2)} ج.م
                        </span>
                      </div>
                    )}

                    {grandTotals.grand_total_tax > 0 && (
                      <div className="flex justify-between text-slate-500 dark:text-neutral-400">
                        <span>الضريبة المضافة</span>
                        <span className="font-semibold text-slate-800 dark:text-neutral-200">
                          {Number(grandTotals.grand_total_tax).toFixed(2)} ج.م
                        </span>
                      </div>
                    )}

                    <div className="pt-2 border-t border-slate-200 dark:border-white/10 flex justify-between items-baseline text-slate-900 dark:text-white">
                      <span className="text-xs font-bold">المبلغ الإجمالي</span>
                      <div className="flex items-baseline gap-1">
                        <span className="text-lg font-black text-primary">
                          {Number(grandTotals.grand_final_price).toFixed(2)}
                        </span>
                        <span className="text-[10px] font-bold text-slate-500 dark:text-neutral-400">ج.م</span>
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setIsCheckoutOpen(true)}
                    disabled={isBusy}
                    className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-gradient-to-r from-primary to-indigo-600 hover:from-primary/90 hover:to-indigo-500 text-white font-bold text-xs sm:text-sm shadow-xl shadow-primary/25 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 cursor-pointer"
                  >
                    <span>إتمام وتأكيد الطلب</span>
                    <FiArrowLeft className="w-4 h-4" />
                  </button>
                </div>
              )}
            </aside>
          )}

        </div>
      </main>

      {/* Floating Bottom Bar for Mobile Devices */}
      {itemCount > 0 && (
        <div className="xl:hidden fixed bottom-3 sm:bottom-4 inset-x-3 sm:inset-x-4 z-40 animate-in slide-in-from-bottom duration-300">
          <button
            type="button"
            onClick={openCart}
            className="w-full flex items-center justify-between p-3.5 sm:p-4 rounded-xl sm:rounded-2xl bg-gradient-to-r from-primary to-indigo-600 text-white font-bold shadow-2xl shadow-primary/40 border border-white/20 active:scale-95 transition-all"
          >
            <div className="flex items-center gap-2 sm:gap-2.5">
              <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg sm:rounded-xl bg-white text-primary flex items-center justify-center text-xs font-black shadow">
                {itemCount}
              </div>
              <span className="text-xs sm:text-sm">عرض سلة الطلبات</span>
            </div>

            <div className="flex items-baseline gap-1">
              <span className="text-sm sm:text-base font-black">
                {grandTotals.grand_final_price.toFixed(2)}
              </span>
              <span className="text-[10px] sm:text-xs font-semibold opacity-90">ج.م</span>
            </div>
          </button>
        </div>
      )}

      {/* Product Customization Modal */}
      <UserProductModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
      />

      {/* Slide-over Cart Drawer for Mobile/Tablet */}
      <UserCartDrawer
        onProceedToCheckout={() => setIsCheckoutOpen(true)}
      />

      {/* Checkout Modal */}
      <UserCheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
      />
    </div>
  );
};

export const UserMenuPage: React.FC = () => {
  return (
    <UserCartProvider>
      <UserMenuContent />
    </UserCartProvider>
  );
};

export default UserMenuPage;
