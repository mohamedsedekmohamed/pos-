import { api } from '../lib/axios';
import type {
  // ── Generic ──
  BranchApiResponse,
  BranchPaginatedResponse,
  BranchPaginationParams,
  // ── Admin Branches (Section 0) ──
  AdminBranch,
  AdminBranchSelectOptionsResponse,
  CreateBranchPayload,
  UpdateBranchPayload,
  // ── Addons (Section 19) ──
  BranchAddon,
  BranchAddonSelectOptions,
  // ── Cashiers ──
  BranchCashier,
  BranchCashierSelectOptions,
  CreateCashierPayload,
  UpdateCashierPayload,
  // ── Cashier Men ──
  BranchCashierMan,
  BranchCashierManSelectOptions,
  CreateCashierManPayload,
  UpdateCashierManPayload,
  // ── Dashboard ──
  BranchDashboardData,
  // ── Deliveries ──
  BranchDelivery,
  CreateDeliveryPayload,
  UpdateDeliveryPayload,
  // ── Financial Accounts ──
  BranchFinancialAccount,
  CreateFinancialAccountPayload,
  UpdateFinancialAccountPayload,
  // ── Halls ──
  BranchHall,
  CreateHallPayload,
  UpdateHallPayload,
  // ── Hall Tables ──
  BranchHallTable,
  CreateHallTablePayload,
  UpdateHallTablePayload,
  // ── Inventory Materials ──
  BranchMaterialInventory,
  CreateMaterialInventoryPayload,
  BatchUpdateMaterialItemsPayload,
  UpdateSingleMaterialItemPayload,
  ChangeInventoryStatusPayload,
  BranchInventoryStatus,
  // ── Inventory Recipes ──
  BranchRecipeInventory,
  CreateRecipeInventoryPayload,
  BatchUpdateRecipeItemsPayload,
  UpdateSingleRecipeItemPayload,
  // ── Kitchens ──
  BranchKitchen,
  CreateKitchenPayload,
  UpdateKitchenPayload,
  // ── Kitchen Products ──
  BranchKitchenProduct,
  AssignKitchenProductsPayload,
  // ── Manufacturing ──
  BranchManufacturingOrder,
  BranchManufacturingSelectOption,
  BranchManufacturingSpecification,
  ExecuteManufacturingPayload,
  // ── Orders ──
  BranchOrder,
  BranchOrderSelectOptions,
  CreateBranchOrderPayload,
  UpdateBranchOrderStatusPayload,
  CheckNewOrdersPayload,
  BranchOrderFilters,
  // ── Purchases ──
  BranchPurchase,
  CreatePurchasePayload,
  // ── Reports ──
  BranchShiftReportResponse,
  BranchShiftReportFilters,
  // ── Shifts ──
  BranchShift,
  CreateShiftPayload,
  UpdateShiftPayload,
  // ── Wastes ──
  BranchWaste,
  CreateWastePayload,
  UpdateWastePayload,
} from '../types/branch';

// ── Helper: Build FormData from object (handles File/File[] fields) ──
function buildFormData(payload: Record<string, any>): FormData {
  const fd = new FormData();
  for (const [key, value] of Object.entries(payload)) {
    if (value === undefined || value === null) continue;
    if (Array.isArray(value)) {
      value.forEach((item) => {
        if (item instanceof File) {
          fd.append(`${key}[]`, item);
        } else {
          fd.append(`${key}[]`, String(item));
        }
      });
    } else if (value instanceof File) {
      fd.append(key, value);
    } else {
      fd.append(key, String(value));
    }
  }
  return fd;
}

// ══════════════════════════════════════════════════════════════════════════════
// Branch API Service
// Uses the shared `api` axios instance (JWT auto-attached via interceptor).
// All endpoints are prefixed with /api/branch/
// ══════════════════════════════════════════════════════════════════════════════

