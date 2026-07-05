import { Head, useForm, usePage } from '@inertiajs/react'
import { useState } from 'react'
import AdminLayout from '@/Components/Layout/AdminLayout'
import PageHeader from '@/Components/Common/PageHeader'
import { Input } from '@/Components/ui/input'
import { Label } from '@/Components/ui/label'
import {
  Select, SelectTrigger, SelectValue,
  SelectContent, SelectItem,
} from '@/Components/ui/select'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/Components/ui/dialog'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import {
  Mail, Server, Lock, User, CheckCircle2, AlertCircle,
  Eye, EyeOff, Send, Loader2, Zap,
} from 'lucide-react'

// ─── Provider presets ─────────────────────────────────────────────────────────

const PRESETS = [
  {
    id: 'gmail',
    label: 'Gmail',
    color: '#EA4335',
    logo: (
      <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
        <path fill="#EA4335" d="M5 38.5v-29L22 24z"/>
        <path fill="#FBBC05" d="M43 38.5v-29L26 24z"/>
        <path fill="#34A853" d="M43 9.5l-19 14.5L5 9.5"/>
        <path fill="#4285F4" d="M5 38.5h38v3H5z"/>
        <path fill="#C5221F" d="M5 9.5h38l-19 14.5z"/>
      </svg>
    ),
    host: 'smtp.gmail.com',
    port: 587,
    encryption: 'tls',
    hint: 'Use an App Password — not your Google account password.',
  },
  {
    id: 'outlook',
    label: 'Outlook',
    color: '#0078D4',
    logo: (
      <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
        <rect width="48" height="48" rx="6" fill="#0078D4"/>
        <path fill="#fff" d="M14 14h20v20H14z" opacity=".3"/>
        <path fill="#fff" d="M12 12h24v4H12zm0 6h24v2H12zm0 4h14v2H12zm0 4h14v2H12zm0 4h14v2H12z"/>
      </svg>
    ),
    host: 'smtp-mail.outlook.com',
    port: 587,
    encryption: 'tls',
    hint: 'Works for Outlook.com and Microsoft 365 accounts.',
  },
  {
    id: 'sendgrid',
    label: 'SendGrid',
    color: '#1A82E2',
    logo: (
      <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
        <rect width="48" height="48" rx="6" fill="#1A82E2"/>
        <rect x="10" y="10" width="13" height="13" rx="2" fill="#fff" opacity=".9"/>
        <rect x="25" y="10" width="13" height="13" rx="2" fill="#fff" opacity=".4"/>
        <rect x="10" y="25" width="13" height="13" rx="2" fill="#fff" opacity=".4"/>
        <rect x="25" y="25" width="13" height="13" rx="2" fill="#fff" opacity=".9"/>
      </svg>
    ),
    host: 'smtp.sendgrid.net',
    port: 587,
    encryption: 'tls',
    usernameHint: 'Use "apikey" as the username and your SendGrid API key as the password.',
    prefillUsername: 'apikey',
  },
  {
    id: 'mailgun',
    label: 'Mailgun',
    color: '#F06B26',
    logo: (
      <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
        <rect width="48" height="48" rx="6" fill="#F06B26"/>
        <circle cx="24" cy="24" r="10" fill="#fff" opacity=".9"/>
        <circle cx="24" cy="24" r="5" fill="#F06B26"/>
      </svg>
    ),
    host: 'smtp.mailgun.org',
    port: 587,
    encryption: 'tls',
    hint: 'Use your Mailgun SMTP credentials from the Mailgun dashboard.',
  },
  {
    id: 'ses',
    label: 'Amazon SES',
    color: '#FF9900',
    logo: (
      <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
        <rect width="48" height="48" rx="6" fill="#232F3E"/>
        <path fill="#FF9900" d="M8 30c0 1.1.9 2 2 2h28c1.1 0 2-.9 2-2v-4H8v4zm32-14H8v4h32v-4z"/>
        <rect x="8" y="16" width="32" height="4" rx="2" fill="#FF9900" opacity=".7"/>
      </svg>
    ),
    host: 'email-smtp.us-east-1.amazonaws.com',
    port: 587,
    encryption: 'tls',
    hint: 'Use SMTP credentials (not access keys) from the SES console.',
  },
  {
    id: 'hostinger',
    label: 'Hostinger',
    color: '#673DE6',
    logo: (
      <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
        <rect width="48" height="48" rx="6" fill="#673DE6"/>
        <text x="50%" y="54%" dominantBaseline="middle" textAnchor="middle"
          fill="#fff" fontSize="26" fontWeight="bold" fontFamily="Arial,sans-serif">H</text>
      </svg>
    ),
    host: 'smtp.hostinger.com',
    port: 587,
    encryption: 'tls',
    hint: 'Use your Hostinger email address and its password as SMTP credentials.',
  },
  {
    id: 'custom',
    label: 'Custom',
    color: 'rgb(var(--brand-600))',
    logo: (
      <div className="w-[18px] h-[18px] rounded flex items-center justify-center"
        style={{ background: 'linear-gradient(135deg,rgb(var(--brand-600)),rgb(var(--brand2-600)))' }}>
        <Server size={10} className="text-white" />
      </div>
    ),
    host: '',
    port: 587,
    encryption: 'tls',
  },
]

