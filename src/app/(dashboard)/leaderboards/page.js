'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Search, Shield, Trophy, Users } from 'lucide-react'
import TownHallBadge from '@/components/common/town-hall-badge'

export default function Leaderboards() {
  const [location, setLocation] = useState('global')
  const [resource, setResource] = useState('clans')
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function load(event) {
    event?.preventDefault()
    setLoading(true)
    setError('')
    try {
      const response = await fetch(`/api/leaderboards?location=${encodeURIComponent(location)}&resource=${resource}`)
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Leaderboard unavailable')
      setItems(data.items || [])
    } catch (err) {
      setError(err.message)
      setItems([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  return (
    <>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-black">Leaderboards</h1>
          <p className="mt-2 text-slate-400">Official clan and player rankings by location.</p>
        </div>
        {items.length > 0 && (
          <span className="w-fit rounded-full border border-red-500/30 bg-red-600/10 px-3 py-1 text-xs font-bold text-red-300">
            {items.length} entries
          </span>
        )}
      </div>

      <form onSubmit={load} className="mt-6 flex flex-col gap-3 sm:flex-row">
        <input
          value={location}
          onChange={(event) => setLocation(event.target.value)}
          className="h-12 flex-1 rounded-lg border border-slate-800 bg-slate-900 px-4"
          placeholder="Location ID or global"
        />
        <select
          value={resource}
          onChange={(event) => setResource(event.target.value)}
          className="h-12 rounded-lg border border-slate-800 bg-slate-900 px-4"
        >
          <option value="clans">Clans</option>
          <option value="players">Players</option>
        </select>
        <button
          disabled={loading}
          className="flex h-12 items-center justify-center gap-2 rounded-lg bg-red-600 px-6 font-semibold"
        >
          <Search size={18} />
          {loading ? 'Loading…' : 'Load ranking'}
        </button>
      </form>

      {error && (
        <div className="mt-6 rounded-xl border border-red-900 bg-red-950/40 p-4 text-red-300">
          {error}
        </div>
      )}

      {loading ? (
        <div className="mt-6 rounded-2xl border border-slate-800 bg-slate-900 p-10 text-center text-slate-400">
          Loading leaderboard…
        </div>
      ) : items.length > 0 ? (
        <div className="mt-6 overflow-hidden rounded-2xl border border-slate-800 bg-slate-900">
          <div className="hidden grid-cols-[4.5rem_1fr_9rem_9rem] px-5 py-3 text-xs uppercase text-slate-500 md:grid">
            <span>Rank</span>
            <span>{resource === 'clans' ? 'Clan' : 'Player'}</span>
            <span className="text-right">
              {resource === 'clans' ? 'Members' : 'Clan'}
            </span>
            <span className="text-right">
              {resource === 'clans' ? 'Clan points' : 'Trophies'}
            </span>
          </div>
          <div className="divide-y divide-slate-800">
            {items.map((item, index) => {
              const tag = item.tag
              const href = resource === 'clans' ? `/clans/${encodeURIComponent(tag)}` : `/players/${encodeURIComponent(tag)}`
              const isClickable = Boolean(tag)
              const value = resource === 'clans' ? (item.clanPoints || 0) : (item.trophies || 0)
              const content = (
                <>
                  <span className="grid size-9 place-items-center rounded-xl bg-red-600/20 font-black text-red-300">
                    {index + 1}
                  </span>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      {resource === 'clans' ? (
                        <Shield size={16} className="shrink-0 text-red-400" />
                      ) : item.townHallLevel ? (
                        <TownHallBadge level={item.townHallLevel} size={40} showLabel={false} />
                      ) : (
                        <Trophy size={16} className="shrink-0 text-amber-400" />
                      )}
                      <p className="truncate font-bold">{item.name}</p>
                    </div>
                    <p className="mt-1 text-xs text-slate-500">{tag || 'Tag unavailable'}</p>
                  </div>
                  <div className="hidden text-right md:block">
                    {resource === 'clans' ? (
                      <span className="inline-flex items-center justify-end gap-1 text-sm text-slate-300">
                        <Users size={14} />
                        {item.members || 0}
                      </span>
                    ) : (
                      <span className="truncate text-sm text-slate-300">{item.clan?.name || 'No clan'}</span>
                    )}
                  </div>
                  <span className="text-right font-black text-amber-400">
                    {value.toLocaleString()}
                  </span>
                  <span className="absolute right-4 top-1/2 hidden -translate-y-1/2 text-xs text-red-300 md:hidden">
                    View profile
                  </span>
                </>
              )

              return isClickable ? (
                <Link
                  href={href}
                  key={tag}
                  className="relative grid grid-cols-[4.5rem_1fr_6.5rem] items-center px-5 py-4 transition hover:bg-slate-950/70 md:grid-cols-[4.5rem_1fr_9rem_9rem]"
                >
                  {content}
                </Link>
              ) : (
                <div key={`${item.name}-${index}`} className="relative grid grid-cols-[4.5rem_1fr_6.5rem] items-center px-5 py-4 md:grid-cols-[4.5rem_1fr_9rem_9rem]">
                  {content}
                </div>
              )
            })}
          </div>
        </div>
      ) : (
        <div className="mt-6 rounded-xl border border-slate-800 bg-slate-900 p-8 text-center text-slate-500">
          No leaderboard entries found.
        </div>
      )}
    </>
  )
}
