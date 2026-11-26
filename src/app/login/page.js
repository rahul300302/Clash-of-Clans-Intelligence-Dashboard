'use client'

import { useActionState, useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Info, KeyRound, X } from 'lucide-react'
import { login } from '@/app/actions/auth'

export default function LoginPage() {
  const [state, loginAction, pending] = useActionState(login, null)
  const [tokenHelpOpen, setTokenHelpOpen] = useState(false)

  useEffect(() => {
    if (!tokenHelpOpen) return
    function closeOnEscape(event) {
      if (event.key === 'Escape') setTokenHelpOpen(false)
    }
    window.addEventListener('keydown', closeOnEscape)
    return () => window.removeEventListener('keydown', closeOnEscape)
  }, [tokenHelpOpen])

  return (
    <main className="grid min-h-screen place-items-center bg-slate-950 px-5 text-slate-100">
      <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-8 shadow-2xl">
        <div className="mb-8 text-center"><Link href="/dashboard" aria-label="Go to dashboard" title="Go to dashboard" className="mx-auto grid size-12 place-items-center overflow-hidden rounded-xl transition hover:scale-105 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-400"><Image src="/icon.png" alt="CLASH RX" width={48} height={48} className="size-12 object-cover" priority/></Link><h1 className="mt-4 text-2xl font-bold">Welcome back</h1><p className="mt-1 text-sm text-slate-400">Sign in to CLANVERSE with your player account</p></div>
        <form action={loginAction} className="space-y-4">
          <div><label className="mb-2 block text-sm text-slate-300" htmlFor="playerTag">Player Tag (Player Code)</label><input id="playerTag" name="playerTag" required autoComplete="username" placeholder="#ABC123" className="h-11 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 outline-none focus:border-violet-500"/></div>
          <div>
            <div className="mb-2 flex items-center gap-2">
              <label className="text-sm text-slate-300" htmlFor="token">Verification Token</label>
              <button type="button" onClick={() => setTokenHelpOpen(true)} aria-label="How to find your verification token" title="How to find your verification token" className="rounded-full text-violet-400 transition hover:text-violet-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-400"><Info size={16}/></button>
            </div>
            <input id="token" name="token" required autoComplete="one-time-code" className="h-11 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 outline-none focus:border-violet-500"/>
            <p className="mt-2 text-xs text-slate-500">Generate your verification token in Clash of Clans under &rarr; Settings &rarr; More Settings &rarr; API Token &rarr; Show.</p>
          </div>
          {state?.error && <p className="rounded-lg border border-red-900 bg-red-950/40 px-3 py-2 text-sm text-red-300">{state.error}</p>}
          <button disabled={pending} className="flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-violet-600 font-semibold hover:bg-violet-500 disabled:opacity-60"><KeyRound size={18}/>{pending ? 'Verifying...' : 'Verify and sign in'}</button>
        </form>
        <p className="mt-6 text-center text-sm text-slate-400">Your token is checked securely with the Clash of Clans API.</p>
      </div>
      {tokenHelpOpen && <div className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-black/80 p-4 backdrop-blur-sm" onMouseDown={(event) => { if (event.target === event.currentTarget) setTokenHelpOpen(false) }}><section role="dialog" aria-modal="true" aria-labelledby="token-help-title" className="my-auto w-full max-w-5xl rounded-2xl border border-slate-700 bg-slate-900 p-3 shadow-2xl sm:p-5"><div className="mb-3 flex items-center justify-between gap-3"><h2 id="token-help-title" className="font-bold">How to get your verification token</h2><button type="button" onClick={() => setTokenHelpOpen(false)} aria-label="Close token instructions" className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-slate-100"><X size={20}/></button></div><Image src="/coc-assets/api-token-image/image.png" alt="Instructions for finding the Clash of Clans verification token in Settings and More Settings" width={1536} height={1024} sizes="(max-width: 768px) 100vw, 1200px" className="mx-auto h-auto max-h-[78vh] w-auto max-w-full rounded-lg object-contain" priority/></section></div>}
    </main>
  )
}
