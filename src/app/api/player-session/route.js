import { cookies } from 'next/headers'
import { PLAYER_SESSION_COOKIE, readPlayerSession } from '@/lib/player-session'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  const cookieStore = await cookies()
  const playerTag = readPlayerSession(cookieStore.get(PLAYER_SESSION_COOKIE)?.value)
  let supabaseUser = false
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    supabaseUser = Boolean(user)
  } catch {}
  return Response.json({ playerTag, signedIn: Boolean(playerTag || supabaseUser) })
}
