import { cocFetch } from './client'

export function getLeaderboards(locationId = 'global', resource = 'clans') {
  return cocFetch(`/locations/${encodeURIComponent(locationId)}/rankings/${resource}`, { revalidate: 300 })
}

export function getLocations() { return cocFetch('/locations', { revalidate: 86400 }) }
export function getLeagues() { return cocFetch('/leagues', { revalidate: 86400 }) }
export function getLabels(type = 'clans') { return cocFetch(`/labels/${type}`, { revalidate: 86400 }) }
export function getGoldPass() { return cocFetch('/goldpass/seasons/current', { revalidate: 3600 }) }
export function getBuilderBaseRankings(locationId = 'global', resource = 'players') {
  return cocFetch(`/locations/${encodeURIComponent(locationId)}/rankings/${resource}-builder-base`, { revalidate: 300 })
}
export function getSeasons() { return cocFetch('/leagues/29000022/seasons', { revalidate: 86400 }) }
