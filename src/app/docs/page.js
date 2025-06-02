import { redirect } from 'next/navigation';
import db from '@/app/lib/db';

// This function fetches the first published document
async function getFirstPublishedDocument() {
  try {
    return db.prepare('SELECT slug FROM docs WHERE published = 1 ORDER BY created_at ASC LIMIT 1').get();
  } catch (error) {
    console.error('Error fetching first document:', error);
    return null;
  }
}

export default async function DocsIndexPage() {
  const firstDoc = await getFirstPublishedDocument();
  
  if (firstDoc) {
    // Redirect to the first available document
    redirect(`/docs/${firstDoc.slug}`);
  } else {
    // If no documents exist, redirect to home page
    redirect('/');
  }
  
  // This return is needed for TypeScript, but will never be rendered
  // due to the redirect above
  return null;
}
