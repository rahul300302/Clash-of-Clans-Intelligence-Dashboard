import { getClan } from '@/lib/clash-api/clan.service'

export async function GET(_request, { params }) {
  try { const { clanTag } = await params; return Response.json(await getClan(clanTag)) }
  catch (error) { return Response.json({ error: error.message }, { status: 502 }) }
}
