import { SupabaseClient } from '@supabase/supabase-js'
import { Database } from '@/types/database'
import { RADAR_TICKERS } from '@/data/radar-tickers'
import { getRadarPriceData } from './fetcher'

const BATCH_SIZE = 10
const BATCH_DELAY_MS = 200

type ServiceClient = SupabaseClient<Database>

export interface RefreshResult {
  updated: number
  failed: number
  errors: string[]
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export async function refreshRadarData(supabase: ServiceClient): Promise<RefreshResult> {
  let updated = 0
  let failed = 0
  const errors: string[] = []

  // Process in batches of BATCH_SIZE
  for (let i = 0; i < RADAR_TICKERS.length; i += BATCH_SIZE) {
    const batch = RADAR_TICKERS.slice(i, i + BATCH_SIZE)

    const results = await Promise.all(
      batch.map(async (item) => {
        try {
          const priceData = await getRadarPriceData(item.ticker)

          const { error } = await supabase.from('market_radar').upsert(
            {
              ticker: item.ticker,
              name: item.name,
              sector: item.sector,
              type: item.type,
              price: priceData.currentPrice,
              change_7d: priceData.change7d,
              change_30d: priceData.change30d,
              updated_at: new Date().toISOString(),
            },
            { onConflict: 'ticker' }
          )

          if (error) {
            throw new Error(`DB upsert error: ${error.message}`)
          }

          return { ok: true }
        } catch (err) {
          const msg = err instanceof Error ? err.message : String(err)
          return { ok: false, error: `${item.ticker}: ${msg}` }
        }
      })
    )

    for (const r of results) {
      if (r.ok) {
        updated++
      } else {
        failed++
        if (r.error) errors.push(r.error)
      }
    }

    // Delay between batches to avoid rate-limiting
    if (i + BATCH_SIZE < RADAR_TICKERS.length) {
      await sleep(BATCH_DELAY_MS)
    }
  }

  return { updated, failed, errors }
}
