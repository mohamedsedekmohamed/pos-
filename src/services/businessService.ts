import type { BusinessSetup } from '../types/business';

export const BUSINESS_BASE_URL = 'https://ecommerce.mazoom.online';

export const businessApi = {
  /**
   * Public business setup details
   * Note: https://ecommerce.mazoom.online/api/business-setup does not exist on the server (404).
   * Returning null to avoid 404 network errors.
   */
  getBusinessSetup: async (): Promise<BusinessSetup | null> => {
    return null;
  },
};
