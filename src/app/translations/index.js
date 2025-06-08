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
 * Server-side function to get translations for a specific locale
 * @param {string} locale - The locale to get translations for
 * @returns {Object} Translation object for the specified locale
 */
export function getTranslations(locale) {
  return translations[locale] || translations[DEFAULT_LANGUAGE];
}
