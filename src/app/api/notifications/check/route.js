import { handleSchedule } from '@vercel/schedules'
import { createAdminClient } from '@/lib/supabase/admin'
import { getPlayer } from '@/lib/clash-api/player.service'
import { getCurrentWar, getCapitalRaids } from '@/lib/clash-api/clan.service'
import { sendNotificationEmail } from '@/lib/notifications/sendgrid'

async function checkNotifications(executionId) {
  const admin = createAdminClient()
  const { error: claimError } = await admin.from('notification_schedule_runs').insert({
    execution_id: executionId,
    status: 'running',
  })

  if (claimError?.code === '23505') return { duplicate: true, checked: 0, sent: 0 }
  if (claimError) throw claimError

  try {
  const { data: entries, error } = await admin.from('player_notification_settings')
    .select('*')
    .not('email', 'is', null)
    .or('war_alerts.eq.true,capital_alerts.eq.true')
  if (error) throw error

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
          messages.push(`War status changed from ${entry.last_war_state} to ${state} for ${player.clan.name}.`)
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
        await sendNotificationEmail({
          to: entry.email,
          subject: `CLANVERSE alert: ${player.clan.name}`,
          text: `Hi ${entry.player_name || player.name},\n\n${messages.join('\n\n')}\n\nPlayer: ${player.name} (${entry.player_tag})`,
        })
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

  const runUpdate = await admin.from('notification_schedule_runs').update({
    status: failures.length ? 'failed' : 'completed',
    checked_count: entries?.length || 0,
    sent_count: sent,
    failure_count: failures.length,
    finished_at: new Date().toISOString(),
  }).eq('execution_id', executionId)
  if (runUpdate.error) throw runUpdate.error
  if (failures.length) throw new Error(`Notification schedule ${executionId} had ${failures.length} player failure(s).`)
  return { duplicate: false, checked: entries?.length || 0, sent }
  } catch (error) {
    await admin.from('notification_schedule_runs').update({
      status: 'failed',
      finished_at: new Date().toISOString(),
    }).eq('execution_id', executionId)
    throw error
  }
}

export const POST = handleSchedule(async (metadata) => {
  const result = await checkNotifications(metadata.executionId)
  console.info('Notification schedule finished', { ...result, name: metadata.name, executionId: metadata.executionId, scheduledAt: metadata.scheduledAt.toISOString() })
})
