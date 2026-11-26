import { timingSafeEqual } from 'node:crypto'
import { createAdminClient } from '@/lib/supabase/admin'
import { getPlayer } from '@/lib/clash-api/player.service'
import { getCurrentWar, getCapitalRaids } from '@/lib/clash-api/clan.service'
import { sendNotificationEmail } from '@/lib/notifications/sendgrid'

function hasValidCronSecret(request) {
  const secret = process.env.NOTIFICATION_CRON_SECRET || process.env.CRON_SECRET
  const supplied = request.headers.get('authorization')?.replace(/^Bearer\s+/i, '') || ''
  if (!secret) return false
  const a = Buffer.from(supplied)
  const b = Buffer.from(secret)
  return a.length === b.length && timingSafeEqual(a, b)
}

export async function GET(request) {
  if (!hasValidCronSecret(request)) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const admin = createAdminClient()
  const { data: entries, error } = await admin.from('player_notification_settings')
    .select('*')
    .not('email', 'is', null)
    .or('war_alerts.eq.true,capital_alerts.eq.true')
  if (error) return Response.json({ error: error.message }, { status: 503 })

  let sent = 0
  const failures = []
  for (const entry of entries || []) {
    try {
      const player = await getPlayer(entry.player_tag)
      const clanTag = player.clan?.tag
      if (!clanTag) continue
      const updates = {}
      const messages = []

      if (entry.war_alerts) {
        const war = await getCurrentWar(clanTag)
        const state = String(war.state || 'unknown')
        if (entry.last_war_state == null) updates.last_war_state = state
        else if (entry.last_war_state !== state) {
          messages.push(`War update for ${player.clan.name}: the war status changed from ${entry.last_war_state} to ${state}.`)
          updates.last_war_state = state
        }
      }

      if (entry.capital_alerts) {
        const raids = await getCapitalRaids(clanTag)
        const latest = raids.items?.[0]
        const season = latest?.seasonID || latest?.seasonId || latest?.startTime || latest?.endTime || null
        if (season && entry.last_capital_season == null) updates.last_capital_season = season
        else if (season && entry.last_capital_season !== season) {
          messages.push(`A new Clan Capital raid season is available for ${player.clan.name}.`)
          updates.last_capital_season = season
        }
      }

      if (messages.length) {
        await sendNotificationEmail({ to: entry.email, subject: `CLANVERSE alert: ${player.clan.name}`, text: `Hi ${entry.player_name || player.name},\n\n${messages.join('\n\n')}\n\nPlayer: ${player.name} (${entry.player_tag})` })
        sent += 1
      }
      if (Object.keys(updates).length) {
        updates.updated_at = new Date().toISOString()
        const { error: updateError } = await admin.from('player_notification_settings').update(updates).eq('player_tag', entry.player_tag)
        if (updateError) throw updateError
      }
    } catch (itemError) {
      failures.push({ playerTag: entry.player_tag, error: itemError.message })
    }
  }
  return Response.json({ checked: entries?.length || 0, sent, failures })
}
