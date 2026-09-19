import React, { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { cashierApi } from '../services/cashierService';
import { useShift } from '../context/ShiftContext';
import CategoryTabs from '../components/cashier/CategoryTabs';
import ProductGrid from '../components/cashier/ProductGrid';
import Cart from '../components/cashier/Cart';
import ProductModal from '../components/cashier/ProductModal';
import CheckoutModal from '../components/cashier/CheckoutModal';
import ShiftBar from '../components/cashier/ShiftBar';
import type { Product, AddToCartPayload, UpdateCartPayload, CheckoutPayload } from '../types/cashier';

const DashboardHome: React.FC = () => {
  const navigate = useNavigate();
  const { hasActiveShift, isCheckingShift } = useShift();

  // Redirect to shift page if no active shift is found
  useEffect(() => {
    if (!isCheckingShift && !hasActiveShift) {
      navigate('/dashboard/shift', { replace: true });
    }
  }, [isCheckingShift, hasActiveShift, navigate]);

  // ── State ──
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
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
    queryKey: ['cart', 'takeaway'],
    queryFn: () => cashierApi.getCart('takeaway'),
  });

  const cartItems = cartData?.data || [];
  const grandTotals = cartData?.grand_totals;

  const addMutation = useMutation({
    mutationFn: cashierApi.addToCart,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['cart'] }),
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      setIsCheckoutModalOpen(false);
      // Optional: show a success toast here
    },
  });

  // ── Cart Actions ──
  const handleAddToCart = useCallback(
    (payload: AddToCartPayload) => {
      addMutation.mutate(payload);
    },
    [addMutation]
  );

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
        module: (item.module || 'takeaway') as 'takeaway' | 'dinein' | 'delivery',
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
    [cartItems, updateMutation, removeMutation]
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

  const handleCheckoutSubmit = useCallback((payload: CheckoutPayload) => {
    checkoutMutation.mutate(payload);
  }, [checkoutMutation]);

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
    </div>
  );
};

export default DashboardHome;