export const branchApi = {
  // ══════════════════════════════════════════════════════════════════════════
  // 0. Admin Branches CRUD (/api/admin/branches)
  // ══════════════════════════════════════════════════════════════════════════
  branches: {
    selectOptions: async (): Promise<AdminBranchSelectOptionsResponse> => {
      const { data } = await api.get<BranchApiResponse<AdminBranchSelectOptionsResponse>>(
        '/api/admin/branches/select-options'
      );
      return data.data;
    },

    list: async (params?: BranchPaginationParams): Promise<BranchPaginatedResponse<AdminBranch>> => {
      const { data } = await api.get<BranchPaginatedResponse<AdminBranch>>(
        '/api/admin/branches',
        { params }
      );
      return data;
    },

    create: async (payload: CreateBranchPayload): Promise<AdminBranch> => {
      const { data } = await api.post<BranchApiResponse<AdminBranch>>(
        '/api/admin/branches',
        payload
      );
      return data.data;
    },

    show: async (id: number): Promise<AdminBranch> => {
      const { data } = await api.get<BranchApiResponse<AdminBranch>>(
        `/api/admin/branches/${id}`
      );
      return data.data;
    },

    update: async (id: number, payload: UpdateBranchPayload): Promise<AdminBranch> => {
      const { data } = await api.put<BranchApiResponse<AdminBranch>>(
        `/api/admin/branches/${id}`,
        payload
      );
      return data.data;
    },

    delete: async (id: number): Promise<void> => {
      await api.delete(`/api/admin/branches/${id}`);
    },
  },

  adminBranches: {
    selectOptions: async (): Promise<AdminBranchSelectOptionsResponse> => {
      const { data } = await api.get<BranchApiResponse<AdminBranchSelectOptionsResponse>>(
        '/api/admin/branches/select-options'
      );
      return data.data;
    },

    list: async (params?: BranchPaginationParams): Promise<BranchPaginatedResponse<AdminBranch>> => {
      const { data } = await api.get<BranchPaginatedResponse<AdminBranch>>(
        '/api/admin/branches',
        { params }
      );
      return data;
    },

    create: async (payload: CreateBranchPayload): Promise<AdminBranch> => {
      const { data } = await api.post<BranchApiResponse<AdminBranch>>(
        '/api/admin/branches',
        payload
      );
      return data.data;
    },

    show: async (id: number): Promise<AdminBranch> => {
      const { data } = await api.get<BranchApiResponse<AdminBranch>>(
        `/api/admin/branches/${id}`
      );
      return data.data;
    },

    update: async (id: number, payload: UpdateBranchPayload): Promise<AdminBranch> => {
      const { data } = await api.put<BranchApiResponse<AdminBranch>>(
        `/api/admin/branches/${id}`,
        payload
      );
      return data.data;
    },

    delete: async (id: number): Promise<void> => {
      await api.delete(`/api/admin/branches/${id}`);
    },
  },

  // ══════════════════════════════════════════════════════════════════════════
  // 2. Cashiers
  // ══════════════════════════════════════════════════════════════════════════
  cashiers: {
    selectOptions: async (): Promise<BranchCashierSelectOptions> => {
      const { data } = await api.get<BranchApiResponse<BranchCashierSelectOptions>>(
        '/api/branch/cashiers/select-options'
      );
      return data.data;
    },

    list: async (params?: BranchPaginationParams): Promise<BranchPaginatedResponse<BranchCashier>> => {
      const { data } = await api.get<BranchPaginatedResponse<BranchCashier>>(
        '/api/branch/cashiers',
        { params }
      );
      return data;
    },

    create: async (payload: CreateCashierPayload): Promise<BranchCashier> => {
      const { data } = await api.post<BranchApiResponse<BranchCashier>>(
        '/api/branch/cashiers',
        payload
      );
      return data.data;
    },

    show: async (id: number): Promise<BranchCashier> => {
      const { data } = await api.get<BranchApiResponse<BranchCashier>>(
        `/api/branch/cashiers/${id}`
      );
      return data.data;
    },

    update: async (id: number, payload: UpdateCashierPayload): Promise<BranchCashier> => {
      const { data } = await api.put<BranchApiResponse<BranchCashier>>(
        `/api/branch/cashiers/${id}`,
        payload
      );
      return data.data;
    },

    delete: async (id: number): Promise<void> => {
      await api.delete(`/api/branch/cashiers/${id}`);
    },
  },

  // ══════════════════════════════════════════════════════════════════════════
  // 3. Cashier Men
  // ══════════════════════════════════════════════════════════════════════════
  cashierMen: {
    selectOptions: async (): Promise<BranchCashierManSelectOptions> => {
      const { data } = await api.get<BranchApiResponse<BranchCashierManSelectOptions>>(
        '/api/branch/cashier-men/select-options'
      );
      return data.data;
    },

    list: async (params?: BranchPaginationParams): Promise<BranchPaginatedResponse<BranchCashierMan>> => {
      const { data } = await api.get<BranchPaginatedResponse<BranchCashierMan>>(
        '/api/branch/cashier-men',
        { params }
      );
      return data;
    },

    create: async (payload: CreateCashierManPayload): Promise<BranchCashierMan> => {
      const { data } = await api.post<BranchApiResponse<BranchCashierMan>>(
        '/api/branch/cashier-men',
        payload
      );
      return data.data;
    },

    show: async (id: number): Promise<BranchCashierMan> => {
      const { data } = await api.get<BranchApiResponse<BranchCashierMan>>(
        `/api/branch/cashier-men/${id}`
      );
      return data.data;
    },

    update: async (id: number, payload: UpdateCashierManPayload): Promise<BranchCashierMan> => {
      const { data } = await api.put<BranchApiResponse<BranchCashierMan>>(
        `/api/branch/cashier-men/${id}`,
        payload
      );
      return data.data;
    },

    delete: async (id: number): Promise<void> => {
      await api.delete(`/api/branch/cashier-men/${id}`);
    },
  },

  // ══════════════════════════════════════════════════════════════════════════
  // 4. Dashboard
  // ══════════════════════════════════════════════════════════════════════════
  dashboard: {
    getStatistics: async (year?: number): Promise<BranchDashboardData> => {
      const { data } = await api.get<BranchApiResponse<BranchDashboardData>>(
        '/api/branch/dashboard',
        { params: { year } }
      );
      return data.data;
    },
  },

  // ══════════════════════════════════════════════════════════════════════════
  // 5. Deliveries (multipart/form-data for create & update)
  // ══════════════════════════════════════════════════════════════════════════
  deliveries: {
    selectOptions: async (): Promise<any> => {
      const { data } = await api.get<BranchApiResponse<any>>(
        '/api/branch/deliveries/select-options'
      );
      return data.data;
    },

    list: async (params?: BranchPaginationParams): Promise<BranchPaginatedResponse<BranchDelivery>> => {
      const { data } = await api.get<BranchPaginatedResponse<BranchDelivery>>(
        '/api/branch/deliveries',
        { params }
      );
      return data;
    },

    create: async (payload: CreateDeliveryPayload): Promise<BranchDelivery> => {
      const fd = buildFormData(payload);
      const { data } = await api.post<BranchApiResponse<BranchDelivery>>(
        '/api/branch/deliveries',
        fd,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );
      return data.data;
    },

    show: async (id: number): Promise<BranchDelivery> => {
      const { data } = await api.get<BranchApiResponse<BranchDelivery>>(
        `/api/branch/deliveries/${id}`
      );
      return data.data;
    },

    update: async (id: number, payload: UpdateDeliveryPayload): Promise<BranchDelivery> => {
      const fd = buildFormData(payload);
      const { data } = await api.post<BranchApiResponse<BranchDelivery>>(
        `/api/branch/deliveries/${id}`,
        fd,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );
      return data.data;
    },

    delete: async (id: number): Promise<void> => {
      await api.delete(`/api/branch/deliveries/${id}`);
    },
  },

  // ══════════════════════════════════════════════════════════════════════════
  // 6. Financial Accounts
  // ══════════════════════════════════════════════════════════════════════════
  financialAccounts: {
    selectOptions: async (): Promise<any> => {
      const { data } = await api.get<BranchApiResponse<any>>(
        '/api/branch/financial-accounts/select-options'
      );
      return data.data;
    },

    list: async (params?: BranchPaginationParams): Promise<BranchPaginatedResponse<BranchFinancialAccount>> => {
      const { data } = await api.get<BranchPaginatedResponse<BranchFinancialAccount>>(
        '/api/branch/financial-accounts',
        { params }
      );
      return data;
    },

    create: async (payload: CreateFinancialAccountPayload): Promise<BranchFinancialAccount> => {
      const { data } = await api.post<BranchApiResponse<BranchFinancialAccount>>(
        '/api/branch/financial-accounts',
        payload
      );
      return data.data;
    },

    show: async (id: number): Promise<BranchFinancialAccount> => {
      const { data } = await api.get<BranchApiResponse<BranchFinancialAccount>>(
        `/api/branch/financial-accounts/${id}`
      );
      return data.data;
    },

    update: async (id: number, payload: UpdateFinancialAccountPayload): Promise<BranchFinancialAccount> => {
      const { data } = await api.put<BranchApiResponse<BranchFinancialAccount>>(
        `/api/branch/financial-accounts/${id}`,
        payload
      );
      return data.data;
    },

    delete: async (id: number): Promise<void> => {
      await api.delete(`/api/branch/financial-accounts/${id}`);
    },
  },

  // ══════════════════════════════════════════════════════════════════════════
  // 7. Halls
  // ══════════════════════════════════════════════════════════════════════════
  halls: {
    selectOptions: async (): Promise<any> => {
      const { data } = await api.get<BranchApiResponse<any>>(
        '/api/branch/halls/select-options'
      );
      return data.data;
    },

    list: async (params?: BranchPaginationParams): Promise<BranchPaginatedResponse<BranchHall>> => {
      const { data } = await api.get<BranchPaginatedResponse<BranchHall>>(
        '/api/branch/halls',
        { params }
      );
      return data;
    },

    create: async (payload: CreateHallPayload): Promise<BranchHall> => {
      const { data } = await api.post<BranchApiResponse<BranchHall>>(
        '/api/branch/halls',
        payload
      );
      return data.data;
    },

    show: async (id: number): Promise<BranchHall> => {
      const { data } = await api.get<BranchApiResponse<BranchHall>>(
        `/api/branch/halls/${id}`
      );
      return data.data;
    },

    update: async (id: number, payload: UpdateHallPayload): Promise<BranchHall> => {
      const { data } = await api.put<BranchApiResponse<BranchHall>>(
        `/api/branch/halls/${id}`,
        payload
      );
      return data.data;
    },

    delete: async (id: number): Promise<void> => {
      await api.delete(`/api/branch/halls/${id}`);
    },
  },

  // ══════════════════════════════════════════════════════════════════════════
  // 8. Hall Tables
  // ══════════════════════════════════════════════════════════════════════════
  hallTables: {
    selectOptions: async (): Promise<any> => {
      const { data } = await api.get<BranchApiResponse<any>>(
        '/api/branch/hall-tables/select-options'
      );
      return data.data;
    },

    list: async (params?: BranchPaginationParams): Promise<BranchPaginatedResponse<BranchHallTable>> => {
      const { data } = await api.get<BranchPaginatedResponse<BranchHallTable>>(
        '/api/branch/hall-tables',
        { params }
      );
      return data;
    },

    create: async (payload: CreateHallTablePayload): Promise<BranchHallTable> => {
      const { data } = await api.post<BranchApiResponse<BranchHallTable>>(
        '/api/branch/hall-tables',
        payload
      );
      return data.data;
    },

    show: async (id: number): Promise<BranchHallTable> => {
      const { data } = await api.get<BranchApiResponse<BranchHallTable>>(
        `/api/branch/hall-tables/${id}`
      );
      return data.data;
    },

    update: async (id: number, payload: UpdateHallTablePayload): Promise<BranchHallTable> => {
      const { data } = await api.put<BranchApiResponse<BranchHallTable>>(
        `/api/branch/hall-tables/${id}`,
        payload
      );
      return data.data;
    },

    delete: async (id: number): Promise<void> => {
      await api.delete(`/api/branch/hall-tables/${id}`);
    },
  },

  // ══════════════════════════════════════════════════════════════════════════
  // 9. Inventory Materials
  // ══════════════════════════════════════════════════════════════════════════
  inventoryMaterials: {
    selectOptions: async (): Promise<any> => {
      const { data } = await api.get<BranchApiResponse<any>>(
        '/api/branch/inventory/materials/select-options'
      );
      return data.data;
    },

    create: async (payload: CreateMaterialInventoryPayload): Promise<BranchMaterialInventory> => {
      const { data } = await api.post<BranchApiResponse<BranchMaterialInventory>>(
        '/api/branch/inventory/materials',
        payload
      );
      return data.data;
    },

    listPending: async (params?: BranchPaginationParams): Promise<BranchPaginatedResponse<BranchMaterialInventory>> => {
      const { data } = await api.get<BranchPaginatedResponse<BranchMaterialInventory>>(
        '/api/branch/inventory/materials/pending',
        { params }
      );
      return data;
    },

    listHistory: async (
      params?: BranchPaginationParams & { status?: BranchInventoryStatus }
    ): Promise<BranchPaginatedResponse<BranchMaterialInventory>> => {
      const { data } = await api.get<BranchPaginatedResponse<BranchMaterialInventory>>(
        '/api/branch/inventory/materials/history',
        { params }
      );
      return data;
    },

    show: async (inventoryId: number): Promise<BranchMaterialInventory> => {
      const { data } = await api.get<BranchApiResponse<BranchMaterialInventory>>(
        `/api/branch/inventory/materials/${inventoryId}`
      );
      return data.data;
    },

    batchUpdateItems: async (
      inventoryId: number,
      payload: BatchUpdateMaterialItemsPayload
    ): Promise<any> => {
      const { data } = await api.put(
        `/api/branch/inventory/materials/${inventoryId}/items`,
        payload
      );
      return data;
    },

    updateSingleItem: async (
      itemId: number,
      payload: UpdateSingleMaterialItemPayload
    ): Promise<any> => {
      const { data } = await api.put(
        `/api/branch/inventory/material-items/${itemId}`,
        payload
      );
      return data;
    },

    changeStatus: async (
      inventoryId: number,
      payload: ChangeInventoryStatusPayload
    ): Promise<any> => {
      const { data } = await api.put(
        `/api/branch/inventory/materials/${inventoryId}/status`,
        payload
      );
      return data;
    },
  },

  // ══════════════════════════════════════════════════════════════════════════
  // 10. Inventory Recipes
  // ══════════════════════════════════════════════════════════════════════════
  inventoryRecipes: {
    selectOptions: async (): Promise<any> => {
      const { data } = await api.get<BranchApiResponse<any>>(
        '/api/branch/inventory/recipes/select-options'
      );
      return data.data;
    },

    create: async (payload: CreateRecipeInventoryPayload): Promise<BranchRecipeInventory> => {
      const { data } = await api.post<BranchApiResponse<BranchRecipeInventory>>(
        '/api/branch/inventory/recipes',
        payload
      );
      return data.data;
    },

    listPending: async (params?: BranchPaginationParams): Promise<BranchPaginatedResponse<BranchRecipeInventory>> => {
      const { data } = await api.get<BranchPaginatedResponse<BranchRecipeInventory>>(
        '/api/branch/inventory/recipes/pending',
        { params }
      );
      return data;
    },

    listHistory: async (
      params?: BranchPaginationParams & { status?: BranchInventoryStatus }
    ): Promise<BranchPaginatedResponse<BranchRecipeInventory>> => {
      const { data } = await api.get<BranchPaginatedResponse<BranchRecipeInventory>>(
        '/api/branch/inventory/recipes/history',
        { params }
      );
      return data;
    },

    show: async (inventoryId: number): Promise<BranchRecipeInventory> => {
      const { data } = await api.get<BranchApiResponse<BranchRecipeInventory>>(
        `/api/branch/inventory/recipes/${inventoryId}`
      );
      return data.data;
    },

    batchUpdateItems: async (
      inventoryId: number,
      payload: BatchUpdateRecipeItemsPayload
    ): Promise<any> => {
      const { data } = await api.put(
        `/api/branch/inventory/recipes/${inventoryId}/items`,
        payload
      );
      return data;
    },

    updateSingleItem: async (
      itemId: number,
      payload: UpdateSingleRecipeItemPayload
    ): Promise<any> => {
      const { data } = await api.put(
        `/api/branch/inventory/recipe-items/${itemId}`,
        payload
      );
      return data;
    },

    changeStatus: async (
      inventoryId: number,
      payload: ChangeInventoryStatusPayload
    ): Promise<any> => {
      const { data } = await api.put(
        `/api/branch/inventory/recipes/${inventoryId}/status`,
        payload
      );
      return data;
    },
  },

  // ══════════════════════════════════════════════════════════════════════════
  // 11. Kitchens
  // ══════════════════════════════════════════════════════════════════════════
  kitchens: {
    selectOptions: async (): Promise<any> => {
      const { data } = await api.get<BranchApiResponse<any>>(
        '/api/branch/kitchens/select-options'
      );
      return data.data;
    },

    list: async (params?: BranchPaginationParams): Promise<BranchPaginatedResponse<BranchKitchen>> => {
      const { data } = await api.get<BranchPaginatedResponse<BranchKitchen>>(
        '/api/branch/kitchens',
        { params }
      );
      return data;
    },

    create: async (payload: CreateKitchenPayload): Promise<BranchKitchen> => {
      const { data } = await api.post<BranchApiResponse<BranchKitchen>>(
        '/api/branch/kitchens',
        payload
      );
      return data.data;
    },

    show: async (id: number): Promise<BranchKitchen> => {
      const { data } = await api.get<BranchApiResponse<BranchKitchen>>(
        `/api/branch/kitchens/${id}`
      );
      return data.data;
    },

    update: async (id: number, payload: UpdateKitchenPayload): Promise<BranchKitchen> => {
      const { data } = await api.put<BranchApiResponse<BranchKitchen>>(
        `/api/branch/kitchens/${id}`,
        payload
      );
      return data.data;
    },

    delete: async (id: number): Promise<void> => {
      await api.delete(`/api/branch/kitchens/${id}`);
    },
  },

  // ══════════════════════════════════════════════════════════════════════════
  // 12. Kitchen Products Assignment
  // ══════════════════════════════════════════════════════════════════════════
  kitchenProducts: {
    getUnassigned: async (lang?: string): Promise<BranchKitchenProduct[]> => {
      const { data } = await api.get<BranchApiResponse<BranchKitchenProduct[]>>(
        '/api/branch/kitchen-products/unassigned',
        { params: { lang } }
      );
      return data.data;
    },

    getAssigned: async (kitchenId: number, lang?: string): Promise<BranchKitchenProduct[]> => {
      const { data } = await api.get<BranchApiResponse<BranchKitchenProduct[]>>(
        `/api/branch/kitchen-products/${kitchenId}`,
        { params: { lang } }
      );
      return data.data;
    },

    assign: async (payload: AssignKitchenProductsPayload): Promise<any> => {
      const { data } = await api.post(
        '/api/branch/kitchen-products/assign',
        payload
      );
      return data;
    },
  },

  // ══════════════════════════════════════════════════════════════════════════
  // 13. Manufacturing
  // ══════════════════════════════════════════════════════════════════════════
  manufacturing: {
    selectOptions: async (): Promise<BranchManufacturingSelectOption> => {
      const { data } = await api.get<BranchApiResponse<BranchManufacturingSelectOption>>(
        '/api/branch/manufacturing/select-options'
      );
      return data.data;
    },

    getSpecifications: async (params: {
      product_id?: number;
      product_recipe_id?: number;
    }): Promise<BranchManufacturingSpecification> => {
      const { data } = await api.get<BranchApiResponse<BranchManufacturingSpecification>>(
        '/api/branch/manufacturing/specifications',
        { params }
      );
      return data.data;
    },

    list: async (params?: BranchPaginationParams): Promise<BranchPaginatedResponse<BranchManufacturingOrder>> => {
      const { data } = await api.get<BranchPaginatedResponse<BranchManufacturingOrder>>(
        '/api/branch/manufacturing',
        { params }
      );
      return data;
    },

    execute: async (payload: ExecuteManufacturingPayload): Promise<BranchManufacturingOrder> => {
      const { data } = await api.post<BranchApiResponse<BranchManufacturingOrder>>(
        '/api/branch/manufacturing',
        payload
      );
      return data.data;
    },

    show: async (id: number): Promise<BranchManufacturingOrder> => {
      const { data } = await api.get<BranchApiResponse<BranchManufacturingOrder>>(
        `/api/branch/manufacturing/${id}`
      );
      return data.data;
    },
  },

  // ══════════════════════════════════════════════════════════════════════════
  // 14. Orders
  // ══════════════════════════════════════════════════════════════════════════
  orders: {
    selectOptions: async (): Promise<BranchOrderSelectOptions> => {
      const { data } = await api.get<BranchApiResponse<BranchOrderSelectOptions>>(
        '/api/branch/orders/select-options'
      );
      return data.data;
    },

    list: async (params?: BranchOrderFilters): Promise<BranchPaginatedResponse<BranchOrder>> => {
      const { data } = await api.get<BranchPaginatedResponse<BranchOrder>>(
        '/api/branch/orders',
        { params }
      );
      return data;
    },

    listPOS: async (params?: BranchPaginationParams): Promise<BranchPaginatedResponse<BranchOrder>> => {
      const { data } = await api.get<BranchPaginatedResponse<BranchOrder>>(
        '/api/branch/orders/pos',
        { params }
      );
      return data;
    },

    listOnline: async (params?: BranchPaginationParams): Promise<BranchPaginatedResponse<BranchOrder>> => {
      const { data } = await api.get<BranchPaginatedResponse<BranchOrder>>(
        '/api/branch/orders/online',
        { params }
      );
      return data;
    },

    checkNew: async (payload: CheckNewOrdersPayload): Promise<any> => {
      const { data } = await api.post(
        '/api/branch/orders/check-new',
        payload
      );
      return data;
    },

    create: async (payload: CreateBranchOrderPayload): Promise<BranchOrder> => {
      const { data } = await api.post<BranchApiResponse<BranchOrder>>(
        '/api/branch/orders',
        payload
      );
      return data.data;
    },

    show: async (id: number): Promise<BranchOrder> => {
      const { data } = await api.get<BranchApiResponse<BranchOrder>>(
        `/api/branch/orders/${id}`
      );
      return data.data;
    },

    updateStatus: async (id: number, payload: UpdateBranchOrderStatusPayload): Promise<any> => {
      const { data } = await api.put(
        `/api/branch/orders/${id}/status`,
        payload
      );
      return data;
    },

    delete: async (id: number): Promise<void> => {
      await api.delete(`/api/branch/orders/${id}`);
    },
  },

  // ══════════════════════════════════════════════════════════════════════════
  // 15. Purchases (multipart/form-data for create — receipt file)
  // ══════════════════════════════════════════════════════════════════════════
  purchases: {
    selectOptions: async (): Promise<any> => {
      const { data } = await api.get<BranchApiResponse<any>>(
        '/api/branch/purchases/select-options'
      );
      return data.data;
    },

    list: async (params?: BranchPaginationParams): Promise<BranchPaginatedResponse<BranchPurchase>> => {
      const { data } = await api.get<BranchPaginatedResponse<BranchPurchase>>(
        '/api/branch/purchases',
        { params }
      );
      return data;
    },

    create: async (payload: CreatePurchasePayload): Promise<BranchPurchase> => {
      const fd = new FormData();

      if (payload.receipt) {
        fd.append('receipt', payload.receipt);
      }
      if (payload.notes) {
        fd.append('notes', payload.notes);
      }
      // Serialize items array into FormData
      payload.items.forEach((item, index) => {
        if (item.material_id !== undefined) {
          fd.append(`items[${index}][material_id]`, String(item.material_id));
        }
        if (item.product_recipe_id !== undefined) {
          fd.append(`items[${index}][product_recipe_id]`, String(item.product_recipe_id));
        }
        fd.append(`items[${index}][quantity]`, String(item.quantity));
        fd.append(`items[${index}][cost]`, String(item.cost));
      });

      const { data } = await api.post<BranchApiResponse<BranchPurchase>>(
        '/api/branch/purchases',
        fd,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );
      return data.data;
    },

    show: async (id: number): Promise<BranchPurchase> => {
      const { data } = await api.get<BranchApiResponse<BranchPurchase>>(
        `/api/branch/purchases/${id}`
      );
      return data.data;
    },

    delete: async (id: number): Promise<void> => {
      await api.delete(`/api/branch/purchases/${id}`);
    },
  },

  // ══════════════════════════════════════════════════════════════════════════
  // 16. Reports
  // ══════════════════════════════════════════════════════════════════════════
  reports: {
    getSelectOptions: async (): Promise<any> => {
      const { data } = await api.get<BranchApiResponse<any>>(
        '/api/branch/reports/start-shifts/select-options'
      );
      return data.data;
    },

    getStartShiftReport: async (params?: BranchShiftReportFilters): Promise<BranchShiftReportResponse> => {
      const { data } = await api.get<BranchShiftReportResponse>(
        '/api/branch/reports/start-shifts',
        { params }
      );
      return data;
    },
  },

  // ══════════════════════════════════════════════════════════════════════════
  // 17. Shifts
  // ══════════════════════════════════════════════════════════════════════════
  shifts: {
    selectOptions: async (): Promise<any> => {
      const { data } = await api.get<BranchApiResponse<any>>(
        '/api/branch/shifts/select-options'
      );
      return data.data;
    },

    list: async (params?: BranchPaginationParams): Promise<BranchPaginatedResponse<BranchShift>> => {
      const { data } = await api.get<BranchPaginatedResponse<BranchShift>>(
        '/api/branch/shifts',
        { params }
      );
      return data;
    },

    create: async (payload: CreateShiftPayload): Promise<BranchShift> => {
      const { data } = await api.post<BranchApiResponse<BranchShift>>(
        '/api/branch/shifts',
        payload
      );
      return data.data;
    },

    show: async (id: number): Promise<BranchShift> => {
      const { data } = await api.get<BranchApiResponse<BranchShift>>(
        `/api/branch/shifts/${id}`
      );
      return data.data;
    },

    update: async (id: number, payload: UpdateShiftPayload): Promise<BranchShift> => {
      const { data } = await api.put<BranchApiResponse<BranchShift>>(
        `/api/branch/shifts/${id}`,
        payload
      );
      return data.data;
    },

    delete: async (id: number): Promise<void> => {
      await api.delete(`/api/branch/shifts/${id}`);
    },
  },

  // ══════════════════════════════════════════════════════════════════════════
  // 18. Wastes
  // ══════════════════════════════════════════════════════════════════════════
  wastes: {
    selectOptions: async (): Promise<any> => {
      const { data } = await api.get<BranchApiResponse<any>>(
        '/api/branch/wastes/select-options'
      );
      return data.data;
    },

    list: async (params?: BranchPaginationParams): Promise<BranchPaginatedResponse<BranchWaste>> => {
      const { data } = await api.get<BranchPaginatedResponse<BranchWaste>>(
        '/api/branch/wastes',
        { params }
      );
      return data;
    },

    create: async (payload: CreateWastePayload): Promise<BranchWaste> => {
      const { data } = await api.post<BranchApiResponse<BranchWaste>>(
        '/api/branch/wastes',
        payload
      );
      return data.data;
    },

    show: async (id: number): Promise<BranchWaste> => {
      const { data } = await api.get<BranchApiResponse<BranchWaste>>(
        `/api/branch/wastes/${id}`
      );
      return data.data;
    },

    update: async (id: number, payload: UpdateWastePayload): Promise<BranchWaste> => {
      const { data } = await api.put<BranchApiResponse<BranchWaste>>(
        `/api/branch/wastes/${id}`,
        payload
      );
      return data.data;
    },

    delete: async (id: number): Promise<void> => {
      await api.delete(`/api/branch/wastes/${id}`);
    },
  },

  // ══════════════════════════════════════════════════════════════════════════
  // 19. Addons (/api/branch/addons)
  // ══════════════════════════════════════════════════════════════════════════
  addons: {
    selectOptions: async (): Promise<BranchAddonSelectOptions> => {
      const { data } = await api.get<BranchApiResponse<BranchAddonSelectOptions>>(
        '/api/branch/addons/select-options'
      );
      return data.data;
    },

    list: async (): Promise<BranchAddon[]> => {
      const { data } = await api.get<any>('/api/branch/addons');
      return data.data || [];
    },
  },
};

export const adminBranchApi = branchApi.adminBranches;

