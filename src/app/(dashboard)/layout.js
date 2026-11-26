import Sidebar from '@/components/layout/sidebar'
import Topbar from '@/components/layout/topbar'

export default function DashboardLayout({ children }) {
  return <div className="min-h-screen bg-slate-950 text-slate-100"><Sidebar/><Topbar/><main className="min-h-[calc(100vh-4rem)] p-5 lg:ml-64 lg:p-8">{children}</main></div>
}
