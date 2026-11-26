import 'server-only'
import { createHmac, timingSafeEqual } from 'node:crypto'

export const PLAYER_SESSION_COOKIE = 'clanverse_player_session'

function signature(tag) {
  const secret = process.env.COC_SESSION_SECRET || process.env.COC_API_TOKEN
  if (!secret) throw new Error('Set COC_SESSION_SECRET to enable player login sessions')
  return createHmac('sha256', secret).update(tag).digest('base64url')
}

export function createPlayerSession(tag) {
  const normalized = String(tag).trim().replace(/^#+/, '').toUpperCase()
  return `${normalized}.${signature(normalized)}`
}

export function readPlayerSession(value) {
  if (!value || typeof value !== 'string') return null
  const separator = value.lastIndexOf('.')
  if (separator < 1) return null
  const tag = value.slice(0, separator)
  try {
    const supplied = Buffer.from(value.slice(separator + 1))
    const expected = Buffer.from(signature(tag))
    if (supplied.length !== expected.length || !timingSafeEqual(supplied, expected)) return null
    return `#${tag}`
  } catch { return null }
}

export const playerSessionCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
  path: '/',
  maxAge: 60 * 60 * 24 * 30,
}
