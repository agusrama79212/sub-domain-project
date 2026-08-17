'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function checkAvailability(subdomain: string) {
  // Regex to validate subdomain format: a-z, 0-9, -, 3-63 chars
  const isValidFormat = /^[a-z0-9]([a-z0-9-]{1,61}[a-z0-9])?$/.test(subdomain)
  if (!isValidFormat) {
    return { available: false, reason: 'Use lowercase letters, numbers, and hyphens (3-63 chars).' }
  }

  const supabase = await createClient()

  // Check reserved words
  const { data: reserved } = await supabase
    .from('reserved_subdomains')
    .select('word')
    .eq('word', subdomain)
    .single()
  
  if (reserved) {
    return { available: false, reason: 'This subdomain is reserved.' }
  }

  // Check existing sites
  const { data: existing } = await supabase
    .from('sites')
    .select('subdomain')
    .eq('subdomain', subdomain)
    .single()

  if (existing) {
    return { available: false, reason: 'Subdomain is already taken.' }
  }

  return { available: true }
}

export async function createSite(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Not authenticated')

  const subdomain = formData.get('subdomain') as string
  const title = formData.get('title') as string

  const check = await checkAvailability(subdomain)
  if (!check.available) {
    throw new Error(check.reason)
  }

  const { data: site, error: siteError } = await supabase
    .from('sites')
    .insert({
      owner_id: user.id,
      subdomain,
      title,
      status: 'draft'
    })
    .select('id')
    .single()

  if (siteError || !site) {
    console.error(siteError)
    throw new Error('Failed to create site')
  }

  const { error: contentError } = await supabase
    .from('site_content')
    .insert({
      site_id: site.id,
      content_json: {}
    })

  if (contentError) {
    console.error(contentError)
    throw new Error('Failed to initialize site content')
  }

  revalidatePath('/dashboard')
  redirect(`/dashboard/sites/${site.id}/edit`)
}
