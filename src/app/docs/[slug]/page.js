import { notFound } from 'next/navigation';
import Navbar from '../../components/navbar';
import Link from 'next/link';
import db from '@/app/lib/db';
import { marked } from 'marked';
import '@/app/styles/markdown.css';

// Configure marked options once at module level
marked.setOptions({
  breaks: true,        // Add 'br' on single line breaks
  gfm: true,          // GitHub Flavored Markdown
  headerIds: true,    // Add IDs to headers for linking
  mangle: false,      // Don't escape HTML
  pedantic: false,    // Conform to markdown.pl
  sanitize: false,    // Allow HTML
  smartLists: true,   // Use smarter list behavior
  smartypants: true,  // Use smart punctuation
});

// This function generates static params for all published documents
export async function generateStaticParams() {
  try {
    const docs = db.prepare('SELECT slug FROM docs WHERE published = 1').all();
    return docs.map(doc => ({ slug: doc.slug }));
  } catch (error) {
    console.error('Error generating static params:', error);
    return [];
  }
}

// This function fetches the document data
async function getDocumentBySlug(slug) {
  try {
    return db.prepare('SELECT * FROM docs WHERE slug = ? AND published = 1').get(slug);
  } catch (error) {
    console.error('Error fetching document:', error);
    return null;
  }
}

// This function fetches all published documents for the sidebar
async function getAllPublishedDocuments() {
  try {
    return db.prepare('SELECT title, slug FROM docs WHERE published = 1 ORDER BY created_at ASC').all();
  } catch (error) {
    console.error('Error fetching all documents:', error);
    return [];
  }
}

export default async function DocumentPage({ params }) {
  // Properly await params before destructuring
  const resolvedParams = await Promise.resolve(params);
  const { slug } = resolvedParams;
  const document = await getDocumentBySlug(slug);
  
  if (!document) {
    notFound();
  }
  
  // Fetch all published documents for the sidebar
  const sidebarLinks = await getAllPublishedDocuments();

  return (
    <div>
      <Navbar />
      
      <div className="container" style={{ padding: '2rem 0' }}>
        <div style={{ display: 'flex', gap: '2rem' }}>
          {/* Sidebar */}
          <div style={{ 
            width: '250px', 
            flexShrink: 0,
            backgroundColor: 'white',
            borderRadius: '8px',
            padding: '1.5rem',
            boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
            height: 'fit-content',
          }}>
            <h3 style={{ marginBottom: '1rem' }}>Documentation</h3>
            <ul style={{ listStyle: 'none', padding: 0 }}>
              {sidebarLinks.map((link) => (
                <li key={link.slug} style={{ marginBottom: '0.75rem' }}>
                  <Link 
                    href={`/docs/${link.slug}`} 
                    style={{ 
                      color: link.slug === slug ? 'var(--primary-color)' : 'var(--text-color)',
                      fontWeight: link.slug === slug ? 'bold' : 'normal',
                    }}
                  >
                    {link.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          
          {/* Main content */}
          <div style={{ flex: 1 }}>
            <h1>{document.title}</h1>
            <div style={{ 
              padding: '1rem',
              backgroundColor: 'var(--light-gray)',
              borderRadius: '8px',
              marginTop: '1rem',
              marginBottom: '2rem',
            }}>
              <p>Last updated: {new Date(document.updated_at).toLocaleDateString()}</p>
            </div>
            
            {/* Render the document content with markdown */}
            <div 
              style={{ lineHeight: '1.6' }}
              className="markdown-content"
              dangerouslySetInnerHTML={{ __html: marked(document.content || '') }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
