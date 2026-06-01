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

      <div className="login-root">

        {/* ── Left panel ── */}
        <div className="login-left">
          {/* Brand */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
            <div style={{
              width: 26, height: 26, borderRadius: 6,
              background: 'linear-gradient(135deg, #7c3aed, #4f46e5)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}>
              <span style={{ color: 'white', fontSize: 7, fontWeight: 800, letterSpacing: '0.04em' }}>CRM</span>
            </div>
            <span style={{ color: 'white', fontWeight: 700, fontSize: 15, letterSpacing: '-0.3px' }}>CRM</span>
          </div>

          {/* Main copy */}
          <div>
            <p style={{
              fontSize: 11, fontWeight: 600, letterSpacing: '0.14em',
              textTransform: 'uppercase', color: 'rgba(255,255,255,0.28)',
              marginBottom: 18,
            }}>
              Workspace
            </p>
            <h2 style={{
              fontSize: 46, fontWeight: 800, lineHeight: 1.08,
              letterSpacing: '-2.5px', color: '#fff',
              marginBottom: 22,
            }}>
              Your pipeline,<br />your pace.
            </h2>
            <p style={{
              fontSize: 14.5, lineHeight: 1.65,
              color: 'rgba(255,255,255,0.38)', maxWidth: 320,
            }}>
              Manage leads, track activities,<br />and close deals — all in one place.
            </p>
          </div>

          {/* Footer */}
          <div>
            <div style={{ height: 1, background: 'rgba(255,255,255,0.07)', marginBottom: 18 }} />
            <p style={{ fontSize: 11.5, color: 'rgba(255,255,255,0.18)', letterSpacing: '0.01em' }}>
              Internal tool — authorised access only
            </p>
          </div>
        </div>

        {/* ── Right panel ── */}
        <div className="login-right">
          <div style={{ width: '100%', maxWidth: 348 }}>

            <h1 style={{
              fontSize: 24, fontWeight: 700, letterSpacing: '-0.8px',
              color: '#0f172a', marginBottom: 5,
            }}>
              Welcome back
            </h1>
            <p style={{ fontSize: 13.5, color: '#94a3b8', marginBottom: 34 }}>
              Sign in to your workspace
            </p>

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
          </div>
        </div>
      </div>

      <style>{`
        .login-root {
          display: flex;
          min-height: 100vh;
          font-family: -apple-system, BlinkMacSystemFont, "Inter", "Segoe UI", sans-serif;
        }

        /* Left dark panel */
        .login-left {
          flex: 0 0 48%;
          background: #090910;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          padding: 44px 52px;
          position: relative;
        }
        .login-left::after {
          content: '';
          position: absolute;
          top: 0; right: 0;
          width: 1px; height: 100%;
          background: rgba(255,255,255,0.055);
        }

        /* Right light panel */
        .login-right {
          flex: 1;
          background: #f8f7ff;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 48px 52px;
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

        /* Mobile: stack vertically, hide left panel */
        @media (max-width: 640px) {
          .login-root { flex-direction: column; }
          .login-left {
            flex: none;
            padding: 32px 28px 28px;
          }
          .login-left::after { display: none; }
          .login-left h2 { font-size: 30px; letter-spacing: -1.5px; }
          .login-right { padding: 40px 28px; }
        }
      `}</style>
    </>
  )
}
