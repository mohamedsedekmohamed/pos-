import React, { createContext, useContext, useState, useEffect } from 'react';
import { translations, type Language, type TranslationKey } from '../locales/translations';

interface LanguageContextType {
  language: Language;
  dir: 'rtl' | 'ltr';
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  t: (key: TranslationKey, fallback?: string) => string;
  renderLocalized: (val: unknown) => string;
}

const STORAGE_KEY_LANG = 'pos_language';

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_LANG);
      if (stored === 'ar' || stored === 'en') return stored;
    } catch {
      // Ignore storage errors
    }
    return 'ar';
  });

  const dir: 'rtl' | 'ltr' = language === 'ar' ? 'rtl' : 'ltr';

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_LANG, language);
    } catch {
      // Ignore storage errors
    }
    document.documentElement.dir = dir;
    document.documentElement.lang = language;
  }, [language, dir]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
  };

  const toggleLanguage = () => {
    setLanguageState((prev) => (prev === 'ar' ? 'en' : 'ar'));
  };

  const t = (key: TranslationKey, fallback?: string): string => {
    const dict = translations[language] || translations.ar;
    return (dict as Record<string, string>)[key] || fallback || key;
  };

  const renderLocalized = (val: unknown): string => {
    if (!val) return '';
    if (typeof val === 'object' && val !== null) {
      const localized = val as Record<string, string>;
      return localized[language] || localized.ar || localized.en || '';
    }
    if (typeof val === 'string') {
      try {
        const parsed = JSON.parse(val);
        if (typeof parsed === 'object' && parsed !== null) {
          return parsed[language] || parsed.ar || parsed.en || val;
        }
      } catch {
        // Not a JSON object, use as is
      }
      return val;
    }
    return String(val);
  };

  return (
    <LanguageContext.Provider
      value={{
        language,
        dir,
        setLanguage,
        toggleLanguage,
        t,
        renderLocalized,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};
