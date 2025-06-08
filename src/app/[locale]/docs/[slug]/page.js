import { notFound } from 'next/navigation';
import Navbar from '@/app/components/navbar';
import db from '@/app/lib/db';
import { marked } from 'marked';
import '@/app/styles/markdown.css';
import '@/app/styles/responsive.css';
import ResponsiveSidebar from '@/app/components/responsive-sidebar';
import { getTranslations } from '@/app/translations';

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
    // Get all published documents with their language
    const docs = db.prepare('SELECT slug, language FROM docs WHERE published = 1').all();
    // Return both slug and locale for each document
    return docs.map(doc => ({ 
      slug: doc.slug,
      locale: doc.language 
    }));
  } catch (error) {
    console.error('Error generating static params:', error);
    return [];
  }
}

// This function fetches the document data for a specific locale
async function getDocumentBySlug(slug, locale) {
  try {
    return db.prepare('SELECT * FROM docs WHERE slug = ? AND language = ? AND published = 1').get(slug, locale);
  } catch (error) {
    console.error('Error fetching document:', error);
    return null;
  }
}

// This function fetches all published documents for the sidebar for a specific locale
async function getAllPublishedDocuments(locale) {
  try {
    return db.prepare('SELECT title, slug FROM docs WHERE published = 1 AND language = ? ORDER BY created_at ASC').all(locale);
  } catch (error) {
    console.error('Error fetching all documents:', error);
    return [];
  }
}

export default async function DocumentPage({ params }) {
  // Properly await params before destructuring
  const resolvedParams = await Promise.resolve(params);
  const { slug, locale } = resolvedParams;
  // Get translations for the current locale
  const t = getTranslations(locale);
  const document = await getDocumentBySlug(slug, locale);
  
  if (!document) {
    notFound();
  }
  
  // Fetch all published documents for the sidebar for this locale
  const sidebarLinks = await getAllPublishedDocuments(locale);

  return (
    <div>
      <Navbar />
      
      <div className="container" style={{ padding: '2rem 0', paddingTop: 'var(--navbar-height, 70px)' }}>
        <div className="docs-container" style={{ display: 'flex', gap: '2rem' }}>
          {/* Responsive Sidebar - handles both desktop and mobile views */}
          <ResponsiveSidebar links={sidebarLinks} currentSlug={slug} />
          
          {/* Main content */}
          <div className="docs-content" style={{ flex: 1, width: '100%' }}>
            <h1>{document.title}</h1>
            <div style={{ 
              padding: '1rem',
              backgroundColor: 'var(--light-gray)',
              borderRadius: '8px',
              marginTop: '1rem',
              marginBottom: '2rem',
            }}>
              <p>{t.lastUpdated} {new Date(document.updated_at).toISOString().split('T')[0]}</p>
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
