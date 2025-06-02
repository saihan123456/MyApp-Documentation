'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import AuthCheck from '../../components/auth-check';
import Navbar from '../../components/navbar';

export default function DocumentsPage() {
  const router = useRouter();
  const [documents, setDocuments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState('');
  
  // Fetch documents from the API
  useEffect(() => {
    async function fetchDocuments() {
      try {
        setIsLoading(true);
        
        const response = await fetch('/api/documents');
        
        if (!response.ok) {
          throw new Error('Failed to fetch documents');
        }
        
        const data = await response.json();
        setDocuments(data);
        setIsLoading(false);
      } catch (err) {
        console.error('Error fetching documents:', err);
        setError('Failed to load documents');
        setIsLoading(false);
      }
    }
    
    fetchDocuments();
  }, []);
  
  // Handle document deletion
  const handleDelete = async (id) => {
    if (confirm('Are you sure you want to delete this document?')) {
      try {
        setIsDeleting(true);
        
        const response = await fetch(`/api/documents/${id}`, {
          method: 'DELETE',
        });
        
        if (!response.ok) {
          throw new Error('Failed to delete document');
        }
        
        // Remove the deleted document from the state
        setDocuments(documents.filter(doc => doc.id !== id));
        setIsDeleting(false);
        router.refresh();
      } catch (err) {
        console.error('Error deleting document:', err);
        setError('Failed to delete document');
        setIsDeleting(false);
      }
    }
  };

  return (
    <AuthCheck>
      <div>
        <Navbar />
        
        <div className="container" style={{ padding: '2rem 0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
            <h1>Manage Documents</h1>
            <Link href="/admin/documents/new" className="btn">
              Create New Document
            </Link>
          </div>
          
          {isLoading ? (
            <p>Loading documents...</p>
          ) : error ? (
            <div className="alert alert-danger">{error}</div>
          ) : (
            <div style={{ backgroundColor: 'white', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ backgroundColor: 'var(--light-gray)' }}>
                    <th style={{ padding: '12px 16px', textAlign: 'left' }}>Title</th>
                    <th style={{ padding: '12px 16px', textAlign: 'left' }}>Slug</th>
                    <th style={{ padding: '12px 16px', textAlign: 'center' }}>Status</th>
                    <th style={{ padding: '12px 16px', textAlign: 'center' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {documents.length === 0 ? (
                    <tr>
                      <td colSpan="4" style={{ padding: '16px', textAlign: 'center' }}>
                        No documents found. Create your first document.
                      </td>
                    </tr>
                  ) : (
                    documents.map((doc) => (
                      <tr key={doc.id} style={{ borderTop: '1px solid var(--light-gray)' }}>
                        <td style={{ padding: '12px 16px' }}>{doc.title}</td>
                        <td style={{ padding: '12px 16px' }}>{doc.slug}</td>
                        <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                          <span style={{
                            display: 'inline-block',
                            padding: '4px 8px',
                            borderRadius: '4px',
                            fontSize: '0.875rem',
                            backgroundColor: doc.published ? '#d4edda' : '#f8d7da',
                            color: doc.published ? '#155724' : '#721c24',
                          }}>
                            {doc.published ? 'Published' : 'Draft'}
                          </span>
                        </td>
                        <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                          <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                            <Link href={`/admin/documents/edit/${doc.id}`} style={{
                              color: 'var(--primary-color)',
                              textDecoration: 'none',
                            }}>
                              Edit
                            </Link>
                            <button
                              onClick={() => handleDelete(doc.id)}
                              disabled={isDeleting}
                              style={{
                                background: 'none',
                                border: 'none',
                                color: 'var(--accent-color)',
                                cursor: isDeleting ? 'not-allowed' : 'pointer',
                                opacity: isDeleting ? 0.7 : 1,
                              }}
                            >
                              {isDeleting ? 'Deleting...' : 'Delete'}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
          
          <div style={{ marginTop: '2rem' }}>
            <Link href="/admin" style={{ color: 'var(--dark-gray)' }}>
              ← Back to Dashboard
            </Link>
          </div>
        </div>
      </div>
    </AuthCheck>
  );
}
