/**
 * Combines all data sources into a TickerContext for Claude.
 */

import { fetchPriceData } from './market-data'
import { fetchCompanyNews, fetchBasicFinancials, fetchEarnings } from './finnhub'
import type { NewsArticle, TickerContext } from './types'

function getDateRange(): { from: string; to: string } {
  const to = new Date()
  const from = new Date()
  from.setDate(from.getDate() - 7)
  return {
    from: from.toISOString().split('T')[0],
    to: to.toISOString().split('T')[0],
  }
}

function getWeekEnd(weekStart: string): string {
  const d = new Date(weekStart + 'T12:00:00Z')
  d.setDate(d.getDate() + 4) // Friday
  return d.toISOString().split('T')[0]
}

/**
 * Builds the full context for a single ticker.
 * marketNews is passed in (fetched once per run, shared across all tickers).
 */
export async function buildTickerContext(
  ticker: string,
  weekStart: string,
  marketNews: NewsArticle[]
): Promise<TickerContext> {
  const { from, to } = getDateRange()

  // Fetch all data sources in parallel, with individual error isolation
  const [priceResult, companyNewsResult, financialsResult, earningsResult] =
    await Promise.allSettled([
      fetchPriceData(ticker),
      fetchCompanyNews(ticker, from, to),
      fetchBasicFinancials(ticker),
      fetchEarnings(ticker),
    ])

  // Price is required — rethrow if it fails
  if (priceResult.status === 'rejected') {
    throw new Error(`Price data unavailable for ${ticker}: ${priceResult.reason}`)
  }

  const price = priceResult.value

  const companyNews: NewsArticle[] =
    companyNewsResult.status === 'fulfilled' ? companyNewsResult.value : []

  const financials =
    financialsResult.status === 'fulfilled'
      ? financialsResult.value
      : {
          peRatio: null,
          eps: null,
          marketCapitalization: null,
          week52High: null,
          week52Low: null,
          revenueGrowthTTMYoy: null,
          grossMarginTTM: null,
        }

  const earnings =
    earningsResult.status === 'fulfilled'
      ? earningsResult.value
      : {
          nextEarningsDate: null,
          lastSurprisePct: null,
          lastActualEPS: null,
          lastEstimateEPS: null,
          lastPeriod: null,
        }

  return {
    ticker,
    weekStart,
    weekEnd: getWeekEnd(weekStart),
    currentPrice: price.currentPrice,
    priceWeekAgo: price.priceWeekAgo,
    priceChangePct: price.priceChangePct,
    companyNews,
    marketNews,
    financials,
    earnings,
  }
}
