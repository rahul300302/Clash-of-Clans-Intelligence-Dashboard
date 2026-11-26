'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Shield, Users, Trophy, Swords, TrendingUp, Crown, Search, Star, Castle, Target } from 'lucide-react'
import TownHallBadge from '@/components/common/town-hall-badge'

export default function Dashboard() {
  const [mode, setMode] = useState('player')
  const [tag, setTag] = useState('')
  const [clans, setClans] = useState([])
  const [selected, setSelected] = useState(null)
  const [members, setMembers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  async function loadGlobal() {
    setLoading(true)
    setError('')
    setSelected(null)
    setMembers([])
    try {
      const response = await fetch('/api/leaderboards?location=global&resource=clans')
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Unable to load global rankings')
      setClans(data.items || [])
    } catch (err) {
      setError(err.message)
      setClans([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    let cancelled = false
    async function loadHome() {
      setLoading(true)
      try {
        const sessionResponse = await fetch('/api/player-session?includePlayer=1')
        const session = await sessionResponse.json()
        if (session.playerTag) {
          if (!sessionResponse.ok) throw new Error(session.error || 'Unable to load your player profile')
          if (!cancelled) setSelected({ type: 'player', data: session.player })
        } else {
          if (!cancelled) setMode('global')
          await loadGlobal()
        }
      } catch (err) {
        if (!cancelled) setError(err.message)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    loadHome()
    return () => { cancelled = true }
  }, [])

  async function loadSelection(event) {
    event?.preventDefault()
    const normalized = tag.trim().replace(/^#/, '')
    if (!normalized) {
      setError(`Enter a ${mode === 'clan' ? 'clan' : 'player'} tag`)
      return
    }

    setLoading(true)
    setError('')
    setSelected(null)
    setMembers([])

    try {
      if (mode === 'clan') {
        const encoded = encodeURIComponent(`#${normalized}`)
        const [clanResponse, memberResponse] = await Promise.all([
          fetch(`/api/clans/${encoded}`),
          fetch(`/api/clans/${encoded}/members`),
        ])
        const clan = await clanResponse.json()
        const memberData = await memberResponse.json()
        if (!clanResponse.ok) throw new Error(clan.error || 'Clan not found')
        setSelected({ type: 'clan', data: clan })
        setMembers(memberData.items || [])
      } else {
        const encoded = encodeURIComponent(`#${normalized}`)
        const response = await fetch(`/api/players/${encoded}`)
        const player = await response.json()
        if (!response.ok) throw new Error(player.error || 'Player not found')
        setSelected({ type: 'player', data: player })
        setMembers([])
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  function changeMode(nextMode) {
    setMode(nextMode)
    setTag('')
    setError('')
    setSelected(null)
    setMembers([])
    if (nextMode === 'global') loadGlobal()
  }

  const topPoints = clans.slice(0, 10).map((clan) => clan.clanPoints || 0)
  const maxPoints = Math.max(...topPoints, 1)
  const totalMembers = clans.reduce((sum, clan) => sum + (clan.members || 0), 0)

  const clanData = selected?.type === 'clan' ? selected.data : null
  const playerData = selected?.type === 'player' ? selected.data : null

  const memberChart = members.slice(0, 10).map((member) => ({
    name: member.name,
    value: member.trophies || 0,
  }))
  const memberMax = Math.max(...memberChart.map((item) => item.value), 1)

  return (
    <>
      <div className="mb-8 flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
        <div><p className="text-sm font-bold tracking-[0.25em] text-red-400">CLANVERSE COMMAND CENTER</p><h1 className="mt-2 text-3xl font-black sm:text-4xl">Player Details Dashboard</h1><p className="mt-2 text-slate-400">Your player details with global search for players, clans, and game information.</p></div>
        <div className="flex flex-wrap gap-2 rounded-2xl border border-slate-800 bg-slate-900 p-2">
          <FilterButton active={mode === 'global'} onClick={() => changeMode('global')}>Global</FilterButton>
          <FilterButton active={mode === 'clan'} onClick={() => changeMode('clan')}>Clan wise</FilterButton>
          <FilterButton active={mode === 'player'} onClick={() => changeMode('player')}>Player wise</FilterButton>
        </div>
      </div>

      {mode !== 'global' && (
        <form onSubmit={loadSelection} className="mb-6 flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1"><Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18}/><input value={tag} onChange={(event) => setTag(event.target.value)} className="h-12 w-full rounded-xl border border-slate-800 bg-slate-900 pl-11 pr-4 outline-none focus:border-red-500" placeholder={mode === 'clan' ? 'Enter clan tag, for example #PQGY8GU0' : 'Enter player tag, for example #LVPLV999V'} /></div>
          <button disabled={loading} className="h-12 rounded-xl bg-red-600 px-6 font-bold hover:bg-red-500 disabled:opacity-60">{loading ? 'Loading…' : `Load ${mode}`}</button>
        </form>
      )}

      {error && <div className="mb-6 rounded-2xl border border-red-900 bg-red-950/40 p-4 text-red-300">{error}</div>}

      {mode === 'global' && <GlobalDashboard clans={clans} loading={loading} topPoints={topPoints} maxPoints={maxPoints} totalMembers={totalMembers} />}
      {mode === 'clan' && clanData && <ClanDashboard clan={clanData} members={members} memberChart={memberChart} memberMax={memberMax} />}
      {mode === 'player' && playerData && <PlayerDashboard player={playerData} />}

      {!loading && mode !== 'global' && !selected && !error && <div className="rounded-3xl border border-slate-800 bg-slate-900 p-12 text-center text-slate-500">Enter a {mode} tag to load dynamic dashboard statistics.</div>}
    </>
  )
}

function FilterButton({ active, onClick, children }) {
  return <button onClick={onClick} className={`rounded-xl px-4 py-2 text-sm font-bold transition ${active ? 'bg-red-600 text-white shadow-lg shadow-red-950/40' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}>{children}</button>
}

function Metric({ icon: Icon, label, value, accent = 'text-red-400' }) {
  return <div className="clanverse-enter clanverse-card rounded-3xl border border-slate-800 bg-slate-900 p-5"><Icon className={accent} size={22}/><p className="mt-3 text-sm text-slate-400">{label}</p><p className="mt-1 truncate text-2xl font-black">{value}</p></div>
}

function GlobalDashboard({ clans, loading, topPoints, maxPoints, totalMembers }) {
  return <><div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"><Metric icon={Shield} label="Clans ranked" value={loading ? '—' : clans.length} /><Metric icon={Users} label="Combined members" value={loading ? '—' : totalMembers.toLocaleString()} accent="text-cyan-400"/><Metric icon={Trophy} label="Highest clan points" value={loading ? '—' : clans[0]?.clanPoints?.toLocaleString() || '—'} accent="text-amber-400"/><Metric icon={Crown} label="Global leader" value={loading ? '—' : clans[0]?.name || 'Unavailable'} accent="text-violet-400"/></div><section className="mt-6 grid gap-6 xl:grid-cols-[1.55fr_1fr]"><div className="rounded-3xl border border-slate-800 bg-slate-900 p-6"><div className="flex items-center justify-between"><div><p className="text-xs font-bold uppercase tracking-wider text-red-400">Global standings</p><h2 className="mt-1 text-xl font-bold">Top clan points</h2></div><TrendingUp className="text-emerald-400"/></div>{loading?<div className="mt-6 h-52 animate-pulse rounded-xl bg-slate-950"/>:<div className="mt-8 flex h-52 items-end gap-2 sm:gap-3">{topPoints.map((points,index)=><Link href={`/clans/${encodeURIComponent(clans[index].tag)}`} key={clans[index].tag} className="clanverse-bar clanverse-card group relative flex-1 rounded-t-lg bg-gradient-to-t from-red-700 to-amber-400" style={{height:`${Math.max(12,(points/maxPoints)*100)}%`}}><span className="absolute -top-8 left-1/2 hidden -translate-x-1/2 whitespace-nowrap rounded bg-slate-950 px-2 py-1 text-xs text-white group-hover:block">{points.toLocaleString()}</span></Link>)}</div>}</div><div className="rounded-3xl border border-slate-800 bg-slate-900 p-6"><div className="flex items-center justify-between"><h2 className="text-xl font-bold">Global leaders</h2><Trophy className="text-amber-400"/></div><div className="mt-5 space-y-3">{clans.slice(0,7).map((clan,index)=><Link href={`/clans/${encodeURIComponent(clan.tag)}`} key={clan.tag} className="flex items-center justify-between rounded-2xl border border-slate-800 bg-slate-950 p-3 transition hover:border-red-500"><div className="flex min-w-0 items-center gap-3"><span className="grid size-9 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-red-600 to-amber-500 font-black">{index+1}</span><div className="min-w-0"><p className="truncate font-bold">{clan.name}</p><p className="text-xs text-slate-500">{clan.tag} · {clan.members||0} members</p></div></div><span className="ml-3 text-sm font-black text-amber-400">{clan.clanPoints?.toLocaleString()}</span></Link>)}</div></div></section></>
}

function ClanDashboard({ clan, members, memberChart, memberMax }) {
  const [townHallFilter, setTownHallFilter] = useState('all')
  const townHalls = [...new Set(members.map((member) => Number(member.townhallLevel || member.townHallLevel)).filter(Boolean))].sort((a, b) => b - a)
  const filteredMembers = members
    .filter((member) => townHallFilter === 'all' || Number(member.townhallLevel || member.townHallLevel) === Number(townHallFilter))
    .slice()
    .sort((a, b) => (b.trophies || 0) - (a.trophies || 0))

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Metric icon={Shield} label="Clan level" value={clan.clanLevel} />
        <Metric icon={Users} label="Members" value={`${clan.members}/50`} accent="text-cyan-400" />
        <Metric icon={Trophy} label="Clan points" value={clan.clanPoints?.toLocaleString()} accent="text-amber-400" />
        <Metric icon={Swords} label="War wins" value={clan.warWins || 0} accent="text-red-400" />
      </div>

      <section className="mt-6 grid gap-6 xl:grid-cols-[1.55fr_1fr]">
        <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
          <h2 className="text-xl font-bold">Member trophy distribution</h2>
          <div className="mt-8 flex h-52 items-end gap-2">
            {memberChart.map((item, index) => (
              <Link href={`/players/${encodeURIComponent(members[index].tag)}`} key={members[index].tag} aria-label={`${item.name}, ${item.value.toLocaleString()} trophies`} className="clanverse-bar clanverse-card group relative flex-1 rounded-t-lg bg-gradient-to-t from-red-700 to-amber-400" style={{ height: `${Math.max(10, (item.value / memberMax) * 100)}%` }}>
                <span className="absolute -top-14 left-1/2 z-10 hidden -translate-x-1/2 rounded-lg bg-slate-950 px-3 py-2 text-center text-xs shadow-xl group-hover:block"><span className="block max-w-40 truncate font-semibold text-slate-100">{item.name}</span><span className="mt-1 block text-slate-400">{item.value.toLocaleString()} trophies</span></span>
              </Link>
            ))}
          </div>
        </div>

        <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-red-400">Town Hall wise</p>
              <h2 className="mt-1 text-xl font-bold">Top clan members</h2>
            </div>
            <select value={townHallFilter} onChange={(event) => setTownHallFilter(event.target.value)} className="h-10 rounded-lg border border-slate-700 bg-slate-950 px-3 text-sm">
              <option value="all">All Town Halls</option>
              {townHalls.map((level) => <option key={level} value={level}>Town Hall {level}</option>)}
            </select>
          </div>

          <div className="mt-4 max-h-[440px] space-y-2 overflow-y-auto pr-1">
            {filteredMembers.length ? filteredMembers.map((member) => {
              const level = member.townhallLevel || member.townHallLevel
              const roleKey = String(member.role || 'member').toLowerCase().replace(/[\s_-]/g, '')
              const role = {
                leader: { label: 'Leader', style: 'border-amber-400/30 bg-amber-400/10 text-amber-300', icon: Crown },
                coleader: { label: 'Co-leader', style: 'border-violet-400/30 bg-violet-400/10 text-violet-300', icon: Shield },
                admin: { label: 'Elder', style: 'border-cyan-400/30 bg-cyan-400/10 text-cyan-300', icon: Shield },
                elder: { label: 'Elder', style: 'border-cyan-400/30 bg-cyan-400/10 text-cyan-300', icon: Shield },
                member: { label: 'Member', style: 'border-slate-700 bg-slate-900 text-slate-300', icon: Users },
                new: { label: 'New', style: 'border-emerald-400/30 bg-emerald-400/10 text-emerald-300', icon: Users },
              }[roleKey] || { label: member.role || 'Member', style: 'border-slate-700 bg-slate-900 text-slate-300', icon: Users }
              const RoleIcon = role.icon
              return (
                <Link href={`/players/${encodeURIComponent(member.tag)}`} key={member.tag} className="clanverse-card flex items-center justify-between rounded-xl border border-slate-800 bg-slate-950 p-3 hover:border-red-500">
                  <div className="flex min-w-0 items-center gap-3">
                    <TownHallBadge level={level} size={42} showLabel={false} />
                    <div className="min-w-0">
                      <p className="truncate font-bold">{member.name}</p>
                      <span className={`mt-1 inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold ${role.style}`}><RoleIcon size={11}/>{role.label}</span>
                      <p className="text-xs text-slate-500">TH {level} · {member.tag}</p>
                    </div>
                  </div>
                  <span className="ml-3 shrink-0 text-sm font-black text-amber-400">{member.trophies?.toLocaleString()}</span>
                </Link>
              )
            }) : <div className="rounded-xl border border-slate-800 bg-slate-950 p-6 text-center text-sm text-slate-500">No members found for this Town Hall.</div>}
          </div>
        </div>
      </section>
    </>
  )
}

function PlayerDashboard({ player }) {
  const achievements=(player.achievements||[]).filter(item=>item.value>0).sort((a,b)=>b.value-a.value).slice(0,5)
  const chart=[
    {label:'Trophies',value:player.trophies||0,icon:Trophy,accent:'text-amber-400'},
    {label:'Best trophies',value:player.bestTrophies||0,icon:Crown,accent:'text-violet-400'},
    {label:'War stars',value:player.warStars||0,icon:Star,accent:'text-red-400'},
    {label:'Attack wins',value:player.attackWins||0,icon:Swords,accent:'text-cyan-400'},
  ]
  const max=Math.max(...chart.map(item=>item.value),1)
  return <><div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"><Metric icon={Trophy} label="Trophies" value={player.trophies?.toLocaleString()} accent="text-amber-400"/><Metric icon={Shield} label="Town Hall" value={player.townHallLevel}/><Metric icon={Star} label="War stars" value={player.warStars?.toLocaleString()} accent="text-red-400"/><Metric icon={Target} label="Attack wins" value={player.attackWins?.toLocaleString()} accent="text-cyan-400"/></div><section className="mt-6 grid gap-6 xl:grid-cols-[1.55fr_1fr]"><div className="rounded-3xl border border-slate-800 bg-slate-900 p-6"><h2 className="text-xl font-bold">Player performance</h2><div className="mt-6 grid h-64 grid-cols-4 items-stretch gap-3 sm:gap-5">{chart.map(({label,value,icon:Icon,accent})=><div key={label} className="flex min-w-0 flex-col items-center gap-2"><div className={`flex min-h-6 items-center gap-1 text-xs font-bold sm:gap-2 sm:text-sm ${accent}`}><Icon size={16}/><span>{value.toLocaleString()}</span></div><div className="flex w-full flex-1 items-end justify-center rounded-xl bg-slate-950/50 px-2 pt-2"><div className="w-full rounded-t-lg bg-gradient-to-t from-red-700 to-amber-400 transition-[height] duration-500" style={{height:`${value ? Math.max(8,(value/max)*100) : 0}%`}}/></div><p className="min-h-8 text-center text-[10px] leading-tight text-slate-500 sm:text-xs">{label}</p></div>)}</div></div><div className="rounded-3xl border border-slate-800 bg-slate-900 p-6"><h2 className="text-xl font-bold">Achievements</h2><div className="mt-4 space-y-2">{achievements.map(item=><div key={item.name} className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-950 p-3"><p className="text-sm">{item.name}</p><p className="font-black text-amber-400">{item.value?.toLocaleString()}</p></div>)}</div></div></section></>
}
