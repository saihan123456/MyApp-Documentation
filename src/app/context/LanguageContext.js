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
    
    // Redirect to the same page but with new locale
    if (pathname) {
      // Extract current locale from pathname
      const pathParts = pathname.split('/');
      
      // If path has at least one segment (after the initial slash)
      if (pathParts.length > 1) {
        // Replace the locale part (first segment) with the new language
        pathParts[1] = newLanguage;
        const newPath = pathParts.join('/');
        router.push(newPath);
      } else {
        // If we're at root, just go to the new language root
        router.push(`/${newLanguage}`);
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
