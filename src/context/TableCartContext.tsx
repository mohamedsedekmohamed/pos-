import React, { createContext, useContext, useState, useEffect, useMemo, type ReactNode } from 'react';
import type {
  TableCartItem,
  SelectedVariationState,
  SelectedAddonState,
} from '../types/table';
import { tableApi } from '../services/tableService';
import { useTableContext } from './TableContext';

interface TableCartContextType {
  cart: TableCartItem[];
  addToCart: (item: {
    productId: number;
    name: string;
    image?: string;
    unitPrice: number;
    quantity: number;
    selectedVariations: SelectedVariationState[];
    selectedAddons: SelectedAddonState[];
    notes?: string;
  }) => Promise<void>;
  updateQuantity: (cartItemId: string, quantity: number) => Promise<void>;
  removeFromCart: (cartItemId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  totalItems: number;
  subtotal: number;
  totalPrice: number;
}

const TableCartContext = createContext<TableCartContextType | undefined>(undefined);

const CART_STORAGE_KEY = 'table_cart_items';

export const TableCartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { tableId, lang, coords } = useTableContext();

  const [cart, setCart] = useState<TableCartItem[]>(() => {
    try {
      const saved = localStorage.getItem(CART_STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [isCartOpen, setIsCartOpen] = useState(false);

  // Persist cart locally
  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    } catch {
      // Local storage unavailable or full
    }
  }, [cart]);

  // Sync Cart from backend /api/table/cart if tableId exists
  useEffect(() => {
    if (tableId) {
      tableApi
        .getCart({
          hall_table_id: tableId,
          table_id: tableId,
          lang,
          lat: coords?.lat,
          lng: coords?.lng,
          latitude: coords?.lat,
          longitude: coords?.lng,
        })
        .then((res) => {
          if (res && res.status && Array.isArray(res.data) && res.data.length > 0) {
            const serverItems: TableCartItem[] = res.data.map((item: any) => ({
              id: item.id?.toString() || Math.random().toString(),
              productId: item.product?.id || item.product_id,
              name: item.product?.name || 'وجبة',
              image: item.product?.image,
              unitPrice: item.product?.final_price || item.product?.price || 0,
              quantity: typeof item.quantity === 'number' ? item.quantity : 1,
              selectedVariations: (item.variations || []).flatMap((v: any) =>
                (v.options || []).map((o: any) => ({
                  variationId: parseInt(v.variation_id || v.id, 10),
                  variationName: v.name || '',
                  optionId: parseInt(o.id, 10),
                  optionName: o.name || '',
                  price: o.price || o.final_price || 0,
                }))
              ),
              selectedAddons: (item.addons || []).map((a: any) => ({
                addonId: parseInt(a.addon_id || a.id, 10),
                name: a.name || '',
                price: a.price || a.final_price || 0,
                quantity: 1,
              })),
              notes: item.notes || undefined,
              totalPrice: item.total_final_price || item.total_price || 0,
            }));
            setCart(serverItems);
          }
        })
        .catch((error) => {
          console.warn('[TableCart] Fetch cart from /api/table/cart encountered an issue:', error?.message);
        });
    }
  }, [tableId, lang, coords?.lat, coords?.lng]);

  const calculateItemTotal = (
    unitPrice: number,
    variations: SelectedVariationState[],
    addons: SelectedAddonState[],
    quantity: number
  ) => {
    const varTotal = variations.reduce((sum, v) => sum + (v.price || 0), 0);
    const addonTotal = addons.reduce((sum, a) => sum + (a.price || 0) * (a.quantity || 1), 0);
    return (unitPrice + varTotal + addonTotal) * quantity;
  };

  const addToCart = async (item: {
    productId: number;
    name: string;
    image?: string;
    unitPrice: number;
    quantity: number;
    selectedVariations: SelectedVariationState[];
    selectedAddons: SelectedAddonState[];
    notes?: string;
  }) => {
    const varKey = item.selectedVariations
      .map((v) => `${v.variationId}:${v.optionId}`)
      .sort()
      .join('|');
    const addonKey = item.selectedAddons
      .map((a) => `${a.addonId}:${a.quantity}`)
      .sort()
      .join('|');
    const notesKey = item.notes?.trim() || '';
    const cartItemId = `${item.productId}_${varKey}_${addonKey}_${notesKey}`;

    // Optimistic local update
    setCart((prev) => {
      const existingIdx = prev.findIndex((i) => i.id === cartItemId);
      if (existingIdx > -1) {
        const updated = [...prev];
        const newQty = updated[existingIdx].quantity + item.quantity;
        updated[existingIdx] = {
          ...updated[existingIdx],
          quantity: newQty,
          totalPrice: calculateItemTotal(
            item.unitPrice,
            item.selectedVariations,
            item.selectedAddons,
            newQty
          ),
        };
        return updated;
      } else {
        const newItem: TableCartItem = {
          id: cartItemId,
          productId: item.productId,
          name: item.name,
          image: item.image,
          unitPrice: item.unitPrice,
          quantity: item.quantity,
          selectedVariations: item.selectedVariations,
          selectedAddons: item.selectedAddons,
          notes: item.notes,
          totalPrice: calculateItemTotal(
            item.unitPrice,
            item.selectedVariations,
            item.selectedAddons,
            item.quantity
          ),
        };
        return [...prev, newItem];
      }
    });

    // Call /api/table/cart
    try {
      await tableApi.addToCart({
        table_id: tableId || 0,
        hall_table_id: tableId || 0,
        product_id: item.productId,
        quantity: item.quantity,
        notes: item.notes || '',
        variations: item.selectedVariations.map((v) => ({
          variation_id: v.variationId,
          option_ids: [v.optionId],
        })),
        addons: item.selectedAddons.map((a) => ({
          addon_id: a.addonId,
        })),
        lat: coords?.lat || null,
        lng: coords?.lng || null,
        latitude: coords?.lat || null,
        longitude: coords?.lng || null,
        long: coords?.lng || null,
        lang,
      });
    } catch (err: any) {
      console.warn('[TableCart] Add to /api/table/cart encountered an issue:', err?.message);
    }
  };

  const updateQuantity = async (cartItemId: string, quantity: number) => {
    if (quantity <= 0) {
      await removeFromCart(cartItemId);
      return;
    }

    setCart((prev) =>
      prev.map((item) => {
        if (item.id === cartItemId) {
          return {
            ...item,
            quantity,
            totalPrice: calculateItemTotal(
              item.unitPrice,
              item.selectedVariations,
              item.selectedAddons,
              quantity
            ),
          };
        }
        return item;
      })
    );

    const numId = parseInt(cartItemId, 10);
    if (!isNaN(numId) && numId > 0) {
      try {
        await tableApi.updateCartItem(numId, {
          quantity,
          lat: coords?.lat,
          lng: coords?.lng,
          latitude: coords?.lat,
          longitude: coords?.lng,
          long: coords?.lng,
          lang,
        });
      } catch (err: any) {
        console.warn('[TableCart] Update /api/table/cart item encountered an issue:', err?.message);
      }
    }
  };

  const removeFromCart = async (cartItemId: string) => {
    setCart((prev) => prev.filter((i) => i.id !== cartItemId));

    const numId = parseInt(cartItemId, 10);
    if (!isNaN(numId) && numId > 0) {
      try {
        await tableApi.deleteCartItem(numId, {
          lat: coords?.lat,
          lng: coords?.lng,
          latitude: coords?.lat,
          longitude: coords?.lng,
          long: coords?.lng,
        });
      } catch (err: any) {
        console.warn('[TableCart] Delete /api/table/cart item encountered an issue:', err?.message);
      }
    }
  };

  const clearCart = async () => {
    setCart([]);
    try {
      await tableApi.clearCart({
        hall_table_id: tableId,
        table_id: tableId,
        lat: coords?.lat,
        lng: coords?.lng,
        latitude: coords?.lat,
        longitude: coords?.lng,
        long: coords?.lng,
      });
    } catch (err: any) {
      console.warn('[TableCart] Clear /api/table/cart encountered an issue:', err?.message);
    }
  };

  const { totalItems, subtotal } = useMemo(() => {
    const count = cart.reduce((sum, i) => sum + i.quantity, 0);
    const sub = cart.reduce((sum, i) => sum + i.totalPrice, 0);
    return {
      totalItems: count,
      subtotal: sub,
    };
  }, [cart]);

  const totalPrice = subtotal;

  return (
    <TableCartContext.Provider
      value={{
        cart,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        isCartOpen,
        setIsCartOpen,
        totalItems,
        subtotal,
        totalPrice,
      }}
    >
      {children}
    </TableCartContext.Provider>
  );
};

export const useTableCart = (): TableCartContextType => {
  const context = useContext(TableCartContext);
  if (!context) {
    throw new Error('useTableCart must be used within a TableCartProvider');
  }
  return context;
};
