'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function updateContent(siteId: string, formData: FormData) {
  const supabase = await createClient()

  const heroTitle = formData.get('heroTitle') as string || ''
  const heroDescription = formData.get('heroDescription') as string || ''
  const ctaText = formData.get('ctaText') as string || ''
  const ctaLink = formData.get('ctaLink') as string || ''
  const bodyContent = formData.get('bodyContent') as string || ''
  const mode = formData.get('mode') as string || 'template'
  const customCode = formData.get('customCode') as string || ''

  const contentJson = {
    mode,
    customCode,
    heroTitle,
    heroDescription,
    ctaText,
    ctaLink,
    bodyContent,
  }

  const { error } = await supabase
    .from('site_content')
    .update({ content_json: contentJson })
    .eq('site_id', siteId)

  if (error) {
    throw new Error('Failed to save content')
  }

  revalidatePath(`/dashboard/sites/${siteId}/edit`)
  revalidatePath(`/dashboard`)
  return { success: true }
}

export async function togglePublishStatus(siteId: string, currentStatus: string) {
  const supabase = await createClient()
  const newStatus = currentStatus === 'published' ? 'draft' : 'published'

  const { error } = await supabase
    .from('sites')
    .update({ status: newStatus })
    .eq('id', siteId)

  if (error) {
    throw new Error('Failed to update status')
  }

  revalidatePath(`/dashboard/sites/${siteId}/edit`)
  revalidatePath(`/dashboard`)
  return { success: true }
}
