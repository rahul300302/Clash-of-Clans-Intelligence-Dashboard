import { getLabels } from '@/lib/clash-api/leaderboard.service'
export async function GET(request) { try { const type=request.nextUrl.searchParams.get('type')==='players'?'players':'clans'; return Response.json(await getLabels(type)) } catch (error) { return Response.json({ error:error.message }, {status:502}) } }
