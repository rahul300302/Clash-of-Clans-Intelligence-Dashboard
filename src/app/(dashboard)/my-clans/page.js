'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Shield, Trash2, Plus } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

function localClanKey(playerTag) {
  const playerId = playerTag.replace(/^#/, '').toUpperCase()
  return `clanverse-tracked-clans:${playerId}`
}

export default function MyClans() {
  const [clans, setClans] = useState([])
  const [tag, setTag] = useState('')
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')
  const [playerTag, setPlayerTag] = useState('')

  async function load() {
    setLoading(true)
    setMessage('')
    try {
      const sessionResponse = await fetch('/api/player-session')
      const session = await sessionResponse.json()
      if (session.playerTag) {
        setPlayerTag(session.playerTag)
        const saved = JSON.parse(localStorage.getItem(localClanKey(session.playerTag)) || '[]')
        setClans(Array.isArray(saved) ? saved : [])
        setLoading(false)
        return
      }

      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setClans([])
        setLoading(false)
        setMessage('Sign in with your Player Tag and Verification Token to save tracked clans on this device.')
        return
      }
      const { data, error } = await supabase.from('tracked_clans').select('*').eq('user_id', user.id).order('created_at', { ascending: false })
      if (error?.code === 'PGRST205' || error?.message?.includes('Could not find')) {
        setMessage('Database setup incomplete: apply the Supabase migration for tracked_clans.')
      } else if (error) {
        setMessage(error.message)
      } else {
        setClans(data || [])
      }
    } catch (error) {
      setMessage(error.message || 'Unable to load tracked clans.')
    }
    setLoading(false)
  }

  useEffect(() => {
    const timer = window.setTimeout(() => { void load() }, 0)
    return () => window.clearTimeout(timer)
  }, [])

  async function addClan(event) {
    event.preventDefault()
    setMessage('')
    const normalized = tag.trim().toUpperCase().replace(/^#/, '')
    if (!normalized) return

    try {
      const response = await fetch(`/api/clans/${encodeURIComponent(`#${normalized}`)}`)
      const clan = await response.json()
      if (!response.ok) { setMessage(clan.error || 'Clan not found'); return }

      if (playerTag) {
        const next = [clan, ...clans.filter((item) => item.tag !== clan.tag)]
        localStorage.setItem(localClanKey(playerTag), JSON.stringify(next))
        setClans(next)
        setTag('')
        setMessage('Clan saved on this device for your player account.')
        return
      }

      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setMessage('Your player session has expired. Sign in again to save tracked clans.')
        return
      }
      const { error } = await supabase.from('tracked_clans').upsert(
        { user_id: user.id, clan_tag: clan.tag, clan_name: clan.name },
        { onConflict: 'user_id,clan_tag' },
      )
      if (error?.code === 'PGRST205') setMessage('Database setup incomplete: apply the tracked_clans Supabase migration.')
      else if (error) setMessage(error.message)
      else { setTag(''); await load() }
    } catch (error) {
      setMessage(error.message || 'Unable to add this clan.')
    }
  }

  async function removeClan(clan) {
    if (playerTag) {
      const next = clans.filter((item) => item.tag !== clan.tag)
      localStorage.setItem(localClanKey(playerTag), JSON.stringify(next))
      setClans(next)
      setMessage('Clan removed from this device.')
      return
    }
    const supabase = createClient()
    const { error } = await supabase.from('tracked_clans').delete().eq('id', clan.id)
    if (error) setMessage(error.message)
    else await load()
  }

  return (
    <>
      <h1 className="text-3xl font-bold">My Clans</h1>
      <p className="mt-2 text-slate-400">Track clans you want to revisit.</p>
      <form onSubmit={addClan} className="mt-6 flex flex-col gap-3 sm:flex-row"><input value={tag} onChange={(event) => setTag(event.target.value)} className="h-12 flex-1 rounded-lg border border-slate-800 bg-slate-900 px-4" placeholder="Clan tag, for example #2PP"/><button className="flex h-12 items-center justify-center gap-2 rounded-lg bg-red-600 px-5 font-semibold"><Plus size={18}/>Track clan</button></form>
      {message && <p className="mt-3 rounded-xl border border-slate-800 bg-slate-900 p-3 text-sm text-slate-300">{message}</p>}
      {loading ? <div className="mt-6 text-slate-400">Loading tracked clans...</div> : clans.length ? <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">{clans.map((clan) => <div key={clan.tag || clan.id} className="rounded-2xl border border-slate-800 bg-slate-900 p-5"><div className="flex items-start justify-between"><Link href={`/clans/${encodeURIComponent(clan.tag || clan.clan_tag)}`} className="flex items-center gap-3"><Shield className="text-red-400"/><div><p className="font-bold">{clan.name || clan.clan_name || clan.tag}</p><p className="text-xs text-slate-500">{clan.tag || clan.clan_tag}</p></div></Link><button onClick={() => removeClan(clan)} className="rounded-lg p-2 text-slate-500 hover:bg-slate-950 hover:text-red-400" aria-label="Remove clan"><Trash2 size={17}/></button></div></div>)}</div> : <div className="mt-6 rounded-xl border border-slate-800 bg-slate-900 p-8 text-slate-400">No tracked clans yet. Add a clan tag to begin.</div>}
    </>
  )
}
