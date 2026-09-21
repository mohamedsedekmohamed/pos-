import { useQuery } from '@tanstack/react-query';
import { businessApi, BUSINESS_BASE_URL } from '../services/businessService';
import type { BusinessSetup } from '../types/business';

export const BUSINESS_SETUP_QUERY_KEY = ['business-setup'] as const;

export const formatImageUrl = (url?: string | null): string | null => {
  if (!url || typeof url !== 'string') return null;
  const trimmed = url.trim();
  if (!trimmed) return null;
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return trimmed;
  }
  return `${BUSINESS_BASE_URL}${trimmed.startsWith('/') ? '' : '/'}${trimmed}`;
};

export const useBusinessSetup = () => {
  const query = useQuery({
    queryKey: BUSINESS_SETUP_QUERY_KEY,
    queryFn: businessApi.getBusinessSetup,
    staleTime: 1000 * 60 * 30, // 30 minutes
    refetchOnWindowFocus: false,
    retry: 1,
  });

  const business: BusinessSetup | null = query.data ?? null;

  // Prefer logo, then raw_logo
  const rawLogo = business?.logo || business?.raw_logo || null;
  const logoUrl = formatImageUrl(rawLogo);

  // Check if there is any non-empty data
  const hasBusinessData = Boolean(
    business &&
      (business.name?.trim() ||
        business.description?.trim() ||
        rawLogo?.trim() ||
        business.phone?.trim() ||
        business.face?.trim() ||
        business.instagram?.trim() ||
        business.whats?.trim())
  );

  return {
    ...query,
    business,
    logoUrl,
    hasBusinessData,
  };
};
