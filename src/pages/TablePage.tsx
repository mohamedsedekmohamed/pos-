import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { TableProvider, useTableContext } from '../context/TableContext';
import { TableCartProvider } from '../context/TableCartContext';
import { tableApi } from '../services/tableService';
import type { TableProduct } from '../types/table';

// Table Components
import { TableHeader } from '../components/table/TableHeader';
import { CategoryTabs } from '../components/table/CategoryTabs';
import { ProductCard } from '../components/table/ProductCard';
import { ProductModal } from '../components/table/ProductModal';
import { FloatingCartBar } from '../components/table/FloatingCartBar';
import { TableCartDrawer } from '../components/table/TableCartDrawer';
import { TableSelectModal } from '../components/table/TableSelectModal';
import {
  CategoryTabsSkeleton,
  ProductGridSkeleton,
} from '../components/table/TableSkeletons';

import { FiSearch, FiPackage } from 'react-icons/fi';

const TablePageContent: React.FC = () => {
  const [searchParams] = useSearchParams();
  const { tableId, setTableId, setTableInfo, lang } = useTableContext();

  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [selectedSubCategoryId, setSelectedSubCategoryId] = useState<number | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<TableProduct | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isTableModalOpen, setIsTableModalOpen] = useState(false);

  // Sync tableId from URL query param if present (?tableId=1)
  useEffect(() => {
    const qTable = searchParams.get('tableId') || searchParams.get('table');
    if (qTable) {
      const parsed = parseInt(qTable, 10);
      if (!isNaN(parsed) && parsed > 0) {
        setTableId(parsed);
      }
    } else if (!tableId) {
      // Default to table 1 if neither URL nor storage has table
      setTableId(1);
    }
  }, [searchParams]);

  // Fetch Table Information
  const { data: tableData } = useQuery({
    queryKey: ['tableInfo', tableId, lang],
    queryFn: () => tableApi.getTableInfo(tableId!, lang),
    enabled: !!tableId,
  });

  useEffect(() => {
    if (tableData) {
      setTableInfo(tableData);
    }
  }, [tableData, setTableInfo]);

  // Fetch Parent Categories
  const { data: categories = [], isLoading: loadingCategories } = useQuery({
    queryKey: ['tableCategories', lang],
    queryFn: () => tableApi.getParentCategories(lang),
  });

  // Fetch Sub Categories
  const { data: subCategories = [], isLoading: loadingSubCategories } = useQuery({
    queryKey: ['tableSubCategories', selectedCategoryId, lang],
    queryFn: () => tableApi.getSubCategories(selectedCategoryId, lang),
    enabled: selectedCategoryId !== null,
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
  });

  // Fetch Addons
  const { data: addons = [] } = useQuery({
    queryKey: ['tableAddons', lang],
    queryFn: () => tableApi.getAddons(lang),
  });

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
      <TableHeader onOpenTableModal={() => setIsTableModalOpen(true)} />

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

      {/* Table Change Modal */}
      <TableSelectModal
        isOpen={isTableModalOpen}
        onClose={() => setIsTableModalOpen(false)}
      />
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
