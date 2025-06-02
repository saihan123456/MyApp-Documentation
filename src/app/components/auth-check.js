'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function AuthCheck({ children }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);
  
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
