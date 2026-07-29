import { useState, useEffect } from 'react'
import { usePage, router, Link } from '@inertiajs/react'
import Sidebar from './Sidebar'
import TopBar from './TopBar'
import { Toaster, toast } from 'sonner'
import { Eye, LogOut, PauseCircle } from 'lucide-react'


function ImpersonationBanner({ name }) {
  return (
    <div
      className="flex items-center justify-center gap-3 px-4 py-2 text-white text-[12.5px] font-medium shrink-0"
      style={{ background: 'linear-gradient(135deg, rgb(var(--brand-600)) 0%, rgb(var(--brand2-600)) 100%)' }}
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

const SCHEDULED_CHANGE_LABEL = { pause: 'pause', cancel: 'cancel' }

// A scheduled pause/cancel doesn't revoke access early — they keep everything
// they already paid for until the effective date — but they should still see
// it coming from anywhere in the app, not just the Billing page.
function ScheduledChangeBanner({ action, effectiveAt }) {
  const label = SCHEDULED_CHANGE_LABEL[action] || action
  return (
    <div className="flex items-center justify-center gap-3 px-4 py-2 bg-amber-500 text-white text-[12.5px] font-medium shrink-0">
      <PauseCircle size={14} className="shrink-0" />
      <span className="truncate">
        Your plan is set to {label} on <strong className="font-bold">{new Date(effectiveAt).toLocaleDateString()}</strong> — you keep full access until then.
      </span>
      <Link href="/billing" className="rounded-md bg-white/15 hover:bg-white/25 px-2.5 py-1 transition-colors font-semibold shrink-0">
        Manage plan
      </Link>
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

export default function AppLayout({ children, title, noPadding = false, defaultSidebarClosed = false }) {
  const [sidebarOpen, setSidebarOpen] = useState(() => {
    if (defaultSidebarClosed) return false
    return getInitialSidebar()
  })
  const { impersonating, plan } = usePage().props
  const scheduledChange = plan?.subscription?.scheduled_change_action

  useEffect(() => {
    document.body.classList.add('overflow-hidden')
    return () => document.body.classList.remove('overflow-hidden')
  }, [])

  // Paddle's successUrl redirect is a plain browser navigation, not a
  // server-side response — there's no Laravel flash to hook, so the "thanks
  // for subscribing" toast is driven by a ?checkout=success marker instead,
  // stripped from the URL right after so a refresh doesn't re-show it. Lives
  // here (not Dashboard/Billing individually) since checkout can land on
  // either page.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    if (params.get('checkout') !== 'success') return

    toast.success('Payment successful — thanks for subscribing!')
    params.delete('checkout')
    const query = params.toString()
    window.history.replaceState({}, '', window.location.pathname + (query ? `?${query}` : ''))
  }, [])

  const toggleSidebar = () => setSidebarOpen(v => {
    const next = !v
    try { localStorage.setItem('crm_sidebar_open', String(next)) } catch {}
    return next
  })

  return (
    <div className="flex flex-col h-screen overflow-hidden" style={{ background: 'rgb(var(--brand-tint))' }}>
      {impersonating && <ImpersonationBanner name={impersonating.name} />}
      {scheduledChange && (
        <ScheduledChangeBanner action={scheduledChange} effectiveAt={plan.subscription.scheduled_change_at} />
      )}

      <div className="flex flex-1 overflow-hidden min-h-0">
        {/* Mobile backdrop — closes sidebar when tapped outside */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/40 z-40 md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        <Sidebar open={sidebarOpen} onToggle={toggleSidebar} />

        <div className="flex-1 flex flex-col overflow-hidden min-w-0 min-h-0">
          <TopBar title={title} onMenuClick={toggleSidebar} />
          <main
            data-scroll-region
            className={noPadding ? 'flex-1 overflow-hidden flex flex-col min-h-0' : 'flex-1 overflow-y-auto min-h-0 px-4 py-4 sm:px-6 sm:py-5'}
          >
            {children}
          </main>
        </div>
      </div>


      <Toaster position="bottom-right" richColors closeButton expand={false} />
    </div>
  )
}
