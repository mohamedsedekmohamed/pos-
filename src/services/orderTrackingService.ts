import axios from 'axios';
import type { OrderTrackingApiResponse, OrderTrackingDetails } from '../types/orderTracking';

export const ORDER_TRACKING_BASE_URL = 'https://ecommerce.mazoom.online';

export const orderTrackingApi = {
  /**
   * Fetch order details by public tracking code/UUID
   * Endpoint: GET https://ecommerce.mazoom.online/api/orders/{code}
   */
  getOrderByCode: async (code: string, lang?: string): Promise<OrderTrackingDetails> => {
    const cleanCode = code.trim();
    if (!cleanCode) {
      throw new Error('كود الطلب غير محدد');
    }

    const { data } = await axios.get<OrderTrackingApiResponse>(
      `${ORDER_TRACKING_BASE_URL}/api/orders/${encodeURIComponent(cleanCode)}`,
      {
        params: {
          lang: lang || 'ar',
        },
        headers: {
          Accept: 'application/json',
          'Accept-Language': lang || 'ar',
        },
        timeout: 15_000,
      }
    );

    if (!data.status || !data.data) {
      throw new Error(data.message || 'تعذر العثور على الطلب');
    }

    return data.data;
  },
};
