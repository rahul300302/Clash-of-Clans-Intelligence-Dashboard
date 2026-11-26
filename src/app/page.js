import Link from 'next/link'

export default function Home() {
  return (
    <main className="grid min-h-screen place-items-center bg-slate-950 px-6 text-slate-100">
      <div className="max-w-xl text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-violet-400">Clash intelligence</p>
        <h1 className="mt-4 text-5xl font-black">CLANVERSE</h1>
        <p className="mt-5 text-lg text-slate-400">Explore clans, players, wars, Clan Capital, leaderboards and historical trends.</p>
        <Link href="/dashboard" className="mt-8 inline-block rounded-lg bg-violet-600 px-6 py-3 font-semibold hover:bg-violet-500">Open dashboard</Link>
      </div>
    </main>
  )
}
