import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { TableProvider, useTableContext } from '../context/TableContext';
import { TableCartProvider } from '../context/TableCartContext';
import { tableApi } from '../services/tableService';
import { useBusinessSetup } from '../hooks/useBusinessSetup';
import type { TableProduct } from '../types/table';

// Table Components
import { TableHeader } from '../components/table/TableHeader';
import { CategoryTabs } from '../components/table/CategoryTabs';
import { ProductCard } from '../components/table/ProductCard';
import { ProductModal } from '../components/table/ProductModal';
import { FloatingCartBar } from '../components/table/FloatingCartBar';
import { TableCartDrawer } from '../components/table/TableCartDrawer';
import {
  CategoryTabsSkeleton,
  ProductGridSkeleton,
} from '../components/table/TableSkeletons';

import {
  FiSearch,
  FiPackage,
  FiAlertCircle,
  FiCoffee,
  FiArrowLeft,
  FiShoppingBag,
} from 'react-icons/fi';

const TablePageContent: React.FC = () => {
  const { table_code: routeTableCode } = useParams<{ table_code?: string }>();
  const navigate = useNavigate();
  const { business, logoUrl } = useBusinessSetup();
  const {
    tableId,
    setTableId,
    setTableCode,
    setIsDirectTableCode,
    setTableInfo,
    lang,
  } = useTableContext();

  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [selectedSubCategoryId, setSelectedSubCategoryId] = useState<number | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<TableProduct | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [manualCodeInput, setManualCodeInput] = useState('');

  // Sync table_code from route to context
  useEffect(() => {
    if (routeTableCode) {
      setTableCode(routeTableCode);
      setIsDirectTableCode(true);
    }
  }, [routeTableCode, setTableCode, setIsDirectTableCode]);

  // Fetch Table Information using the required route table_code
  const {
    data: tableData,
    isError: tableError,
  } = useQuery({
    queryKey: ['tableInfo', routeTableCode, lang],
    queryFn: () => tableApi.getTableInfo(routeTableCode!, lang),
    retry: 1,
    enabled: !!routeTableCode,
  });

  useEffect(() => {
    if (tableData) {
      setTableInfo(tableData);
      if (tableData.id && tableData.id !== tableId) {
        setTableId(tableData.id);
      }
      if (tableData.table_code) {
        setTableCode(tableData.table_code);
      }
    }
  }, [tableData, setTableInfo, setTableId, setTableCode, tableId]);

  // Fetch Parent Categories
  const { data: categories = [], isLoading: loadingCategories } = useQuery({
    queryKey: ['tableCategories', lang],
    queryFn: () => tableApi.getParentCategories(lang),
    enabled: !!routeTableCode && !tableError,
  });

  // Fetch Sub Categories
  const { data: subCategories = [], isLoading: loadingSubCategories } = useQuery({
    queryKey: ['tableSubCategories', selectedCategoryId, lang],
    queryFn: () => tableApi.getSubCategories(selectedCategoryId, lang),
    enabled: !!routeTableCode && !tableError && selectedCategoryId !== null,
  });

  // Fetch Products
  const { data: products = [], isLoading: loadingProducts } = useQuery({
    queryKey: ['tableProducts', selectedCategoryId, selectedSubCategoryId, lang],
    queryFn: () =>
      tableApi.getProducts({
        category_id: selectedCategoryId,
        sub_category_id: selectedSubCategoryId,
        lang,
      }),
    enabled: !!routeTableCode && !tableError,
  });

  // Fetch Addons
  const { data: addons = [] } = useQuery({
    queryKey: ['tableAddons', lang],
    queryFn: () => tableApi.getAddons(lang),
    enabled: !!routeTableCode && !tableError,
  });

  // If no table_code is present in the route, prompt user to enter the code
  if (!routeTableCode) {
    return (
      <div
        className="min-h-screen relative flex flex-col justify-between bg-[#070709] text-white selection:bg-primary selection:text-white"
        dir="rtl"
      >
        {/* Ambient Animated Lights */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-32 -right-32 w-[500px] h-[500px] bg-primary/15 rounded-full blur-[140px] animate-pulse-soft" />
          <div
            className="absolute -bottom-32 -left-32 w-[500px] h-[500px] bg-indigo-600/15 rounded-full blur-[140px] animate-pulse-soft"
            style={{ animationDelay: '3s' }}
          />
        </div>

        {/* Top Header */}
        <header className="relative z-10 w-full border-b border-white/5 backdrop-blur-md bg-black/20 px-6 py-4">
          <div className="max-w-6xl mx-auto flex items-center justify-between">
            <Link to="/" className="flex items-center gap-3">
              {logoUrl ? (
                <div className="w-9 h-9 rounded-xl bg-white/[0.04] p-1 border border-white/10 flex items-center justify-center overflow-hidden">
                  <img src={logoUrl} alt="Logo" className="w-full h-full object-contain" />
                </div>
              ) : (
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-primary to-indigo-600 flex items-center justify-center shadow-lg shadow-primary/20">
                  <FiShoppingBag className="w-5 h-5 text-white" />
                </div>
              )}
              <span className="text-base font-bold text-white">
                {business?.name || 'نظام نقطة البيع'}
              </span>
            </Link>

            <Link
              to="/"
              className="text-xs font-semibold text-neutral-400 hover:text-white flex items-center gap-1.5 transition-colors"
            >
              <span>الصفحة الرئيسية</span>
              <FiArrowLeft className="w-3.5 h-3.5" />
            </Link>
          </div>
        </header>

        {/* Main Entry Card */}
        <main className="relative z-10 flex-1 max-w-md mx-auto px-4 py-12 flex flex-col items-center justify-center w-full">
          <div className="w-full rounded-3xl bg-[#101014]/90 border border-white/10 p-7 sm:p-8 backdrop-blur-2xl shadow-2xl shadow-black relative overflow-hidden text-center">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-emerald-500/15 border border-emerald-500/25 flex items-center justify-center text-emerald-400 shadow-lg shadow-emerald-500/10 mb-5">
              <FiCoffee className="w-8 h-8" />
            </div>

            <h1 className="text-2xl font-black text-white tracking-tight mb-2">
              اكتب كود عشان تخش
            </h1>
            <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed mb-6">
              يرجى إدخال رمز الطاولة الموضح على طاولتك (أو مسح رمز QR) للوصول لقائمة الطعام والطلب.
            </p>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                const code = manualCodeInput.trim();
                if (code) {
                  navigate(`/table/${encodeURIComponent(code)}`);
                }
              }}
              className="space-y-4 text-right"
            >
              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                  رمز الطاولة (Table Code)
                </label>
                <input
                  type="text"
                  value={manualCodeInput}
                  onChange={(e) => setManualCodeInput(e.target.value)}
                  placeholder="اكتب رمز الطاولة هنا..."
                  required
                  dir="ltr"
                  autoFocus
                  className="w-full px-4 py-3.5 rounded-xl bg-white/[0.04] border border-white/15 text-white text-sm font-mono focus:outline-none focus:border-emerald-500 transition-all text-center tracking-wider placeholder:text-neutral-600"
                />
              </div>

              <button
                type="submit"
                disabled={!manualCodeInput.trim()}
                className="w-full py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-black font-bold text-sm shadow-lg shadow-emerald-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>دخول إلى قائمة الطعام</span>
                <FiArrowLeft className="w-4 h-4" />
              </button>
            </form>
          </div>
        </main>

        {/* Footer */}
        <footer className="relative z-10 w-full border-t border-white/5 py-4 text-center text-xs text-neutral-500">
          <p>&copy; {new Date().getFullYear()} {business?.name || 'POS System'}</p>
        </footer>
      </div>
    );
  }

  // Error screen if table code does not exist
  if (tableError) {
    return (
      <div
        className="min-h-screen bg-[#070709] text-white flex flex-col items-center justify-center p-6 text-center"
        dir="rtl"
      >
        <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 flex items-center justify-center mb-4 shadow-lg shadow-red-500/10">
          <FiAlertCircle className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-black mb-2 tracking-tight">رمز الطاولة غير صحيح أو غير موجود</h1>
        <p className="text-sm text-neutral-400 max-w-md mb-6 leading-relaxed">
          لم يتم العثور على أي طاولة مطابقة للرمز المكتوب في الرابط (<code className="text-red-400 font-mono text-xs">{routeTableCode}</code>). يرجى التأكد من الرمز أو مسح رمز QR من على طاولتك.
        </p>
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/table')}
            className="px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-sm transition-all cursor-pointer shadow-lg shadow-emerald-500/20"
          >
            إعادة إدخال رمز الطاولة
          </button>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-2.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 text-white font-bold text-sm transition-all cursor-pointer"
          >
            العودة للصفحة الرئيسية
          </button>
        </div>
      </div>
    );
  }

  // Filter products by local search term if typed
  const filteredProducts = products.filter((p) => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    return (
      p.name.toLowerCase().includes(term) ||
      (p.description && p.description.toLowerCase().includes(term))
    );
  });

  // Category switch resets subcategory
  const handleSelectCategory = (id: number | null) => {
    setSelectedCategoryId(id);
    setSelectedSubCategoryId(null);
  };

  return (
    <div
      className="min-h-screen relative flex flex-col bg-[#070709] text-white selection:bg-primary selection:text-white"
      dir="rtl"
    >
      {/* Background Ambient Glows */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-32 -left-32 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[150px]" />
        <div className="absolute -bottom-32 -right-32 w-[500px] h-[500px] bg-violet-600/10 rounded-full blur-[150px]" />
      </div>

      {/* Sticky Header */}
      <TableHeader />

      {/* Main Content Area */}
      <main className="relative z-10 flex-1 w-full mx-auto pb-32">
        {/* Search Bar */}
        <div className="px-4 sm:px-6 pt-4 pb-1">
          <div className="relative">
            <FiSearch className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-500 w-4 h-4 pointer-events-none" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="ابحث عن وجبة أو مشروب مفضل..."
              className="w-full pr-11 pl-4 py-3 rounded-2xl bg-white/[0.04] border border-white/10 text-white placeholder-neutral-500 text-xs sm:text-sm focus:outline-none focus:border-primary focus:bg-white/[0.06] transition-all"
            />
          </div>
        </div>

        {/* Category Navigation Tabs */}
        {loadingCategories ? (
          <div className="px-4 sm:px-6 pt-3">
            <CategoryTabsSkeleton />
          </div>
        ) : (
          <CategoryTabs
            categories={categories}
            selectedCategoryId={selectedCategoryId}
            onSelectCategory={handleSelectCategory}
            subCategories={subCategories}
            selectedSubCategoryId={selectedSubCategoryId}
            onSelectSubCategory={setSelectedSubCategoryId}
            loadingSubCategories={loadingSubCategories}
          />
        )}

        {/* Products Grid Section */}
        <section className="px-4 sm:px-6 pt-5">
          {loadingProducts ? (
            <ProductGridSkeleton count={8} />
          ) : filteredProducts.length === 0 ? (
            <div className="py-20 flex flex-col items-center justify-center text-center space-y-3">
              <div className="w-16 h-16 rounded-3xl bg-white/[0.03] border border-white/5 flex items-center justify-center text-neutral-600">
                <FiPackage className="w-8 h-8" />
              </div>
              <h3 className="font-bold text-base text-neutral-300">لا توجد منتجات متاحة</h3>
              <p className="text-xs text-neutral-500 max-w-xs leading-relaxed">
                {searchTerm
                  ? 'لم يتم العثور على أي صنف يطابق بحثك، جرّب كلمة بحث أخرى.'
                  : 'لم يتم إضافة أصناف في هذا القسم حالياً، يرجى تصفح باقي الأقسام.'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">
              {filteredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onSelectProduct={(p) => setSelectedProduct(p)}
                />
              ))}
            </div>
          )}
        </section>
      </main>

      {/* Product Detail Customization Modal (Bottom Sheet) */}
      {selectedProduct && (
        <ProductModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
          availableAddons={addons}
        />
      )}

      {/* Floating Cart Action Button */}
      <FloatingCartBar />

      {/* Cart Drawer & Checkout */}
      <TableCartDrawer />

    </div>
  );
};

const TablePage: React.FC = () => {
  return (
    <TableProvider>
      <TableCartProvider>
        <TablePageContent />
      </TableCartProvider>
    </TableProvider>
  );
};

export default TablePage;
