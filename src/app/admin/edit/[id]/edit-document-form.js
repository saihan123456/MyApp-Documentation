'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { marked } from 'marked';

// Import the editor dynamically to avoid SSR issues
const MdEditor = dynamic(
  () => import('react-markdown-editor-lite'),
  { ssr: false }
);

// Import the editor styles
import 'react-markdown-editor-lite/lib/index.css';

export default function EditDocumentForm({ documentId }) {
  const router = useRouter();
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
      router.push('/admin');
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
    <div>
      {error && (
        <div className="alert alert-danger" style={{ marginTop: '1rem' }}>
          {error}
        </div>
      )}
      
      {isLoading ? (
        <p>Loading document...</p>
      ) : (
        <form onSubmit={handleSubmit} style={{ marginTop: '2rem' }}>
          <div className="form-group">
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
          
          <div className="form-group">
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
          
          <div className="form-group">
            <label htmlFor="content">Content</label>
            <MdEditor
              id="content"
              style={{ height: '500px' }}
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
          
          <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <input
              id="published"
              type="checkbox"
              checked={published}
              onChange={(e) => setPublished(e.target.checked)}
              disabled={isSubmitting}
            />
            <label htmlFor="published">Published</label>
          </div>
          
          <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
            <button
              type="submit"
              className="btn"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </button>
            
            <Link href="/admin" className="btn btn-secondary">
              Cancel
            </Link>
          </div>
        </form>
      )}
    </div>
  );
}
