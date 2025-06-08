import { NextResponse } from 'next/server';
import db from '@/app/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

// GET /api/documents - Get documents with pagination
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const publishedOnly = searchParams.get('publishedOnly') === 'true';
    const language = searchParams.get('language'); // Get language filter from query params
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '15');
    
    // Validate pagination parameters
    if (page < 1 || limit < 1 || limit > 100) {
      return NextResponse.json(
        { error: 'Invalid pagination parameters' },
        { status: 400 }
      );
    }
    
    const offset = (page - 1) * limit;
    
    // Build the base query
    let whereConditions = [];
    let queryParams = [];
    
    if (publishedOnly) {
      whereConditions.push('published = 1');
    }
    
    // Add language filter if provided
    if (language) {
      whereConditions.push('language = ?');
      queryParams.push(language);
    }
    
    // Construct the WHERE clause
    let whereClause = whereConditions.length > 0 ? ' WHERE ' + whereConditions.join(' AND ') : '';
    
    // Get total count for pagination
    const countQuery = `SELECT COUNT(*) as total FROM docs${whereClause}`;
    const { total } = db.prepare(countQuery).get(...queryParams);
    
    // Get paginated documents
    const query = `
      SELECT id, title, slug, published, language, created_at, updated_at 
      FROM docs${whereClause}
      ORDER BY created_at DESC
      LIMIT ? OFFSET ?
    `;
    
    // Add pagination params to the query params array
    const allParams = [...queryParams, limit, offset];
    const documents = db.prepare(query).all(...allParams);
    
    return NextResponse.json({
      documents,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    });
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
    const { title, content, slug, published = true, language = 'en' } = body;
    
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
      'INSERT INTO docs (title, content, slug, published, language) VALUES (?, ?, ?, ?, ?)'
    ).run(title, content, slug, published ? 1 : 0, language);
    
    // Get the inserted document
    const newDoc = db.prepare('SELECT id, title, slug, published, language, created_at, updated_at FROM docs WHERE id = ?').get(result.lastInsertRowid);
    
    return NextResponse.json(newDoc, { status: 201 });
  } catch (error) {
    console.error('Error creating document:', error);
    return NextResponse.json(
      { error: 'Failed to create document' },
      { status: 500 }
    );
  }
}
