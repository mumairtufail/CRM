import { useForm, Head, Link } from '@inertiajs/react'
import { Check } from 'lucide-react'
import GuestLayout from '@/Layouts/GuestLayout'

export default function VerifyEmail({ status }) {
  const { post, processing } = useForm({})

  const submit = e => {
    e.preventDefault()
    post(route('verification.send'))
  }

  return (
    <>
      <Head title="Email Verification" />

      <div className="forgot-card">
        <div className="card-content">
          <div className="forgot-header">
            <h1 className="forgot-title">Verify your email</h1>
            <p className="forgot-subtitle">
              Thanks for signing up! Please verify your email by clicking on the link we sent you.
            </p>
          </div>

          {status === 'verification-link-sent' && (
            <div className="status-banner">
              A new verification link has been sent to your email address.
            </div>
          )}

          <form onSubmit={submit} className="forgot-form">
            {/* Submit */}
            <button
              type="submit"
              disabled={processing}
              className="submit-btn"
            >
              {processing ? (
                <>
                  <span className="btn-spinner" />
                  Resending…
                </>
              ) : 'Resend verification email'}
            </button>
          </form>

          <div className="card-footer">
            <Link
              href={route('logout')}
              method="post"
              as="button"
              className="back-link"
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
            >
              Log Out
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
            0 20px 40px -15px rgba(124, 58, 237, 0.08),
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

        .status-banner {
          margin-bottom: 20px;
          font-size: 12.5px;
          color: #15803d;
          background: #f0fdf4;
          border-radius: 10px;
          padding: 10px 14px;
          border: 1px solid #bbf7d0;
        }

        .forgot-form {
          display: flex;
          flex-direction: column;
          gap: 18px;
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
        }
        .back-link {
          color: #7c3aed;
          font-weight: 600;
          text-decoration: underline;
          transition: color 0.15s ease;
          display: inline-flex;
          align-items: center;
          gap: 6px;
        }
        .back-link:hover {
          color: #6d28d9;
        }
      `}</style>
    </>
  )
}

VerifyEmail.layout = page => <GuestLayout children={page} />
