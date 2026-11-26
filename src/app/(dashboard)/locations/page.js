'use client'

import { useEffect, useState } from 'react'
import { MapPin } from 'lucide-react'

export default function Locations() {
  const [items,setItems]=useState([]); const [loading,setLoading]=useState(true); const [error,setError]=useState('')
  useEffect(()=>{fetch('/api/locations').then(async r=>{const d=await r.json();if(!r.ok)throw new Error(d.error||'Locations unavailable');setItems(d.items||[])}).catch(e=>setError(e.message)).finally(()=>setLoading(false))},[])
  return (
    <>
      <h1 className="text-3xl font-bold">Locations</h1>
      <p className="mt-2 text-slate-400">Country and regional rankings.</p>
      {loading&&<div className="mt-6 text-slate-400">Loading locations…</div>}
      {error&&<div className="mt-6 rounded-xl border border-red-900 bg-red-950/40 p-4 text-red-300">{error}</div>}
      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {items.map(item=>
          <button key={item.id} onClick={()=>window.location.href=`/leaderboards?location=${item.id}`} className="flex items-center gap-3 rounded-xl border border-slate-800 bg-slate-900 p-4 text-left hover:border-red-500">
            <MapPin className="text-red-400" size={18}/>
            <div>
              <p className="font-semibold">{item.name}</p>
              <p className="text-xs text-slate-500">ID {item.id} · {item.isCountry?'Country':'Region'}</p>
            </div>
          </button>
        )}
      </div>
    </>
  )
}
