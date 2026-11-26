import { getPlayer } from '@/lib/clash-api/player.service'
export async function GET(_request, { params }) { try { const { playerTag } = await params; return Response.json(await getPlayer(playerTag)) } catch (error) { return Response.json({ error: error.message }, { status: 502 }) } }
