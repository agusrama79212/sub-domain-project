import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// Simple MIME type map for common web files
const mimeTypes: Record<string, string> = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'application/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.eot': 'application/vnd.ms-fontobject',
  '.txt': 'text/plain',
}

function getMimeType(filePath: string): string {
  const ext = filePath.substring(filePath.lastIndexOf('.')).toLowerCase()
  return mimeTypes[ext] || 'application/octet-stream'
}

export async function GET(req: NextRequest) {
  const url = req.nextUrl
  const siteId = url.searchParams.get('site_id')
  let path = url.searchParams.get('path')

  if (!siteId || !path) {
    return new NextResponse('Bad Request', { status: 400 })
  }

  // Default to index.html for root or directories
  if (path === '/' || path.endsWith('/')) {
    path = path === '/' ? 'index.html' : `${path}index.html`
  }

  // Remove leading slash for Supabase storage path
  const storagePath = `${siteId}/${path.replace(/^\//, '')}`

  const supabase = await createClient()

  const { data, error } = await supabase.storage
    .from('site_files')
    .download(storagePath)

  if (error || !data) {
    // If not found, and it doesn't have an extension, try appending .html (Clean URLs feature)
    if (!path.includes('.')) {
      const cleanUrlPath = `${siteId}/${path.replace(/^\//, '')}.html`
      const { data: cleanData, error: cleanError } = await supabase.storage
        .from('site_files')
        .download(cleanUrlPath)
      
      if (!cleanError && cleanData) {
        return new NextResponse(cleanData, {
          headers: {
            'Content-Type': 'text/html',
            'Cache-Control': 'public, max-age=3600',
          },
        })
      }
    }
    
    return new NextResponse('Not Found', { status: 404 })
  }

  const contentType = getMimeType(path)

  return new NextResponse(data, {
    headers: {
      'Content-Type': contentType,
      // Add caching for performance
      'Cache-Control': 'public, max-age=3600',
    },
  })
}
