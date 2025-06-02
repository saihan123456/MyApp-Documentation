import Link from 'next/link';
import Navbar from './components/navbar';

export default function NotFound() {
  return (
    <div>
      <Navbar />
      
      <div className="container" style={{ 
        padding: '4rem 0',
        textAlign: 'center',
        maxWidth: '600px',
        margin: '0 auto',
      }}>
        <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>404 - Page Not Found</h1>
        <p style={{ fontSize: '1.25rem', color: 'var(--dark-gray)', marginBottom: '2rem' }}>
          The page you are looking for does not exist or has been moved.
        </p>
        
        <Link href="/" className="btn">
          Return to Home
        </Link>
      </div>
    </div>
  );
}
