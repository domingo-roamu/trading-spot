import { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database'
import { getWeekStart } from '@/lib/utils'
import { getResend, FROM_EMAIL } from './resend'
import { buildWeeklyReportEmail } from './weekly-report'

export async function sendWeeklyReports(
  supabase: SupabaseClient<Database>
): Promise<{ sent: number; failed: number; skipped: number }> {
  const weekStart = getWeekStart().toISOString().split('T')[0]
  let sent = 0
  let failed = 0
  let skipped = 0

  // 1. Fetch profiles with email_notifications = true
  const { data: profiles, error: profilesError } = await supabase
    .from('user_profiles')
    .select('user_id, full_name')
    .eq('email_notifications', true)

  if (profilesError) {
    console.error('[sendWeeklyReports] Error fetching profiles:', profilesError.message)
    return { sent, failed, skipped }
  }

  if (!profiles || profiles.length === 0) {
    console.log('[sendWeeklyReports] No users with email_notifications enabled')
    return { sent, failed, skipped }
  }

  // 2. Fetch all user emails via admin API
  const { data: usersData, error: usersError } = await supabase.auth.admin.listUsers({
    perPage: 1000,
  })

  if (usersError) {
    console.error('[sendWeeklyReports] Error fetching auth users:', usersError.message)
    return { sent, failed, skipped }
  }

  const emailByUserId = new Map<string, string>()
  for (const u of usersData.users) {
    if (u.email) emailByUserId.set(u.id, u.email)
  }

  // 3. Process each user
  for (const profile of profiles) {
    const { user_id, full_name } = profile
    const email = emailByUserId.get(user_id)

    if (!email) {
      skipped++
      continue
    }

    // a. Fetch watchlist tickers for this user
    const { data: watchlist, error: watchlistError } = await supabase
      .from('watchlist')
      .select('ticker')
      .eq('user_id', user_id)

    if (watchlistError || !watchlist || watchlist.length === 0) {
      skipped++
      continue
    }

    const tickers = watchlist.map((w) => w.ticker)

    // b. Fetch weekly_analyses for this week
    const { data: analyses, error: analysesError } = await supabase
      .from('weekly_analyses')
      .select('ticker, predicted_direction, confidence_level, confidence_score, summary_es')
      .in('ticker', tickers)
      .eq('week_start', weekStart)

    if (analysesError || !analyses || analyses.length === 0) {
      skipped++
      continue
    }

    // c. Build and send the email
    const { subject, html } = buildWeeklyReportEmail({
      fullName: full_name,
      weekStart,
      analyses,
    })

    let sendError: string | null = null

    try {
      const { error: resendError } = await getResend().emails.send({
        from: FROM_EMAIL,
        to: email,
        subject,
        html,
      })

      if (resendError) {
        sendError = resendError.message
      }
    } catch (err) {
      sendError = err instanceof Error ? err.message : String(err)
    }

    // d. Record in notifications table
    await supabase.from('notifications').insert({
      user_id,
      type: 'weekly_report',
      subject,
      recipients: [email],
      status: sendError ? 'failed' : 'sent',
      sent_at: new Date().toISOString(),
      error_message: sendError,
      context: {
        weekStart,
        tickers,
        analysisCount: analyses.length,
      },
    })

    if (sendError) {
      console.error(`[sendWeeklyReports] Failed to send to ${email}:`, sendError)
      failed++
    } else {
      console.log(`[sendWeeklyReports] Sent to ${email} (${analyses.length} tickers)`)
      sent++
    }
  }

  return { sent, failed, skipped }
}
