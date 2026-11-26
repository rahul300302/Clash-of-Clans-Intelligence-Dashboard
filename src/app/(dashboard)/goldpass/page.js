'use client'

import { useEffect, useState } from 'react'
import { Coins, CalendarDays, Clock3 } from 'lucide-react'

export default function GoldPass() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetch('/api/goldpass')
      .then(async (response) => {
        const result = await response.json()
        if (!response.ok) throw new Error(result.error || 'Gold Pass unavailable')
        setData(result)
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  return (
    <>
      <h1 className="text-3xl font-black">Gold Pass</h1>
      <p className="mt-2 text-slate-400">Current official season information.</p>
      {loading && <div className="mt-6 animate-pulse rounded-3xl border border-slate-800 bg-slate-900 p-8 text-slate-400">Loading current season…</div>}
      {error && <div className="mt-6 rounded-2xl border border-red-900 bg-red-950/40 p-4 text-red-300">{error}</div>}
      {data && (
        <div className="mt-6 overflow-hidden rounded-3xl border border-amber-500/40 bg-gradient-to-br from-amber-950/50 via-slate-950 to-red-950/30 p-6 sm:p-8">
          <div className="flex items-center gap-4"><div className="grid size-14 place-items-center rounded-2xl bg-amber-400 text-slate-950"><Coins size={28} /></div><div><p className="text-xs font-bold uppercase tracking-widest text-amber-400">Official current season</p><h2 className="mt-1 text-3xl font-black">{data.seasonMonth || 'Gold Pass Season'}</h2></div></div>
          <div className="mt-7 grid gap-4 md:grid-cols-3">
            <Detail icon={CalendarDays} label="Season month" value={data.seasonMonth || 'N/A'} />
            <Detail icon={Clock3} label="Starts" value={formatApiTime(data.startTime)} />
            <Detail icon={Clock3} label="Ends" value={formatApiTime(data.endTime)} />
          </div>
          {!data.startTime && !data.endTime && <p className="mt-5 rounded-xl bg-slate-950/60 p-4 text-sm text-slate-400">The API has not supplied season timestamps. It may be between seasons or the endpoint may not expose additional schedule details.</p>}
        </div>
      )}
    </>
  )
}

function Detail({ icon: Icon, label, value }) {
  return <div className="rounded-2xl border border-amber-500/20 bg-slate-950/70 p-5"><Icon className="text-amber-400" size={20} /><p className="mt-3 text-xs uppercase text-slate-500">{label}</p><p className="mt-1 font-bold">{value}</p></div>
}

function formatApiTime(value) {
  if (!value) return 'N/A'
  const match = String(value).match(/^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})\.\d{3}Z$/)
  if (!match) return value
  const [, year, month, day, hour, minute] = match
  const date = new Date(Date.UTC(Number(year), Number(month) - 1, Number(day), Number(hour), Number(minute)))
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString()
}
