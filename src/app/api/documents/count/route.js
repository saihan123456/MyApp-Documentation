import { NextResponse } from 'next/server';
import db from '@/app/lib/db';

// GET /api/documents/count - Get document counts
export async function GET() {
  try {
    // Get total count
    const totalQuery = 'SELECT COUNT(*) as count FROM docs';
    const totalResult = db.prepare(totalQuery).get();
    
    // Get published count
    const publishedQuery = 'SELECT COUNT(*) as count FROM docs WHERE published = 1';
    const publishedResult = db.prepare(publishedQuery).get();
    
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
