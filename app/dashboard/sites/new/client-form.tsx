'use client'

import { useState, useEffect } from 'react'
import { checkAvailability, createSite } from '../actions'
import { Loader2, CheckCircle2, XCircle } from 'lucide-react'

export function NewSiteForm({ domains }: { domains: any[] }) {
  const defaultDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || 'localhost:3000'
  const [subdomain, setSubdomain] = useState('')
  const [rootDomain, setRootDomain] = useState(defaultDomain)
  const [isChecking, setIsChecking] = useState(false)
  const [status, setStatus] = useState<{ available?: boolean; reason?: string } | null>(null)

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (subdomain.length >= 3) {
        setIsChecking(true)
        const res = await checkAvailability(subdomain.toLowerCase(), rootDomain)
        setStatus(res)
        setIsChecking(false)
      } else if (subdomain.length > 0) {
        setStatus({ available: false, reason: 'Subdomain must be at least 3 characters long.' })
      } else {
        setStatus(null)
      }
    }, 500) // 500ms debounce

    return () => clearTimeout(timer)
  }, [subdomain, rootDomain])

  const isFormValid = status?.available && subdomain.length >= 3

  return (
    <div className="bg-white border border-zinc-200 rounded-3xl p-8 shadow-sm shadow-zinc-100/50">
      <form action={createSite} className="space-y-6">
        
        <div>
          <label htmlFor="title" className="block text-sm font-semibold text-zinc-900 mb-2">
            Website Title
          </label>
          <input
            type="text"
            name="title"
            id="title"
            required
            className="block w-full rounded-xl border border-zinc-300 px-4 py-3 text-zinc-900 placeholder-zinc-400 focus:border-black focus:ring-black sm:text-sm transition-colors"
            placeholder="e.g. My Portfolio"
          />
        </div>

        <div>
          <label htmlFor="subdomain" className="block text-sm font-semibold text-zinc-900 mb-2">
            Website URL
          </label>
          <div className="flex mt-1">
            <input
              type="text"
              name="subdomain"
              id="subdomain"
              required
              value={subdomain}
              onChange={(e) => setSubdomain(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
              className="block w-full rounded-l-xl border border-zinc-300 px-4 py-3 text-zinc-900 placeholder-zinc-400 focus:border-black focus:ring-black sm:text-sm transition-colors"
              placeholder="your-name"
            />
            <span className="inline-flex items-center px-2 border-y border-zinc-300 bg-zinc-50 text-zinc-500 font-medium text-lg">
              .
            </span>
            <select
              name="rootDomain"
              value={rootDomain}
              onChange={(e) => setRootDomain(e.target.value)}
              className="inline-flex items-center px-4 rounded-r-xl border border-zinc-300 bg-zinc-50 text-zinc-700 sm:text-sm font-bold focus:ring-black focus:border-black"
            >
              <option value={defaultDomain}>{defaultDomain} (Free)</option>
              {domains.map((d) => (
                <option key={d.id} value={d.domain}>{d.domain} (Custom)</option>
              ))}
            </select>
          </div>
          
          <div className="mt-3 h-5 flex items-center text-sm">
            {isChecking && (
              <div className="flex items-center text-zinc-500">
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Checking availability...
              </div>
            )}
            {!isChecking && status && (
              <div className={`flex items-center font-medium ${status.available ? 'text-green-600' : 'text-red-500'}`}>
                {status.available ? (
                  <><CheckCircle2 className="w-4 h-4 mr-1.5" /> Subdomain is available!</>
                ) : (
                  <><XCircle className="w-4 h-4 mr-1.5" /> {status.reason}</>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="pt-4 border-t border-zinc-100">
          <button
            type="submit"
            disabled={!isFormValid}
            className={`w-full flex justify-center py-3.5 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white transition-all ${
              isFormValid ? 'bg-black hover:bg-zinc-800' : 'bg-zinc-300 cursor-not-allowed'
            }`}
          >
            Create Website
          </button>
        </div>
      </form>
    </div>
  )
}
