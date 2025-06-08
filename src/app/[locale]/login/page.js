'use client';

import { useState, useEffect } from 'react';
import { signIn, useSession } from 'next-auth/react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useTranslations } from '@/app/translations/client';

export default function LoginPage() {
  // Extract the locale from pathname instead of params
  const pathname = usePathname();
  const locale = pathname.split('/')[1]; // Gets the first segment after the leading slash
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session, status } = useSession();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const t = useTranslations(); // Get translations based on current locale
  
  // Get the callback URL from the URL parameters
  // If no callback URL is provided, default to the admin page with the current locale
  const callbackUrl = searchParams.get('callbackUrl') || `/${locale}/admin`;

  // Redirect to callback URL if already authenticated
  useEffect(() => {
    if (status === 'authenticated') {
      // If there's a callback URL in the query parameters, use it
      // Otherwise default to home page
      router.push(callbackUrl);
    }
  }, [status, router, callbackUrl]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!username || !password) {
      setError(t.fieldsRequired);
      return;
    }
    
    try {
      setIsLoading(true);
      setError('');
      
      const result = await signIn('credentials', {
        username,
        password,
        redirect: false,
      });
      
      if (result.error) {
        setError(t.invalidCredentials);
        setIsLoading(false);
        return;
      }
      
      // Redirect to the callback URL or admin dashboard on successful login
      router.push(callbackUrl);
      router.refresh();
    } catch (error) {
      console.error('Login error:', error);
      setError(t.loginError);
      setIsLoading(false);
    }
  };

  return (
    <div className="container">
      <div style={{ maxWidth: '400px', margin: '100px auto', padding: '20px', backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
        <h1 style={{ textAlign: 'center', marginBottom: '24px' }}>{t.adminLogin}</h1>
        
        {error && (
          <div className="alert alert-danger">{error}</div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="username">{t.username}</label>
            <input
              id="username"
              type="text"
              className="form-control"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={isLoading}
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="password">{t.password}</label>
            <input
              id="password"
              type="password"
              className="form-control"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
            />
          </div>
          
          <button 
            type="submit" 
            className="btn" 
            style={{ width: '100%', marginTop: '16px' }}
            disabled={isLoading}
          >
            {isLoading ? t.loggingIn : t.login}
          </button>
        </form>
        
        <div style={{ marginTop: '20px', textAlign: 'center' }}>
          <Link href={`/${locale}`}>{t.backToDocumentation}</Link>
        </div>
      </div>
    </div>
  );
}
