'use client'

import { useState } from 'react'
import { Landmark, Search } from 'lucide-react'

export default function Capital() {
  const [tag, setTag] = useState('#PQGY8GU0')
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function load(event) {
    event.preventDefault()
    setLoading(true); setError('')
    try {
      const encoded = encodeURIComponent(tag.trim().startsWith('#') ? tag.trim() : `#${tag.trim()}`)
      const response = await fetch(`/api/clans/${encoded}/capital-raids`)
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Raid data unavailable')
      setItems(data.items || [])
    } catch (err) { setError(err.message); setItems([]) }
    finally { setLoading(false) }
  }

  return (
    <>
      <h1 className="text-3xl font-bold">Clan Capital</h1><p className="mt-2 text-slate-400">Raid seasons and district performance.</p>
      <form onSubmit={load} className="mt-6 flex gap-3"><input value={tag} onChange={(event) => setTag(event.target.value)} className="h-12 flex-1 rounded-lg border border-slate-800 bg-slate-900 px-4" placeholder="Clan tag"/><button disabled={loading} className="flex items-center gap-2 rounded-lg bg-red-600 px-6 font-semibold"><Search size={18}/>{loading ? 'Loading…' : 'Load raids'}</button></form>
      {error && <div className="mt-6 rounded-xl border border-red-900 bg-red-950/40 p-4 text-red-300">{error}</div>}
      <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">{items.map((raid, index) => <div key={`${raid.endTime}-${index}`} className="rounded-2xl border border-slate-800 bg-slate-900 p-5"><div className="flex items-center justify-between"><Landmark className="text-amber-400"/><span className="text-xs text-slate-500">{raid.state}</span></div><p className="mt-4 text-2xl font-black">{raid.offensiveLoot?.toLocaleString() || 0}</p><p className="text-sm text-slate-400">Offensive loot</p><div className="mt-4 grid grid-cols-2 gap-3 text-sm"><span>Attacks: {raid.attackCount || 0}</span><span>Raids: {raid.raidsCompleted || 0}</span></div></div>)}</div>
      {!loading && !error && !items.length && <div className="mt-6 rounded-xl border border-slate-800 bg-slate-900 p-8 text-center text-slate-500">Enter a valid clan tag to view capital raid history.</div>}
    </>
  )
}
