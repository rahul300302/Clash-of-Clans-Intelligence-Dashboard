'use client'

import { useState } from 'react'

export default function TownHallBadge({ level, size = 52, showLabel = true, className = '' }) {
  const safeLevel = Math.min(20, Math.max(1, Number(level) || 1))
  const [failed, setFailed] = useState(false)

  return (
    <div className={`flex shrink-0 items-center gap-2 ${className}`}>
      {failed ? (
        <div className="grid place-items-center rounded-xl border border-amber-400/30 bg-gradient-to-br from-amber-500/20 to-slate-950 font-black text-amber-300" style={{ width: size, height: size }}>TH {safeLevel}</div>
      ) : (
        <img src={`/coc-assets/town-halls/townhall_${safeLevel}.png`} alt={`Town Hall ${safeLevel}`} width={size} height={size} className="object-contain" onError={() => setFailed(true)} />
      )}
      {showLabel && <span className="text-sm font-bold text-slate-300">TH {safeLevel}</span>}
    </div>
  )
}
