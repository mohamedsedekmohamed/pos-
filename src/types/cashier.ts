// ── Categories ──
export interface Category {
  id: number;
  name: string;
  description: string;
  image: string;
  status: boolean;
  type: 'product' | 'material' | 'recipe' | string;
}

export interface SubCategory {
  id: number;
  category_id: number;
  name: string;
  description: string;
  image: string;
  status: boolean;
  type: string;
}

// ── Products ──
export interface ProductDiscount {
  id: number;
  name: string;
  type: string;
  amount: number;
}

export interface ProductTax {
  id: number;
  name: string;
  type: string;
  amount: number;
}

export interface Product {
  id: number;
  name: string;
  description: string;
  image: string;
  category_id: number;
  sub_category_id: number;
  stock: number;
  price: number;
  discount_val: number;
  tax_val: number;
  final_price: number;
  discount: ProductDiscount | null;
  tax: ProductTax | null;
}

export interface VariationOption {
  id: number;
  name: string;
  price: number;
  discount_val: number;
  tax_val: number;
  final_price: number;
  status: boolean;
}

export interface Variation {
  id: number;
  name: string;
  status: boolean;
  required: boolean;
  options: VariationOption[];
}

export interface ProductDetail extends Omit<Product, 'discount' | 'tax'> {
  variations: Variation[];
}

// ── Addons ──
export interface Addon {
  id: number;
  name: string;
  image: string;
  price: number;
  discount_val: number;
  tax_val: number;
  final_price: number;
}

// ── Halls & Tables ──
export interface Hall {
  id: number;
  name: string;
  branch_id: number;
  status: boolean;
}

export interface HallTable {
  id: number;
  name: string;
  hall_id: number;
  branch_id: number;
  status: boolean;
  qr: string;
}

// ── Cashier ──
export interface CashierDevice {
  id: number;
  name: string;
}

// ── Shift ──
export interface Shift {
  id: number;
  start: string;
  end: string;
  branch_id: number;
  cashier_id: number;
  cashier_man_id: number;
  created_at: string;
  updated_at: string;
  default_total_amount?: number;
  total_mony?: number;
  deficit?: number;
  cashier_name?: string;
  branch_name?: string | null;
  cashier_man_name?: string;
  cashier_man?: any;
  cashier?: any;
  branch?: any;
}

export interface EndShiftPayload {
  total_mony: number;
}

export interface EndShiftResult extends Shift {
  default_total_amount: number;
  total_mony: number;
  deficit: number;
}

// ── API Cart ──
export interface ApiCartProduct {
  id: number;
  name: string | null;
  description: string;
  image: string;
  price: number;
  discount_val: number;
  tax_val: number;
  final_price: number;
}

export interface ApiCartVariationOption {
  id: string; // The user's payload shows string id here but integer elsewhere, we'll keep string/number flexible if needed, payload says string
  name: string;
  price: number;
  discount_val: number;
  tax_val: number;
  final_price: number;
}

export interface ApiCartVariation {
  id: string;
  variation_id: string;
  name: string;
  options: ApiCartVariationOption[];
}

export interface ApiCartAddon {
  id: string;
  addon_id: string;
  name: string;
  price: number;
  discount_val: number;
  tax_val: number;
  final_price: number;
}

export interface ApiCartItem {
  id: number;
  module: string;
  quantity: number | any; // API payload shows `{}` but probably a number, will use `number` and cast if needed
  notes: string | null;
  cashier_id: number;
  cashier_man_id: number;
  branch_id: number;
  product: ApiCartProduct;
  variations: ApiCartVariation[];
  addons: ApiCartAddon[];
  total_price: number;
  total_discount: number;
  total_tax: number;
  total_final_price: number;
}

export interface ApiCartGrandTotals {
  grand_total_price: number;
  grand_total_discount: number;
  grand_total_tax: number;
  grand_final_price: number;
}

export interface ApiCartResponse {
  status: boolean;
  data: ApiCartItem[];
  grand_totals: ApiCartGrandTotals;
}

// Payload Types
export interface AddToCartVariationPayload {
  variation_id: number;
  option_ids: number[];
}

export interface AddToCartAddonPayload {
  addon_id: number;
}

export interface AddToCartPayload {
  module: 'takeaway' | 'dinein' | 'delivery';
  product_id: number;
  quantity: number;
  without_recipe?: boolean;
  notes?: string | null;
  variations?: AddToCartVariationPayload[] | null;
  addons?: AddToCartAddonPayload[] | null;
}

export interface UpdateCartPayload {
  module: 'takeaway' | 'dinein' | 'delivery';
  quantity: number;
  without_recipe?: boolean;
  notes?: string | null;
  variations?: AddToCartVariationPayload[] | null;
  addons?: AddToCartAddonPayload[] | null;
}

export interface CheckoutPayload {
  module: 'takeaway' | 'dinein' | 'delivery';
  hall_table_id?: number | null;
  address?: string | null;
  phone?: string | null;
  name?: string | null;
  note?: string | null;
}

export interface Order {
  id: number;
  shift_id: number;
  shift_name: string;
  cashier_id: number;
  cashier_man_id: number;
  hall_table_id: number | null;
  module: string;
  address: string | null;
  note: string | null;
  phone: string | null;
  name: string | null;
  is_pos: boolean;
  total: number;
  total_tax: number;
  total_discount: number;
  final_price: number;
  created_at: string;
  updated_at: string;
  products?: OrderProduct[];
}

export interface OrderProduct {
  id: number;
  order_id: number;
  product_id: number;
  quantity: number;
  price: number;
  note: string | null;
  created_at: string;
  updated_at: string;
}

export interface OrderListResponse {
  data: Order[];
  // Pagination fields can be added here
}

export interface SelectedVariation {
  variationId: number;
  variationName: string;
  optionId: number;
  optionName: string;
  price: number;
}

export interface SelectedAddon {
  addonId: number;
  name: string;
  price: number;
  quantity: number;
}
