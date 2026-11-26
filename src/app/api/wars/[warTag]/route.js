import { getCwlWar } from '@/lib/clash-api/clan.service'
export async function GET(_request, { params }) {
  try { const { warTag } = await params; return Response.json(await getCwlWar(warTag)) }
  catch (error) { return Response.json({ error: error.message }, { status: 502 }) }
}
