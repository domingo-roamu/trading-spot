import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Database } from '@/types/database'
import { RadarSection } from '@/components/dashboard/RadarSection'

export type RadarRow = Database['public']['Tables']['market_radar']['Row']

export default async function RadarPage() {
  const supabase = createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  // Fetch all market_radar rows, sorted by 7d change desc
  const { data: radarData } = await supabase
    .from('market_radar')
    .select('*')
    .order('change_7d', { ascending: false })

  const rows = (radarData ?? []) as RadarRow[]

  // Fetch user's watchlist tickers
  const { data: watchlistData } = await supabase
    .from('watchlist')
    .select('ticker')
    .eq('user_id', user.id)

  const watchlistTickers = new Set((watchlistData ?? []).map((w) => w.ticker))

  // Determine last updated time from first row
  const updatedAt = rows.length > 0 ? rows[0].updated_at : null

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Radar de Mercado</h1>
          <p className="text-sm text-gray-500 mt-1">
            {updatedAt
              ? `Actualizado: ${formatRelativeTime(updatedAt)}`
              : 'Sin datos — ejecuta una actualización para cargar precios'}
          </p>
        </div>
      </div>

      <RadarSection rows={rows} watchlistTickers={watchlistTickers} />
    </div>
  )
}

function formatRelativeTime(isoString: string): string {
  const date = new Date(isoString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMins / 60)
  const diffDays = Math.floor(diffHours / 24)

  if (diffMins < 1) return 'hace unos segundos'
  if (diffMins < 60) return `hace ${diffMins} min`
  if (diffHours < 24) return `hace ${diffHours}h`
  return `hace ${diffDays}d`
}
