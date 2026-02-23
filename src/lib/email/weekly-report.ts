interface AnalysisSummary {
  ticker: string
  predicted_direction: string | null
  confidence_level: string | null
  confidence_score: number | null
  summary_es: string | null
}

interface WeeklyReportParams {
  fullName: string | null
  weekStart: string // 'YYYY-MM-DD'
  analyses: AnalysisSummary[]
}

function getDirectionLabel(direction: string | null): string {
  if (direction === 'up') return '↑ Alcista'
  if (direction === 'down') return '↓ Bajista'
  if (direction === 'sideways') return '→ Lateral'
  return '— Sin datos'
}

function getDirectionColor(direction: string | null): string {
  if (direction === 'up') return '#22C55E'
  if (direction === 'down') return '#EF4444'
  return '#F59E0B'
}

function getConfidenceBadgeStyle(level: string | null): string {
  if (level === 'high') return 'background:#DCFCE7;color:#16A34A'
  if (level === 'medium') return 'background:#FEF3C7;color:#D97706'
  return 'background:#FEE2E2;color:#DC2626'
}

function getConfidenceLabel(level: string | null): string {
  if (level === 'high') return 'Alta'
  if (level === 'medium') return 'Media'
  if (level === 'low') return 'Baja'
  return '—'
}

function formatWeekRange(weekStart: string): string {
  const start = new Date(weekStart + 'T00:00:00')
  const end = new Date(start)
  end.setDate(start.getDate() + 4) // viernes
  const opts: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'long', year: 'numeric' }
  return `${start.toLocaleDateString('es-ES', opts)} — ${end.toLocaleDateString('es-ES', opts)}`
}

export function buildWeeklyReportEmail(params: WeeklyReportParams): {
  subject: string
  html: string
} {
  const { fullName, weekStart, analyses } = params
  const greeting = fullName ? `Hola ${fullName}` : 'Hola'
  const weekRange = formatWeekRange(weekStart)

  const subject = `Tu reporte semanal de Trading Spot — Semana del ${weekStart}`

  const tickerRows = analyses
    .map((a) => {
      const dirColor = getDirectionColor(a.predicted_direction)
      const dirLabel = getDirectionLabel(a.predicted_direction)
      const confStyle = getConfidenceBadgeStyle(a.confidence_level)
      const confLabel = getConfidenceLabel(a.confidence_level)
      const score = a.confidence_score !== null ? `${a.confidence_score}%` : ''
      const summary = a.summary_es ?? 'Sin resumen disponible.'

      return `
        <tr>
          <td style="padding:16px;border-bottom:1px solid #E5E7EB;vertical-align:top">
            <table width="100%" cellpadding="0" cellspacing="0" style="border:0">
              <tr>
                <td>
                  <span style="font-family:monospace;font-size:16px;font-weight:700;color:#171717">${a.ticker}</span>
                </td>
                <td align="right">
                  <span style="font-weight:700;font-size:14px;color:${dirColor}">${dirLabel}</span>
                </td>
              </tr>
              <tr>
                <td colspan="2" style="padding-top:6px">
                  <span style="display:inline-block;padding:2px 8px;border-radius:4px;font-size:12px;font-weight:600;${confStyle}">
                    Confianza ${confLabel}${score ? ` · ${score}` : ''}
                  </span>
                </td>
              </tr>
              <tr>
                <td colspan="2" style="padding-top:10px;font-size:14px;color:#374151;line-height:1.5">
                  ${summary}
                </td>
              </tr>
            </table>
          </td>
        </tr>`
    })
    .join('')

  const html = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${subject}</title>
</head>
<body style="margin:0;padding:0;background:#F3F4F6;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0" style="border:0;background:#F3F4F6">
    <tr>
      <td align="center" style="padding:32px 16px">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;border:0">

          <!-- Header -->
          <tr>
            <td style="background:#171717;border-radius:12px 12px 0 0;padding:32px 32px 24px">
              <p style="margin:0;font-size:22px;font-weight:800;color:#FFFFFF;letter-spacing:-0.5px">Trading Spot</p>
              <p style="margin:8px 0 0;font-size:14px;color:#9CA3AF">Reporte semanal · ${weekRange}</p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="background:#FFFFFF;padding:24px 32px 8px">
              <p style="margin:0 0 4px;font-size:16px;color:#374151">${greeting},</p>
              <p style="margin:0 0 24px;font-size:15px;color:#6B7280">
                Aquí está tu análisis semanal para los ${analyses.length} ticker${analyses.length !== 1 ? 's' : ''} en tu watchlist.
              </p>
            </td>
          </tr>

          <!-- Ticker rows -->
          <tr>
            <td style="background:#FFFFFF;padding:0 32px">
              <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #E5E7EB;border-radius:8px;border-collapse:collapse">
                ${tickerRows}
              </table>
            </td>
          </tr>

          <!-- CTA -->
          <tr>
            <td style="background:#FFFFFF;padding:28px 32px;text-align:center">
              <a href="https://www.trading-spot.vip/dashboard"
                 style="display:inline-block;background:#171717;color:#FFFFFF;text-decoration:none;padding:12px 28px;border-radius:8px;font-size:14px;font-weight:600">
                Ver dashboard completo →
              </a>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#F9FAFB;border-radius:0 0 12px 12px;border-top:1px solid #E5E7EB;padding:20px 32px;text-align:center">
              <p style="margin:0;font-size:12px;color:#9CA3AF">
                Podés desactivar estos emails en
                <a href="https://www.trading-spot.vip/dashboard/settings" style="color:#6B7280">Configuración</a>.
              </p>
              <p style="margin:8px 0 0;font-size:12px;color:#D1D5DB">© 2026 Trading Spot</p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`

  return { subject, html }
}
