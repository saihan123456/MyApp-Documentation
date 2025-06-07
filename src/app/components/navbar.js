'use client';

import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

export default function Navbar() {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [showLanguageDropdown, setShowLanguageDropdown] = useState(false);
  const [language, setLanguage] = useState('en'); // Default language is English
  const [isMobile, setIsMobile] = useState(false);
  const [navbarHeight, setNavbarHeight] = useState(60); // Default height
  
  // Check if we're on a mobile device on component mount and window resize
  useEffect(() => {
    const checkIfMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
    };
    
    // Initial check
    checkIfMobile();
    
    // Add event listener for window resize
    window.addEventListener('resize', checkIfMobile);
    
    // Clean up
    return () => window.removeEventListener('resize', checkIfMobile);
  }, []);
  
  // Measure navbar height after render and when window resizes
  useEffect(() => {
    const updateNavbarHeight = () => {
      const navElement = document.querySelector('nav');
      if (navElement) {
        const height = navElement.offsetHeight;
        setNavbarHeight(height);
        
        // Update CSS variable for the navbar height
        document.documentElement.style.setProperty('--navbar-height', `${height}px`);
      }
    };
    
    // Initial measurement
    updateNavbarHeight();
    
    // Add event listener for window resize
    window.addEventListener('resize', updateNavbarHeight);
    
    // Clean up
    return () => window.removeEventListener('resize', updateNavbarHeight);
  }, []);
  
  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };
  
  const toggleLanguageDropdown = () => {
    setShowLanguageDropdown(!showLanguageDropdown);
  };
  
  const selectLanguage = (lang) => {
    setLanguage(lang);
    setShowLanguageDropdown(false);
    // Language logic will be implemented later
  };
  
  return (
    <nav style={{
      backgroundColor: 'var(--secondary-color)',
      color: 'white',
      padding: '0.7rem 0',
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      width: '100%',
      zIndex: 1000,
    }}>
      <div className="container" style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        <div>
          <Link href="/" style={{
            fontSize: '1.5rem',
            fontWeight: 'bold',
            color: 'white',
            textDecoration: 'none',
          }}>
            MyApp Docs
          </Link>
        </div>
        
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          {/* Search bar with integrated magnifier icon */}
          <form onSubmit={handleSearch} style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search documents..."
              style={{
                padding: '0.5rem 2.5rem 0.5rem 0.75rem',
                borderRadius: '4px',
                border: 'none',
                width: '200px',
                fontSize: '0.9rem',
              }}
            />
            <button
              type="submit"
              style={{
                position: 'absolute',
                right: '8px',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '0',
                color: 'var(--dark-gray)',
              }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
            </button>
          </form>
          
          {/* Language selector dropdown */}
          <div style={{ position: 'relative' }}>
            <button 
              onClick={toggleLanguageDropdown}
              style={{
                background: 'none',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                borderRadius: '4px',
                color: 'white',
                cursor: 'pointer',
                padding: '0.4rem 0.6rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.3rem',
              }}
            >
              {language === 'en' ? '🇺🇸 English' : '🇯🇵 日本語'}
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>
            </button>
            
            {showLanguageDropdown && (
              <div style={{
                position: 'absolute',
                top: '100%',
                right: 0,
                backgroundColor: 'white',
                borderRadius: '4px',
                boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
                marginTop: '0.3rem',
                zIndex: 10,
                overflow: 'hidden',
                width: '140px',
              }}>
                <button 
                  onClick={() => selectLanguage('en')}
                  style={{
                    display: 'block',
                    width: '100%',
                    textAlign: 'left',
                    padding: '0.6rem 1rem',
                    border: 'none',
                    borderBottom: '1px solid #eee',
                    backgroundColor: language === 'en' ? '#f5f5f5' : 'white',
                    cursor: 'pointer',
                  }}
                >
                  🇺🇸 English
                </button>
                <button 
                  onClick={() => selectLanguage('ja')}
                  style={{
                    display: 'block',
                    width: '100%',
                    textAlign: 'left',
                    padding: '0.6rem 1rem',
                    border: 'none',
                    backgroundColor: language === 'ja' ? '#f5f5f5' : 'white',
                    cursor: 'pointer',
                  }}
                >
                  🇯🇵 日本語
                </button>
              </div>
            )}
          </div>
          
          {/* Admin and authentication links - only shown when authenticated */}
          {status === 'authenticated' && (
            <>
              <Link href="/admin" style={{
                color: 'white',
                padding: '0.5rem',
                fontWeight: pathname?.startsWith('/admin') && !pathname?.startsWith('/admin/settings') ? 'bold' : 'normal',
                borderBottom: pathname?.startsWith('/admin') && !pathname?.startsWith('/admin/settings') ? '2px solid white' : 'none',
                textDecoration: 'none',
              }}>
                Admin
              </Link>
              
              <Link href="/admin/settings" style={{
                color: 'white',
                padding: '0.5rem',
                fontWeight: pathname?.startsWith('/admin/settings') ? 'bold' : 'normal',
                borderBottom: pathname?.startsWith('/admin/settings') ? '2px solid white' : 'none',
                textDecoration: 'none',
              }}>
                Settings
              </Link>
              
              <button 
                onClick={() => signOut({ callbackUrl: '/' })}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'white',
                  cursor: 'pointer',
                  padding: '0.5rem',
                }}
              >
                Logout
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
