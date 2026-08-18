import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { NewSiteForm } from './client-form'
import { redirect } from 'next/navigation'

export default async function NewSitePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Get user's verified domains
  const { data: domains } = await supabase
    .from('user_domains')
    .select('id, domain')
    .eq('owner_id', user.id)

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div className="flex items-center space-x-4">
        <Link href="/dashboard" className="p-2 bg-zinc-100 text-zinc-500 rounded-full hover:bg-zinc-200 transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900">Create New Website</h1>
          <p className="text-zinc-500 mt-1">Claim your subdomain and start building.</p>
        </div>
      </div>

      <NewSiteForm domains={domains || []} />
    </div>
  )
}
