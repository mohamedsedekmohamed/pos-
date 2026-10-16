// ══════════════════════════════════════════════════════════════════════════════
// Strictly for /api/branch/* endpoints (Branch Role Dashboard & Management)
// ══════════════════════════════════════════════════════════════════════════════

import type { LocalizedString, PaginatedMeta } from './common';

// ── Generic Branch API Response ──
export interface BranchApiResponse<T> {
  status: boolean;
  message?: string;
  data: T;
}
export interface BranchPaginatedResponse<T> {
  status: boolean;
  data: T[];
  meta: PaginatedMeta;
}
// ── Pagination Query Params ──
export interface BranchPaginationParams {
  page?: number;
  per_page?: number;
}
// ══════════════════════════════════════════════════════════════════════════════
// 2. Cashiers
// ══════════════════════════════════════════════════════════════════════════════
export interface BranchCashier {
  id: number;
  name: string;
  branch_id: number;
  cashier_man_id: number | null;
  cashier_man?: BranchCashierMan | null;
  created_at?: string;
  updated_at?: string;
}
export interface BranchCashierSelectOptions {
  cashier_men: { id: number; name: string }[];
  branch: { id: number; name: string };
}
export interface CreateCashierPayload {
  name: string;
  cashier_man_id?: number | null;
}
export interface UpdateCashierPayload {
  name?: string;
  cashier_man_id?: number | null;
}
// ══════════════════════════════════════════════════════════════════════════════
// 3. Cashier Men
// ══════════════════════════════════════════════════════════════════════════════
export interface BranchCashierMan {
  id: number;
  name: string;
  branch_id: number;
  cashier_id: number | null;
  shift_id: number | null;
  cashier?: BranchCashier | null;
  shift?: BranchShift | null;
  created_at?: string;
  updated_at?: string;
}

export interface BranchCashierManSelectOptions {
  cashiers: { id: number; name: string }[];
  shifts: { id: number; name: string }[];
}

export interface CreateCashierManPayload {
  name: string;
  password: string;
  cashier_id?: number | null;
  shift_id?: number | null;
}

export interface UpdateCashierManPayload {
  name?: string;
  password?: string;
  cashier_id?: number | null;
  shift_id?: number | null;
}

// ══════════════════════════════════════════════════════════════════════════════
// 4. Dashboard
// ══════════════════════════════════════════════════════════════════════════════

export interface BranchDashboardTopProduct {
  product_id: number;
  product_name: string;
  total_quantity: number;
}

export interface BranchDashboardChart {
  months: string[];
  orders_count: number[];
  final_price: number[];
}

export interface BranchDashboardData {
  year: number;
  branch_id: number;
  total_orders: number;
  total_final_price: number;
  top_products: BranchDashboardTopProduct[];
  monthly_orders: number[];
  monthly_final_price: number[];
  chart: BranchDashboardChart;
}

// ══════════════════════════════════════════════════════════════════════════════
// 5. Deliveries
// ══════════════════════════════════════════════════════════════════════════════

export interface BranchDelivery {
  id: number;
  name: string;
  phone: string;
  branch_id: number;
  id_images?: string[];
  created_at?: string;
  updated_at?: string;
}

export interface CreateDeliveryPayload {
  name: string;
  phone: string;
  id_images?: File[];
}

export interface UpdateDeliveryPayload {
  name?: string;
  phone?: string;
  id_images?: File[];
  deleted_images?: string[];
}

// ══════════════════════════════════════════════════════════════════════════════
// 6. Financial Accounts
// ══════════════════════════════════════════════════════════════════════════════

export interface BranchFinancialAccount {
  id: number;
  name: LocalizedString;
  balance: number;
  status: boolean;
  branch_id: number;
  created_at?: string;
  updated_at?: string;
}

export interface CreateFinancialAccountPayload {
  name: LocalizedString;
  balance: number;
  status?: boolean;
}

export interface UpdateFinancialAccountPayload {
  name?: LocalizedString;
  balance?: number;
  status?: boolean;
}

// ══════════════════════════════════════════════════════════════════════════════
// 7. Halls
// ══════════════════════════════════════════════════════════════════════════════

export interface BranchHall {
  id: number;
  name: LocalizedString;
  status: boolean;
  branch_id: number;
  created_at?: string;
  updated_at?: string;
}

export interface CreateHallPayload {
  name: LocalizedString;
  status?: boolean;
}

export interface UpdateHallPayload {
  name?: LocalizedString;
  status?: boolean;
}

// ══════════════════════════════════════════════════════════════════════════════
// 8. Hall Tables
// ══════════════════════════════════════════════════════════════════════════════

export interface BranchHallTable {
  id: number;
  name: string;
  hall_id: number;
  branch_id: number;
  status: boolean;
  qr?: string | null;
  qr_image?: string | null;
  hall?: BranchHall | null;
  created_at?: string;
  updated_at?: string;
}

export interface CreateHallTablePayload {
  name: string;
  hall_id: number;
  status?: boolean;
  base_url?: string;
}

