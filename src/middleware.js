import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

// Define the default locale
const defaultLocale = 'en';

// Cookie name for language preference - must match the one in LanguageContext.js
const LANGUAGE_COOKIE_NAME = 'preferred_language';

export async function middleware(request) {
  const { pathname } = request.nextUrl;
  
  // Get the preferred language from cookie or use default
  const cookieLanguage = request.cookies.get(LANGUAGE_COOKIE_NAME)?.value;
  const locale = cookieLanguage || defaultLocale;
  
  // Check if the request is for the root path
  if (pathname === '/') {
    // Redirect to the user's preferred locale
    return NextResponse.redirect(new URL(`/${locale}`, request.url));
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
    '/',
    '/admin/:path*',  // Catch old admin routes and redirect them
    '/login',        // Catch old login route and redirect it
    '/:locale/admin/:path*',
  ],
};
