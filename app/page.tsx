import Link from 'next/link'
import { ArrowRight, Globe } from 'lucide-react'

export default function Home() {
  return (
    <div className="min-h-screen bg-white text-zinc-950 selection:bg-zinc-200">
      <header className="absolute inset-x-0 top-0 z-50">
        <nav className="flex items-center justify-between p-6 lg:px-8" aria-label="Global">
          <div className="flex lg:flex-1">
            <Link href="/" className="-m-1.5 p-1.5 flex items-center">
              <Globe className="h-8 w-8" />
              <span className="ml-2 text-xl font-bold tracking-tight">SubForge</span>
            </Link>
          </div>
          <div className="flex flex-1 justify-end space-x-4 items-center">
            <Link href="/login" className="text-sm font-semibold leading-6 text-zinc-900">
              Log in
            </Link>
            <Link
              href="/signup"
              className="rounded-full bg-zinc-900 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-zinc-800 transition-colors"
            >
              Get started
            </Link>
          </div>
        </nav>
      </header>

      <main className="relative isolate px-6 pt-14 lg:px-8">
        <div className="mx-auto max-w-3xl py-32 sm:py-48 lg:py-56">
          <div className="text-center">
            <h1 className="text-5xl font-extrabold tracking-tight text-zinc-900 sm:text-7xl">
              Launch your subdomains in seconds
            </h1>
            <p className="mt-6 text-lg leading-8 text-zinc-600 font-light max-w-2xl mx-auto">
              SubForge provides a robust, multi-tenant infrastructure to dynamically provision and publish websites under your own domain without touching DNS settings.
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <Link
                href="/signup"
                className="rounded-full bg-zinc-900 px-8 py-4 text-sm font-semibold text-white shadow-sm hover:bg-zinc-800 transition-all flex items-center group"
              >
                Start building
                <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