export interface UpdateHallTablePayload {
  name?: string;
  hall_id?: number;
  status?: boolean;
  base_url?: string;
}

// ══════════════════════════════════════════════════════════════════════════════
// 9. Inventory Materials
// ══════════════════════════════════════════════════════════════════════════════

export type BranchInventoryStatus = 'pending' | 'approve' | 'reject';

export interface BranchMaterialInventoryItem {
  id: number;
  inventory_id: number;
  material_id: number;
  material_name?: string;
  system_stock: number;
  actual_stock: number | null;
  difference?: number;
  created_at?: string;
  updated_at?: string;
}

export interface BranchMaterialInventory {
  id: number;
  name: string;
  branch_id: number;
  status: BranchInventoryStatus;
  items?: BranchMaterialInventoryItem[];
  created_at?: string;
  updated_at?: string;
}

export interface CreateMaterialInventoryPayload {
  name: string;
}

export interface BatchUpdateMaterialItemsPayload {
  items: { id: number; actual_stock: number }[];
}

export interface UpdateSingleMaterialItemPayload {
  actual_stock: number;
}

export interface ChangeInventoryStatusPayload {
  status: 'approve' | 'reject';
}

// ══════════════════════════════════════════════════════════════════════════════
// 10. Inventory Recipes
// ══════════════════════════════════════════════════════════════════════════════

export interface BranchRecipeInventoryItem {
  id: number;
  inventory_id: number;
  product_recipe_id: number;
  product_recipe_name?: string;
  system_stock: number;
  actual_stock: number | null;
  difference?: number;
  created_at?: string;
  updated_at?: string;
}

export interface BranchRecipeInventory {
  id: number;
  name: string;
  branch_id: number;
  status: BranchInventoryStatus;
  items?: BranchRecipeInventoryItem[];
  created_at?: string;
  updated_at?: string;
}

export interface CreateRecipeInventoryPayload {
  name: string;
}

export interface BatchUpdateRecipeItemsPayload {
  items: { id: number; actual_stock: number }[];
}

export interface UpdateSingleRecipeItemPayload {
  actual_stock: number;
}

// ══════════════════════════════════════════════════════════════════════════════
// 11. Kitchens
// ══════════════════════════════════════════════════════════════════════════════

export interface BranchKitchen {
  id: number;
  name: LocalizedString;
  user_name: string;
  status: boolean;
  branch_id: number;
  created_at?: string;
  updated_at?: string;
}

export interface CreateKitchenPayload {
  name: LocalizedString;
  user_name: string;
  password: string;
  status?: boolean;
}

export interface UpdateKitchenPayload {
  name?: LocalizedString;
  user_name?: string;
  password?: string;
  status?: boolean;
}

// ══════════════════════════════════════════════════════════════════════════════
// 12. Kitchen Products Assignment
// ══════════════════════════════════════════════════════════════════════════════

export interface BranchKitchenProduct {
  id: number;
  name: string;
  image?: string;
  category_id?: number;
}

export interface AssignKitchenProductsPayload {
  kitchen_id: number;
  product_ids: number[];
}

// ══════════════════════════════════════════════════════════════════════════════
// 13. Manufacturing
// ══════════════════════════════════════════════════════════════════════════════

export interface ManufacturingRecipeItem {
  material_id: number;
  count: number;
}

export interface BranchManufacturingSelectOption {
  materials: { id: number; name: string; stock: number }[];
  product_recipes: { id: number; name: string; stock: number }[];
}

export interface BranchManufacturingSpecification {
  product_recipe_id?: number;
  product_id?: number;
  name?: string;
  recipes: {
    material_id: number;
    material_name: string;
    required_quantity: number;
    available_stock: number;
  }[];
}

export interface ExecuteManufacturingPayload {
  product_recipe_id: number;
  count: number;
  recipes: ManufacturingRecipeItem[];
}

export interface BranchManufacturingOrder {
  id: number;
  branch_id: number;
  product_recipe_id: number;
  product_recipe_name?: string;
  count: number;
  recipes?: {
    material_id: number;
    material_name?: string;
    count: number;
  }[];
  created_at?: string;
  updated_at?: string;
}

// ══════════════════════════════════════════════════════════════════════════════
// 14. Orders
// ══════════════════════════════════════════════════════════════════════════════

export type BranchOrderModule = 'takeaway' | 'dinein' | 'delivery';

export type BranchOrderStatus =
  | 'preparing'
  | 'done'
  | 'out_of_delivery'
  | 'delivered'
  | 'failed_to_delivered'
  | 'pickup'
  | 'return';

export interface BranchOrderProductVariationOption {
  option_id: number;
  price: number;
}

export interface BranchOrderProductVariation {
  variation_id: number;
  options: BranchOrderProductVariationOption[];
}

export interface BranchOrderProductAddon {
  addon_id: number;
  price: number;
}

export interface BranchOrderProductPayload {
  product_id: number;
  quantity: number;
  price: number;
  note?: string;
  variations?: BranchOrderProductVariation[];
  addons?: BranchOrderProductAddon[];
}

