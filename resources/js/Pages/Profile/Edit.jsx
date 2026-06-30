import React, { useRef, useState, useEffect } from 'react'
import { Head, useForm, usePage, router, Link } from '@inertiajs/react'
import AppLayout from '@/Components/Layout/AppLayout'
import { Button } from '@/Components/ui/button'
import { Input } from '@/Components/ui/input'
import { Label } from '@/Components/ui/label'
import { Badge } from '@/Components/ui/badge'
import { Alert, AlertDescription } from '@/Components/ui/alert'
import {
  Select, SelectTrigger, SelectValue,
  SelectContent, SelectItem,
} from '@/Components/ui/select'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
  DialogDescription, DialogFooter
} from '@/Components/ui/dialog'
import {
  Upload, Building2, Plus, Check, Server, Mail, User,
  Eye, EyeOff, X, LayoutTemplate, ExternalLink,
  CheckCircle2, Sparkles, AlertCircle, ShieldCheck,
  Zap, Key, Wifi, Globe, Phone, PenLine, BookOpen, ChevronRight,
  MessageSquare, Database,
} from 'lucide-react'

// lucide-react (this version) has no LinkedIn glyph — small inline brand icon.
const LinkedinIcon = ({ size = 12, className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
    <path d="M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.34V9h3.42v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43a2.07 2.07 0 1 1 0-4.14 2.07 2.07 0 0 1 0 4.14zM7.12 20.45H3.56V9h3.56v11.45zM22.22 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.22.79 24 1.77 24h20.45c.98 0 1.78-.78 1.78-1.73V1.73C24 .77 23.2 0 22.22 0z"/>
  </svg>
)
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

// ─── Primitives ───────────────────────────────────────────────────────────────

function Field({ label, error, hint, children }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-[12px] font-medium text-slate-600">{label}</Label>
      {children}
      {hint && !error && <p className="text-[11px] text-slate-400 leading-snug">{hint}</p>}
      {error          && <p className="text-[11px] text-red-500">{error}</p>}
    </div>
  )
}

function Card({ title, badge, danger, children }) {
  return (
    <div className={cn(
      'rounded-xl border bg-white',
      danger ? 'border-red-200' : 'border-slate-200'
    )}>
      <div className={cn(
        'flex items-center justify-between px-5 py-3 border-b',
        danger ? 'border-red-100' : 'border-slate-100'
      )}>
        <p className={cn(
          'text-[11.5px] font-semibold uppercase tracking-wider',
          danger ? 'text-red-500' : 'text-slate-400'
        )}>
          {title}
        </p>
        {badge}
      </div>
      <div className="px-5 py-4 space-y-3">{children}</div>
    </div>
  )
}

function SaveBtn({ processing, label = 'Save changes', loadingLabel = 'Saving…' }) {
  return (
    <button type="submit" disabled={processing}
      className="h-8 px-4 text-[12.5px] font-semibold text-white rounded-lg transition-all hover:opacity-90 disabled:opacity-50"
      style={{ background: 'linear-gradient(135deg,#7C3AED,#4F46E5)' }}>
      {processing ? loadingLabel : label}
    </button>
  )
}

// ─── Settings sidebar nav ─────────────────────────────────────────────────────

const NAV = [
  {
    items: [
      { id: 'profile',   label: 'Profile',        icon: User },
      { id: 'workspace', label: 'Workspace',       icon: Building2 },
    ],
  },
  {
    group: 'Email',
    items: [
      { id: 'smtp',      label: 'SMTP Accounts',  icon: Server },
      { id: 'mail',      label: 'Sending Limits', icon: Mail },
      { id: 'templates', label: 'Templates',      icon: LayoutTemplate },
    ],
  },
  {
    group: 'Integrations',
    items: [
      { id: 'ai',        label: 'AI Provider',     icon: Zap },
      { id: 'leadgen',   label: 'Lead Generation', icon: Sparkles },
      { id: 'whatsapp',  label: 'WhatsApp',        icon: MessageSquare },
    ],
  },
  {
    group: 'System',
    items: [
      { id: 'maintenance', label: 'Maintenance', icon: Database },
    ],
  },
]

function SettingsNav({ active, onChange, leadGenEnabled }) {
  const allItems = NAV.flatMap(s => s.items)

  return (
    <>
      {/* Mobile: horizontal scrollable tab strip */}
      <div className="flex md:hidden overflow-x-auto gap-1 scrollbar-none">
        {allItems.map(({ id, label, icon: Icon }) => {
          const isActive = active === id
          return (
            <button key={id} onClick={() => onChange(id)}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-medium whitespace-nowrap transition-all shrink-0',
                isActive
                  ? 'bg-violet-50 text-violet-700'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-800'
              )}>
              <Icon size={13} className={isActive ? 'text-violet-500' : 'text-slate-400'} />
              <span>{label}</span>
            </button>
          )
        })}
        <Link href="/documentation"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-medium whitespace-nowrap transition-all shrink-0 text-slate-600 hover:bg-violet-50 hover:text-violet-700">
          <BookOpen size={13} className="text-slate-400" />
          <span>Docs</span>
        </Link>
      </div>

      {/* Desktop: vertical sidebar nav */}
      <nav className="hidden md:block">
        {NAV.map((section, si) => (
          <div key={si} className={si > 0 ? 'mt-5' : ''}>
            {section.group && (
              <p className="px-3 mb-1 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                {section.group}
              </p>
            )}
            <div className="space-y-0.5">
              {section.items.map(({ id, label, icon: Icon }) => {
                const isActive = active === id
                return (
                  <button key={id} onClick={() => onChange(id)}
                    className={cn(
                      'w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] font-medium transition-all text-left',
                      isActive
                        ? 'bg-violet-50 text-violet-700'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-800'
                    )}>
                    <Icon size={14} className={isActive ? 'text-violet-500' : 'text-slate-400'} />
                    <span className="flex-1">{label}</span>
                    {id === 'leadgen' && leadGenEnabled && (
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                    )}
                  </button>
                )
              })}
            </div>
          </div>
        ))}

        {/* Help & resources */}
        <div className="mt-5">
          <p className="px-3 mb-1 text-[10px] font-bold uppercase tracking-widest text-slate-400">Help</p>
          <Link href="/documentation"
            className="group w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] font-medium text-left transition-all text-slate-600 hover:bg-violet-50 hover:text-violet-700">
            <BookOpen size={14} className="text-slate-400 group-hover:text-violet-500" />
            <span className="flex-1">Documentation</span>
            <ChevronRight size={13} className="text-slate-300 group-hover:text-violet-400" />
          </Link>
        </div>
      </nav>
    </>
  )
}

// ─── Profile tab ──────────────────────────────────────────────────────────────

function ProfileTab({ mustVerifyEmail }) {
  const { auth } = usePage().props

  const { data, setData, patch, errors, processing } = useForm({
    name:  auth.user.name  ?? '',
    email: auth.user.email ?? '',
  })
  const submit = e => {
    e.preventDefault()
    patch(route('profile.update'), { onSuccess: () => toast.success('Profile updated') })
  }

  return (
    <div className="space-y-3 max-w-xl">
      <Card title="Profile information">
        <form onSubmit={submit} className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Field label="Name" error={errors.name}>
              <Input value={data.name} onChange={e => setData('name', e.target.value)}
                className="h-8 text-[13px]" placeholder="Your name" />
            </Field>
            <Field label="Email" error={errors.email}>
              <Input type="email" value={data.email} onChange={e => setData('email', e.target.value)}
                className="h-8 text-[13px]" placeholder="you@example.com" />
            </Field>
          </div>
          {mustVerifyEmail && !auth.user.email_verified_at && (
            <p className="text-[12px] text-amber-700 bg-amber-50 px-3 py-2 rounded-lg border border-amber-100">
              Your email address is unverified.
            </p>
          )}
          <SaveBtn processing={processing} />
        </form>
      </Card>

      <Card title="Change password">
        <PasswordForm />
      </Card>

      <Card title="Danger zone" danger>
        <DeleteForm />
      </Card>
    </div>
  )
}

function PasswordForm() {
  const { data, setData, put, errors, processing, reset } = useForm({
    current_password: '', password: '', password_confirmation: '',
  })
  const submit = e => {
    e.preventDefault()
    put(route('password.update'), {
      onSuccess: () => { toast.success('Password updated'); reset() },
      onError:   () => toast.error('Please check the fields'),
    })
  }
  return (
    <form onSubmit={submit} className="space-y-3">
      <Field label="Current password" error={errors.current_password}>
        <Input type="password" value={data.current_password}
          onChange={e => setData('current_password', e.target.value)}
          className="h-8 text-[13px]" placeholder="••••••••" />
      </Field>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Field label="New password" error={errors.password}>
          <Input type="password" value={data.password}
            onChange={e => setData('password', e.target.value)}
            className="h-8 text-[13px]" placeholder="••••••••" />
        </Field>
        <Field label="Confirm password">
          <Input type="password" value={data.password_confirmation}
            onChange={e => setData('password_confirmation', e.target.value)}
            className="h-8 text-[13px]" placeholder="••••••••" />
        </Field>
      </div>
      <SaveBtn processing={processing} label="Update password" loadingLabel="Updating…" />
    </form>
  )
}

