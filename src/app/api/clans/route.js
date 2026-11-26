import { searchClans } from '@/lib/clash-api/clan.service'

export async function GET(request) {
  try {
    const data = await searchClans(Object.fromEntries(request.nextUrl.searchParams))
    return Response.json(data)
  } catch (error) {
    return Response.json({ error: error.message }, { status: 502 })
  }
}
