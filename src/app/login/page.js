'use client'

import { useActionState } from 'react'
import { KeyRound } from 'lucide-react'
import { login } from '@/app/actions/auth'

export default function LoginPage() {
  const [state, loginAction, pending] = useActionState(login, null)
  return (
    <main className="grid min-h-screen place-items-center bg-slate-950 px-5 text-slate-100">
      <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-8 shadow-2xl">
        <div className="mb-8 text-center"><div className="mx-auto grid size-12 place-items-center rounded-xl bg-violet-600 font-black">CV</div><h1 className="mt-4 text-2xl font-bold">Welcome back</h1><p className="mt-1 text-sm text-slate-400">Sign in to CLANVERSE with your player account</p></div>
        <form action={loginAction} className="space-y-4">
          <div><label className="mb-2 block text-sm text-slate-300" htmlFor="playerTag">Player Tag (Player Code)</label><input id="playerTag" name="playerTag" required autoComplete="username" placeholder="#ABC123" className="h-11 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 outline-none focus:border-violet-500"/></div>
          <div><label className="mb-2 block text-sm text-slate-300" htmlFor="token">Verification Token</label><input id="token" name="token" required autoComplete="one-time-code" className="h-11 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 outline-none focus:border-violet-500"/><p className="mt-2 text-xs text-slate-500">Generate a verification token in Clash of Clans under Settings → More Settings.</p></div>
          {state?.error && <p className="rounded-lg border border-red-900 bg-red-950/40 px-3 py-2 text-sm text-red-300">{state.error}</p>}
          <button disabled={pending} className="flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-violet-600 font-semibold hover:bg-violet-500 disabled:opacity-60"><KeyRound size={18}/>{pending ? 'Verifying…' : 'Verify and sign in'}</button>
        </form>
        <p className="mt-6 text-center text-sm text-slate-400">Your token is checked securely with the Clash of Clans API.</p>
      </div>
    </main>
  )
}
