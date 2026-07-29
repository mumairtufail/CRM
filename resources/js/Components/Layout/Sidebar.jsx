import { Link, usePage, router } from '@inertiajs/react'
import { useState, useEffect, Fragment } from 'react'
import {
  LayoutDashboard, Users, Kanban, Mail, Upload,
  Tag, Settings, PanelLeftClose, PanelLeftOpen,
  Plus, Clock, ChevronRight, FileText, Inbox, Sparkles,
  LogOut, Briefcase, FolderKanban, UsersRound, ChevronDown, BookOpen,
  MessageSquare, MessagesSquare, ClipboardList, ShieldCheck, BarChart3, LifeBuoy,
  Phone, Wallet,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { LogoMark } from '@/Components/Common/Logo'
import usePermissions from '@/Hooks/usePermissions'

const navItems = [
  { label: 'Dashboard',  href: '/dashboard', icon: LayoutDashboard, section: 'Overview' },

  {
    label: 'Leads',
    icon: Users,
    group: true,
    section: 'Sales',
    children: [
      { label: 'All Leads',      href: '/leads',           icon: Users },
      { label: 'Groups',         href: '/groups',          icon: UsersRound },
      { label: 'Import',         href: '/import',          icon: Upload },
      { label: 'AI Lead Search', href: '/lead-generation', icon: Sparkles },
    ],
  },
  { label: 'Pipeline',   href: '/pipeline', icon: Kanban, section: 'Sales' },
  { label: 'Clients',    href: '/clients',   icon: Briefcase, section: 'Sales' },

  { label: 'Campaigns',  href: '/campaigns', icon: Mail, module: 'email_campaigns', section: 'Communication' },
  {
    label: 'WhatsApp',
    icon: MessageSquare,
    group: true,
    module: 'whatsapp_campaigns',
    section: 'Communication',
    children: [
      { label: 'WA Campaigns',     href: '/whatsapp/campaigns',     icon: MessageSquare },
      { label: 'Conversations',    href: '/whatsapp/conversations',  icon: MessagesSquare },
    ],
  },
  { label: 'Dialer',     href: '/twilio',    icon: Phone, module: 'dialer', section: 'Communication' },
  { label: 'Inbox',      href: '/inbox',     icon: Inbox, section: 'Communication' },

  { label: 'Forms',      href: '/forms',     icon: ClipboardList, section: 'Work' },
  { label: 'Projects',   href: '/projects',  icon: FolderKanban, section: 'Work' },
  { label: 'Invoices',   href: '/invoices',  icon: FileText, section: 'Work' },
  { label: 'Billing',    href: '/billing',   icon: Wallet, section: 'Work' },

  { label: 'Reports',    href: '/reports',   icon: BarChart3, permission: 'reports.view', section: 'Insights' },
  { label: 'Team',       href: '/settings/team', icon: ShieldCheck, permission: 'team.view', section: 'Insights' },

  { label: 'Support',    href: '/support',   icon: LifeBuoy, section: 'Help' },
  { label: 'Help & Docs', href: '/documentation', icon: BookOpen, section: 'Help' },
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
  'Forms/Index':      'Forms',
  'Forms/Create':     'New Form',
  'Forms/Edit':       'Edit Form',
  'Reports/Index':    'Reports',
  'Support/Index':    'Support',
  'Invoices/Index':   'Invoices',
  'Invoices/Create':  'New Invoice',
  'Invoices/Show':    'Invoice',
  'Billing/Index':    'Billing',
  'Pipeline':         'Pipeline',
  'Import':           'Import',
  'Profile/Edit':     'Settings',
  'Settings':         'Settings',
  'Twilio/Index':     'Dialer',
  'Clients/Index':    'Clients',
  'Clients/Show':     'Client',
  'Clients/Create':   'New Client',
  'Projects/Index':   'Projects',
  'Projects/Show':    'Project',
  'Projects/Create':  'New Project',
  'Inbox/Index':      'Inbox',
  'WhatsApp/Campaigns/Index':  'WhatsApp Campaigns',
  'WhatsApp/Campaigns/Create': 'New WA Campaign',
  'WhatsApp/Campaigns/Show':   'WA Campaign',
  'WhatsApp/Conversations/Index': 'WA Conversations',
  'Documentation/Index': 'Documentation',
}

function useRecentPages(currentUrl, component) {
  const [recent, setRecent] = useState([])

  useEffect(() => {
    try {
      const label = COMPONENT_LABELS[component] || component?.split('/').pop() || 'Page'
      const stored = JSON.parse(localStorage.getItem('crm_recent_pages') || '[]')
      const entry  = { url: currentUrl, label }
      // Deduplicate by both URL and label to avoid showing the same page twice
      const updated = [entry, ...stored.filter(p => p.url !== currentUrl && p.label !== label)].slice(0, 5)
      localStorage.setItem('crm_recent_pages', JSON.stringify(updated))
      setRecent(updated.filter(p => p.url !== currentUrl).slice(0, 4))
    } catch {}
  }, [currentUrl])

  return recent
}

export default function Sidebar({ open, onToggle }) {
  const { url, component, props } = usePage()
  const user      = props?.auth?.user
  const organization = props?.organization
  const plan      = props?.plan
  const brandName = organization?.name || 'CRM'
  const { can } = usePermissions()

  const hasModule = (key) => !key || plan?.modules?.includes(key)
  const visibleNavItems = navItems.filter(item => (!item.permission || can(item.permission)) && hasModule(item.module))

  const recentPages = useRecentPages(url, component)

  const [groupsOpen, setGroupsOpen] = useState(() => {
    const state = {}
    for (const item of navItems) {
      if (item.group) {
        state[item.label] = item.children.some(c => url === c.href || url.startsWith(c.href))
      }
    }
    return state
  })

  const closeMobile = () => {
    if (typeof window !== 'undefined' && window.innerWidth < 768) onToggle()
  }

  return (
    <aside
      className={cn(
        'sidebar-bg flex flex-col overflow-hidden min-h-0',
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
        style={{ background: 'linear-gradient(90deg, transparent, rgb(var(--brand-600) / 0.5), transparent)' }} />

      {/* Background orb */}
      <div className="absolute -top-20 -left-20 w-64 h-64 rounded-full opacity-[0.06] pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgb(var(--brand-600)), transparent 70%)' }} />

      {/* ── Brand ─────────────────────────────── */}
      <div className={cn(
        'flex items-center h-[60px] px-3 shrink-0 border-b border-white/[0.055]',
        open ? 'justify-between' : 'justify-center'
      )}>
        <div className={cn('flex items-center gap-2.5 min-w-0', !open && 'justify-center w-full')}>
          <LogoMark size={28} radius={9} className="shrink-0 shadow-lg" />
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

      {open && plan?.name && (
        <Link href="/profile"
          className="mx-3 mt-2.5 flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-white/[0.05] hover:bg-white/[0.08] transition-colors">
          <span className="text-[10.5px] font-semibold text-white/40 uppercase tracking-wider">Your plan</span>
          <span className={cn(
            'text-[11px] font-bold px-2 py-0.5 rounded-full',
            plan.status === 'active' ? 'text-brand-300 bg-brand-500/20' : 'text-white/40 bg-white/10'
          )}>
            {plan.name}
          </span>
        </Link>
      )}

      {/* Expand button when collapsed */}
      {!open && (
        <button onClick={onToggle}
          className="mx-auto mt-2 mb-1 p-1.5 rounded-lg hover:bg-white/[0.08] transition-colors">
          <PanelLeftOpen size={14} className="text-white/25" />
        </button>
      )}

      {/* Nav + quick actions + recent all scroll together, so items never get
          clipped invisibly as the nav list grows past the viewport height. */}
      <div className="flex-1 flex flex-col overflow-hidden min-h-0">
        <div className="flex-1 overflow-y-auto overflow-x-hidden scrollbar-none min-h-0">

        {/* ── Navigation ────────────────────────── */}
        <nav className={cn('px-2 space-y-0.5', open ? 'py-2' : 'py-2')}>
          {visibleNavItems.map((item, idx) => {
            const prevSection = idx > 0 ? visibleNavItems[idx - 1].section : null
            const sectionBreak = idx > 0 && item.section !== prevSection

            const sectionDivider = sectionBreak && (
              open ? (
                <p className="px-3 pt-4 pb-1 text-[9.5px] font-bold uppercase tracking-[0.14em] text-white/20">
                  {item.section}
                </p>
              ) : (
                <div className="mx-2.5 my-2 border-t border-white/[0.07]" />
              )
            )

            if (item.group) {
              const { label, icon: Icon, children } = item
              const groupActive = children.some(c => url === c.href || url.startsWith(c.href))
              if (!open) {
                return (
                  <Fragment key={label}>
                    {sectionDivider}
                    <button title={label}
                      onClick={() => { onToggle(); setGroupsOpen(prev => ({ ...prev, [label]: true })) }}
                      className={cn(
                        'relative w-full flex justify-center p-[11px] rounded-[10px] transition-all duration-150 group/nav',
                        groupActive ? 'bg-brand-600/[0.18] text-white' : 'text-white/40 hover:text-white/75 hover:bg-white/[0.06]'
                      )}
                    >
                      {groupActive && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-4 rounded-r-full bg-brand-400" />}
                      <Icon size={15} strokeWidth={groupActive ? 2.2 : 1.8}
                        className={cn('shrink-0 transition-colors', groupActive ? 'text-brand-300' : 'group-hover/nav:text-white/75')} />
                    </button>
                  </Fragment>
                )
              }
              return (
                <Fragment key={label}>
                {sectionDivider}
                <div>
                  <button
                    onClick={() => setGroupsOpen(prev => ({ ...prev, [label]: !prev[label] }))}
                    className={cn(
                      'relative w-full flex items-center gap-3 px-3 py-[9px] rounded-[10px] transition-all duration-150 group/nav',
                      groupActive ? 'text-white/80' : 'text-white/40 hover:text-white/75 hover:bg-white/[0.06]'
                    )}
                  >
                    <Icon size={15} strokeWidth={groupActive ? 2.2 : 1.8}
                      className={cn('shrink-0 transition-colors', groupActive ? 'text-brand-300' : 'group-hover/nav:text-white/75')} />
                    <span className="text-[13px] font-medium truncate flex-1 text-left">{label}</span>
                    <ChevronDown size={12} className={cn('shrink-0 text-white/30 transition-transform duration-200', groupsOpen[label] && 'rotate-180')} />
                  </button>
                  <div style={{
                    maxHeight: groupsOpen[label] ? '400px' : '0px',
                    opacity: groupsOpen[label] ? 1 : 0,
                    overflow: 'hidden',
                    transition: 'max-height 0.22s ease, opacity 0.18s ease',
                  }}>
                    <div className="ml-3 pl-3 border-l border-white/[0.07] space-y-0.5 mb-0.5 pt-0.5">
                      {children.map(({ label: childLabel, href, icon: CIcon }) => {
                        const active = url === href || (href !== '/' && url.startsWith(href))
                        return (
                          <Link key={href} href={href} onClick={closeMobile}
                            className={cn(
                              'relative flex items-center gap-2.5 px-2.5 py-[7px] rounded-[8px] transition-all duration-150 group/child',
                              active ? 'bg-brand-600/[0.18] text-white' : 'text-white/35 hover:text-white/70 hover:bg-white/[0.05]'
                            )}
                          >
                            <CIcon size={13} strokeWidth={active ? 2.2 : 1.8}
                              className={cn('shrink-0', active ? 'text-brand-300' : 'group-hover/child:text-white/70')} />
                            <span className="text-[12.5px] font-medium truncate">{childLabel}</span>
                          </Link>
                        )
                      })}
                    </div>
                  </div>
                </div>
                </Fragment>
              )
            }

            const { label, href, icon: Icon } = item
            const active = url === href || (href !== '/' && url.startsWith(href))
            return (
              <Fragment key={href}>
                {sectionDivider}
                <Link href={href} title={!open ? label : undefined}
                  onClick={closeMobile}
                  className={cn(
                    'relative flex items-center rounded-[10px] transition-all duration-150 group/nav',
                    open ? 'gap-3 px-3 py-[9px]' : 'justify-center p-[11px]',
                    active ? 'bg-brand-600/[0.18] text-white' : 'text-white/40 hover:text-white/75 hover:bg-white/[0.06]'
                  )}
                >
                  {active && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-4 rounded-r-full bg-brand-400" />}
                  <Icon size={15} strokeWidth={active ? 2.2 : 1.8}
                    className={cn('shrink-0 transition-colors', active ? 'text-brand-300' : 'group-hover/nav:text-white/75')} />
                  {open && (
                    <span className="text-[13px] font-medium truncate">{label}</span>
                  )}
                </Link>
              </Fragment>
            )
          })}
        </nav>

        {/* ── Quick actions + Recent ────────────── */}
          {open && (
            <div className="px-3 pt-3 pb-1">
              <p className="text-[9.5px] font-bold uppercase tracking-[0.14em] text-white/20 px-1 mb-1.5">Quick add</p>
              <div className="flex gap-1.5">
                {quickActions.map(({ label, href, icon: Icon }) => (
                  <Link key={href} href={href}
                    className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg bg-white/[0.06] hover:bg-brand-500/25 text-white/50 hover:text-white transition-all text-[11px] font-semibold">
                    <Plus size={10} strokeWidth={2.5} />
                    {label.replace('New ', '')}
                  </Link>
                ))}
              </div>
            </div>
          )}

          {!open && (
            <div className="flex flex-col items-center gap-1 px-2 pt-2 pb-1">
              <Link href="/leads/create" title="New Lead"
                className="p-[9px] rounded-lg bg-white/[0.06] hover:bg-brand-500/25 text-white/40 hover:text-white transition-all">
                <Plus size={13} strokeWidth={2.5} />
              </Link>
            </div>
          )}

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
      </div>

      {/* ── Bottom — settings + user + logout ──── */}
      <div className="px-2 pb-3 border-t border-white/[0.055] pt-2 space-y-0.5">
        <Link
          href="/profile"
          title={!open ? 'Settings' : undefined}
          onClick={closeMobile}
          className={cn(
            'relative flex items-center rounded-[10px] transition-all duration-150 group/nav',
            open ? 'gap-3 px-3 py-[9px]' : 'justify-center p-[11px]',
            (url === '/profile' || url.startsWith('/profile'))
              ? 'bg-brand-600/[0.18] text-white'
              : 'text-white/40 hover:text-white/75 hover:bg-white/[0.06]'
          )}
        >
          {(url === '/profile' || url.startsWith('/profile')) && (
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-4 rounded-r-full bg-brand-400" />
          )}
          <Settings size={15} strokeWidth={url.startsWith('/profile') ? 2.2 : 1.8}
            className={cn('shrink-0 transition-colors', url.startsWith('/profile') ? 'text-brand-300' : 'group-hover/nav:text-white/75')} />
          {open && <span className="text-[13px] font-medium">Settings</span>}
        </Link>

        {open && user && (
          <div className="flex items-center gap-2.5 px-3 py-2 mb-0.5">
            <div className="w-6 h-6 rounded-full bg-brand-600/60 flex items-center justify-center shrink-0 text-[10px] font-bold text-white">
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
