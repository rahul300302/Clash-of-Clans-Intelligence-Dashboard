import { Suspense } from 'react'
import { connection } from 'next/server'
import { getCurrentWar } from '@/lib/clash-api/clan.service'
import { Swords, Shield, Star, Target, Clock3 } from 'lucide-react'
import ClanBadge from '@/components/common/clan-badge'
import TownHallBadge from '@/components/common/town-hall-badge'
import Link from 'next/link'

async function WarDetails({ params }) {
  await connection()
  const { clanTag } = await params
  let war
  try { war = await getCurrentWar(clanTag) } catch (error) {
    return <><h1 className="text-3xl font-black">War details unavailable</h1><div className="mt-6 rounded-2xl border border-red-900 bg-red-950/40 p-5 text-red-300">{error.message}</div></>
  }
  if (!war || war.state === 'notInWar') return <><h1 className="text-3xl font-black">Current War</h1><div className="mt-6 rounded-2xl border border-slate-800 bg-slate-900 p-10 text-center text-slate-400">This clan is not currently participating in a war.</div></>

  const clanMembers = [...(war.clan?.members || [])].sort((a,b)=>a.mapPosition-b.mapPosition)
  const opponentMembers = [...(war.opponent?.members || [])].sort((a,b)=>a.mapPosition-b.mapPosition)
  return (
    <>
      <div className="overflow-hidden rounded-3xl border border-red-900/50 bg-gradient-to-br from-red-950 via-slate-950 to-amber-950/40 p-5 sm:p-8">
        <div className="flex flex-wrap items-center justify-between gap-3"><span className="rounded-full border border-red-500/40 bg-red-600/20 px-4 py-2 text-sm font-bold uppercase tracking-wider text-red-300">{war.state}</span><span className="flex items-center gap-2 text-sm text-slate-400"><Clock3 size={16}/>{war.teamSize} vs {war.teamSize} · {war.attacksPerMember} attacks</span></div>
        <div className="mt-8 grid items-center gap-5 md:grid-cols-[1fr_auto_1fr]"><WarClan side="Our clan" clan={war.clan} accent="red" /><div className="text-center"><div className="mx-auto grid size-20 place-items-center rounded-full border-4 border-amber-400 bg-slate-950 text-2xl font-black text-amber-400">VS</div></div><WarClan side="Opponent" clan={war.opponent} accent="amber" /></div>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4"><WarMetric icon={Star} label="Clan stars" value={war.clan?.stars || 0} color="text-amber-400" /><WarMetric icon={Target} label="Destruction" value={`${Number(war.clan?.destructionPercentage || 0).toFixed(1)}%`} color="text-cyan-400" /><WarMetric icon={Swords} label="Attacks used" value={`${war.clan?.attacks || 0}/${war.teamSize * war.attacksPerMember}`} color="text-red-400" /><WarMetric icon={Shield} label="Opponent stars" value={war.opponent?.stars || 0} color="text-violet-400" /></div>

      <section className="mt-6 overflow-hidden rounded-2xl border border-slate-800 bg-slate-900"><div className="border-b border-slate-800 px-5 py-4"><h2 className="font-bold">War roster</h2><p className="mt-1 text-sm text-slate-400">Map position, Town Hall, attacks, stars and destruction</p></div><div className="overflow-x-auto"><table className="w-full min-w-[760px] text-sm"><thead className="bg-slate-950/70 text-xs uppercase text-slate-500"><tr><th className="px-5 py-3 text-left">Map</th><th className="px-5 py-3 text-left">War member</th><th className="px-5 py-3 text-left">Town Hall</th><th className="px-5 py-3 text-left">Attacks</th><th className="px-5 py-3 text-left">Stars</th><th className="px-5 py-3 text-left">Destruction</th><th className="px-5 py-3 text-left">Opponent attacks received</th></tr></thead><tbody className="divide-y divide-slate-800">{clanMembers.map(member=><WarMemberRow key={member.tag} member={member}/>)}</tbody></table></div></section>

      <section className="mt-6 rounded-3xl border border-slate-800 bg-slate-900 p-5 sm:p-6 clanverse-enter"><div className="flex items-end justify-between"><div><p className="text-xs font-bold uppercase tracking-[0.22em] text-amber-400">Enemy forces</p><h2 className="mt-1 text-xl font-black">Opponent roster</h2></div><span className="rounded-full border border-amber-400/20 bg-amber-400/10 px-3 py-1 text-xs text-amber-300">{opponentMembers.length} players</span></div><div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">{opponentMembers.map((member,index)=><Link href={`/players/${encodeURIComponent(member.tag)}`} key={member.tag} className="clanverse-card group relative overflow-hidden rounded-2xl border border-slate-800 bg-gradient-to-br from-slate-950 via-slate-950 to-red-950/20 p-4" style={{animation:`clanverse-enter .45s ease ${Math.min(index*.035,.35)}s both`}}><div className="absolute right-0 top-0 h-20 w-20 rounded-bl-full bg-red-600/5 transition group-hover:bg-red-600/10"/><div className="relative flex items-center justify-between"><span className="grid size-9 place-items-center rounded-xl border border-amber-400/20 bg-amber-400/10 font-black text-amber-300">{member.mapPosition}</span><TownHallBadge level={member.townhallLevel} size={38} showLabel={false}/></div><p className="mt-4 truncate text-lg font-black group-hover:text-red-300">{member.name}</p><p className="mt-1 text-xs text-slate-500">{member.tag}</p><div className="mt-4 flex items-center justify-between rounded-xl border border-slate-800 bg-black/20 px-3 py-2"><span className="text-xs text-slate-500">Attacks received</span><b className="text-lg text-red-300">{member.opponentAttacks || 0}</b></div><span className="mt-3 flex items-center justify-end text-xs font-bold text-red-400 opacity-70 transition group-hover:opacity-100">View player profile →</span></Link>)}</div></section>
    </>
  )
}

