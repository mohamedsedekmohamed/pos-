import axios from 'axios';
import { getUserUUID } from '../hooks/useUserUUID';
import { notifyApiError } from '../context/ToastContext';
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
  UserPaymentMethod,
  UserCheckoutPayload,
  UserCheckoutSuccessResponse,
  UserOrderData,
  UserOrderModule,
  UserBanner,
} from '../types/user';

export const USER_API_BASE_URL = 'https://ecommerce.mazoom.online';

export const userAxios = axios.create({
  baseURL: USER_API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
  timeout: 15_000,
});

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

userAxios.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const responseData = error.response?.data;
    const message = responseData?.message;

    if (status === 400 && message) {
      const isClosed =
        typeof message === 'string' &&
        (message.includes('المطعم مغلق') ||
          message.includes('مواعيد العمل') ||
          message.toLowerCase().includes('closed'));

      notifyApiError(message, isClosed);
    }

    return Promise.reject(error);
  }
);

export const userApi = {
  // ── 1. Business Setup ──
  getBusinessSetup: async (lang?: string): Promise<UserBusinessSetup | null> => {
    try {
      const activeLang =
        lang ||
        (typeof window !== 'undefined' ? localStorage.getItem('pos_language') || 'ar' : 'ar');

      const { data } = await userAxios.get<{ status: boolean; data: UserBusinessSetup }>(
        '/api/user/business-setup',
        {
          params: { lang: activeLang },
        }
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
    try {
      const { data } = await userAxios.delete('/api/user/cart/clear', {
        params: {
          uu_id: uuId,
          module,
        },
      });
      return data;
    } catch (err: any) {
      // Fallback in case backend uses /api/user/cart/clear
      if (err.response?.status === 404) {
        const { data } = await userAxios.delete('/api/user/cart/clear', {
          params: {
            uu_id: uuId,
            module,
          },
        });
        return data;
      }
      throw err;
    }
  },

  // ── 8. Payment Methods ──
  getPaymentMethods: async (lang?: string): Promise<UserPaymentMethod[]> => {
    const { data } = await userAxios.get<{ status: boolean; data: UserPaymentMethod[] }>(
      '/api/user/payment-methods',
      { params: { lang } }
    );
    return data.data || [];
  },

  // ── 9. Menu Images ──
  getMenuImages: async (lang?: string): Promise<string[]> => {
    const { data } = await userAxios.get<{ status: boolean; data: string[] }>(
      '/api/user/menu',
      { params: { lang } }
    );
    return Array.isArray(data.data) ? data.data : [];
  },

  // ── 10. Orders & Checkout ──
  checkout: async (payload: UserCheckoutPayload): Promise<UserCheckoutSuccessResponse> => {
    const uuId = payload.uu_id || getUserUUID();
    const formData = new FormData();

    formData.append('uu_id', uuId);
    formData.append('payment_method_id', String(payload.payment_method_id));
    formData.append('lat', String(payload.lat));
    formData.append('lng', String(payload.lng));
    formData.append('address', payload.address);
    formData.append('phone', payload.phone);
    formData.append('name', payload.name);

    if (payload.note) formData.append('note', payload.note);
    if (payload.module) formData.append('module', payload.module);
    if (payload.lang) formData.append('lang', payload.lang);

    if (payload.receipt instanceof File) {
      formData.append('receipt', payload.receipt);
    }

    const { data } = await userAxios.post<UserCheckoutSuccessResponse>(
      '/api/user/orders/checkout',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
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

  // ── 11. Banners ──
  getBanners: async (lang?: string): Promise<UserBanner[]> => {
    try {
      const { data } = await userAxios.get<{ status: boolean; data: UserBanner[] }>(
        '/api/user/banners',
        { params: { lang } }
      );
      return Array.isArray(data.data) ? data.data : [];
    } catch (error) {
      console.warn('Failed to fetch user banners:', error);
      return [];
    }
  },
};
