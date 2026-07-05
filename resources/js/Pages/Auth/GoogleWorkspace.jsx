import { useForm, Head, Link } from '@inertiajs/react'
import { Input } from '@/Components/ui/input'
import { Building, Globe, ArrowRight, User as UserIcon } from 'lucide-react'
import { useCallback, useState } from 'react'
import Logo from '@/Components/Common/Logo'

const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

function validateField(field, data) {
  switch (field) {
    case 'workspace':
      return data.workspace.trim() ? '' : 'Workspace name is required.'
    case 'slug':
      if (!data.slug) return ''
      return SLUG_RE.test(data.slug) ? '' : 'Use lowercase letters, numbers and hyphens only.'
    default:
      return ''
  }
}

function Asterisk() {
  return <span style={{ color: '#ef4444', marginLeft: 2 }}>*</span>
}

export default function GoogleWorkspace({ name, email, avatar, appDomain }) {
  const [touched, setTouched] = useState({})

  const { data, setData, post, processing, errors } = useForm({
    workspace: '',
    slug: '',
  })

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

    const workspaceErr = validateField('workspace', data)
    const slugErr = validateField('slug', data)

    setTouched(t => ({ ...t, workspace: true, slug: true }))

    if (workspaceErr || slugErr) {
      if (workspaceErr) document.getElementById('workspace')?.focus()
      else document.getElementById('slug')?.focus()
      return
    }

    post(route('register.google.workspace'))
  }

  return (
    <>
      <Head title="Almost there" />

      <div className="login-root">
        <div className="login-card">
          <div className="card-content">
            <div className="login-brand">
              <Logo size={28} showText={true} text="LumeniaCRM" textColor="text-slate-900" textClassName="text-[17px] font-bold" />
            </div>

            <div className="login-header">
              <h1 className="login-title">Almost there</h1>
              <p className="login-subtitle">Just name your workspace to finish signing in</p>
            </div>

            <div className="google-preview">
              {avatar ? (
                <img src={avatar} alt="" className="google-preview-avatar" />
              ) : (
                <div className="google-preview-avatar google-preview-avatar-fallback">
                  <UserIcon size={16} />
                </div>
              )}
              <div className="google-preview-text">
                <div className="google-preview-name">{name}</div>
                <div className="google-preview-email">{email}</div>
              </div>
              <Link href={route('login')} className="google-preview-not-you">Not you?</Link>
            </div>

            <form onSubmit={submit} noValidate>
              <div className="form-grid">
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

              <button
                type="submit"
                disabled={processing}
                className="submit-btn"
                style={{ marginTop: 12 }}
              >
                {processing ? (
                  <>
                    <span className="btn-spinner" />
                    Creating…
                  </>
                ) : (
                  <>
                    Continue
                    <ArrowRight size={16} />
                  </>
                )}
              </button>
            </form>
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
          background: #F4F2FF;
          position: relative;
          font-family: 'Poppins', -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
        }

        .login-card {
          width: 100%;
          max-width: 460px;
          background: rgba(255, 255, 255, 0.88);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.6);
          border-radius: 20px;
          padding: 40px;
          box-shadow:
            0 20px 40px -15px rgba(124, 58, 237, 0.08),
            0 2px 10px rgba(0, 0, 0, 0.02);
          position: relative;
          z-index: 10;
          overflow: hidden;
        }

        .login-brand {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 24px;
        }

        .login-header {
          margin-bottom: 20px;
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

        .google-preview {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 14px;
          margin-bottom: 24px;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
        }
        .google-preview-avatar {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          flex-shrink: 0;
          object-fit: cover;
        }
        .google-preview-avatar-fallback {
          display: flex;
          align-items: center;
          justify-content: center;
          background: #e2e8f0;
          color: #64748b;
        }
        .google-preview-text {
          flex: 1;
          min-width: 0;
        }
        .google-preview-name {
          font-size: 13.5px;
          font-weight: 600;
          color: #0f172a;
          line-height: 1.3;
        }
        .google-preview-email {
          font-size: 12px;
          color: #64748b;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .google-preview-not-you {
          font-size: 12px;
          font-weight: 600;
          color: #7c3aed;
          text-decoration: none;
          flex-shrink: 0;
        }
        .google-preview-not-you:hover {
          color: #6d28d9;
        }

        .form-grid {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 6px;
          min-width: 0;
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
          border-color: #7c3aed !important;
          background: #ffffff !important;
          box-shadow: 0 0 0 3px rgba(124, 58, 237, 0.12) !important;
        }
        .input-wrapper:focus-within .input-icon {
          color: #7c3aed;
        }

        .domain-suffix {
          position: absolute;
          right: 14px;
          color: #64748b;
          font-size: 13.5px;
          pointer-events: none;
          font-weight: 500;
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

        .submit-btn {
          height: 44px;
          width: 100%;
          border-radius: 10px;
          border: none;
          color: #ffffff;
          font-weight: 600;
          font-size: 14px;
          letter-spacing: -0.2px;
          background: linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          cursor: pointer;
          box-shadow: 0 4px 12px rgba(124, 58, 237, 0.18);
          transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .submit-btn:not(:disabled):hover {
          background: linear-gradient(135deg, #8b5cf6 0%, #5b52f9 100%);
          box-shadow: 0 6px 16px rgba(124, 58, 237, 0.25);
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

        @media (max-width: 480px) {
          .login-card {
            padding: 32px 24px;
            border-radius: 16px;
          }
          .login-title {
            font-size: 21px;
          }
        }
      `}</style>
    </>
  )
}
