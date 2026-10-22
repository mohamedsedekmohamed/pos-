import { api } from '../lib/axios';
import type {
  Category,
  SubCategory,
  Product,
  ProductDetail,
  Addon,
  CashierDevice,
  Hall,
  HallTable,
  Shift,
  StartShiftPayload,
  CashierFinancialAccount,
  CashierExpenseList,
  CashierExpense,
  CreateExpensePayload,
  ApiCartResponse,
  ApiCartItem,
  AddToCartPayload,
  UpdateCartPayload,
  CheckoutPayload,
  Order,
  OrderListResponse,
  OrdersQueryParams,
  Delivery,
  UpdateOrderStatusPayload,
  UnpaidDeliveryOrdersParams,
  SettlePaymentPayload,
  SettlePaymentResponse,
} from '../types/cashier';

export const cashierApi = {
  // ── Categories ──
  getParentCategories: async (params?: { lang?: string }): Promise<Category[]> => {
    const { data } = await api.get<{ status: boolean; data: Category[] }>(
      '/api/cashier/categories/parents',
      { params }
    );
    return data.data;
  },

  getSubCategories: async (params?: { category_id?: number; lang?: string }): Promise<SubCategory[]> => {
    const { data } = await api.get<{ status: boolean; data: SubCategory[] }>(
      '/api/cashier/categories/sub',
      { params }
    );
    return data.data;
  },

  // ── Products ──
  getProducts: async (params?: {
    category_id?: number;
    sub_category_id?: number;
    lang?: string;
  }): Promise<Product[]> => {
    const { data } = await api.get<{ status: boolean; data: Product[] }>(
      '/api/cashier/products',
      { params }
    );
    return data.data;
  },

  getProductDetail: async (productId: number, params?: { lang?: string }): Promise<ProductDetail> => {
    const { data } = await api.get<{ status: boolean; data: ProductDetail }>(
      `/api/cashier/products/${productId}`,
      { params }
    );
    return data.data;
  },

  // ── Addons ──
  getAddons: async (params?: { lang?: string }): Promise<Addon[]> => {
    const { data } = await api.get<{ status: boolean; data: Addon[] }>(
      '/api/cashier/addons',
      { params }
    );
    return data.data;
  },

  // ── Cashiers ──
  getCashiers: async (): Promise<CashierDevice[]> => {
    const { data } = await api.get<{ status: boolean; data: CashierDevice[] }>(
      '/api/cashier/cashiers'
    );
    return data.data;
  },

  // ── Halls & Tables ──
  getHalls: async (params?: { lang?: string }): Promise<Hall[]> => {
    const { data } = await api.get<{ status: boolean; data: Hall[] }>(
      '/api/cashier/halls',
      { params }
    );
    return data.data;
  },

  getHallTables: async (hallId: number, params?: { lang?: string }): Promise<HallTable[]> => {
    const { data } = await api.get<{ status: boolean; data: HallTable[] }>(
      '/api/cashier/hall-tables',
      { params: { hall_id: hallId, ...params } }
    );
    return data.data;
  },

  // ── Shift ──
  checkStartShift: async (): Promise<{
    status: boolean;
    message?: string;
    data?: any;
  }> => {
    const { data } = await api.get<{
      status: boolean;
      message?: string;
      data?: any;
    }>('/api/cashier/check-start-shift');
    return data;
  },

  startShift: async (params: StartShiftPayload): Promise<Shift> => {
    const { data } = await api.post<{
      status: boolean;
      message: string;
      data: Shift;
    }>('/api/cashier/start-shift', params);
    return data.data;
  },

  endShift: async (params: { total_mony: number }): Promise<Shift> => {
    const { data } = await api.post<{
      status: boolean;
      message: string;
      data: Shift;
    }>('/api/cashier/end-shift', params);
    return data.data;
  },

  // ── Financial Accounts & Expenses ──
  getFinancialAccounts: async (params?: { branch_id?: number; lang?: string }): Promise<CashierFinancialAccount[]> => {
    const { data } = await api.get<{ status: boolean; data: CashierFinancialAccount[] }>(
      '/api/cashier/financial-accounts',
      { params }
    );
    return data.data;
  },

  getExpenseLists: async (params?: { lang?: string }): Promise<CashierExpenseList[]> => {
    const { data } = await api.get<{ status: boolean; data: CashierExpenseList[] }>(
      '/api/cashier/expense-lists',
      { params }
    );
    return data.data;
  },

  getExpenses: async (shiftId?: number | null): Promise<{ data: CashierExpense[]; total_amount: number }> => {
    const { data } = await api.get<{ status: boolean; data: CashierExpense[]; total_amount: number }>(
      '/api/cashier/expenses',
      { params: shiftId ? { shift_id: shiftId } : undefined }
    );
    return data;
  },

  createExpense: async (payload: CreateExpensePayload): Promise<CashierExpense> => {
    const { data } = await api.post<{ status: boolean; data: CashierExpense }>(
      '/api/cashier/expenses',
      payload
    );
    return data.data;
  },

  // ── Cart ──
  getCart: async (module: string, tableId?: number | null): Promise<ApiCartResponse> => {
    const params: Record<string, any> = { module };
    if (tableId) {
      params.table_id = tableId;
    }
    const { data } = await api.get<ApiCartResponse>('/api/cashier/cart', {
      params,
    });
    return data;
  },

  addToCart: async (payload: AddToCartPayload): Promise<ApiCartItem> => {
    const body: AddToCartPayload = {
      without_recipe: false,
      ...payload,
    };
    const { data } = await api.post<{ status: boolean; message?: string; data: ApiCartItem }>(
      '/api/cashier/cart',
      body
    );
    if (data && data.status === false) {
      const err: any = new Error(data.message || 'Failed to add to cart');
      err.response = { data };
      throw err;
    }
    return data.data;
  },

  updateCartItem: async (cartId: number, payload: UpdateCartPayload): Promise<ApiCartItem> => {
    const { data } = await api.put<{ status: boolean; data: ApiCartItem }>(`/api/cashier/cart/${cartId}`, payload);
    return data.data;
  },

  removeCartItem: async (cartId: number): Promise<void> => {
    await api.delete(`/api/cashier/cart/${cartId}`);
  },

  clearCart: async (params?: { module?: string; table_id?: number | null }): Promise<void> => {
    await api.delete('/api/cashier/cart/clear', { params });
  },

  // ── Orders ──
  checkout: async (payload: CheckoutPayload): Promise<any> => {
    const { data } = await api.post('/api/cashier/orders/checkout', payload);
    return data;
  },

  getOrders: async (params?: OrdersQueryParams): Promise<OrderListResponse> => {
    const { data } = await api.get('/api/cashier/orders', { params });
    return data;
  },

  getOrderDetail: async (orderId: number): Promise<{ status: boolean; data: Order }> => {
    const { data } = await api.get(`/api/cashier/orders/${orderId}`);
    return data;
  },

  updateOrderStatus: async (orderId: number, payload: UpdateOrderStatusPayload): Promise<{ status: boolean; message: string; data: Order }> => {
    const { data } = await api.put(`/api/cashier/orders/${orderId}/status`, payload);
    return data;
  },

  // ── Deliveries ──
  getDeliveries: async (): Promise<Delivery[]> => {
    const { data } = await api.get<{ status: boolean; data: Delivery[] }>(
      '/api/cashier/deliveries/select'
    );
    return data.data;
  },

  getUnpaidDeliveryOrders: async (params?: UnpaidDeliveryOrdersParams): Promise<OrderListResponse> => {
    const { data } = await api.get<OrderListResponse>('/api/cashier/delivery-orders/unpaid', { params });
    return data;
  },

  settleDeliveryPayment: async (payload: SettlePaymentPayload): Promise<SettlePaymentResponse> => {
    const { data } = await api.post<SettlePaymentResponse>('/api/cashier/delivery-orders/settle-payment', payload);
    return data;
  },
};
