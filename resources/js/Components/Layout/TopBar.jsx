import {
  Menu, Bell, Search, ChevronDown, User, LogOut, Check,
  Share2, ExternalLink, Copy, X,
  LayoutDashboard, Users, UserPlus, Kanban, Mail, Upload, Tag, FileText, Settings,
} from 'lucide-react'
import { usePage, Link, router } from '@inertiajs/react'
import { useState, useRef, useEffect, useMemo } from 'react'
import { formatDistanceToNow } from 'date-fns'
import { toast } from 'sonner'

// Searchable app destinations.
const PAGES = [
  { label: 'Dashboard',     href: '/',                 keywords: 'home overview stats',        icon: LayoutDashboard },
  { label: 'Leads',         href: '/leads',            keywords: 'contacts people customers',  icon: Users },
  { label: 'Add Lead',      href: '/leads/create',     keywords: 'new create lead contact',    icon: UserPlus },
  { label: 'Pipeline',      href: '/pipeline',         keywords: 'kanban deals stages board',  icon: Kanban },
  { label: 'Campaigns',     href: '/campaigns',        keywords: 'email marketing blast',      icon: Mail },
  { label: 'New Campaign',  href: '/campaigns/create', keywords: 'create email blast',         icon: Mail },
  { label: 'Invoices',      href: '/invoices',         keywords: 'billing payments money',     icon: FileText },
  { label: 'New Invoice',   href: '/invoices/create',  keywords: 'create bill invoice',        icon: FileText },
  { label: 'Import',        href: '/import',           keywords: 'csv upload sheets',          icon: Upload },
  { label: 'Tags',          href: '/tags',             keywords: 'labels categories',          icon: Tag },
  { label: 'Settings',      href: '/profile',          keywords: 'profile account workspace smtp mail', icon: Settings },
]

function timeAgo(iso) {
  try { return formatDistanceToNow(new Date(iso), { addSuffix: true }) } catch { return '' }
}

