import { NextResponse } from 'next/server';
import db from '@/app/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

// GET /api/documents - Get all documents
export async function GET(request) {
  try {
    // Check if we need to filter by published status
    const { searchParams } = new URL(request.url);
    const publishedOnly = searchParams.get('publishedOnly') === 'true';
    
    let query = 'SELECT id, title, slug, published, created_at, updated_at FROM docs';
    
    if (publishedOnly) {
      query += ' WHERE published = 1';
    }
    
    query += ' ORDER BY created_at DESC';
    
    const documents = db.prepare(query).all();
    
    return NextResponse.json(documents);
  } catch (error) {
    console.error('Error fetching documents:', error);
    return NextResponse.json(
      { error: 'Failed to fetch documents' },
      { status: 500 }
    );
  }
}

// POST /api/documents - Create a new document
export async function POST(request) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const body = await request.json();
    const { title, content, slug, published = true } = body;
    
    if (!title || !content || !slug) {
      return NextResponse.json(
        { error: 'Title, content, and slug are required' },
        { status: 400 }
      );
    }
    
    // Check if slug already exists
    const existingDoc = db.prepare('SELECT id FROM docs WHERE slug = ?').get(slug);
    
    if (existingDoc) {
      return NextResponse.json(
        { error: 'A document with this slug already exists' },
        { status: 409 }
      );
    }
    
    // Insert the document
    const result = db.prepare(
      'INSERT INTO docs (title, content, slug, published) VALUES (?, ?, ?, ?)'
    ).run(title, content, slug, published ? 1 : 0);
    
    // Get the inserted document
    const newDoc = db.prepare('SELECT id, title, slug, published, created_at, updated_at FROM docs WHERE id = ?').get(result.lastInsertRowid);
    
    return NextResponse.json(newDoc, { status: 201 });
  } catch (error) {
    console.error('Error creating document:', error);
    return NextResponse.json(
      { error: 'Failed to create document' },
      { status: 500 }
    );
  }
}
