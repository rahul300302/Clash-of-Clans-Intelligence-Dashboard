'use client'

import { useState } from 'react'
import { Crown, Search, Swords } from 'lucide-react'
import ClanBadge from '@/components/common/clan-badge'

export default function CWL() {
  const [tag,setTag]=useState('#PQGY8GU0')
  const [group,setGroup]=useState(null)
  const [loading,setLoading]=useState(false)
  const [error,setError]=useState('')

  async function load(event){
    event?.preventDefault(); setLoading(true); setError(''); setGroup(null)
    const encoded=encodeURIComponent(tag.trim().startsWith('#')?tag.trim():`#${tag.trim()}`)
    try{const response=await fetch(`/api/clans/${encoded}/cwl`); const data=await response.json(); if(!response.ok)throw new Error(data.error||'CWL data unavailable'); setGroup(data)}catch(err){setError(err.message)}finally{setLoading(false)}
  }

  return <><h1 className="text-3xl font-black">Clan War League</h1><p className="mt-2 text-slate-400">Current league group, clans and war rounds.</p><form onSubmit={load} className="mt-6 flex gap-3"><input value={tag} onChange={e=>setTag(e.target.value)} className="h-12 flex-1 rounded-lg border border-slate-800 bg-slate-900 px-4" placeholder="Clan tag"/><button disabled={loading} className="flex items-center gap-2 rounded-lg bg-red-600 px-6 font-semibold"><Search size={18}/>{loading?'Loading…':'Load CWL'}</button></form>{error&&<div className="mt-6 rounded-2xl border border-red-900 bg-red-950/40 p-4 text-red-300">{error}</div>} {group&&<><div className="mt-6 rounded-3xl border border-amber-500/30 bg-gradient-to-r from-amber-950/40 via-slate-950 to-red-950/30 p-6"><div className="flex items-center gap-3"><Crown className="text-amber-400"/><div><p className="text-xs uppercase text-slate-500">CWL Season</p><p className="mt-1 text-2xl font-black">{group.season}</p></div></div></div><section className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">{(group.clans||[]).map(clan=><div key={clan.tag} className="rounded-2xl border border-slate-800 bg-slate-900 p-5"><div className="flex items-center justify-between"><div><p className="font-bold">{clan.name}</p><p className="text-xs text-slate-500">{clan.tag}</p></div><ClanBadge url={clan.badgeUrls?.small} name={clan.name} size={48} /></div></div>)}</section><section className="mt-6 rounded-2xl border border-slate-800 bg-slate-900 p-6"><h2 className="flex items-center gap-2 font-bold"><Swords className="text-red-400"/>War rounds</h2><div className="mt-4 grid gap-3">{(group.rounds||[]).map((round,index)=><div key={index} className="rounded-xl bg-slate-950 p-4"><p className="text-sm font-semibold">Round {index+1}</p><div className="mt-2 flex flex-wrap gap-2">{(round.warTags||[]).filter(tag=>tag&&tag!=='#0').map(warTag=><a key={warTag} href={`/wars?warTag=${encodeURIComponent(warTag)}`} className="rounded-lg border border-red-500/30 px-3 py-2 text-xs text-red-300">War {warTag}</a>)}</div></div>)}</div></section></>}</>
}
