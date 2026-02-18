import { createClient } from '@/lib/supabase/server'
import { logoutAction } from '@/lib/auth/actions'

export default async function DashboardPage() {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4">
      <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm max-w-md w-full text-center">
        <div className="w-12 h-12 bg-gray-900 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg
            className="w-6 h-6 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
            />
          </svg>
        </div>
        <h1 className="text-xl font-bold text-gray-900 mb-2">Dashboard</h1>
        <p className="text-sm text-gray-500 mb-1">Próximamente — en construcción</p>
        {user?.email && (
          <p className="text-xs text-gray-400 mt-2 font-mono">{user.email}</p>
        )}
        <form action={logoutAction} className="mt-6">
          <button
            type="submit"
            className="text-sm text-gray-500 hover:text-gray-700 underline transition-colors"
          >
            Cerrar sesión
          </button>
        </form>
      </div>
    </div>
  )
}
