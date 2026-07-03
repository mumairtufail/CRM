import { useForm, Head, Link } from '@inertiajs/react'
import { Input } from '@/Components/ui/input'
import { Eye, EyeOff, Lock, Mail } from 'lucide-react'
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
          <div className="card-content">
            {/* Brand */}
            <div className="login-brand">
              <Logo size={28} showText={true} text="LumeniaCRM" textColor="text-slate-900" textClassName="text-[17px] font-bold" />
            </div>

            <div className="login-header">
              <h1 className="login-title">Welcome back</h1>
              <p className="login-subtitle">Sign in to access your workspace</p>
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
                    placeholder="you@company.com"
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
                <div className="label-row">
                  <label htmlFor="password" className="form-label">
                    Password
                  </label>
                  {route.has('password.request') && (
                    <Link href={route('password.request')} className="forgot-link">
                      Forgot password?
                    </Link>
                  )}
                </div>
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

              {/* Remember Me */}
              <div className="remember-row">
                <label className="remember-label">
                  <input
                    type="checkbox"
                    checked={data.remember}
                    onChange={e => setData('remember', e.target.checked)}
                    className="remember-checkbox"
                  />
                  <span>Keep me signed in</span>
                </label>
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
                ) : 'Sign in'}
              </button>
            </form>

            <div className="card-footer">
              <p>
                Don't have an account?{' '}
                <Link href={route('register')} className="signup-link">Create workspace</Link>
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
          background: #F4F2FF;
          position: relative;
          overflow: hidden;
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
          gap: 12px;
          margin-bottom: 28px;
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

        .label-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .forgot-link {
          font-size: 12px;
          color: #7c3aed;
          font-weight: 500;
          transition: color 0.15s ease;
          text-decoration: none;
        }
        .forgot-link:hover {
          color: #6d28d9;
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

        /* Remember me checkbox */
        .remember-row {
          display: flex;
          align-items: center;
        }
        .remember-label {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 13px;
          color: #64748b;
          cursor: pointer;
          user-select: none;
        }
        .remember-checkbox {
          width: 15px;
          height: 15px;
          accent-color: #7c3aed;
          border-radius: 4px;
          background: #ffffff;
          border: 1px solid #cbd5e1;
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

        .card-footer {
          margin-top: 24px;
          text-align: center;
          font-size: 13px;
          color: #64748b;
        }
        .signup-link {
          color: #7c3aed;
          font-weight: 600;
          text-decoration: none;
          transition: color 0.15s ease;
        }
        .signup-link:hover {
          color: #6d28d9;
        }

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
