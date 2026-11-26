'use client'

import { useState } from 'react'

export default function ClanBadge({ url, name = 'Clan', size = 56, className = '' }) {
  const [failure, setFailure] = useState(null)
  const stage = failure?.url === url ? failure.stage : 0
  const proxyUrl = url ? `/api/clash-assets/badge?url=${encodeURIComponent(url)}` : null
  const source = stage === 1 ? proxyUrl : url

  if (!source || stage === 2) {
    return <div className={`grid shrink-0 place-items-center rounded-full border border-amber-400/30 bg-gradient-to-br from-red-700 to-amber-500 font-black text-white ${className}`} style={{ width: size, height: size, fontSize: Math.max(10, size * 0.24) }}>{name.slice(0, 2).toUpperCase()}</div>
  }

  function handleError() {
    setFailure({ url, stage: stage === 0 ? 1 : 2 })
  }

  return <img src={source} alt={`${name} badge`} width={size} height={size} className={`shrink-0 object-contain ${className}`} onError={handleError} />
}
