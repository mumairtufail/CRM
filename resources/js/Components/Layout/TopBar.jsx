import { Menu, Bell, Search, ChevronDown, User, LogOut } from 'lucide-react'
import { usePage, Link, router } from '@inertiajs/react'
import { useState, useRef, useEffect } from 'react'

export default function TopBar({ title, onMenuClick }) {
  const { auth } = usePage().props
  const user     = auth?.user
  const initial  = user?.name?.charAt(0)?.toUpperCase() ?? 'A'
  const name     = user?.name ?? 'User'
  const email    = user?.email ?? ''

  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    const handler = e => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const signOut = () => router.post(route('logout'))

  return (
    <header
      className="h-[60px] flex items-center justify-between px-5 shrink-0 z-10"
      style={{
        background:    'rgba(255,255,255,0.88)',
        backdropFilter:'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderBottom:  '1px solid rgba(0,0,0,0.055)',
      }}
    >
      {/* Left */}
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="p-2 rounded-[9px] hover:bg-black/[0.05] transition-colors"
          aria-label="Toggle sidebar"
        >
          <Menu size={16} className="text-slate-500" />
        </button>

        {title && (
          <div className="flex items-center gap-2">
            <span className="text-slate-300 text-xs">·</span>
            <h1 className="font-semibold text-slate-800 text-[14.5px] tracking-tight">{title}</h1>
          </div>
        )}
      </div>

      {/* Right */}
      <div className="flex items-center gap-1.5">
        {/* Search */}
        <div
          className="hidden md:flex items-center gap-2 rounded-[9px] px-3 h-8 w-44 cursor-text transition-all"
          style={{ background: 'rgba(0,0,0,0.04)', border: '1px solid rgba(0,0,0,0.06)' }}
        >
          <Search size={12} className="text-slate-400 shrink-0" />
          <input
            type="text"
            placeholder="Search..."
            className="text-xs bg-transparent outline-none text-slate-600 placeholder:text-slate-400 w-full"
          />
        </div>

        {/* Notifications */}
        <button
          className="relative p-2 rounded-[9px] hover:bg-black/[0.05] transition-colors"
          aria-label="Notifications"
        >
          <Bell size={15} className="text-slate-500" />
          <span className="absolute top-[7px] right-[7px] w-[6px] h-[6px] rounded-full border border-white"
            style={{ background: 'linear-gradient(135deg, #7C3AED, #4F46E5)' }} />
        </button>

        {/* Divider */}
        <div className="w-px h-5 bg-slate-200 mx-1" />

        {/* User dropdown */}
        <div className="relative" ref={ref}>
          <button
            onClick={() => setOpen(v => !v)}
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
              className={`text-slate-400 group-hover:text-slate-600 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
            />
          </button>

          {/* Dropdown */}
          {open && (
            <div
              className="absolute right-0 top-full mt-2 w-52 rounded-xl overflow-hidden z-50"
              style={{
                background: '#fff',
                border: '1px solid rgba(0,0,0,0.08)',
                boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
              }}
            >
              {/* User info header */}
              <div className="px-4 py-3 border-b border-slate-100">
                <p className="text-[12.5px] font-semibold text-slate-800 truncate">{name}</p>
                <p className="text-[11px] text-slate-400 truncate">{email}</p>
              </div>

              {/* Menu items */}
              <div className="p-1">
                <Link
                  href="/profile"
                  onClick={() => setOpen(false)}
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
