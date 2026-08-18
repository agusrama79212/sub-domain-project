import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { DomainForm, DomainItem } from './client-form'

export default async function DomainsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: domains } = await supabase
    .from('user_domains')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <div className="max-w-4xl mx-auto pb-20">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-zinc-900">My Root Domains</h1>
        <p className="text-zinc-500 mt-2">
          Bring your own domains and generate unlimited subdomains from them.
        </p>
      </div>

      <div className="space-y-6">
        {domains && domains.map((domain) => (
          <DomainItem key={domain.id} domain={domain} />
        ))}
        
        <DomainForm />
      </div>
    </div>
  )
}
