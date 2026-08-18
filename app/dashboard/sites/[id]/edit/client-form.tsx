'use client'

import { useState, useRef } from 'react'
import { Save, Code, LayoutTemplate, UploadCloud, FolderUp, Loader2, CheckCircle2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export function EditSiteForm({ 
  siteId,
  contentData, 
  saveContentAction 
}: { 
  siteId: string,
  contentData: any, 
  saveContentAction: (formData: FormData) => void 
}) {
  const [mode, setMode] = useState<'template' | 'custom' | 'upload'>(contentData.mode || 'template')
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadSuccess, setUploadSuccess] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  const handleUpload = async () => {
    const files = fileInputRef.current?.files
    if (!files || files.length === 0) return

    setIsUploading(true)
    setUploadProgress(0)
    setUploadSuccess(false)
    const supabase = createClient()

    try {
      let uploadedCount = 0
      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        // Get relative path from webkitRelativePath (e.g. "my-folder/index.html" -> "index.html" if we want to strip the root folder name)
        // Usually, the first part is the folder name. Let's strip it so the files are at the root of the site's bucket folder.
        const pathParts = file.webkitRelativePath.split('/')
        pathParts.shift() // Remove the root folder name
        const filePath = `${siteId}/${pathParts.join('/')}`
        
        // Upload to Supabase Storage
        const { error } = await supabase.storage
          .from('site_files')
          .upload(filePath, file, {
            upsert: true,
            contentType: file.type || 'application/octet-stream' // Supabase auto-detects most, but good to pass if known
          })

        if (error) {
          console.error('Error uploading file:', file.name, error)
        }
        
        uploadedCount++
        setUploadProgress(Math.round((uploadedCount / files.length) * 100))
      }

      setUploadSuccess(true)
      
      // Submit the form programmatically to save the 'upload' mode in the database
      const formData = new FormData()
      formData.append('mode', 'upload')
      saveContentAction(formData)
      
    } catch (error) {
      console.error('Upload failed:', error)
      alert('Failed to upload files. Please check the console.')
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <form action={mode === 'upload' ? undefined : saveContentAction} className="space-y-6">
      {/* Mode Selector */}
      <div className="flex bg-zinc-100 p-1 rounded-xl w-fit flex-wrap gap-1">
        <button
          type="button"
          onClick={() => setMode('template')}
          className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            mode === 'template' ? 'bg-white text-zinc-900 shadow-sm' : 'text-zinc-500 hover:text-zinc-700'
          }`}
        >
          <LayoutTemplate className="w-4 h-4 mr-2" />
          Template Builder
        </button>
        <button
          type="button"
          onClick={() => setMode('custom')}
          className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            mode === 'custom' ? 'bg-white text-zinc-900 shadow-sm' : 'text-zinc-500 hover:text-zinc-700'
          }`}
        >
          <Code className="w-4 h-4 mr-2" />
          Custom Code
        </button>
        <button
          type="button"
          onClick={() => setMode('upload')}
          className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            mode === 'upload' ? 'bg-white text-zinc-900 shadow-sm' : 'text-zinc-500 hover:text-zinc-700'
          }`}
        >
          <UploadCloud className="w-4 h-4 mr-2" />
          Upload Folder
        </button>
      </div>

      <input type="hidden" name="mode" value={mode} />

      {mode === 'template' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <div className="col-span-full">
            <label htmlFor="heroTitle" className="block text-sm font-semibold text-zinc-900 mb-2">Main Heading (Hero Title)</label>
            <input type="text" id="heroTitle" name="heroTitle" defaultValue={contentData.heroTitle || ''} className="block w-full rounded-xl border border-zinc-300 px-4 py-3 focus:ring-black focus:border-black" placeholder="Welcome to my awesome site" />
          </div>
          <div className="col-span-full">
            <label htmlFor="heroDescription" className="block text-sm font-semibold text-zinc-900 mb-2">Subheading (Description)</label>
            <textarea id="heroDescription" name="heroDescription" rows={2} defaultValue={contentData.heroDescription || ''} className="block w-full rounded-xl border border-zinc-300 px-4 py-3 focus:ring-black focus:border-black" placeholder="A short description of what you do" />
          </div>
          <div>
            <label htmlFor="ctaText" className="block text-sm font-semibold text-zinc-900 mb-2">Button Text (CTA)</label>
            <input type="text" id="ctaText" name="ctaText" defaultValue={contentData.ctaText || ''} className="block w-full rounded-xl border border-zinc-300 px-4 py-3 focus:ring-black focus:border-black" placeholder="Contact Me" />
          </div>
          <div>
            <label htmlFor="ctaLink" className="block text-sm font-semibold text-zinc-900 mb-2">Button Link (URL)</label>
            <input type="text" id="ctaLink" name="ctaLink" defaultValue={contentData.ctaLink || ''} className="block w-full rounded-xl border border-zinc-300 px-4 py-3 focus:ring-black focus:border-black" placeholder="mailto:you@example.com or https://..." />
          </div>
          <div className="col-span-full">
            <label htmlFor="bodyContent" className="block text-sm font-semibold text-zinc-900 mb-2">Main Content (HTML/Text)</label>
            <textarea id="bodyContent" name="bodyContent" rows={6} defaultValue={contentData.bodyContent || ''} className="block w-full rounded-xl border border-zinc-300 px-4 py-3 focus:ring-black focus:border-black font-mono text-sm" placeholder="<p>Write your detailed content here...</p>" />
          </div>
        </div>
      )}
      
      {mode === 'custom' && (
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-300 space-y-4">
          <div>
            <label htmlFor="customCode" className="block text-sm font-semibold text-zinc-900 mb-2">Raw HTML / CSS / JS</label>
            <p className="text-zinc-500 text-xs mb-3">Paste your full HTML code here. This will completely replace the template rendering.</p>
            <textarea 
              id="customCode" 
              name="customCode" 
              rows={20} 
              defaultValue={contentData.customCode || ''} 
              className="block w-full rounded-xl border border-zinc-300 px-4 py-4 bg-zinc-950 text-green-400 focus:ring-black focus:border-black font-mono text-sm" 
              placeholder="<!DOCTYPE html>\n<html>\n  <head>\n    <style>\n      body { background: #000; color: #fff; }\n    </style>\n  </head>\n  <body>\n    <h1>Hello World</h1>\n  </body>\n</html>" 
            />
          </div>
        </div>
      )}

      {mode === 'upload' && (
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-300 space-y-4">
          <div className="border-2 border-dashed border-zinc-200 rounded-3xl p-12 text-center hover:border-black transition-colors bg-zinc-50">
            <FolderUp className="w-12 h-12 text-zinc-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-zinc-900 mb-2">Upload your Static Site</h3>
            <p className="text-zinc-500 text-sm mb-6 max-w-sm mx-auto">
              Select a folder containing your index.html, CSS, JS, and image files. It will be instantly deployed.
            </p>
            
            <label className="relative cursor-pointer inline-flex items-center px-6 py-3 bg-black text-white text-sm font-semibold rounded-xl hover:bg-zinc-800 transition-colors">
              <span>Select Folder</span>
              <input 
                ref={fileInputRef}
                type="file" 
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
                multiple 
                onChange={() => {
                  setUploadProgress(0)
                  setUploadSuccess(false)
                }}
                {...{webkitdirectory: "true", directory: "true"} as any}
              />
            </label>

            {fileInputRef.current?.files && fileInputRef.current.files.length > 0 && (
              <p className="mt-4 text-sm font-medium text-zinc-900">
                {fileInputRef.current.files.length} files selected
              </p>
            )}

            {isUploading && (
              <div className="mt-6 w-full max-w-md mx-auto">
                <div className="flex justify-between text-xs font-semibold mb-2">
                  <span>Uploading...</span>
                  <span>{uploadProgress}%</span>
                </div>
                <div className="w-full bg-zinc-200 rounded-full h-2">
                  <div className="bg-black h-2 rounded-full transition-all duration-300" style={{ width: `${uploadProgress}%` }}></div>
                </div>
              </div>
            )}

            {uploadSuccess && (
              <div className="mt-6 flex items-center justify-center text-green-600 font-medium text-sm">
                <CheckCircle2 className="w-5 h-5 mr-2" />
                Files uploaded successfully! Website deployed.
              </div>
            )}
          </div>
        </div>
      )}
      
      <div className="pt-6 border-t border-zinc-100 flex justify-end">
        {mode === 'upload' ? (
           <button 
            type="button" 
            onClick={handleUpload}
            disabled={isUploading || (!fileInputRef.current?.files?.length)}
            className="inline-flex justify-center items-center py-3 px-6 border border-transparent shadow-sm text-sm font-semibold rounded-xl text-white bg-black hover:bg-zinc-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isUploading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <UploadCloud className="w-4 h-4 mr-2" />}
            {isUploading ? 'Uploading...' : 'Upload & Deploy'}
          </button>
        ) : (
          <button type="submit" className="inline-flex justify-center items-center py-3 px-6 border border-transparent shadow-sm text-sm font-semibold rounded-xl text-white bg-black hover:bg-zinc-800 transition-colors">
            <Save className="w-4 h-4 mr-2" />
            Save Changes
          </button>
        )}
      </div>
    </form>
  )
}
