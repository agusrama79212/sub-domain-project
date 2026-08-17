import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';

export default async function SitePage({ params }: { params: Promise<{ subdomain: string }> }) {
  const { subdomain } = await params;
  const supabase = await createClient();

  // Determine if we are searching by custom_domain or subdomain
  const isCustomDomain = subdomain.includes('.');
  
  // Query site based on subdomain or custom_domain
  let query = supabase.from('sites').select('*, site_content(*)');
  if (isCustomDomain) {
    query = query.eq('custom_domain', subdomain);
  } else {
    query = query.eq('subdomain', subdomain);
  }
  
  const { data: site, error: siteError } = await query.single();

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
