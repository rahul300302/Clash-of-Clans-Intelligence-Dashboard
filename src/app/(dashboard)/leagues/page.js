'use client'

import { useEffect, useState } from 'react'

export default function Leagues() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetch('/api/leagues')
      .then(async (r) => {
        const d = await r.json()
        if (!r.ok) throw new Error(d.error || 'Leagues unavailable')
        setItems(d.items || [])
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  return (
    <>
      <h1 className="text-3xl font-bold">Leagues</h1>
      <p className="mt-2 text-slate-400">Official Clash league divisions.</p>
      {loading && <div className="mt-6 text-slate-400">Loading leagues…</div>}
      {error && (
        <div className="mt-6 rounded-xl border border-red-900 bg-red-950/40 p-4 text-red-300">
          {error}
        </div>
      )}
      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {items.map((item) => (
          <div
            key={item.id}
            className="rounded-xl border border-slate-800 bg-slate-900 p-5"
          >
            <p className="font-bold">{item.name}</p>
            <p className="mt-1 text-xs text-slate-500">League ID {item.id}</p>
          </div>
        ))}
      </div>
    </>
  )
}
