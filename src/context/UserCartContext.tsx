import React, { createContext, useContext, useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { userApi } from '../services/userService';
import { useUserUUID } from '../hooks/useUserUUID';
import { useLanguage } from './LanguageContext';
import type {
  UserCartItem,
  UserGrandTotals,
  UserOrderModule,
  UserAddToCartPayload,
  UserUpdateCartPayload,
} from '../types/user';

interface UserCartContextType {
  uuId: string;
  module: UserOrderModule;
  setModule: (module: UserOrderModule) => void;
  cartItems: UserCartItem[];
  grandTotals: UserGrandTotals;
  itemCount: number;
  isLoading: boolean;
  isFetching: boolean;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  openCart: () => void;
  closeCart: () => void;
  
  // Actions
  addToCart: (payload: Omit<UserAddToCartPayload, 'uu_id' | 'module'>) => Promise<any>;
  updateItemQuantity: (cartId: number, quantity: number, existingItem?: UserCartItem) => Promise<any>;
  removeItem: (cartId: number) => Promise<any>;
  clearCart: () => Promise<any>;
  refetchCart: () => void;

  // Mutation states
  isAdding: boolean;
  isUpdating: boolean;
  isRemoving: boolean;
  isClearing: boolean;
}

const defaultGrandTotals: UserGrandTotals = {
  grand_total_price: 0,
  grand_total_discount: 0,
  grand_total_tax: 0,
  grand_final_price: 0,
};

const UserCartContext = createContext<UserCartContextType | undefined>(undefined);

export const useUserCart = (): UserCartContextType => {
  const context = useContext(UserCartContext);
  if (!context) {
    throw new Error('useUserCart must be used within a UserCartProvider');
  }
  return context;
};

export const UserCartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { uuId } = useUserUUID();
  const { language } = useLanguage();
  const queryClient = useQueryClient();

  const [module, setModule] = useState<UserOrderModule>('delivery');
  const [isCartOpen, setIsCartOpen] = useState(false);

  const cartQueryKey = useMemo(
    () => ['user-cart', uuId, module, language] as const,
    [uuId, module, language]
  );

  // ── Query: Fetch Cart ──
  const {
    data: cartData,
    isLoading,
    isFetching,
    refetch: refetchCart,
  } = useQuery({
    queryKey: cartQueryKey,
    queryFn: () => userApi.getCart({ module, lang: language }),
    enabled: Boolean(uuId),
    staleTime: 1000 * 30, // 30s
    retry: 1,
  });

  const cartItems = cartData?.data || [];
  const grandTotals = cartData?.grand_totals || defaultGrandTotals;
  const itemCount = useMemo(
    () => cartItems.reduce((acc, item) => acc + (item.quantity || 1), 0),
    [cartItems]
  );

  // ── Mutation: Add to Cart ──
  const addMutation = useMutation({
    mutationFn: (payload: Omit<UserAddToCartPayload, 'uu_id' | 'module'>) =>
      userApi.addToCart({
        ...payload,
        uu_id: uuId,
        module,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-cart', uuId] });
    },
  });

  // ── Mutation: Update Cart Item ──
  const updateMutation = useMutation({
    mutationFn: ({ cartId, payload }: { cartId: number; payload: UserUpdateCartPayload }) =>
      userApi.updateCartItem(cartId, {
        ...payload,
        uu_id: uuId,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-cart', uuId] });
    },
  });

  // ── Mutation: Delete Cart Item ──
  const deleteMutation = useMutation({
    mutationFn: (cartId: number) => userApi.deleteCartItem(cartId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-cart', uuId] });
    },
  });

  // ── Mutation: Clear Cart ──
  const clearMutation = useMutation({
    mutationFn: () => userApi.clearCart(module),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-cart', uuId] });
    },
  });

  // Action Helpers
  const addToCart = async (payload: Omit<UserAddToCartPayload, 'uu_id' | 'module'>) => {
    return addMutation.mutateAsync(payload);
  };

  const updateItemQuantity = async (
    cartId: number,
    quantity: number,
    existingItem?: UserCartItem
  ) => {
    if (quantity <= 0) {
      return deleteMutation.mutateAsync(cartId);
    }

    const payload: UserUpdateCartPayload = {
      uu_id: uuId,
      quantity,
      notes: existingItem?.notes || undefined,
      variations: existingItem?.variations?.map((v) => ({
        variation_id: v.variation_id,
        option_ids: v.options.map((opt) => opt.id),
      })),
      addons: existingItem?.addons?.map((a) => ({
        addon_id: a.addon_id,
      })),
    };

    return updateMutation.mutateAsync({ cartId, payload });
  };

  const removeItem = async (cartId: number) => {
    return deleteMutation.mutateAsync(cartId);
  };

  const clearCart = async () => {
    return clearMutation.mutateAsync();
  };

  return (
    <UserCartContext.Provider
      value={{
        uuId,
        module,
        setModule,
        cartItems,
        grandTotals,
        itemCount,
        isLoading,
        isFetching,
        isCartOpen,
        setIsCartOpen,
        openCart: () => setIsCartOpen(true),
        closeCart: () => setIsCartOpen(false),
        addToCart,
        updateItemQuantity,
        removeItem,
        clearCart,
        refetchCart,
        isAdding: addMutation.isPending,
        isUpdating: updateMutation.isPending,
        isRemoving: deleteMutation.isPending,
        isClearing: clearMutation.isPending,
      }}
    >
      {children}
    </UserCartContext.Provider>
  );
};
