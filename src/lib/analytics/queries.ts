import type { Trade, TradingDirection } from '@/types'

export interface TickerStats {
  ticker: string
  trades: number
  pnl_net: number
  roi_net_pct: number
  wins: number
  losses: number
}

export interface DirectionStats {
  total: number
  correct: number
  accuracy_pct: number
}

export interface PredictionStats {
  total_with_prediction: number
  correct: number
  accuracy_pct: number
  by_direction: {
    up: DirectionStats
    down: DirectionStats
    sideways: DirectionStats
  }
}

export interface AnalyticsData {
  trade_count: number
  total_pnl_net: number
  total_invested: number
  roi_net_pct: number
  win_rate: number
  avg_trade_duration_days: number
  prediction: PredictionStats
  byTicker: TickerStats[]
  bestTrades: Trade[]
  worstTrades: Trade[]
}

function directionStats(trades: Trade[], dir: TradingDirection): DirectionStats {
  const dirTrades = trades.filter((t) => t.predicted_direction === dir)
  const correct = dirTrades.filter((t) => t.prediction_correct).length
  return {
    total: dirTrades.length,
    correct,
    accuracy_pct: dirTrades.length > 0 ? (correct / dirTrades.length) * 100 : 0,
  }
}

export function computeAnalytics(closedTrades: Trade[]): AnalyticsData {
  const trade_count = closedTrades.length
  const total_pnl_net = closedTrades.reduce((sum, t) => sum + (t.profit_loss_net ?? 0), 0)
  const total_invested = closedTrades.reduce((sum, t) => sum + (t.investment_total ?? 0), 0)
  const roi_net_pct = total_invested > 0 ? (total_pnl_net / total_invested) * 100 : 0

  const wins = closedTrades.filter((t) => (t.profit_loss_net ?? 0) > 0).length
  const win_rate = trade_count > 0 ? (wins / trade_count) * 100 : 0

  const tradesWithDates = closedTrades.filter((t) => t.buy_date && t.sell_date)
  const avg_trade_duration_days =
    tradesWithDates.length > 0
      ? tradesWithDates.reduce((sum, t) => {
          const ms = new Date(t.sell_date!).getTime() - new Date(t.buy_date!).getTime()
          return sum + ms / 86_400_000
        }, 0) / tradesWithDates.length
      : 0

  const tradesWithPrediction = closedTrades.filter(
    (t) => t.predicted_direction !== null && t.prediction_correct !== null
  )
  const correctCount = tradesWithPrediction.filter((t) => t.prediction_correct).length
  const prediction: PredictionStats = {
    total_with_prediction: tradesWithPrediction.length,
    correct: correctCount,
    accuracy_pct:
      tradesWithPrediction.length > 0 ? (correctCount / tradesWithPrediction.length) * 100 : 0,
    by_direction: {
      up: directionStats(tradesWithPrediction, 'up'),
      down: directionStats(tradesWithPrediction, 'down'),
      sideways: directionStats(tradesWithPrediction, 'sideways'),
    },
  }

  const tickerMap = new Map<
    string,
    { pnl: number; invested: number; trades: number; wins: number; losses: number }
  >()
  for (const t of closedTrades) {
    const s = tickerMap.get(t.ticker) ?? { pnl: 0, invested: 0, trades: 0, wins: 0, losses: 0 }
    s.trades++
    s.pnl += t.profit_loss_net ?? 0
    s.invested += t.investment_total ?? 0
    if ((t.profit_loss_net ?? 0) > 0) s.wins++
    else if ((t.profit_loss_net ?? 0) < 0) s.losses++
    tickerMap.set(t.ticker, s)
  }
  const byTicker: TickerStats[] = Array.from(tickerMap.entries())
    .map(([ticker, s]) => ({
      ticker,
      trades: s.trades,
      pnl_net: s.pnl,
      roi_net_pct: s.invested > 0 ? (s.pnl / s.invested) * 100 : 0,
      wins: s.wins,
      losses: s.losses,
    }))
    .sort((a, b) => b.pnl_net - a.pnl_net)

  const sortedByPnl = [...closedTrades].sort(
    (a, b) => (b.profit_loss_net ?? 0) - (a.profit_loss_net ?? 0)
  )
  const bestTrades = sortedByPnl.slice(0, 3)
  const worstTrades = sortedByPnl.slice(-3).reverse()

  return {
    trade_count,
    total_pnl_net,
    total_invested,
    roi_net_pct,
    win_rate,
    avg_trade_duration_days,
    prediction,
    byTicker,
    bestTrades,
    worstTrades,
  }
}
