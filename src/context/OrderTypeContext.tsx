import React, { createContext, useContext, useState, useEffect } from 'react';
import { useLanguage } from './LanguageContext';

export type OrderType = 'takeaway' | 'dinein' | 'delivery';

export interface OrderTypeOption {
  type: OrderType;
  label: string;
  iconName: string;
}

export const ORDER_TYPES: OrderTypeOption[] = [
  { type: 'takeaway', label: 'سفري', iconName: 'bag' },
  { type: 'dinein', label: 'محلي', iconName: 'coffee' },
  { type: 'delivery', label: 'توصيل', iconName: 'truck' },
];

const STORAGE_KEY_ORDER_TYPE = 'pos_order_type';

interface OrderTypeContextType {
  orderType: OrderType;
  setOrderType: (type: OrderType) => void;
  orderTypeLabel: string;
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
    return 'takeaway';
  });

  const setOrderType = (newType: OrderType) => {
    setOrderTypeState(newType);
    try {
      localStorage.setItem(STORAGE_KEY_ORDER_TYPE, newType);
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
      }}
    >
      {children}
    </OrderTypeContext.Provider>
  );
};
