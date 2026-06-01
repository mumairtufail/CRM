import { useForm, Head } from '@inertiajs/react'
import { Input } from '@/Components/ui/input'
import { Eye, EyeOff } from 'lucide-react'
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

      {/* Full-page dark background with purple glow orbs */}
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #0b0b18 0%, #110824 50%, #0b1320 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px 16px',
        position: 'relative',
        overflow: 'hidden',
      }}>

        {/* Ambient glow — top-left */}
        <div style={{
          position: 'absolute', width: 700, height: 700,
          background: 'radial-gradient(circle, rgba(124,58,237,0.18) 0%, transparent 65%)',
          top: -180, left: -180, pointerEvents: 'none',
        }} />
        {/* Ambient glow — bottom-right */}
        <div style={{
          position: 'absolute', width: 600, height: 600,
          background: 'radial-gradient(circle, rgba(79,70,229,0.12) 0%, transparent 65%)',
          bottom: -160, right: -160, pointerEvents: 'none',
        }} />
        {/* Subtle dot grid */}
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          backgroundImage: 'radial-gradient(rgba(255,255,255,0.04) 1px, transparent 1px)',
          backgroundSize: '28px 28px',
        }} />

        {/* Card */}
        <div style={{
          position: 'relative', zIndex: 1,
          background: 'white',
          borderRadius: 20,
          width: '100%', maxWidth: 400,
          padding: '40px 36px 36px',
          boxShadow: '0 32px 72px rgba(0,0,0,0.45), 0 0 0 1px rgba(255,255,255,0.06)',
        }}>

          {/* Top gradient accent bar */}
          <div style={{
            position: 'absolute', top: 0, left: 0, right: 0, height: 4,
            background: 'linear-gradient(90deg, #7c3aed 0%, #6366f1 50%, #4f46e5 100%)',
            borderRadius: '20px 20px 0 0',
          }} />

          {/* Logo mark */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 28 }}>
            <div style={{
              width: 36, height: 36, borderRadius: 10,
              background: 'linear-gradient(135deg, #7c3aed, #4f46e5)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 4px 14px rgba(124,58,237,0.4)',
              flexShrink: 0,
            }}>
              <span style={{ color: 'white', fontSize: 10, fontWeight: 800, letterSpacing: '0.05em' }}>CRM</span>
            </div>
            <span style={{ fontWeight: 700, fontSize: 16, color: '#111827', letterSpacing: '-0.3px' }}>CRM</span>
          </div>

          {/* Heading */}
          <h1 style={{ fontSize: 22, fontWeight: 700, color: '#0f172a', marginBottom: 4, letterSpacing: '-0.4px' }}>
            Welcome back
          </h1>
          <p style={{ fontSize: 13.5, color: '#94a3b8', marginBottom: 28 }}>
            Sign in to your workspace
          </p>

          {/* Status message */}
          {status && (
            <div style={{
              marginBottom: 20, fontSize: 13, color: '#065f46',
              background: '#ecfdf5', borderRadius: 10, padding: '10px 14px',
              border: '1px solid #a7f3d0',
            }}>
              {status}
            </div>
          )}

          <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>

            {/* Email */}
            <div>
              <label htmlFor="email" style={{
                display: 'block', fontSize: 12, fontWeight: 600,
                color: '#475569', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em',
              }}>
                Email
              </label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                autoFocus
                value={data.email}
                onChange={e => setData('email', e.target.value)}
                placeholder="you@company.com"
                className="h-10 text-[13.5px]"
                style={errors.email ? { borderColor: '#f87171' } : {}}
              />
              {errors.email && (
                <p style={{ color: '#ef4444', fontSize: 11.5, marginTop: 5 }}>{errors.email}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" style={{
                display: 'block', fontSize: 12, fontWeight: 600,
                color: '#475569', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em',
              }}>
                Password
              </label>
              <div style={{ position: 'relative' }}>
                <Input
                  id="password"
                  type={showPass ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={data.password}
                  onChange={e => setData('password', e.target.value)}
                  placeholder="••••••••"
                  className="h-10 text-[13.5px] pr-10"
                  style={errors.password ? { borderColor: '#f87171' } : {}}
                />
                <button
                  type="button"
                  tabIndex={-1}
                  onClick={() => setShowPass(v => !v)}
                  style={{
                    position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                    color: '#94a3b8', background: 'none', border: 'none', cursor: 'pointer', padding: 0,
                    display: 'flex', alignItems: 'center',
                  }}
                >
                  {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              {errors.password && (
                <p style={{ color: '#ef4444', fontSize: 11.5, marginTop: 5 }}>{errors.password}</p>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={processing}
              style={{
                marginTop: 4,
                height: 42, borderRadius: 10, border: 'none', cursor: processing ? 'not-allowed' : 'pointer',
                background: processing ? '#c4b5fd' : 'linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%)',
                color: 'white', fontWeight: 600, fontSize: 14,
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                boxShadow: processing ? 'none' : '0 4px 16px rgba(124,58,237,0.35)',
                transition: 'all 0.15s ease',
                letterSpacing: '-0.1px',
              }}
            >
              {processing ? (
                <>
                  <span style={{
                    width: 15, height: 15, border: '2px solid rgba(255,255,255,0.3)',
                    borderTopColor: 'white', borderRadius: '50%',
                    animation: 'spin 0.7s linear infinite', display: 'inline-block',
                  }} />
                  Signing in…
                </>
              ) : 'Sign in →'}
            </button>
          </form>

          {/* Footer */}
          <p style={{
            textAlign: 'center', fontSize: 11.5, color: '#cbd5e1', marginTop: 24,
            paddingTop: 20, borderTop: '1px solid #f1f5f9',
          }}>
            Internal tool — authorised access only
          </p>
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </>
  )
}
