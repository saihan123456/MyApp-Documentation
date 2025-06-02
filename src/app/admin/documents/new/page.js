'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import AuthCheck from '../../../components/auth-check';
import Navbar from '../../../components/navbar';

export default function NewDocumentPage() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [slug, setSlug] = useState('');
  const [published, setPublished] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!title || !content || !slug) {
      setError('All fields are required');
      return;
    }
    
    setIsSubmitting(true);
    setError('');
    
    try {
      const response = await fetch('/api/documents', {
        method: 'POST',
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
        throw new Error(data.error || 'Failed to create document');
      }
      
      // Redirect to documents list
      router.push('/admin/documents');
      router.refresh();
    } catch (err) {
      console.error('Error creating document:', err);
      setError(err.message || 'Failed to create document');
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
    <AuthCheck>
      <div>
        <Navbar />
        
        <div className="container" style={{ padding: '2rem 0' }}>
          <h1>Create New Document</h1>
          
          {error && (
            <div className="alert alert-danger" style={{ marginTop: '1rem' }}>
              {error}
            </div>
          )}
          
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
              <textarea
                id="content"
                className="form-control"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                disabled={isSubmitting}
                required
                rows={15}
                style={{ fontFamily: 'monospace' }}
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
              <label htmlFor="published">Publish immediately</label>
            </div>
            
            <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
              <button
                type="submit"
                className="btn"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Creating...' : 'Create Document'}
              </button>
              
              <Link href="/admin/documents" className="btn btn-secondary">
                Cancel
              </Link>
            </div>
          </form>
        </div>
      </div>
    </AuthCheck>
  );
}