function DeleteForm() {
  const [open, setOpen] = useState(false)
  const { data, setData, delete: destroy, processing, errors, reset } = useForm({ password: '' })
  const handleDelete = e => {
    e.preventDefault()
    destroy(route('profile.destroy'), {
      onError: () => toast.error('Incorrect password'),
      onFinish: () => reset(),
    })
  }
  return (
    <>
      <p className="text-[12px] text-slate-500">
        Once deleted, all data is permanently removed. This cannot be undone.
      </p>
      <Button variant="outline" size="sm" className="h-7 text-xs border-red-200 text-red-600 hover:bg-red-50 mt-1"
        onClick={() => setOpen(true)}>
        Delete account
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-[13px]">Delete account?</DialogTitle>
            <DialogDescription className="text-[12px]">
              This is irreversible. Enter your password to confirm.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleDelete} className="space-y-3">
            <Input type="password" value={data.password}
              onChange={e => setData('password', e.target.value)}
              placeholder="Your current password" className="h-8 text-[13px]" autoFocus />
            {errors.password && <p className="text-red-500 text-[11px]">{errors.password}</p>}
            <DialogFooter className="gap-2">
              <Button type="button" variant="outline" size="sm" className="h-7 text-xs"
                onClick={() => setOpen(false)}>Cancel</Button>
              <Button type="submit" size="sm" variant="destructive" className="h-7 text-xs" disabled={processing}>
                {processing ? 'Deleting…' : 'Yes, delete'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}

// ─── Workspace tab ────────────────────────────────────────────────────────────

function WorkspaceTab() {
  const { auth } = usePage().props
  const logoInputRef = useRef()
  const [logoPreview, setLogoPreview] = useState(
    auth.user.company_logo ? `/storage/${auth.user.company_logo}` : null
  )
  const [removingLogo, setRemovingLogo] = useState(false)

  const { data, setData, processing } = useForm({
    company_name:    auth.user.company_name    ?? '',
    company_website: auth.user.company_website ?? '',
    company_phone:   auth.user.company_phone   ?? '',
    company_email:   auth.user.company_email   ?? '',
    company_linkedin: auth.user.company_linkedin ?? '',
    logo: null,
  })

  const handleLogoChange = e => {
    const file = e.target.files[0]
    if (!file) return
    setData('logo', file)
    const reader = new FileReader()
    reader.onload = ev => setLogoPreview(ev.target.result)
    reader.readAsDataURL(file)
  }

  const submit = e => {
    e.preventDefault()
    const fd = new FormData()
    fd.append('company_name',    data.company_name)
    fd.append('company_website', data.company_website)
    fd.append('company_phone',   data.company_phone)
    fd.append('company_email',   data.company_email)
    fd.append('company_linkedin', data.company_linkedin)
    if (data.logo) fd.append('logo', data.logo)
    router.post('/profile/workspace', fd, {
      forceFormData: true,
      onSuccess: () => toast.success('Workspace updated'),
      onError:   () => toast.error('Failed to update workspace'),
    })
  }

  const removeLogo = () => {
    setRemovingLogo(true)
    router.delete('/profile/logo', {
      onSuccess: () => { setLogoPreview(null); toast.success('Logo removed') },
      onFinish:  () => setRemovingLogo(false),
    })
  }

  return (
    <div className="space-y-3 max-w-xl">
      <Card title="Workspace branding">
        <form onSubmit={submit} className="space-y-3">
          <Field label="Company logo">
            <div className="flex items-center gap-3">
              {logoPreview ? (
                <div className="relative shrink-0">
                  <img src={logoPreview} alt="logo"
                    className="w-12 h-12 rounded-lg object-contain border border-slate-200 bg-white p-1" />
                  <button type="button" onClick={removeLogo} disabled={removingLogo}
                    className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-red-500 text-white flex items-center justify-center hover:bg-red-600">
                    <X size={9} />
                  </button>
                </div>
              ) : (
                <div onClick={() => logoInputRef.current?.click()}
                  className="w-12 h-12 rounded-lg border-2 border-dashed border-slate-200 flex items-center justify-center cursor-pointer hover:border-violet-400 hover:bg-violet-50 transition-colors shrink-0">
                  <Building2 size={16} className="text-slate-300" />
                </div>
              )}
              <div>
                <Button type="button" variant="outline" size="sm"
                  className="h-7 text-xs gap-1.5" onClick={() => logoInputRef.current?.click()}>
                  <Upload size={11} /> Upload logo
                </Button>
                <p className="text-[10.5px] text-slate-400 mt-0.5">PNG, JPG, SVG · max 2MB</p>
              </div>
            </div>
            <input ref={logoInputRef} type="file" accept="image/*" className="hidden" onChange={handleLogoChange} />
          </Field>

          <Field label="Company name">
            <Input value={data.company_name} onChange={e => setData('company_name', e.target.value)}
              className="h-8 text-[13px]" placeholder="Acme Inc." />
          </Field>

          <div className="border-t border-slate-100 pt-3">
            <div className="flex items-center gap-1.5 mb-1">
              <PenLine size={12} className="text-violet-500" />
              <p className="text-[10.5px] font-semibold uppercase tracking-wider text-slate-400">Email signature</p>
            </div>
            <p className="text-[11px] text-slate-400 mb-3">
              Shown in the signature block built into every email template, along with your name and company.
            </p>
            <div className="space-y-3">
              <Field label="Website">
                <div className="relative">
                  <Globe size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <Input value={data.company_website} onChange={e => setData('company_website', e.target.value)}
                    className="h-8 text-[13px] pl-7" placeholder="www.acme.com" />
                </div>
              </Field>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Field label="Phone number">
                  <div className="relative">
                    <Phone size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <Input value={data.company_phone} onChange={e => setData('company_phone', e.target.value)}
                      className="h-8 text-[13px] pl-7" placeholder="+1 (555) 000-1234" />
                  </div>
                </Field>
                <Field label="Contact email">
                  <div className="relative">
                    <Mail size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <Input type="email" value={data.company_email} onChange={e => setData('company_email', e.target.value)}
                      className="h-8 text-[13px] pl-7" placeholder="hello@acme.com" />
                  </div>
                </Field>
              </div>
              <Field label="LinkedIn">
                <div className="relative">
                  <LinkedinIcon size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <Input value={data.company_linkedin} onChange={e => setData('company_linkedin', e.target.value)}
                    className="h-8 text-[13px] pl-7" placeholder="linkedin.com/in/yourname" />
                </div>
              </Field>
            </div>
          </div>

          <SaveBtn processing={processing} label="Save workspace" />
        </form>
      </Card>
    </div>
  )
}

// ─── SMTP tab ─────────────────────────────────────────────────────────────────

const ENCRYPTION_OPTS = ['tls', 'ssl', 'none']

const PROVIDER_PRESETS = [
  { label: 'Gmail',       host: 'smtp.gmail.com',                     port: 587, encryption: 'tls', imap_host: 'imap.gmail.com',         imap_port: 993, imap_encryption: 'ssl', hint: 'Use an App Password — enable 2FA first, then Google Account → Security → App Passwords.' },
  { label: 'Outlook/365', host: 'smtp.office365.com',                 port: 587, encryption: 'tls', imap_host: 'outlook.office365.com',  imap_port: 993, imap_encryption: 'ssl', hint: 'Use your Microsoft 365 credentials. Ensure SMTP AUTH is enabled in admin.' },
  { label: 'Hostinger',   host: 'smtp.hostinger.com',                 port: 465, encryption: 'ssl', imap_host: 'imap.hostinger.com',      imap_port: 993, imap_encryption: 'ssl', hint: 'Use your full email as username. IMAP host is imap.hostinger.com.' },
  { label: 'Mailgun',     host: 'smtp.mailgun.org',                   port: 587, encryption: 'tls', imap_host: 'imap.mailgun.org',        imap_port: 993, imap_encryption: 'ssl', hint: 'Use SMTP credentials from Sending → Domain Settings.' },
  { label: 'SendGrid',    host: 'smtp.sendgrid.net',                  port: 587, encryption: 'tls', imap_host: '',                        imap_port: 993, imap_encryption: 'ssl', hint: 'Username is always "apikey". Password is your SendGrid API key.' },
  { label: 'Amazon SES',  host: 'email-smtp.us-east-1.amazonaws.com', port: 587, encryption: 'tls', imap_host: '',                        imap_port: 993, imap_encryption: 'ssl', hint: 'Use SMTP credentials from SES console.' },
  { label: 'Custom',      host: '',                                    port: 587, encryption: 'tls', imap_host: '',                        imap_port: 993, imap_encryption: 'ssl', hint: '' },
]

const BLANK_SMTP = { name: '', host: '', port: 587, encryption: 'tls', username: '', password: '', from_name: '', from_email: '', imap_host: '', imap_port: 993, imap_encryption: 'ssl' }

function SmtpDialog({ open, onClose, existing }) {
  const [form, setForm]   = useState({ ...BLANK_SMTP })
  const [showPw, setShowPw] = useState(false)
  const [saving, setSaving] = useState(false)
  const [hint, setHint]     = useState('')

  useEffect(() => {
    if (open) {
      setForm(existing
        ? { ...existing, password: existing.password ?? '', imap_host: existing.imap_host ?? '', imap_port: existing.imap_port ?? 993, imap_encryption: existing.imap_encryption ?? 'ssl' }
        : { ...BLANK_SMTP })
      setHint('')
    }
  }, [open, existing])

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const applyPreset = p => {
    setForm(f => ({ ...f, host: p.host, port: p.port, encryption: p.encryption, imap_host: p.imap_host, imap_port: p.imap_port, imap_encryption: p.imap_encryption, name: f.name || p.label }))
    setHint(p.hint)
  }

  const handleSubmit = e => {
    e.preventDefault()
    setSaving(true)
    const url    = existing ? `/smtp/${existing.id}` : '/smtp'
    const method = existing ? 'put' : 'post'
    router[method](url, form, {
      preserveState: true, preserveScroll: true,
      onSuccess: () => { toast.success(existing ? 'SMTP updated' : 'SMTP account added'); onClose() },
      onError:   errs => toast.error(Object.values(errs)[0] || 'Validation error'),
      onFinish:  () => setSaving(false),
    })
  }

  return (
    <Dialog open={open} onOpenChange={v => !v && onClose()}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-[14px]">{existing ? 'Edit SMTP account' : 'Add SMTP account'}</DialogTitle>
          <DialogDescription className="text-[12px]">Configure an outbound email account for campaigns.</DialogDescription>
        </DialogHeader>

        <div>
          <p className="text-[10.5px] font-semibold uppercase tracking-wider text-slate-400 mb-1.5">Quick presets</p>
          <div className="flex flex-wrap gap-1.5">
            {PROVIDER_PRESETS.map(p => (
              <button key={p.label} type="button" onClick={() => applyPreset(p)}
                className="px-2.5 py-1 rounded-lg text-[11.5px] font-medium bg-slate-100 text-slate-600 hover:bg-violet-100 hover:text-violet-700 transition-colors">
                {p.label}
              </button>
            ))}
          </div>
          {hint && (
            <p className="mt-2 text-[11.5px] text-amber-700 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2 leading-relaxed">
              ℹ {hint}
            </p>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-3 mt-1">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Field label="Account name">
              <Input value={form.name} onChange={e => set('name', e.target.value)} className="h-8 text-[13px]" placeholder="e.g. Gmail Work" required />
            </Field>
            <Field label="From name">
              <Input value={form.from_name} onChange={e => set('from_name', e.target.value)} className="h-8 text-[13px]" placeholder="Acme CRM" required />
            </Field>
          </div>
          <Field label="From email">
            <Input type="email" value={form.from_email} onChange={e => set('from_email', e.target.value)} className="h-8 text-[13px]" placeholder="you@example.com" required />
          </Field>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <div className="col-span-2">
              <Field label="SMTP host">
                <Input value={form.host} onChange={e => set('host', e.target.value)} className="h-8 text-[13px]" placeholder="smtp.gmail.com" required />
              </Field>
            </div>
            <Field label="Port">
              <Input type="number" value={form.port} onChange={e => set('port', Number(e.target.value))} className="h-8 text-[13px]" required />
            </Field>
          </div>
          <Field label="Encryption">
            <div className="flex gap-2">
              {ENCRYPTION_OPTS.map(opt => (
                <button key={opt} type="button" onClick={() => set('encryption', opt)}
                  className={cn('flex-1 h-8 rounded-lg text-[12px] font-medium border transition-all',
                    form.encryption === opt ? 'border-violet-500 bg-violet-50 text-violet-700' : 'border-slate-200 text-slate-500 hover:border-slate-300')}>
                  {opt.toUpperCase()}
                </button>
              ))}
            </div>
          </Field>
          <Field label="Username / Email">
            <Input value={form.username} onChange={e => set('username', e.target.value)} className="h-8 text-[13px]" placeholder="you@gmail.com" required />
          </Field>
          <Field label="Password" hint={existing ? 'Stored password shown — clear it to keep the current one unchanged.' : undefined}>
            <div className="relative">
              <Input type={showPw ? 'text' : 'password'} value={form.password}
                onChange={e => set('password', e.target.value)} className="h-8 text-[13px] pr-8"
                placeholder="App / SMTP password" required={!existing} />
              <button type="button" className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                onClick={() => setShowPw(v => !v)}>
                {showPw ? <EyeOff size={13} /> : <Eye size={13} />}
              </button>
            </div>
          </Field>

          <div className="border-t border-slate-100 pt-3">
            <p className="text-[10.5px] font-semibold uppercase tracking-wider text-slate-400 mb-1">IMAP inbox (optional)</p>
            <p className="text-[11px] text-slate-400 mb-2">Uses same username &amp; password as SMTP. Enables email fetching.</p>
            <div className="grid grid-cols-3 gap-2 mb-2">
              <div className="col-span-2">
                <Field label="IMAP host">
                  <Input value={form.imap_host} onChange={e => set('imap_host', e.target.value)} className="h-8 text-[13px]" placeholder="imap.gmail.com" />
                </Field>
              </div>
              <Field label="IMAP port">
                <Input type="number" value={form.imap_port} onChange={e => set('imap_port', Number(e.target.value))} className="h-8 text-[13px]" />
              </Field>
            </div>
            <Field label="IMAP encryption">
              <div className="flex gap-2">
                {['ssl', 'tls', 'none'].map(opt => (
                  <button key={opt} type="button" onClick={() => set('imap_encryption', opt)}
                    className={cn('flex-1 h-8 rounded-lg text-[12px] font-medium border transition-all',
                      form.imap_encryption === opt ? 'border-violet-500 bg-violet-50 text-violet-700' : 'border-slate-200 text-slate-500 hover:border-slate-300')}>
                    {opt.toUpperCase()}
                  </button>
                ))}
              </div>
            </Field>
          </div>

          <DialogFooter className="gap-2 pt-1">
            <Button type="button" variant="outline" size="sm" className="h-7 text-xs" onClick={onClose}>Cancel</Button>
            <button type="submit" disabled={saving}
              className="h-7 px-4 text-[12px] font-semibold text-white rounded-lg hover:opacity-90 disabled:opacity-60"
              style={{ background: 'linear-gradient(135deg,#7C3AED,#4F46E5)' }}>
              {saving ? 'Saving…' : existing ? 'Update' : 'Add account'}
            </button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function SmtpCard({ cred, onEdit }) {
  const [testing, setTesting]         = useState(false)
  const [testingImap, setTestingImap] = useState(false)
  const [deleting, setDeleting]       = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)

  const csrfHeaders = () => ({
    'X-CSRF-TOKEN': document.querySelector('meta[name=csrf-token]').content,
    'Accept': 'application/json',
  })

  const activate   = () => router.patch(`/smtp/${cred.id}/activate`,   {}, { preserveState: true, preserveScroll: true, onSuccess: () => toast.success(`"${cred.name}" set as active`) })
  const deactivate = () => router.patch(`/smtp/${cred.id}/deactivate`, {}, { preserveState: true, preserveScroll: true, onSuccess: () => toast.success('Deactivated') })

  const testConnection = async () => {
    setTesting(true)
    try {
      const res  = await fetch(`/smtp/${cred.id}/test`, { method: 'POST', headers: csrfHeaders() })
      const json = await res.json()
      json.ok ? toast.success(json.message) : toast.error(json.message)
    } catch { toast.error('Test failed') } finally { setTesting(false) }
  }

  const testImapConnection = async () => {
    setTestingImap(true)
    try {
      const res  = await fetch(`/smtp/${cred.id}/test-imap`, { method: 'POST', headers: csrfHeaders() })
      const json = await res.json()
      json.ok ? toast.success(json.message) : toast.error('IMAP: ' + json.message)
    } catch { toast.error('IMAP test failed') } finally { setTestingImap(false) }
  }

  const doDelete = () => {
    setDeleting(true)
    router.delete(`/smtp/${cred.id}`, {
      preserveState: true, preserveScroll: true,
      onSuccess: () => toast.success('SMTP account removed'),
      onFinish:  () => { setDeleting(false); setConfirmDelete(false) },
    })
  }

  return (
    <>
      <div className={cn(
        'rounded-xl border p-4 transition-all',
        cred.is_active ? 'border-violet-200 bg-violet-50/50' : 'border-slate-200 bg-white'
      )}>
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <span className="font-semibold text-[13px] text-slate-800 truncate">{cred.name}</span>
              {cred.is_active && (
                <span className="text-[10px] font-bold uppercase tracking-wider text-violet-600 bg-violet-100 px-1.5 py-0.5 rounded-full">Active</span>
              )}
            </div>
            <p className="text-[11.5px] text-slate-500">{cred.from_name} · {cred.from_email}</p>
            <p className="text-[11px] text-slate-400 mt-0.5">{cred.host}:{cred.port} · {cred.encryption.toUpperCase()}</p>
            {cred.imap_host
              ? <p className="text-[11px] text-emerald-600 mt-0.5">IMAP: {cred.imap_host}:{cred.imap_port}</p>
              : <p className="text-[11px] text-slate-300 mt-0.5">IMAP not configured</p>
            }
          </div>
        </div>

        <div className="flex items-center gap-1.5 flex-wrap">
          {cred.is_active
            ? <button onClick={deactivate} className="h-6 px-2.5 text-[11px] font-medium rounded-lg bg-violet-100 text-violet-700 hover:bg-violet-200 transition-colors">Deactivate</button>
            : <button onClick={activate}   className="h-6 px-2.5 text-[11px] font-medium rounded-lg bg-slate-100 text-slate-600 hover:bg-violet-100 hover:text-violet-700 transition-colors flex items-center gap-1"><Check size={10} /> Set active</button>
          }
          <button onClick={testConnection} disabled={testing}
            className="h-6 px-2.5 text-[11px] font-medium rounded-lg bg-slate-100 text-slate-600 hover:bg-blue-100 hover:text-blue-700 transition-colors disabled:opacity-50">
            {testing ? 'Sending…' : 'Test SMTP'}
          </button>
          {cred.imap_host && (
            <button onClick={testImapConnection} disabled={testingImap}
              className="h-6 px-2.5 text-[11px] font-medium rounded-lg bg-slate-100 text-slate-600 hover:bg-emerald-100 hover:text-emerald-700 transition-colors disabled:opacity-50">
              {testingImap ? 'Testing…' : 'Test IMAP'}
            </button>
          )}
          <button onClick={() => onEdit(cred)} className="h-6 px-2.5 text-[11px] font-medium rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors">Edit</button>
          <button onClick={() => setConfirmDelete(true)} className="h-6 px-2.5 text-[11px] font-medium rounded-lg bg-slate-100 text-red-500 hover:bg-red-50 transition-colors">Remove</button>
        </div>
      </div>

      <Dialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-[13px]">Remove "{cred.name}"?</DialogTitle>
            <DialogDescription className="text-[12px]">This SMTP account will be permanently removed.</DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => setConfirmDelete(false)}>Cancel</Button>
            <Button size="sm" variant="destructive" className="h-7 text-xs" disabled={deleting} onClick={doDelete}>
              {deleting ? 'Removing…' : 'Remove'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

function SmtpTab({ credentials }) {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing]       = useState(null)
  const openAdd    = ()   => { setEditing(null); setDialogOpen(true) }
  const openEdit   = cred => { setEditing(cred); setDialogOpen(true) }
  const closeDialog = ()  => { setDialogOpen(false); setEditing(null) }

  return (
    <div className="space-y-3 max-w-xl">
      <Card
        title="SMTP accounts"
        badge={
          <Button size="sm" className="h-7 text-xs gap-1.5" onClick={openAdd}>
            <Plus size={11} /> Add account
          </Button>
        }
      >
        {credentials.length === 0 ? (
          <div className="text-center py-8 rounded-lg border-2 border-dashed border-slate-100">
            <Server size={20} className="mx-auto text-slate-300 mb-2" />
            <p className="text-[13px] text-slate-500 font-medium">No SMTP accounts yet</p>
            <p className="text-[12px] text-slate-400 mb-3">Add one to start sending campaigns</p>
            <Button size="sm" className="gap-1.5 h-8 text-xs" onClick={openAdd}>
              <Plus size={12} /> Add SMTP account
            </Button>
          </div>
        ) : (
          <div className="space-y-2">
            {credentials.map(cred => (
              <SmtpCard key={cred.id} cred={cred} onEdit={openEdit} />
            ))}
          </div>
        )}
      </Card>

      <div className="rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-[12px] text-blue-800 space-y-1">
        <p className="font-semibold">How SMTP works</p>
        <ul className="space-y-0.5 text-[11.5px] text-blue-700 list-disc list-inside">
          <li>Gmail: enable 2FA → Google Account → Security → App Passwords</li>
          <li>Only one account can be <em>active</em> at a time — used by all campaigns</li>
          <li>Click <strong>Test SMTP</strong> to verify connectivity</li>
        </ul>
      </div>

      <SmtpDialog open={dialogOpen} onClose={closeDialog} existing={editing} />
    </div>
  )
}

// ─── Mail settings tab ────────────────────────────────────────────────────────

function MailTab({ mailSettings, orgFollowupEnabled }) {
  const { data, setData, patch, processing } = useForm({
    mail_batch_size:  mailSettings.batch_size,
    mail_batch_delay: mailSettings.batch_delay,
  })

  const [followupEnabled, setFollowupEnabled] = useState(!!orgFollowupEnabled)
  const [savingFollowup, setSavingFollowup]   = useState(false)

  const saveFollowup = () => {
    setSavingFollowup(true)
    router.post('/organization/settings', { followup_enabled: followupEnabled }, {
      preserveState: true,
      preserveScroll: true,
      onSuccess: () => toast.success(followupEnabled ? 'Automated follow-ups enabled' : 'Automated follow-ups disabled'),
      onError:   () => toast.error('Could not save setting'),
      onFinish:  () => setSavingFollowup(false),
    })
  }

  const submit = e => {
    e.preventDefault()
    patch('/settings/mail', {
      preserveState: true,
      onSuccess: () => toast.success('Mail settings saved'),
      onError:   () => toast.error('Validation error'),
    })
  }

  return (
    <div className="space-y-3 max-w-xl">
      <Card title="Bulk send configuration">
        <form onSubmit={submit} className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Field label="Batch size" hint="Emails sent per batch before pausing.">
              <Input type="number" min="1" max="500" value={data.mail_batch_size}
                onChange={e => setData('mail_batch_size', Number(e.target.value))}
                className="h-8 text-[13px]" />
            </Field>
            <Field label="Delay between batches (s)" hint="Pause to avoid rate-limits.">
              <Input type="number" min="0" max="300" value={data.mail_batch_delay}
                onChange={e => setData('mail_batch_delay', Number(e.target.value))}
                className="h-8 text-[13px]" />
            </Field>
          </div>

          <div className="bg-slate-50 border border-slate-100 rounded-lg px-3 py-2.5 text-[11.5px] text-slate-500">
            Sends <strong>{data.mail_batch_size} emails</strong>, pauses <strong>{data.mail_batch_delay}s</strong>, then repeats.
          </div>

          <SaveBtn processing={processing} label="Save mail settings" />
        </form>
      </Card>

      <Card title="Automated follow-ups">
        <div className="space-y-3">
          <p className="text-[12px] text-slate-500 leading-relaxed">
            When enabled, campaigns with a follow-up message will automatically re-send to leads
            who haven't opened the first email after the configured delay.
          </p>

          <div className="flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50 px-3 py-2.5">
            <div>
              <p className="text-[13px] font-medium text-slate-700">Enable automated follow-ups</p>
              <p className="text-[11.5px] text-slate-400 mt-0.5">Workspace-wide toggle — each campaign also has its own switch</p>
            </div>
            {/* Toggle switch */}
            <button
              type="button"
              onClick={() => setFollowupEnabled(v => !v)}
              className={cn(
                'relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none',
                followupEnabled ? 'bg-violet-600' : 'bg-slate-200'
              )}
              role="switch"
              aria-checked={followupEnabled}
            >
              <span
                className={cn(
                  'pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200',
                  followupEnabled ? 'translate-x-4' : 'translate-x-0'
                )}
              />
            </button>
          </div>

          <div className="flex justify-end">
            <Button
              size="sm"
              disabled={savingFollowup}
              onClick={saveFollowup}
              className="h-7 text-[12px] px-3 bg-gradient-to-r from-violet-600 to-indigo-600 text-white border-0 hover:opacity-90"
            >
              {savingFollowup ? 'Saving…' : 'Save follow-up setting'}
            </Button>
          </div>
        </div>
      </Card>

      <Card title="Provider limits reference">
        <div className="divide-y divide-slate-100">
          {[
            { name: 'Gmail',       limit: '500/day',           batch: '10 / 5s',  note: 'Good for small lists.' },
            { name: 'Mailgun',     limit: '10k/mo free',       batch: '50 / 2s',  note: 'Best free-tier deliverability.' },
            { name: 'SendGrid',    limit: '100/day free',      batch: '50 / 2s',  note: 'Small campaigns.' },
            { name: 'Amazon SES',  limit: '62k/mo (on EC2)',   batch: '100 / 1s', note: 'Best for high volume.' },
          ].map(p => (
            <div key={p.name} className="flex items-center gap-3 py-2 text-[12px]">
              <span className="w-24 font-medium text-slate-700 shrink-0">{p.name}</span>
              <span className="text-slate-500">{p.limit}</span>
              <span className="text-slate-400 ml-auto">{p.note}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}

// ─── Templates tab ────────────────────────────────────────────────────────────

// Mini previews mirror the three built-in designs (header / body / signature / footer)
const TEMPLATE_PREVIEWS = {
  '#534ab7': {
    frame: 'bg-[#f3f2f0]',
    header: { wrap: 'bg-white border-b border-[#e0ddd8]', line1: 'bg-[#1a1a1a] w-12', line2: 'bg-[#cfcfcf] w-8 ml-auto -mt-1' },
    body:   { wrap: 'bg-white', title: 'bg-[#d4d4d4]', text: 'bg-[#ececec]' },
    sig:    { wrap: 'bg-white border-t border-[#e0ddd8]', name: 'bg-[#534ab7]', link: 'bg-[#d4d4d4]' },
    footer: { wrap: 'bg-[#f9f8f6]', line: 'bg-[#cfcfcf] mx-auto' },
  },
  '#c0894e': {
    frame: 'bg-[#efe6d6]',
    header: { wrap: 'bg-gradient-to-br from-[#f7eedd] via-[#efe0c6] to-[#e7d3b2]', line1: 'bg-[#7a4f1f] w-8', line2: 'bg-[#3b2c1a] w-16' },
    body:   { wrap: 'bg-[#fffdf8]', title: 'bg-[#cdb78f]', text: 'bg-[#ece0cb]' },
    sig:    { wrap: 'bg-[#f6ead2] border-l-2 border-[#c79a55]', name: 'bg-[#b89766]', link: 'bg-[#dcc59a]' },
    footer: { wrap: 'bg-[#2c2113]', line: 'bg-[#f3e7d2]/30' },
  },
  '#94795a': {
    frame: 'bg-[#f4efe6]',
    header: { wrap: 'bg-[#fffdf9] border-t-2 border-[#bf9b63] border-b border-[#efe6d4]', line1: 'bg-[#2c2418] w-12 mx-auto', line2: 'bg-[#d8c39a] w-8 mx-auto' },
    body:   { wrap: 'bg-[#fffdf9]', title: 'bg-[#cdb78f]', text: 'bg-[#ece0cb]' },
    sig:    { wrap: 'bg-[#fffdf9] border-t border-[#efe6d4]', name: 'bg-[#b89766]', link: 'bg-[#dcc59a]' },
    footer: { wrap: 'bg-[#faf6ed]', line: 'bg-[#d8c39a] mx-auto' },
  },
  '#1c1917': {
    frame: 'bg-[#13100c]',
    header: { wrap: 'bg-[#1f1a14] border-t-2 border-[#c9a86a]', line1: 'bg-[#c9a86a]/60 w-8', line2: 'bg-[#f6ecd8]/80 w-16' },
    body:   { wrap: 'bg-[#1f1a14]', title: 'bg-[#6b5a3a]', text: 'bg-[#2e2820]' },
    sig:    { wrap: 'bg-[#c9a86a]/10 border-l-2 border-[#c9a86a]', name: 'bg-[#8a7550]', link: 'bg-[#7a6638]' },
    footer: { wrap: 'bg-black/40', line: 'bg-[#c9a86a]/30' },
  },
}

function TemplateMiniPreview({ color }) {
  const s = TEMPLATE_PREVIEWS[color] || TEMPLATE_PREVIEWS['#c0894e']
  return (
    <div className={cn('w-full rounded-lg overflow-hidden border border-slate-200/80 p-2', s.frame)} style={{ aspectRatio: '4/3.2' }}>
      <div className="rounded-md overflow-hidden shadow-sm h-full flex flex-col">
        <div className={cn('px-2.5 py-2', s.header.wrap)}>
          <div className={cn('h-1 rounded mb-1', s.header.line1)} />
          <div className={cn('h-1.5 rounded', s.header.line2)} />
        </div>
        <div className={cn('px-2.5 py-2 flex-1', s.body.wrap)}>
          <div className={cn('h-1.5 rounded w-20 mb-1.5', s.body.title)} />
          <div className={cn('h-1 rounded w-full mb-1', s.body.text)} />
          <div className={cn('h-1 rounded w-4/5 mb-2', s.body.text)} />
          <div className={cn('rounded-sm px-1.5 py-1', s.sig.wrap)}>
            <div className={cn('h-1 rounded w-10 mb-0.5', s.sig.name)} />
            <div className={cn('h-0.5 rounded w-14 mb-0.5', s.sig.link)} />
            <div className={cn('h-0.5 rounded w-12', s.sig.link)} />
          </div>
        </div>
        <div className={cn('px-2.5 py-1.5', s.footer.wrap)}>
          <div className={cn('h-1 rounded w-16', s.footer.line)} />
        </div>
      </div>
    </div>
  )
}

function TemplateCard({ template, isActive, onActivate, onPreview, onDeactivate }) {
  return (
    <div className={cn('rounded-xl border p-3 transition-all hover:shadow-md hover:-translate-y-0.5 duration-200',
      isActive ? 'border-violet-300 bg-violet-50/50 ring-1 ring-violet-200' : 'border-slate-200 bg-white')}>
      <div className="mb-3 relative">
        <TemplateMiniPreview color={template.thumbnail_color} />
        {isActive && (
          <div className="absolute top-3 right-3 flex items-center gap-1 bg-violet-600 text-white text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full shadow-sm">
            <CheckCircle2 size={9} /> Active
          </div>
        )}
      </div>
      <p className="text-[12.5px] font-semibold text-slate-800 mb-0.5">{template.name}</p>
      {template.description && <p className="text-[11px] text-slate-400 leading-snug mb-2.5">{template.description}</p>}
      <div className="flex items-center gap-1.5">
        {isActive
          ? <button onClick={onDeactivate} className="flex-1 h-7 text-[11px] font-medium rounded-lg bg-violet-100 text-violet-700 hover:bg-violet-200 transition-colors">Deactivate</button>
          : <button onClick={onActivate}   className="flex-1 h-7 text-[11px] font-semibold rounded-lg bg-slate-900 text-white hover:bg-violet-700 transition-colors flex items-center justify-center gap-1"><Check size={10} /> Use template</button>
        }
        <button onClick={onPreview} title="Preview"
          className="h-7 w-7 shrink-0 rounded-lg bg-slate-100 text-slate-600 hover:bg-blue-100 hover:text-blue-700 transition-colors flex items-center justify-center">
          <Eye size={12} />
        </button>
      </div>
    </div>
  )
}

function TemplatesTab({ templates, activeTemplateId, onGoToWorkspace }) {
  const [previewTemplate, setPreviewTemplate] = useState(null)

  const activate = template => router.patch(`/email-templates/${template.id}/activate`, {}, {
    preserveState: true, preserveScroll: true,
    onSuccess: () => toast.success(`"${template.name}" set as active template`),
  })
  const deactivate = () => router.patch('/email-templates/deactivate', {}, {
    preserveState: true, preserveScroll: true,
    onSuccess: () => toast.success('Template deactivated'),
  })

  const activeTemplate = templates.find(t => t.id === activeTemplateId)

  return (
    <div className="space-y-3 max-w-2xl">
      <div className="bg-violet-50 border border-violet-100 rounded-xl px-4 py-3 text-[12px] text-violet-800">
        <p className="font-semibold flex items-center gap-1.5 mb-0.5"><LayoutTemplate size={13} /> Email templates</p>
        <p className="text-[11.5px] text-violet-700">
          Pick one of the three built-in designs — the active template wraps every campaign email.
          {activeTemplate ? <> Currently using <strong>{activeTemplate.name}</strong>.</> : <> No template active — emails are sent as raw HTML.</>}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {templates.map(template => (
          <TemplateCard key={template.id} template={template}
            isActive={template.id === activeTemplateId}
            onActivate={() => activate(template)}
            onDeactivate={deactivate}
            onPreview={() => setPreviewTemplate(template)} />
        ))}
      </div>

      <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 flex items-start gap-3">
        <div className="w-8 h-8 rounded-lg bg-violet-50 flex items-center justify-center shrink-0 mt-0.5">
          <PenLine size={14} className="text-violet-600" />
        </div>
        <div className="flex-1 text-[12px]">
          <p className="font-semibold text-slate-700 mb-0.5">Built-in signature</p>
          <p className="text-[11.5px] text-slate-500 leading-relaxed">
            Every template ends with a signature showing your name, company, website, phone, and email — pulled
            automatically from your{' '}
            <button onClick={onGoToWorkspace} className="text-violet-600 font-medium hover:underline">Workspace settings</button>.
            Empty fields are simply left out.
          </p>
        </div>
      </div>

      {previewTemplate && (
        <Dialog open onOpenChange={v => !v && setPreviewTemplate(null)}>
          <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col p-0 gap-0">
            <DialogHeader className="px-5 py-3.5 border-b border-slate-100">
              <div className="flex items-center justify-between">
                <DialogTitle className="text-[13.5px] font-semibold">{previewTemplate.name}</DialogTitle>
                <a href={`/email-templates/${previewTemplate.id}/preview`} target="_blank" rel="noreferrer"
                  className="flex items-center gap-1 text-[11px] text-violet-600 hover:text-violet-700 mr-6">
                  <ExternalLink size={11} /> Open full
                </a>
              </div>
            </DialogHeader>
            <div className="flex-1 overflow-hidden" style={{ minHeight: 500 }}>
              <iframe src={`/email-templates/${previewTemplate.id}/preview`} title={previewTemplate.name}
                className="w-full h-full border-0" style={{ minHeight: 500 }} />
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}

// ─── Lead Generation tab ──────────────────────────────────────────────────────

const PROVIDER_OPTIONS = [
  { value: 'apollo', label: 'Apollo.io',         hint: 'Free plan: searches your own contacts only. Paid plans unlock full database.' },
  { value: 'pdl',    label: 'People Data Labs',  hint: 'Free trial includes 1,000 credits. Each page of 10 results = 10 credits.' },
]

function LeadGenTab({ leadGenSettings }) {
  const csrf = () => document.querySelector('meta[name=csrf-token]')?.content

  const currentProvider = leadGenSettings?.provider || 'apollo'
  const isConfigured    = leadGenSettings?.enabled && leadGenSettings?.hasKey

  const [provider,    setProvider]    = useState(currentProvider)
  const [apiKey,      setApiKey]      = useState('')
  const [showKey,     setShowKey]     = useState(false)
  const [testing,     setTesting]     = useState(false)
  const [saving,      setSaving]      = useState(false)
  const [testResult,  setTestResult]  = useState(null)
  const [testMessage, setTestMessage] = useState('')

  const resetTest = () => setTestResult(null)
  const selectedOption = PROVIDER_OPTIONS.find(o => o.value === provider)

  const headers = () => ({
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'X-CSRF-TOKEN': csrf(),
  })

  const handleTest = async () => {
    if (!apiKey.trim()) { toast.error('Enter an API key first'); return }
    setTesting(true); setTestResult(null)
    try {
      const res  = await fetch('/settings/lead-provider/test', { method: 'POST', headers: headers(), body: JSON.stringify({ provider, api_key: apiKey }) })
      const json = await res.json()
      if (json.success) { setTestResult('success'); setTestMessage(`Connected to ${json.provider} successfully`) }
      else              { setTestResult('error');   setTestMessage(json.message || 'Connection failed') }
    } catch { setTestResult('error'); setTestMessage('Request failed — check your network') }
    finally { setTesting(false) }
  }

  const handleSave = async () => {
    if (!apiKey.trim()) { toast.error('Enter an API key first'); return }
    setSaving(true)
    try {
      const res  = await fetch('/settings/lead-provider/save', { method: 'POST', headers: headers(), body: JSON.stringify({ provider, api_key: apiKey }) })
      const json = await res.json()
      if (json.success) { toast.success('Lead generation provider saved'); setApiKey(''); setTestResult(null) }
      else              { toast.error(json.message || 'Save failed') }
    } catch { toast.error('Request failed') }
    finally { setSaving(false) }
  }

  return (
    <div className="space-y-3 max-w-xl">

      {/* Current status card */}
      {isConfigured && (
        <div className="flex items-center gap-3 px-4 py-3 bg-emerald-50 border border-emerald-200 rounded-xl">
          <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center shrink-0">
            <Wifi size={14} className="text-emerald-600" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[13px] font-semibold text-emerald-800">Connected</p>
            <p className="text-[11.5px] text-emerald-600">
              {PROVIDER_OPTIONS.find(o => o.value === currentProvider)?.label ?? currentProvider}
            </p>
          </div>
          <Badge variant="outline" className="text-[10px] border-emerald-300 text-emerald-700 shrink-0">Active</Badge>
        </div>
      )}

      {/* Provider selection */}
      <Card title="Data provider">
        <div className="space-y-3">
          <Field label="Provider">
            <Select value={provider} onValueChange={v => { setProvider(v); resetTest() }}>
              <SelectTrigger className="h-8 text-[13px]">
                <SelectValue placeholder="Select provider" />
              </SelectTrigger>
              <SelectContent>
                {PROVIDER_OPTIONS.map(o => (
                  <SelectItem key={o.value} value={o.value} className="text-[13px]">{o.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedOption && (
              <p className="text-[11px] text-slate-400 mt-1">{selectedOption.hint}</p>
            )}
          </Field>

          <Field label={isConfigured ? 'API key (enter new key to update)' : 'API key'}>
            <div className="relative">
              <Input
                type={showKey ? 'text' : 'password'}
                value={apiKey}
                onChange={e => { setApiKey(e.target.value); resetTest() }}
                className="h-8 text-[13px] pr-8"
                placeholder={isConfigured ? '••••••••••••• (saved)' : 'Paste your API key'}
              />
              <button type="button" onClick={() => setShowKey(v => !v)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                {showKey ? <EyeOff size={13} /> : <Eye size={13} />}
              </button>
            </div>
          </Field>

          {testResult === 'success' && (
            <div className="flex items-center gap-2 px-3 py-2 bg-emerald-50 border border-emerald-200 rounded-lg">
              <Check size={13} className="text-emerald-600 shrink-0" />
              <p className="text-[12px] text-emerald-700">{testMessage}</p>
            </div>
          )}
          {testResult === 'error' && (
            <div className="flex items-center gap-2 px-3 py-2 bg-red-50 border border-red-200 rounded-lg">
              <AlertCircle size={13} className="text-red-500 shrink-0" />
              <p className="text-[12px] text-red-600">{testMessage}</p>
            </div>
          )}

          <div className="flex gap-2 pt-1">
            <Button type="button" variant="outline" size="sm" className="h-8 text-xs gap-1.5"
              onClick={handleTest} disabled={testing || !apiKey.trim()}>
              <Zap size={12} />
              {testing ? 'Testing…' : 'Test Connection'}
            </Button>
            <button type="button"
              onClick={handleSave}
              disabled={saving || !apiKey.trim() || testResult !== 'success'}
              className="h-8 px-4 text-[12.5px] font-semibold text-white rounded-lg hover:opacity-90 disabled:opacity-40 transition-all"
              style={{ background: 'linear-gradient(135deg,#7C3AED,#4F46E5)' }}>
              <Key size={12} className="inline mr-1.5" />
              {saving ? 'Saving…' : 'Save Provider'}
            </button>
          </div>
          <p className="text-[10.5px] text-slate-400">Test Connection must succeed before you can save.</p>
        </div>
      </Card>

      {/* Credit reference */}
      <Card title="Credit usage">
        <div className="divide-y divide-slate-100 text-[12px]">
          <div className="flex items-center justify-between py-2">
            <span className="text-slate-600">Per search page (10 results)</span>
            <span className="font-semibold text-slate-800">10 credits</span>
          </div>
          <div className="flex items-center justify-between py-2">
            <span className="text-slate-600">PDL free trial balance</span>
            <span className="font-semibold text-slate-800">1,000 credits</span>
          </div>
          <div className="flex items-center justify-between py-2">
            <span className="text-slate-600">Searches available on free trial</span>
            <span className="font-semibold text-emerald-600">~100 searches</span>
          </div>
        </div>
        <p className="text-[11px] text-slate-400 mt-1">
          Already-imported leads are filtered out automatically — credits are only spent on new results.
        </p>
      </Card>
    </div>
  )
}

// ─── AI Provider tab ──────────────────────────────────────────────────────────

const PROVIDERS = [
  { id: 'claude', label: 'Claude (Anthropic)', color: '#D97706', hint: 'Best for reasoning and natural conversation' },
  { id: 'openai', label: 'OpenAI',             color: '#10B981', hint: 'GPT-4o, o1, and the full OpenAI lineup' },
  { id: 'kimi',   label: 'Kimi K2 (NVIDIA NIM)', color: '#6366F1', hint: 'Access Kimi K2, Llama 3.1, DeepSeek, and more' },
]

const PROVIDER_MODELS = {
  claude: [
    { id: 'claude-opus-4-8',          label: 'Claude Opus 4.8' },
    { id: 'claude-sonnet-4-6',        label: 'Claude Sonnet 4.6' },
    { id: 'claude-haiku-4-5-20251001', label: 'Claude Haiku 4.5' },
    { id: 'claude-opus-4-5',          label: 'Claude Opus 4.5' },
    { id: 'claude-sonnet-3-7',        label: 'Claude Sonnet 3.7' },
    { id: 'claude-sonnet-3-5',        label: 'Claude Sonnet 3.5' },
    { id: 'claude-haiku-3-5',         label: 'Claude Haiku 3.5' },
  ],
  openai: [
    { id: 'gpt-4o',        label: 'GPT-4o' },
    { id: 'gpt-4o-mini',   label: 'GPT-4o mini' },
    { id: 'gpt-4-turbo',   label: 'GPT-4 Turbo' },
    { id: 'gpt-3.5-turbo', label: 'GPT-3.5 Turbo' },
    { id: 'o3-mini',       label: 'o3-mini' },
    { id: 'o1-mini',       label: 'o1-mini' },
    { id: 'o1',            label: 'o1' },
  ],
  kimi: [
    { id: 'moonshotai/kimi-k2',                          label: 'Kimi K2' },
    { id: 'moonshotai/kimi-k2.6',                        label: 'Kimi K2.6' },
    { id: 'nvidia/llama-3.1-nemotron-70b-instruct',      label: 'Llama 3.1 Nemotron 70B' },
    { id: 'meta/llama-3.1-405b-instruct',                label: 'Llama 3.1 405B' },
    { id: 'nvidia/mistral-nemo-minitron-8b-8k-instruct', label: 'Mistral Nemo Minitron 8B' },
    { id: 'deepseek-ai/deepseek-r1',                     label: 'DeepSeek R1' },
  ],
}

function ModelCombobox({ provider, value, onChange }) {
  const [search, setSearch] = React.useState('')
  const [open, setOpen]     = React.useState(false)
  const models              = PROVIDER_MODELS[provider] ?? []

  const filtered = search.trim()
    ? models.filter(m => m.label.toLowerCase().includes(search.toLowerCase()) || m.id.toLowerCase().includes(search.toLowerCase()))
    : models

  const selectedLabel = models.find(m => m.id === value)?.label ?? value

  const pick = (id) => {
    onChange(id)
    setSearch('')
    setOpen(false)
  }

  return (
    <div className="relative">
      <div
        className="h-8 px-3 flex items-center justify-between rounded-md border border-slate-200 bg-white cursor-pointer text-[13px] hover:border-violet-400 transition-colors"
        onClick={() => setOpen(o => !o)}>
        <span className={value ? 'text-slate-800 font-mono text-[12px]' : 'text-slate-400'}>
          {value ? selectedLabel : 'Select or type a model…'}
        </span>
        <svg width="10" height="10" viewBox="0 0 10 10" fill="none" className={`text-slate-400 transition-transform ${open ? 'rotate-180' : ''}`}>
          <path d="M2 4l3 3 3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>

      {open && (
        <div className="absolute z-50 top-full mt-1 left-0 right-0 bg-white border border-slate-200 rounded-xl shadow-lg overflow-hidden">
          {/* Search input */}
          <div className="px-2 pt-2 pb-1 border-b border-slate-100">
            <input
              autoFocus
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search or type custom model ID…"
              className="w-full h-7 px-2 text-[12px] rounded border border-slate-200 focus:outline-none focus:border-violet-400"
            />
          </div>

          {/* Known models */}
          <div className="max-h-48 overflow-y-auto">
            {filtered.map(m => (
              <button key={m.id} type="button"
                onClick={() => pick(m.id)}
                className={cn(
                  'w-full text-left px-3 py-2 text-[12.5px] hover:bg-violet-50 transition-colors',
                  value === m.id ? 'bg-violet-50 text-violet-700 font-medium' : 'text-slate-700'
                )}>
                <span className="font-medium">{m.label}</span>
                <span className="ml-2 font-mono text-[10px] text-slate-400">{m.id}</span>
              </button>
            ))}

            {filtered.length === 0 && search.trim() && (
              <button type="button"
                onClick={() => pick(search.trim())}
                className="w-full text-left px-3 py-2.5 text-[12.5px] text-violet-700 hover:bg-violet-50 transition-colors border-t border-slate-100">
                Use custom: <span className="font-mono font-medium">"{search.trim()}"</span>
              </button>
            )}
          </div>

          {/* Custom model entry shortcut */}
          {search.trim() && filtered.length > 0 && (
            <div className="px-3 py-2 border-t border-slate-100">
              <button type="button" onClick={() => pick(search.trim())}
                className="text-[11px] text-violet-600 hover:underline">
                Use custom: <span className="font-mono">"{search.trim()}"</span>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function AiProviderTab({ aiSetting }) {
  const [provider, setProvider]       = React.useState(aiSetting?.provider ?? 'openai')
  const [apiKey, setApiKey]           = React.useState('')
  const [model, setModel]             = React.useState(aiSetting?.model ?? '')
  const [baseUrl, setBaseUrl]         = React.useState(aiSetting?.base_url ?? '')
  const [showKey, setShowKey]         = React.useState(false)
  const [validating, setValidating]   = React.useState(false)
  const [validated, setValidated]     = React.useState(aiSetting?.is_validated ?? false)
  const [validMsg, setValidMsg]       = React.useState('')
  const [saving, setSaving]           = React.useState(false)

  // Reset model when provider changes
  React.useEffect(() => {
    const defaultModel = PROVIDER_MODELS[provider]?.[0]?.id ?? ''
    if (!aiSetting || aiSetting.provider !== provider) {
      setModel(defaultModel)
    }
    setValidated(false)
    setValidMsg('')
  }, [provider])

  const providerColor = PROVIDERS.find(p => p.id === provider)?.color ?? '#7C3AED'

  const validate = async () => {
    if (!apiKey.trim()) { toast.error('Enter your API key first.'); return }
    if (!model.trim())  { toast.error('Select a model first.'); return }

    setValidating(true)
    setValidated(false)
    setValidMsg('')

    try {
      const res = await fetch(route('ai.validate'), {
        method:  'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': document.head.querySelector('meta[name="csrf-token"]')?.content ?? '',
          Accept:         'application/json',
        },
        body: JSON.stringify({ provider, api_key: apiKey, model, base_url: baseUrl || null }),
      })
      const data = await res.json()
      setValidated(data.success)
      setValidMsg(data.message ?? '')
      if (data.success) toast.success('API key validated successfully.')
      else              toast.error(data.message ?? 'Validation failed.')
    } catch {
      setValidMsg('Network error. Try again.')
    } finally {
      setValidating(false)
    }
  }

  const save = async (e) => {
    e.preventDefault()
    if (!apiKey.trim()) { toast.error('Enter your API key.'); return }
    if (!model.trim())  { toast.error('Select a model.'); return }

    setSaving(true)
    router.post(route('ai.store'), {
      provider,
      api_key:  apiKey,
      model,
      base_url: baseUrl || null,
    }, {
      onSuccess: () => toast.success('AI provider saved successfully.'),
      onError:   (e) => toast.error(Object.values(e)[0] ?? 'Save failed.'),
      onFinish:  () => setSaving(false),
    })
  }

  const remove = () => {
    if (!confirm('Remove AI configuration?')) return
    router.delete(route('ai.destroy'), {
      onSuccess: () => { toast.success('AI configuration removed.'); setValidated(false) },
    })
  }

  return (
    <div className="space-y-3 max-w-xl">
      {/* Current status */}
      {aiSetting && (
        <div className={`flex items-start gap-2.5 rounded-xl px-4 py-3 border ${aiSetting.is_validated ? 'bg-emerald-50 border-emerald-200' : 'bg-amber-50 border-amber-200'}`}>
          {aiSetting.is_validated
            ? <CheckCircle2 size={15} className="text-emerald-500 mt-0.5 shrink-0" />
            : <AlertCircle  size={15} className="text-amber-500 mt-0.5 shrink-0" />}
          <div>
            <p className={`text-[13px] font-medium ${aiSetting.is_validated ? 'text-emerald-800' : 'text-amber-800'}`}>
              {aiSetting.is_validated ? 'AI provider connected & validated' : 'AI provider saved — not yet validated'}
            </p>
            <p className="text-[12px] text-slate-500 mt-0.5">
              {PROVIDERS.find(p => p.id === aiSetting.provider)?.label} · <span className="font-mono">{aiSetting.model}</span>
            </p>
          </div>
        </div>
      )}

      <form onSubmit={save} className="space-y-3">
        {/* Provider selector */}
        <div className="bg-white rounded-xl border border-slate-200 px-5 py-4 space-y-3">
          <p className="text-[11.5px] font-semibold uppercase tracking-wider text-slate-400">AI Provider</p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {PROVIDERS.map(p => (
              <button key={p.id} type="button"
                onClick={() => setProvider(p.id)}
                className={cn(
                  'flex flex-col text-left p-3 rounded-xl border-2 transition-all',
                  provider === p.id ? 'border-[var(--c)] bg-[var(--c)]/5' : 'border-slate-200 hover:border-slate-300'
                )}
                style={{ '--c': p.color }}>
                <span className={cn('text-[13px] font-semibold', provider === p.id ? 'text-[var(--c)]' : 'text-slate-700')}
                  style={provider === p.id ? { color: p.color } : {}}>
                  {p.label}
                </span>
                <span className="text-[10.5px] text-slate-400 mt-0.5 leading-snug">{p.hint}</span>
              </button>
            ))}
          </div>
        </div>

        {/* API Key + Validate */}
        <div className="bg-white rounded-xl border border-slate-200 px-5 py-4 space-y-3">
          <p className="text-[11.5px] font-semibold uppercase tracking-wider text-slate-400">API Key</p>

          <Field label={`${PROVIDERS.find(p => p.id === provider)?.label} API Key`}>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Input
                  type={showKey ? 'text' : 'password'}
                  value={apiKey}
                  onChange={e => { setApiKey(e.target.value); setValidated(false) }}
                  className="h-8 text-[13px] font-mono pr-8"
                  placeholder={provider === 'claude' ? 'sk-ant-...' : provider === 'openai' ? 'sk-...' : 'nvapi-...'}
                />
                <button type="button" onClick={() => setShowKey(v => !v)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  {showKey ? <EyeOff size={13} /> : <Eye size={13} />}
                </button>
              </div>
              <Button type="button" size="sm" disabled={validating || !apiKey.trim() || !model.trim()}
                onClick={validate}
                className="h-8 shrink-0 text-[12px] text-white"
                style={{ background: validating ? '#94A3B8' : 'linear-gradient(135deg,#7C3AED,#4F46E5)' }}>
                {validating ? 'Testing…' : validated ? '✓ Valid' : 'Validate'}
              </Button>
            </div>

            {validMsg && (
              <p className={`text-[11.5px] mt-1 ${validated ? 'text-emerald-600' : 'text-red-500'}`}>
                {validated ? '✓ ' : '✗ '}{validMsg}
              </p>
            )}
          </Field>

          {/* Model selector — always shown, highlighted once validated */}
          <Field label="Model"
            hint="Pick from the list or type any custom model ID">
            <ModelCombobox provider={provider} value={model} onChange={setModel} />
          </Field>

          {/* Optional base URL override */}
          {provider === 'kimi' && (
            <Field label="Base URL (optional)" hint="Leave blank for default NVIDIA NIM endpoint">
              <Input value={baseUrl} onChange={e => setBaseUrl(e.target.value)}
                className="h-8 text-[12px] font-mono"
                placeholder="https://integrate.api.nvidia.com/v1" />
            </Field>
          )}
        </div>

        {/* Save / Remove */}
        <div className="flex items-center justify-between">
          {aiSetting && (
            <button type="button" onClick={remove}
              className="text-[12px] text-red-400 hover:text-red-600 transition-colors">
              Remove configuration
            </button>
          )}
          <div className="ml-auto">
            <SaveBtn processing={saving} label="Save configuration" loadingLabel="Saving…" />
          </div>
        </div>
      </form>

      {/* Usage summary */}
      <Card title="Where this AI is used">
        <div className="space-y-2 text-[12.5px] text-slate-600">
          <div className="flex items-start gap-2">
            <Sparkles size={13} className="text-violet-400 mt-0.5 shrink-0" />
            <p><span className="font-medium">AI Lead Search</span> — converts plain-English prompts into structured search filters</p>
          </div>
          <div className="flex items-start gap-2">
            <MessageSquare size={13} className="text-emerald-400 mt-0.5 shrink-0" />
            <p><span className="font-medium">WhatsApp Bot</span> — auto-replies to incoming leads using your knowledge base</p>
          </div>
        </div>
      </Card>
    </div>
  )
}

// ─── WhatsApp tab ─────────────────────────────────────────────────────────────

function WhatsappTab({ credential }) {
  const { data, setData, post, delete: del, processing, errors, reset } = useForm({
    account_sid:  credential?.account_sid  ?? '',
    auth_token:   '',
    from_number:  credential?.from_number  ?? '',
    display_name: credential?.display_name ?? '',
  })

  const [testNumber, setTestNumber]         = React.useState('')
  const [testing, setTesting]               = React.useState(false)
  const [testResult, setTestResult]         = React.useState(null) // 'success' | 'error' | null
  const [testMessage, setTestMessage]       = React.useState('')

  const submit = e => {
    e.preventDefault()
    post(route('whatsapp.store'), {
      onSuccess: () => toast.success('WhatsApp credentials saved.'),
      onError:   () => toast.error('Please fix the errors below.'),
    })
  }

  const verify = async () => {
    if (!testNumber.trim()) return
    setTesting(true)
    setTestResult(null)
    try {
      const res = await fetch(route('whatsapp.verify'), {
        method:  'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': document.head.querySelector('meta[name="csrf-token"]')?.content ?? '',
          Accept:         'application/json',
        },
        body: JSON.stringify({ test_number: testNumber }),
      })
      const data = await res.json()
      setTestResult(data.success ? 'success' : 'error')
      setTestMessage(data.message ?? '')
      if (data.success) toast.success(data.message)
      else              toast.error(data.message)
    } catch (err) {
      setTestResult('error')
      setTestMessage('Network error. Check your connection.')
    } finally {
      setTesting(false)
    }
  }

  const remove = () => {
    if (!confirm('Remove WhatsApp credentials? This will disconnect the integration.')) return
    router.delete(route('whatsapp.destroy'), { onSuccess: () => toast.success('Credentials removed.') })
  }

  return (
    <div className="space-y-3 max-w-xl">
      {/* Status banner */}
      {credential && (
        <div className={`flex items-start gap-2.5 rounded-xl px-4 py-3 border ${credential.is_verified ? 'bg-emerald-50 border-emerald-200' : 'bg-amber-50 border-amber-200'}`}>
          {credential.is_verified
            ? <CheckCircle2 size={15} className="text-emerald-500 mt-0.5 shrink-0" />
            : <AlertCircle  size={15} className="text-amber-500 mt-0.5 shrink-0" />}
          <div>
            <p className={`text-[13px] font-medium ${credential.is_verified ? 'text-emerald-800' : 'text-amber-800'}`}>
              {credential.is_verified ? 'WhatsApp connected & verified' : 'WhatsApp connected — not yet verified'}
            </p>
            <p className="text-[12px] text-slate-500 mt-0.5">
              From: <span className="font-mono">{credential.from_number}</span>
              {credential.display_name && <> · {credential.display_name}</>}
            </p>
          </div>
        </div>
      )}

      {/* Credentials form */}
      <Card title="Twilio Credentials"
        badge={<a href="https://console.twilio.com" target="_blank" rel="noreferrer"
          className="text-[11px] text-violet-600 hover:underline flex items-center gap-0.5">
          Twilio Console <ExternalLink size={10} />
        </a>}>
        <form onSubmit={submit} className="space-y-3">
          <Field label="Account SID" error={errors.account_sid}
            hint="Found in Twilio Console — starts with AC">
            <Input value={data.account_sid} onChange={e => setData('account_sid', e.target.value)}
              className="h-8 text-[13px] font-mono"
              placeholder="ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx" />
          </Field>

          <Field label="Auth Token" error={errors.auth_token}
            hint={credential ? 'Token already saved — enter a new one to replace it' : 'Found below your Account SID in Twilio Console'}>
            <Input type="password" value={data.auth_token} onChange={e => setData('auth_token', e.target.value)}
              className="h-8 text-[13px] font-mono"
              placeholder={credential ? 'Leave blank to keep current token' : '32-character token'} />
          </Field>

          <Field label="WhatsApp From Number" error={errors.from_number}
            hint="Your Twilio WhatsApp number e.g. +14155238886">
            <Input value={data.from_number} onChange={e => setData('from_number', e.target.value)}
              className="h-8 text-[13px] font-mono"
              placeholder="+14155238886" />
          </Field>

          <Field label="Display name (optional)" error={errors.display_name}>
            <Input value={data.display_name} onChange={e => setData('display_name', e.target.value)}
              className="h-8 text-[13px]"
              placeholder="Lumenia Lab" />
          </Field>

          <div className="flex justify-between items-center pt-1">
            {credential && (
              <button type="button" onClick={remove}
                className="text-[12px] text-red-400 hover:text-red-600 transition-colors">
                Remove credentials
              </button>
            )}
            <SaveBtn processing={processing} label="Save credentials" loadingLabel="Saving…" />
          </div>
        </form>
      </Card>

      {/* Test send */}
      {credential && (
        <Card title="Test connection">
          <p className="text-[12px] text-slate-500 mb-3">
            Send a test WhatsApp message to verify your setup. The number must be registered with your Twilio sandbox.
          </p>
          <div className="flex gap-2">
            <Input
              value={testNumber}
              onChange={e => setTestNumber(e.target.value)}
              className="h-8 text-[13px] font-mono flex-1"
              placeholder="+923001234567"
            />
            <Button type="button" size="sm" disabled={testing || !testNumber.trim()}
              onClick={verify}
              className="h-8 text-[12.5px] text-white"
              style={{ background: 'linear-gradient(135deg,#25D366,#128C7E)' }}>
              {testing ? 'Sending…' : 'Send Test'}
            </Button>
          </div>
          {testResult && (
            <p className={`text-[12px] mt-2 ${testResult === 'success' ? 'text-emerald-600' : 'text-red-500'}`}>
              {testResult === 'success' ? '✓ ' : '✗ '}{testMessage}
            </p>
          )}
        </Card>
      )}

      {/* Quick links */}
      <Card title="Next steps">
        <div className="space-y-2 text-[12px]">
          <a href="https://console.twilio.com/us1/develop/sms/try-it-out/whatsapp-learn" target="_blank" rel="noreferrer"
            className="flex items-center gap-2 text-violet-600 hover:underline">
            <ExternalLink size={11} /> Set up Twilio WhatsApp Sandbox
          </a>
          <p className="text-slate-400">Set your Twilio webhook URL to:</p>
          <code className="block bg-slate-50 border border-slate-200 rounded px-2 py-1 text-[11px] font-mono break-all">
            {window.location.origin}/webhook/twilio/whatsapp
          </code>
        </div>
      </Card>
    </div>
  )
}

// ─── Maintenance tab ──────────────────────────────────────────────────────────

function MaintenanceTab() {
  const [clearing, setClearing] = useState(false)
  const [cleared, setCleared]   = useState(false)

  const clearCache = async () => {
    setClearing(true)
    setCleared(false)
    try {
      const res  = await fetch('/settings/cache/clear', {
        method: 'POST',
        headers: {
          'X-CSRF-TOKEN': document.querySelector('meta[name=csrf-token]')?.content ?? '',
          'Accept': 'application/json',
        },
      })
      const json = await res.json()
      if (json.ok) {
        setCleared(true)
        toast.success('Leads cache cleared.')
      } else {
        toast.error(json.message || 'Failed to clear cache.')
      }
    } catch {
      toast.error('Request failed.')
    } finally {
      setClearing(false)
    }
  }

  return (
    <div className="space-y-3 max-w-xl">
      <Card title="Leads cache">
        <p className="text-[12px] text-slate-500 leading-relaxed">
          The leads list is cached per page and filter combination (30-minute TTL).
          Cache invalidates automatically when leads or groups are created, updated, or deleted.
          Use this button to force-clear it if data appears stale.
        </p>
        <div className="flex items-center gap-3 mt-3">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-8 text-xs gap-1.5"
            disabled={clearing}
            onClick={clearCache}
          >
            <Database size={12} />
            {clearing ? 'Clearing…' : 'Clear leads cache'}
          </Button>
          {cleared && (
            <span className="text-[12px] text-emerald-600 flex items-center gap-1">
              <CheckCircle2 size={12} /> Cleared
            </span>
          )}
        </div>
      </Card>
    </div>
  )
}

// ─── Page root ────────────────────────────────────────────────────────────────

export default function ProfileEdit({
  mustVerifyEmail, smtpCredentials, mailSettings,
  emailTemplates, activeTemplateId, smtpSuccess, leadGenSettings,
  orgFollowupEnabled, whatsappCredential, aiSetting,
}) {
  const [tab, setTab] = useState(() => {
    const p = new URLSearchParams(window.location.search)
    return p.get('tab') || 'profile'
  })

  React.useEffect(() => {
    if (smtpSuccess) toast.success(smtpSuccess)
  }, [smtpSuccess])

  return (
    <>
      <Head title="Settings" />
      <AppLayout title="Settings">

        {/* Page title */}
        <div className="px-4 sm:px-6 pt-4 sm:pt-5 pb-4 border-b border-slate-100 bg-white">
          <h1 className="text-[18px] font-bold text-slate-800">Settings</h1>
          <p className="text-[13px] text-slate-500 mt-0.5">Manage your profile, workspace, email, and integrations</p>
        </div>

        {/* Layout: stacked on mobile, side-by-side on desktop */}
        <div className="flex flex-col md:flex-row gap-0 min-h-0 flex-1">

          {/* Sidebar nav */}
          <div className="md:w-52 md:shrink-0 border-b md:border-b-0 md:border-r border-slate-100 bg-white px-3 py-3 md:py-5 overflow-x-auto md:overflow-x-visible">
            <SettingsNav
              active={tab}
              onChange={setTab}
              leadGenEnabled={leadGenSettings?.enabled && leadGenSettings?.hasKey}
            />
          </div>

          {/* Content area */}
          <div className="flex-1 min-w-0 p-4 sm:p-6 bg-slate-50 overflow-y-auto">
            {tab === 'profile'   && <ProfileTab mustVerifyEmail={mustVerifyEmail} />}
            {tab === 'workspace' && <WorkspaceTab />}
            {tab === 'smtp'      && <SmtpTab credentials={smtpCredentials} />}
            {tab === 'mail'      && <MailTab mailSettings={mailSettings} orgFollowupEnabled={orgFollowupEnabled} />}
            {tab === 'templates' && <TemplatesTab templates={emailTemplates ?? []} activeTemplateId={activeTemplateId} onGoToWorkspace={() => setTab('workspace')} />}
            {tab === 'ai'          && <AiProviderTab aiSetting={aiSetting} />}
            {tab === 'leadgen'     && <LeadGenTab leadGenSettings={leadGenSettings} />}
            {tab === 'whatsapp'    && <WhatsappTab credential={whatsappCredential} />}
            {tab === 'maintenance' && <MaintenanceTab />}
          </div>
        </div>

      </AppLayout>
    </>
  )
}
