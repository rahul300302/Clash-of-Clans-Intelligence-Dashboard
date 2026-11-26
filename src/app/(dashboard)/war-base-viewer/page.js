'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { Search, Image as ImageIcon, Upload, Trash2, ZoomIn, ZoomOut, Maximize2, X, Filter, ExternalLink } from 'lucide-react'

export default function WarBaseViewer() {
  const [clanTag, setClanTag] = useState('#PQGY8GU0')
  const [members, setMembers] = useState([])
  const [savedImages, setSavedImages] = useState([])
  const [query, setQuery] = useState('')
  const [townHall, setTownHall] = useState('all')
  const [availability, setAvailability] = useState('all')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [isAdmin, setIsAdmin] = useState(false)
  const [preview, setPreview] = useState(null)
  const [zoom, setZoom] = useState(1)

  useEffect(() => {
    async function loadAdmin() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data } = await supabase.from('profiles').select('is_admin').eq('id', user.id).maybeSingle()
      setIsAdmin(Boolean(data?.is_admin))
    }
    loadAdmin()
  }, [])

  async function loadWar(event) {
    event?.preventDefault()
    setLoading(true)
    setMessage('')
    try {
      const encoded = encodeURIComponent(clanTag.trim().startsWith('#') ? clanTag.trim() : `#${clanTag.trim()}`)
      const [warResponse, imagesResponse] = await Promise.all([
        fetch(`/api/clans/${encoded}/current-war`),
        fetch('/api/war-base-images'),
      ])
      const war = await warResponse.json()
      const images = await imagesResponse.json()
      if (!warResponse.ok) throw new Error(war.error || 'Could not load current war')
      setMembers(war.clan?.members || [])
      setSavedImages(images.items || [])
      if (!(war.clan?.members || []).length) setMessage('No war members are available.')
    } catch (error) {
      setMessage(error.message)
      setMembers([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadWar()
  }, [])

  async function uploadImage(event, member) {
    const file = event.target.files?.[0]
    if (!file) return

    const form = new FormData()
    form.append('file', file)
    form.append('playerTag', member.tag)
    form.append('playerName', member.name)
    form.append('townHallLevel', String(member.townhallLevel))

    setLoading(true)
    setMessage('')
    try {
      const response = await fetch('/api/war-base-images/upload', { method: 'POST', body: form })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Upload failed')
      setMessage('War Base image saved successfully.')
      await loadWar()
    } catch (error) {
      setMessage(error.message)
    } finally {
      setLoading(false)
    }
  }

  async function deleteImage(playerTag) {
    if (!window.confirm('Delete this War Base image?')) return
    setLoading(true)
    setMessage('')
    try {
      const response = await fetch(`/api/war-base-images?playerTag=${encodeURIComponent(playerTag)}`, { method: 'DELETE' })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Delete failed')
      setMessage('War Base image deleted.')
      await loadWar()
    } catch (error) {
      setMessage(error.message)
    } finally {
      setLoading(false)
    }
  }

  const imageMap = new Map(savedImages.map((item) => [item.player_tag, item]))
  const filtered = members.filter((member) => {
    const haystack = `${member.name} ${member.tag}`.toLowerCase()
    const matchesQuery = !query || haystack.includes(query.toLowerCase())
    const matchesTH = townHall === 'all' || String(member.townhallLevel) === townHall
    const matchesAvailability = availability === 'all' || (availability === 'saved' ? imageMap.has(member.tag) : !imageMap.has(member.tag))
    return matchesQuery && matchesTH && matchesAvailability
  })
  const townHalls = [...new Set(members.map((member) => member.townhallLevel).filter(Boolean))].sort((a, b) => b - a)

  async function openFullscreen() {
    const element = document.querySelector('[data-war-base-preview]')
    if (element?.requestFullscreen) await element.requestFullscreen()
  }

  return (
    <>
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-3xl font-black">War Base Viewer</h1>
          <p className="mt-2 text-slate-400">View uploaded war base screenshots for current-war members.</p>
        </div>
        <form onSubmit={loadWar} className="flex gap-3">
          <input value={clanTag} onChange={(event) => setClanTag(event.target.value)} className="h-11 rounded-lg border border-slate-800 bg-slate-900 px-4" placeholder="Clan tag" />
          <button disabled={loading} className="flex h-11 items-center gap-2 rounded-lg bg-red-600 px-5 font-semibold"><Search size={17} />{loading ? 'Loading…' : 'Load war'}</button>
        </form>
      </div>

      <div className="mt-6 flex flex-col gap-3 rounded-2xl border border-slate-800 bg-slate-900 p-4 lg:flex-row">
        <div className="relative flex-1"><Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={17} /><input value={query} onChange={(event) => setQuery(event.target.value)} className="h-11 w-full rounded-lg border border-slate-700 bg-slate-950 pl-10 pr-4" placeholder="Search player name or tag" /></div>
        <label className="flex items-center gap-2 text-sm text-slate-400"><Filter size={16} /><select value={townHall} onChange={(event) => setTownHall(event.target.value)} className="h-11 rounded-lg border border-slate-700 bg-slate-950 px-3"><option value="all">All Town Halls</option>{townHalls.map((level) => <option key={level} value={level}>Town Hall {level}</option>)}</select></label>
        <select value={availability} onChange={(event) => setAvailability(event.target.value)} className="h-11 rounded-lg border border-slate-700 bg-slate-950 px-3"><option value="all">All availability</option><option value="saved">Base uploaded</option><option value="missing">Base missing</option></select>
      </div>

      {message && <div className="mt-4 rounded-xl border border-slate-700 bg-slate-900 p-3 text-sm text-slate-300">{message}</div>}

      {loading ? (
        <div className="mt-6 rounded-2xl border border-slate-800 bg-slate-900 p-10 text-center text-slate-400">Loading war members…</div>
      ) : filtered.length ? (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
          {filtered.map((member) => {
            const saved = imageMap.get(member.tag)
            return (
              <article key={member.tag} className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900">
                <button onClick={() => saved && setPreview(saved)} className="relative block h-44 w-full bg-slate-950 text-left" disabled={!saved}>
                  {saved ? (
                    <img src={saved.signed_url || saved.image_url} alt={`${member.name} War Base`} className="h-full w-full object-cover" />
                  ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-b from-slate-900 to-slate-950 p-3">
                      <img src={`/coc-assets/town-halls/townhall_${member.townhallLevel}.png`} alt={`Town Hall ${member.townhallLevel}`} className="h-[150px] w-[150px] object-contain drop-shadow-[0_14px_18px_rgba(0,0,0,.55)]" />
                      <p className="mt-1 text-xs font-bold uppercase tracking-wider text-slate-400">Town Hall {member.townhallLevel}</p>
                    </div>
                  )}
                </button>
                <div className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <Link href={`/players/${encodeURIComponent(member.tag)}`} className="group min-w-0">
                      <p className="truncate font-bold group-hover:text-red-400">{member.name}</p>
                      <p className="mt-1 flex items-center gap-1 text-xs text-slate-500">{member.tag}<ExternalLink size={11} /></p>
                    </Link>
                    <div className="grid size-12 shrink-0 place-items-center rounded-xl border border-amber-500/30 bg-gradient-to-br from-amber-400/20 to-slate-950 shadow-[0_8px_20px_rgba(245,158,11,.08)]">
                      <div className="text-center">
                        <span className="block text-[8px] font-bold uppercase text-amber-300">TH</span>
                        <span className="block text-lg font-black leading-none text-white">{member.townhallLevel}</span>
                      </div>
                    </div>
                  </div>
                  <div className="mt-3 flex items-center justify-between text-xs text-slate-400"><span>Map position {member.mapPosition}</span><span className={saved ? 'text-emerald-400' : 'text-amber-400'}>{saved ? 'Base uploaded' : 'Upload needed'}</span></div>
                  {isAdmin && (
                    <div className="mt-4 flex gap-2">
                      <label className="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-lg border border-slate-700 px-3 py-2 text-sm hover:border-cyan-500"><Upload size={16} />{saved ? 'Replace' : 'Upload'}<input type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={(event) => uploadImage(event, member)} /></label>
                      {saved && <button onClick={() => deleteImage(member.tag)} className="rounded-lg border border-red-900 px-3 py-2 text-red-300 hover:bg-red-950/40" aria-label="Delete image"><Trash2 size={16} /></button>}
                    </div>
                  )}
                </div>
              </article>
            )
          })}
        </div>
      ) : (
        <div className="mt-6 rounded-2xl border border-slate-800 bg-slate-900 p-10 text-center text-slate-500">No war members match the selected filters.</div>
      )}

      {preview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 p-4">
          <div data-war-base-preview className="relative flex max-h-[92vh] max-w-[96vw] flex-col items-center">
            <button onClick={() => setPreview(null)} className="absolute right-3 top-3 z-10 rounded-full bg-black/70 p-2 text-white"><X /></button>
            <div className="overflow-auto rounded-xl"><img src={preview.signed_url || preview.image_url} alt={`${preview.player_name} War Base`} style={{ transform: `scale(${zoom})`, transformOrigin: 'center' }} className="max-h-[78vh] max-w-[90vw] object-contain transition-transform" /></div>
            <div className="mt-4 flex items-center gap-2 rounded-full bg-slate-950 px-3 py-2"><button onClick={() => setZoom((value) => Math.max(0.5, value - 0.25))} className="rounded-full p-2 hover:bg-slate-800"><ZoomOut size={20} /></button><span className="w-16 text-center text-sm">{Math.round(zoom * 100)}%</span><button onClick={() => setZoom((value) => Math.min(3, value + 0.25))} className="rounded-full p-2 hover:bg-slate-800"><ZoomIn size={20} /></button><button onClick={openFullscreen} className="rounded-full p-2 hover:bg-slate-800"><Maximize2 size={20} /></button></div>
          </div>
        </div>
      )}
    </>
  )
}
