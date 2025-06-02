'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import AuthCheck from '../../components/auth-check';
import Navbar from '../../components/navbar';
import dynamic from 'next/dynamic';
import { marked } from 'marked';
import CustomModalPlugin from '../../components/custom-modal-plugin';

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

export default function NewDocumentPage() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [slug, setSlug] = useState('');
  const [published, setPublished] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

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
      
      // Redirect to admin dashboard
      router.push('/admin');
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
        
        <div className="container" style={{ padding: '0.5rem 0', width: '100%', maxWidth: '1200px', margin: '0 auto' }}>
          <h3>Create New Document</h3>
          
          {error && (
            <div className="alert alert-danger" style={{ marginTop: '0.5rem' }}>
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit} style={{ marginTop: '0.5rem' }}>
            <div style={{ 
              display: 'flex', 
              flexDirection: 'row', 
              flexWrap: 'wrap', 
              gap: '20px',
              marginBottom: '2px'
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
              <label htmlFor="published">Publish immediately</label>
            </div>
            
            <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
              <button
                type="submit"
                className="btn"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Creating...' : 'Create Document'}
              </button>
              
              <Link href="/admin" className="btn btn-secondary">
                Cancel
              </Link>
            </div>
          </form>
        </div>
      </div>
    </AuthCheck>
  );
}
