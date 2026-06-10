import { Link, usePage, router } from '@inertiajs/react'
import { useState, useEffect } from 'react'
import {
  LayoutDashboard, Users, Kanban, Mail, Upload,
  Tag, Settings, PanelLeftClose, PanelLeftOpen,
  Plus, Clock, ChevronRight, FileText, Inbox, Sparkles,
  LogOut, Briefcase, FolderKanban, UsersRound,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { LogoMark } from '@/Components/Common/Logo'

const navItems = [
  { label: 'Dashboard',      href: '/',                icon: LayoutDashboard },
  { label: 'Leads',          href: '/leads',           icon: Users },
  { label: 'Groups',         href: '/groups',          icon: UsersRound },
  { label: 'AI Lead Search', href: '/lead-generation', icon: Sparkles },
  { label: 'Pipeline',       href: '/pipeline',        icon: Kanban },
  { label: 'Campaigns',      href: '/campaigns',       icon: Mail },
  { label: 'Clients',        href: '/clients',         icon: Briefcase },
  { label: 'Projects',       href: '/projects',        icon: FolderKanban },
  { label: 'Inbox',          href: '/inbox',           icon: Inbox },
  { label: 'Invoices',       href: '/invoices',        icon: FileText },
  { label: 'Import',         href: '/import',          icon: Upload },
  { label: 'Settings',       href: '/profile',         icon: Settings },
]

const quickActions = [
  { label: 'New Lead',     href: '/leads/create',     icon: Users },
  { label: 'New Project',  href: '/projects/create',  icon: FolderKanban },
]

// Map Inertia component names → readable labels
const COMPONENT_LABELS = {
  'Groups/Index':     'Groups',
  'Groups/Show':      'Group',
  'Dashboard':        'Dashboard',
  'LeadGeneration/Index': 'AI Lead Search',
  'Leads/Index':      'All Leads',
  'Leads/Show':       'Lead Detail',
  'Leads/Create':     'New Lead',
  'Leads/Edit':       'Edit Lead',
  'Campaigns/Index':  'Campaigns',
  'Campaigns/Create': 'New Campaign',
  'Campaigns/Show':   'Campaign',
  'Invoices/Index':   'Invoices',
  'Invoices/Create':  'New Invoice',
  'Invoices/Show':    'Invoice',
  'Pipeline':         'Pipeline',
  'Import':           'Import',
  'Tags/Index':       'Tags',
  'Profile/Edit':     'Settings',
  'Settings':         'Settings',
  'Clients/Index':    'Clients',
  'Clients/Show':     'Client',
  'Clients/Create':   'New Client',
  'Projects/Index':   'Projects',
  'Projects/Show':    'Project',
  'Projects/Create':  'New Project',
  'Inbox/Index':      'Inbox',
}

function useRecentPages(currentUrl, component) {
  const [recent, setRecent] = useState([])

  useEffect(() => {
    try {
      const label = COMPONENT_LABELS[component] || component?.split('/').pop() || 'Page'
      const stored = JSON.parse(localStorage.getItem('crm_recent_pages') || '[]')
      const entry  = { url: currentUrl, label }
      const updated = [entry, ...stored.filter(p => p.url !== currentUrl)].slice(0, 5)
      localStorage.setItem('crm_recent_pages', JSON.stringify(updated))
      // Show all except the one we're currently on
      setRecent(updated.filter(p => p.url !== currentUrl).slice(0, 4))
    } catch {}
  }, [currentUrl])

  return recent
}

export default function Sidebar({ open, onToggle }) {
  const { url, component, props } = usePage()
  const user      = props?.auth?.user
  const organization = props?.organization
  const logoUrl   = user?.company_logo ? `/storage/${user.company_logo}` : null
  const brandName = organization?.name || user?.company_name || 'CRM'

  const recentPages = useRecentPages(url, component)

  const closeMobile = () => {
    if (typeof window !== 'undefined' && window.innerWidth < 768) onToggle()
  }

  return (
    <aside
      className={cn(
        'sidebar-bg flex flex-col overflow-hidden',
        'transition-all duration-300 ease-in-out',
        // Mobile: fixed full-height overlay, slides in/out
        'fixed inset-y-0 left-0 z-50',
        // Desktop: static sidebar in the flex row
        'md:relative md:inset-auto md:z-auto md:shrink-0',
        open
          ? 'w-[228px] translate-x-0'
          : 'w-[228px] -translate-x-full md:translate-x-0 md:w-[62px]'
      )}
      style={{ borderRight: '1px solid rgba(255,255,255,0.055)' }}
    >
      {/* Top accent line */}
      <div className="absolute top-0 inset-x-0 h-px"
        style={{ background: 'linear-gradient(90deg, transparent, rgba(124,58,237,0.5), transparent)' }} />

      {/* Background orb */}
      <div className="absolute -top-20 -left-20 w-64 h-64 rounded-full opacity-[0.06] pointer-events-none"
        style={{ background: 'radial-gradient(circle, #7C3AED, transparent 70%)' }} />

      {/* ── Brand ─────────────────────────────── */}
      <div className={cn(
        'flex items-center h-[60px] px-3 shrink-0 border-b border-white/[0.055]',
        open ? 'justify-between' : 'justify-center'
      )}>
        <div className={cn('flex items-center gap-2.5 min-w-0', !open && 'justify-center w-full')}>
          {logoUrl
            ? (
              <div className="w-7 h-7 rounded-[9px] flex items-center justify-center shrink-0 shadow-lg overflow-hidden"
                style={{ background: 'linear-gradient(135deg, #7C3AED 0%, #4F46E5 100%)' }}>
                <img src={logoUrl} alt="logo" className="w-full h-full rounded-[9px] object-contain" />
              </div>
            )
            : <LogoMark size={28} radius={9} className="shrink-0 shadow-lg" />
          }
          {open && (
            <span className="font-bold text-[13.5px] text-white truncate tracking-tight">{brandName}</span>
          )}
        </div>
        {open && (
          <button onClick={onToggle}
            className="p-1.5 rounded-lg hover:bg-white/[0.08] transition-colors shrink-0 ml-1">
            <PanelLeftClose size={14} className="text-white/30" />
          </button>
        )}
      </div>

      {/* Expand button when collapsed */}
      {!open && (
        <button onClick={onToggle}
          className="mx-auto mt-2 mb-1 p-1.5 rounded-lg hover:bg-white/[0.08] transition-colors">
          <PanelLeftOpen size={14} className="text-white/25" />
        </button>
      )}

      <div className="flex-1 overflow-y-auto overflow-x-hidden scrollbar-none">

        {/* ── Navigation ────────────────────────── */}
        {open && (
          <p className="px-4 pt-4 pb-1 text-[9.5px] font-bold uppercase tracking-[0.14em] text-white/20">Navigation</p>
        )}

        <nav className={cn('px-2 space-y-0.5', open ? 'py-1' : 'py-2')}>
          {navItems.map(({ label, href, icon: Icon }) => {
            const active = url === href || (href !== '/' && url.startsWith(href))
            return (
              <Link key={href} href={href} title={!open ? label : undefined}
                onClick={closeMobile}
                className={cn(
                  'relative flex items-center rounded-[10px] transition-all duration-150 group/nav',
                  open ? 'gap-3 px-3 py-[9px]' : 'justify-center p-[11px]',
                  active
                    ? 'bg-violet-600/[0.18] text-white'
                    : 'text-white/40 hover:text-white/75 hover:bg-white/[0.06]'
                )}
              >
                {active && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-4 rounded-r-full bg-violet-400" />
                )}
                <Icon
                  size={15} strokeWidth={active ? 2.2 : 1.8}
                  className={cn('shrink-0 transition-colors', active ? 'text-violet-300' : 'group-hover/nav:text-white/75')}
                />
                {open && (
                  <>
                    <span className="text-[13px] font-medium truncate">{label}</span>
                    {active && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-violet-400 opacity-80" />}
                  </>
                )}
              </Link>
            )
          })}
        </nav>

        {/* ── Quick actions ────────────────────── */}
        {open && (
          <div className="px-3 pt-3 pb-1">
            <p className="text-[9.5px] font-bold uppercase tracking-[0.14em] text-white/20 px-1 mb-1.5">Quick add</p>
            <div className="flex gap-1.5">
              {quickActions.map(({ label, href, icon: Icon }) => (
                <Link key={href} href={href}
                  className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg bg-white/[0.06] hover:bg-violet-500/25 text-white/50 hover:text-white transition-all text-[11px] font-semibold">
                  <Plus size={10} strokeWidth={2.5} />
                  {label.replace('New ', '')}
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* collapsed: show + icon for new lead */}
        {!open && (
          <div className="flex flex-col items-center gap-1 px-2 pt-2 pb-1">
            <Link href="/leads/create" title="New Lead"
              className="p-[9px] rounded-lg bg-white/[0.06] hover:bg-violet-500/25 text-white/40 hover:text-white transition-all">
              <Plus size={13} strokeWidth={2.5} />
            </Link>
          </div>
        )}

        {/* ── Recent pages ─────────────────────── */}
        {open && recentPages.length > 0 && (
          <div className="px-3 pt-3 pb-1">
            <div className="flex items-center gap-1.5 px-1 mb-1.5">
              <Clock size={9} className="text-white/20" />
              <p className="text-[9.5px] font-bold uppercase tracking-[0.14em] text-white/20">Recent</p>
            </div>
            <div className="space-y-0.5">
              {recentPages.map((page, i) => (
                <Link key={i} href={page.url}
                  className="flex items-center gap-2 px-2 py-[7px] rounded-lg text-white/30 hover:text-white/65 hover:bg-white/[0.06] transition-all group">
                  <ChevronRight size={9} className="shrink-0 text-white/20 group-hover:text-white/40" />
                  <span className="text-[12px] font-medium truncate">{page.label}</span>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── Bottom — user + logout ─────────────── */}
      <div className="px-2 pb-3 border-t border-white/[0.055] pt-2 space-y-0.5">
        {open && user && (
          <div className="flex items-center gap-2.5 px-3 py-2 mb-0.5">
            <div className="w-6 h-6 rounded-full bg-violet-600/60 flex items-center justify-center shrink-0 text-[10px] font-bold text-white">
              {user.name?.[0]?.toUpperCase() ?? '?'}
            </div>
            <div className="min-w-0">
              <p className="text-[12px] font-medium text-white/60 truncate leading-none">{user.name}</p>
              <p className="text-[10.5px] text-white/30 truncate mt-0.5">{user.email}</p>
            </div>
          </div>
        )}

        <button
          title={!open ? 'Log out' : undefined}
          onClick={() => router.post('/logout')}
          className={cn(
            'w-full flex items-center rounded-[10px] transition-all duration-150 group/logout',
            'text-white/55 bg-white/[0.05] hover:text-red-400 hover:bg-red-500/[0.14]',
            open ? 'gap-3 px-3 py-[9px]' : 'justify-center p-[11px]'
          )}
        >
          <LogOut
            size={15} strokeWidth={1.8}
            className="shrink-0 transition-colors group-hover/logout:text-red-400"
          />
          {open && <span className="text-[13px] font-medium">Log out</span>}
        </button>
      </div>
    </aside>
  )
}
