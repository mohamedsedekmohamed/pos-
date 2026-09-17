/**
 * Renders a name that could be a plain string or a localized { ar, en } object.
 */
export const renderName = (name: unknown, lang: 'ar' | 'en' = 'ar'): string => {
  if (!name) return '';
  if (typeof name === 'object' && name !== null) {
    const localized = name as Record<string, string>;
    return localized[lang] || localized.ar || localized.en || '';
  }
  return String(name);
};

/**
 * Gets a localized string value from a LocalizedString object.
 */
export const getLocalizedString = (
  obj: { ar: string; en: string } | null | undefined,
  lang: 'ar' | 'en' = 'ar'
): string => {
  if (!obj) return '';
  return obj[lang] || obj.ar || obj.en || '';
};
