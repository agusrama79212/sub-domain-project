import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { updateSession } from '@/lib/supabase/middleware';

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};

export async function middleware(req: NextRequest) {
  const url = req.nextUrl;

  // Get hostname of request (e.g. demo.vercel.pub, demo.localhost:3000)
  const hostname = req.headers.get('host') || '';

  // Get the root domain from env
  const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || 'localhost:3000';

  // Extract subdomain: if hostname is "sub.localhost:3000", currentHost becomes "sub"
  let currentHost = hostname.replace(`.${rootDomain}`, '');

  // If we are on local, we might get just 'localhost:3000' which becomes 'localhost:3000'
  if (currentHost === rootDomain || currentHost === hostname) {
    currentHost = '';
  }

  // Update supabase session (standard SSR middleware)
  const { supabaseResponse } = await updateSession(req);

  // rewrites for app pages
  if (currentHost && currentHost !== 'www') {
    // Determine if it's a subdomain or a custom domain
    // If currentHost has a dot, it's a custom domain (e.g. 'toko.com')
    // If it doesn't, it's a subdomain (e.g. 'toko')
    const rewriteResponse = NextResponse.rewrite(new URL(`/sites/${currentHost}${url.pathname}`, req.url));
    
    // Copy cookies from supabaseResponse to rewriteResponse so Auth stays intact
    supabaseResponse.cookies.getAll().forEach(cookie => {
      rewriteResponse.cookies.set(cookie.name, cookie.value);
    });
    
    return rewriteResponse;
  }

  return supabaseResponse;
}
