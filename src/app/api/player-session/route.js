import { cookies } from 'next/headers'
import { PLAYER_SESSION_COOKIE, readPlayerSession } from '@/lib/player-session'
import { createClient } from '@/lib/supabase/server'
import { getPlayer } from '@/lib/clash-api/player.service'

export async function GET(request) {
  const cookieStore = await cookies()
  const playerTag = readPlayerSession(cookieStore.get(PLAYER_SESSION_COOKIE)?.value)

  if (playerTag) {
    if (request.nextUrl.searchParams.get('includePlayer') === '1') {
      try {
        const player = await getPlayer(playerTag)
        return Response.json({ playerTag, player, signedIn: true })
      } catch (error) {
        return Response.json({ playerTag, signedIn: true, error: error.message || 'Unable to load your player profile.' }, { status: 502 })
      }
    }
    return Response.json({ playerTag, signedIn: true })
  }

  let supabaseUser = false
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    supabaseUser = Boolean(user)
  } catch {}
  return Response.json({ playerTag: null, signedIn: supabaseUser })
}
