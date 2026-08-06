import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Function to check if origin is allowed
function isOriginAllowed(origin: string): boolean {
  if (!origin) return true;
  
  const allowedOrigins = [
    'https://student-nest.live',
    'https://www.student-nest.live',
    'http://localhost:3000',
    'http://127.0.0.1:3000',
  ];
  
  // Check exact match
  if (allowedOrigins.includes(origin)) return true;
  
  // Allow all Vercel preview/production URLs for this project
  if (origin.includes('student-nest-infotsav') && origin.includes('vercel.app')) return true;
  if (origin.includes('ronak-kumar-sings-projects') && origin.includes('vercel.app')) return true;
  
  return false;
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const origin = request.headers.get('origin') || '';
  const isAllowed = isOriginAllowed(origin);

  // Server-side route protection for dashboard & profile pages
  const isProtectedStudentRoute = pathname.startsWith('/student/profile') || pathname.startsWith('/student/bookings');
  const isProtectedOwnerRoute = pathname.startsWith('/owner/properties') || pathname.startsWith('/owner/profile') || pathname.startsWith('/owner/bookings') || pathname.startsWith('/owner/dashboard');
  const isProtectedAdminRoute = pathname.startsWith('/admin');

  if (isProtectedStudentRoute || isProtectedOwnerRoute || isProtectedAdminRoute) {
    const hasAccessToken = request.cookies.has('accessToken');
    const hasRefreshToken = request.cookies.has('refreshToken');

    if (!hasAccessToken && !hasRefreshToken) {
      const loginUrl = isProtectedOwnerRoute ? '/owner/login' : '/student/login';
      const redirectUrl = new URL(loginUrl, request.url);
      redirectUrl.searchParams.set('redirectAfterLogin', pathname);
      return NextResponse.redirect(redirectUrl);
    }
  }

  // Handle preflight OPTIONS requests for API
  if (request.method === 'OPTIONS') {
    const response = new NextResponse(null, { status: 204 });
    
    // Only allow trusted origins — do not set wildcard with credentials
    if (isAllowed && origin) {
      response.headers.set('Access-Control-Allow-Origin', origin);
      response.headers.set('Access-Control-Allow-Credentials', 'true');
      response.headers.set('Access-Control-Allow-Methods', 'GET, DELETE, PATCH, POST, PUT, OPTIONS');
      response.headers.set(
        'Access-Control-Allow-Headers',
        'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
      );
      response.headers.set('Access-Control-Max-Age', '86400');
    }
    
    return response;
  }

  // For regular requests, add CORS headers to the response
  const response = NextResponse.next();
  
  // Only allow trusted origins — mixing wildcard with credentials is invalid per CORS spec
  if (isAllowed && origin) {
    response.headers.set('Access-Control-Allow-Origin', origin);
    response.headers.set('Access-Control-Allow-Credentials', 'true');
    response.headers.set('Access-Control-Allow-Methods', 'GET, DELETE, PATCH, POST, PUT, OPTIONS');
    response.headers.set(
      'Access-Control-Allow-Headers',
      'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
    );
  }

  return response;
}

// Run middleware on API routes and protected dashboard routes
export const config = {
  matcher: [
    '/api/:path*',
    '/student/profile/:path*',
    '/student/bookings/:path*',
    '/owner/properties/:path*',
    '/owner/profile/:path*',
    '/owner/bookings/:path*',
    '/owner/dashboard/:path*',
    '/admin/:path*',
  ],
};
