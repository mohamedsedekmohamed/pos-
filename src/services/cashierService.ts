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
  ApiCartResponse,
  ApiCartItem,
  AddToCartPayload,
  UpdateCartPayload,
  CheckoutPayload,
  Order,
  OrderListResponse,
} from '../types/cashier';

export const cashierApi = {
  // ── Categories ──
  getParentCategories: async (): Promise<Category[]> => {
    const { data } = await api.get<{ status: boolean; data: Category[] }>(
      '/api/cashier/categories/parents'
    );
    return data.data;
  },

  getSubCategories: async (): Promise<SubCategory[]> => {
    const { data } = await api.get<{ status: boolean; data: SubCategory[] }>(
      '/api/cashier/categories/sub'
    );
    return data.data;
  },

  // ── Products ──
  getProducts: async (params?: {
    category_id?: number;
    sub_category_id?: number;
  }): Promise<Product[]> => {
    const { data } = await api.get<{ status: boolean; data: Product[] }>(
      '/api/cashier/products',
      { params }
    );
    return data.data;
  },

  getProductDetail: async (productId: number): Promise<ProductDetail> => {
    const { data } = await api.get<{ status: boolean; data: ProductDetail }>(
      `/api/cashier/products/${productId}`
    );
    return data.data;
  },

  // ── Addons ──
  getAddons: async (): Promise<Addon[]> => {
    const { data } = await api.get<{ status: boolean; data: Addon[] }>(
      '/api/cashier/addons'
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
  getHalls: async (): Promise<Hall[]> => {
    const { data } = await api.get<{ status: boolean; data: Hall[] }>(
      '/api/cashier/halls'
    );
    return data.data;
  },

  getHallTables: async (hallId: number): Promise<HallTable[]> => {
    const { data } = await api.get<{ status: boolean; data: HallTable[] }>(
      '/api/cashier/hall-tables',
      { params: { hall_id: hallId } }
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

  startShift: async (params: {
    cashier_id: number;
    cashier_man_id?: number | null;
  }): Promise<Shift> => {
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

  // ── Cart ──
  getCart: async (module: string): Promise<ApiCartResponse> => {
    const { data } = await api.get<ApiCartResponse>('/api/cashier/cart', {
      params: { module },
    });
    return data;
  },

  addToCart: async (payload: AddToCartPayload): Promise<ApiCartItem> => {
    const { data } = await api.post<{ status: boolean; data: ApiCartItem }>('/api/cashier/cart', payload);
    return data.data;
  },

  updateCartItem: async (cartId: number, payload: UpdateCartPayload): Promise<ApiCartItem> => {
    const { data } = await api.put<{ status: boolean; data: ApiCartItem }>(`/api/cashier/cart/${cartId}`, payload);
    return data.data;
  },

  removeCartItem: async (cartId: number): Promise<void> => {
    await api.delete(`/api/cashier/cart/${cartId}`);
  },

  clearCart: async (): Promise<void> => {
    await api.delete('/api/cashier/cart/clear');
  },

  // ── Orders ──
  checkout: async (payload: CheckoutPayload): Promise<any> => {
    const { data } = await api.post('/api/cashier/orders/checkout', payload);
    return data;
  },

  getOrders: async (params?: Record<string, any>): Promise<OrderListResponse> => {
    const { data } = await api.get('/api/cashier/orders', { params });
    return data;
  },

  getOrderDetail: async (orderId: number): Promise<{ status: boolean; data: Order }> => {
    const { data } = await api.get(`/api/cashier/orders/${orderId}`);
    return data;
  },
};
