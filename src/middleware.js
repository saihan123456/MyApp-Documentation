import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

// Define the default locale and supported locales
const defaultLocale = 'en';
const supportedLocales = ['en', 'ja']; // Add all your supported locales here

// Cookie name for language preference - must match the one in LanguageContext.js
const LANGUAGE_COOKIE_NAME = 'preferred_language';

// Common image file extensions to exclude from locale redirection
const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.svg', '.webp', '.bmp', '.ico'];

export async function middleware(request) {
  const { pathname } = request.nextUrl;
  
  // Skip middleware for image files
  if (imageExtensions.some(ext => pathname.toLowerCase().endsWith(ext))) {
    return NextResponse.next();
  }
  
  // Skip middleware for URLs that contain UUIDs (likely image files)
  const uuidPattern = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i;
  if (uuidPattern.test(pathname)) {
    return NextResponse.next();
  }
  
  // Get the preferred language from cookie or use default
  const cookieLanguage = request.cookies.get(LANGUAGE_COOKIE_NAME)?.value;
  const locale = cookieLanguage || defaultLocale;
  
  // Check if the request is for the root path
  if (pathname === '/') {
    // Redirect to the user's preferred locale
    return NextResponse.redirect(new URL(`/${locale}`, request.url));
  }
  
  // Get the path segments
  const segments = pathname.split('/');
  const firstSegment = segments[1]; // First segment after the leading slash
  
  // If there's a cookie language set and it doesn't match the URL locale
  if (cookieLanguage && firstSegment) {
    // Case 1: URL has an unsupported locale - redirect to preferred locale
    if (!supportedLocales.includes(firstSegment)) {
      const pathWithoutFirstSegment = segments.slice(2).join('/');
      return NextResponse.redirect(new URL(`/${cookieLanguage}/${pathWithoutFirstSegment}`, request.url));
    }
    
    // Case 2: URL has a supported locale but it doesn't match the user's preference
    if (firstSegment !== cookieLanguage) {
      // Replace the locale in the URL with the user's preferred locale
      const pathWithoutLocale = segments.slice(2).join('/');
      return NextResponse.redirect(new URL(`/${cookieLanguage}/${pathWithoutLocale}`, request.url));
    }
  } else if (firstSegment && !supportedLocales.includes(firstSegment)) {
    // No cookie but invalid locale - redirect to default locale
    const pathWithoutFirstSegment = segments.slice(2).join('/');
    return NextResponse.redirect(new URL(`/${defaultLocale}/${pathWithoutFirstSegment}`, request.url));
  }
  
  // Handle old routes that should be redirected to locale-based routes
  // Only redirect if the path doesn't already have a locale prefix
  const localePattern = /^\/[a-z]{2}(\/|$)/; // Matches /en/ or /fr/ etc.
  if ((pathname === '/login' || pathname.startsWith('/admin')) && !localePattern.test(pathname)) {
    // Extract the path without the leading slash
    const pathWithoutSlash = pathname.substring(1);
    // Redirect to the locale-based path
    return NextResponse.redirect(new URL(`/${locale}/${pathWithoutSlash}`, request.url));
  }
  
  // Check if the path is an admin route (now under locale)
  const isAdminRoute = pathname.match(/^\/[\w-]+\/admin/);
  
  // Get the session token
  const token = await getToken({ 
    req: request,
    secret: process.env.NEXTAUTH_SECRET || 'your-secret-key-change-in-production'
  });
  
  // If it's an admin route and no token exists, redirect to login
  if (isAdminRoute && !token) {
    // Get the preferred language from cookie or use default
    const cookieLanguage = request.cookies.get(LANGUAGE_COOKIE_NAME)?.value;
    const locale = cookieLanguage || defaultLocale;
    
    const url = new URL(`/${locale}/login`, request.url);
    // Use the full pathname to ensure proper redirection after login
    url.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(url);
  }
  
  return NextResponse.next();
}

// Configure which paths the middleware should run on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - uploads (user uploaded files)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|uploads).*)',
  ],
};
