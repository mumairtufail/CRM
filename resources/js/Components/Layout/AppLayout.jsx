import { useState } from 'react'
import { usePage } from '@inertiajs/react'
import Sidebar from './Sidebar'
import TopBar from './TopBar'
import { Toaster } from 'sonner'

export default function AppLayout({ children, title }) {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const { flash } = usePage().props

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <Sidebar open={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        <TopBar title={title} onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
      <Toaster position="top-right" richColors closeButton expand={false} />
    </div>
  )
}
