'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, usePathname } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/app/components/navbar';
import { useTranslations } from '@/app/translations/client';

export default function SearchPage() {
  const pathname = usePathname();
  const locale = pathname.split('/')[1];
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const t = useTranslations(); // Get translations based on current locale

  useEffect(() => {
    async function fetchSearchResults() {
      if (!query.trim()) {
        setResults([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        // Include locale in the search request
        const response = await fetch(`/api/search?q=${encodeURIComponent(query)}&language=${locale}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch search results');
        }
        
        const data = await response.json();
        setResults(data);
        setLoading(false);
      } catch (err) {
        console.error('Error searching documents:', err);
        setError(t.searchError);
        setLoading(false);
      }
    }
    
    fetchSearchResults();
  }, [query]);

  // Function to highlight search terms in text
  const highlightText = (text, query) => {
    if (!query.trim() || !text) return text;
    
    const regex = new RegExp(`(${query.trim()})`, 'gi');
    return text.replace(regex, '<mark>$1</mark>');
  };

  return (
    <div>
      <Navbar />
      
      <div className="container" style={{ padding: '2rem 0', paddingTop: 'var(--navbar-height, 70px)' }}>
        <h1>{t.searchResults}</h1>
        <p>{t.showingResultsFor} <strong>{query}</strong></p>
        
        {loading ? (
          <div style={{ textAlign: 'center', padding: '2rem 0' }}>
            <p>{t.searchingDocuments}</p>
          </div>
        ) : error ? (
          <div style={{ padding: '1rem', backgroundColor: '#f8d7da', borderRadius: '4px', marginTop: '1rem' }}>
            <p>{error}</p>
          </div>
        ) : results.length === 0 ? (
          <div style={{ padding: '2rem 0' }}>
            <p>{t.noResultsFound}</p>
          </div>
        ) : (
          <div style={{ marginTop: '2rem' }}>
            {results.map((doc) => (
              <div 
                key={doc.id} 
                style={{ 
                  marginBottom: '1.5rem', 
                  padding: '1.5rem',
                  backgroundColor: 'white',
                  borderRadius: '8px',
                  boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
                }}
              >
                <h2 style={{ marginBottom: '0.5rem' }}>
                  <Link 
                    href={`/${locale}/docs/${doc.slug}`}
                    style={{ color: 'var(--primary-color)', textDecoration: 'none' }}
                  >
                    {doc.title}
                  </Link>
                </h2>
                
                {doc.snippet && (
                  <div 
                    style={{ marginTop: '0.5rem', color: 'var(--dark-gray)' }}
                    dangerouslySetInnerHTML={{ 
                      __html: highlightText(doc.snippet, query) 
                    }}
                  />
                )}
                
                <div style={{ marginTop: '1rem' }}>
                  <Link 
                    href={`/${locale}/docs/${doc.slug}`}
                    style={{ 
                      color: 'var(--primary-color)',
                      fontWeight: 'bold',
                    }}
                  >
                    {t.readMore}
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