// ─── Sub-components ───────────────────────────────────────────────────────────

function Field({ label, error, hint, required, children }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-[12px] font-medium text-slate-600">
        {label}{required && <span className="text-red-400 ml-0.5">*</span>}
      </Label>
      {children}
      {hint && !error && <p className="text-[11px] text-slate-400 leading-snug">{hint}</p>}
      {error         && <p className="text-[11px] text-red-500 leading-snug">{error}</p>}
    </div>
  )
}

function SectionTitle({ icon: Icon, label, description }) {
  return (
    <div className="flex items-start gap-3 mb-4">
      <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
        style={{ background: 'linear-gradient(135deg,rgb(var(--brand-600) / 0.12),rgb(var(--brand2-600) / 0.12))' }}>
        <Icon size={15} className="text-brand-600" />
      </div>
      <div>
        <p className="text-[13.5px] font-semibold text-slate-800">{label}</p>
        {description && <p className="text-[12px] text-slate-400 mt-0.5">{description}</p>}
      </div>
    </div>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function SmtpSettings({ smtp, configured }) {
  const { flash } = usePage().props
  const [showPassword, setShowPassword]   = useState(false)
  const [testLoading, setTestLoading]     = useState(false)
  const [activePreset, setActivePreset]   = useState(null)
  const [currentHint, setCurrentHint]     = useState(null)
  const [testDialog, setTestDialog]       = useState(false)
  const [testTo, setTestTo]               = useState('')

  const { data, setData, post, processing, errors, reset } = useForm({
    host:       smtp?.host       ?? '',
    port:       smtp?.port       ?? 587,
    encryption: smtp?.encryption ?? 'tls',
    username:   smtp?.username   ?? '',
    password:   '',
    from_name:  smtp?.from_name  ?? '',
    from_email: smtp?.from_email ?? '',
  })

  const applyPreset = (preset) => {
    setActivePreset(preset.id)
    setCurrentHint(preset.usernameHint || preset.hint || null)
    setData(prev => ({
      ...prev,
      host:       preset.host       || prev.host,
      port:       preset.port       || prev.port,
      encryption: preset.encryption || prev.encryption,
      username:   preset.prefillUsername ?? prev.username,
    }))
  }

  const submit = (e) => {
    e.preventDefault()
    post(route('admin.smtp.update'), {
      onSuccess: () => toast.success('SMTP settings saved successfully.'),
      onError:   () => toast.error('Please fix the errors below.'),
    })
  }

  const openTestDialog = () => {
    setTestTo('')
    setTestDialog(true)
  }

  const sendTest = async () => {
    if (!testTo) return
    setTestLoading(true)
    setTestDialog(false)
    try {
      const res = await fetch(route('admin.smtp.test'), {
        method:  'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN':  document.querySelector('meta[name="csrf-token"]')?.content ?? '',
          'Accept':        'application/json',
        },
        body: JSON.stringify({ to: testTo }),
      })
      const json = await res.json()
      if (json.ok) toast.success(json.message)
      else         toast.error(json.message)
    } catch {
      toast.error('Failed to send test email.')
    } finally {
      setTestLoading(false)
    }
  }

  return (
    <>
      <Head title="Admin · SMTP Settings" />
      <AdminLayout title="SMTP Settings">
        <PageHeader
          title="Platform SMTP Settings"
          description="Configure the outbound mail server used for password resets and system notifications"
        />

        {/* ── Status banner ─────────────────────────────────────────────── */}
        <div className={cn(
          'flex items-center gap-3 px-4 py-3 rounded-xl mb-6 border text-[13px]',
          configured
            ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
            : 'bg-amber-50 border-amber-200 text-amber-700'
        )}>
          {configured
            ? <CheckCircle2 size={15} className="text-emerald-500 shrink-0" />
            : <AlertCircle  size={15} className="text-amber-500 shrink-0" />
          }
          <div className="flex-1 min-w-0">
            {configured ? (
              <>
                <span className="font-semibold">SMTP configured</span>
                <span className="text-emerald-600/70 mx-1.5">·</span>
                <span className="font-mono text-[12px]">{smtp?.from_email}</span>
                <span className="text-emerald-600/70 mx-1.5">via</span>
                <span className="font-mono text-[12px]">{smtp?.host}:{smtp?.port}</span>
              </>
            ) : (
              <>
                <span className="font-semibold">SMTP not configured</span>
                <span className="text-amber-600/70 mx-1.5">·</span>
                <span>Password reset emails will fail until you set this up.</span>
              </>
            )}
          </div>
          {configured && (
            <button
              onClick={openTestDialog}
              disabled={testLoading}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-semibold bg-emerald-100 hover:bg-emerald-200 text-emerald-700 transition-colors disabled:opacity-50 shrink-0"
            >
              {testLoading
                ? <Loader2 size={12} className="animate-spin" />
                : <Send size={12} />
              }
              {testLoading ? 'Sending…' : 'Test now'}
            </button>
          )}
        </div>

        <form onSubmit={submit}>
          <div className="grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-5">

            {/* ── Left column — form ─────────────────────────────────────── */}
            <div className="space-y-5">

              {/* Provider Presets */}
              <div className="glass-card rounded-2xl p-5">
                <SectionTitle
                  icon={Zap}
                  label="Quick Setup"
                  description="Choose your email provider to auto-fill connection details"
                />
                <div className="grid grid-cols-3 sm:grid-cols-7 gap-2">
                  {PRESETS.map(preset => (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => applyPreset(preset)}
                      className={cn(
                        'relative flex flex-col items-center gap-1.5 px-2 py-3 rounded-xl border-2 transition-all duration-150',
                        activePreset === preset.id
                          ? 'border-brand-400 bg-brand-50 shadow-sm'
                          : 'border-slate-200 bg-white hover:border-brand-200 hover:bg-slate-50'
                      )}
                    >
                      {activePreset === preset.id && (
                        <div className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full flex items-center justify-center"
                          style={{ background: 'linear-gradient(135deg,rgb(var(--brand-600)),rgb(var(--brand2-600)))' }}>
                          <CheckCircle2 size={9} className="text-white" />
                        </div>
                      )}
                      <div className="w-[18px] h-[18px] flex items-center justify-center">
                        {preset.logo}
                      </div>
                      <span className={cn(
                        'text-[11px] font-semibold leading-none',
                        activePreset === preset.id ? 'text-brand-700' : 'text-slate-600'
                      )}>
                        {preset.label}
                      </span>
                    </button>
                  ))}
                </div>
                {currentHint && (
                  <div className="mt-3 flex items-start gap-2 px-3 py-2.5 bg-blue-50 rounded-lg border border-blue-100">
                    <AlertCircle size={13} className="text-blue-500 mt-0.5 shrink-0" />
                    <p className="text-[12px] text-blue-700 leading-snug">{currentHint}</p>
                  </div>
                )}
              </div>

              {/* Connection Settings */}
              <div className="glass-card rounded-2xl p-5">
                <SectionTitle
                  icon={Server}
                  label="Connection"
                  description="Outbound mail server address and security"
                />
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="sm:col-span-2">
                    <Field label="SMTP Host" error={errors.host} required>
                      <Input
                        value={data.host}
                        onChange={e => setData('host', e.target.value)}
                        placeholder="smtp.example.com"
                        className="h-9 text-[13px] font-mono"
                      />
                    </Field>
                  </div>
                  <Field label="Port" error={errors.port} required>
                    <Input
                      type="number"
                      value={data.port}
                      onChange={e => setData('port', parseInt(e.target.value) || 587)}
                      placeholder="587"
                      min={1}
                      max={65535}
                      className="h-9 text-[13px] font-mono"
                    />
                  </Field>
                </div>
                <div className="mt-4">
                  <Field label="Encryption" error={errors.encryption} required>
                    <Select value={data.encryption} onValueChange={v => setData('encryption', v)}>
                      <SelectTrigger className="h-9 text-[13px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="tls">
                          <div className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                            TLS — Recommended (port 587)
                          </div>
                        </SelectItem>
                        <SelectItem value="ssl">
                          <div className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-400 shrink-0" />
                            SSL (port 465)
                          </div>
                        </SelectItem>
                        <SelectItem value="none">
                          <div className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-slate-300 shrink-0" />
                            None — Not recommended
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </Field>
                </div>
              </div>

              {/* Authentication */}
              <div className="glass-card rounded-2xl p-5">
                <SectionTitle
                  icon={Lock}
                  label="Authentication"
                  description="Credentials for logging into the SMTP server"
                />
                <div className="space-y-4">
                  <Field
                    label="Username"
                    error={errors.username}
                    hint='Usually your full email address, or "apikey" for SendGrid.'
                    required
                  >
                    <Input
                      value={data.username}
                      onChange={e => setData('username', e.target.value)}
                      placeholder="you@example.com"
                      autoComplete="off"
                      className="h-9 text-[13px]"
                    />
                  </Field>
                  <Field
                    label="Password"
                    error={errors.password}
                    hint={smtp?.username ? 'Leave blank to keep the existing password.' : 'Your SMTP password or API key.'}
                  >
                    <div className="relative">
                      <Input
                        type={showPassword ? 'text' : 'password'}
                        value={data.password}
                        onChange={e => setData('password', e.target.value)}
                        placeholder={smtp?.username ? '••••••••  (unchanged)' : 'Enter password or API key'}
                        autoComplete="new-password"
                        className="h-9 text-[13px] pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(v => !v)}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors p-0.5"
                        tabIndex={-1}
                      >
                        {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                      </button>
                    </div>
                  </Field>
                </div>
              </div>

              {/* Sender Identity */}
              <div className="glass-card rounded-2xl p-5">
                <SectionTitle
                  icon={User}
                  label="Sender Identity"
                  description="The name and address that recipients see in the From field"
                />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field label="From Name" error={errors.from_name} required
                    hint='E.g. "Your CRM" or your company name.'>
                    <Input
                      value={data.from_name}
                      onChange={e => setData('from_name', e.target.value)}
                      placeholder="Your CRM"
                      className="h-9 text-[13px]"
                    />
                  </Field>
                  <Field label="From Email" error={errors.from_email} required
                    hint="Must match or be authorised by your domain.">
                    <Input
                      type="email"
                      value={data.from_email}
                      onChange={e => setData('from_email', e.target.value)}
                      placeholder="noreply@yourdomain.com"
                      className="h-9 text-[13px]"
                    />
                  </Field>
                </div>
              </div>

              {/* Action row */}
              <div className="flex items-center gap-3 pt-1 pb-4">
                <button
                  type="submit"
                  disabled={processing}
                  className="flex items-center gap-2 h-9 px-5 text-[13px] font-semibold text-white rounded-lg transition-all hover:opacity-90 disabled:opacity-50"
                  style={{ background: 'linear-gradient(135deg,rgb(var(--brand-600)),rgb(var(--brand2-600)))' }}
                >
                  {processing
                    ? <><Loader2 size={13} className="animate-spin" /> Saving…</>
                    : <><Mail size={13} /> Save SMTP Settings</>
                  }
                </button>

                {configured && (
                  <button
                    type="button"
                    onClick={openTestDialog}
                    disabled={testLoading}
                    className="flex items-center gap-2 h-9 px-4 text-[13px] font-semibold text-brand-700 border border-brand-200 bg-brand-50 hover:bg-brand-100 rounded-lg transition-all disabled:opacity-50"
                  >
                    {testLoading
                      ? <><Loader2 size={13} className="animate-spin" /> Sending…</>
                      : <><Send size={13} /> Send test email</>
                    }
                  </button>
                )}
              </div>
            </div>

            {/* ── Right column — info panel ──────────────────────────────── */}
            <div className="space-y-4">

              {/* What this controls */}
              <div className="glass-card rounded-2xl p-4">
                <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-3">What this controls</p>
                <ul className="space-y-2.5">
                  {[
                    { icon: Mail,    label: 'Password reset emails' },
                    { icon: Mail,    label: 'Email verification' },
                    { icon: Mail,    label: 'System notifications' },
                  ].map(({ icon: Icon, label }) => (
                    <li key={label} className="flex items-center gap-2.5 text-[12.5px] text-slate-600">
                      <div className="w-6 h-6 rounded-md flex items-center justify-center bg-slate-100 shrink-0">
                        <Icon size={12} className="text-slate-500" />
                      </div>
                      {label}
                    </li>
                  ))}
                </ul>
                <p className="mt-3 text-[11.5px] text-slate-400 leading-snug">
                  Each organisation's own SMTP (configured in their Settings) is used for campaign emails — this only affects platform-level messages.
                </p>
              </div>

              {/* Common port reference */}
              <div className="glass-card rounded-2xl p-4">
                <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-3">Port Reference</p>
                <div className="space-y-2">
                  {[
                    { port: '587', enc: 'TLS / STARTTLS', recommended: true },
                    { port: '465', enc: 'SSL/TLS' },
                    { port: '25',  enc: 'None (blocked by most ISPs)' },
                  ].map(({ port, enc, recommended }) => (
                    <div key={port} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[12.5px] font-semibold text-slate-700 w-8">{port}</span>
                        <span className="text-[11.5px] text-slate-500">{enc}</span>
                      </div>
                      {recommended && (
                        <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 border border-emerald-100 px-1.5 py-0.5 rounded-full">
                          Recommended
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Gmail tip */}
              <div className="rounded-xl border border-blue-100 bg-blue-50 p-4">
                <p className="text-[11px] font-bold uppercase tracking-widest text-blue-400 mb-2">Gmail tip</p>
                <p className="text-[12px] text-blue-700 leading-relaxed">
                  Enable 2-Step Verification on your Google account, then create an <strong>App Password</strong> at{' '}
                  <span className="font-mono text-[11px]">myaccount.google.com/apppasswords</span>. Use that 16-character code as the password here.
                </p>
              </div>
            </div>
          </div>
        </form>
      </AdminLayout>

      {/* ── Test email dialog ──────────────────────────────────────────── */}
      <Dialog open={testDialog} onOpenChange={setTestDialog}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-[15px]">Send test email</DialogTitle>
          </DialogHeader>
          <div className="py-2 space-y-1.5">
            <Label className="text-[12px] font-medium text-slate-600">
              Recipient email <span className="text-red-400">*</span>
            </Label>
            <Input
              type="email"
              placeholder="you@example.com"
              value={testTo}
              onChange={e => setTestTo(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && sendTest()}
              className="h-9 text-[13px]"
              autoFocus
            />
            <p className="text-[11.5px] text-slate-400">
              We'll send a test message to this address using the SMTP settings above.
            </p>
          </div>
          <DialogFooter className="gap-2">
            <button
              type="button"
              onClick={() => setTestDialog(false)}
              className="h-8 px-4 text-[12.5px] font-medium text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={sendTest}
              disabled={!testTo || testLoading}
              className="flex items-center gap-1.5 h-8 px-4 text-[12.5px] font-semibold text-white rounded-lg transition-all hover:opacity-90 disabled:opacity-40"
              style={{ background: 'linear-gradient(135deg,rgb(var(--brand-600)),rgb(var(--brand2-600)))' }}
            >
              {testLoading ? <Loader2 size={12} className="animate-spin" /> : <Send size={12} />}
              Send test
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
