'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import AuthCheck from '../components/auth-check';
import Navbar from '../components/navbar';
import Link from 'next/link';
import Pagination from '../components/pagination';

export default function AdminDashboard() {
  const router = useRouter();
  const { data: session } = useSession();
  const [documents, setDocuments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [publishedCount, setPublishedCount] = useState(0);
  const [unpublishedCount, setUnpublishedCount] = useState(0);
  const [totalDocuments, setTotalDocuments] = useState(0);
  const documentsPerPage = 15;
  
  // Fetch documents count for stats
  useEffect(() => {
    async function fetchDocumentCounts() {
      try {
        const response = await fetch('/api/documents/count');
        
        if (!response.ok) {
          throw new Error('Failed to fetch document counts');
        }
        
        const data = await response.json();
        setPublishedCount(data.published || 0);
        setUnpublishedCount(data.unpublished || 0);
        setTotalDocuments(data.total || 0);
      } catch (err) {
        console.error('Error fetching document counts:', err);
      }
    }
    
    fetchDocumentCounts();
  }, []);
  
  // Fetch documents for the current page
  useEffect(() => {
    async function fetchPageDocuments() {
      try {
        setIsLoading(true);
        
        const response = await fetch(`/api/documents?page=${currentPage}&limit=${documentsPerPage}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch documents');
        }
        
        const data = await response.json();
        setDocuments(data.documents || []);
        
        // Update total if provided
        if (data.total !== undefined) {
          setTotalDocuments(data.total);
        }
        
        setIsLoading(false);
      } catch (err) {
        console.error('Error fetching documents:', err);
        setError('Failed to load documents');
        setIsLoading(false);
      }
    }
    
    fetchPageDocuments();
  }, [currentPage, documentsPerPage]);
  
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
        
        // Refresh document counts
        const countResponse = await fetch('/api/documents/count');
        if (countResponse.ok) {
          const countData = await countResponse.json();
          setPublishedCount(countData.published || 0);
          setUnpublishedCount(countData.unpublished || 0);
          setTotalDocuments(countData.total || 0);
        }
        
        setIsDeleting(false);
        
        // If we deleted the last item on a page, go to previous page
        if (documents.length === 1 && currentPage > 1) {
          setCurrentPage(currentPage - 1);
        } else {
          // Otherwise just refresh the current page
          router.refresh();
        }
      } catch (err) {
        console.error('Error deleting document:', err);
        setError('Failed to delete document');
        setIsDeleting(false);
      }
    }
  };
  
  // Pagination logic
  const totalPages = Math.ceil(totalDocuments / documentsPerPage);
  
  const paginate = (pageNumber) => {
    setCurrentPage(pageNumber);
    // Scroll to top when changing pages
    window.scrollTo(0, 0);
  };
  
  return (
    <AuthCheck>
      <div>
        <Navbar />
        
        <div className="container" style={{ padding: '2rem 0' }}>
          <h1>Admin Dashboard</h1>
          <p>Welcome, {session?.user?.name || session?.user?.username || 'Admin'}</p>
          
          <div style={{ marginTop: '2rem' }}>
            
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
              gap: '1rem',
              marginTop: '1rem' 
            }}>
              <AdminCard 
                title="Create Document" 
                description="Create a new documentation page"
                link="/admin/new"
                icon="📝"
              />
              
              <AdminCard 
                title="Published Documents" 
                description={`${publishedCount} document${publishedCount !== 1 ? 's' : ''}`}
                icon="✅"
                isCount={true}
              />
              
              <AdminCard 
                title="Unpublished Documents" 
                description={`${unpublishedCount} document${unpublishedCount !== 1 ? 's' : ''}`}
                icon="📋"
                isCount={true}
              />
            </div>
          </div>
          
          <div style={{ marginTop: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h2>Documents</h2>
              <Link href="/admin/new" className="btn">
                Create New Document
              </Link>
            </div>
            
            {isLoading ? (
              <p>Loading documents...</p>
            ) : error ? (
              <div className="alert alert-danger">{error}</div>
            ) : (
              <>
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
                                <Link href={`/admin/edit/${doc.id}`} style={{
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
                
                {/* Pagination */}
                {totalPages > 1 && (
                  <div style={{ display: 'flex', justifyContent: 'center', marginTop: '2rem' }}>
                    <Pagination
                      currentPage={currentPage}
                      totalPages={totalPages}
                      onPageChange={paginate}
                    />
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </AuthCheck>
  );
}

function AdminCard({ title, description, link, icon, isCount = false }) {
  const cardContent = (
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
  );
  
  return isCount ? (
    cardContent
  ) : (
    <Link href={link} style={{ textDecoration: 'none' }}>
      {cardContent}
    </Link>
  );
}
