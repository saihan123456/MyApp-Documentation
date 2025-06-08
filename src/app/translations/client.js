'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import enTranslations from './en';
import jaTranslations from './ja';

// All available translations
const translations = {
  en: enTranslations,
  ja: jaTranslations
};

// Default language
const DEFAULT_LANGUAGE = 'en';

/**
 * Custom hook to get translations based on the current locale
 * @returns {Object} Translation object for the current locale
 */
export function useTranslations() {
  const pathname = usePathname();
  const [locale, setLocale] = useState(DEFAULT_LANGUAGE);
  
  useEffect(() => {
    if (pathname) {
      // Extract locale from pathname (first segment after the leading slash)
      const pathLocale = pathname.split('/')[1];
      if (translations[pathLocale]) {
        setLocale(pathLocale);
      }
    }
  }, [pathname]);
  
  return translations[locale] || translations[DEFAULT_LANGUAGE];
}
