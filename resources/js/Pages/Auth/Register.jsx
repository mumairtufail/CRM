import { useForm, Head, Link } from '@inertiajs/react'
import { Input } from '@/Components/ui/input'
import { Eye, EyeOff, Check, Building, Globe, User, Mail, Lock, ArrowLeft, ArrowRight } from 'lucide-react'
import { useState, useCallback } from 'react'
import Logo from '@/Components/Common/Logo'
// Google sign-in is still being finished (see routes/auth.php) — temporarily disabled.
// import GoogleButton from '@/Components/Auth/GoogleButton'
import { motion, AnimatePresence } from 'framer-motion'

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
  const [step, setStep] = useState(1)

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

  const handleNextStep = (e) => {
    e.preventDefault()
    
    // Validate Step 1 fields
    const workspaceErr = validateField('workspace', data)
    const slugErr = validateField('slug', data)
    
    setTouched(t => ({ ...t, workspace: true, slug: true }))
    
    if (workspaceErr || slugErr) {
      if (workspaceErr) document.getElementById('workspace')?.focus()
      else document.getElementById('slug')?.focus()
      return
    }
    
    setStep(2)
  }

  const handlePrevStep = (e) => {
    e.preventDefault()
    setStep(1)
  }

  const submit = (e) => {
    e.preventDefault()

    // Run full client validation before hitting the server.
    const step2Fields = ['name', 'email', 'password', 'password_confirmation']
    const firstInvalid = step2Fields.find(f => validateField(f, data))
    
    setTouched(t => {
      const nextTouched = { ...t }
      step2Fields.forEach(f => { nextTouched[f] = true })
      return nextTouched
    })
    
    if (firstInvalid) {
      document.getElementById(firstInvalid)?.focus()
      return
    }

    post(route('register'), { onFinish: () => reset('password', 'password_confirmation') })
  }

  const pwOk = data.password.length >= 8
  const pwMatch = data.password_confirmation && data.password_confirmation === data.password

  return (
    <>
      <Head title="Create your workspace" />

      <div className="login-root">
        <div className="login-card">
          <div className="card-content">
            {/* Brand */}
            <div className="login-brand">
              <Logo size={28} showText={true} text="LumeniaCRM" textColor="text-slate-900" textClassName="text-[17px] font-bold" />
            </div>

            <div className="login-header">
              <h1 className="login-title">Create workspace</h1>
              <p className="login-subtitle">Set up your sales dashboard in seconds</p>
            </div>

            {/*
            <GoogleButton label="Sign up with Google" />

            <div className="flex items-center gap-3 my-5 text-slate-400 text-[11.5px] font-medium uppercase tracking-wider">
              <span className="flex-1 h-px bg-slate-200" />
              or use your email
              <span className="flex-1 h-px bg-slate-200" />
            </div>
            */}

            {/* Step Progress bar */}
            <div className="progress-container">
              <div className="progress-bar">
                <div 
                  className="progress-fill" 
                  style={{ width: step === 1 ? '50%' : '100%' }}
                />
              </div>
              <div className="progress-steps">
                <span className={`progress-step-text ${step === 1 ? 'active' : ''}`}>1. Company</span>
                <span className={`progress-step-text ${step === 2 ? 'active' : ''}`}>2. Account</span>
              </div>
            </div>

            {/* noValidate disables the browser's native validation bubbles in favor of our inline messages */}
            <form onSubmit={step === 1 ? handleNextStep : submit} noValidate>
              <AnimatePresence mode="wait">
                {step === 1 ? (
                  <motion.div
                    key="step1"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.15 }}
                    className="step-section"
                  >
                    <div className="form-grid">
                      {/* Workspace name */}
                      <div className="form-group">
                        <label htmlFor="workspace" className="form-label">Workspace name<Asterisk /></label>
                        <div className="input-wrapper">
                          <div className="input-icon">
                            <Building size={16} />
                          </div>
                          <Input
                            id="workspace"
                            autoFocus
                            value={data.workspace}
                            onChange={e => setData('workspace', e.target.value)}
                            onBlur={() => markTouched('workspace')}
                            placeholder="Acme Inc."
                            aria-invalid={!!errorFor('workspace')}
                            className="login-input"
                            style={errorFor('workspace') ? { borderColor: '#ef4444', boxShadow: '0 0 0 1px #ef4444' } : {}}
                          />
                        </div>
                        {errorFor('workspace') && <p className="error-text">{errorFor('workspace')}</p>}
                      </div>

                      {/* Workspace URL (slug, optional) */}
                      <div className="form-group">
                        <label htmlFor="slug" className="form-label">
                          Workspace URL <span className="label-optional">(optional)</span>
                        </label>
                        <div className="input-wrapper">
                          <div className="input-icon">
                            <Globe size={16} />
                          </div>
                          <Input
                            id="slug"
                            value={data.slug}
                            onChange={e => setData('slug', e.target.value.toLowerCase().replace(/\s+/g, '-'))}
                            onBlur={() => markTouched('slug')}
                            placeholder="acme"
                            aria-invalid={!!errorFor('slug')}
                            className={`login-input ${appDomain ? 'pr-24' : ''}`}
                            style={errorFor('slug') ? { borderColor: '#ef4444', boxShadow: '0 0 0 1px #ef4444' } : {}}
                          />
                          {appDomain && (
                            <span className="domain-suffix">
                              .{appDomain}
                            </span>
                          )}
                        </div>
                        {errorFor('slug') ? (
                          <p className="error-text">{errorFor('slug')}</p>
                        ) : (
                          <p className="input-hint">
                            Used in public link. Leaves blank to auto-generate.
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Continue Button */}
                    <button
                      type="submit"
                      className="submit-btn"
                      style={{ marginTop: 12 }}
                    >
                      Continue
                      <ArrowRight size={16} />
                    </button>
                  </motion.div>
                ) : (
                  <motion.div
                    key="step2"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.15 }}
                    className="step-section"
                  >
                    <div className="form-grid">
                      {/* Your name */}
                      <div className="form-group">
                        <label htmlFor="name" className="form-label">Your name<Asterisk /></label>
                        <div className="input-wrapper">
                          <div className="input-icon">
                            <User size={16} />
                          </div>
                          <Input
                            id="name"
                            autoComplete="name"
                            autoFocus
                            value={data.name}
                            onChange={e => setData('name', e.target.value)}
                            onBlur={() => markTouched('name')}
                            placeholder="Jane Doe"
                            aria-invalid={!!errorFor('name')}
                            className="login-input"
                            style={errorFor('name') ? { borderColor: '#ef4444', boxShadow: '0 0 0 1px #ef4444' } : {}}
                          />
                        </div>
                        {errorFor('name') && <p className="error-text">{errorFor('name')}</p>}
                      </div>

                      {/* Email */}
                      <div className="form-group">
                        <label htmlFor="email" className="form-label">Email address<Asterisk /></label>
                        <div className="input-wrapper">
                          <div className="input-icon">
                            <Mail size={16} />
                          </div>
                          <Input
                            id="email"
                            type="email"
                            autoComplete="username"
                            value={data.email}
                            onChange={e => setData('email', e.target.value)}
                            onBlur={() => markTouched('email')}
                            placeholder="you@company.com"
                            aria-invalid={!!errorFor('email')}
                            className="login-input"
                            style={errorFor('email') ? { borderColor: '#ef4444', boxShadow: '0 0 0 1px #ef4444' } : {}}
                          />
                        </div>
                        {errorFor('email') && <p className="error-text">{errorFor('email')}</p>}
                      </div>
                    </div>

                    <div className="form-grid">
                      {/* Password */}
                      <div className="form-group">
                        <label htmlFor="password" className="form-label">Password<Asterisk /></label>
                        <div className="input-wrapper">
                          <div className="input-icon">
                            <Lock size={16} />
                          </div>
                          <Input
                            id="password"
                            type={showPass ? 'text' : 'password'}
                            autoComplete="new-password"
                            value={data.password}
                            onChange={e => setData('password', e.target.value)}
                            onBlur={() => markTouched('password')}
                            placeholder="••••••••"
                            aria-invalid={!!errorFor('password')}
                            className="login-input pr-10"
                            style={errorFor('password') ? { borderColor: '#ef4444', boxShadow: '0 0 0 1px #ef4444' } : {}}
                          />
                          <button
                            type="button"
                            tabIndex={-1}
                            onClick={() => setShowPass(v => !v)}
                            className="password-toggle"
                          >
                            {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                          </button>
                        </div>
                        {errorFor('password') ? (
                          <p className="error-text">{errorFor('password')}</p>
                        ) : (
                          <p className="input-hint" style={{ color: pwOk ? '#10b981' : '#94a3b8', display: 'flex', alignItems: 'center', gap: 4 }}>
                            {pwOk && <Check size={12} />} At least 8 characters
                          </p>
                        )}
                      </div>

                      {/* Confirm password */}
                      <div className="form-group">
                        <label htmlFor="password_confirmation" className="form-label">Confirm password<Asterisk /></label>
                        <div className="input-wrapper">
                          <div className="input-icon">
                            <Lock size={16} />
                          </div>
                          <Input
                            id="password_confirmation"
                            type={showPass ? 'text' : 'password'}
                            autoComplete="new-password"
                            value={data.password_confirmation}
                            onChange={e => setData('password_confirmation', e.target.value)}
                            onBlur={() => markTouched('password_confirmation')}
                            placeholder="••••••••"
                            aria-invalid={!!errorFor('password_confirmation')}
                            className="login-input pr-10"
                            style={errorFor('password_confirmation') ? { borderColor: '#ef4444', boxShadow: '0 0 0 1px #ef4444' } : {}}
                          />
                          {pwMatch && (
                            <Check size={16} className="text-emerald-500" style={{
                              position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)',
                            }} />
                          )}
                        </div>
                        {errorFor('password_confirmation') && <p className="error-text">{errorFor('password_confirmation')}</p>}
                      </div>
                    </div>

                    {/* Actions row */}
                    <div className="actions-row">
                      <button
                        type="button"
                        onClick={handlePrevStep}
                        className="back-btn"
                      >
                        <ArrowLeft size={16} />
                        Back
                      </button>
                      
                      <button
                        type="submit"
                        disabled={processing}
                        className="submit-btn flex-1"
                      >
                        {processing ? (
                          <>
                            <span className="btn-spinner" />
                            Creating…
                          </>
                        ) : (
                          <>
                            Register
                            <Check size={16} />
                          </>
                        )}
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </form>

            <div className="card-footer">
              <p>
                Already have an account?{' '}
                <Link href={route('login')} className="signup-link">Sign in</Link>
              </p>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .login-root {
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 100vh;
          padding: 24px;
          background: rgb(var(--brand-tint));
          position: relative;
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
        }

        /* Glassmorphic card styling - Light Mode */
        .login-card {
          width: 100%;
          max-width: 540px; /* Wider card to fit two columns comfortably */
          background: rgba(255, 255, 255, 0.88);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.6);
          border-radius: 20px;
          padding: 40px;
          box-shadow: 
            0 20px 40px -15px rgb(var(--brand-600) / 0.08),
            0 2px 10px rgba(0, 0, 0, 0.02);
          position: relative;
          z-index: 10;
          overflow: hidden;
          transition: max-width 0.3s ease;
        }

        .login-brand {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 24px;
        }

        .login-header {
          margin-bottom: 24px;
        }
        .login-title {
          font-size: 24px;
          font-weight: 700;
          letter-spacing: -0.6px;
          color: #0f172a;
          margin-bottom: 5px;
          line-height: 1.2;
        }
        .login-subtitle {
          font-size: 13.5px;
          color: #64748b;
          font-weight: 400;
        }

        /* Progress Steps Indicator */
        .progress-container {
          margin-bottom: 24px;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .progress-bar {
          height: 4px;
          width: 100%;
          background: rgba(0, 0, 0, 0.05);
          border-radius: 2px;
          overflow: hidden;
        }
        .progress-fill {
          height: 100%;
          background: linear-gradient(90deg, rgb(var(--brand-600)) 0%, rgb(var(--brand2-600)) 100%);
          transition: width 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .progress-steps {
          display: flex;
          justify-content: space-between;
        }
        .progress-step-text {
          font-size: 11px;
          font-weight: 600;
          color: #94a3b8;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          transition: color 0.3s ease;
        }
        .progress-step-text.active {
          color: rgb(var(--brand-600));
        }

        .step-section {
          display: flex;
          flex-direction: column;
          gap: 18px;
        }

        /* Form Grid (Two Columns) */
        .form-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 6px;
          min-width: 0; /* Prevents flex/grid blowouts */
        }

        .form-label {
          font-size: 12.5px;
          font-weight: 600;
          color: #374151;
          letter-spacing: -0.1px;
        }
        .label-optional {
          color: #94a3b8;
          font-weight: 400;
          font-size: 11.5px;
        }

        /* Input styling */
        .input-wrapper {
          position: relative;
          display: flex;
          align-items: center;
        }
        .input-icon {
          position: absolute;
          left: 14px;
          color: #94a3b8;
          display: flex;
          align-items: center;
          pointer-events: none;
          transition: color 0.2s ease;
        }
        .login-input {
          height: 44px !important;
          padding-left: 42px !important;
          font-size: 13.5px !important;
          color: #0f172a !important;
          background: #ffffff !important;
          border: 1px solid #e2e8f0 !important;
          border-radius: 10px !important;
          transition: all 0.2s ease !important;
          width: 100% !important;
        }
        .login-input::placeholder {
          color: #cbd5e1;
        }
        .login-input:hover {
          border-color: #cbd5e1 !important;
        }
        .login-input:focus {
          border-color: rgb(var(--brand-600)) !important;
          background: #ffffff !important;
          box-shadow: 0 0 0 3px rgb(var(--brand-600) / 0.12) !important;
        }
        .input-wrapper:focus-within .input-icon {
          color: rgb(var(--brand-600));
        }

        .domain-suffix {
          position: absolute;
          right: 14px;
          color: #64748b;
          font-size: 13.5px;
          pointer-events: none;
          font-weight: 500;
        }

        .password-toggle {
          position: absolute;
          right: 14px;
          color: #94a3b8;
          background: none;
          border: none;
          cursor: pointer;
          padding: 0;
          display: flex;
          align-items: center;
          transition: color 0.15s ease;
        }
        .password-toggle:hover {
          color: #475569;
        }

        .error-text {
          color: #ef4444;
          font-size: 11.5px;
          margin-top: 4px;
          font-weight: 500;
        }

        .input-hint {
          color: #64748b;
          font-size: 11px;
          margin-top: 4px;
          line-height: 1.4;
        }

        .actions-row {
          display: flex;
          gap: 12px;
          margin-top: 10px;
        }

        .back-btn {
          height: 44px;
          padding: 0 18px;
          border-radius: 10px;
          border: 1px solid #e2e8f0;
          background: #ffffff;
          color: #475569;
          font-weight: 600;
          font-size: 13.5px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .back-btn:hover {
          background: #f8fafc;
          color: #0f172a;
          border-color: #cbd5e1;
        }

        /* Gradient submit button */
        .submit-btn {
          height: 44px;
          border-radius: 10px;
          border: none;
          color: #ffffff;
          font-weight: 600;
          font-size: 14px;
          letter-spacing: -0.2px;
          background: linear-gradient(135deg, rgb(var(--brand-600)) 0%, rgb(var(--brand2-600)) 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          cursor: pointer;
          box-shadow: 0 4px 12px rgb(var(--brand-600) / 0.18);
          transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .submit-btn:not(:disabled):hover {
          background: linear-gradient(135deg, rgb(var(--brand-500)) 0%, #5b52f9 100%);
          box-shadow: 0 6px 16px rgb(var(--brand-600) / 0.25);
          transform: translateY(-1px);
        }
        .submit-btn:not(:disabled):active {
          transform: translateY(1px);
        }
        .submit-btn:disabled {
          background: #e2e8f0;
          color: #94a3b8;
          cursor: not-allowed;
          box-shadow: none;
        }

        .btn-spinner {
          width: 14px;
          height: 14px;
          border: 2px solid rgba(255, 255, 255, 0.25);
          border-top-color: #ffffff;
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
          display: inline-block;
          flex-shrink: 0;
        }
        @keyframes spin { to { transform: rotate(360deg); } }

        .card-footer {
          margin-top: 24px;
          text-align: center;
          font-size: 13px;
          color: #64748b;
          border-top: 1px solid #f1f5f9;
          padding-top: 18px;
        }
        .signup-link {
          color: rgb(var(--brand-600));
          font-weight: 600;
          text-decoration: none;
          transition: color 0.15s ease;
        }
        .signup-link:hover {
          color: rgb(var(--brand-700));
        }

        @media (max-width: 600px) {
          .login-card {
            padding: 32px 20px;
            border-radius: 16px;
            max-width: 100%;
          }
          .form-grid {
            grid-template-columns: 1fr;
            gap: 14px;
          }
          .login-title {
            font-size: 21px;
          }
        }
      `}</style>
    </>
  )
}
