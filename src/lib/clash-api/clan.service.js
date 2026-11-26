import { cocFetch, encodeTag } from './client'

export function searchClans(params = {}) {
  const query = new URLSearchParams()
  for (const [key, value] of Object.entries(params)) if (value) query.set(key, value)
  return cocFetch(`/clans?${query}`, { revalidate: 300 })
}

export function getClan(tag) { return cocFetch(`/clans/${encodeTag(tag)}`, { revalidate: 300 }) }
export function getClanMembers(tag) { return cocFetch(`/clans/${encodeTag(tag)}/members`, { revalidate: 300 }) }
export function getCurrentWar(tag) { return cocFetch(`/clans/${encodeTag(tag)}/currentwar`, { revalidate: 60 }) }
export function getWarLog(tag) { return cocFetch(`/clans/${encodeTag(tag)}/warlog`, { revalidate: 600 }) }
export function getCapitalRaids(tag) { return cocFetch(`/clans/${encodeTag(tag)}/capitalraidseasons`, { revalidate: 300 }) }
export function getCwlGroup(tag) { return cocFetch(`/clans/${encodeTag(tag)}/currentwar/leaguegroup`, { revalidate: 300 }) }
export function getCwlWar(warTag) { return cocFetch(`/clanwarleagues/wars/${encodeURIComponent(String(warTag).replace(/^#/, ''))}`, { revalidate: 60 }) }
export function getCapitalLeagues() { return cocFetch('/capitalleagues', { revalidate: 86400 }) }
export function getCapitalLeague(id) { return cocFetch(`/capitalleagues/${encodeURIComponent(id)}`, { revalidate: 86400 }) }
