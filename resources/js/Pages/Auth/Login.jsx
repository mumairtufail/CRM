import { useForm, Head } from '@inertiajs/react'
import { Button } from '@/Components/ui/button'
import { Input } from '@/Components/ui/input'
import { Label } from '@/Components/ui/label'
import { Zap, Eye, EyeOff, ArrowRight, TrendingUp, Users, Mail } from 'lucide-react'
import { motion } from 'framer-motion'
import { useState } from 'react'

const features = [
  { icon: Users,      label: 'Lead management',    sub: 'Track every contact and deal' },
  { icon: TrendingUp, label: 'Pipeline analytics',  sub: 'Visualise your sales funnel' },
  { icon: Mail,       label: 'Email campaigns',     sub: 'Reach leads at the right time' },
]

export default function Login({ status }) {
  const [showPass, setShowPass] = useState(false)

  const { data, setData, post, processing, errors, reset } = useForm({
    email: '', password: '', remember: false,
  })

  const submit = e => {
    e.preventDefault()
    post(route('login'), { onFinish: () => reset('password') })
  }

  return (
    <>
      <Head title="Sign in" />
      <div className="min-h-screen flex">

        {/* ── Left panel ─────────────────────────────────── */}
        <div
          className="hidden lg:flex lg:w-[46%] xl:w-[42%] flex-col justify-between p-10 relative overflow-hidden"
          style={{ background: 'linear-gradient(145deg, #0D0B18 0%, #1E1040 45%, #130E28 100%)' }}
        >
          {/* Background orbs */}
          <div className="absolute top-[-120px] left-[-80px] w-[420px] h-[420px] rounded-full pointer-events-none"
            style={{ background: 'radial-gradient(circle, rgba(124,58,237,0.22) 0%, transparent 68%)' }} />
          <div className="absolute bottom-[-100px] right-[-60px] w-[320px] h-[320px] rounded-full pointer-events-none"
            style={{ background: 'radial-gradient(circle, rgba(79,70,229,0.18) 0%, transparent 70%)' }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full pointer-events-none"
            style={{ background: 'radial-gradient(circle, rgba(124,58,237,0.06) 0%, transparent 70%)' }} />

          {/* Grid pattern overlay */}
          <div
            className="absolute inset-0 opacity-[0.025] pointer-events-none"
            style={{
              backgroundImage: 'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)',
              backgroundSize: '40px 40px',
            }}
          />

          {/* Brand mark */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="relative flex items-center gap-2.5"
          >
            <div
              className="w-9 h-9 rounded-[11px] flex items-center justify-center shadow-xl"
              style={{ background: 'linear-gradient(135deg, #7C3AED 0%, #4F46E5 100%)' }}
            >
              <Zap size={16} className="text-white" strokeWidth={2.5} />
            </div>
            <span className="text-white font-bold text-lg tracking-tight">CRM</span>
          </motion.div>

          {/* Center copy */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
            className="relative"
          >
            <div
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-5 text-[11px] font-semibold text-violet-300"
              style={{ background: 'rgba(124,58,237,0.18)', border: '1px solid rgba(124,58,237,0.3)' }}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse" />
              Internal sales platform
            </div>

            <h2 className="text-[32px] font-bold text-white leading-[1.2] tracking-tight mb-4">
              Your entire pipeline,<br />
              <span style={{ background: 'linear-gradient(90deg, #A78BFA, #818CF8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                one clean view.
              </span>
            </h2>
            <p className="text-white/45 text-[14px] leading-relaxed max-w-xs">
              Manage leads, track deals and run campaigns without switching between a dozen tools.
            </p>

            <div className="mt-8 space-y-3">
              {features.map(({ icon: Icon, label, sub }) => (
                <div key={label} className="flex items-center gap-3">
                  <div
                    className="w-8 h-8 rounded-[9px] flex items-center justify-center shrink-0"
                    style={{ background: 'rgba(124,58,237,0.18)', border: '1px solid rgba(124,58,237,0.22)' }}
                  >
                    <Icon size={14} className="text-violet-400" strokeWidth={1.8} />
                  </div>
                  <div>
                    <p className="text-white/80 text-[12.5px] font-semibold leading-none">{label}</p>
                    <p className="text-white/35 text-[11px] mt-0.5">{sub}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Bottom quote */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="relative text-white/20 text-[11px]"
          >
            Built for your team · Secure · Fast
          </motion.p>
        </div>

        {/* ── Right panel ────────────────────────────────── */}
        <div
          className="flex-1 flex items-center justify-center p-6 sm:p-10"
          style={{ background: '#F5F3FF' }}
        >
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            className="w-full max-w-[380px]"
          >
            {/* Mobile brand (shown only on small screens) */}
            <div className="flex items-center gap-2 mb-8 lg:hidden">
              <div
                className="w-8 h-8 rounded-[9px] flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, #7C3AED, #4F46E5)' }}
              >
                <Zap size={14} className="text-white" strokeWidth={2.5} />
              </div>
              <span className="font-bold text-slate-800 text-base tracking-tight">CRM</span>
            </div>

            <div className="mb-7">
              <h1 className="text-[26px] font-bold text-slate-800 tracking-tight">Welcome back</h1>
              <p className="text-slate-500 text-[13.5px] mt-1">Sign in to continue to your workspace.</p>
            </div>

            {status && (
              <div className="mb-5 text-[12.5px] text-emerald-700 bg-emerald-50 rounded-xl py-2.5 px-4 border border-emerald-100">
                {status}
              </div>
            )}

            <form onSubmit={submit} className="space-y-4">
              {/* Email */}
              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-[12px] font-semibold text-slate-600">
                  Email address
                </Label>
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  autoFocus
                  value={data.email}
                  onChange={e => setData('email', e.target.value)}
                  placeholder="you@company.com"
                  className={[
                    'h-10 bg-white text-slate-800 text-[13px] rounded-xl',
                    'placeholder:text-slate-400',
                    'border-slate-200',
                    'focus-visible:ring-1 focus-visible:ring-violet-500 focus-visible:border-violet-500',
                    errors.email ? 'border-red-400 focus-visible:ring-red-400' : '',
                  ].join(' ')}
                />
                {errors.email && (
                  <p className="text-red-500 text-[11.5px] mt-1">{errors.email}</p>
                )}
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <Label htmlFor="password" className="text-[12px] font-semibold text-slate-600">
                  Password
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPass ? 'text' : 'password'}
                    autoComplete="current-password"
                    value={data.password}
                    onChange={e => setData('password', e.target.value)}
                    placeholder="••••••••"
                    className={[
                      'h-10 bg-white text-slate-800 text-[13px] rounded-xl pr-10',
                      'placeholder:text-slate-400',
                      'border-slate-200',
                      'focus-visible:ring-1 focus-visible:ring-violet-500 focus-visible:border-violet-500',
                      errors.password ? 'border-red-400 focus-visible:ring-red-400' : '',
                    ].join(' ')}
                  />
                  <button
                    type="button"
                    tabIndex={-1}
                    onClick={() => setShowPass(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    {showPass ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-red-500 text-[11.5px] mt-1">{errors.password}</p>
                )}
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={processing}
                className="w-full h-10 rounded-xl text-[13.5px] font-semibold text-white flex items-center justify-center gap-2 mt-2 transition-all hover:opacity-90 active:scale-[0.99] disabled:opacity-60"
                style={{ background: 'linear-gradient(135deg, #7C3AED 0%, #4F46E5 100%)', boxShadow: '0 4px 16px rgba(124,58,237,0.35)' }}
              >
                {processing ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Signing in…
                  </>
                ) : (
                  <>
                    Sign in
                    <ArrowRight size={14} />
                  </>
                )}
              </button>
            </form>

            <p className="text-center text-[11.5px] text-slate-400 mt-8">
              Internal tool — authorised access only
            </p>
          </motion.div>
        </div>
      </div>
    </>
  )
}
