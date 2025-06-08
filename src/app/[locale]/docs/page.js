import { redirect } from 'next/navigation';
import db from '@/app/lib/db';

// This function fetches the first published document for a specific locale
async function getFirstPublishedDocument(locale) {
  try {
    return db.prepare('SELECT slug FROM docs WHERE published = 1 AND language = ? ORDER BY created_at ASC LIMIT 1').get(locale);
  } catch (error) {
    console.error('Error fetching first document:', error);
    return null;
  }
}

export default async function DocsIndexPage({ params }) {
  // Extract the locale from params
  const { locale } = await params;
  
  const firstDoc = await getFirstPublishedDocument(locale);
  
  if (firstDoc) {
    // Redirect to the first available document with locale
    redirect(`/${locale}/docs/${firstDoc.slug}`);
  } else {
    // If no documents exist, redirect to home page with locale
    redirect(`/${locale}`);
  }
  
  // This return is needed for TypeScript, but will never be rendered
  // due to the redirect above
  return null;
}
