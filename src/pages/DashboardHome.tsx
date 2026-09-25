import React, { useState, useCallback, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { cashierApi } from '../services/cashierService';
import { useAuth } from '../context/AuthContext';
import { useShift } from '../context/ShiftContext';
import { useOrderType } from '../context/OrderTypeContext';
import CategoryTabs from '../components/cashier/CategoryTabs';
import ProductGrid from '../components/cashier/ProductGrid';
import Cart from '../components/cashier/Cart';
import ProductModal from '../components/cashier/ProductModal';
import CheckoutModal, { type CheckoutMeta } from '../components/cashier/CheckoutModal';
import ReceiptModal, { type ReceiptOrderData } from '../components/cashier/ReceiptModal';
import ShiftBar from '../components/cashier/ShiftBar';
import StockRecipeConfirmModal from '../components/cashier/StockRecipeConfirmModal';
import { useLanguage } from '../context/LanguageContext';
import type { Product, AddToCartPayload, UpdateCartPayload, CheckoutPayload } from '../types/cashier';

const DashboardHome: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { hasActiveShift, isCheckingShift, isEndModalOpen, activeShift, activeDevice } = useShift();
  const { orderType, orderTypeLabel } = useOrderType();
  const { t, renderLocalized } = useLanguage();

  // Redirect to shift page if no active shift is found (and modal is not open)
  useEffect(() => {
    if (!isCheckingShift && !hasActiveShift && !isEndModalOpen) {
      navigate('/dashboard/shift', { replace: true });
    }
  }, [isCheckingShift, hasActiveShift, isEndModalOpen, navigate]);

  // ── State ──
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
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

  // ── API Queries ──
  const { data: categories = [], isLoading: loadingCategories } = useQuery({
    queryKey: ['parent-categories'],
    queryFn: cashierApi.getParentCategories,
  });

  // Filter only product-type categories for display
  const productCategories = categories.filter((c) => c.type === 'product');

  const { data: products = [], isLoading: loadingProducts } = useQuery({
    queryKey: ['products', selectedCategoryId],
    queryFn: () =>
      cashierApi.getProducts(
        selectedCategoryId ? { category_id: selectedCategoryId } : undefined
      ),
  });

  const { data: addons = [] } = useQuery({
    queryKey: ['addons'],
    queryFn: cashierApi.getAddons,
  });

  // ── Cart API ──
  const { data: cartData, isLoading: loadingCart } = useQuery({
    queryKey: ['cart', orderType],
    queryFn: () => cashierApi.getCart(orderType),
  });

  const cartItems = cartData?.data || [];
  const grandTotals = cartData?.grand_totals;

  const addMutation = useMutation({
    mutationFn: cashierApi.addToCart,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
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
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['cart'] }),
  });

  const removeMutation = useMutation({
    mutationFn: cashierApi.removeCartItem,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['cart'] }),
  });

  const clearMutation = useMutation({
    mutationFn: cashierApi.clearCart,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['cart'] }),
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
          tableName: pending.meta?.tableName,
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
      setIsCheckoutModalOpen(false);
    },
  });

  // ── Cart Actions ──
  const handleAddToCart = useCallback(
    (payload: AddToCartPayload) => {
      addMutation.mutate({
        ...payload,
        without_recipe: payload.without_recipe ?? false,
      });
    },
    [addMutation]
  );

  const handleConfirmWithoutRecipe = useCallback(() => {
    if (!stockConfirm?.payload) return;
    const retryPayload: AddToCartPayload = {
      ...stockConfirm.payload,
      without_recipe: true,
    };
    addMutation.mutate(retryPayload);
  }, [stockConfirm, addMutation]);

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
    [cartItems, orderType, updateMutation, removeMutation]
  );

  const handleRemoveItem = useCallback(
    (id: number) => {
      removeMutation.mutate(id);
    },
    [removeMutation]
  );

  const handleClearCart = useCallback(() => {
    clearMutation.mutate();
  }, [clearMutation]);

  const handleCheckoutSubmit = useCallback(
    (payload: CheckoutPayload, meta?: CheckoutMeta) => {
      pendingOrderRef.current = {
        payload,
        meta,
        items: [...cartItems],
        totals: grandTotals ? { ...grandTotals } : undefined,
      };
      checkoutMutation.mutate(payload);
    },
    [cartItems, grandTotals, checkoutMutation]
  );

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)]">
      {/* Shift Bar */}
      <ShiftBar />

      {/* Main Content */}
      <div className="flex flex-col lg:flex-row flex-1 min-h-0">
        {/* Left: Products Area */}
        <div className="flex-1 flex flex-col min-w-0 bg-slate-50 dark:bg-slate-900 overflow-hidden">
          {/* Category Tabs */}
          <CategoryTabs
            categories={productCategories}
            selectedId={selectedCategoryId}
            onSelect={setSelectedCategoryId}
            isLoading={loadingCategories}
          />

          {/* Divider */}
          <div className="h-px bg-slate-200 dark:bg-slate-700 flex-shrink-0" />

          {/* Product Grid */}
          <div className="flex-1 overflow-y-auto">
            <ProductGrid
              products={products}
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
    </div>
  );
};

export default DashboardHome;
