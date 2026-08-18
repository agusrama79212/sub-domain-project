'use client'

import { useState } from 'react'
import { Save, Code, LayoutTemplate } from 'lucide-react'

export function EditSiteForm({ 
  contentData, 
  saveContentAction 
}: { 
  contentData: any, 
  saveContentAction: (formData: FormData) => void 
}) {
  const [mode, setMode] = useState<'template' | 'custom'>(contentData.mode || 'template')

  return (
    <form action={saveContentAction} className="space-y-6">
      {/* Mode Selector */}
      <div className="flex bg-zinc-100 p-1 rounded-xl w-fit">
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
      </div>

      <input type="hidden" name="mode" value={mode} />

      {mode === 'template' ? (
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
      ) : (
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
      
      <div className="pt-6 border-t border-zinc-100 flex justify-end">
        <button type="submit" className="inline-flex justify-center items-center py-3 px-6 border border-transparent shadow-sm text-sm font-semibold rounded-xl text-white bg-black hover:bg-zinc-800 transition-colors">
          <Save className="w-4 h-4 mr-2" />
          Save Changes
        </button>
      </div>
    </form>
  )
}
