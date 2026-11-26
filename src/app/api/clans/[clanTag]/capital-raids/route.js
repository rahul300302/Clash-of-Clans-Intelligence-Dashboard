import { getCapitalRaids } from '@/lib/clash-api/clan.service'
export async function GET(_request, { params }) { try { const { clanTag } = await params; return Response.json(await getCapitalRaids(clanTag)) } catch (error) { return Response.json({ error: error.message }, { status: 502 }) } }
