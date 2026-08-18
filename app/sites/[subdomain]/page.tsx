import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';

export default async function SitePage({ params }: { params: Promise<{ subdomain: string }> }) {
  const { subdomain } = await params;
  const supabase = await createClient();

  // Note: due to our middleware rewrite, params.subdomain actually contains the full hostname
  // e.g. "toko.odivpds.my.id", "toko.scrolltubes.xyz", or "toko-baju.com"
  const hostname = subdomain;
  
  // 1. Try to find by custom_domain (legacy Phase 7 feature)
  let { data: site, error: siteError } = await supabase
    .from('sites')
    .select('*, site_content(*)')
    .eq('custom_domain', hostname)
    .single();

  // 2. If not found by custom_domain, try finding by subdomain + root_domain (Phase 7.5 feature)
  if (!site) {
    let sub = hostname;
    let root = process.env.NEXT_PUBLIC_ROOT_DOMAIN || 'localhost:3000';
    
    // Extract subdomain and root domain
    const parts = hostname.split('.');
    if (parts.length > 1 && !hostname.includes('localhost')) {
      sub = parts[0];
      root = parts.slice(1).join('.');
    } else if (hostname.includes('localhost')) {
      sub = hostname.replace('.localhost:3000', '');
      root = process.env.NEXT_PUBLIC_ROOT_DOMAIN || 'localhost:3000';
    }

    const { data: fallbackSite, error: fallbackError } = await supabase
      .from('sites')
      .select('*, site_content(*)')
      .eq('subdomain', sub)
      .eq('root_domain', root)
      .single();
      
    site = fallbackSite;
    siteError = fallbackError;
  }

  if (siteError || !site) {
    return notFound();
  }

  if (site.status === 'suspended') {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-zinc-950 text-white">
        <div className="text-center">
          <h1 className="text-4xl font-extrabold tracking-tight mb-4">Website Suspended</h1>
          <p className="text-zinc-400">This website has been suspended due to policy violations.</p>
        </div>
      </div>
    );
  }

  if (site.status === 'draft') {
    // Return 404 for drafts so they aren't publicly visible
    return notFound();
  }

  // Extract content
  const content = site.site_content;
  const siteContent = Array.isArray(content) ? content[0] : content;
  const contentData = siteContent?.content_json || {};

  // If custom code mode is enabled, render the raw HTML directly
  if (contentData.mode === 'custom' && contentData.customCode) {
    return (
      <div 
        dangerouslySetInnerHTML={{ __html: contentData.customCode }} 
        className="w-full h-full min-h-screen"
      />
    );
  }

  return (
    <div className="min-h-screen bg-white text-zinc-950 selection:bg-zinc-200">
      {/* Dynamic Content Rendering */}
      <header className="py-24 px-6 md:px-12 text-center border-b border-zinc-100">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-zinc-900">
            {contentData.heroTitle || site.title || site.subdomain}
          </h1>
          <p className="mt-6 text-xl md:text-2xl text-zinc-500 max-w-2xl mx-auto font-light">
            {contentData.heroDescription || 'Welcome to this brand new website.'}
          </p>
          {contentData.ctaText && (
             <div className="mt-10">
               <a href={contentData.ctaLink || "#"} className="inline-flex items-center justify-center px-8 py-3.5 text-base font-medium text-white transition-colors bg-zinc-900 rounded-full hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:ring-offset-2">
                 {contentData.ctaText}
               </a>
             </div>
          )}
        </div>
      </header>
      
      <main className="max-w-4xl mx-auto py-16 px-6 md:px-12">
         {contentData.bodyContent ? (
            <div 
              className="prose prose-lg prose-zinc mx-auto font-sans" 
              dangerouslySetInnerHTML={{ __html: contentData.bodyContent }} 
            />
         ) : (
            <div className="text-center py-20 text-zinc-400 border border-dashed border-zinc-200 rounded-2xl">
              <p>No additional content provided yet.</p>
            </div>
         )}
      </main>
    </div>
  );
}
