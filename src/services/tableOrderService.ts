import { api } from '../lib/axios';
import type {
  TableOrderInfo,
  TableOrderCategory,
  TableOrderSubCategory,
  TableOrderProduct,
  TableOrderProductDetail,
  TableOrderAddon,
  TableOrderAddToCartPayload,
  TableOrderUpdateCartPayload,
  TableOrderCartQueryParams,
} from '../types/tableOrder';

/**
 * Service strictly dedicated to `/api/table-order/*` endpoints.
 * Never attempts fallbacks or redirects to `/api/table/*`.
 */
export const tableOrderApi = {
  // ── Table Order Info ──
  getTableInfo: async (hallTableId: number | string, lang: string = 'ar'): Promise<TableOrderInfo> => {
    const { data } = await api.get<{ status: boolean; data: TableOrderInfo }>(
      `/api/table-order/table/${hallTableId}`,
      { params: { lang } }
    );
    return data.data;
  },

  // ── Parent Categories ──
  getParentCategories: async (lang: string = 'ar'): Promise<TableOrderCategory[]> => {
    const { data } = await api.get<{ status: boolean; data: TableOrderCategory[] }>(
      '/api/table-order/categories/parents',
      { params: { lang } }
    );
    return data.data || [];
  },

  // ── Sub Categories ──
  getSubCategories: async (
    categoryId?: number | null,
    lang: string = 'ar'
  ): Promise<TableOrderSubCategory[]> => {
    const { data } = await api.get<{ status: boolean; data: TableOrderSubCategory[] }>(
      '/api/table-order/categories/sub',
      {
        params: {
          category_id: categoryId || undefined,
          lang,
        },
      }
    );
    return data.data || [];
  },

  // ── Products ──
  getProducts: async (params?: {
    category_id?: number | null;
    sub_category_id?: number | null;
    lang?: string;
  }): Promise<TableOrderProduct[]> => {
    const { data } = await api.get<{ status: boolean; data: TableOrderProduct[] }>(
      '/api/table-order/products',
      {
        params: {
          category_id: params?.category_id || undefined,
          sub_category_id: params?.sub_category_id || undefined,
          lang: params?.lang || 'ar',
        },
      }
    );
    return data.data || [];
  },

  // ── Product Detail (with Variations & Options) ──
  getProductDetail: async (
    productId: number,
    lang: string = 'ar'
  ): Promise<TableOrderProductDetail> => {
    const { data } = await api.get<{ status: boolean; data: TableOrderProductDetail }>(
      `/api/table-order/products/${productId}`,
      { params: { lang } }
    );
    return data.data;
  },

  // ── Addons ──
  getAddons: async (lang: string = 'ar'): Promise<TableOrderAddon[]> => {
    const { data } = await api.get<{ status: boolean; data: TableOrderAddon[] }>(
      '/api/table-order/addons',
      { params: { lang } }
    );
    return data.data || [];
  },

  // ── Cart Endpoints (Strictly /api/table-order/cart/*) ──
  getCart: async (params?: TableOrderCartQueryParams) => {
    const { data } = await api.get('/api/table-order/cart', { params });
    return data;
  },

  addToCart: async (payload: TableOrderAddToCartPayload) => {
    const { data } = await api.post('/api/table-order/cart', payload);
    return data;
  },

  getCartItem: async (cartId: number | string, params?: Record<string, any>) => {
    const { data } = await api.get(`/api/table-order/cart/${cartId}`, { params });
    return data;
  },

  updateCartItem: async (cartId: number | string, payload: TableOrderUpdateCartPayload) => {
    const { data } = await api.put(`/api/table-order/cart/${cartId}`, payload);
    return data;
  },

  deleteCartItem: async (cartId: number | string, params?: Record<string, any>) => {
    const { data } = await api.delete(`/api/table-order/cart/${cartId}`, { params });
    return data;
  },

  clearCart: async (params?: TableOrderCartQueryParams) => {
    const { data } = await api.delete('/api/table-order/cart/clear', { params });
    return data;
  },
};
