import { useQuery } from '@tanstack/react-query';
import { userApi } from '../services/userService';
import { BUSINESS_BASE_URL } from '../services/businessService';
import type { BusinessSetup } from '../types/business';
import type { UserBusinessSetup } from '../types/user';

export const BUSINESS_SETUP_QUERY_KEY = 'business-setup';

export const formatImageUrl = (url?: string | null): string | null => {
  if (!url || typeof url !== 'string') return null;
  const trimmed = url.trim();
  if (!trimmed) return null;
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return trimmed;
  }
  return `${BUSINESS_BASE_URL}${trimmed.startsWith('/') ? '' : '/'}${trimmed}`;
};

export const useBusinessSetup = (langOverride?: string) => {
  // Read current active language safely from localStorage
  const currentLang =
    langOverride ||
    (typeof window !== 'undefined' ? localStorage.getItem('pos_language') || 'ar' : 'ar');

  const query = useQuery<UserBusinessSetup | BusinessSetup | null>({
    queryKey: [BUSINESS_SETUP_QUERY_KEY, currentLang],
    queryFn: async () => {
      // Primary: call GET /api/user/business-setup?lang=...
      const userSetup = await userApi.getBusinessSetup(currentLang);
      return userSetup || null;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes fresh
    refetchOnWindowFocus: true, // Auto check status on focus to react quickly to business hours
    retry: 1,
  });

  const business = query.data ?? null;

  // Business Open / Closed State
  // is_open === false means definitely closed
  const isClosed = business?.is_open === false;
  const isOpen = !isClosed;

  const startDay = business?.start_day || null;
  const endDay = business?.end_day || null;
  const workingHoursText =
    business?.working_hours_text ||
    (startDay && endDay ? `مواعيد العمل من ${startDay} الى ${endDay}` : null);

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
    isOpen,
    isClosed,
    startDay,
    endDay,
    workingHoursText,
  };
};
