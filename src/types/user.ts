// ══════════════════════════════════════════════════════════════════════════════
// Strictly for /api/user/* endpoints (Public User/Customer Ordering & Delivery)
// ══════════════════════════════════════════════════════════════════════════════

export type UserOrderModule = 'delivery' | 'takeaway' | 'dinein';

// ── Business Setup ──
export interface UserBusinessSetup {
  id: number;
  name: string;
  phone?: string | null;
  face?: string | null;
  instagram?: string | null;
  whats?: string | null;
  logo?: string | null;
  raw_logo?: string | null;
  description?: string | null;
  branch_cover?: number | null;
  is_open?: boolean;
  start_day?: string;
  end_day?: string;
  working_hours_text?: string;
  menu?: string[];
  raw_menu?: string[];
  table_order_url?: string | null;
  has_gift?: boolean;
  price_gift?: number;
  is_overnight?: boolean;
  created_at?: string;
  updated_at?: string;
}

// ── Payment Methods ──
export interface UserPaymentMethod {
  id: number;
  name: string;
  is_cash: boolean;
  icon?: string | null;
  description?: { ar?: string; en?: string } | string | null;
  status?: boolean;
}

// ── Order Tracking Status ──
export type UserOrderStatus =
  | 'preparing'
  | 'done'
  | 'out_of_delivery'
  | 'delivered'
  | 'failed_to_delivered'
  | 'pickup'
  | 'return';

// ── Categories ──
export interface UserCategory {
  id: number;
  name: string;
  description?: string;
  image?: string;
  status: boolean;
  type?: string;
}

export interface UserSubCategory {
  id: number;
  category_id: number;
  name: string;
  description?: string;
  image?: string;
  status: boolean;
  type?: string;
}

// ── Discounts & Taxes ──
export interface UserDiscount {
  id: number;
  name: string;
  type: string;
  amount: number;
}

export interface UserTax {
  id: number;
  name: string;
  type: string;
  amount: number;
}

// ── Variations & Options ──
export interface UserVariationOption {
  id: number;
  name: string;
  price: number;
  discount_val: number;
  tax_val: number;
  final_price: number;
  status: boolean;
}

export interface UserVariation {
  id: number;
  name: string;
  status: boolean;
  required: boolean;
  options: UserVariationOption[];
}

// ── Products ──
export interface UserProduct {
  id: number;
  name: string;
  description?: string;
  image?: string;
  category_id: number;
  sub_category_id?: number | null;
  price: number;
  discount_val: number;
  tax_val: number;
  final_price: number;
  discount?: UserDiscount | null;
  tax?: UserTax | null;
}

export interface UserProductDetail extends UserProduct {
  variations: UserVariation[];
}

// ── Addons ──
export interface UserAddon {
  id: number;
  name: string;
  image?: string;
  price: number;
  discount_val: number;
  tax_val: number;
  final_price: number;
}

// ── Cart API Types ──
export interface UserCartVariationPayload {
  variation_id: number;
  option_ids: number[];
}

export interface UserCartAddonPayload {
  addon_id: number;
}

export interface UserAddToCartPayload {
  uu_id?: string;
  product_id: number;
  module?: UserOrderModule;
  quantity?: number;
  notes?: string;
  variations?: UserCartVariationPayload[];
  addons?: UserCartAddonPayload[];
}

export interface UserUpdateCartPayload {
  uu_id?: string;
  quantity?: number;
  notes?: string;
  variations?: UserCartVariationPayload[];
  addons?: UserCartAddonPayload[];
}

export interface UserCartItemVariationOption {
  id: number;
  name: string;
  price: number;
  discount_val: number;
  tax_val: number;
  final_price: number;
}

export interface UserCartItemVariation {
  id: number;
  variation_id: number;
  name: string;
  options: UserCartItemVariationOption[];
}

export interface UserCartItemAddon {
  id: number;
  addon_id: number;
  name: string;
  price: number;
  discount_val: number;
  tax_val: number;
  final_price: number;
}

export interface UserCartProduct {
  id: number;
  name: string;
  description?: string;
  image?: string;
  price: number;
  discount_val: number;
  tax_val: number;
  final_price: number;
}

export interface UserCartItem {
  id: number;
  module?: string;
  product_id?: number;
  product?: UserCartProduct;
  name?: string;
  image?: string;
  quantity: number;
  price?: number;
  discount_val?: number;
  tax_val?: number;
  final_price?: number;
  total_price?: number;
  total_discount?: number;
  total_tax?: number;
  total_final_price?: number;
  item_total_price?: number;
  item_total_discount?: number;
  item_total_tax?: number;
  item_final_price?: number;
  notes?: string | null;
  variations: UserCartItemVariation[];
  addons: UserCartItemAddon[];
}

export interface UserGrandTotals {
  grand_total_price: number;
  grand_total_discount: number;
  grand_total_tax: number;
  grand_final_price: number;
}

export interface UserCartResponse {
  status: boolean;
  uu_id: string;
  data: UserCartItem[];
  grand_totals: UserGrandTotals;
}

// ── Checkout & Orders Types ──
export interface UserCheckoutPayload {
  uu_id: string;
  payment_method_id: number;
  receipt?: File | null;
  lat: number;
  lng: number;
  address: string;
  phone: string;
  name: string;
  note?: string;
  module?: UserOrderModule;
  lang?: string;
}

export interface UserOrderProduct {
  id: number;
  product_id: number;
  quantity: number;
  price: number;
  name?: { ar?: string; en?: string } | string;
  name_translations?: { ar?: string; en?: string } | null;
  product?: {
    id: number;
    name?: { ar?: string; en?: string } | string;
    image?: string;
    price?: number;
  };
  note?: string | null;
  variations?: any[];
  addons?: any[];
}

export interface UserOrderBranch {
  id: number;
  name: { ar?: string; en?: string } | string;
}

export interface UserOrderPaymentMethod {
  id: number;
  name: { ar?: string; en?: string } | string;
  description?: { ar?: string; en?: string } | string | null;
  icon?: string | null;
  status?: boolean;
  is_cash: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface UserOrderData {
  id: number;
  shift_id?: number | null;
  shift_name?: string | null;
  cashier_id?: number | null;
  cashier_man_id?: number | null;
  hall_table_id?: number | null;
  financial_account_id?: number | null;
  financial_id?: number | null;
  financial_account?: any;
  payment_method_id?: number | null;
  payment_method?: UserOrderPaymentMethod | null;
  receipt?: string | null;
  reciept?: string | null;
  delivery_id?: number | null;
  delivery?: any;
  branch_id: number;
  module: UserOrderModule;
  address: string;
  lat: number;
  lng: number;
  note?: string | null;
  phone: string;
  name: string;
  is_pos: boolean;
  paid?: boolean;
  status?: UserOrderStatus;
  total: number;
  total_tax: number;
  total_discount: number;
  final_price: number;
  branch: UserOrderBranch;
  products: UserOrderProduct[];
  created_at: string;
  updated_at: string;
}

export interface UserCheckoutSuccessResponse {
  status: true;
  message: string;
  distance_km?: number;
  data: UserOrderData;
}

export interface UserCheckoutErrorResponse {
  status: false;
  message: string;
  distance?: number;
  max_cover?: number;
}
