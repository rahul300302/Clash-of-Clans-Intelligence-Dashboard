import { Suspense } from 'react'
import { connection } from 'next/server'
import Link from 'next/link'
import { getClan, getClanMembers, getCurrentWar } from '@/lib/clash-api/clan.service'
import { Shield, Users, Trophy, Swords, MapPin, Crosshair } from 'lucide-react'
import ClanBadge from '@/components/common/clan-badge'
import TownHallBadge from '@/components/common/town-hall-badge'

async function ClanDetailsContent({ params }) {
  await connection()
  const { clanTag } = await params
  let clan
  let members = { items: [] }
  let war = null
  try {
    clan = await getClan(clanTag)
    ;[members, war] = await Promise.all([getClanMembers(clanTag), getCurrentWar(clanTag).catch(() => null)])
  } catch (error) {
    return <main><h1 className="text-3xl font-bold">Clan details unavailable</h1><p className="mt-4 text-red-300">{error.message}</p></main>
  }

  return (
    <>
      <div className="overflow-hidden rounded-3xl border border-red-900/50 bg-gradient-to-r from-red-950 via-slate-950 to-amber-950/30 p-6 sm:p-8">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div><p className="text-sm font-bold uppercase tracking-widest text-amber-400">{clan.tag}</p><h1 className="mt-2 text-4xl font-black">{clan.name}</h1><p className="mt-3 max-w-2xl text-slate-300">{clan.description || 'No clan description available.'}</p></div>
          <div className="grid size-24 place-items-center rounded-3xl border-2 border-amber-400/40 bg-black/30 shadow-[0_0_40px_rgba(220,38,38,.2)]">{clan.badgeUrls?.small ? <ClanBadge url={clan.badgeUrls.small} name={clan.name} size={72} /> : <Shield size={48} className="text-red-400" />}</div>
        </div>
      </div>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5"><Users className="text-cyan-400"/><p className="mt-3 text-sm text-slate-400">Members</p><p className="mt-1 text-2xl font-bold">{clan.members}/50</p></div>
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5"><Trophy className="text-amber-400"/><p className="mt-3 text-sm text-slate-400">Clan points</p><p className="mt-1 text-2xl font-bold">{clan.clanPoints?.toLocaleString()}</p></div>
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5"><Swords className="text-red-400"/><p className="mt-3 text-sm text-slate-400">War wins</p><p className="mt-1 text-2xl font-bold">{clan.warWins || 0}</p></div>
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5"><MapPin className="text-emerald-400"/><p className="mt-3 text-sm text-slate-400">Location</p><p className="mt-1 text-xl font-bold">{clan.location?.name || 'Global'}</p></div>
      </div>
      {war && war.state !== 'notInWar' && <Link href={`/clans/${encodeURIComponent(clan.tag)}/current-war`} className="mt-6 flex items-center justify-between rounded-2xl border border-red-500/40 bg-gradient-to-r from-red-950/80 to-amber-950/30 p-5 transition hover:-translate-y-0.5 hover:border-amber-400"><div className="flex items-center gap-4"><div className="grid size-12 place-items-center rounded-xl bg-red-600 shadow-lg shadow-red-950"><Crosshair size={24}/></div><div><p className="text-xs font-bold uppercase text-red-300">Live war</p><p className="mt-1 text-lg font-bold">{clan.name} vs {war.opponent?.name}</p><p className="mt-1 text-sm text-slate-400">{war.teamSize} vs {war.teamSize} · {war.state}</p></div></div><span className="rounded-full bg-amber-400 px-4 py-2 text-sm font-black text-black">View battle</span></Link>}
      <div className="mt-6 grid gap-6 xl:grid-cols-[2fr_1fr]">
        <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6"><h2 className="font-bold">Clan members</h2><div className="mt-4 divide-y divide-slate-800">{(members.items || []).slice(0, 20).map((member) => <div key={member.tag} className="flex items-center justify-between py-3"><div><p className="font-medium">{member.name}</p><p className="text-xs text-slate-500">{member.role} · {member.tag}</p></div><TownHallBadge className="text-amber-400" level={member.townHallLevel || member.townhallLevel} /></div>)}</div></section>
        <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6"><h2 className="font-bold">War status</h2>{war ? <div className="mt-5"><p className="w-fit rounded-full bg-red-600/20 px-3 py-1 text-sm capitalize text-red-300">{war.state}</p><div className="mt-5 flex items-center justify-between"><span className="font-semibold">{war.clan?.name}</span><span className="font-black text-amber-400">VS</span><span className="text-right font-semibold">{war.opponent?.name}</span></div></div> : <p className="mt-5 text-sm text-slate-400">No active war available.</p>}</section>
      </div>
    </>
  )
}

export default function ClanDetails({ params }) {
  return <Suspense fallback={<div className="rounded-2xl border border-slate-800 bg-slate-900 p-8 text-slate-400">Loading clan details…</div>}><ClanDetailsContent params={params}/></Suspense>
}
