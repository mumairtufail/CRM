import { useForm, Head, Link } from '@inertiajs/react'
import GuestLayout from '@/Layouts/GuestLayout'
import { toast } from 'sonner'
import { useState, useEffect } from 'react'
import axios from 'axios'

export default function VerifyCode({ status }) {
  const { data, setData, post, processing, errors, reset } = useForm({
    code: '',
  })
  
  const [resending, setResending] = useState(false)
  const [expiryTime, setExpiryTime] = useState(90)
  const [resendCooldown, setResendCooldown] = useState(60)
  const [isExpired, setIsExpired] = useState(false)

  // Expiry Timer Countdown
  useEffect(() => {
    if (expiryTime <= 0) {
      setIsExpired(true)
      return
    }

    const timer = setInterval(() => {
      setExpiryTime(prev => prev - 1)
    }, 1000)

    return () => clearInterval(timer)
  }, [expiryTime])

  // Resend Cooldown Timer Countdown
  useEffect(() => {
    if (resendCooldown <= 0) return

    const timer = setInterval(() => {
      setResendCooldown(prev => prev - 1)
    }, 1000)

    return () => clearInterval(timer)
  }, [resendCooldown])

  const submit = e => {
    e.preventDefault()
    if (isExpired) {
      toast.error('This code has expired. Please request a new code.')
      return
    }
    if (!data.code || data.code.length !== 6 || isNaN(data.code)) {
      toast.error('Please enter a valid 6-digit code.')
      return
    }
    post('/register/verify', {
      onSuccess: () => {
        toast.success('Email verified successfully! Logging you in...')
      },
      onError: (err) => {
        const msg = Object.values(err)[0] || 'Verification failed.'
        toast.error(msg)
      }
    })
  }

  const resend = async () => {
    if (resendCooldown > 0) return
    
    setResending(true)
    try {
      const response = await axios.post('/register/resend-code')
      setExpiryTime(90)
      setResendCooldown(60)
      setIsExpired(false)
      reset('code')
      toast.success(response.data.message || 'Verification code resent successfully!')
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to resend code.'
      toast.error(msg)
    } finally {
      setResending(false)
    }
  }

  // Format seconds to MM:SS
  const formatTime = seconds => {
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return `${m}:${s < 10 ? '0' : ''}${s}`
  }

  return (
    <>
      <Head title="Verify Email Code" />

      <div className="forgot-card">
        <div className="card-content">
          <div className="forgot-header">
            <h1 className="forgot-title">Verify your email</h1>
            <p className="forgot-subtitle">
              We sent a 6-digit verification code to your email. Enter it below to verify your account.
            </p>
          </div>

          <form onSubmit={submit} className="forgot-form">
            <div>
              <input
                type="text"
                value={data.code}
                onChange={e => {
                  const val = e.target.value.trim().substring(0, 6)
                  if (!val || /^\d+$/.test(val)) {
                    setData('code', val)
                  }
                }}
                maxLength={6}
                placeholder="123456"
                className={`code-input ${isExpired ? 'expired-input' : ''}`}
                required
                autoFocus
                disabled={isExpired || processing}
              />
              
              {/* Expiry Timer */}
              <div className="timer-container">
                {isExpired ? (
                  <span className="expiry-text expired">Code has expired. Please resend.</span>
                ) : (
                  <span className={`expiry-text ${expiryTime <= 15 ? 'warning' : ''}`}>
                    Expires in: {formatTime(expiryTime)}
                  </span>
                )}
              </div>

              {errors.code && <p className="error-text">{errors.code}</p>}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={processing || isExpired}
              className="submit-btn"
            >
              {processing ? (
                <>
                  <span className="btn-spinner" />
                  Verifying…
                </>
              ) : 'Verify Code'}
            </button>
          </form>

          <div className="card-footer">
            {resendCooldown > 0 ? (
              <span className="resend-disabled">
                Resend Code in {resendCooldown}s
              </span>
            ) : (
              <button
                onClick={resend}
                disabled={resending}
                className="resend-link"
              >
                {resending ? 'Resending...' : 'Resend Code'}
              </button>
            )}

            <Link
              href="/"
              className="back-link-home"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </div>

      <style>{`
        /* Glassmorphic card styling - Light Mode */
        .forgot-card {
          width: 100%;
          background: rgba(255, 255, 255, 0.88);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.6);
          border-radius: 20px;
          padding: 36px 32px;
          box-shadow: 
            0 20px 40px -15px rgb(var(--brand-600) / 0.08),
            0 2px 10px rgba(0, 0, 0, 0.02);
        }

        .forgot-header {
          margin-bottom: 24px;
        }
        .forgot-title {
          font-size: 22px;
          font-weight: 700;
          letter-spacing: -0.5px;
          color: #0f172a;
          margin-bottom: 5px;
          line-height: 1.2;
        }
        .forgot-subtitle {
          font-size: 13px;
          color: #64748b;
          font-weight: 400;
          line-height: 1.4;
        }

        .forgot-form {
          display: flex;
          flex-direction: column;
          gap: 18px;
        }

        .code-input {
          width: 100%;
          height: 48px;
          border-radius: 10px;
          border: 1px solid #cbd5e1;
          outline: none;
          text-align: center;
          font-size: 20px;
          font-weight: 750;
          letter-spacing: 6px;
          color: #1e293b;
          background: #ffffff;
          transition: all 0.2s ease;
        }

        .code-input:focus {
          border-color: rgb(var(--brand-600));
          box-shadow: 0 0 0 3px rgb(var(--brand-600) / 0.15);
        }

        .expired-input {
          background-color: #f8fafc;
          border-color: #e2e8f0;
          color: #94a3b8;
          text-decoration: line-through;
        }

        .timer-container {
          margin-top: 8px;
          text-align: right;
        }

        .expiry-text {
          font-size: 12px;
          color: #64748b;
          font-weight: 600;
        }

        .expiry-text.warning {
          color: #ea580c;
          animation: pulse 1s infinite alternate;
        }

        .expiry-text.expired {
          color: #ef4444;
        }

        @keyframes pulse {
          from { opacity: 0.6; }
          to { opacity: 1; }
        }

        .error-text {
          font-size: 11.5px;
          color: #ef4444;
          margin-top: 5px;
          text-align: left;
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
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: 24px;
          font-size: 12.5px;
        }

        .resend-disabled {
          color: #94a3b8;
          font-weight: 500;
          cursor: not-allowed;
        }

        .resend-link {
          color: rgb(var(--brand-600));
          font-weight: 600;
          background: none;
          border: none;
          cursor: pointer;
          padding: 0;
          text-decoration: underline;
        }
        .resend-link:hover {
          color: rgb(var(--brand-700));
        }
        .back-link-home {
          color: #64748b;
          text-decoration: none;
        }
        .back-link-home:hover {
          color: #334155;
          text-decoration: underline;
        }
      `}</style>
    </>
  )
}

VerifyCode.layout = page => <GuestLayout children={page} />
