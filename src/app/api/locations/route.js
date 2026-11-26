import { getLocations } from '@/lib/clash-api/leaderboard.service'
export async function GET() { try { return Response.json(await getLocations()) } catch (error) { return Response.json({ error:error.message }, {status:502}) } }
