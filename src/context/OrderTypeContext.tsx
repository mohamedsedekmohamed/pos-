import React, { createContext, useContext, useState, useEffect } from 'react';
import { useLanguage } from './LanguageContext';

export type OrderType = 'dinein' | 'takeaway' | 'delivery';

export interface OrderTypeOption {
  type: OrderType;
  label: string;
  iconName: string;
}

export interface SelectedTable {
  id: number;
  name: string;
  hall_id?: number;
  hall_name?: string;
}

export const ORDER_TYPES: OrderTypeOption[] = [
  { type: 'dinein', label: 'طاولة', iconName: 'coffee' },
  { type: 'takeaway', label: 'تيك أواى', iconName: 'bag' },
  { type: 'delivery', label: 'توصيل', iconName: 'truck' },
];

const STORAGE_KEY_ORDER_TYPE = 'pos_order_type';
const STORAGE_KEY_SELECTED_TABLE = 'pos_selected_table';

interface OrderTypeContextType {
  orderType: OrderType;
  setOrderType: (type: OrderType) => void;
  orderTypeLabel: string;
  selectedTable: SelectedTable | null;
  setSelectedTable: (table: SelectedTable | null) => void;
  isTablePickerOpen: boolean;
  setIsTablePickerOpen: (open: boolean) => void;
}

const OrderTypeContext = createContext<OrderTypeContextType | undefined>(undefined);

export const useOrderType = (): OrderTypeContextType => {
  const context = useContext(OrderTypeContext);
  if (!context) {
    throw new Error('useOrderType must be used within an OrderTypeProvider');
  }
  return context;
};

export const OrderTypeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [orderType, setOrderTypeState] = useState<OrderType>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_ORDER_TYPE) as OrderType;
      if (stored === 'takeaway' || stored === 'dinein' || stored === 'delivery') {
        return stored;
      }
    } catch {
      // Ignore parse errors
    }
    return 'dinein';
  });

  const [selectedTable, setSelectedTableState] = useState<SelectedTable | null>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_SELECTED_TABLE);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch {
      // Ignore parse errors
    }
    return null;
  });

  const [isTablePickerOpen, setIsTablePickerOpen] = useState(false);

  const setOrderType = (newType: OrderType) => {
    setOrderTypeState(newType);
    try {
      localStorage.setItem(STORAGE_KEY_ORDER_TYPE, newType);
    } catch {
      // Ignore storage errors
    }
  };

  const setSelectedTable = (table: SelectedTable | null) => {
    setSelectedTableState(table);
    try {
      if (table) {
        localStorage.setItem(STORAGE_KEY_SELECTED_TABLE, JSON.stringify(table));
      } else {
        localStorage.removeItem(STORAGE_KEY_SELECTED_TABLE);
      }
    } catch {
      // Ignore storage errors
    }
  };

  // Sync to localStorage if state changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_ORDER_TYPE, orderType);
    } catch {
      // Ignore storage errors
    }
  }, [orderType]);

  const { t } = useLanguage();
  const orderTypeLabel = t(orderType);

  return (
    <OrderTypeContext.Provider
      value={{
        orderType,
        setOrderType,
        orderTypeLabel,
        selectedTable,
        setSelectedTable,
        isTablePickerOpen,
        setIsTablePickerOpen,
      }}
    >
      {children}
    </OrderTypeContext.Provider>
  );
};
