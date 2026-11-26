import { getBuilderBaseRankings } from '@/lib/clash-api/leaderboard.service'

export async function GET(request) {
  try {
    const location = request.nextUrl.searchParams.get('location') || 'global'
    const resource = request.nextUrl.searchParams.get('resource') || 'players'
    return Response.json(await getBuilderBaseRankings(location, resource))
  } catch (error) {
    return Response.json({ error: error.message }, { status: 502 })
  }
}
