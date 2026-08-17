import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Globe } from 'lucide-react'
import { CustomDomainSettings } from './client-form'

export default async function SiteSettingsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: site } = await supabase
    .from('sites')
    .select('*')
    .eq('id', id)
    .single()

  if (!site) return notFound()

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20">
       <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <Link href={`/dashboard/sites/${id}/edit`} className="p-2 bg-zinc-100 text-zinc-500 rounded-full hover:bg-zinc-200 transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-zinc-900">Site Settings</h1>
            <p className="text-zinc-500 mt-1 flex items-center">
              <Globe className="w-4 h-4 mr-1.5" />
              {site.subdomain}.{process.env.NEXT_PUBLIC_ROOT_DOMAIN || 'localhost:3000'}
            </p>
          </div>
        </div>
      </div>

      <CustomDomainSettings siteId={site.id} currentDomain={site.custom_domain} />
    </div>
  )
}
