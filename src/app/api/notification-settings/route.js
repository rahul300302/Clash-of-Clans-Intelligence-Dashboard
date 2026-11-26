import { cookies } from 'next/headers'
import { z } from 'zod'
import { getPlayer } from '@/lib/clash-api/player.service'
import { createAdminClient } from '@/lib/supabase/admin'
import { PLAYER_SESSION_COOKIE, readPlayerSession } from '@/lib/player-session'

async function getPlayerTag() {
  const cookieStore = await cookies()
  return readPlayerSession(cookieStore.get(PLAYER_SESSION_COOKIE)?.value)
}

export async function GET() {
  const playerTag = await getPlayerTag()
  if (!playerTag) return Response.json({ error: 'Sign in with your player account to manage email notifications.' }, { status: 401 })

  try {
    const [player, result] = await Promise.all([
      getPlayer(playerTag),
      createAdminClient().from('player_notification_settings').select('email, player_name, war_alerts, capital_alerts').eq('player_tag', playerTag).maybeSingle(),
    ])
    if (result.error) throw result.error
    return Response.json({
      playerTag,
      playerName: result.data?.player_name || player.name,
      email: result.data?.email || '',
      warAlerts: result.data?.war_alerts ?? false,
      capitalAlerts: result.data?.capital_alerts ?? false,
    })
  } catch (error) {
    return Response.json({ error: error.message || 'Unable to load notification settings.' }, { status: 503 })
  }
}

const settingsSchema = z.object({
  email: z.union([z.email(), z.literal('')]),
  warAlerts: z.boolean(),
  capitalAlerts: z.boolean(),
})

export async function PUT(request) {
  const playerTag = await getPlayerTag()
  if (!playerTag) return Response.json({ error: 'Sign in with your player account to manage email notifications.' }, { status: 401 })

  let body
  try { body = await request.json() } catch { return Response.json({ error: 'Invalid request body.' }, { status: 400 }) }
  const parsed = settingsSchema.safeParse(body)
  if (!parsed.success) return Response.json({ error: 'Enter a valid email address and notification choices.' }, { status: 400 })
  const { email, warAlerts, capitalAlerts } = parsed.data
  if ((warAlerts || capitalAlerts) && !email) return Response.json({ error: 'Add an email address to receive enabled notifications.' }, { status: 400 })

  try {
    const player = await getPlayer(playerTag)
    const { error } = await createAdminClient().from('player_notification_settings').upsert({
      player_tag: playerTag,
      player_name: player.name,
      email: email || null,
      war_alerts: warAlerts,
      capital_alerts: capitalAlerts,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'player_tag' })
    if (error) throw error
    return Response.json({ success: true, playerName: player.name })
  } catch (error) {
    return Response.json({ error: error.message || 'Unable to save notification settings.' }, { status: 503 })
  }
}
