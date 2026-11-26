'use client'

import Link from 'next/link'
import { useActionState } from 'react'
import { Globe, UserPlus } from 'lucide-react'
import { register, signInWithGoogle } from '@/app/actions/auth'

export default function RegisterPage() {
  const [state, registerAction, pending] = useActionState(register, null)
  return (
    <main className="grid min-h-screen place-items-center bg-slate-950 px-5 text-slate-100">
      <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-8 shadow-2xl">
        <div className="mb-8 text-center"><div className="mx-auto grid size-12 place-items-center rounded-xl bg-violet-600 font-black">CV</div><h1 className="mt-4 text-2xl font-bold">Create account</h1><p className="mt-1 text-sm text-slate-400">Join CLANVERSE</p></div>
        <form action={registerAction} className="space-y-4">
          <div><label className="mb-2 block text-sm text-slate-300" htmlFor="name">Name</label><input id="name" name="name" required minLength={2} className="h-11 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 outline-none focus:border-violet-500"/></div>
          <div><label className="mb-2 block text-sm text-slate-300" htmlFor="email">Email</label><input id="email" name="email" type="email" required className="h-11 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 outline-none focus:border-violet-500"/></div>
          <div><label className="mb-2 block text-sm text-slate-300" htmlFor="password">Password</label><input id="password" name="password" type="password" required minLength={8} className="h-11 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 outline-none focus:border-violet-500"/></div>
          {state?.error && <p className="rounded-lg border border-red-900 bg-red-950/40 px-3 py-2 text-sm text-red-300">{state.error}</p>}
          {state?.success && <p className="rounded-lg border border-emerald-900 bg-emerald-950/40 px-3 py-2 text-sm text-emerald-300">{state.success}</p>}
          <button disabled={pending} className="flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-violet-600 font-semibold hover:bg-violet-500 disabled:opacity-60"><UserPlus size={18}/>{pending ? 'Creating…' : 'Create account'}</button>
        </form>
        <div className="my-5 flex items-center gap-3 text-xs text-slate-500"><div className="h-px flex-1 bg-slate-800"/>OR<div className="h-px flex-1 bg-slate-800"/></div>
        <form action={signInWithGoogle}><button className="flex h-11 w-full items-center justify-center gap-2 rounded-lg border border-slate-700 bg-white font-semibold text-slate-900 hover:bg-slate-100"><Globe size={18}/>Continue with Google</button></form>
        <p className="mt-6 text-center text-sm text-slate-400">Already have an account? <Link href="/login" className="font-semibold text-violet-400">Sign in</Link></p>
      </div>
    </main>
  )
}
