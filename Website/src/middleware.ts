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
  const origin = request.headers.get('origin') || '';
  const isAllowed = isOriginAllowed(origin);

  // Handle preflight OPTIONS requests
  if (request.method === 'OPTIONS') {
    const response = new NextResponse(null, { status: 204 });
    
    // For allowed origins, echo back the origin; otherwise use wildcard
    response.headers.set('Access-Control-Allow-Origin', isAllowed && origin ? origin : '*');
    response.headers.set('Access-Control-Allow-Credentials', 'true');
    response.headers.set('Access-Control-Allow-Methods', 'GET, DELETE, PATCH, POST, PUT, OPTIONS');
    response.headers.set(
      'Access-Control-Allow-Headers',
      'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
    );
    response.headers.set('Access-Control-Max-Age', '86400');
    
    return response;
  }

  // For regular requests, add CORS headers to the response
  const response = NextResponse.next();
  
  // For allowed origins, echo back the origin; otherwise use wildcard
  response.headers.set('Access-Control-Allow-Origin', isAllowed && origin ? origin : '*');
  response.headers.set('Access-Control-Allow-Credentials', 'true');
  response.headers.set('Access-Control-Allow-Methods', 'GET, DELETE, PATCH, POST, PUT, OPTIONS');
  response.headers.set(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
  );

  return response;
}

// Only run middleware on API routes
export const config = {
  matcher: '/api/:path*',
};
