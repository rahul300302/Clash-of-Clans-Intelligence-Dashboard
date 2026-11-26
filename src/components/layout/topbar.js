'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Bell, Search, Sun, Moon, LogOut, Clock3, Trash2 } from 'lucide-react'
import { logout } from '@/app/actions/auth'
import { clearLocalSearchHistory, getLocalSearchHistory, saveSearchHistory } from '@/lib/search-history'

export default function Topbar() {
  const [query, setQuery] = useState('')
  const [theme, setTheme] = useState('dark')
  const [history, setHistory] = useState([])
  const [historyOpen, setHistoryOpen] = useState(false)
  const [signedIn, setSignedIn] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const saved = localStorage.getItem('clanverse-theme') || 'dark'
    const themeTimer = window.setTimeout(() => setTheme(saved), 0)
    document.documentElement.dataset.theme = saved

    async function loadHistory() {
      setHistory(getLocalSearchHistory())
      try {
        const response = await fetch('/api/search-history')
        const data = await response.json()
        if (response.ok && data.items?.length) {
          setHistory(data.items)
          data.items.forEach((item) => {
            if (typeof window !== 'undefined') {
              const local = getLocalSearchHistory()
              const next = [item, ...local.filter((entry) => !(entry.query === item.query && entry.resource_type === item.resource_type))].slice(0, 20)
              localStorage.setItem('clanverse-search-history', JSON.stringify(next))
            }
          })
        }
      } catch {}
    }

    fetch('/api/player-session').then((response) => response.json()).then((data) => setSignedIn(Boolean(data.signedIn))).catch(() => {})

    loadHistory()
    const refresh = () => setHistory(getLocalSearchHistory())
    window.addEventListener('clanverse-search-history-updated', refresh)
    return () => {
      window.clearTimeout(themeTimer)
      window.removeEventListener('clanverse-search-history-updated', refresh)
    }
  }, [])

  function toggleTheme() {
    const next = theme === 'dark' ? 'light' : 'dark'
    setTheme(next)
    document.documentElement.dataset.theme = next
    localStorage.setItem('clanverse-theme', next)
  }

  async function submitSearch(event) {
    event.preventDefault()
    const value = query.trim()
    if (!value) return
    const normalized = value.replace(/^#/, '')
    if (normalized.length < 12) {
      await saveSearchHistory(value, 'clan')
      router.push(`/clans?query=${encodeURIComponent(normalized)}`)
    } else {
      await saveSearchHistory(value, 'player')
      router.push(`/players/${encodeURIComponent(`#${normalized}`)}`)
    }
  }

  function openHistoryItem(item) {
    if (item.resource_type === 'player') {
      router.push(`/players/${encodeURIComponent(item.query.startsWith('#') ? item.query : `#${item.query}`)}`)
    } else if (item.resource_type === 'war') {
      router.push(`/wars?clanTag=${encodeURIComponent(item.query)}`)
    } else {
      router.push(`/clans?query=${encodeURIComponent(item.query.replace(/^#/, ''))}`)
    }
    setHistoryOpen(false)
  }

  async function clearHistory() {
    clearLocalSearchHistory()
    setHistory([])
    try { await fetch('/api/search-history', { method: 'DELETE' }) } catch {}
  }

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-800 bg-slate-950/90 px-5 backdrop-blur lg:ml-64">
      <div className="relative hidden w-full max-w-md md:block">
        <form onSubmit={submitSearch}><Search className="absolute left-3 top-1/2 z-10 -translate-y-1/2 text-slate-500" size={18}/><input value={query} onChange={(event) => setQuery(event.target.value)} onFocus={() => setHistoryOpen(true)} className="h-10 w-full rounded-lg border border-slate-800 bg-slate-900 pl-10 pr-4 text-sm outline-none focus:border-violet-500" placeholder="Global Search: players, clans, tags…"/></form>
        {historyOpen && history.length > 0 && <div className="absolute left-0 right-0 top-12 overflow-hidden rounded-xl border border-slate-700 bg-slate-950 shadow-2xl"><div className="flex items-center justify-between border-b border-slate-800 px-3 py-2"><span className="text-xs font-bold uppercase text-slate-500">Recent searches</span><button onClick={clearHistory} className="rounded p-1 text-slate-500 hover:text-red-400" title="Clear history"><Trash2 size={14}/></button></div>{history.slice(0, 8).map((item) => <button key={`${item.resource_type}-${item.query}-${item.created_at}`} onClick={() => openHistoryItem(item)} className="flex w-full items-center gap-3 px-3 py-2 text-left text-sm hover:bg-slate-900"><Clock3 size={14} className="text-slate-500"/><span className="min-w-0 flex-1 truncate">{item.query}</span><span className="text-[10px] uppercase text-red-400">{item.resource_type}</span></button>)}</div>}
      </div>
      <div className="ml-auto flex items-center gap-2"><button onClick={toggleTheme} className="rounded-lg p-2 text-slate-400 hover:bg-slate-900" aria-label="Toggle theme">{theme === 'dark' ? <Sun size={20}/> : <Moon size={20}/>}</button><button className="rounded-lg p-2 text-slate-400 hover:bg-slate-900" aria-label="Notifications"><Bell size={20}/></button>{signedIn ? <form action={logout}><button className="flex items-center gap-2 rounded-lg p-2 text-slate-300 hover:bg-slate-900" title="Sign out"><LogOut size={20}/><span className="hidden text-sm sm:block">Sign out</span></button></form> : <Link href="/login" className="rounded-lg bg-violet-600 px-3 py-2 text-sm font-semibold text-white hover:bg-violet-500">Sign in</Link>}</div>
    </header>
  )
}
