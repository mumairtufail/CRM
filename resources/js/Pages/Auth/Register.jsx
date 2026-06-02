import { useForm, Head, Link } from '@inertiajs/react'
import { Input } from '@/Components/ui/input'
import { Eye, EyeOff, Check } from 'lucide-react'
import { useState, useCallback } from 'react'
import Logo from '@/Components/Common/Logo'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

// Pure, dependency-free field validation. Returns '' when the field is valid.
function validateField(field, data) {
  switch (field) {
    case 'workspace':
      return data.workspace.trim() ? '' : 'Workspace name is required.'
    case 'slug':
      if (!data.slug) return '' // optional
      return SLUG_RE.test(data.slug) ? '' : 'Use lowercase letters, numbers and hyphens only.'
    case 'name':
      return data.name.trim() ? '' : 'Your name is required.'
    case 'email':
      if (!data.email.trim()) return 'Email address is required.'
      return EMAIL_RE.test(data.email) ? '' : 'Enter a valid email address.'
    case 'password':
      if (!data.password) return 'Password is required.'
      return data.password.length >= 8 ? '' : 'Must be at least 8 characters.'
    case 'password_confirmation':
      if (!data.password_confirmation) return 'Please confirm your password.'
      return data.password_confirmation === data.password ? '' : 'Passwords do not match.'
    default:
      return ''
  }
}

const FIELDS = ['workspace', 'slug', 'name', 'email', 'password', 'password_confirmation']

function Asterisk() {
  return <span style={{ color: '#ef4444', marginLeft: 2 }}>*</span>
}

