export default function DashboardLoading() {
  return (
    <div role="status" aria-live="polite" aria-busy="true" className="animate-pulse space-y-6">
      <span className="sr-only">Loading page</span>
      <div className="h-9 w-56 rounded-lg bg-slate-900" />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }, (_, index) => <div key={index} className="h-28 rounded-2xl border border-slate-800 bg-slate-900" />)}
      </div>
      <div className="grid gap-6 xl:grid-cols-[1.5fr_1fr]">
        <div className="h-80 rounded-3xl border border-slate-800 bg-slate-900" />
        <div className="h-80 rounded-3xl border border-slate-800 bg-slate-900" />
      </div>
    </div>
  )
}
