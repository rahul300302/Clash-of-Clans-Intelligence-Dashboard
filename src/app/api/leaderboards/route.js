import { getLeaderboards } from '@/lib/clash-api/leaderboard.service'
import { getPlayer } from '@/lib/clash-api/player.service'

export async function GET(request) {
  try {
    const searchParams = request.nextUrl.searchParams
    const location = searchParams.get('location') || 'global'
    const resource = searchParams.get('resource') || 'clans'
    const ranking = await getLeaderboards(location, resource)

    if (resource === 'players' && ranking.items?.length) {
      const items = await Promise.all(
        ranking.items
          .slice(0, 50)
          .map(async (item) => {
            if (!item.tag) return item
            try {
              const player = await getPlayer(item.tag)
              return {
                ...item,
                townHallLevel: player.townHallLevel || item.townHallLevel || null,
                clan: player.clan || item.clan || null,
              }
            } catch {
              return item
            }
          })
      )
      return Response.json({ ...ranking, items })
    }

    return Response.json(ranking)
  } catch (error) {
    return Response.json({ error: error.message }, { status: 502 })
  }
}