export interface CreateBranchOrderPayload {
  module: BranchOrderModule;
  shift_id: number;
  cashier_id: number;
  cashier_man_id?: number;
  name?: string;
  phone?: string;
  is_pos?: boolean;
  total: number;
  total_tax: number;
  total_discount: number;
  final_price: number;
  products: BranchOrderProductPayload[];
}

export interface UpdateBranchOrderStatusPayload {
  status: BranchOrderStatus;
}

export interface CheckNewOrdersPayload {
  count: number;
}

export interface BranchOrderFilters extends BranchPaginationParams {
  is_pos?: boolean | 'true' | 'false';
  shift_id?: number;
  module?: BranchOrderModule;
  date?: string;
  from_date?: string;
  to_date?: string;
  all_dates?: boolean;
}

export interface BranchOrderProduct {
  id: number;
  order_id: number;
  product_id: number;
  quantity: number;
  price: number;
  note?: string | null;
  name?: string;
  variations?: any[];
  addons?: any[];
  created_at?: string;
  updated_at?: string;
}

export interface BranchOrder {
  id: number;
  branch_id: number;
  shift_id: number | null;
  shift_name?: string | null;
  cashier_id: number | null;
  cashier_man_id: number | null;
  hall_table_id?: number | null;
  delivery_id?: number | null;
  module: BranchOrderModule;
  address?: string | null;
  note?: string | null;
  phone?: string | null;
  name?: string | null;
  is_pos: boolean;
  total: number;
  total_tax: number;
  total_discount: number;
  final_price: number;
  status?: BranchOrderStatus;
  products?: BranchOrderProduct[];
  created_at?: string;
  updated_at?: string;
}

export interface BranchOrderSelectOptions {
  cashiers?: { id: number; name: string }[];
  shifts?: { id: number; name: string }[];
  hall_tables?: { id: number; name: string }[];
  products?: { id: number; name: string; price: number }[];
  addons?: { id: number; name: string; price: number }[];
}

// ══════════════════════════════════════════════════════════════════════════════
// 15. Purchases
// ══════════════════════════════════════════════════════════════════════════════

export interface PurchaseItemPayload {
  material_id?: number;
  product_recipe_id?: number;
  quantity: number;
  cost: number;
}

export interface CreatePurchasePayload {
  receipt?: File;
  notes?: string;
  items: PurchaseItemPayload[];
}

export interface BranchPurchaseItem {
  id: number;
  purchase_id: number;
  material_id?: number | null;
  product_recipe_id?: number | null;
  material_name?: string;
  product_recipe_name?: string;
  quantity: number;
  cost: number;
  created_at?: string;
  updated_at?: string;
}

export interface BranchPurchase {
  id: number;
  branch_id: number;
  notes?: string | null;
  receipt?: string | null;
  items?: BranchPurchaseItem[];
  total_cost?: number;
  created_at?: string;
  updated_at?: string;
}

// ══════════════════════════════════════════════════════════════════════════════
// 16. Reports
// ══════════════════════════════════════════════════════════════════════════════

export interface BranchShiftReportFilters extends BranchPaginationParams {
  cashier_id?: number;
  cashier_man_id?: number;
  start?: string;
  end?: string;
}

export interface BranchShiftReportSummary {
  total_default_amount: number;
  total_collected_mony: number;
  total_deficit: number;
  shifts_count: number;
}

export interface BranchShiftReportData {
  id: number;
  cashier_id: number;
  cashier_man_id: number;
  cashier_name?: string;
  cashier_man_name?: string;
  default_total_amount: number;
  total_mony: number;
  deficit: number;
  start?: string;
  end?: string;
  created_at?: string;
}

export interface BranchShiftReportResponse {
  status: boolean;
  summary: BranchShiftReportSummary;
  data: BranchShiftReportData[];
  select_options?: Record<string, any>;
  meta?: PaginatedMeta;
}

// ══════════════════════════════════════════════════════════════════════════════
// 17. Shifts
// ══════════════════════════════════════════════════════════════════════════════

export interface BranchShift {
  id: number;
  name: LocalizedString;
  start_time: string;
  end_time: string;
  is_tomorrow?: boolean;
  branch_id: number;
  created_at?: string;
  updated_at?: string;
}

export interface CreateShiftPayload {
  name: LocalizedString;
  start_time: string;
  end_time: string;
}

export interface UpdateShiftPayload {
  name?: LocalizedString;
  start_time?: string;
  end_time?: string;
}

// ══════════════════════════════════════════════════════════════════════════════
// 18. Wastes
// ══════════════════════════════════════════════════════════════════════════════

export interface BranchWaste {
  id: number;
  branch_id: number;
  material_id?: number | null;
  product_recipe_id?: number | null;
  material_name?: string;
  product_recipe_name?: string;
  count: number;
  created_at?: string;
  updated_at?: string;
}

export interface CreateWastePayload {
  material_id?: number;
  product_recipe_id?: number;
  count: number;
}

export interface UpdateWastePayload {
  count: number;
}
