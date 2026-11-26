import { getLeagues } from '@/lib/clash-api/leaderboard.service'
export async function GET() { try { return Response.json(await getLeagues()) } catch (error) { return Response.json({ error:error.message }, {status:502}) } }
