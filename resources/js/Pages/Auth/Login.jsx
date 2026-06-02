import { useForm, Head, Link } from '@inertiajs/react'
import { Input } from '@/Components/ui/input'
import { Eye, EyeOff } from 'lucide-react'
import { useState } from 'react'
import Logo from '@/Components/Common/Logo'

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

      <div className="login-root">
        <div className="login-card">

          {/* Brand */}
          <div className="login-brand">
            <Logo size={40} showText={false} />
            <span className="login-brand-name">CRM</span>
          </div>

          <h1 className="login-title">Welcome back</h1>
          <p className="login-subtitle">Sign in to your workspace</p>

          {status && (
            <div style={{
              marginBottom: 20, fontSize: 13, color: '#065f46',
              background: '#ecfdf5', borderRadius: 8, padding: '10px 14px',
              border: '1px solid #a7f3d0',
            }}>
              {status}
            </div>
          )}

          <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>

            {/* Email */}
            <div>
              <label htmlFor="email" style={{
                display: 'block', fontSize: 12.5, fontWeight: 600,
                color: '#374151', marginBottom: 6, letterSpacing: '-0.1px',
              }}>
                Email address
              </label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                autoFocus
                value={data.email}
                onChange={e => setData('email', e.target.value)}
                placeholder="you@company.com"
                className="h-11 text-[13.5px] bg-white border-slate-200"
                style={errors.email ? { borderColor: '#f87171' } : {}}
              />
              {errors.email && (
                <p style={{ color: '#ef4444', fontSize: 11.5, marginTop: 5 }}>{errors.email}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" style={{
                display: 'block', fontSize: 12.5, fontWeight: 600,
                color: '#374151', marginBottom: 6, letterSpacing: '-0.1px',
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
                  className="h-11 text-[13.5px] pr-10 bg-white border-slate-200"
                  style={errors.password ? { borderColor: '#f87171' } : {}}
                />
                <button
                  type="button"
                  tabIndex={-1}
                  onClick={() => setShowPass(v => !v)}
                  style={{
                    position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                    color: '#94a3b8', background: 'none', border: 'none',
                    cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center',
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
              className="login-btn"
              style={{
                marginTop: 6,
                background: processing ? 'rgba(15,23,42,0.45)' : '#0f172a',
                cursor: processing ? 'not-allowed' : 'pointer',
              }}
            >
              {processing ? (
                <>
                  <span className="login-spinner" />
                  Signing in…
                </>
              ) : 'Sign in'}
            </button>
          </form>

          <p style={{ textAlign: 'center', fontSize: 13, color: '#94a3b8', marginTop: 22 }}>
            Don't have an account?{' '}
            <Link href={route('register')} style={{ color: '#0f172a', fontWeight: 600 }}>Create workspace</Link>
          </p>
        </div>
      </div>

      <style>{`
        .login-root {
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 100vh;
          padding: 24px;
          background: #F4F2FF;
          font-family: -apple-system, BlinkMacSystemFont, "Inter", "Segoe UI", sans-serif;
        }

        /* Single centered card */
        .login-card {
          width: 100%;
          max-width: 400px;
          background: #ffffff;
          border: 1px solid rgba(0,0,0,0.06);
          border-radius: 18px;
          padding: 40px 36px;
          box-shadow: 0 20px 60px rgba(79,70,229,0.10), 0 2px 8px rgba(0,0,0,0.04);
        }

        .login-brand {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 28px;
        }
        .login-brand-name {
          font-size: 17px;
          font-weight: 800;
          letter-spacing: -0.4px;
          color: #0f172a;
        }

        .login-title {
          font-size: 24px;
          font-weight: 700;
          letter-spacing: -0.8px;
          color: #0f172a;
          margin-bottom: 5px;
        }
        .login-subtitle {
          font-size: 13.5px;
          color: #94a3b8;
          margin-bottom: 30px;
        }

        /* Submit button */
        .login-btn {
          height: 44px;
          border-radius: 9px;
          border: none;
          color: white;
          font-weight: 600;
          font-size: 14px;
          letter-spacing: -0.2px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          transition: background 0.15s ease, opacity 0.15s ease;
        }
        .login-btn:not(:disabled):hover {
          background: #1e293b !important;
        }

        /* Spinner */
        .login-spinner {
          width: 14px; height: 14px;
          border: 2px solid rgba(255,255,255,0.25);
          border-top-color: white;
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
          display: inline-block;
          flex-shrink: 0;
        }

        @keyframes spin { to { transform: rotate(360deg); } }

        @media (max-width: 480px) {
          .login-card { padding: 32px 24px; }
        }
      `}</style>
    </>
  )
}
