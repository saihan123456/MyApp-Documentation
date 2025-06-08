'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslations } from '@/app/translations/client';

export default function ResponsiveSidebar({ links, currentSlug }) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const locale = pathname.split('/')[1];
  const t = useTranslations();

  // Check if we're on a mobile device on component mount and window resize
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    // Initial check
    checkIfMobile();
    
    // Add event listener for window resize
    window.addEventListener('resize', checkIfMobile);
    
    // Clean up
    return () => window.removeEventListener('resize', checkIfMobile);
  }, []);

  // Close sidebar when a link is clicked on mobile
  const handleLinkClick = () => {
    if (isMobile) {
      setIsOpen(false);
    }
  };

  return (
    <>
      {/* Mobile menu button - only shown on small screens */}
      {isMobile && (
        <button 
          onClick={() => setIsOpen(!isOpen)}
          aria-label={isOpen ? t.responsiveSidebarCloseMenu : t.responsiveSidebarOpenMenu}
          style={{
            position: 'fixed',
            left: isOpen ? '260px' : '20px',
            top: '80px',
            zIndex: 1000,
            background: 'rgba(255, 255, 255, 0.6)',
            color: 'var(--secondary-color)',
            border: 'none',
            borderRadius: '50%',
            width: '40px',
            height: '40px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
            transition: 'left 0.3s ease',
            cursor: 'pointer',
          }}
        >
          {isOpen ? (
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="3" y1="12" x2="21" y2="12"></line>
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <line x1="3" y1="18" x2="21" y2="18"></line>
            </svg>
          )}
        </button>
      )}
      
      {/* Sidebar - shown always on desktop, conditionally on mobile */}
      <div style={{ 
        width: '250px', 
        flexShrink: 0,
        backgroundColor: 'white',
        borderRadius: '8px',
        padding: '1.5rem',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
        height: 'fit-content',
        position: isMobile ? 'fixed' : 'relative',
        left: isMobile ? (isOpen ? '0' : '-280px') : '0',
        top: isMobile ? 'var(--navbar-height, 75px)' : '0',
        zIndex: 999,
        transition: 'left 0.3s ease',
        overflowY: 'auto',
        maxHeight: isMobile ? 'calc(100vh - var(--navbar-height, 75px))' : 'none',
      }}>
        <h3 style={{ marginBottom: '1rem' }}>{t.responsiveSidebarDocumentation}</h3>
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {links.map((link) => (
            <li key={link.slug} style={{ marginBottom: '0.75rem' }}>
              <Link 
                href={`/${locale}/docs/${link.slug}`} 
                onClick={handleLinkClick}
                style={{ 
                  color: link.slug === currentSlug ? 'var(--primary-color)' : 'var(--text-color)',
                  fontWeight: link.slug === currentSlug ? 'bold' : 'normal',
                }}
              >
                {link.title}
              </Link>
            </li>
          ))}
        </ul>
      </div>
      
      {/* Overlay to close the sidebar when clicking outside - only on mobile */}
      {isMobile && isOpen && (
        <div 
          onClick={() => setIsOpen(false)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            zIndex: 998,
          }}
        />
      )}
    </>
  );
}
