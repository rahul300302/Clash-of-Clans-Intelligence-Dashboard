import 'server-only'

const baseUrl = process.env.COC_API_BASE_URL || 'https://api.clashofclans.com/v1'

export async function cocFetch(path, options = {}) {
  const token = process.env.COC_API_TOKEN
  if (!token) throw new Error('COC_API_TOKEN is not configured')

  const { timeoutMs = 12000, revalidate = 300, ...requestOptions } = options
  let response
  try {
    response = await fetch(`${baseUrl}${path}`, {
      ...requestOptions,
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json',
        ...(requestOptions.body ? { 'Content-Type': 'application/json' } : {}),
        ...requestOptions.headers,
      },
      signal: requestOptions.signal || AbortSignal.timeout(timeoutMs),
      next: { revalidate },
    })
  } catch (error) {
    if (error.name === 'TimeoutError' || error.name === 'AbortError') {
      throw new Error('The Clash of Clans API took too long to respond. Please try again.')
    }
    throw error
  }

  if (!response.ok) {
    const body = await response.text()
    throw new Error(`Clash of Clans API ${response.status}: ${body}`)
  }
  return response.json()
}

export function encodeTag(tag) {
  let normalized = String(tag || '').trim()

  for (let index = 0; index < 2; index += 1) {
    if (normalized.includes('%')) {
      try { normalized = decodeURIComponent(normalized) } catch {}
    }
  }

  normalized = normalized.trim().replace(/^#+/, '').toUpperCase()
  if (!normalized) throw new Error('A valid Clash of Clans tag is required')
  if (!/^[A-Z0-9]+$/.test(normalized)) throw new Error('Invalid Clash of Clans tag')

  return encodeURIComponent(`#${normalized}`)
}
