import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(request) {
  const { pathname } = request.nextUrl;
  
  // Check if the path is an admin route
  const isAdminRoute = pathname.startsWith('/admin');
  
  // Get the session token
  const token = await getToken({ 
    req: request,
    secret: process.env.NEXTAUTH_SECRET || 'your-secret-key-change-in-production'
  });
  
  // If it's an admin route and no token exists, redirect to login
  if (isAdminRoute && !token) {
    const url = new URL('/login', request.url);
    url.searchParams.set('callbackUrl', encodeURI(pathname));
    return NextResponse.redirect(url);
  }
  
  return NextResponse.next();
}

// Configure which paths the middleware should run on
export const config = {
  matcher: [
    '/admin/:path*',
  ],
};
