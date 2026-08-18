import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Globe, Save, CheckCircle, ExternalLink } from 'lucide-react'
import { updateContent, togglePublishStatus } from './actions'
import { EditSiteForm } from './client-form'

export default async function EditSitePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: site } = await supabase
    .from('sites')
    .select('*, site_content(*)')
    .eq('id', id)
    .single()

  if (!site) return notFound()

  const content = site.site_content
  const siteContent = Array.isArray(content) ? content[0] : content
  const contentData = siteContent?.content_json || {}

  const isPublished = site.status === 'published'

  async function saveContentAction(formData: FormData) {
    'use server'
    await updateContent(id, formData)
  }

  async function toggleStatusAction() {
    'use server'
    await togglePublishStatus(id, site.status)
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20">
       <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <Link href="/dashboard" className="p-2 bg-zinc-100 text-zinc-500 rounded-full hover:bg-zinc-200 transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-zinc-900">Edit Website</h1>
            <p className="text-zinc-500 mt-1 flex items-center">
              <Globe className="w-4 h-4 mr-1.5" />
              {site.subdomain}.{site.root_domain || process.env.NEXT_PUBLIC_ROOT_DOMAIN || 'localhost:3000'}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          {isPublished && (
            <a 
              href={`http://${site.subdomain}.${site.root_domain || process.env.NEXT_PUBLIC_ROOT_DOMAIN || 'localhost:3000'}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-4 py-2 bg-white border border-zinc-200 text-sm font-medium rounded-xl hover:bg-zinc-50 transition-colors shadow-sm"
            >
              <ExternalLink className="w-4 h-4 mr-2 text-zinc-500" />
              View Live
            </a>
          )}
          <form action={toggleStatusAction}>
            <button 
              type="submit"
              className={`inline-flex items-center px-4 py-2 text-sm font-medium rounded-xl transition-colors shadow-sm ${
                isPublished 
                  ? 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200 border border-zinc-200' 
                  : 'bg-green-600 text-white hover:bg-green-700'
              }`}
            >
              {isPublished ? 'Unpublish Site' : 'Publish Site'}
            </button>
          </form>
        </div>
      </div>

      <div className="bg-white border border-zinc-200 rounded-3xl p-8 shadow-sm shadow-zinc-100/50">
        <div className="flex items-center mb-6">
           <div className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center border ${
             isPublished ? 'bg-green-50 text-green-700 border-green-200' : 'bg-amber-50 text-amber-700 border-amber-200'
           }`}>
             {isPublished ? <CheckCircle className="w-3.5 h-3.5 mr-1" /> : null}
             Status: {site.status.toUpperCase()}
           </div>
        </div>

        <EditSiteForm contentData={contentData} saveContentAction={saveContentAction} />
      </div>
    </div>
  )
}
