import { useState } from 'react'
import Sidebar from './Sidebar'
import TopBar from './TopBar'
import { Toaster } from 'sonner'

export default function AppLayout({ children, title }) {
  const [sidebarOpen, setSidebarOpen] = useState(true)

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: '#F4F2FF' }}>
      <Sidebar open={sidebarOpen} onToggle={() => setSidebarOpen(v => !v)} />
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        <TopBar title={title} onMenuClick={() => setSidebarOpen(v => !v)} />
        <main className="flex-1 overflow-y-auto px-6 py-5">
          {children}
        </main>
      </div>
      <Toaster position="bottom-right" richColors closeButton expand={false} />
    </div>
  )
}