export default function TopBar({ title, onMenuClick }) {
  const { auth, organization, notifications } = usePage().props
  const user     = auth?.user
  const initial  = user?.name?.charAt(0)?.toUpperCase() ?? 'A'
  const name     = user?.name ?? 'User'
  const email    = user?.email ?? ''

  const unread = notifications?.unread ?? 0
  const items  = notifications?.items ?? []

  // Dropdown open states
  const [userOpen, setUserOpen]   = useState(false)
  const [notifOpen, setNotifOpen] = useState(false)
  const [formOpen, setFormOpen]   = useState(false)

  // Search state
  const [query, setQuery]       = useState('')
  const [searchOpen, setSearchOpen] = useState(false)   // mobile panel
  const [highlight, setHighlight]   = useState(0)

  const userRef   = useRef(null)
  const notifRef  = useRef(null)
  const formRef   = useRef(null)
  const searchRef = useRef(null)

  // Close any open dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (userRef.current && !userRef.current.contains(e.target)) setUserOpen(false)
      if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false)
      if (formRef.current && !formRef.current.contains(e.target)) setFormOpen(false)
      if (searchRef.current && !searchRef.current.contains(e.target)) setSearchOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  // Close everything on navigation
  useEffect(() => {
    const off = router.on('finish', () => {
      setUserOpen(false); setNotifOpen(false); setFormOpen(false); setSearchOpen(false)
    })
    return off
  }, [])

  const results = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return []
    return PAGES.filter(p =>
      p.label.toLowerCase().includes(q) || p.keywords.includes(q)
    ).slice(0, 6)
  }, [query])

  useEffect(() => { setHighlight(0) }, [query])

  const signOut = () => router.post(route('logout'))

  const go = (href) => {
    setQuery('')
    setSearchOpen(false)
    router.visit(href)
  }

  const onSearchKeyDown = (e) => {
    if (!results.length) return
    if (e.key === 'ArrowDown') { e.preventDefault(); setHighlight(h => Math.min(h + 1, results.length - 1)) }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setHighlight(h => Math.max(h - 1, 0)) }
    else if (e.key === 'Enter') { e.preventDefault(); go(results[highlight].href) }
    else if (e.key === 'Escape') { setQuery(''); e.target.blur() }
  }

  const markAllRead = () => {
    if (!unread) return
    router.post('/notifications/read-all', {}, { preserveScroll: true, preserveState: true })
  }

  const openNotification = (n) => {
    setNotifOpen(false)
    router.post(`/notifications/${n.id}/read`, {}, {
      preserveScroll: true,
      onSuccess: () => { if (n.link) router.visit(n.link) },
    })
  }

  const formUrl = organization ? `/intake/${organization.slug}` : null
  const copyFormLink = () => {
    if (!formUrl) return
    const abs = `${window.location.origin}${formUrl}`
    navigator.clipboard?.writeText(abs)
      .then(() => toast.success('Form link copied'))
      .catch(() => toast.error('Could not copy link'))
    setFormOpen(false)
  }

  // Shared suggestion list renderer
  const Suggestions = ({ onPick }) => (
    results.length === 0 ? (
      <div className="px-4 py-6 text-center text-[12.5px] text-slate-400">No pages found</div>
    ) : (
      <div className="p-1.5">
        {results.map((p, i) => {
          const Icon = p.icon
          return (
            <button
              key={p.href}
              onMouseEnter={() => setHighlight(i)}
              onClick={() => onPick(p.href)}
              className={`flex items-center gap-2.5 w-full px-3 py-2 rounded-[8px] text-left transition-colors ${
                i === highlight ? 'bg-violet-50 text-violet-700' : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              <Icon size={14} className={i === highlight ? 'text-violet-500' : 'text-slate-400'} />
              <span className="text-[12.5px] font-medium">{p.label}</span>
              <span className="ml-auto text-[10px] text-slate-300">{p.href}</span>
            </button>
          )
        })}
      </div>
    )
  )

  return (
    <header
      className="h-[60px] flex items-center justify-between px-3 sm:px-5 shrink-0 z-10"
      style={{
        background:    'rgba(255,255,255,0.88)',
        backdropFilter:'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderBottom:  '1px solid rgba(0,0,0,0.055)',
      }}
    >
      {/* Left */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={onMenuClick}
          className="p-2 rounded-[9px] hover:bg-black/[0.05] transition-colors"
          aria-label="Toggle sidebar"
        >
          <Menu size={16} className="text-slate-500" />
        </button>

        {title && (
          <h1 className="font-semibold text-slate-800 text-[14.5px] tracking-tight truncate">{title}</h1>
        )}
      </div>

      {/* Right */}
      <div className="flex items-center gap-1.5">
        {/* Desktop search */}
        <div className="hidden md:block relative" ref={searchRef}>
          <div
            className="flex items-center gap-2 rounded-[9px] px-3 h-8 w-52 transition-all"
            style={{ background: 'rgba(0,0,0,0.04)', border: '1px solid rgba(0,0,0,0.06)' }}
          >
            <Search size={12} className="text-slate-400 shrink-0" />
            <input
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={onSearchKeyDown}
              placeholder="Search pages..."
              className="text-xs bg-transparent outline-none text-slate-600 placeholder:text-slate-400 w-full"
            />
            {query && (
              <button onClick={() => setQuery('')} className="shrink-0 text-slate-400 hover:text-slate-600">
                <X size={12} />
              </button>
            )}
          </div>
          {query && (
            <div className="absolute right-0 top-full mt-2 w-72 rounded-xl overflow-hidden z-50 bg-white"
              style={{ border: '1px solid rgba(0,0,0,0.08)', boxShadow: '0 8px 32px rgba(0,0,0,0.12)' }}>
              <Suggestions onPick={go} />
            </div>
          )}
        </div>

        {/* Mobile search trigger */}
        <div className="md:hidden relative" ref={searchRef}>
          <button
            onClick={() => setSearchOpen(o => !o)}
            className="p-2 rounded-[9px] hover:bg-black/[0.05] transition-colors"
            aria-label="Search"
          >
            <Search size={15} className="text-slate-500" />
          </button>
          {searchOpen && (
            <div className="fixed left-3 right-3 top-[64px] rounded-xl overflow-hidden z-50 bg-white"
              style={{ border: '1px solid rgba(0,0,0,0.08)', boxShadow: '0 8px 32px rgba(0,0,0,0.12)' }}>
              <div className="flex items-center gap-2 px-3 h-11 border-b border-slate-100">
                <Search size={14} className="text-slate-400 shrink-0" />
                <input
                  autoFocus
                  type="text"
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  onKeyDown={onSearchKeyDown}
                  placeholder="Search pages..."
                  className="text-[13px] bg-transparent outline-none text-slate-700 placeholder:text-slate-400 w-full"
                />
              </div>
              {query && <Suggestions onPick={go} />}
            </div>
          )}
        </div>

        {/* Lead-form link (tenant only) */}
        {organization && (
          <div className="relative" ref={formRef}>
            <button
              onClick={() => setFormOpen(o => !o)}
              className="p-2 rounded-[9px] hover:bg-black/[0.05] transition-colors"
              aria-label="Public lead form"
              title="Your public lead form"
            >
              <Share2 size={15} className="text-slate-500" />
            </button>
            {formOpen && (
              <div className="absolute right-0 top-full mt-2 w-60 rounded-xl overflow-hidden z-50 bg-white"
                style={{ border: '1px solid rgba(0,0,0,0.08)', boxShadow: '0 8px 32px rgba(0,0,0,0.12)' }}>
                <div className="px-4 py-3 border-b border-slate-100">
                  <p className="text-[12.5px] font-semibold text-slate-800">Public lead form</p>
                  <p className="text-[11px] text-slate-400 truncate mt-0.5">{formUrl}</p>
                </div>
                <div className="p-1">
                  <a
                    href={formUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => setFormOpen(false)}
                    className="flex items-center gap-2.5 w-full px-3 py-2 rounded-[8px] text-[12.5px] text-slate-700 hover:bg-slate-50 transition-colors"
                  >
                    <ExternalLink size={13} className="text-slate-400" /> Open form
                  </a>
                  <button
                    onClick={copyFormLink}
                    className="flex items-center gap-2.5 w-full px-3 py-2 rounded-[8px] text-[12.5px] text-slate-700 hover:bg-slate-50 transition-colors"
                  >
                    <Copy size={13} className="text-slate-400" /> Copy link
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Notifications */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setNotifOpen(o => !o)}
            className="relative p-2 rounded-[9px] hover:bg-black/[0.05] transition-colors"
            aria-label="Notifications"
          >
            <Bell size={15} className="text-slate-500" />
            {unread > 0 && (
              <span
                className="absolute -top-0.5 -right-0.5 min-w-[15px] h-[15px] px-1 rounded-full text-white text-[9px] font-bold flex items-center justify-center border border-white"
                style={{ background: 'linear-gradient(135deg, #7C3AED, #4F46E5)' }}
              >
                {unread > 9 ? '9+' : unread}
              </span>
            )}
          </button>

          {notifOpen && (
            <div className="absolute right-0 top-full mt-2 w-[330px] max-w-[calc(100vw-24px)] rounded-xl overflow-hidden z-50 bg-white"
              style={{ border: '1px solid rgba(0,0,0,0.08)', boxShadow: '0 8px 32px rgba(0,0,0,0.12)' }}>
              <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
                <p className="text-[12.5px] font-semibold text-slate-800">
                  Notifications {unread > 0 && <span className="text-violet-600">({unread})</span>}
                </p>
                {unread > 0 && (
                  <button onClick={markAllRead}
                    className="flex items-center gap-1 text-[11px] font-semibold text-violet-600 hover:text-violet-700">
                    <Check size={12} /> Mark all read
                  </button>
                )}
              </div>

              <div className="max-h-[340px] overflow-y-auto">
                {items.length === 0 ? (
                  <div className="px-4 py-10 text-center">
                    <Bell size={22} className="text-slate-200 mx-auto mb-2" />
                    <p className="text-[12.5px] text-slate-400">You're all caught up.</p>
                  </div>
                ) : (
                  items.map(n => (
                    <button
                      key={n.id}
                      onClick={() => openNotification(n)}
                      className={`flex items-start gap-2.5 w-full px-4 py-3 text-left border-b border-slate-50 transition-colors hover:bg-slate-50 ${
                        n.read_at ? '' : 'bg-violet-50/40'
                      }`}
                    >
                      <span className={`mt-1.5 w-2 h-2 rounded-full shrink-0 ${n.read_at ? 'bg-transparent' : 'bg-violet-500'}`} />
                      <div className="min-w-0 flex-1">
                        <p className="text-[12.5px] font-semibold text-slate-700 truncate">{n.title}</p>
                        {n.body && <p className="text-[11.5px] text-slate-500 truncate">{n.body}</p>}
                        <p className="text-[10.5px] text-slate-400 mt-0.5">{timeAgo(n.created_at)}</p>
                      </div>
                    </button>
                  ))
                )}
              </div>

              <Link
                href="/notifications"
                onClick={() => setNotifOpen(false)}
                className="block text-center py-2.5 text-[12px] font-semibold text-violet-600 hover:bg-slate-50 border-t border-slate-100 transition-colors"
              >
                View all
              </Link>
            </div>
          )}
        </div>

        {/* Divider */}
        <div className="w-px h-5 bg-slate-200 mx-1" />

        {/* User dropdown */}
        <div className="relative" ref={userRef}>
          <button
            onClick={() => setUserOpen(v => !v)}
            className="flex items-center gap-2 px-2 py-1.5 rounded-[10px] hover:bg-black/[0.05] transition-colors group"
          >
            <div
              className="w-7 h-7 rounded-[8px] flex items-center justify-center text-white text-xs font-bold shrink-0"
              style={{ background: 'linear-gradient(135deg, #7C3AED 0%, #4F46E5 100%)' }}
            >
              {initial}
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-[12.5px] font-semibold text-slate-700 leading-none">{name}</p>
            </div>
            <ChevronDown
              size={12}
              className={`text-slate-400 group-hover:text-slate-600 transition-transform duration-200 ${userOpen ? 'rotate-180' : ''}`}
            />
          </button>

          {userOpen && (
            <div
              className="absolute right-0 top-full mt-2 w-52 rounded-xl overflow-hidden z-50"
              style={{ background: '#fff', border: '1px solid rgba(0,0,0,0.08)', boxShadow: '0 8px 32px rgba(0,0,0,0.12)' }}
            >
              <div className="px-4 py-3 border-b border-slate-100">
                <p className="text-[12.5px] font-semibold text-slate-800 truncate">{name}</p>
                <p className="text-[11px] text-slate-400 truncate">{email}</p>
              </div>
              <div className="p-1">
                <Link
                  href="/profile"
                  onClick={() => setUserOpen(false)}
                  className="flex items-center gap-2.5 w-full px-3 py-2 rounded-[8px] text-[12.5px] text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  <User size={13} className="text-slate-400" />
                  Profile
                </Link>
                <button
                  onClick={signOut}
                  className="flex items-center gap-2.5 w-full px-3 py-2 rounded-[8px] text-[12.5px] text-red-500 hover:bg-red-50 transition-colors"
                >
                  <LogOut size={13} />
                  Sign out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
