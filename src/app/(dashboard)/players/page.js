'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Search, UserRound } from 'lucide-react'
import { saveSearchHistory } from '@/lib/search-history'

export default function Players() {
  const [tag, setTag] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function findPlayer(event) {
    event.preventDefault()
    const normalized = tag.trim().replace(/^#/, '')
    if (!normalized) return
    setLoading(true)
    setError('')
    try {
      const response = await fetch(`/api/players/${encodeURIComponent(`#${normalized}`)}`)
      if (!response.ok) {
        const body = await response.json().catch(() => ({}))
        throw new Error(body.error || 'Player not found')
      }
      await saveSearchHistory(`#${normalized}`, 'player')
      router.push(`/players/${encodeURIComponent(`#${normalized}`)}`)
    } catch (err) {
      setError(err.message)
      setLoading(false)
    }
  }

  return (
    <>
      <h1 className="text-3xl font-bold">Player profiles</h1>
      <p className="mt-2 text-slate-400">Enter a player tag to view real Clash of Clans statistics.</p>
      <form onSubmit={findPlayer} className="mt-6 flex gap-3">
        <div className="relative flex-1"><UserRound className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18}/><input value={tag} onChange={(event) => setTag(event.target.value)} className="h-12 w-full rounded-lg border border-slate-800 bg-slate-900 pl-11 pr-4" placeholder="Player tag, for example #VJQ9RPR" required/></div>
        <button disabled={loading} className="flex items-center gap-2 rounded-lg bg-red-600 px-6 font-semibold hover:bg-red-500 disabled:opacity-60"><Search size={18}/>{loading ? 'Checking…' : 'Find player'}</button>
      </form>
      {error && <div className="mt-6 rounded-xl border border-red-900 bg-red-950/40 p-4 text-red-300">{error}</div>}
    </>
  )
}
