'use client'

import { useState, useEffect } from 'react'
import { addRootDomain, removeRootDomain, verifyRootDomainStatus } from './actions'
import { Loader2, Globe, Trash2, RefreshCw, CheckCircle, AlertTriangle, Plus } from 'lucide-react'

export function DomainItem({ domain }: { domain: any }) {
  const [loading, setLoading] = useState(false)
  const [verifying, setVerifying] = useState(false)
  const [status, setStatus] = useState<any>(null)

  useEffect(() => {
    handleVerify()
  }, [])

  const handleVerify = async () => {
    setVerifying(true)
    const res = await verifyRootDomainStatus(domain.domain)
    setStatus(res)
    setVerifying(false)
  }

  const handleRemove = async () => {
    if (!confirm(`Are you sure you want to remove ${domain.domain}? All websites under this domain will stop working.`)) return
    setLoading(true)
    await removeRootDomain(domain.id, domain.domain)
    setLoading(false)
  }

  return (
    <div className="bg-white border border-zinc-200 rounded-3xl p-6 shadow-sm mb-6">
      <div className="flex items-center justify-between p-4 bg-zinc-50 border border-zinc-200 rounded-xl">
        <div>
          <p className="font-bold text-zinc-900">{domain.domain}</p>
          <div className="flex items-center mt-1 text-xs font-medium">
            {status?.verified ? (
              <span className="text-green-600 flex items-center"><CheckCircle className="w-3 h-3 mr-1" /> Active & Verified</span>
            ) : (
              <span className="text-amber-600 flex items-center"><AlertTriangle className="w-3 h-3 mr-1" /> Pending Verification</span>
            )}
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <button 
            onClick={handleVerify} 
            disabled={verifying}
            className="p-2 text-zinc-500 hover:bg-white border border-transparent hover:border-zinc-200 rounded-lg transition-all"
            title="Refresh Status"
          >
            <RefreshCw className={`w-4 h-4 ${verifying ? 'animate-spin' : ''}`} />
          </button>
          <button 
            onClick={handleRemove}
            disabled={loading}
            className="p-2 text-red-500 hover:bg-white border border-transparent hover:border-red-200 rounded-lg transition-all"
            title="Remove Domain"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {!status?.verified && (
        <div className="mt-4 p-4 bg-blue-50 border border-blue-100 rounded-xl text-sm">
          <h3 className="font-semibold text-blue-900 mb-2">Wildcard DNS Configuration Required</h3>
          <p className="text-blue-800 mb-4">To complete the setup, please add the following wildcard record to your domain's DNS settings. This allows you to generate unlimited subdomains from this domain.</p>
          
          <div className="bg-white border border-blue-100 rounded-lg p-3 font-mono text-xs flex flex-col space-y-2">
            <div className="flex justify-between border-b border-zinc-100 pb-2">
              <span className="text-zinc-500 w-16">Type</span>
              <span className="font-semibold text-zinc-900 flex-1">CNAME</span>
            </div>
            <div className="flex justify-between border-b border-zinc-100 pb-2">
              <span className="text-zinc-500 w-16">Name</span>
              <span className="font-semibold text-zinc-900 flex-1">* <span className="font-normal text-zinc-400">(Asterisk symbol)</span></span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-500 w-16">Value</span>
              <span className="font-semibold text-zinc-900 flex-1">cname.vercel-dns.com</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export function DomainForm() {
  const [domain, setDomain] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    
    const res = await addRootDomain(domain)
    if (res.error) {
      setError(res.error)
    } else {
      setDomain('')
    }
    setLoading(false)
  }

  return (
    <div className="bg-white border border-zinc-200 rounded-3xl p-8 shadow-sm">
      <h2 className="text-xl font-bold text-zinc-900 mb-2 flex items-center">
        <Globe className="w-5 h-5 mr-2" />
        Add New Root Domain
      </h2>
      <p className="text-zinc-500 mb-6 text-sm">
        Connect a custom domain (e.g., <code className="bg-zinc-100 px-1 py-0.5 rounded text-zinc-700">yoursite.com</code>) to generate subdomains from it.
      </p>

      {error && (
        <div className="mb-6 p-4 bg-red-50 text-red-700 text-sm rounded-xl border border-red-100">
          {error}
        </div>
      )}

      <form onSubmit={handleAdd} className="flex gap-3">
        <input
          type="text"
          value={domain}
          onChange={(e) => setDomain(e.target.value)}
          placeholder="e.g. myawesomestore.com"
          className="flex-1 rounded-xl border border-zinc-300 px-4 py-3 focus:ring-black focus:border-black text-sm"
          required
        />
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-3 bg-black text-white rounded-xl font-medium text-sm hover:bg-zinc-800 disabled:opacity-50 transition-colors flex items-center"
        >
          {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Plus className="w-4 h-4 mr-2" />}
          Add Domain
        </button>
      </form>
    </div>
  )
}
