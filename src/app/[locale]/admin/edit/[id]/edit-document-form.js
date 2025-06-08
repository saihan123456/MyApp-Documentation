'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { marked } from 'marked';
import CustomModalPlugin from '@/app/components/custom-modal-plugin';

// Import the editor dynamically to avoid SSR issues
const MdEditor = dynamic(
  () => import('react-markdown-editor-lite').then(mod => {
    // Register the custom plugin
    mod.default.use(CustomModalPlugin);
    return mod;
  }),
  { ssr: false }
);

// Import the editor styles
import 'react-markdown-editor-lite/lib/index.css';

export default function EditDocumentForm({ documentId }) {
  const router = useRouter();
  const pathname = usePathname();
  const locale = pathname.split('/')[1];
  const id = documentId;
  
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [slug, setSlug] = useState('');
  const [published, setPublished] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Fetch document data
  useEffect(() => {
    async function fetchDocument() {
      try {
        setIsLoading(true);
        
        const response = await fetch(`/api/documents/${id}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch document');
        }
        
        const document = await response.json();
        
        setTitle(document.title);
        setContent(document.content);
        setSlug(document.slug);
        setPublished(Boolean(document.published));
        
        setIsLoading(false);
      } catch (err) {
        console.error('Error fetching document:', err);
        setError('Failed to load document');
        setIsLoading(false);
      }
    }
    
    fetchDocument();
  }, [id]);

  // Handle editor change
  const handleEditorChange = ({ html, text }) => {
    setContent(text);
  };

  // Markdown parser function
  const renderHTML = (text) => {
    return marked(text);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!title || !content || !slug) {
      setError('All fields are required');
      return;
    }
    
    setIsSubmitting(true);
    setError('');
    
    try {
      const response = await fetch(`/api/documents/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title,
          content,
          slug,
          published,
        }),
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to update document');
      }
      
      // Redirect to admin dashboard
      router.push(`/${locale}/admin`);
      router.refresh();
    } catch (err) {
      console.error('Error updating document:', err);
      setError(err.message || 'Failed to update document');
      setIsSubmitting(false);
    }
  };

  // Generate slug from title
  const generateSlug = (title) => {
    return title
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-');
  };

  const handleTitleChange = (e) => {
    const newTitle = e.target.value;
    setTitle(newTitle);
    
    // Only auto-generate slug if user hasn't manually edited it
    if (!slug || slug === generateSlug(title)) {
      setSlug(generateSlug(newTitle));
    }
  };

  return (
    <div style={{ width: '100%', maxWidth: '1200px', margin: '0 auto' }}>
      {error && (
        <div className="alert alert-danger" style={{ marginTop: '0.5rem' }}>
          {error}
        </div>
      )}
      
      {isLoading ? (
        <p>Loading document...</p>
      ) : (
        <form onSubmit={handleSubmit} style={{ marginTop: '0.5rem' }}>
          <div style={{ 
            display: 'flex', 
            flexDirection: 'row', 
            flexWrap: 'wrap', 
            gap: '20px',
            marginBottom: '8px'
          }}>
            <div className="form-group" style={{ flex: '1', minWidth: '250px' }}>
              <label htmlFor="title">Title</label>
              <input
                id="title"
                type="text"
                className="form-control"
                value={title}
                onChange={handleTitleChange}
                disabled={isSubmitting}
                required
              />
            </div>
            
            <div className="form-group" style={{ flex: '1', minWidth: '250px' }}>
              <label htmlFor="slug">Slug</label>
              <input
                id="slug"
                type="text"
                className="form-control"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                disabled={isSubmitting}
                required
              />
              <small style={{ color: 'var(--dark-gray)' }}>
                This will be the URL path: /docs/{slug}
              </small>
            </div>
          </div>
          
          <div className="form-group" style={{ marginTop: '0px' }}>
            <label htmlFor="content">Content</label>
            <MdEditor
              id="content"
              style={{ 
                height: '650px', 
                width: '100%',
                maxWidth: '100%',
                marginBottom: '10px'
              }}
              value={content}
              renderHTML={renderHTML}
              onChange={handleEditorChange}
              disabled={isSubmitting}
              placeholder="Write your content here..."
            />
            <small style={{ color: 'var(--dark-gray)' }}>
              Supports Markdown formatting
            </small>
          </div>
          
          <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <input
              id="published"
              type="checkbox"
              checked={published}
              onChange={(e) => setPublished(e.target.checked)}
              disabled={isSubmitting}
            />
            <label htmlFor="published">Published</label>
          </div>
          
          <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
            <button
              type="submit"
              className="btn"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </button>
            
            <Link href={`/${locale}/admin`} className="btn btn-secondary">
              Cancel
            </Link>
          </div>
        </form>
      )}
    </div>
  );
}
