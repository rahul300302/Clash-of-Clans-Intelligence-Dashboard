import { cookies } from 'next/headers'
import { createAdminClient } from '@/lib/supabase/admin'
import { PLAYER_SESSION_COOKIE, readPlayerSession } from '@/lib/player-session'
import { sendNotificationEmail } from '@/lib/notifications/sendgrid'

export async function POST() {
  const cookieStore = await cookies()
  const playerTag = readPlayerSession(cookieStore.get(PLAYER_SESSION_COOKIE)?.value)
  if (!playerTag) return Response.json({ error: 'Sign in with your player account first.' }, { status: 401 })

  try {
    const { data, error } = await createAdminClient().from('player_notification_settings').select('email, player_name').eq('player_tag', playerTag).maybeSingle()
    if (error) throw error
    if (!data?.email) return Response.json({ error: 'Save an email address in Settings before sending a test.' }, { status: 400 })
    await sendNotificationEmail({
      to: data.email,
      subject: 'CLANVERSE notification test',
      text: `Hi ${data.player_name || 'Clash player'},\n\nEmail notifications are set up for your player account ${playerTag}.`,
    })
    return Response.json({ success: true, email: data.email })
  } catch (error) {
    return Response.json({ error: error.message || 'Unable to send the test email.' }, { status: 503 })
  }
}
