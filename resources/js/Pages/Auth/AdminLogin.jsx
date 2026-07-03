import { useForm, Head } from '@inertiajs/react'
import { Input } from '@/Components/ui/input'
import { Eye, EyeOff, Lock, Mail, Shield } from 'lucide-react'
import { useState } from 'react'
import Logo from '@/Components/Common/Logo'

export default function AdminLogin({ status }) {
  const [showPass, setShowPass] = useState(false)

  const { data, setData, post, processing, errors, reset } = useForm({
    email: '', password: '', remember: false,
  })

  const submit = e => {
    e.preventDefault()
    post(route('admin.login.store'), { onFinish: () => reset('password') })
  }

  return (
    <>
      <Head title="Platform Admin Sign In" />

      <div className="login-root">
        <div className="login-card">
          <div className="card-content">
            {/* Brand */}
            <div className="login-brand">
              <Logo size={28} showText={true} text="LumeniaCRM" textColor="text-slate-900" textClassName="text-[17px] font-bold" />
              <span className="admin-badge">Admin</span>
            </div>

            <div className="login-header">
              <h1 className="login-title">Admin sign in</h1>
              <p className="login-subtitle">Restricted to platform administrators</p>
            </div>

            {status && (
              <div className="status-banner">
                {status}
              </div>
            )}

            <form onSubmit={submit} className="login-form">
              {/* Email */}
              <div className="form-group">
                <label htmlFor="email" className="form-label">
                  Email address
                </label>
                <div className="input-wrapper">
                  <div className="input-icon">
                    <Mail size={16} />
                  </div>
                  <Input
                    id="email"
                    type="email"
                    autoComplete="email"
                    autoFocus
                    value={data.email}
                    onChange={e => setData('email', e.target.value)}
                    placeholder="admin@platform.com"
                    className="login-input"
                    style={errors.email ? { borderColor: '#ef4444', boxShadow: '0 0 0 1px #ef4444' } : {}}
                  />
                </div>
                {errors.email && (
                  <p className="error-text">{errors.email}</p>
                )}
              </div>

              {/* Password */}
              <div className="form-group">
                <label htmlFor="password" className="form-label">
                  Password
                </label>
                <div className="input-wrapper">
                  <div className="input-icon">
                    <Lock size={16} />
                  </div>
                  <Input
                    id="password"
                    type={showPass ? 'text' : 'password'}
                    autoComplete="current-password"
                    value={data.password}
                    onChange={e => setData('password', e.target.value)}
                    placeholder="••••••••"
                    className="login-input pr-10"
                    style={errors.password ? { borderColor: '#ef4444', boxShadow: '0 0 0 1px #ef4444' } : {}}
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
                {errors.password && (
                  <p className="error-text">{errors.password}</p>
                )}
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={processing}
                className="submit-btn"
              >
                {processing ? (
                  <>
                    <span className="btn-spinner" />
                    Signing in…
                  </>
                ) : (
                  <>
                    <Shield size={15} />
                    Sign in to portal
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

        /* Glassmorphic card styling - Light Mode */
        .login-card {
          width: 100%;
          max-width: 400px;
          background: rgba(255, 255, 255, 0.88);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.6);
          border-radius: 20px;
          padding: 40px 36px;
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
          justify-content: space-between;
          margin-bottom: 28px;
        }

        .admin-badge {
          font-size: 11px;
          font-weight: 700;
          color: #7c3aed;
          background: rgba(124, 58, 237, 0.1);
          padding: 3px 8px;
          border-radius: 6px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .login-header {
          margin-bottom: 28px;
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

        .status-banner {
          margin-bottom: 20px;
          font-size: 13px;
          color: #065f46;
          background: #ecfdf5;
          border-radius: 10px;
          padding: 10px 14px;
          border: 1px solid #a7f3d0;
        }

        .login-form {
          display: flex;
          flex-direction: column;
          gap: 18px;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .form-label {
          font-size: 12.5px;
          font-weight: 600;
          color: #374151;
          letter-spacing: -0.1px;
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

        /* Gradient submit button */
        .submit-btn {
          height: 44px;
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
