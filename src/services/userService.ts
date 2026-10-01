import axios from 'axios';
import { getUserUUID } from '../hooks/useUserUUID';
import type {
  UserCategory,
  UserSubCategory,
  UserProduct,
  UserProductDetail,
  UserAddon,
  UserBusinessSetup,
  UserCartResponse,
  UserAddToCartPayload,
  UserUpdateCartPayload,
  UserCheckoutPayload,
  UserCheckoutSuccessResponse,
  UserOrderData,
  UserOrderModule,
} from '../types/user';

export const USER_API_BASE_URL = 'https://ecommerce.mazoom.online';

// Dedicated Axios instance strictly for /api/user/* (No Auth, relies on device uu_id)
export const userAxios = axios.create({
  baseURL: USER_API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
  timeout: 15_000,
});

// Automatically inject uu_id and lang headers on every outgoing request
userAxios.interceptors.request.use((config) => {
  const uuId = getUserUUID();
  if (uuId) {
    config.headers['uu_id'] = uuId;
    config.headers['X-UU-ID'] = uuId;
  }

  // Get active language from localStorage if available
  try {
    const lang = localStorage.getItem('pos_language') || 'ar';
    config.headers['Accept-Language'] = lang;
    config.headers['lang'] = lang;
  } catch {
    // Ignore storage errors
  }

  return config;
});

export const userApi = {
  // ── 1. Business Setup ──
  getBusinessSetup: async (): Promise<UserBusinessSetup | null> => {
    try {
      const { data } = await userAxios.get<{ status: boolean; data: UserBusinessSetup }>(
        '/api/user/business-setup'
      );
      return data.data || null;
    } catch (error) {
      console.warn('Failed to fetch user business setup:', error);
      return null;
    }
  },

  // ── 2. Parent Categories ──
  getParentCategories: async (lang?: string): Promise<UserCategory[]> => {
    const { data } = await userAxios.get<{ status: boolean; data: UserCategory[] }>(
      '/api/user/categories/parents',
      { params: { lang } }
    );
    return data.data || [];
  },

  // ── 3. Sub Categories ──
  getSubCategories: async (
    categoryId?: number | null,
    lang?: string
  ): Promise<UserSubCategory[]> => {
    const { data } = await userAxios.get<{ status: boolean; data: UserSubCategory[] }>(
      '/api/user/categories/sub',
      {
        params: {
          category_id: categoryId || undefined,
          lang,
        },
      }
    );
    return data.data || [];
  },

  // ── 4. Products List ──
  getProducts: async (params?: {
    category_id?: number | null;
    sub_category_id?: number | null;
    lang?: string;
  }): Promise<UserProduct[]> => {
    const { data } = await userAxios.get<{ status: boolean; data: UserProduct[] }>(
      '/api/user/products',
      {
        params: {
          category_id: params?.category_id || undefined,
          sub_category_id: params?.sub_category_id || undefined,
          lang: params?.lang,
        },
      }
    );
    return data.data || [];
  },

  // ── 5. Product Details ──
  getProductDetail: async (
    productId: number,
    lang?: string
  ): Promise<UserProductDetail> => {
    const { data } = await userAxios.get<{ status: boolean; data: UserProductDetail }>(
      `/api/user/products/${productId}`,
      { params: { lang } }
    );
    return data.data;
  },

  // ── 6. Addons ──
  getAddons: async (lang?: string): Promise<UserAddon[]> => {
    const { data } = await userAxios.get<{ status: boolean; data: UserAddon[] }>(
      '/api/user/addons',
      { params: { lang } }
    );
    return data.data || [];
  },

  // ── 7. Cart APIs ──
  getCart: async (params?: {
    module?: UserOrderModule;
    lang?: string;
  }): Promise<UserCartResponse> => {
    const uuId = getUserUUID();
    const { data } = await userAxios.get<UserCartResponse>('/api/user/cart', {
      params: {
        uu_id: uuId,
        module: params?.module,
        lang: params?.lang,
      },
    });
    return data;
  },

  addToCart: async (payload: UserAddToCartPayload): Promise<any> => {
    const uuId = payload.uu_id || getUserUUID();
    const { data } = await userAxios.post('/api/user/cart', {
      ...payload,
      uu_id: uuId,
    });
    return data;
  },

  getCartItem: async (cartId: number): Promise<any> => {
    const uuId = getUserUUID();
    const { data } = await userAxios.get(`/api/user/cart/${cartId}`, {
      params: { uu_id: uuId },
    });
    return data;
  },

  updateCartItem: async (cartId: number, payload: UserUpdateCartPayload): Promise<any> => {
    const uuId = payload.uu_id || getUserUUID();
    const { data } = await userAxios.put(`/api/user/cart/${cartId}`, {
      ...payload,
      uu_id: uuId,
    });
    return data;
  },

  deleteCartItem: async (cartId: number): Promise<any> => {
    const uuId = getUserUUID();
    const { data } = await userAxios.delete(`/api/user/cart/${cartId}`, {
      params: { uu_id: uuId },
    });
    return data;
  },

  clearCart: async (module?: UserOrderModule): Promise<any> => {
    const uuId = getUserUUID();
    const { data } = await userAxios.delete('/api/user/cart/clear', {
      params: {
        uu_id: uuId,
        module,
      },
    });
    return data;
  },

  // ── 8. Orders & Checkout ──
  checkout: async (payload: UserCheckoutPayload): Promise<UserCheckoutSuccessResponse> => {
    const uuId = payload.uu_id || getUserUUID();
    const { data } = await userAxios.post<UserCheckoutSuccessResponse>(
      '/api/user/orders/checkout',
      {
        ...payload,
        uu_id: uuId,
      }
    );
    return data;
  },

  getOrder: async (orderId: number | string): Promise<UserOrderData> => {
    const { data } = await userAxios.get<{ status: boolean; data: UserOrderData }>(
      `/api/user/orders/${orderId}`
    );
    return data.data;
  },
};
