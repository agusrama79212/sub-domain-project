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

export async function proxy(req: NextRequest) {
  const url = req.nextUrl;

  // Get hostname of request (e.g. demo.vercel.pub, demo.localhost:3000)
  const hostname = req.headers.get('host') || '';

  // Get the root domain from env
  const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || 'localhost:3000';

  // Extract current host for routing
  let currentHost = hostname;

  // If the request is for the main application root domain (e.g. scrolltubes.xyz)
  if (hostname === rootDomain) {
    currentHost = '';
  } 
  // If the request is a subdomain of the main root domain (e.g. sub.scrolltubes.xyz)
  else if (hostname.endsWith(`.${rootDomain}`)) {
    currentHost = hostname.replace(`.${rootDomain}`, '');
  }
  // If the request is localhost:3000
  else if (hostname === 'localhost:3000' || hostname === '127.0.0.1:3000') {
    currentHost = '';
  }
  // Otherwise, it's a custom domain or a user's root domain (e.g. odivpds.my.id or sub.odivpds.my.id)
  // In this case, we leave currentHost as the full hostname, and the middleware will rewrite it to /sites/hostname

  // Update supabase session (standard SSR middleware)
  const { supabaseResponse, supabase } = await updateSession(req);

  // rewrites for app pages
  if (currentHost && currentHost !== 'www') {
    let mode = 'template';
    
    // Attempt to fetch mode from DB for custom host routing
    // First try custom_domain
    let { data: site } = await supabase.from('sites').select('id, site_content(content_json)').eq('custom_domain', currentHost).single();
    
    if (!site) {
      // Try subdomain + root_domain
      let sub = currentHost;
      let root = rootDomain;
      const parts = currentHost.split('.');
      if (parts.length > 1 && !currentHost.includes('localhost')) {
        sub = parts[0];
        root = parts.slice(1).join('.');
      } else if (currentHost.includes('localhost')) {
        sub = currentHost.replace('.localhost:3000', '');
        root = rootDomain;
      }
      
      const { data: fallbackSite } = await supabase.from('sites').select('id, site_content(content_json)').eq('subdomain', sub).eq('root_domain', root).single();
      site = fallbackSite;
    }

    if (site && site.site_content) {
      const content = Array.isArray(site.site_content) ? site.site_content[0] : site.site_content;
      mode = content?.content_json?.mode || 'template';
    }

    let rewriteResponse;
    if (mode === 'upload') {
       // Route to a special file serving API
       rewriteResponse = NextResponse.rewrite(new URL(`/api/serve-upload?site_id=${site?.id}&path=${url.pathname}`, req.url));
    } else {
       // Normal react component rendering
       rewriteResponse = NextResponse.rewrite(new URL(`/sites/${hostname}${url.pathname}`, req.url));
    }
    
    // Copy cookies from supabaseResponse to rewriteResponse so Auth stays intact
    supabaseResponse.cookies.getAll().forEach(cookie => {
      rewriteResponse.cookies.set(cookie.name, cookie.value);
    });
    
    return rewriteResponse;
  }

  return supabaseResponse;
}
