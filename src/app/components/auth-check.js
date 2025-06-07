'use client';

import { useSession } from 'next-auth/react';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';

export default function AuthCheck({ children }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const { language } = useLanguage();
  
  useEffect(() => {
    if (status === 'unauthenticated') {
      // Use the language from context for the redirect
      router.push(`/${language}/login?callbackUrl=${encodeURIComponent(pathname)}`);
    }
  }, [status, router, language, pathname]);
  
  if (status === 'loading') {
    return (
      <div className="container" style={{ padding: '50px', textAlign: 'center' }}>
        <p>Loading...</p>
      </div>
    );
  }
  
  if (status === 'authenticated') {
    return <>{children}</>;
  }
  
  // Don't render anything while redirecting
  return null;
}
