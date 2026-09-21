// ══════════════════════════════════════════════════════════════════════════════
// Strictly for /api/table/* endpoints (Table View & Table Cart System)
// ══════════════════════════════════════════════════════════════════════════════

// ── Table & Branch Info ──
export interface TableBranch {
  id: number;
  name: string;
}

export interface TableHall {
  id: number;
  name: string;
}

export interface TableInfo {
  id: number;
  table_code?: string;
  code?: string;
  name: string;
  status: boolean;
  qr?: string | null;
  branch: TableBranch;
  hall: TableHall;
}

// ── Categories ──
export interface TableCategory {
  id: number;
  name: string;
  description?: string;
  image?: string;
  status: boolean;
  type?: string;
}

export interface TableSubCategory {
  id: number;
  category_id: number;
  name: string;
  description?: string;
  image?: string;
  status: boolean;
  type?: string;
}

// ── Products ──
export interface TableDiscount {
  id: number;
  name: string;
  type: string;
  amount: number;
}

export interface TableTax {
  id: number;
  name: string;
  type: string;
  amount: number;
}

export interface TableProduct {
  id: number;
  name: string;
  description?: string;
  image?: string;
  category_id: number;
  sub_category_id?: number;
  stock: number;
  price: number;
  discount_val: number;
  tax_val: number;
  final_price: number;
  discount?: TableDiscount | null;
  tax?: TableTax | null;
}

// ── Product Details & Variations ──
export interface TableVariationOption {
  id: number;
  name: string;
  price: number;
  discount_val: number;
  tax_val: number;
  final_price: number;
  status: boolean;
}

export interface TableVariation {
  id: number;
  name: string;
  status: boolean;
  required: boolean;
  options: TableVariationOption[];
}

export interface TableProductDetail extends TableProduct {
  variations: TableVariation[];
}

// ── Addons ──
export interface TableAddon {
  id: number;
  name: string;
  image?: string;
  price: number;
  discount_val: number;
  tax_val: number;
  final_price: number;
}

// ── Cart API Payload Types ──
export interface TableCartVariationPayload {
  variation_id: number;
  option_ids: number[];
}

export interface TableCartAddonPayload {
  addon_id: number;
}

export interface TableAddToCartPayload {
  table_code?: string | null;
  table_id?: number | null;
  hall_table_id?: number | null;
  product_id: number;
  quantity?: number | null;
  notes?: string | null;
  variations?: TableCartVariationPayload[] | null;
  addons?: TableCartAddonPayload[] | null;
  lat?: number | null;
  lng?: number | null;
  latitude?: number | null;
  longitude?: number | null;
  long?: number | null;
  lang?: string | null;
}

export interface TableUpdateCartPayload {
  quantity?: number | null;
  notes?: string | null;
  variations?: TableCartVariationPayload[] | null;
  addons?: TableCartAddonPayload[] | null;
  lat?: number | null;
  lng?: number | null;
  latitude?: number | null;
  longitude?: number | null;
  long?: number | null;
  lang?: string | null;
}

export interface TableCartQueryParams {
  table_code?: string | null;
  hall_table_id?: number | null;
  table_id?: number | null;
  lang?: string | null;
  lat?: number | null;
  latitude?: number | null;
  lng?: number | null;
  long?: number | null;
  longitude?: number | null;
}

// ── Client-Side Cart Item Model (for State Management) ──
export interface SelectedVariationState {
  variationId: number;
  variationName: string;
  optionId: number;
  optionName: string;
  price: number;
}

export interface SelectedAddonState {
  addonId: number;
  name: string;
  price: number;
  quantity: number;
}

export interface TableCartItem {
  id: string; // Composite client ID or server cart ID
  productId: number;
  name: string;
  image?: string;
  unitPrice: number;
  quantity: number;
  selectedVariations: SelectedVariationState[];
  selectedAddons: SelectedAddonState[];
  notes?: string;
  totalPrice: number;
}
