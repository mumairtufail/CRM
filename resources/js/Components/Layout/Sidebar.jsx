import { Link, usePage } from '@inertiajs/react'
import {
  LayoutDashboard, Users, Kanban, Mail, Upload,
  Tag, Settings, ChevronLeft, Zap
} from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { label: 'Dashboard', href: '/', icon: LayoutDashboard },
  { label: 'Leads', href: '/leads', icon: Users },
  { label: 'Pipeline', href: '/pipeline', icon: Kanban },
  { label: 'Campaigns', href: '/campaigns', icon: Mail },
  { label: 'Import', href: '/import', icon: Upload },
  { label: 'Tags', href: '/tags', icon: Tag },
]

export default function Sidebar({ open, onToggle }) {
  const { url } = usePage()

  return (
    <aside
      className={cn(
        'flex flex-col bg-[#0f172a] text-slate-200 transition-all duration-300 ease-in-out shrink-0',
        open ? 'w-60' : 'w-16'
      )}
    >
      {/* Logo */}
      <div className="flex items-center justify-between h-16 px-4 border-b border-slate-700/50">
        {open && (
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-blue-500 flex items-center justify-center shrink-0">
              <Zap size={14} className="text-white" />
            </div>
            <span className="font-display font-bold text-white text-base tracking-tight">CRM</span>
          </div>
        )}
        <button
          onClick={onToggle}
          className="p-1.5 rounded-md hover:bg-slate-700/50 transition-colors ml-auto"
        >
          <ChevronLeft
            size={15}
            className={cn('transition-transform duration-300 text-slate-400', !open && 'rotate-180')}
          />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-3 space-y-0.5 px-2">
        {navItems.map(({ label, href, icon: Icon }) => {
          const active = url === href || (href !== '/' && url.startsWith(href))
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150',
                active
                  ? 'bg-blue-500/15 text-blue-400 border border-blue-500/20'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
              )}
            >
              <Icon size={17} className="shrink-0" />
              {open && <span className="truncate">{label}</span>}
            </Link>
          )
        })}
      </nav>

      {/* Bottom */}
      <div className="p-2 border-t border-slate-700/50">
        <Link
          href="/profile"
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-slate-400 hover:bg-slate-800 hover:text-slate-200 transition-colors"
        >
          <Settings size={17} className="shrink-0" />
          {open && <span>Settings</span>}
        </Link>
      </div>
    </aside>
  )
}
