import React, { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { FiSearch, FiX } from 'react-icons/fi';
import { cashierApi } from '../services/cashierService';
import { useAuth } from '../context/AuthContext';
import { useShift } from '../context/ShiftContext';
import { useOrderType } from '../context/OrderTypeContext';
import CategoryTabs from '../components/cashier/CategoryTabs';
import SubCategoryChips from '../components/cashier/SubCategoryChips';
import ProductGrid from '../components/cashier/ProductGrid';
import Cart from '../components/cashier/Cart';
import ProductModal from '../components/cashier/ProductModal';
import CheckoutModal, { type CheckoutMeta } from '../components/cashier/CheckoutModal';
import ReceiptModal, { type ReceiptOrderData } from '../components/cashier/ReceiptModal';
import ShiftBar from '../components/cashier/ShiftBar';
import StockRecipeConfirmModal from '../components/cashier/StockRecipeConfirmModal';
import TablePickerModal from '../components/cashier/TablePickerModal';
import OrdersManagementModal from '../components/cashier/OrdersManagementModal';
import { useLanguage } from '../context/LanguageContext';
import { useToast } from '../context/ToastContext';
import type { Product, AddToCartPayload, UpdateCartPayload, CheckoutPayload, Order } from '../types/cashier';

const DashboardHome: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { hasActiveShift, isCheckingShift, isEndModalOpen, activeShift, activeDevice } = useShift();
  const { orderType, orderTypeLabel, selectedTable, isTablePickerOpen, setIsTablePickerOpen } = useOrderType();
  const { t, renderLocalized, language } = useLanguage();
  const { showError, showSuccess } = useToast();

  // Redirect to shift page if no active shift is found (and modal is not open)
  useEffect(() => {
    if (!isCheckingShift && !hasActiveShift && !isEndModalOpen) {
      navigate('/dashboard/shift', { replace: true });
    }
  }, [isCheckingShift, hasActiveShift, isEndModalOpen, navigate]);

  // If in dine-in mode and no table is selected yet, prompt cashier to choose a table
  useEffect(() => {
    if (orderType === 'dinein' && !selectedTable) {
      setIsTablePickerOpen(true);
    }
  }, [orderType, selectedTable, setIsTablePickerOpen]);

  // ── State ──
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [selectedSubCategoryId, setSelectedSubCategoryId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
  const [isOrdersModalOpen, setIsOrdersModalOpen] = useState(false);
  const [receiptOrderData, setReceiptOrderData] = useState<ReceiptOrderData | null>(null);
  const [stockConfirm, setStockConfirm] = useState<{
    isOpen: boolean;
    payload: AddToCartPayload;
    serverMessage?: string;
    productName?: string;
  } | null>(null);
  const pendingOrderRef = useRef<{
    payload: CheckoutPayload;
    meta?: CheckoutMeta;
    items: typeof cartItems;
    totals?: typeof grandTotals;
  } | null>(null);
  const queryClient = useQueryClient();

  // Reset subcategory when parent category changes
  const handleSelectCategory = useCallback((id: number | null) => {
    setSelectedCategoryId(id);
    setSelectedSubCategoryId(null);
  }, []);

  // ── API Queries ──
  // 1. Parent Categories
  const { data: categories = [], isLoading: loadingCategories } = useQuery({
    queryKey: ['parent-categories', language],
    queryFn: () => cashierApi.getParentCategories({ lang: language }),
  });

  // Display active parent categories (if some explicitly marked 'product', prioritize; otherwise show all active)
  const displayCategories = categories.some((c) => c.type === 'product')
    ? categories.filter((c) => c.type === 'product' && c.status !== false)
    : categories.filter((c) => c.status !== false);

  // 2. Sub Categories (Filterable by parent category_id)
  const { data: subCategories = [], isLoading: loadingSubCategories } = useQuery({
    queryKey: ['sub-categories', selectedCategoryId, language],
    queryFn: () =>
      cashierApi.getSubCategories({
        category_id: selectedCategoryId || undefined,
        lang: language,
      }),
  });

  // 3. Products (Filterable by category_id & sub_category_id)
  const { data: products = [], isLoading: loadingProducts } = useQuery({
    queryKey: ['products', selectedCategoryId, selectedSubCategoryId, language],
    queryFn: () =>
      cashierApi.getProducts({
        ...(selectedCategoryId ? { category_id: selectedCategoryId } : {}),
        ...(selectedSubCategoryId ? { sub_category_id: selectedSubCategoryId } : {}),
        lang: language,
      }),
  });

  // 4. Addons
  const { data: addons = [] } = useQuery({
    queryKey: ['addons', language],
    queryFn: () => cashierApi.getAddons({ lang: language }),
  });

  // ── Client-side Filter for Search ──
  const filteredProducts = useMemo(() => {
    if (!searchQuery.trim()) return products;
    const q = searchQuery.toLowerCase().trim();
    return products.filter((p) => {
      const pName = (renderLocalized(p.name) || (typeof p.name === 'string' ? p.name : '')).toLowerCase();
      const pDesc = (renderLocalized(p.description) || (typeof p.description === 'string' ? p.description : '')).toLowerCase();
      const pPrice = String(p.final_price || p.price);
      return pName.includes(q) || pDesc.includes(q) || pPrice.includes(q);
    });
  }, [products, searchQuery, renderLocalized]);

  // ── Cart API ──
  const { data: cartData, isLoading: loadingCart } = useQuery({
    queryKey: ['cart', orderType, orderType === 'dinein' ? selectedTable?.id : null, language],
    queryFn: () =>
      cashierApi.getCart(
        orderType,
        orderType === 'dinein' ? selectedTable?.id : undefined
      ),
    enabled: orderType !== 'dinein' || !!selectedTable?.id,
  });

  const cartItems = cartData?.data || [];
  const grandTotals = cartData?.grand_totals;

  const addMutation = useMutation({
    mutationFn: cashierApi.addToCart,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      queryClient.invalidateQueries({ queryKey: ['tables'] });
      setStockConfirm(null);
    },
    onError: (error: any, variables: AddToCartPayload) => {
      // If without_recipe wasn't already true, this failure could be stock/recipe exhaustion
      if (!variables.without_recipe) {
        const isAuthError = error?.response?.status === 401;
        if (!isAuthError) {
          const serverMessage =
            error?.response?.data?.message ||
            error?.response?.data?.error ||
            error?.message;
          const matchedProd = products.find((p) => p.id === variables.product_id);
          const pName = matchedProd
            ? renderLocalized(matchedProd.name) || (typeof matchedProd.name === 'string' ? matchedProd.name : '')
            : undefined;

          setStockConfirm({
            isOpen: true,
            payload: variables,
            serverMessage: typeof serverMessage === 'string' ? serverMessage : undefined,
            productName: pName,
          });
          return;
        }
      }

      const msg =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        error?.message ||
        t('error_occurred');
      alert(msg);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: UpdateCartPayload }) =>
      cashierApi.updateCartItem(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      queryClient.invalidateQueries({ queryKey: ['tables'] });
    },
  });

  const removeMutation = useMutation({
    mutationFn: cashierApi.removeCartItem,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      queryClient.invalidateQueries({ queryKey: ['tables'] });
    },
  });

  const clearMutation = useMutation({
    mutationFn: cashierApi.clearCart,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      queryClient.invalidateQueries({ queryKey: ['tables'] });
    },
  });

  const checkoutMutation = useMutation({
    mutationFn: cashierApi.checkout,
    onSuccess: (data: any) => {
      const pending = pendingOrderRef.current;
      if (pending) {
        const orderId =
          data?.data?.id ||
          data?.id ||
          Math.floor(100000 + Math.random() * 900000);

        setReceiptOrderData({
          orderId,
          orderType: pending.payload.module,
          orderTypeLabel: orderTypeLabel,
          customerName: pending.payload.name,
          customerPhone: pending.payload.phone,
          deliveryAddress: pending.payload.address,
          tableName: pending.meta?.tableName || selectedTable?.name,
          orderNote: pending.payload.note,
          items: pending.items,
          totals: pending.totals || {
            grand_total_price: 0,
            grand_total_discount: 0,
            grand_total_tax: 0,
            grand_final_price: 0,
          },
          createdAt: new Date().toISOString(),
          cashierName: user?.name,
          deviceName: activeDevice?.name,
          branchName: activeShift?.branch_id ? `Branch #${activeShift.branch_id}` : undefined,
        });
        setIsReceiptModalOpen(true);
      }
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      queryClient.invalidateQueries({ queryKey: ['tables'] });
      queryClient.invalidateQueries({ queryKey: ['cashier', 'orders'] });
      setIsCheckoutModalOpen(false);
      showSuccess(t('checkout_success', 'تم إنشاء الطلب بنجاح'));
    },
    onError: (err: any) => {
      const serverMessage =
        err?.response?.data?.message ||
        (err?.response?.data?.errors
          ? Object.values(err.response.data.errors).flat().join('\n')
          : null) ||
        err?.message ||
        t('error_occurred');
      showError(serverMessage);
    },
  });

  // ── Cart Actions ──
  const handleAddToCart = useCallback(
    (payload: AddToCartPayload) => {
      if (orderType === 'dinein' && !selectedTable?.id) {
        setIsTablePickerOpen(true);
        alert(t('table_required_alert'));
        return;
      }

      addMutation.mutate({
        ...payload,
        table_id: orderType === 'dinein' ? selectedTable?.id : undefined,
        hall_table_id: orderType === 'dinein' ? selectedTable?.id : undefined,
        without_recipe: payload.without_recipe ?? false,
      });
    },
    [addMutation, orderType, selectedTable, setIsTablePickerOpen, t]
  );

  const handleConfirmWithoutRecipe = useCallback(() => {
    if (!stockConfirm?.payload) return;
    const retryPayload: AddToCartPayload = {
      ...stockConfirm.payload,
      table_id: orderType === 'dinein' ? selectedTable?.id : undefined,
      hall_table_id: orderType === 'dinein' ? selectedTable?.id : undefined,
      without_recipe: true,
    };
    addMutation.mutate(retryPayload);
  }, [stockConfirm, addMutation, orderType, selectedTable]);

  const handleCancelWithoutRecipe = useCallback(() => {
    setStockConfirm(null);
  }, []);

  const handleUpdateQuantity = useCallback(
    (id: number, delta: number) => {
      const item = cartItems.find((i) => i.id === id);
      if (!item) return;

      const currentQty = typeof item.quantity === 'number' ? item.quantity : 1;
      const newQty = currentQty + delta;

      if (newQty <= 0) {
        removeMutation.mutate(id);
        return;
      }

      const updatePayload: UpdateCartPayload = {
        module: orderType,
        table_id: orderType === 'dinein' ? selectedTable?.id : undefined,
        hall_table_id: orderType === 'dinein' ? selectedTable?.id : undefined,
        quantity: newQty,
        notes: item.notes,
        variations: item.variations?.map((v) => ({
          variation_id: parseInt(v.variation_id, 10) || 0,
          option_ids: v.options.map((o) => parseInt(o.id, 10) || 0),
        })),
        addons: item.addons?.map((a) => ({
          addon_id: parseInt(a.addon_id, 10) || 0,
        })),
      };

      updateMutation.mutate({ id, payload: updatePayload });
    },
    [cartItems, orderType, selectedTable, updateMutation, removeMutation]
  );

  const handleRemoveItem = useCallback(
    (id: number) => {
      removeMutation.mutate(id);
    },
    [removeMutation]
  );

  const handleClearCart = useCallback(() => {
    clearMutation.mutate({
      module: orderType,
      table_id: orderType === 'dinein' ? selectedTable?.id : undefined,
    });
  }, [clearMutation, orderType, selectedTable]);

  const handleCheckoutSubmit = useCallback(
    (payload: CheckoutPayload, meta?: CheckoutMeta) => {
      const finalPayload: CheckoutPayload = {
        ...payload,
        module: orderType,
        hall_table_id: orderType === 'dinein' ? (selectedTable?.id || payload.hall_table_id) : payload.hall_table_id,
        table_id: orderType === 'dinein' ? (selectedTable?.id || payload.table_id) : payload.table_id,
      };

      pendingOrderRef.current = {
        payload: finalPayload,
        meta: {
          ...meta,
          tableName: selectedTable?.name || meta?.tableName,
        },
        items: [...cartItems],
        totals: grandTotals ? { ...grandTotals } : undefined,
      };
      checkoutMutation.mutate(finalPayload);
    },
    [cartItems, grandTotals, checkoutMutation, orderType, selectedTable]
  );

  // Reprint past receipt from Orders modal
  const handleReprintReceipt = useCallback(
    (order: Order) => {
      const mappedReceipt: ReceiptOrderData = {
        orderId: order.id,
        orderType: (order.module as any) || 'takeaway',
        orderTypeLabel:
          order.module === 'dinein'
            ? t('dinein')
            : order.module === 'delivery'
            ? t('delivery')
            : t('takeaway'),
        customerName: order.name,
        customerPhone: order.phone,
        deliveryAddress: order.address,
        tableName: order.hall_table?.name || (order.hall_table_id ? `Table #${order.hall_table_id}` : null),
        orderNote: order.note,
        items: (order.products || []).map((p: any) => ({
          id: p.id,
          module: order.module,
          quantity: p.quantity || 1,
          notes: p.note,
          product: {
            id: p.product_id || p.id,
            name: p.name || p.product?.name,
            price: p.price || 0,
            final_price: p.price || 0,
            image: p.product?.image || '',
            description: '',
            discount_val: 0,
            tax_val: 0,
          },
          variations: [],
          addons: [],
          total_price: (p.price || 0) * (p.quantity || 1),
          total_discount: 0,
          total_tax: 0,
          total_final_price: (p.price || 0) * (p.quantity || 1),
          cashier_id: order.cashier_id,
          cashier_man_id: order.cashier_man_id,
          branch_id: order.branch_id || 1,
        })),
        totals: {
          grand_total_price: Number(order.total) || 0,
          grand_total_discount: Number(order.total_discount) || 0,
          grand_total_tax: Number(order.total_tax) || 0,
          grand_final_price: Number(order.final_price) || Number(order.total) || 0,
        },
        createdAt: order.created_at || new Date().toISOString(),
        cashierName: order.cashier_man?.name || user?.name,
        deviceName: order.cashier?.name || activeDevice?.name,
        branchName: order.branch?.name
          ? renderLocalized(order.branch.name) || (typeof order.branch.name === 'string' ? order.branch.name : undefined)
          : undefined,
      };
      setReceiptOrderData(mappedReceipt);
      setIsReceiptModalOpen(true);
    },
    [t, renderLocalized, user?.name, activeDevice?.name]
  );

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)]">
      {/* Shift Bar with Orders Button */}
      <ShiftBar onOpenOrdersModal={() => setIsOrdersModalOpen(true)} />

      {/* Main Content */}
      <div className="flex flex-col lg:flex-row flex-1 min-h-0">
        {/* Left: Products Area */}
        <div className="flex-1 flex flex-col min-w-0 bg-slate-50 dark:bg-slate-900 overflow-hidden">
          {/* Category Tabs */}
          <CategoryTabs
            categories={displayCategories}
            selectedId={selectedCategoryId}
            onSelect={handleSelectCategory}
            isLoading={loadingCategories}
          />

          {/* Subcategory Chips (when parent category is selected) */}
          {selectedCategoryId && (
            <SubCategoryChips
              subCategories={subCategories}
              selectedId={selectedSubCategoryId}
              onSelect={setSelectedSubCategoryId}
              isLoading={loadingSubCategories}
            />
          )}

          {/* Search Bar & Item Count Bar */}
          <div className="px-4 py-2 bg-white dark:bg-slate-800/60 border-b border-slate-200/80 dark:border-slate-700/80 flex items-center justify-between gap-3">
            <div className="relative flex-1 max-w-sm sm:max-w-md">
              <FiSearch className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('search_products')}
                className="w-full ps-9 pe-9 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-700/60 border border-slate-200 dark:border-slate-600 text-xs font-semibold text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute end-2.5 top-1/2 -translate-y-1/2 p-1 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-white cursor-pointer"
                >
                  <FiX className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
            <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400 shrink-0">
              {filteredProducts.length} {t('items_count')}
            </div>
          </div>

          {/* Product Grid */}
          <div className="flex-1 overflow-y-auto">
            <ProductGrid
              products={filteredProducts}
              isLoading={loadingProducts}
              onProductClick={setSelectedProduct}
            />
          </div>
        </div>

        {/* Right: Cart */}
        <div className="w-full lg:w-[340px] h-[45vh] lg:h-auto flex-shrink-0 border-t lg:border-t-0 lg:border-r border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
          <Cart
            items={cartItems}
            grandTotals={grandTotals}
            isLoading={loadingCart || addMutation.isPending || updateMutation.isPending || removeMutation.isPending || clearMutation.isPending || checkoutMutation.isPending}
            onUpdateQuantity={handleUpdateQuantity}
            onRemoveItem={handleRemoveItem}
            onClearCart={handleClearCart}
            onCheckoutClick={() => setIsCheckoutModalOpen(true)}
          />
        </div>
      </div>

      {/* Product Modal */}
      <ProductModal
        product={selectedProduct}
        addons={addons}
        onClose={() => setSelectedProduct(null)}
        onAddToCart={handleAddToCart}
      />

      {/* Checkout Modal */}
      <CheckoutModal
        isOpen={isCheckoutModalOpen}
        onClose={() => setIsCheckoutModalOpen(false)}
        onCheckout={handleCheckoutSubmit}
        isSubmitting={checkoutMutation.isPending}
      />

      {/* Receipt Modal */}
      <ReceiptModal
        isOpen={isReceiptModalOpen}
        onClose={() => setIsReceiptModalOpen(false)}
        orderData={receiptOrderData}
      />

      {/* Stock / Recipe Confirmation Modal */}
      <StockRecipeConfirmModal
        isOpen={Boolean(stockConfirm?.isOpen)}
        onClose={handleCancelWithoutRecipe}
        onConfirm={handleConfirmWithoutRecipe}
        isSubmitting={addMutation.isPending}
        serverMessage={stockConfirm?.serverMessage}
        productName={stockConfirm?.productName}
      />

      {/* Table Picker Modal */}
      <TablePickerModal
        isOpen={isTablePickerOpen}
        onClose={() => setIsTablePickerOpen(false)}
      />

      {/* Orders & Delivery Management Modal */}
      <OrdersManagementModal
        isOpen={isOrdersModalOpen}
        onClose={() => setIsOrdersModalOpen(false)}
        onReprintReceipt={handleReprintReceipt}
      />
    </div>
  );
};

export default DashboardHome;
