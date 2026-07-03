import { Link, usePage } from '@inertiajs/react'
import {
  LayoutDashboard, Users, Building2,
  Settings, PanelLeftClose, PanelLeftOpen, Mail, MessageSquare,
  MessageCircle, LifeBuoy, CreditCard,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { LogoMark } from '@/Components/Common/Logo'

const navItems = [
  { label: 'Dashboard',     href: '/admin',                   icon: LayoutDashboard },
  { label: 'Users',         href: '/admin/users',             icon: Users },
  { label: 'Organizations', href: '/admin/organizations',     icon: Building2 },
  { label: 'Plans',         href: '/admin/plans',             icon: CreditCard },
  { label: 'Contact Msgs',  href: '/admin/contact-messages',  icon: MessageSquare },
  { label: 'Support Cases', href: '/admin/support',           icon: LifeBuoy },
  { label: 'SMTP Settings', href: '/admin/smtp-settings',     icon: Mail },
  { label: 'WhatsApp',      href: '/admin/whatsapp-settings', icon: MessageCircle },
]

export default function AdminSidebar({ open, onToggle }) {
  const { url, props } = usePage()
  const user = props?.auth?.user

  const closeMobile = () => {
    if (typeof window !== 'undefined' && window.innerWidth < 768) onToggle()
  }

  return (
    <aside
      className={cn(
        'sidebar-bg flex flex-col overflow-hidden',
        'transition-all duration-300 ease-in-out',
        'fixed inset-y-0 left-0 z-50',
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

      {/* ── Brand ── */}
      <div className={cn(
        'flex items-center h-[60px] px-3 shrink-0 border-b border-white/[0.055]',
        open ? 'justify-between' : 'justify-center'
      )}>
        <div className={cn('flex items-center gap-2.5 min-w-0', !open && 'justify-center w-full')}>
          <LogoMark size={28} />
          {open && (
            <div className="min-w-0">
              <span className="block font-extrabold text-[13.5px] text-white truncate tracking-tight leading-none">LeadFlow</span>
              <span className="block text-[10px] text-violet-300/80 font-semibold uppercase tracking-[0.12em] mt-1">Super Admin</span>
            </div>
          )}
        </div>
        {open && (
          <button onClick={onToggle}
            className="p-1.5 rounded-lg hover:bg-white/[0.08] transition-colors shrink-0 ml-1">
            <PanelLeftClose size={14} className="text-white/30" />
          </button>
        )}
      </div>

      {!open && (
        <button onClick={onToggle}
          className="mx-auto mt-2 mb-1 p-1.5 rounded-lg hover:bg-white/[0.08] transition-colors">
          <PanelLeftOpen size={14} className="text-white/25" />
        </button>
      )}

      <div className="flex-1 overflow-y-auto overflow-x-hidden scrollbar-none">
        {open && (
          <p className="px-4 pt-4 pb-1 text-[9.5px] font-bold uppercase tracking-[0.14em] text-white/20">Management</p>
        )}

        <nav className={cn('px-2 space-y-0.5', open ? 'py-1' : 'py-2')}>
          {navItems.map(({ label, href, icon: Icon }) => {
            const active = href === '/admin' ? url === '/admin' : url.startsWith(href)
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
      </div>

      {/* ── Bottom — account ── */}
      <div className="px-2 pb-3 border-t border-white/[0.055] pt-2">
        {open && (
          <div className="px-2 py-1.5 mb-1">
            <p className="text-[9.5px] font-bold uppercase tracking-[0.14em] text-white/20">Signed in as</p>
            {user && (
              <p className="text-[11.5px] text-white/40 mt-0.5 truncate">{user.email}</p>
            )}
          </div>
        )}
        <Link href="/admin/settings" title={!open ? 'Settings' : undefined}
          onClick={closeMobile}
          className={cn(
            'relative flex items-center rounded-[10px] transition-all group/settings',
            open ? 'gap-3 px-3 py-[9px]' : 'justify-center p-[11px]',
            url.startsWith('/admin/settings')
              ? 'bg-violet-600/[0.18] text-white'
              : 'text-white/35 hover:text-white/65 hover:bg-white/[0.06]'
          )}
        >
          {url.startsWith('/admin/settings') && (
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-4 rounded-r-full bg-violet-400" />
          )}
          <Settings
            size={15}
            strokeWidth={url.startsWith('/admin/settings') ? 2.2 : 1.8}
            className={cn('shrink-0 transition-colors', url.startsWith('/admin/settings') ? 'text-violet-300' : 'group-hover/settings:text-white/65')}
          />
          {open && <span className="text-[13px] font-medium">Settings</span>}
        </Link>
      </div>
    </aside>
  )
}
