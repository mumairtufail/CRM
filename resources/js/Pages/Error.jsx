import { Link } from '@inertiajs/react'
import { Lock, AlertTriangle, SearchX, ShieldAlert, ArrowLeft, MessageCircle } from 'lucide-react'
import { LogoMark } from '@/Components/Common/Logo'

const STATUS_CONFIG = {
  403: { icon: Lock,         title: 'Access Restricted' },
  404: { icon: SearchX,      title: 'Page Not Found' },
  419: { icon: ShieldAlert,  title: 'Session Expired' },
  429: { icon: ShieldAlert,  title: 'Too Many Requests' },
  500: { icon: AlertTriangle, title: 'Something Went Wrong' },
  503: { icon: AlertTriangle, title: 'Down for Maintenance' },
}

const DEFAULT_MESSAGES = {
  403: "You don't have access to this page.",
  404: "The page you're looking for doesn't exist or has moved.",
  419: 'Your session expired. Please refresh and try again.',
  429: "You've made too many requests. Please slow down and try again shortly.",
  500: "We hit an unexpected error on our end. It's been logged — please try again.",
  503: "We're doing some quick maintenance. Please check back in a few minutes.",
}

export default function ErrorPage({ status, message }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG[500]
  const Icon = cfg.icon
  const isPlanGate = status === 403 && message?.toLowerCase().includes('plan')

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: '#0A0812' }}>
      <div className="max-w-md w-full text-center">
        <LogoMark size={40} className="mx-auto mb-8" />

        <div
          className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6"
          style={{ background: 'rgb(var(--brand-600) / 0.15)' }}
        >
          <Icon className="w-8 h-8 text-brand-400" />
        </div>

        <p className="text-brand-400 text-xs font-bold uppercase tracking-widest mb-2">Error {status}</p>
        <h1 className="text-2xl font-black text-white mb-3">
          {isPlanGate ? 'Upgrade Required' : cfg.title}
        </h1>
        <p className="text-white/40 text-sm leading-relaxed mb-8">
          {message || DEFAULT_MESSAGES[status] || DEFAULT_MESSAGES[500]}
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90 hover:shadow-2xl hover:shadow-brand-500/25"
            style={{ background: 'linear-gradient(135deg,rgb(var(--brand-600)),rgb(var(--brand2-600)))' }}
          >
            <ArrowLeft className="w-4 h-4" /> Back to Dashboard
          </Link>
          {isPlanGate && (
            <Link
              href="/support"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold text-white/70 border border-white/15 hover:bg-white/5 hover:text-white transition-all"
            >
              <MessageCircle className="w-4 h-4" /> Contact us to upgrade
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}
