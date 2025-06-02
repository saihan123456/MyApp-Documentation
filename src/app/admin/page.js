'use client';

import { useSession } from 'next-auth/react';
import AuthCheck from '../components/auth-check';
import Navbar from '../components/navbar';
import Link from 'next/link';

export default function AdminDashboard() {
  const { data: session } = useSession();
  
  return (
    <AuthCheck>
      <div>
        <Navbar />
        
        <div className="container" style={{ padding: '2rem 0' }}>
          <h1>Admin Dashboard</h1>
          <p>Welcome, {session?.user?.name || session?.user?.username || 'Admin'}</p>
          
          <div style={{ marginTop: '2rem' }}>
            <h2>Documentation Management</h2>
            
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
              gap: '1rem',
              marginTop: '1rem' 
            }}>
              <AdminCard 
                title="Create Document" 
                description="Create a new documentation page"
                link="/admin/documents/new"
                icon="📝"
              />
              
              <AdminCard 
                title="Manage Documents" 
                description="Edit or delete existing documentation"
                link="/admin/documents"
                icon="📚"
              />
              
              <AdminCard 
                title="Settings" 
                description="Configure documentation settings"
                link="/admin/settings"
                icon="⚙️"
              />
            </div>
          </div>
        </div>
      </div>
    </AuthCheck>
  );
}

function AdminCard({ title, description, link, icon }) {
  return (
    <Link href={link} style={{ textDecoration: 'none' }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '8px',
        padding: '1.5rem',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
        transition: 'transform 0.2s, box-shadow 0.2s',
        height: '100%',
      }} className="admin-card">
        <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>{icon}</div>
        <h3 style={{ marginBottom: '0.5rem', color: 'var(--secondary-color)' }}>{title}</h3>
        <p style={{ color: 'var(--dark-gray)' }}>{description}</p>
      </div>
    </Link>
  );
}
