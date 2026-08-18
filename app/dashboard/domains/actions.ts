'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { addRootDomainToVercel, removeRootDomainFromVercel, verifyDomainOnVercel } from '@/lib/vercel'

export async function addRootDomain(domain: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Not authenticated')

  let cleanDomain = domain.toLowerCase().trim()
  cleanDomain = cleanDomain.replace(/^(https?:\/\/)/, '')
  cleanDomain = cleanDomain.replace(/\/.*$/, '')

  // Verify ownership globally
  const { data: existing } = await supabase
    .from('user_domains')
    .select('id')
    .eq('domain', cleanDomain)
    .single()

  if (existing) throw new Error('Domain already registered')

  // Add wildcard to Vercel
  try {
    const vercelRes = await addRootDomainToVercel(cleanDomain)
    if (vercelRes.error) {
      return { error: vercelRes.error.message }
    }
  } catch (err: any) {
    return { error: err.message || 'Failed to add domain to Vercel' }
  }

  // Update DB
  const { error } = await supabase
    .from('user_domains')
    .insert({ owner_id: user.id, domain: cleanDomain })

  if (error) {
    // rollback Vercel
    await removeRootDomainFromVercel(cleanDomain)
    return { error: 'Failed to save domain in database' }
  }

  revalidatePath(`/dashboard/domains`)
  return { success: true }
}

export async function removeRootDomain(id: string, domain: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Not authenticated')

  // Verify ownership
  const { data: site } = await supabase
    .from('user_domains')
    .select('id')
    .eq('id', id)
    .eq('owner_id', user.id)
    .single()

  if (!site) throw new Error('Domain not found or unauthorized')

  // Remove from Vercel
  try {
    await removeRootDomainFromVercel(domain)
  } catch (err) {
    console.error('Failed to remove from Vercel', err)
  }

  // Update DB
  await supabase
    .from('user_domains')
    .delete()
    .eq('id', id)

  revalidatePath(`/dashboard/domains`)
  return { success: true }
}

export async function verifyRootDomainStatus(domain: string) {
  const res = await verifyDomainOnVercel(`*.${domain}`)
  return res
}
