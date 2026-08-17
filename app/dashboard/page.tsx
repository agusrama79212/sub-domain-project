import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Plus, Globe, ArrowUpRight } from 'lucide-react'

export default async function DashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data: sites } = await supabase
    .from('sites')
    .select('*')
    .eq('owner_id', user?.id)
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900">Your Websites</h1>
          <p className="text-zinc-500 mt-1">Manage and publish your subdomains.</p>
        </div>
        <Link 
          href="/dashboard/sites/new" 
          className="inline-flex items-center px-4 py-2 bg-black text-white text-sm font-medium rounded-xl hover:bg-zinc-800 transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Website
        </Link>
      </div>

      {!sites || sites.length === 0 ? (
        <div className="text-center py-20 bg-white border border-dashed border-zinc-300 rounded-3xl">
          <Globe className="mx-auto h-12 w-12 text-zinc-300" />
          <h3 className="mt-4 text-lg font-semibold text-zinc-900">No websites</h3>
          <p className="mt-2 text-sm text-zinc-500">You haven't created any websites yet.</p>
          <div className="mt-6">
            <Link
              href="/dashboard/sites/new"
              className="inline-flex items-center px-4 py-2 bg-black text-white text-sm font-medium rounded-xl hover:bg-zinc-800 transition-colors shadow-sm"
            >
              <Plus className="w-4 h-4 mr-2" />
              New Website
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sites.map((site) => (
            <div key={site.id} className="bg-white border border-zinc-200 rounded-3xl p-6 hover:shadow-lg hover:shadow-zinc-100 transition-all group flex flex-col">
              <div className="flex justify-between items-start mb-4">
                <div className={`px-2.5 py-1 text-xs font-semibold rounded-full border ${
                  site.status === 'published' ? 'bg-green-50 text-green-700 border-green-200' : 
                  site.status === 'suspended' ? 'bg-red-50 text-red-700 border-red-200' : 
                  'bg-zinc-100 text-zinc-700 border-zinc-200'
                }`}>
                  {site.status.charAt(0).toUpperCase() + site.status.slice(1)}
                </div>
              </div>
              <h3 className="text-xl font-bold text-zinc-900 truncate mb-1">
                {site.title || site.subdomain}
              </h3>
              <p className="text-sm text-zinc-500 flex items-center mb-6">
                <Globe className="w-3.5 h-3.5 mr-1.5" />
                {site.subdomain}.{process.env.NEXT_PUBLIC_ROOT_DOMAIN || 'localhost:3000'}
              </p>
              
              <div className="mt-auto flex space-x-3 pt-4 border-t border-zinc-100">
                <Link 
                  href={`/dashboard/sites/${site.id}/edit`}
                  className="flex-1 text-center py-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-900 text-sm font-semibold rounded-xl transition-colors"
                >
                  Edit Site
                </Link>
                {site.status === 'published' && (
                  <a 
                    href={`http://${site.subdomain}.${process.env.NEXT_PUBLIC_ROOT_DOMAIN || 'localhost:3000'}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-none flex items-center justify-center px-4 bg-zinc-50 border border-zinc-200 hover:bg-zinc-100 text-zinc-900 rounded-xl transition-colors"
                    title="View live site"
                  >
                    <ArrowUpRight className="w-4 h-4" />
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
