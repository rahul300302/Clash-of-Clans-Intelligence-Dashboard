export async function GET(request) {
  const url = request.nextUrl.searchParams.get('url')
  if (!url) return Response.json({ error: 'Badge URL is required' }, { status: 400 })

  let parsed
  try { parsed = new URL(url) } catch { return Response.json({ error: 'Invalid badge URL' }, { status: 400 }) }
  if (parsed.hostname !== 'api-assets.clashofclans.com') {
    return Response.json({ error: 'Invalid Clash of Clans asset URL' }, { status: 400 })
  }

  try {
    const response = await fetch(parsed.toString(), { next: { revalidate: 86400 } })
    if (!response.ok) return Response.json({ error: 'Badge unavailable' }, { status: response.status })
    const contentType = response.headers.get('content-type') || 'image/png'
    return new Response(await response.arrayBuffer(), {
      headers: { 'Content-Type': contentType, 'Cache-Control': 'public, max-age=86400, stale-while-revalidate=604800' },
    })
  } catch {
    return Response.json({ error: 'Badge could not be loaded' }, { status: 502 })
  }
}
