'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Search, Swords, Trophy } from 'lucide-react'
import { saveSearchHistory } from '@/lib/search-history'

export default function Wars() {
  const [tag, setTag] = useState('#PQGY8GU0')
  const [current, setCurrent] = useState(null)
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const warTag = params.get('warTag')
    if (warTag) loadWarTag(warTag)
  }, [])

  async function loadWarTag(warTag) {
    setLoading(true)
    setError('')
    try {
      const response = await fetch(`/api/wars/${encodeURIComponent(warTag)}`)
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'War unavailable')
      setCurrent(data)
      await saveSearchHistory(warTag, 'war')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  async function loadWars(event) {
    event?.preventDefault()
    setLoading(true)
    setError('')
    setCurrent(null)
    setHistory([])
    try {
      const encoded = encodeURIComponent(tag.trim().startsWith('#') ? tag.trim() : `#${tag.trim()}`)
      const [currentResponse, historyResponse] = await Promise.all([
        fetch(`/api/clans/${encoded}/current-war`),
        fetch(`/api/clans/${encoded}/war-log`),
      ])
      const currentData = await currentResponse.json()
      const historyData = await historyResponse.json()
      if (currentResponse.ok) setCurrent(currentData)
      if (historyResponse.ok) setHistory(historyData.items || [])
      if (!currentResponse.ok && !historyResponse.ok) throw new Error(currentData.error || historyData.error || 'War data unavailable')
      await saveSearchHistory(tag.trim(), 'war')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <h1 className="text-3xl font-black">Clan Wars</h1>
      <p className="mt-2 text-slate-400">Live battles and previous war results.</p>
      <form onSubmit={loadWars} className="mt-6 flex flex-col gap-3 sm:flex-row">
        <input value={tag} onChange={e => setTag(e.target.value)} className="h-12 flex-1 rounded-lg border border-slate-800 bg-slate-900 px-4" placeholder="Clan tag" />
        <button disabled={loading} className="flex h-12 items-center justify-center gap-2 rounded-lg bg-red-600 px-6 font-semibold">
          <Search size={18} />{loading ? 'Loading…' : 'Load wars'}
        </button>
      </form>
      {error && <div className="mt-6 rounded-2xl border border-red-900 bg-red-950/40 p-4 text-red-300">{error}</div>}
      {current && <section className="mt-6 overflow-hidden rounded-3xl border border-red-900/40 bg-gradient-to-r from-red-950/50 via-slate-950 to-amber-950/30 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Swords className="text-red-400" />
            <h2 className="font-bold">Current war · {current.state}</h2>
          </div>
          {tag && <Link href={`/clans/${encodeURIComponent(tag.trim().startsWith('#') ? tag.trim() : `#${tag.trim()}`)}/current-war`} className="rounded-full bg-amber-400 px-4 py-2 text-sm font-black text-black">View battle</Link>}
        </div>
        <div className="mt-6 grid items-center gap-4 md:grid-cols-[1fr_auto_1fr]">
          <WarSide clan={current.clan} />
          <div className="text-center font-black text-amber-400">VS</div>
          <WarSide clan={current.opponent} />
        </div>
      </section>}
      {history.length > 0 && <section className="mt-6 rounded-2xl border border-slate-800 bg-slate-900 p-6">
        <h2 className="flex items-center gap-2 font-bold">
          <Trophy className="text-amber-400" />War history
        </h2>
        <div className="mt-4 divide-y divide-slate-800">
          {history.map((war, index) => <div key={`${war.endTime}-${index}`} className="grid gap-3 py-4 md:grid-cols-[1fr_auto_1fr]">
            <WarSide clan={war.clan} />
            <div className="text-center">
              <p className="font-bold capitalize text-red-300">{war.result || war.state || 'completed'}</p>
              <p className="text-xs text-slate-500">{war.teamSize} vs {war.teamSize}</p>
            </div>
            <WarSide clan={war.opponent} />
          </div>)}
        </div>
      </section>}
    </>
  )
}

function WarSide({ clan }) {
  return <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
    <p className="font-semibold">{clan?.name || 'Unknown clan'}</p>
    <div className="mt-2 flex flex-wrap gap-4 text-sm text-slate-400">
      <span>{clan?.stars || 0} stars</span>
      <span>{Number(clan?.destructionPercentage || 0).toFixed(1)}%</span>
      <span>{clan?.attacks || 0} attacks</span>
    </div>
  </div>
}
