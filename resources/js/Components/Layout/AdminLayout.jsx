import { useState } from 'react'
import AdminSidebar from './AdminSidebar'
import TopBar from './TopBar'
import { Toaster } from 'sonner'

function getInitialSidebar() {
  if (typeof window === 'undefined') return true
  if (window.innerWidth < 768) return false
  const stored = localStorage.getItem('crm_sidebar_open')
  return stored === null ? true : stored === 'true'
}

export default function AdminLayout({ children, title }) {
  const [sidebarOpen, setSidebarOpen] = useState(getInitialSidebar)

  const toggleSidebar = () => setSidebarOpen(v => {
    const next = !v
    try { localStorage.setItem('crm_sidebar_open', String(next)) } catch {}
    return next
  })

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: '#F4F2FF' }}>
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <AdminSidebar open={sidebarOpen} onToggle={toggleSidebar} />

      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        <TopBar title={title} onMenuClick={toggleSidebar} />
        <main className="flex-1 overflow-y-auto px-4 py-4 sm:px-6 sm:py-5">
          {children}
        </main>
      </div>

      <Toaster position="bottom-right" richColors closeButton expand={false} />
    </div>
  )
}
