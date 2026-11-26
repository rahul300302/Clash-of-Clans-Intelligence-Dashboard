'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Search, Shield, Users, Trophy } from 'lucide-react'
import { saveSearchHistory } from '@/lib/search-history'

export default function ClansPage() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function search(event) {
    event.preventDefault()
    setLoading(true)
    setError('')
    try {
      const value = query.trim()
      const url = value.startsWith('#')
        ? `/api/clans/${encodeURIComponent(value)}`
        : `/api/clans?name=${encodeURIComponent(value)}&limit=12`
      const response = await fetch(url)
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Unable to load clans')
      setResults(value.startsWith('#') ? [data] : data.items || [])
      await saveSearchHistory(value, 'clan')
    } catch (err) {
      setError(err.message)
      setResults([])
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <h1 className="text-3xl font-bold">Clan Explorer</h1>
      <form onSubmit={search} className="mt-6 flex gap-3">
        <input value={query} onChange={(event) => setQuery(event.target.value)} required className="h-12 flex-1 rounded-lg border border-slate-800 bg-slate-900 px-4 outline-none focus:border-violet-500" placeholder="Search by clan name or tag (for example #2PP)" />
        <button disabled={loading} className="flex items-center gap-2 rounded-lg bg-violet-600 px-6 font-semibold disabled:opacity-60"><Search size={18}/>{loading ? 'Searching…' : 'Search'}</button>
      </form>
      {error && <div className="mt-6 rounded-xl border border-red-900 bg-red-950/40 p-4 text-red-300">{error}</div>}
      {!loading && results.length === 0 && !error && <div className="mt-8 rounded-xl border border-slate-800 bg-slate-900 p-8 text-center text-slate-400">Search the Clash of Clans API to discover clans.</div>}
      {results.length > 0 && <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">{results.map((clan) => <Link key={clan.tag} href={`/clans/${encodeURIComponent(clan.tag)}`} className="rounded-xl border border-slate-800 bg-slate-900 p-5 transition hover:border-violet-500"><div className="flex items-start justify-between"><div><h2 className="font-bold">{clan.name}</h2><p className="mt-1 text-sm text-slate-500">{clan.tag}</p></div><Shield className="text-violet-400" /></div><div className="mt-5 grid grid-cols-2 gap-3 text-sm"><span className="flex items-center gap-2 text-slate-300"><Users size={15}/>{clan.members}/50</span><span className="flex items-center gap-2 text-slate-300"><Trophy size={15}/>{clan.clanPoints?.toLocaleString()}</span></div></Link>)}</div>}
    </>
  )
}
