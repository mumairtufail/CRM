import { useState, useEffect } from 'react'
import Sidebar from './Sidebar'
import TopBar from './TopBar'
import { Toaster } from 'sonner'

export default function AppLayout({ children, title }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  // Open by default on desktop, closed on mobile
  useEffect(() => {
    setSidebarOpen(window.innerWidth >= 768)
  }, [])

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: '#F4F2FF' }}>
      {/* Mobile backdrop — closes sidebar when tapped outside */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <Sidebar open={sidebarOpen} onToggle={() => setSidebarOpen(v => !v)} />

      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        <TopBar title={title} onMenuClick={() => setSidebarOpen(v => !v)} />
        <main className="flex-1 overflow-y-auto px-4 py-4 sm:px-6 sm:py-5">
          {children}
        </main>
      </div>

      <Toaster position="bottom-right" richColors closeButton expand={false} />
    </div>
  )
}
