import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { logout } from '@/app/auth/actions'
import { Globe, LayoutDashboard, Settings, LogOut } from 'lucide-react'
import Link from 'next/link'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Get profile to show name
  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, role')
    .eq('id', user.id)
    .single()

  return (
    <div className="flex h-screen bg-zinc-50 overflow-hidden text-zinc-900">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-zinc-200 hidden md:flex flex-col">
        <div className="h-16 flex items-center px-6 border-b border-zinc-200">
          <Globe className="w-6 h-6 mr-2 text-black" />
          <span className="font-bold text-lg tracking-tight">SubForge</span>
        </div>
        
        <div className="flex-1 overflow-y-auto py-4">
          <nav className="px-4 space-y-1">
            <Link href="/dashboard" className="flex items-center px-3 py-2.5 bg-zinc-100 text-zinc-900 rounded-lg font-medium transition-colors">
              <LayoutDashboard className="w-5 h-5 mr-3 text-zinc-500" />
              Dashboard
            </Link>
            <Link href="/dashboard/settings" className="flex items-center px-3 py-2.5 text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900 rounded-lg font-medium transition-colors">
              <Settings className="w-5 h-5 mr-3 text-zinc-400" />
              Settings
            </Link>
            {profile?.role === 'admin' && (
              <Link href="/admin" className="flex items-center px-3 py-2.5 text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900 rounded-lg font-medium transition-colors">
                <Globe className="w-5 h-5 mr-3 text-zinc-400" />
                Admin Panel
              </Link>
            )}
          </nav>
        </div>

        <div className="p-4 border-t border-zinc-200">
          <div className="flex items-center mb-4 px-2">
            <div className="w-8 h-8 rounded-full bg-zinc-200 flex items-center justify-center text-sm font-medium">
              {(profile?.full_name || user.email || 'U').charAt(0).toUpperCase()}
            </div>
            <div className="ml-3 overflow-hidden">
              <p className="text-sm font-medium truncate">{profile?.full_name || 'User'}</p>
              <p className="text-xs text-zinc-500 truncate">{user.email}</p>
            </div>
          </div>
          <form action={logout}>
            <button type="submit" className="flex w-full items-center px-3 py-2 text-sm text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900 rounded-lg font-medium transition-colors">
              <LogOut className="w-4 h-4 mr-3 text-zinc-400" />
              Sign out
            </button>
          </form>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto">
        {/* Mobile header */}
        <header className="md:hidden h-16 bg-white border-b border-zinc-200 flex items-center justify-between px-4">
          <div className="flex items-center">
            <Globe className="w-6 h-6 mr-2 text-black" />
            <span className="font-bold text-lg">SubForge</span>
          </div>
        </header>

        <div className="p-6 md:p-10">
          {children}
        </div>
      </main>
    </div>
  )
}
