import { cocFetch, encodeTag } from './client'

export function getPlayer(tag) {
  return cocFetch(`/players/${encodeTag(tag)}`, { revalidate: 300 })
}

export function verifyPlayerToken(tag, token) {
  return cocFetch(`/players/${encodeTag(tag)}/verifytoken`, {
    method: 'POST',
    revalidate: 0,
    body: JSON.stringify({ token }),
  })
}
