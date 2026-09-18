import { api } from '../lib/axios';
import type {
  TableInfo,
  TableCategory,
  TableSubCategory,
  TableProduct,
  TableProductDetail,
  TableAddon,
  TableAddToCartPayload,
  TableUpdateCartPayload,
  TableCartQueryParams,
} from '../types/table';

/**
 * Service strictly dedicated to `/api/table/*` endpoints.
 * Never attempts fallbacks or redirects to `/api/table-order/*`.
 */
export const tableApi = {
  // ── Table Info ──
  getTableInfo: async (hallTableId: number | string, lang: string = 'ar'): Promise<TableInfo> => {
    const { data } = await api.get<{ status: boolean; data: TableInfo }>(
      `/api/table/table/${hallTableId}`,
      { params: { lang } }
    );
    return data.data;
  },

  // ── Parent Categories ──
  getParentCategories: async (lang: string = 'ar'): Promise<TableCategory[]> => {
    const { data } = await api.get<{ status: boolean; data: TableCategory[] }>(
      '/api/table/categories/parents',
      { params: { lang } }
    );
    return data.data || [];
  },

  // ── Sub Categories ──
  getSubCategories: async (
    categoryId?: number | null,
    lang: string = 'ar'
  ): Promise<TableSubCategory[]> => {
    const { data } = await api.get<{ status: boolean; data: TableSubCategory[] }>(
      '/api/table/categories/sub',
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
  }): Promise<TableProduct[]> => {
    const { data } = await api.get<{ status: boolean; data: TableProduct[] }>(
      '/api/table/products',
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
  getProductDetail: async (productId: number, lang: string = 'ar'): Promise<TableProductDetail> => {
    const { data } = await api.get<{ status: boolean; data: TableProductDetail }>(
      `/api/table/products/${productId}`,
      { params: { lang } }
    );
    return data.data;
  },

  // ── Addons ──
  getAddons: async (lang: string = 'ar'): Promise<TableAddon[]> => {
    const { data } = await api.get<{ status: boolean; data: TableAddon[] }>(
      '/api/table/addons',
      { params: { lang } }
    );
    return data.data || [];
  },

  // ── Cart Endpoints (Strictly /api/table/cart/*) ──
  getCart: async (params?: TableCartQueryParams) => {
    const { data } = await api.get('/api/table/cart', { params });
    return data;
  },

  addToCart: async (payload: TableAddToCartPayload) => {
    const { data } = await api.post('/api/table/cart', payload);
    return data;
  },

  getCartItem: async (cartId: number | string, params?: Record<string, any>) => {
    const { data } = await api.get(`/api/table/cart/${cartId}`, { params });
    return data;
  },

  updateCartItem: async (cartId: number | string, payload: TableUpdateCartPayload) => {
    const { data } = await api.put(`/api/table/cart/${cartId}`, payload);
    return data;
  },

  deleteCartItem: async (cartId: number | string, params?: Record<string, any>) => {
    const { data } = await api.delete(`/api/table/cart/${cartId}`, { params });
    return data;
  },

  clearCart: async (params?: TableCartQueryParams) => {
    const { data } = await api.delete('/api/table/cart/clear', { params });
    return data;
  },
};
