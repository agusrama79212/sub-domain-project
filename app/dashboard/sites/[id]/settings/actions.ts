'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { addDomainToVercel, removeDomainFromVercel, verifyDomainOnVercel } from '@/lib/vercel'

export async function addCustomDomain(siteId: string, domain: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Not authenticated')

  // Verify ownership
  const { data: site } = await supabase
    .from('sites')
    .select('custom_domain')
    .eq('id', siteId)
    .eq('owner_id', user.id)
    .single()

  if (!site) throw new Error('Site not found')
  if (site.custom_domain) throw new Error('Site already has a custom domain')

  // Add to Vercel
  try {
    const vercelRes = await addDomainToVercel(domain)
    if (vercelRes.error) {
      return { error: vercelRes.error.message }
    }
  } catch (err: any) {
    return { error: err.message || 'Failed to add domain to Vercel' }
  }

  // Update DB
  const { error } = await supabase
    .from('sites')
    .update({ custom_domain: domain })
    .eq('id', siteId)

  if (error) {
    // rollback Vercel
    await removeDomainFromVercel(domain)
    return { error: 'Domain already taken by another site' }
  }

  revalidatePath(`/dashboard/sites/${siteId}/settings`)
  return { success: true }
}

export async function removeCustomDomain(siteId: string, domain: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Not authenticated')

  // Verify ownership
  const { data: site } = await supabase
    .from('sites')
    .select('custom_domain')
    .eq('id', siteId)
    .eq('owner_id', user.id)
    .single()

  if (!site || site.custom_domain !== domain) throw new Error('Site not found or domain mismatch')

  // Remove from Vercel
  try {
    await removeDomainFromVercel(domain)
  } catch (err) {
    console.error('Failed to remove from Vercel', err)
  }

  // Update DB
  await supabase
    .from('sites')
    .update({ custom_domain: null })
    .eq('id', siteId)

  revalidatePath(`/dashboard/sites/${siteId}/settings`)
  return { success: true }
}

export async function verifyDomainStatus(domain: string) {
  const res = await verifyDomainOnVercel(domain)
  return res
}
