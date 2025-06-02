'use client';

import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { usePathname } from 'next/navigation';

export default function Navbar() {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  
  return (
    <nav style={{
      backgroundColor: 'var(--secondary-color)',
      color: 'white',
      padding: '1rem 0',
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
        
        <div style={{ display: 'flex', gap: '1rem' }}>
          <Link href="/" style={{
            color: 'white',
            padding: '0.5rem',
            fontWeight: pathname === '/' ? 'bold' : 'normal',
            borderBottom: pathname === '/' ? '2px solid white' : 'none',
          }}>
            Home
          </Link>
          
          {status === 'authenticated' ? (
            <>
              <Link href="/admin" style={{
                color: 'white',
                padding: '0.5rem',
                fontWeight: pathname?.startsWith('/admin') ? 'bold' : 'normal',
                borderBottom: pathname?.startsWith('/admin') ? '2px solid white' : 'none',
              }}>
                Admin
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
          ) : (
            <Link href="/login" style={{
              color: 'white',
              padding: '0.5rem',
              fontWeight: pathname === '/login' ? 'bold' : 'normal',
              borderBottom: pathname === '/login' ? '2px solid white' : 'none',
            }}>
              Login
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
