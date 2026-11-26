'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'
import { verifyPlayerToken } from '@/lib/clash-api/player.service'
import { createPlayerSession, PLAYER_SESSION_COOKIE, playerSessionCookieOptions } from '@/lib/player-session'

const credentialsSchema = z.object({
  playerTag: z.string().trim().min(1, 'Player tag is required'),
  token: z.string().trim().min(1, 'Verification token is required'),
})

export async function login(_state, formData) {
  const parsed = credentialsSchema.safeParse({
    playerTag: String(formData.get('playerTag') || ''),
    token: String(formData.get('token') || ''),
  })
  if (!parsed.success) return { error: parsed.error.issues[0]?.message || 'Invalid credentials' }

  try {
    const result = await verifyPlayerToken(parsed.data.playerTag, parsed.data.token)
    if (result.status !== 'ok') return { error: 'The verification token was rejected. Check the token in Clash of Clans and try again.' }
    const cookieStore = await cookies()
    cookieStore.set(PLAYER_SESSION_COOKIE, createPlayerSession(parsed.data.playerTag), playerSessionCookieOptions)
  } catch (error) {
    const message = error.message || 'Unable to verify this player.'
    if (/401|403|access denied|forbidden/i.test(message)) {
      return { error: "Clash of Clans denied the verify-token request. Check that COC_API_TOKEN is valid and its allowed IP list includes this server's outbound IP. If player profile lookups work but verification still returns 403, the API token may not have access to /players/{playerTag}/verifytoken; Supercell must grant that access. The verification token has not been accepted." }
    }
    return { error: message }
  }

  revalidatePath('/', 'layout')
  redirect('/dashboard')
}

export async function register(_state, formData) {
  const name = String(formData.get('name') || '').trim()
  if (name.length < 2) return { error: 'Name must be at least 2 characters' }

  const parsed = z.object({ email: z.email(), password: z.string().min(8, 'Password must be at least 8 characters') }).safeParse({
    email: String(formData.get('email') || '').trim(),
    password: String(formData.get('password') || ''),
  })
  if (!parsed.success) return { error: parsed.error.issues[0]?.message || 'Invalid details' }

  const supabase = await createClient()
  const { error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: { data: { display_name: name } },
  })
  if (error) return { error: error.message }

  revalidatePath('/', 'layout')
  return { success: 'Check your email to confirm your account.' }
}

export async function signInWithGoogle() {
  const supabase = await createClient()
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/auth/callback` },
  })
  if (error) throw new Error(error.message)
  redirect(data.url)
}

export async function logout() {
  const cookieStore = await cookies()
  cookieStore.delete(PLAYER_SESSION_COOKIE)
  try {
    const supabase = await createClient()
    await supabase.auth.signOut()
  } catch {}
  revalidatePath('/', 'layout')
  redirect('/login')
}
