import axios from 'axios';
import type { BusinessSetup, BusinessSetupResponse } from '../types/business';

export const BUSINESS_BASE_URL = 'https://ecommerce.mazoom.online';

export const businessApi = {
  /**
   * Get public business setup details (no token required)
   * GET /api/business-setup
   */
  getBusinessSetup: async (): Promise<BusinessSetup | null> => {
    try {
      const response = await axios.get<BusinessSetupResponse>(
        `${BUSINESS_BASE_URL}/api/business-setup`,
        {
          headers: {
            Accept: 'application/json',
          },
          timeout: 10_000,
        }
      );

      if (response.data && response.data.status && response.data.data) {
        return response.data.data;
      }
      return null;
    } catch (error) {
      console.warn('Failed to fetch business setup:', error);
      return null;
    }
  },
};
