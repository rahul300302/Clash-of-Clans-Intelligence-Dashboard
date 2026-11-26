'use client'

import { useState } from 'react'
import { Hammer, Search, Trophy } from 'lucide-react'

export default function BuilderBase() {
  const [location,setLocation]=useState('global')
  const [resource,setResource]=useState('players')
  const [items,setItems]=useState([])
  const [loading,setLoading]=useState(false)
  const [error,setError]=useState('')

  async function load(event){event?.preventDefault();setLoading(true);setError('');try{const response=await fetch(`/api/builder-base?location=${encodeURIComponent(location)}&resource=${resource}`);const data=await response.json();if(!response.ok)throw new Error(data.error||'Builder Base rankings unavailable');setItems(data.items||[])}catch(err){setError(err.message);setItems([])}finally{setLoading(false)}}

  return <><div className="flex items-center gap-3"><div className="grid size-12 place-items-center rounded-xl border border-cyan-400/30 bg-cyan-500/10"><Hammer className="text-cyan-400"/></div><div><h1 className="text-3xl font-black">Builder Base</h1><p className="mt-1 text-slate-400">Versus trophies and Builder Base rankings.</p></div></div><form onSubmit={load} className="mt-6 flex flex-col gap-3 sm:flex-row"><input value={location} onChange={e=>setLocation(e.target.value)} className="h-12 flex-1 rounded-lg border border-slate-800 bg-slate-900 px-4" placeholder="Location ID or global"/><select value={resource} onChange={e=>setResource(e.target.value)} className="h-12 rounded-lg border border-slate-800 bg-slate-900 px-4"><option value="players">Players</option><option value="clans">Clans</option></select><button disabled={loading} className="flex h-12 items-center justify-center gap-2 rounded-lg bg-cyan-600 px-6 font-semibold text-white"><Search size={18}/>{loading?'Loading…':'Load rankings'}</button></form>{error&&<div className="mt-6 rounded-2xl border border-red-900 bg-red-950/40 p-4 text-red-300">{error}</div>}<div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">{items.map((item,index)=><div key={item.tag||index} className="rounded-2xl border border-slate-800 bg-slate-900 p-5"><div className="flex items-center justify-between"><span className="grid size-9 place-items-center rounded-lg bg-cyan-500/15 font-black text-cyan-300">#{index+1}</span><Trophy className="text-amber-400" size={20}/></div><p className="mt-4 truncate font-bold">{item.name||item.tag}</p><p className="mt-1 text-xs text-slate-500">{item.tag||''}</p><div className="mt-4 grid grid-cols-2 gap-3"><div className="rounded-xl bg-slate-950 p-3"><p className="text-xs text-slate-500">Versus trophies</p><p className="mt-1 text-lg font-black text-cyan-400">{(item.versusTrophies||item.clanVersusPoints||0).toLocaleString()}</p></div><div className="rounded-xl bg-slate-950 p-3"><p className="text-xs text-slate-500">Wins</p><p className="mt-1 text-lg font-black text-amber-400">{item.versusBattleWins?.toLocaleString()||item.versusWins?.toLocaleString()||'—'}</p></div></div></div>)}</div>{!loading&&!error&&!items.length&&<div className="mt-6 rounded-2xl border border-slate-800 bg-slate-900 p-8 text-center text-slate-500">Load Builder Base rankings for a location.</div>}</>
}
