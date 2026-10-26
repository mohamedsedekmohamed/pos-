export type OrderStatusType =
  | 'pending'
  | 'preparing'
  | 'done'
  | 'pickup'
  | 'out_of_delivery'
  | 'delivered'
  | 'canceled'
  | 'cancelled'
  | 'return'
  | 'failed_to_delivered'
  | string;

export interface LocalizedString {
  ar?: string;
  en?: string;
}

export interface OrderTrackingFinancialAccount {
  id: number;
  name?: LocalizedString | string;
  icon?: string | null;
  balance?: number;
  status?: boolean;
  is_cash?: boolean;
  branch_id?: number | null;
  branch?: any;
  created_at?: string;
  updated_at?: string;
}

export interface OrderTrackingCashier {
  id: number;
  name: string;
  cashier_man_id?: number | null;
  cashier_man?: string | null;
  cashier_man_name?: string | null;
  status?: string;
  branch_id?: number | null;
  created_at?: string;
  updated_at?: string;
}

export interface OrderTrackingCashierMan {
  id: number;
  name: string;
  cashier_id?: number | null;
  branch_id?: number | null;
  shift_id?: number | null;
  role?: string;
  created_at?: string;
  updated_at?: string;
}

export interface OrderTrackingProductDetail {
  id: number;
  name?: LocalizedString | string;
  description?: string | null;
  image?: string | null;
  price?: number;
  tax_id?: number | null;
  discount_id?: number | null;
  category_id?: number | null;
  sub_category_id?: number | null;
  created_at?: string;
  updated_at?: string;
}

export interface OrderTrackingVariation {
  id?: number;
  name?: LocalizedString | string;
  price?: number;
  options?: Array<{
    id?: number;
    name?: LocalizedString | string;
    price?: number;
  }>;
}

export interface OrderTrackingAddon {
  id?: number;
  name?: LocalizedString | string;
  price?: number;
}

export interface OrderTrackingProductItem {
  id: number;
  order_id: number;
  product_id: number;
  quantity: number;
  name: string;
  name_translations?: LocalizedString | null;
  price: number;
  is_gift?: boolean;
  note?: string | null;
  product?: OrderTrackingProductDetail;
  variations?: OrderTrackingVariation[];
  addons?: OrderTrackingAddon[];
  created_at?: string;
  updated_at?: string;
}

export interface OrderTrackingDetails {
  id: number;
  shift_id?: number | null;
  shift_name?: string | null;
  cashier_id?: number | null;
  cashier_man_id?: number | null;
  hall_table_id?: number | null;
  hall_table?: {
    id: number;
    name?: string;
    hall?: { id: number; name?: string };
  } | null;
  captain_order_id?: number | null;
  captain_order?: any;
  financial_account_id?: number | null;
  financial_id?: number | null;
  financial_account?: OrderTrackingFinancialAccount | null;
  payment_method_id?: number | null;
  payment_method?: {
    id: number;
    name?: LocalizedString | string;
    icon?: string | null;
  } | null;
  receipt?: string | null;
  reciept?: string | null;
  delivery_id?: number | null;
  delivery?: any;
  branch_id?: number | null;
  branch?: {
    id: number;
    name?: LocalizedString | string;
  } | null;
  module: 'takeaway' | 'delivery' | 'dinein' | string;
  address?: string | null;
  lat?: number | null;
  lng?: number | null;
  note?: string | null;
  phone?: string | null;
  name?: string | null;
  is_pos?: boolean;
  paid?: boolean;
  status: OrderStatusType;
  total: number;
  total_tax: number;
  total_discount: number;
  final_price: number;
  cashier?: OrderTrackingCashier | null;
  cashier_man?: OrderTrackingCashierMan | null;
  shift?: any;
  products: OrderTrackingProductItem[];
  created_at: string;
  updated_at: string;
}

export interface OrderTrackingApiResponse {
  status: boolean;
  message?: string;
  data?: OrderTrackingDetails;
}
