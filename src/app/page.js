import Link from 'next/link';
import Navbar from './components/navbar';
import db from './lib/db';

// Function to fetch the first three documents from the database
async function getTopThreeDocuments() {
  try {
    return db.prepare('SELECT title, slug, content FROM docs WHERE published = 1 ORDER BY created_at ASC LIMIT 3').all();
  } catch (error) {
    console.error('Error fetching documents:', error);
    return [];
  }
}

export default async function Home() {
  // Fetch the first three documents from the database
  const documentSections = await getTopThreeDocuments();
  
  // If no documents are found, provide a fallback
  if (documentSections.length === 0) {
    documentSections.push({
      title: 'Getting Started',
      description: 'No documents found. Please seed the database.',
      slug: 'getting-started'
    });
  }
  
  // Add descriptions if they don't exist in the database
  const processedDocuments = documentSections.map(doc => ({
    ...doc,
    // Create a description from the content if it doesn't exist
    description: doc.description || (doc.content ? 
      // Extract first 100 characters from content as description
      doc.content.replace(/[#*_]/g, '').substring(0, 100) + '...' : 
      'View this document')
  }));

  return (
    <div>
      <Navbar />
      
      <div className="container">
        {/* Hero section */}
        <div style={{ 
          padding: '4rem 0', 
          textAlign: 'center',
          borderBottom: '1px solid var(--light-gray)',
        }}>
          <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>MyApp Documentation</h1>
          <p style={{ fontSize: '1.25rem', color: 'var(--dark-gray)', maxWidth: '700px', margin: '0 auto' }}>
            Comprehensive guides, API references, and examples to help you with the usage of MyApp.
          </p>
          <div style={{ marginTop: '2rem' }}>
            <Link href="/docs/getting-started" className="btn">
              Get Started
            </Link>
          </div>
        </div>
        
        {/* Documentation sections */}
        <div style={{ padding: '4rem 0' }}>
          <h2 style={{ marginBottom: '2rem', textAlign: 'center' }}>Documentation</h2>
          
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
                <Link href={`/docs/${section.slug}`} style={{ 
                  color: 'var(--primary-color)',
                  fontWeight: 'bold',
                }}>
                  Read more →
                </Link>
              </div>
            ))}
          </div>
        </div>
        
        {/* Features section */}
        <div style={{ 
          padding: '4rem 0',
          backgroundColor: 'var(--light-gray)',
          margin: '0 -20px',
          padding: '4rem 20px',
        }}>
          <div className="container">
            <h2 style={{ marginBottom: '2rem', textAlign: 'center' }}>Key Features</h2>
            
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
              gap: '2rem',
            }}>
              <FeatureCard 
                title="High Performance" 
                description="Optimized for speed and efficiency in all environments"
                icon="⚡"
              />
              <FeatureCard 
                title="Easy Integration" 
                description="Seamlessly integrates with your existing workflow"
                icon="🔄"
              />
              <FeatureCard 
                title="Extensive Documentation" 
                description="Detailed guides and API references"
                icon="📚"
              />
              <FeatureCard 
                title="Active Community" 
                description="Join a thriving ecosystem of developers"
                icon="👥"
              />
            </div>
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
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '1rem',
          }}>
            <div>
              <h3 style={{ marginBottom: '0.5rem' }}>MyApp Docs</h3>
              <p style={{ color: 'rgba(255, 255, 255, 0.7)' }}>© 2025 MyApp. All rights reserved.</p>
            </div>
            <div>
              <Link href="/" style={{ color: 'white', marginRight: '1rem' }}>Home</Link>
              <Link href="/docs" style={{ color: 'white', marginRight: '1rem' }}>Documentation</Link>
              <Link href="/login" style={{ color: 'white' }}>Admin</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ title, description, icon }) {
  return (
    <div style={{ 
      backgroundColor: 'white',
      borderRadius: '8px',
      padding: '1.5rem',
      boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
      textAlign: 'center',
    }}>
      <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>{icon}</div>
      <h3 style={{ marginBottom: '0.5rem' }}>{title}</h3>
      <p style={{ color: 'var(--dark-gray)' }}>{description}</p>
    </div>
  );
}
