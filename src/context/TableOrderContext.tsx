import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { TableOrderInfo } from '../types/tableOrder';
import { tableOrderApi } from '../services/tableOrderService';

interface GeoCoords {
  lat: number | null;
  lng: number | null;
}

export interface TableOrderItem {
  id: string;
  productId: number;
  name: string;
  image?: string;
  unitPrice: number;
  quantity: number;
  notes?: string;
  totalPrice: number;
}

interface TableOrderContextType {
  tableId: number | null;
  setTableId: (id: number | null) => void;
  tableCode: string | null;
  setTableCode: (code: string | null) => void;
  tableInfo: TableOrderInfo | null;
  setTableInfo: (info: TableOrderInfo | null) => void;
  lang: 'ar' | 'en';
  setLang: (lang: 'ar' | 'en') => void;
  orderItems: TableOrderItem[];
  addToOrder: (item: TableOrderItem) => Promise<void>;
  updateItemQuantity: (id: string, quantity: number) => Promise<void>;
  removeItem: (id: string) => Promise<void>;
  clearOrder: () => Promise<void>;
  coords: GeoCoords | null;
}

const TableOrderContext = createContext<TableOrderContextType | undefined>(undefined);

const STORAGE_KEY_TABLE = 'table_order_sys_id';
const STORAGE_KEY_CODE = 'table_order_sys_code';
const STORAGE_KEY_LANG = 'table_order_sys_lang';
const STORAGE_KEY_ITEMS = 'table_order_sys_items';

/**
 * Context strictly dedicated to the `/api/table-order/*` system.
 * Completely decoupled from `/api/table/*`.
 */
export const TableOrderProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [tableId, setTableIdState] = useState<number | null>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_TABLE);
    return saved ? parseInt(saved, 10) : null;
  });

  const [tableCode, setTableCodeState] = useState<string | null>(() => {
    return localStorage.getItem(STORAGE_KEY_CODE) || null;
  });

  const [tableInfo, setTableInfo] = useState<TableOrderInfo | null>(null);
  const [coords] = useState<GeoCoords | null>(null);

  const [lang, setLangState] = useState<'ar' | 'en'>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_LANG);
    return (saved === 'en' ? 'en' : 'ar') as 'ar' | 'en';
  });

  const [orderItems, setOrderItems] = useState<TableOrderItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_ITEMS);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_ITEMS, JSON.stringify(orderItems));
    } catch {
      // ignore
    }
  }, [orderItems]);

  const setTableId = (id: number | null) => {
    setTableIdState(id);
    if (id !== null) {
      localStorage.setItem(STORAGE_KEY_TABLE, id.toString());
    } else {
      localStorage.removeItem(STORAGE_KEY_TABLE);
    }
  };

  const setTableCode = (code: string | null) => {
    setTableCodeState(code);
    if (code !== null) {
      localStorage.setItem(STORAGE_KEY_CODE, code);
    } else {
      localStorage.removeItem(STORAGE_KEY_CODE);
    }
  };

  const setLang = (newLang: 'ar' | 'en') => {
    setLangState(newLang);
    localStorage.setItem(STORAGE_KEY_LANG, newLang);
  };

  const addToOrder = async (item: TableOrderItem) => {
    setOrderItems((prev) => [...prev, item]);
    if (tableId || tableCode) {
      try {
        await tableOrderApi.addToCart({
          table_code: tableCode || null,
          table_id: tableId || null,
          hall_table_id: tableId || null,
          product_id: item.productId,
          quantity: item.quantity,
          notes: item.notes,
          lat: coords?.lat,
          lng: coords?.lng,
          latitude: coords?.lat,
          longitude: coords?.lng,
          long: coords?.lng,
          lang,
        });
      } catch (err: any) {
        console.warn('[TableOrder] Add to cart failed:', err?.message);
      }
    }
  };

  const updateItemQuantity = async (id: string, quantity: number) => {
    setOrderItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, quantity, totalPrice: i.unitPrice * quantity } : i))
    );
    const numId = parseInt(id, 10);
    if (!isNaN(numId) && numId > 0) {
      try {
        await tableOrderApi.updateCartItem(numId, {
          quantity,
          lat: coords?.lat,
          lng: coords?.lng,
          lang,
        });
      } catch (err: any) {
        console.warn('[TableOrder] Update cart item failed:', err?.message);
      }
    }
  };

  const removeItem = async (id: string) => {
    setOrderItems((prev) => prev.filter((i) => i.id !== id));
    const numId = parseInt(id, 10);
    if (!isNaN(numId) && numId > 0) {
      try {
        await tableOrderApi.deleteCartItem(numId);
      } catch (err: any) {
        console.warn('[TableOrder] Delete cart item failed:', err?.message);
      }
    }
  };

  const clearOrder = async () => {
    setOrderItems([]);
    if (tableId || tableCode) {
      try {
        await tableOrderApi.clearCart({
          table_code: tableCode || null,
          table_id: tableId || null,
          hall_table_id: tableId || null,
        });
      } catch (err: any) {
        console.warn('[TableOrder] Clear cart failed:', err?.message);
      }
    }
  };

  return (
    <TableOrderContext.Provider
      value={{
        tableId,
        setTableId,
        tableCode,
        setTableCode,
        tableInfo,
        setTableInfo,
        lang,
        setLang,
        orderItems,
        addToOrder,
        updateItemQuantity,
        removeItem,
        clearOrder,
        coords,
      }}
    >
      {children}
    </TableOrderContext.Provider>
  );
};

export const useTableOrder = (): TableOrderContextType => {
  const context = useContext(TableOrderContext);
  if (!context) {
    throw new Error('useTableOrder must be used within a TableOrderProvider');
  }
  return context;
};