export default function Register({ appDomain }) {
  const [showPass, setShowPass] = useState(false)
  const [touched, setTouched] = useState({})

  const { data, setData, post, processing, errors, reset } = useForm({
    workspace: '',
    slug: '',
    name: '',
    email: '',
    password: '',
    password_confirmation: '',
  })

  // Client error shows once a field is touched; server errors always show.
  const errorFor = useCallback((field) => {
    if (errors[field]) return errors[field]
    if (touched[field]) return validateField(field, data)
    return ''
  }, [errors, touched, data])

  const markTouched = useCallback((field) => {
    setTouched(t => (t[field] ? t : { ...t, [field]: true }))
  }, [])

  const submit = (e) => {
    e.preventDefault()

    // Run full client validation before hitting the server.
    const firstInvalid = FIELDS.find(f => validateField(f, data))
    setTouched(Object.fromEntries(FIELDS.map(f => [f, true])))
    if (firstInvalid) {
      document.getElementById(firstInvalid)?.focus()
      return
    }

    post(route('register'), { onFinish: () => reset('password', 'password_confirmation') })
  }

  const labelStyle = {
    display: 'block', fontSize: 12.5, fontWeight: 600,
    color: '#374151', marginBottom: 6, letterSpacing: '-0.1px',
  }
  const errStyle = { color: '#ef4444', fontSize: 11.5, marginTop: 5 }
  const baseInput = 'h-11 text-[13.5px] bg-white border-slate-200'
  const inputStyle = (field) => errorFor(field) ? { borderColor: '#f87171' } : {}
  const pwOk = data.password.length >= 8
  const pwMatch = data.password_confirmation && data.password_confirmation === data.password

  return (
    <>
      <Head title="Create your workspace" />

      <div className="login-root">
        <div className="login-card">

          {/* Brand */}
          <div className="login-brand">
            <Logo size={40} showText={false} />
            <span className="login-brand-name">CRM</span>
          </div>

          <h1 className="login-title">Create your workspace</h1>
          <p className="login-subtitle">Start your team's CRM in seconds</p>

          {/* noValidate disables the browser's native validation bubbles in favor of our inline messages */}
          <form onSubmit={submit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>

            {/* Workspace name */}
            <div>
              <label htmlFor="workspace" style={labelStyle}>Workspace name<Asterisk /></label>
              <Input
                id="workspace"
                autoFocus
                value={data.workspace}
                onChange={e => setData('workspace', e.target.value)}
                onBlur={() => markTouched('workspace')}
                placeholder="Acme Inc."
                aria-invalid={!!errorFor('workspace')}
                className={baseInput}
                style={inputStyle('workspace')}
              />
              {errorFor('workspace') && <p style={errStyle}>{errorFor('workspace')}</p>}
            </div>

            {/* Workspace URL (slug, optional) */}
            <div>
              <label htmlFor="slug" style={labelStyle}>
                Workspace URL <span style={{ color: '#cbd5e1', fontWeight: 500 }}>(optional)</span>
              </label>
              <div style={{ position: 'relative' }}>
                <Input
                  id="slug"
                  value={data.slug}
                  onChange={e => setData('slug', e.target.value.toLowerCase().replace(/\s+/g, '-'))}
                  onBlur={() => markTouched('slug')}
                  placeholder="acme"
                  aria-invalid={!!errorFor('slug')}
                  className={`${baseInput} ${appDomain ? 'pr-24' : ''}`}
                  style={inputStyle('slug')}
                />
                {appDomain && (
                  <span style={{
                    position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                    color: '#94a3b8', fontSize: 12.5, pointerEvents: 'none',
                  }}>
                    .{appDomain}
                  </span>
                )}
              </div>
              {errorFor('slug')
                ? <p style={errStyle}>{errorFor('slug')}</p>
                : <p style={{ color: '#94a3b8', fontSize: 11, marginTop: 5 }}>
                    A unique ID for your workspace (used in your public lead-form link). Leave blank to auto-generate.
                  </p>}
            </div>

            {/* Your name */}
            <div>
              <label htmlFor="name" style={labelStyle}>Your name<Asterisk /></label>
              <Input
                id="name"
                autoComplete="name"
                value={data.name}
                onChange={e => setData('name', e.target.value)}
                onBlur={() => markTouched('name')}
                placeholder="Jane Doe"
                aria-invalid={!!errorFor('name')}
                className={baseInput}
                style={inputStyle('name')}
              />
              {errorFor('name') && <p style={errStyle}>{errorFor('name')}</p>}
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" style={labelStyle}>Email address<Asterisk /></label>
              <Input
                id="email"
                type="email"
                autoComplete="username"
                value={data.email}
                onChange={e => setData('email', e.target.value)}
                onBlur={() => markTouched('email')}
                placeholder="you@company.com"
                aria-invalid={!!errorFor('email')}
                className={baseInput}
                style={inputStyle('email')}
              />
              {errorFor('email') && <p style={errStyle}>{errorFor('email')}</p>}
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" style={labelStyle}>Password<Asterisk /></label>
              <div style={{ position: 'relative' }}>
                <Input
                  id="password"
                  type={showPass ? 'text' : 'password'}
                  autoComplete="new-password"
                  value={data.password}
                  onChange={e => setData('password', e.target.value)}
                  onBlur={() => markTouched('password')}
                  placeholder="••••••••"
                  aria-invalid={!!errorFor('password')}
                  className={`${baseInput} pr-10`}
                  style={inputStyle('password')}
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
              {errorFor('password')
                ? <p style={errStyle}>{errorFor('password')}</p>
                : <p style={{
                    fontSize: 11, marginTop: 5, display: 'flex', alignItems: 'center', gap: 4,
                    color: pwOk ? '#10b981' : '#94a3b8',
                  }}>
                    {pwOk && <Check size={12} />} At least 8 characters
                  </p>}
            </div>

            {/* Confirm password */}
            <div>
              <label htmlFor="password_confirmation" style={labelStyle}>Confirm password<Asterisk /></label>
              <div style={{ position: 'relative' }}>
                <Input
                  id="password_confirmation"
                  type={showPass ? 'text' : 'password'}
                  autoComplete="new-password"
                  value={data.password_confirmation}
                  onChange={e => setData('password_confirmation', e.target.value)}
                  onBlur={() => markTouched('password_confirmation')}
                  placeholder="••••••••"
                  aria-invalid={!!errorFor('password_confirmation')}
                  className={`${baseInput} pr-10`}
                  style={inputStyle('password_confirmation')}
                />
                {pwMatch && (
                  <Check size={15} className="text-emerald-500" style={{
                    position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                  }} />
                )}
              </div>
              {errorFor('password_confirmation') && <p style={errStyle}>{errorFor('password_confirmation')}</p>}
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
              {processing ? (<><span className="login-spinner" />Creating workspace…</>) : 'Create workspace'}
            </button>
          </form>

          <p style={{ textAlign: 'center', fontSize: 13, color: '#94a3b8', marginTop: 22 }}>
            Already have an account?{' '}
            <Link href={route('login')} style={{ color: '#0f172a', fontWeight: 600 }}>Sign in</Link>
          </p>
        </div>
      </div>

      <style>{`
        .login-root {
          display: flex; align-items: center; justify-content: center;
          min-height: 100vh; padding: 24px; background: #F4F2FF;
          font-family: -apple-system, BlinkMacSystemFont, "Inter", "Segoe UI", sans-serif;
        }
        .login-card {
          width: 100%; max-width: 420px; background: #ffffff;
          border: 1px solid rgba(0,0,0,0.06); border-radius: 18px;
          padding: 40px 36px;
          box-shadow: 0 20px 60px rgba(79,70,229,0.10), 0 2px 8px rgba(0,0,0,0.04);
        }
        .login-brand { display: flex; align-items: center; gap: 10px; margin-bottom: 28px; }
        .login-brand-name { font-size: 17px; font-weight: 800; letter-spacing: -0.4px; color: #0f172a; }
        .login-title { font-size: 24px; font-weight: 700; letter-spacing: -0.8px; color: #0f172a; margin-bottom: 5px; }
        .login-subtitle { font-size: 13.5px; color: #94a3b8; margin-bottom: 30px; }
        .login-btn {
          height: 44px; border-radius: 9px; border: none; color: white;
          font-weight: 600; font-size: 14px; letter-spacing: -0.2px;
          display: flex; align-items: center; justify-content: center; gap: 8px;
          transition: background 0.15s ease, opacity 0.15s ease;
        }
        .login-btn:not(:disabled):hover { background: #1e293b !important; }
        .login-spinner {
          width: 14px; height: 14px; border: 2px solid rgba(255,255,255,0.25);
          border-top-color: white; border-radius: 50%;
          animation: spin 0.7s linear infinite; display: inline-block; flex-shrink: 0;
        }
        @keyframes spin { to { transform: rotate(360deg); } }
        @media (max-width: 480px) { .login-card { padding: 32px 24px; } }
      `}</style>
    </>
  )
}
