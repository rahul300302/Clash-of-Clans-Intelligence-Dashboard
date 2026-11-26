import { getCwlGroup } from '@/lib/clash-api/clan.service'
export async function GET(_request, { params }) {
  try { const { clanTag } = await params; return Response.json(await getCwlGroup(clanTag)) }
  catch (error) { return Response.json({ error: error.message }, { status: 502 }) }
}
