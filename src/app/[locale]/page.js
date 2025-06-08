import Link from 'next/link';
import Navbar from '@/app/components/navbar';
import db from '@/app/lib/db';
import { getTranslations } from '@/app/translations';

// Function to fetch the first three documents from the database for a specific locale
async function getTopThreeDocuments(locale) {
  try {
    return db.prepare('SELECT title, slug, content FROM docs WHERE published = 1 AND language = ? ORDER BY created_at ASC LIMIT 3').all(locale);
  } catch (error) {
    console.error('Error fetching documents:', error);
    return [];
  }
}

export default async function Home({ params }) {
  // Extract the locale from params
  const { locale } = await params;
  // Get translations for the current locale
  const t = getTranslations(locale);
  // Fetch the first three documents from the database for this locale
  const documentSections = await getTopThreeDocuments(locale);
  
  // If no documents are found, provide a fallback
  if (documentSections.length === 0) {
    documentSections.push({
      title: 'Getting Started',
      description: 'No documents found. Please seed the database.',
      slug: 'getting-started'
    });
  }
  
  // Add descriptions if they don't exist in the database
  const processedDocuments = documentSections.map(doc => {
    let description = doc.description;
    
    // If no description exists, create one from the content
    if (!description && doc.content) {
      // Remove markdown images
      const contentWithoutImages = doc.content.replace(/!\[.*?\]\(.*?\)/g, '');
      // Remove HTML images
      const contentWithoutHtmlImages = contentWithoutImages.replace(/<img[^>]*>/g, '');
      // Remove markdown formatting characters
      const plainText = contentWithoutHtmlImages
        .replace(/[#*_`]/g, '') // Remove markdown formatting
        .replace(/\[.*?\]\(.*?\)/g, '$1') // Replace links with just the text
        .replace(/<[^>]*>/g, '') // Remove any HTML tags
        .replace(/\n+/g, ' ') // Replace newlines with spaces
        .replace(/\s+/g, ' ') // Normalize whitespace
        .trim();
      
      // Extract first 100 characters for description
      description = plainText.substring(0, 100);
      if (plainText.length > 100) {
        description += '...';
      }
    } else if (!description) {
      description = 'View this document';
    }
    
    return {
      ...doc,
      description
    };
  });

  return (
    <div>
      <Navbar />
      
      <div className="container" style={{ paddingTop: 'var(--navbar-height, 70px)' }}>
        {/* Hero section */}
        <div style={{ 
          padding: '4rem 0', 
          textAlign: 'center',
          borderBottom: '1px solid var(--light-gray)',
        }}>
          <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>{t.heroTitle}</h1>
          <p style={{ fontSize: '1.25rem', color: 'var(--dark-gray)', maxWidth: '700px', margin: '0 auto' }}>
            {t.heroDescription}
          </p>
          <div style={{ marginTop: '2rem' }}>
            <Link href={`/${locale}/docs/`} className="btn">
              {t.getStarted}
            </Link>
          </div>
        </div>
        
        {/* Documentation sections */}
        <div style={{ padding: '4rem 0' }}>
          <h2 style={{ marginBottom: '2rem', textAlign: 'center' }}>{t.documentation}</h2>
          
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: '2rem'
          }}>
            {processedDocuments.map((section) => (
              <div key={section.slug} style={{ 
                backgroundColor: 'white',
                borderRadius: '8px',
                padding: '1.5rem',
                boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
              }}>
                <h3 style={{ marginBottom: '0.5rem' }}>{section.title}</h3>
                <p style={{ color: 'var(--dark-gray)', marginBottom: '1rem' }}>
                  {section.description}
                </p>
                <Link href={`/${locale}/docs/${section.slug}`} style={{ 
                  color: 'var(--primary-color)',
                  fontWeight: 'bold',
                }}>
                  {t.readMore}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Footer */}
      <footer style={{ 
        backgroundColor: 'var(--secondary-color)',
        color: 'white',
        padding: '2rem 0',
        marginTop: '4rem',
      }}>
        <div className="container">
          <div style={{ 
            display: 'flex', 
            justifyContent: 'center',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '1rem',
          }}>
            <div style={{ textAlign: 'center' }}>
              <h3 style={{ marginBottom: '0.5rem' }}>{t.footerTitle}</h3>
              <p style={{ color: 'rgba(255, 255, 255, 0.7)' }}>{t.footerCopyright}</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