function WarClan({ side, clan, accent }) {
  const red=accent==='red'
  return <div className="rounded-2xl border border-slate-700 bg-slate-950/70 p-5"><p className="text-xs font-bold uppercase tracking-widest text-slate-500">{side}</p><div className="mt-3 flex items-center justify-between gap-3"><div><p className="text-xl font-black">{clan?.name}</p><p className="mt-1 text-xs text-slate-500">Level {clan?.clanLevel} · {clan?.tag}</p></div><ClanBadge url={clan?.badgeUrls?.small} name={clan?.name} size={56} /></div><div className="mt-5 grid grid-cols-3 gap-2 text-center"><div className="rounded-lg bg-slate-900 p-2"><p className={`text-xl font-black ${red?'text-red-400':'text-amber-400'}`}>{clan?.stars || 0}</p><p className="text-[10px] text-slate-500">STARS</p></div><div className="rounded-lg bg-slate-900 p-2"><p className="text-xl font-black text-cyan-400">{Number(clan?.destructionPercentage || 0).toFixed(1)}%</p><p className="text-[10px] text-slate-500">DESTROY</p></div><div className="rounded-lg bg-slate-900 p-2"><p className="text-xl font-black text-emerald-400">{clan?.attacks || 0}</p><p className="text-[10px] text-slate-500">ATTACKS</p></div></div></div>
}

function WarMetric({ icon:Icon,label,value,color }) { return <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5"><Icon size={20} className={color}/><p className="mt-3 text-xs text-slate-500">{label}</p><p className="mt-1 text-2xl font-black">{value}</p></div> }

function WarMemberRow({ member }) { const attacks=member.attacks||[]; const stars=attacks.reduce((sum,a)=>sum+(a.stars||0),0); const destruction=attacks.length?Math.max(...attacks.map(a=>a.destructionPercentage||0)):0; return <tr className="hover:bg-slate-950/50"><td className="px-5 py-4"><span className="grid size-8 place-items-center rounded-lg bg-red-600/15 font-bold text-red-300">{member.mapPosition}</span></td><td className="px-5 py-4"><p className="font-semibold">{member.name}</p><p className="text-xs text-slate-500">{member.tag}</p></td><td className="px-5 py-4"><TownHallBadge level={member.townhallLevel} /></td><td className="px-5 py-4">{attacks.length}/{2}</td><td className="px-5 py-4"><span className="font-black text-amber-400">{stars}</span></td><td className="px-5 py-4">{destruction}%</td><td className="px-5 py-4">{member.opponentAttacks || 0}</td></tr> }

export default function CurrentWarPage({ params }) {
  return (
    <Suspense fallback={<div className="rounded-2xl border border-slate-800 bg-slate-900 p-8 text-slate-400">Loading war details…</div>}>
      <WarDetails params={params} />
    </Suspense>
  )
}
