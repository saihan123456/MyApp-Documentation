'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Cookies from 'js-cookie';

// Create the language context
const LanguageContext = createContext();

// Cookie name for storing language preference
const LANGUAGE_COOKIE_NAME = 'preferred_language';

export function LanguageProvider({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const [language, setLanguage] = useState('en'); // Default to English
  
  // Initialize language from cookie on component mount
  useEffect(() => {
    const savedLanguage = Cookies.get(LANGUAGE_COOKIE_NAME);
    if (savedLanguage) {
      setLanguage(savedLanguage);
    }
  }, []);
  
  // Function to change language
  const changeLanguage = (newLanguage) => {
    if (newLanguage === language) return; // No change needed
    
    // Save to cookie (expires in 365 days)
    Cookies.set(LANGUAGE_COOKIE_NAME, newLanguage, { expires: 365 });
    
    // Update state
    setLanguage(newLanguage);
    
    // Redirect to the appropriate page with new locale
    if (pathname) {
      // Get the current URL to preserve search parameters
      const url = new URL(window.location.href);
      const searchParams = url.search; // This includes the '?' character
      
      // Extract current locale from pathname
      const pathParts = pathname.split('/');
      
      // Check if we're on a document page (which has unique slugs per language)
      const isDocumentPage = pathParts.length > 2 && pathParts[2] === 'docs' && pathParts.length > 3;
      
      // If we're on a document page, redirect to home page of the new language
      if (isDocumentPage) {
        router.push(`/${newLanguage}`);
        return;
      }
      
      // For other pages, maintain the current path but change the locale
      if (pathParts.length > 1) {
        // Replace the locale part (first segment) with the new language
        pathParts[1] = newLanguage;
        const newPath = pathParts.join('/');
        // Preserve search parameters when redirecting
        router.push(`${newPath}${searchParams}`);
      } else {
        // If we're at root, just go to the new language root
        router.push(`/${newLanguage}${searchParams}`);
      }
    }
  };
  
  return (
    <LanguageContext.Provider value={{ language, changeLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
}

// Custom hook to use the language context
export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
