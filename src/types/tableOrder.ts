// ══════════════════════════════════════════════════════════════════════════════
// Strictly for /api/table-order/* endpoints (Table Order & Kitchen Submission System)
// ══════════════════════════════════════════════════════════════════════════════

export interface TableOrderBranch {
  id: number;
  name: string;
}

export interface TableOrderHall {
  id: number;
  name: string;
}

export interface TableOrderInfo {
  id: number;
  name: string;
  status: boolean;
  qr: string;
  branch: TableOrderBranch;
  hall: TableOrderHall;
}

export interface TableOrderCategory {
  id: number;
  name: string;
  description?: string;
  image?: string;
  status: boolean;
  type?: string;
}

export interface TableOrderSubCategory {
  id: number;
  category_id: number;
  name: string;
  description?: string;
  image?: string;
  status: boolean;
  type?: string;
}

export interface TableOrderProductDiscount {
  id: number;
  name: string;
  type: string;
  amount: number;
}

export interface TableOrderProductTax {
  id: number;
  name: string;
  type: string;
  amount: number;
}

export interface TableOrderProduct {
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
  discount?: TableOrderProductDiscount | null;
  tax?: TableOrderProductTax | null;
}

export interface TableOrderVariationOption {
  id: number;
  name: string;
  price: number;
  discount_val: number;
  tax_val: number;
  final_price: number;
  status: boolean;
}

export interface TableOrderVariation {
  id: number;
  name: string;
  status: boolean;
  required: boolean;
  options: TableOrderVariationOption[];
}

export interface TableOrderProductDetail extends TableOrderProduct {
  variations: TableOrderVariation[];
}

export interface TableOrderAddon {
  id: number;
  name: string;
  image?: string;
  price: number;
  discount_val: number;
  tax_val: number;
  final_price: number;
}

// ── Table Order Cart Payloads & Responses ──
export interface TableOrderAddToCartPayload {
  table_id: number;
  hall_table_id: number;
  product_id: number;
  quantity: number;
  notes?: string;
  variations?: Array<{
    variation_id: number;
    option_ids: number[];
  }>;
  addons?: Array<{
    addon_id: number;
  }>;
  lat?: number | null;
  lng?: number | null;
  latitude?: number | null;
  longitude?: number | null;
  long?: number | null;
  lang?: string;
}

export interface TableOrderUpdateCartPayload {
  quantity: number;
  notes?: string;
  variations?: Array<{
    variation_id: number;
    option_ids: number[];
  }>;
  addons?: Array<{
    addon_id: number;
  }>;
  lat?: number | null;
  lng?: number | null;
  latitude?: number | null;
  longitude?: number | null;
  long?: number | null;
  lang?: string;
}

export interface TableOrderCartQueryParams {
  hall_table_id?: number | null;
  table_id?: number | null;
  lang?: string | null;
  lat?: number | null;
  latitude?: number | null;
  lng?: number | null;
  long?: number | null;
  longitude?: number | null;
}
