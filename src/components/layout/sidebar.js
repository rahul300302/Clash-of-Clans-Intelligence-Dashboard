'use client'

import Link from 'next/link'
import NextImage from 'next/image'
import { LayoutDashboard, Shield, Users, Swords, Crown, Landmark, Trophy, MapPin, Tags, Coins, BarChart3, Settings, Bookmark, Hammer, Image } from 'lucide-react'

const links = [
  ['Dashboard', '/dashboard', LayoutDashboard], ['Clan Explorer', '/clans', Shield], ['My Clans', '/my-clans', Bookmark],
  ['Players', '/players', Users], ['Wars', '/wars', Swords], ['CWL', '/cwl', Crown], ['War Base Viewer', '/war-base-viewer', Image], ['Builder Base', '/builder-base', Hammer], ['Clan Capital', '/capital', Landmark],
  ['Leaderboards', '/leaderboards', Trophy], ['Leagues', '/leagues', Shield], ['Locations', '/locations', MapPin],
  ['Labels', '/labels', Tags], ['Gold Pass', '/goldpass', Coins], ['Analytics', '/analytics', BarChart3], ['Settings', '/settings', Settings],
]

export default function Sidebar() {
  return (
    <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col border-r border-slate-800 bg-slate-950 px-4 py-5 lg:flex">
      <Link href="/dashboard" className="mb-7 flex items-center gap-3 px-2"><NextImage src="/icon.png" alt="CLANVERSE" width={42} height={42} className="rounded-xl"/><span className="text-lg font-bold">CLANVERSE</span></Link>
      <nav className="flex-1 space-y-1 overflow-y-auto">
        {links.map(([label, href, Icon]) => <Link key={href} href={href} className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-slate-400 transition hover:bg-slate-900 hover:text-white"><Icon size={18}/>{label}</Link>)}
      </nav>
    </aside>
  )
}
