const STORAGE_KEY = 'clanverse-search-history'

export function getLocalSearchHistory() {
  if (typeof window === 'undefined') return []
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]') } catch { return [] }
}

export function addLocalSearchHistory(query, resourceType = 'search') {
  if (typeof window === 'undefined') return
  const normalizedQuery = String(query || '').trim()
  if (!normalizedQuery) return
  const next = [
    { id: `local-${Date.now()}`, query: normalizedQuery, resource_type: resourceType, created_at: new Date().toISOString() },
    ...getLocalSearchHistory().filter((item) => !(item.query === normalizedQuery && item.resource_type === resourceType)),
  ].slice(0, 20)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  window.dispatchEvent(new Event('clanverse-search-history-updated'))
}

export function clearLocalSearchHistory() {
  if (typeof window === 'undefined') return
  localStorage.removeItem(STORAGE_KEY)
  window.dispatchEvent(new Event('clanverse-search-history-updated'))
}

export async function saveSearchHistory(query, resourceType = 'search') {
  addLocalSearchHistory(query, resourceType)
  try {
    await fetch('/api/search-history', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, resourceType }),
    })
  } catch {}
}
