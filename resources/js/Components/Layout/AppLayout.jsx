import { useState } from 'react'
import { usePage, router } from '@inertiajs/react'
import Sidebar from './Sidebar'
import TopBar from './TopBar'
import { Toaster } from 'sonner'
import { Eye, LogOut } from 'lucide-react'

function ImpersonationBanner({ name }) {
  return (
    <div
      className="flex items-center justify-center gap-3 px-4 py-2 text-white text-[12.5px] font-medium shrink-0"
      style={{ background: 'linear-gradient(135deg, #7C3AED 0%, #4F46E5 100%)' }}
    >
      <Eye size={14} className="shrink-0" />
      <span className="truncate">
        Viewing as <strong className="font-bold">{name}</strong> (impersonating)
      </span>
      <button
        onClick={() => router.post('/impersonate/leave')}
        className="flex items-center gap-1.5 rounded-md bg-white/15 hover:bg-white/25 px-2.5 py-1 transition-colors font-semibold shrink-0"
      >
        <LogOut size={12} /> Exit
      </button>
    </div>
  )
}

// Compute the initial state synchronously so the sidebar never animates
// from closed → open on mount (which caused a "collapse then open" flash
// on every page navigation, since each page mounts its own AppLayout).
function getInitialSidebar() {
  if (typeof window === 'undefined') return true
  if (window.innerWidth < 768) return false // mobile: always start closed
  const stored = localStorage.getItem('crm_sidebar_open')
  return stored === null ? true : stored === 'true'
}

export default function AppLayout({ children, title }) {
  const [sidebarOpen, setSidebarOpen] = useState(getInitialSidebar)
  const { impersonating } = usePage().props

  const toggleSidebar = () => setSidebarOpen(v => {
    const next = !v
    try { localStorage.setItem('crm_sidebar_open', String(next)) } catch {}
    return next
  })

  return (
    <div className="flex flex-col h-screen overflow-hidden" style={{ background: '#F4F2FF' }}>
      {impersonating && <ImpersonationBanner name={impersonating.name} />}

      <div className="flex flex-1 overflow-hidden">
        {/* Mobile backdrop — closes sidebar when tapped outside */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/40 z-40 md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        <Sidebar open={sidebarOpen} onToggle={toggleSidebar} />

        <div className="flex-1 flex flex-col overflow-hidden min-w-0">
          <TopBar title={title} onMenuClick={toggleSidebar} />
          <main className="flex-1 overflow-y-auto px-4 py-4 sm:px-6 sm:py-5">
            {children}
          </main>
        </div>
      </div>

      <Toaster position="bottom-right" richColors closeButton expand={false} />
    </div>
  )
}
