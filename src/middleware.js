import { NextResponse } from 'next/server';

export function middleware(request) {
  // Check for auth token in cookies
  const authCookie = request.cookies.get('customer');
  
  // If trying to access protected pages without auth
  if (!authCookie && !request.nextUrl.pathname.startsWith('/login') && !request.nextUrl.pathname.startsWith('/register')) {
    // Redirect to login
    return NextResponse.redirect(new URL('/login', request.url));
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: ['/profile', '/cart', '/orders', '/checkout'],
};