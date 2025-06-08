import { NextResponse } from 'next/server';
import enTranslations from '@/app/translations/en';
import jaTranslations from '@/app/translations/ja';

export async function GET(request) {
  // Get the locale from the query parameter
  const { searchParams } = new URL(request.url);
  const locale = searchParams.get('locale') || 'en';
  
  // Return the appropriate translations
  if (locale === 'ja') {
    return NextResponse.json(jaTranslations);
  } else {
    return NextResponse.json(enTranslations);
  }
}
