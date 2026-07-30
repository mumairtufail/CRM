import { useState, useEffect } from 'react'
import { usePage, router, Link, Head } from '@inertiajs/react'
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

// Covers both states: scheduled-to-pause (still active, access untouched
// until the date) and actually-paused (access already revoked) — stays
// visible across the whole app for either, with a one-click way back for
// both, since "I can't find how to undo this" is exactly the failure mode
// this replaces.
function SubscriptionBanner({ subscription }) {
  const [resuming, setResuming] = useState(false)
  const isPaused = subscription.status === 'paused'
  const isPausing = subscription.scheduled_change_action === 'pause'

  if (!isPaused && !isPausing) return null

  const resume = () => {
    setResuming(true)
    router.post('/billing/resume', {}, {
      preserveScroll: true,
      onSuccess: () => toast.success(isPaused ? 'Subscription resumed.' : 'Scheduled pause canceled — staying on your current plan.'),
      onError: () => toast.error('Failed to resume subscription.'),
      onFinish: () => setResuming(false),
    })
  }

  return (
    <div className="flex items-center justify-center gap-3 px-4 py-2 bg-amber-500 text-white text-[12.5px] font-medium shrink-0">
      <PauseCircle size={14} className="shrink-0" />
      <span className="truncate">
        {isPaused
          ? 'Your plan is currently paused.'
          : <>Your plan is set to {SCHEDULED_CHANGE_LABEL[subscription.scheduled_change_action]} on <strong className="font-bold">{new Date(subscription.scheduled_change_at).toLocaleDateString()}</strong> — you keep full access until then.</>}
      </span>
      <button
        onClick={resume}
        disabled={resuming}
        className="rounded-md bg-white/15 hover:bg-white/25 px-2.5 py-1 transition-colors font-semibold shrink-0 disabled:opacity-60"
      >
        {resuming ? 'Resuming…' : isPaused ? 'Resume now' : 'Cancel scheduled pause'}
      </button>
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
      {/* Every authenticated route sits behind an auth redirect already, but
          that's an implicit exclusion with no fallback — this is the
          explicit one, so a cached crawl or redirect edge case can't index it. */}
      <Head>
        <meta name="robots" content="noindex, nofollow" />
      </Head>

      {impersonating && <ImpersonationBanner name={impersonating.name} />}
      {plan?.subscription && <SubscriptionBanner subscription={plan.subscription} />}

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
