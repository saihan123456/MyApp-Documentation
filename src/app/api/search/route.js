import { NextResponse } from 'next/server';
import db from '@/app/lib/db';

// GET /api/search?q=query - Search documents by title or content
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    
    if (!query || query.trim() === '') {
      return NextResponse.json([]);
    }
    
    // Search in both title and content, only published documents
    const searchTerm = `%${query}%`;
    
    const results = db.prepare(`
      SELECT id, title, slug, published, created_at, updated_at,
             CASE
               WHEN instr(lower(title), lower(?)) > 0 THEN title
               ELSE substr(content, max(1, instr(lower(content), lower(?)) - 50), 200)
             END as snippet
      FROM docs
      WHERE published = 1 AND (
        title LIKE ? OR
        content LIKE ?
      )
      ORDER BY 
        CASE 
          WHEN instr(lower(title), lower(?)) > 0 THEN 0 
          ELSE 1 
        END,
        created_at DESC
      LIMIT 20
    `).all(
      query, query, searchTerm, searchTerm, query
    );
    
    // Process snippets to make them more readable
    const processedResults = results.map(doc => {
      // If the snippet is from content, clean it up
      if (doc.snippet !== doc.title) {
        // Remove markdown formatting
        let cleanSnippet = doc.snippet.replace(/[#*_]/g, '');
        
        // Add ellipsis if the snippet starts mid-sentence
        if (!cleanSnippet.match(/^[A-Z]/)) {
          cleanSnippet = `...${cleanSnippet}`;
        }
        
        // Add ellipsis at the end
        cleanSnippet = `${cleanSnippet}...`;
        
        return {
          ...doc,
          snippet: cleanSnippet
        };
      }
      
      return doc;
    });
    
    return NextResponse.json(processedResults);
  } catch (error) {
    console.error('Error searching documents:', error);
    return NextResponse.json(
      { error: 'Failed to search documents' },
      { status: 500 }
    );
  }
}
