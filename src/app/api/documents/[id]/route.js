import { NextResponse } from 'next/server';
import db from '@/app/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

// GET /api/documents/[id] - Get a single document
export async function GET(request, { params }) {
  try {
    const id = params.id;
    
    // Check if we're fetching by ID or slug
    let document;
    
    if (isNaN(id)) {
      // It's a slug
      document = db.prepare('SELECT * FROM docs WHERE slug = ?').get(id);
    } else {
      // It's an ID
      document = db.prepare('SELECT * FROM docs WHERE id = ?').get(id);
    }
    
    if (!document) {
      return NextResponse.json(
        { error: 'Document not found' },
        { status: 404 }
      );
    }
    
    // If document is not published, check if user is authenticated
    if (!document.published) {
      const session = await getServerSession(authOptions);
      
      if (!session) {
        return NextResponse.json(
          { error: 'Unauthorized' },
          { status: 401 }
        );
      }
    }
    
    return NextResponse.json(document);
  } catch (error) {
    console.error('Error fetching document:', error);
    return NextResponse.json(
      { error: 'Failed to fetch document' },
      { status: 500 }
    );
  }
}

// PUT /api/documents/[id] - Update a document
export async function PUT(request, { params }) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const id = params.id;
    const body = await request.json();
    const { title, content, slug, published } = body;
    
    if (!title || !content || !slug) {
      return NextResponse.json(
        { error: 'Title, content, and slug are required' },
        { status: 400 }
      );
    }
    
    // Check if document exists
    const existingDoc = db.prepare('SELECT id FROM docs WHERE id = ?').get(id);
    
    if (!existingDoc) {
      return NextResponse.json(
        { error: 'Document not found' },
        { status: 404 }
      );
    }
    
    // Check if slug is already used by another document
    const slugCheck = db.prepare('SELECT id FROM docs WHERE slug = ? AND id != ?').get(slug, id);
    
    if (slugCheck) {
      return NextResponse.json(
        { error: 'A document with this slug already exists' },
        { status: 409 }
      );
    }
    
    // Update the document
    db.prepare(
      'UPDATE docs SET title = ?, content = ?, slug = ?, published = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?'
    ).run(title, content, slug, published ? 1 : 0, id);
    
    // Get the updated document
    const updatedDoc = db.prepare('SELECT id, title, slug, published, created_at, updated_at FROM docs WHERE id = ?').get(id);
    
    return NextResponse.json(updatedDoc);
  } catch (error) {
    console.error('Error updating document:', error);
    return NextResponse.json(
      { error: 'Failed to update document' },
      { status: 500 }
    );
  }
}

// DELETE /api/documents/[id] - Delete a document
export async function DELETE(request, { params }) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const id = params.id;
    
    // Check if document exists
    const existingDoc = db.prepare('SELECT id FROM docs WHERE id = ?').get(id);
    
    if (!existingDoc) {
      return NextResponse.json(
        { error: 'Document not found' },
        { status: 404 }
      );
    }
    
    // Delete the document
    db.prepare('DELETE FROM docs WHERE id = ?').run(id);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting document:', error);
    return NextResponse.json(
      { error: 'Failed to delete document' },
      { status: 500 }
    );
  }
}
