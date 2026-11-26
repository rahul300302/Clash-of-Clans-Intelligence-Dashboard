'use client'

import { useEffect, useState } from 'react'
import { Save, Bell, Mail } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

export default function Settings() {
  const [displayName, setDisplayName] = useState('')
  const [playerTag, setPlayerTag] = useState('')
  const [email, setEmail] = useState('')
  const [warAlerts, setWarAlerts] = useState(false)
  const [capitalAlerts, setCapitalAlerts] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [testing, setTesting] = useState(false)
  const [message, setMessage] = useState('')
  const [sessionPlayerTag, setSessionPlayerTag] = useState('')

  async function load() {
    try {
      const sessionResponse = await fetch('/api/player-session')
      const session = await sessionResponse.json()
      if (session.playerTag) {
        setSessionPlayerTag(session.playerTag)
        const response = await fetch('/api/notification-settings')
        const data = await response.json()
        if (!response.ok) throw new Error(data.error || 'Unable to load notification settings.')
        setDisplayName(data.playerName || '')
        setPlayerTag(data.playerTag || session.playerTag)
        setEmail(data.email || '')
        setWarAlerts(data.warAlerts)
        setCapitalAlerts(data.capitalAlerts)
        if (data.migrationRequired) {
          setMessage('Your player profile loaded. Apply supabase/migrations/202611260001_add_player_email_notifications.sql in the Supabase SQL Editor to save email alerts.')
        }
        return
      }

      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const [profileResult, prefsResult] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', user.id).maybeSingle(),
        supabase.from('notification_preferences').select('*').eq('user_id', user.id).maybeSingle(),
      ])
      setDisplayName(profileResult.data?.display_name || user.user_metadata?.display_name || '')
      setPlayerTag(profileResult.data?.coc_player_tag || '')
      setEmail(prefsResult.data?.preferences?.email || user.email || '')
      setWarAlerts(prefsResult.data?.preferences?.warAlerts ?? false)
      setCapitalAlerts(prefsResult.data?.preferences?.capitalAlerts ?? false)
    } catch (error) {
      setMessage(error.message || 'Unable to load settings.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const timer = window.setTimeout(() => { void load() }, 0)
    return () => window.clearTimeout(timer)
  }, [])

  async function save() {
    setMessage('')
    setSaving(true)
    try {
      if (sessionPlayerTag) {
        const response = await fetch('/api/notification-settings', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: email.trim(), warAlerts, capitalAlerts }),
        })
        const data = await response.json()
        if (!response.ok) throw new Error(data.error || 'Unable to save notification settings.')
        setDisplayName(data.playerName || displayName)
        setMessage('Email notifications saved. Alerts are checked every 15 minutes.')
        return
      }

      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setMessage('Sign in to save notification settings.')
        return
      }
      const profileResult = await supabase.from('profiles').update({ display_name: displayName, coc_player_tag: playerTag || null, updated_at: new Date().toISOString() }).eq('id', user.id)
      const prefsResult = await supabase.from('notification_preferences').upsert({ user_id: user.id, preferences: { email: email.trim(), warAlerts, capitalAlerts }, updated_at: new Date().toISOString() }, { onConflict: 'user_id' })
      if (profileResult.error || prefsResult.error) throw new Error(profileResult.error?.message || prefsResult.error?.message)
      setMessage('Settings saved. Email alerts require a verified Player Tag login.')
    } catch (error) {
      setMessage(error.message || 'Unable to save settings.')
    } finally {
      setSaving(false)
    }
  }

  async function sendTest() {
    setMessage('')
    setTesting(true)
    try {
      const response = await fetch('/api/notifications/test', { method: 'POST' })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Unable to send test email.')
      setMessage(`Test email sent to ${data.email}. Check your inbox and spam folder.`)
    } catch (error) {
      setMessage(error.message || 'Unable to send test email.')
    } finally {
      setTesting(false)
    }
  }

  return (
    <>
      <h1 className="text-3xl font-bold">Settings</h1>
      <p className="mt-2 text-slate-400">Manage your CLANVERSE profile and email notifications.</p>
      {loading ? <div className="mt-6 text-slate-400">Loading settings...</div> : (
        <div className="mt-6 grid gap-6 xl:grid-cols-2">
          <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <h2 className="font-bold">Profile</h2>
            <div className="mt-5 space-y-4">
              <label className="block"><span className="mb-2 block text-sm text-slate-400">Display name</span><input value={displayName} readOnly={Boolean(sessionPlayerTag)} onChange={(event) => setDisplayName(event.target.value)} className="h-11 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 read-only:opacity-70" placeholder={sessionPlayerTag ? 'Loading player name...' : 'Your name'}/>{sessionPlayerTag && <span className="mt-1 block text-xs text-slate-500">Filled from your Clash of Clans profile.</span>}</label>
              <label className="block"><span className="mb-2 block text-sm text-slate-400">Clash player tag</span><input value={playerTag} readOnly={Boolean(sessionPlayerTag)} onChange={(event) => setPlayerTag(event.target.value)} className="h-11 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 read-only:opacity-70" placeholder="#PLAYER"/></label>
              <label className="block"><span className="mb-2 flex items-center gap-2 text-sm text-slate-400"><Mail size={15}/>Notification email</span><input type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} className="h-11 w-full rounded-lg border border-slate-700 bg-slate-950 px-3" placeholder="you@example.com"/><span className="mt-1 block text-xs text-slate-500">Add any email address where you want to receive alerts. No phone number is needed.</span></label>
            </div>
          </section>
          <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <h2 className="flex items-center gap-2 font-bold"><Bell size={18} className="text-red-400"/>Email alerts</h2>
            <div className="mt-5 space-y-4"><Toggle label="War alerts" checked={warAlerts} onChange={setWarAlerts}/><Toggle label="Clan Capital alerts" checked={capitalAlerts} onChange={setCapitalAlerts}/></div>
            <p className="mt-4 text-xs text-slate-500">War and new Clan Capital raid alerts are scheduled to be checked every 15 minutes.</p>
          </section>
        </div>
      )}
      <div className="mt-6 flex flex-wrap items-center gap-3"><button disabled={saving || loading} onClick={save} className="flex h-11 items-center gap-2 rounded-lg bg-red-600 px-5 font-semibold disabled:opacity-50"><Save size={18}/>{saving ? 'Saving...' : 'Save changes'}</button>{sessionPlayerTag && <button disabled={testing || loading} onClick={sendTest} className="h-11 rounded-lg border border-slate-700 px-4 text-sm font-semibold disabled:opacity-50">{testing ? 'Sending...' : 'Send test email'}</button>}{message && <p role="status" className="text-sm text-slate-300">{message}</p>}</div>
    </>
  )
}

function Toggle({ label, checked, onChange }) {
  return <label className="flex items-center justify-between rounded-xl bg-slate-950 p-4"><span>{label}</span><input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} className="size-5 accent-red-600"/></label>
}
