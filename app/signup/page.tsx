import Link from 'next/link'
import { signup } from '@/app/auth/actions'

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ message: string }>
}) {
  const { message } = await searchParams;

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8 bg-white p-10 rounded-3xl shadow-xl shadow-zinc-200/50 border border-zinc-100">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-zinc-900 tracking-tight">
            Create an account
          </h2>
          <p className="mt-2 text-center text-sm text-zinc-600">
            Start building your subdomains today
          </p>
        </div>
        <form className="mt-8 space-y-6" action={signup}>
          <div className="space-y-4 rounded-md shadow-sm">
            <div>
              <label htmlFor="fullName" className="sr-only">Full Name</label>
              <input
                id="fullName"
                name="fullName"
                type="text"
                required
                className="relative block w-full appearance-none rounded-xl border border-zinc-300 px-4 py-3 text-zinc-900 placeholder-zinc-500 focus:z-10 focus:border-black focus:outline-none focus:ring-1 focus:ring-black sm:text-sm transition-colors"
                placeholder="Full Name"
              />
            </div>
            <div>
              <label htmlFor="email-address" className="sr-only">Email address</label>
              <input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="relative block w-full appearance-none rounded-xl border border-zinc-300 px-4 py-3 text-zinc-900 placeholder-zinc-500 focus:z-10 focus:border-black focus:outline-none focus:ring-1 focus:ring-black sm:text-sm transition-colors"
                placeholder="Email address"
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">Password</label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                className="relative block w-full appearance-none rounded-xl border border-zinc-300 px-4 py-3 text-zinc-900 placeholder-zinc-500 focus:z-10 focus:border-black focus:outline-none focus:ring-1 focus:ring-black sm:text-sm transition-colors"
                placeholder="Password (min 6 chars)"
              />
            </div>
          </div>

          {message && (
            <div className="text-sm text-red-500 text-center bg-red-50 py-2 rounded-md font-medium">
              {message}
            </div>
          )}

          <div>
            <button
              type="submit"
              className="group relative flex w-full justify-center rounded-xl bg-black px-4 py-3 text-sm font-semibold text-white hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 transition-all"
            >
              Sign up
            </button>
          </div>
          
          <div className="text-center text-sm text-zinc-600 mt-4">
            Already have an account?{' '}
            <Link href="/login" className="font-semibold text-black hover:underline">
              Sign in
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}
