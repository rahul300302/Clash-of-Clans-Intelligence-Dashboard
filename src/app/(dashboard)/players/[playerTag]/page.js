import { Suspense } from 'react'
import { connection } from 'next/server'
import { getPlayer } from '@/lib/clash-api/player.service'
import { Trophy, Shield, Star, Swords, Castle } from 'lucide-react'
import TownHallBadge from '@/components/common/town-hall-badge'

async function PlayerContent({ params }) {
  await connection()
  const { playerTag } = await params
  try {
    const player = await getPlayer(playerTag)
    const achievements = (player.achievements || []).filter((item) => item.value > 0).sort((a, b) => b.value - a.value).slice(0, 8)
    return (
      <>
        <div className="overflow-hidden rounded-3xl border border-red-900/50 bg-gradient-to-r from-red-950 via-slate-950 to-amber-950/30 p-6 sm:p-8">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between"><div><p className="text-sm font-bold uppercase tracking-widest text-amber-400">{player.tag}</p><h1 className="mt-2 text-4xl font-black">{player.name}</h1><p className="mt-3 text-slate-300">{player.role ? `${player.role} · ` : ''}{player.clan?.name || 'No clan'}</p></div><div className="grid size-24 place-items-center rounded-3xl border-2 border-amber-400/40 bg-black/30"><Shield size={48} className="text-red-400"/></div></div>
        </div>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
          <Stat icon={Trophy} label="Trophies" value={player.trophies?.toLocaleString()} /><Stat icon={Shield} label="Town Hall" value={<TownHallBadge level={player.townHallLevel} size={52} />} /><Stat icon={Star} label="War stars" value={player.warStars?.toLocaleString()} /><Stat icon={Swords} label="Attack wins" value={player.attackWins?.toLocaleString()} /><Stat icon={Castle} label="Capital" value={player.clanCapitalPoints?.toLocaleString() || '0'} />
        </div>
        <div className="mt-6 grid gap-6 xl:grid-cols-[1.4fr_1fr]"><section className="rounded-2xl border border-slate-800 bg-slate-900 p-6"><h2 className="font-bold">Best and current trophies</h2><div className="mt-5 grid grid-cols-2 gap-4"><Metric label="Current trophies" value={player.trophies}/><Metric label="Best trophies" value={player.bestTrophies}/></div><h3 className="mt-7 text-sm font-semibold text-slate-300">Achievements</h3><div className="mt-3 divide-y divide-slate-800">{achievements.map((item) => <div key={item.name} className="flex items-center justify-between py-3"><span className="text-sm">{item.name}</span><span className="text-sm font-bold text-amber-400">{item.value?.toLocaleString()}</span></div>)}</div></section><section className="rounded-2xl border border-slate-800 bg-slate-900 p-6"><h2 className="font-bold">Troops and heroes</h2><div className="mt-4 space-y-3">{(player.heroes || []).map((hero) => <div key={hero.name} className="flex items-center justify-between rounded-xl bg-slate-950 p-3"><span>{hero.name}</span><span className="rounded-full bg-red-600/20 px-3 py-1 text-sm text-red-300">Level {hero.level}</span></div>)}</div></section></div>
      </>
    )
  } catch (error) {
    return <><h1 className="text-3xl font-black">Player unavailable</h1><div className="mt-6 rounded-2xl border border-red-900 bg-red-950/40 p-5 text-red-300">{error.message}</div></>
  }
}

function Stat({ icon: Icon, label, value }) { return <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5"><Icon className="text-red-400" size={20}/><p className="mt-3 text-sm text-slate-400">{label}</p><div className="mt-1 text-2xl font-bold">{value ?? '—'}</div></div> }
function Metric({ label, value }) { return <div className="rounded-xl bg-slate-950 p-4"><p className="text-xs text-slate-500">{label}</p><p className="mt-2 text-2xl font-bold text-red-400">{value?.toLocaleString() ?? '—'}</p></div> }

export default function PlayerDetails({ params }) { return <Suspense fallback={<div className="rounded-2xl border border-slate-800 bg-slate-900 p-8">Loading player…</div>}><PlayerContent params={params}/></Suspense> }
