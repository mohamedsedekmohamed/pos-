import { api } from '../lib/axios';
import type {
  KitchenOrdersResponse,
  KitchenDoneOrdersResponse,
  KitchenCheckNewResponse,
} from '../types/kitchen';

export const kitchenApi = {
  /**
   * Get current pending kitchen orders
   * GET /api/kitchen/orders
   */
  getOrders: async (lang: string = 'ar'): Promise<KitchenOrdersResponse> => {
    const { data } = await api.get<KitchenOrdersResponse>('/api/kitchen/orders', {
      params: { lang },
      headers: { 'X-Auth-Guard': 'kitchen' },
    });
    return data;
  },

  /**
   * Get done/completed kitchen orders
   * GET /api/kitchen/orders/done
   */
  getDoneOrders: async (params?: {
    captain_order_id?: number | null;
    date?: string | null;
    lang?: string | null;
    module?: string | null;
    page?: number | null;
    per_page?: number | null;
    table_id?: number | null;
  }): Promise<KitchenDoneOrdersResponse> => {
    const { data } = await api.get<KitchenDoneOrdersResponse>('/api/kitchen/orders/done', {
      params: { lang: 'ar', ...params },
      headers: { 'X-Auth-Guard': 'kitchen' },
    });
    return data;
  },

  /**
   * Check for new orders
   * GET /api/kitchen/orders/check-new
   */
  checkNewOrders: async (count: number, lang: string = 'ar'): Promise<KitchenCheckNewResponse> => {
    const { data } = await api.get<KitchenCheckNewResponse>('/api/kitchen/orders/check-new', {
      params: { count, lang },
      headers: { 'X-Auth-Guard': 'kitchen' },
    });
    return data;
  },

  /**
   * Mark a kitchen order as done
   * PUT /api/kitchen/orders/{kitchenOrder}/done
   */
  markOrderDone: async (kitchenOrderId: number): Promise<{ status: boolean }> => {
    const { data } = await api.put<{ status: boolean }>(
      `/api/kitchen/orders/${kitchenOrderId}/done`,
      {},
      { headers: { 'X-Auth-Guard': 'kitchen' } }
    );
    return data;
  },
};
