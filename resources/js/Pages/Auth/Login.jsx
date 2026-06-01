import { useForm, Head } from '@inertiajs/react'
import { Input } from '@/Components/ui/input'
import { Label } from '@/Components/ui/label'
import { Eye, EyeOff, ArrowRight } from 'lucide-react'
import { motion } from 'framer-motion'
import { useState } from 'react'

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

      {/* Full-screen background */}
      <div
        className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden"
        style={{ background: 'linear-gradient(145deg, #0D0B18 0%, #1E1040 50%, #0F0D1C 100%)' }}
      >
        {/* Background orbs */}
        <div className="absolute top-[-160px] left-[-120px] w-[500px] h-[500px] rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(124,58,237,0.25) 0%, transparent 65%)' }} />
        <div className="absolute bottom-[-140px] right-[-100px] w-[420px] h-[420px] rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(79,70,229,0.2) 0%, transparent 65%)' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(124,58,237,0.07) 0%, transparent 70%)' }} />

        {/* Subtle grid */}
        <div
          className="absolute inset-0 opacity-[0.03] pointer-events-none"
          style={{
            backgroundImage: 'linear-gradient(rgba(255,255,255,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.6) 1px, transparent 1px)',
            backgroundSize: '44px 44px',
          }}
        />

        {/* Glassmorphism card */}
        <motion.div
          initial={{ opacity: 0, y: 24, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="relative w-full max-w-[400px] rounded-2xl p-8"
          style={{
            background: 'rgba(255,255,255,0.06)',
            backdropFilter: 'blur(24px)',
            WebkitBackdropFilter: 'blur(24px)',
            border: '1px solid rgba(255,255,255,0.1)',
            boxShadow: '0 24px 64px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.08)',
          }}
        >
          {/* Logo */}
          <div className="flex flex-col items-center mb-8">
            <div className="w-16 h-16 rounded-2xl overflow-hidden flex items-center justify-center mb-4"
              style={{ background: 'rgba(124,58,237,0.15)', border: '1px solid rgba(124,58,237,0.3)' }}
            >
              {/* Replace the img src with your logo path once uploaded, e.g. src="/logo.png" */}
              <img
                src="/logo.png"
                alt="Logo"
                className="w-full h-full object-contain"
                onError={e => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex' }}
              />
              <span
                className="text-violet-400 text-2xl font-bold hidden items-center justify-center w-full h-full"
                style={{ display: 'none' }}
              >
                C
              </span>
            </div>
            <h1 className="text-xl font-bold text-white tracking-tight">Welcome back</h1>
            <p className="text-white/40 text-[13px] mt-1">Sign in to your workspace</p>
          </div>

          {status && (
            <div className="mb-5 text-[12.5px] text-emerald-300 bg-emerald-500/10 rounded-xl py-2.5 px-4 border border-emerald-500/20">
              {status}
            </div>
          )}

          <form onSubmit={submit} className="space-y-4">
            {/* Email */}
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-[12px] font-semibold text-white/60">
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
                  'h-10 text-white text-[13px] rounded-xl',
                  'placeholder:text-white/25',
                  'focus-visible:ring-1 focus-visible:ring-violet-500 focus-visible:border-violet-500/60',
                  errors.email ? 'border-red-400/60 focus-visible:ring-red-400' : '',
                ].join(' ')}
                style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}
              />
              {errors.email && (
                <p className="text-red-400 text-[11.5px] mt-1">{errors.email}</p>
              )}
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-[12px] font-semibold text-white/60">
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
                    'h-10 text-white text-[13px] rounded-xl pr-10',
                    'placeholder:text-white/25',
                    'focus-visible:ring-1 focus-visible:ring-violet-500 focus-visible:border-violet-500/60',
                    errors.password ? 'border-red-400/60 focus-visible:ring-red-400' : '',
                  ].join(' ')}
                  style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}
                />
                <button
                  type="button"
                  tabIndex={-1}
                  onClick={() => setShowPass(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
                >
                  {showPass ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
              {errors.password && (
                <p className="text-red-400 text-[11.5px] mt-1">{errors.password}</p>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={processing}
              className="w-full h-10 rounded-xl text-[13.5px] font-semibold text-white flex items-center justify-center gap-2 mt-2 transition-all hover:opacity-90 active:scale-[0.99] disabled:opacity-60"
              style={{ background: 'linear-gradient(135deg, #7C3AED 0%, #4F46E5 100%)', boxShadow: '0 4px 20px rgba(124,58,237,0.4)' }}
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

          <p className="text-center text-[11px] text-white/20 mt-6">
            Internal tool — authorised access only
          </p>
        </motion.div>
      </div>
    </>
  )
}
