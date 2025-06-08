import { NextResponse } from 'next/server';
import db from '@/app/lib/db';

// GET /api/documents/count - Get document counts
export async function GET(request) {
  // Get language from query params if available
  const { searchParams } = new URL(request.url);
  const language = searchParams.get('language');
  try {
    // Build language filter clause if needed
    let languageFilter = '';
    let queryParams = [];
    
    if (language) {
      languageFilter = ' WHERE language = ?';
      queryParams.push(language);
    }
    
    // Get total count with language filter
    const totalQuery = `SELECT COUNT(*) as count FROM docs${languageFilter}`;
    const totalResult = db.prepare(totalQuery).get(...queryParams);
    
    // Get published count with language filter
    const publishedFilter = language ? ' WHERE published = 1 AND language = ?' : ' WHERE published = 1';
    const publishedParams = language ? [language] : [];
    const publishedQuery = `SELECT COUNT(*) as count FROM docs${publishedFilter}`;
    const publishedResult = db.prepare(publishedQuery).get(...publishedParams);
    
    // Calculate unpublished count
    const total = totalResult.count;
    const published = publishedResult.count;
    const unpublished = total - published;
    
    return NextResponse.json({
      total,
      published,
      unpublished
    });
  } catch (error) {
    console.error('Error fetching document counts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch document counts' },
      { status: 500 }
    );
  }
}
