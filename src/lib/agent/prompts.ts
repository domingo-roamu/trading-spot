import type { TickerContext } from './types'

function fmt(n: number | null, prefix = '', suffix = '', decimals = 2): string {
  if (n == null) return 'N/A'
  return `${prefix}${n.toFixed(decimals)}${suffix}`
}

function fmtNews(articles: { title: string; summary: string; source: string; date: string; url: string }[]): string {
  if (articles.length === 0) return 'No news available.'
  return articles
    .map(
      (a, i) =>
        `[${i + 1}] ${a.title}\n    Source: ${a.source} | Date: ${a.date}\n    ${a.summary ? a.summary.slice(0, 200) + (a.summary.length > 200 ? '...' : '') : '(no summary)'}\n    URL: ${a.url}`
    )
    .join('\n\n')
}

export function buildAnalysisPrompt(ctx: TickerContext): string {
  const { ticker, weekStart, weekEnd, currentPrice, priceWeekAgo, priceChangePct } = ctx
  const { financials: f, earnings: e } = ctx

  const earningsSection = [
    e.nextEarningsDate ? `Next earnings date: ${e.nextEarningsDate}` : null,
    e.lastPeriod && e.lastActualEPS != null
      ? `Last earnings (${e.lastPeriod}): Actual EPS ${fmt(e.lastActualEPS, '$')} vs Estimate ${fmt(e.lastEstimateEPS, '$')} → Surprise ${fmt(e.lastSurprisePct, '', '%')}`
      : null,
  ]
    .filter(Boolean)
    .join('\n')

  return `You are an expert financial analyst specializing in short-term (weekly) market predictions for equity and ETF traders.

ANALYSIS TARGET: ${ticker}
ANALYSIS WEEK: ${weekStart} → ${weekEnd} (buy Monday, sell Friday)

═══════════════════════════════════════
PRICE DATA
═══════════════════════════════════════
Current Price:     ${fmt(currentPrice, '$')}
Price 1 Week Ago:  ${fmt(priceWeekAgo, '$')}
Weekly Change:     ${priceChangePct > 0 ? '+' : ''}${priceChangePct}%
52-Week High:      ${fmt(f.week52High, '$')}
52-Week Low:       ${fmt(f.week52Low, '$')}

═══════════════════════════════════════
FINANCIAL METRICS
═══════════════════════════════════════
P/E Ratio (TTM):   ${fmt(f.peRatio, '', 'x')}
EPS (TTM):         ${fmt(f.eps, '$')}
Market Cap:        ${f.marketCapitalization != null ? fmt(f.marketCapitalization / 1000, '$', 'B') : 'N/A'}
Revenue Growth YoY:${fmt(f.revenueGrowthTTMYoy, '', '%')}
Gross Margin TTM:  ${fmt(f.grossMarginTTM, '', '%')}

${earningsSection ? `═══════════════════════════════════════\nEARNINGS\n═══════════════════════════════════════\n${earningsSection}` : ''}

═══════════════════════════════════════
COMPANY NEWS — Last 7 Days (${ctx.companyNews.length} articles)
═══════════════════════════════════════
${fmtNews(ctx.companyNews)}

═══════════════════════════════════════
MARKET & MACRO CONTEXT (${ctx.marketNews.length} articles)
═══════════════════════════════════════
${fmtNews(ctx.marketNews)}

═══════════════════════════════════════
YOUR TASK
═══════════════════════════════════════
Based on ALL the above data, predict the price direction of ${ticker} for the week of ${weekStart} to ${weekEnd}.

A weekly trader will:
- BUY on Monday morning at approximately the current price
- SELL on Friday afternoon
- Their goal is a 1-2% weekly gain

Respond with ONLY valid JSON — no markdown, no text outside the JSON object:

{
  "prediction": "up" | "down" | "sideways",
  "confidence": <integer 0-100>,
  "summary_es": "<2-3 paragraph executive summary in Spanish>",
  "summary_en": "<2-3 paragraph executive summary in English>",
  "highlights": [
    "<key factor 1 — max 15 words>",
    "<key factor 2 — max 15 words>",
    "<key factor 3 — max 15 words>",
    "<optional factor 4>",
    "<optional factor 5>"
  ],
  "reasoning_es": "<full detailed analysis in Spanish: explain your reasoning, key risks, what could invalidate this prediction, and what to watch during the week>",
  "reasoning_en": "<full detailed analysis in English: same depth as Spanish version>",
  "news_sources": [
    {"title": "...", "url": "...", "source": "...", "date": "YYYY-MM-DD"}
  ]
}

CONFIDENCE GUIDELINES:
- High (>70%): Multiple aligned signals, clear near-term catalyst, strong sector/market support
- Medium (40-70%): Mixed signals, moderate evidence, some uncertainty
- Low (<40%): Contradictory signals, insufficient data, high macro uncertainty

RULES:
- Be conservative: prefer Medium confidence unless signals are truly exceptional
- Always include at least 2 risks or counter-arguments in reasoning
- Only reference news_sources that actually influenced your analysis
- highlights must be factual, concise bullet points — no fluff
- "sideways" prediction = expected price movement < 0.5% in either direction`
}
