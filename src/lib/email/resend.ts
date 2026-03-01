import { Resend } from 'resend'

// Lazy singleton — avoids build-time crash when RESEND_API_KEY is not set locally
let _resend: Resend | null = null
export function getResend(): Resend {
  if (!_resend) {
    _resend = new Resend(process.env.RESEND_API_KEY)
  }
  return _resend
}

export const FROM_EMAIL = 'Trading Spot <reports@trading-spot.vip>'
