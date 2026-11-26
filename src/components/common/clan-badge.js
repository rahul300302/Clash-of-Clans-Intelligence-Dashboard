'use client'

import { useEffect, useState } from 'react'

export default function ClanBadge({ url, name = 'Clan', size = 56, className = '' }) {
  const [source, setSource] = useState(url || null)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    setSource(url || null)
    setFailed(false)
  }, [url])

  if (!source || failed) {
    return <div className={`grid shrink-0 place-items-center rounded-full border border-amber-400/30 bg-gradient-to-br from-red-700 to-amber-500 font-black text-white ${className}`} style={{ width: size, height: size, fontSize: Math.max(10, size * 0.24) }}>{name.slice(0, 2).toUpperCase()}</div>
  }

  function handleError() {
    const proxyUrl = `/api/clash-assets/badge?url=${encodeURIComponent(url)}`
    if (source !== proxyUrl) setSource(proxyUrl)
    else setFailed(true)
  }

  return <img src={source} alt={`${name} badge`} width={size} height={size} className={`shrink-0 object-contain ${className}`} onError={handleError} />
}
