import { verifyPlayerToken } from '@/lib/clash-api/player.service'
export async function POST(request) {
  try {
    const body = await request.json()
    if (!body.playerTag || !body.token) return Response.json({ error: 'playerTag and token are required' }, { status: 400 })
    return Response.json(await verifyPlayerToken(body.playerTag, body.token))
  } catch (error) { return Response.json({ error: error.message }, { status: 502 }) }
}
