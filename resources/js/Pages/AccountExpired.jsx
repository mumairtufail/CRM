import { Link } from '@inertiajs/react'
import { Clock, MessageCircle, LogOut } from 'lucide-react'
import { LogoMark } from '@/Components/Common/Logo'

export default function AccountExpired() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: '#0A0812' }}>
      <div className="max-w-md w-full text-center">
        <LogoMark size={40} className="mx-auto mb-8" />

        <div
          className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6"
          style={{ background: 'rgb(var(--brand-600) / 0.15)' }}
        >
          <Clock className="w-8 h-8 text-brand-400" />
        </div>

        <p className="text-brand-400 text-xs font-bold uppercase tracking-widest mb-2">Account Expired</p>
        <h1 className="text-2xl font-black text-white mb-3">This demo account has expired</h1>
        <p className="text-white/40 text-sm leading-relaxed mb-8">
          Please contact support for more information or to continue using this workspace.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/support"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90 hover:shadow-2xl hover:shadow-brand-500/25"
            style={{ background: 'linear-gradient(135deg,rgb(var(--brand-600)),rgb(var(--brand2-600)))' }}
          >
            <MessageCircle className="w-4 h-4" /> Contact Support
          </Link>
          <Link
            href="/logout"
            method="post"
            as="button"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold text-white/70 border border-white/15 hover:bg-white/5 hover:text-white transition-all"
          >
            <LogOut className="w-4 h-4" /> Log out
          </Link>
        </div>
      </div>
    </div>
  )
}
