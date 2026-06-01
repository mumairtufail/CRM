import { useForm, Head } from '@inertiajs/react'
import { Input } from '@/Components/ui/input'
import { Label } from '@/Components/ui/label'
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
      <div className="min-h-screen flex">

        {/* Left brand panel */}
        <div
          className="hidden lg:flex lg:w-[44%] flex-col justify-between p-12 select-none"
          style={{ background: '#111827' }}
        >
          {/* Wordmark */}
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded bg-violet-600 flex items-center justify-center shrink-0">
              <span className="text-white text-[10px] font-black tracking-wide">CRM</span>
            </div>
            <span className="text-white font-semibold text-sm tracking-tight">CRM</span>
          </div>

          {/* Headline + bullets */}
          <div>
            <p className="text-white/40 text-xs font-medium uppercase tracking-widest mb-4">
              Sales workspace
            </p>
            <h2 className="text-white text-[28px] font-bold leading-tight mb-6">
              Everything your<br />team needs to close.
            </h2>
            <ul className="space-y-3">
              {[
                'Track leads through your pipeline',
                'Manage contacts and companies',
                'Import and export data in bulk',
              ].map(item => (
                <li key={item} className="flex items-center gap-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-violet-500 shrink-0" />
                  <span className="text-white/50 text-sm">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <p className="text-white/20 text-xs">Internal tool — authorised access only</p>
        </div>

        {/* Right form panel */}
        <div className="flex-1 flex items-center justify-center bg-white p-8">
          <div className="w-full max-w-[360px]">

            {/* Mobile-only logo */}
            <div className="flex items-center gap-2 mb-10 lg:hidden">
              <div className="w-7 h-7 rounded bg-violet-600 flex items-center justify-center">
                <span className="text-white text-[10px] font-black">CRM</span>
              </div>
              <span className="font-semibold text-sm text-gray-900">CRM</span>
            </div>

            <h1 className="text-[22px] font-bold text-gray-900 mb-1">Sign in</h1>
            <p className="text-gray-400 text-sm mb-8">Enter your credentials to continue.</p>

            {status && (
              <div className="mb-6 text-sm text-emerald-700 bg-emerald-50 rounded-lg py-2.5 px-4 border border-emerald-200">
                {status}
              </div>
            )}

            <form onSubmit={submit} className="space-y-5">
              <div>
                <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                  Email address
                </Label>
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  autoFocus
                  value={data.email}
                  onChange={e => setData('email', e.target.value)}
                  placeholder="you@company.com"
                  className={[
                    'mt-1.5 h-10 text-sm text-gray-900',
                    errors.email ? 'border-red-400 focus-visible:ring-red-400' : '',
                  ].join(' ')}
                />
                {errors.email && (
                  <p className="text-red-500 text-xs mt-1">{errors.email}</p>
                )}
              </div>

              <div>
                <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                  Password
                </Label>
                <div className="relative mt-1.5">
                  <Input
                    id="password"
                    type={showPass ? 'text' : 'password'}
                    autoComplete="current-password"
                    value={data.password}
                    onChange={e => setData('password', e.target.value)}
                    placeholder="••••••••"
                    className={[
                      'h-10 text-sm pr-10 text-gray-900',
                      errors.password ? 'border-red-400 focus-visible:ring-red-400' : '',
                    ].join(' ')}
                  />
                  <button
                    type="button"
                    tabIndex={-1}
                    onClick={() => setShowPass(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-red-500 text-xs mt-1">{errors.password}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={processing}
                className="w-full h-10 rounded-md text-sm font-semibold text-white bg-violet-600 hover:bg-violet-700 active:bg-violet-800 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {processing ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Signing in…
                  </>
                ) : 'Sign in'}
              </button>
            </form>

            <p className="text-center text-xs text-gray-300 mt-8 lg:hidden">
              Internal tool — authorised access only
            </p>
          </div>
        </div>

      </div>
    </>
  )
}
