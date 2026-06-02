import React, { useRef, useState } from 'react'
import { Head, useForm, usePage, router } from '@inertiajs/react'
import AppLayout from '@/Components/Layout/AppLayout'
import PageHeader from '@/Components/Common/PageHeader'
import { Button } from '@/Components/ui/button'
import { Input } from '@/Components/ui/input'
import { Label } from '@/Components/ui/label'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
  DialogDescription, DialogFooter
} from '@/Components/ui/dialog'
import {
  Upload, Trash2, Building2, Plus, Check, Zap, Server,
  Mail, Settings2, User, ChevronRight, Eye, EyeOff, X,
  LayoutTemplate, ExternalLink, Palette, CheckCircle2
} from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

// ─── Shared primitives ───────────────────────────────────────────────────────

function Field({ label, error, children, hint }) {
  return (
    <div className="space-y-1">
      <Label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">{label}</Label>
      {children}
      {hint  && !error && <p className="text-[10.5px] text-slate-400">{hint}</p>}
      {error && <p className="text-red-500 text-[11px] mt-0.5">{error}</p>}
    </div>
  )
}

function Section({ title, danger, children }) {
  return (
    <div className="form-card" style={danger ? { border: '1px solid rgba(239,68,68,0.18)' } : {}}>
      <div className="px-4 py-2.5" style={{ borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
        <p className={`text-[11px] font-semibold uppercase tracking-wider ${danger ? 'text-red-500' : 'text-slate-500'}`}>
          {title}
        </p>
      </div>
      <div className="px-4 py-3 space-y-3">{children}</div>
    </div>
  )
}

function SaveBtn({ processing, label = 'Save changes', loadingLabel = 'Saving…' }) {
  return (
    <button type="submit" disabled={processing}
      className="h-8 px-4 text-[12.5px] font-semibold text-white rounded-lg transition-all hover:opacity-90 disabled:opacity-60"
      style={{ background: 'linear-gradient(135deg,#7C3AED,#4F46E5)' }}>
      {processing ? loadingLabel : label}
    </button>
  )
}

// ─── Tab nav ──────────────────────────────────────────────────────────────────

const TABS = [
  { id: 'profile',   label: 'Profile',   icon: User },
  { id: 'workspace', label: 'Workspace', icon: Building2 },
  { id: 'smtp',      label: 'SMTP',      icon: Server },
  { id: 'mail',      label: 'Mail',      icon: Mail },
  { id: 'templates', label: 'Templates', icon: LayoutTemplate },
]

function TabNav({ active, onChange }) {
  return (
    <div className="flex gap-1 p-1 bg-slate-100 rounded-xl mb-5 w-fit">
      {TABS.map(({ id, label, icon: Icon }) => (
        <button
          key={id}
          onClick={() => onChange(id)}
          className={cn(
            'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12.5px] font-medium transition-all',
            active === id
              ? 'bg-white text-slate-800 shadow-sm'
              : 'text-slate-500 hover:text-slate-700'
          )}
        >
          <Icon size={13} />
          {label}
        </button>
      ))}
    </div>
  )
}

// ─── Profile tab ──────────────────────────────────────────────────────────────

function ProfileTab({ mustVerifyEmail }) {
  const { auth } = usePage().props
  const { data, setData, patch, errors, processing } = useForm({
    name:  auth.user.name,
    email: auth.user.email,
  })
  const submit = e => {
    e.preventDefault()
    patch(route('profile.update'), { onSuccess: () => toast.success('Profile updated') })
  }

  return (
    <div className="space-y-3 max-w-lg">
      <Section title="Profile information">
        <form onSubmit={submit} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
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
            <p className="text-[12px] text-amber-600 bg-amber-50 px-3 py-2 rounded-lg border border-amber-100">
              Your email address is unverified.
            </p>
          )}
          <SaveBtn processing={processing} />
        </form>
      </Section>

      <Section title="Change password">
        <PasswordForm />
      </Section>

      <Section title="Danger zone" danger>
        <DeleteForm />
      </Section>
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
      <div className="grid grid-cols-2 gap-3">
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
      <p className="text-[12px] text-slate-500 mb-2.5">
        Once deleted, all data is permanently removed. This cannot be undone.
      </p>
      <Button variant="outline" size="sm" className="h-7 text-xs border-red-200 text-red-600 hover:bg-red-50"
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
    company_name: auth.user.company_name ?? '',
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
    fd.append('company_name', data.company_name)
    if (data.logo) fd.append('logo', data.logo)
    router.post('/profile/workspace', fd, {
      forceFormData: true,
      onSuccess: () => toast.success('Workspace updated'),
      onError: () => toast.error('Failed to update workspace'),
    })
  }

  const removeLogo = () => {
    setRemovingLogo(true)
    router.delete('/profile/logo', {
      onSuccess: () => { setLogoPreview(null); toast.success('Logo removed') },
      onFinish: () => setRemovingLogo(false),
    })
  }

  return (
    <div className="space-y-3 max-w-lg">
      <Section title="Workspace branding">
        <form onSubmit={submit} className="space-y-3">
          {/* Logo */}
          <div className="space-y-1.5">
            <Label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Company logo</Label>
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
                  <Building2 size={16} className="text-slate-400" />
                </div>
              )}
              <div>
                <Button type="button" variant="outline" size="sm"
                  className="h-7 text-xs gap-1.5 border-slate-200"
                  onClick={() => logoInputRef.current?.click()}>
                  <Upload size={11} /> Upload logo
                </Button>
                <p className="text-[10.5px] text-slate-400 mt-0.5">PNG, JPG, SVG up to 2MB</p>
              </div>
            </div>
            <input ref={logoInputRef} type="file" accept="image/*" className="hidden" onChange={handleLogoChange} />
          </div>

          <Field label="Company name">
            <Input value={data.company_name} onChange={e => setData('company_name', e.target.value)}
              className="h-8 text-[13px]" placeholder="Acme Inc." />
          </Field>

          <SaveBtn processing={processing} label="Save workspace" />
        </form>
      </Section>
    </div>
  )
}

// ─── SMTP tab ─────────────────────────────────────────────────────────────────

const ENCRYPTION_OPTS = [
  { value: 'tls',  label: 'TLS (recommended)' },
  { value: 'ssl',  label: 'SSL' },
  { value: 'none', label: 'None' },
]

const PROVIDER_PRESETS = [
  { label: 'Gmail',        host: 'smtp.gmail.com',                        port: 587, encryption: 'tls', imap_host: 'imap.gmail.com',          imap_port: 993, imap_encryption: 'ssl', hint: 'Use an App Password (not your regular password). Enable 2-Step Verification first, then go to Google Account → Security → App Passwords.' },
  { label: 'Outlook/365',  host: 'smtp.office365.com',                    port: 587, encryption: 'tls', imap_host: 'outlook.office365.com',   imap_port: 993, imap_encryption: 'ssl', hint: 'Use your Microsoft 365 email and password. Make sure SMTP AUTH is enabled in the admin portal.' },
  { label: 'Hostinger',    host: 'smtp.hostinger.com',                    port: 465, encryption: 'ssl', imap_host: 'imap.hostinger.com',       imap_port: 993, imap_encryption: 'ssl', hint: 'Use your full email address as username. IMAP host is imap.hostinger.com (NOT smtp.hostinger.com).' },
  { label: 'Mailgun',      host: 'smtp.mailgun.org',                      port: 587, encryption: 'tls', imap_host: 'imap.mailgun.org',        imap_port: 993, imap_encryption: 'ssl', hint: 'Use your Mailgun SMTP credentials from Sending → Domain Settings.' },
  { label: 'SendGrid',     host: 'smtp.sendgrid.net',                     port: 587, encryption: 'tls', imap_host: '',                        imap_port: 993, imap_encryption: 'ssl', hint: 'Username is always "apikey". Password is your SendGrid API key. Note: SendGrid does not support IMAP.' },
  { label: 'Amazon SES',   host: 'email-smtp.us-east-1.amazonaws.com',    port: 587, encryption: 'tls', imap_host: '',                        imap_port: 993, imap_encryption: 'ssl', hint: 'Use SMTP credentials from SES console. Note: Amazon SES does not support IMAP inbox fetching.' },
  { label: 'Custom SMTP',  host: '',                                       port: 587, encryption: 'tls', imap_host: '',                        imap_port: 993, imap_encryption: 'ssl', hint: '' },
]

const BLANK_FORM = { name: '', host: '', port: 587, encryption: 'tls', username: '', password: '', from_name: '', from_email: '', imap_host: '', imap_port: 993, imap_encryption: 'ssl' }

function SmtpDialog({ open, onClose, existing }) {
  const [form, setForm]     = useState(existing ? { ...existing, password: '', imap_host: existing.imap_host ?? '', imap_port: existing.imap_port ?? 993, imap_encryption: existing.imap_encryption ?? 'ssl' } : { ...BLANK_FORM })
  const [showPw, setShowPw] = useState(false)
  const [saving, setSaving] = useState(false)
  const [hint, setHint]     = useState('')

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const applyPreset = preset => {
    setForm(f => ({
      ...f,
      host: preset.host, port: preset.port, encryption: preset.encryption,
      imap_host: preset.imap_host, imap_port: preset.imap_port, imap_encryption: preset.imap_encryption,
      name: f.name || preset.label,
    }))
    setHint(preset.hint)
  }

  const handleSubmit = e => {
    e.preventDefault()
    setSaving(true)
    const url    = existing ? `/smtp/${existing.id}` : '/smtp'
    const method = existing ? 'put' : 'post'
    router[method](url, form, {
      preserveState: true,
      preserveScroll: true,
      onSuccess: () => { toast.success(existing ? 'SMTP updated' : 'SMTP account added'); onClose() },
      onError: errs => { toast.error(Object.values(errs)[0] || 'Validation error') },
      onFinish: () => setSaving(false),
    })
  }

  return (
    <Dialog open={open} onOpenChange={v => !v && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-[14px]">{existing ? 'Edit SMTP account' : 'Add SMTP account'}</DialogTitle>
          <DialogDescription className="text-[12px]">Configure an outbound email account for campaigns.</DialogDescription>
        </DialogHeader>

        {/* Provider presets */}
        <div>
          <p className="text-[10.5px] font-semibold uppercase tracking-wider text-slate-400 mb-1.5">Quick presets</p>
          <div className="flex flex-wrap gap-1.5">
            {PROVIDER_PRESETS.map(p => (
              <button key={p.label} type="button"
                onClick={() => applyPreset(p)}
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
          <div className="grid grid-cols-2 gap-3">
            <Field label="Account name">
              <Input value={form.name} onChange={e => set('name', e.target.value)}
                className="h-8 text-[13px]" placeholder="e.g. Gmail Work" required />
            </Field>
            <Field label="From name">
              <Input value={form.from_name} onChange={e => set('from_name', e.target.value)}
                className="h-8 text-[13px]" placeholder="Acme CRM" required />
            </Field>
          </div>
          <Field label="From email">
            <Input type="email" value={form.from_email} onChange={e => set('from_email', e.target.value)}
              className="h-8 text-[13px]" placeholder="you@example.com" required />
          </Field>
          <div className="grid grid-cols-3 gap-2">
            <div className="col-span-2">
              <Field label="SMTP host">
                <Input value={form.host} onChange={e => set('host', e.target.value)}
                  className="h-8 text-[13px]" placeholder="smtp.gmail.com" required />
              </Field>
            </div>
            <Field label="Port">
              <Input type="number" value={form.port} onChange={e => set('port', Number(e.target.value))}
                className="h-8 text-[13px]" placeholder="587" required />
            </Field>
          </div>
          <Field label="Encryption">
            <div className="flex gap-2">
              {ENCRYPTION_OPTS.map(opt => (
                <button key={opt.value} type="button"
                  onClick={() => set('encryption', opt.value)}
                  className={cn(
                    'flex-1 h-8 rounded-lg text-[12px] font-medium border transition-all',
                    form.encryption === opt.value
                      ? 'border-violet-500 bg-violet-50 text-violet-700'
                      : 'border-slate-200 text-slate-500 hover:border-slate-300'
                  )}>
                  {opt.value.toUpperCase()}
                </button>
              ))}
            </div>
          </Field>
          <Field label="Username / Email">
            <Input value={form.username} onChange={e => set('username', e.target.value)}
              className="h-8 text-[13px]" placeholder="you@gmail.com" required />
          </Field>
          <Field label={existing ? 'Password (leave blank to keep)' : 'Password'} hint={existing ? undefined : undefined}>
            <div className="relative">
              <Input
                type={showPw ? 'text' : 'password'}
                value={form.password}
                onChange={e => set('password', e.target.value)}
                className="h-8 text-[13px] pr-8"
                placeholder={existing ? '••••••• (unchanged)' : 'App password / SMTP password'}
                required={!existing}
              />
              <button type="button" className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                onClick={() => setShowPw(v => !v)}>
                {showPw ? <EyeOff size={13} /> : <Eye size={13} />}
              </button>
            </div>
          </Field>

          {/* IMAP section */}
          <div className="border-t border-slate-100 pt-3">
            <p className="text-[10.5px] font-semibold uppercase tracking-wider text-slate-400 mb-1">
              IMAP inbox (optional — enables email fetching)
            </p>
            <p className="text-[11px] text-slate-400 mb-2">Uses the same username &amp; password as SMTP above.</p>
            <div className="grid grid-cols-3 gap-2 mb-2">
              <div className="col-span-2">
                <Field label="IMAP host">
                  <Input value={form.imap_host} onChange={e => set('imap_host', e.target.value)}
                    className="h-8 text-[13px]" placeholder="imap.gmail.com" />
                </Field>
              </div>
              <Field label="IMAP port">
                <Input type="number" value={form.imap_port} onChange={e => set('imap_port', Number(e.target.value))}
                  className="h-8 text-[13px]" placeholder="993" />
              </Field>
            </div>
            <Field label="IMAP encryption">
              <div className="flex gap-2">
                {['ssl', 'tls', 'none'].map(opt => (
                  <button key={opt} type="button"
                    onClick={() => set('imap_encryption', opt)}
                    className={cn(
                      'flex-1 h-8 rounded-lg text-[12px] font-medium border transition-all',
                      form.imap_encryption === opt
                        ? 'border-violet-500 bg-violet-50 text-violet-700'
                        : 'border-slate-200 text-slate-500 hover:border-slate-300'
                    )}>
                    {opt.toUpperCase()}
                  </button>
                ))}
              </div>
            </Field>
          </div>

          <DialogFooter className="gap-2 pt-1">
            <Button type="button" variant="outline" size="sm" className="h-7 text-xs" onClick={onClose}>Cancel</Button>
            <button type="submit" disabled={saving}
              className="h-7 px-4 text-[12px] font-semibold text-white rounded-lg transition-all hover:opacity-90 disabled:opacity-60"
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

  const activate = () => {
    router.patch(`/smtp/${cred.id}/activate`, {}, {
      preserveState: true, preserveScroll: true,
      onSuccess: () => toast.success(`"${cred.name}" set as active`),
    })
  }

  const deactivate = () => {
    router.patch(`/smtp/${cred.id}/deactivate`, {}, {
      preserveState: true, preserveScroll: true,
      onSuccess: () => toast.success('Deactivated'),
    })
  }

  const csrfHeaders = () => ({
    'X-CSRF-TOKEN': document.querySelector('meta[name=csrf-token]').content,
    'Accept': 'application/json',
  })

  const testConnection = async () => {
    setTesting(true)
    try {
      const res  = await fetch(`/smtp/${cred.id}/test`, { method: 'POST', headers: csrfHeaders() })
      const json = await res.json()
      if (json.ok) toast.success(json.message)
      else toast.error(json.message)
    } catch {
      toast.error('Test failed')
    } finally {
      setTesting(false)
    }
  }

  const testImapConnection = async () => {
    setTestingImap(true)
    try {
      const res  = await fetch(`/smtp/${cred.id}/test-imap`, { method: 'POST', headers: csrfHeaders() })
      const json = await res.json()
      if (json.ok) toast.success(json.message)
      else toast.error('IMAP: ' + json.message)
    } catch {
      toast.error('IMAP test failed')
    } finally {
      setTestingImap(false)
    }
  }

  const doDelete = () => {
    setDeleting(true)
    router.delete(`/smtp/${cred.id}`, {
      preserveState: true, preserveScroll: true,
      onSuccess: () => toast.success('SMTP account removed'),
      onFinish: () => { setDeleting(false); setConfirmDelete(false) },
    })
  }

  return (
    <>
      <div className={cn(
        'rounded-xl border p-3.5 transition-all',
        cred.is_active ? 'border-violet-300 bg-violet-50/60' : 'border-slate-200 bg-white'
      )}>
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <span className="font-semibold text-[13px] text-slate-800 truncate">{cred.name}</span>
              {cred.is_active && (
                <span className="text-[10px] font-bold uppercase tracking-wider text-violet-600 bg-violet-100 px-1.5 py-0.5 rounded-full">Active</span>
              )}
            </div>
            <p className="text-[11.5px] text-slate-500 truncate">{cred.from_name} &lt;{cred.from_email}&gt;</p>
            <p className="text-[11px] text-slate-400 mt-0.5">{cred.host}:{cred.port} · {cred.encryption.toUpperCase()}</p>
            {cred.imap_host
              ? <p className="text-[11px] text-emerald-600 mt-0.5">IMAP: {cred.imap_host}:{cred.imap_port}</p>
              : <p className="text-[11px] text-slate-300 mt-0.5">IMAP not configured (inbox disabled)</p>
            }
          </div>
        </div>

        <div className="flex items-center gap-1.5 mt-3 flex-wrap">
          {cred.is_active ? (
            <button onClick={deactivate}
              className="h-6 px-2.5 text-[11px] font-medium rounded-lg bg-violet-100 text-violet-700 hover:bg-violet-200 transition-colors">
              Deactivate
            </button>
          ) : (
            <button onClick={activate}
              className="h-6 px-2.5 text-[11px] font-medium rounded-lg bg-slate-100 text-slate-600 hover:bg-violet-100 hover:text-violet-700 transition-colors flex items-center gap-1">
              <Check size={10} /> Set active
            </button>
          )}
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
          <button onClick={() => onEdit(cred)}
            className="h-6 px-2.5 text-[11px] font-medium rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors">
            Edit
          </button>
          <button onClick={() => setConfirmDelete(true)}
            className="h-6 px-2.5 text-[11px] font-medium rounded-lg bg-slate-100 text-red-500 hover:bg-red-50 transition-colors">
            Remove
          </button>
        </div>
      </div>

      {/* Delete confirm dialog */}
      <Dialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-[13px]">Remove "{cred.name}"?</DialogTitle>
            <DialogDescription className="text-[12px]">
              This SMTP account will be permanently removed. Any campaigns using it will need to be reconfigured.
            </DialogDescription>
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

  const openAdd  = ()    => { setEditing(null); setDialogOpen(true) }
  const openEdit = cred  => { setEditing(cred); setDialogOpen(true) }
  const closeDialog = () => { setDialogOpen(false); setEditing(null) }

  return (
    <div className="space-y-4 max-w-lg">
      {/* Info card */}
      <div className="bg-blue-50 border border-blue-100 rounded-xl px-4 py-3 text-[12px] text-blue-800 space-y-1.5">
        <p className="font-semibold">How to set up email credentials</p>
        <ul className="space-y-1 text-[11.5px] text-blue-700 list-disc list-inside">
          <li><strong>Gmail:</strong> Enable 2FA → Google Account → Security → App Passwords → generate one for "Mail".</li>
          <li><strong>Custom hosting:</strong> Use your cPanel / Plesk SMTP settings (usually port 587 TLS).</li>
          <li>Only one account can be <em>active</em> at a time — that's what campaigns use to send.</li>
          <li>Click <strong>Test</strong> to send a test email to your login address and verify connectivity.</li>
        </ul>
      </div>

      {/* Credential cards */}
      {credentials.length === 0 ? (
        <div className="text-center py-10 rounded-xl border-2 border-dashed border-slate-200">
          <Server size={24} className="mx-auto text-slate-300 mb-2" />
          <p className="text-[13px] text-slate-500">No SMTP accounts yet</p>
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
          <Button variant="outline" size="sm" className="gap-1.5 h-8 text-xs mt-1 w-full border-dashed" onClick={openAdd}>
            <Plus size={12} /> Add another SMTP account
          </Button>
        </div>
      )}

      <SmtpDialog open={dialogOpen} onClose={closeDialog} existing={editing} />
    </div>
  )
}

// ─── Mail settings tab ────────────────────────────────────────────────────────

function MailTab({ mailSettings }) {
  const { data, setData, patch, processing } = useForm({
    mail_batch_size:  mailSettings.batch_size,
    mail_batch_delay: mailSettings.batch_delay,
  })

  const submit = e => {
    e.preventDefault()
    patch('/settings/mail', {
      preserveState: true,
      onSuccess: () => toast.success('Mail settings saved'),
      onError:   () => toast.error('Validation error'),
    })
  }

  return (
    <div className="space-y-3 max-w-lg">
      <Section title="Bulk send configuration">
        <form onSubmit={submit} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <Field label="Batch size"
              hint="Emails sent per batch before pausing.">
              <Input type="number" min="1" max="500"
                value={data.mail_batch_size}
                onChange={e => setData('mail_batch_size', Number(e.target.value))}
                className="h-8 text-[13px]" />
            </Field>
            <Field label="Delay between batches (seconds)"
              hint="Pause between batches to avoid rate-limits.">
              <Input type="number" min="0" max="300"
                value={data.mail_batch_delay}
                onChange={e => setData('mail_batch_delay', Number(e.target.value))}
                className="h-8 text-[13px]" />
            </Field>
          </div>

          <div className="bg-slate-50 rounded-lg border border-slate-100 p-3 text-[11.5px] text-slate-500 space-y-0.5">
            <p>With these settings campaigns will send <strong>{data.mail_batch_size} emails</strong>, pause for <strong>{data.mail_batch_delay}s</strong>, then repeat.</p>
            <p>Most providers allow 100–500 emails/hour. Gmail App Passwords are limited to ~500/day.</p>
          </div>

          <SaveBtn processing={processing} label="Save mail settings" />
        </form>
      </Section>

      <Section title="Provider recommendations">
        <div className="space-y-2 text-[12px] text-slate-600">
          {[
            { name: 'Gmail',       limit: '500 / day',      batch: '10 / 5s',  note: 'Good for testing and small lists (<200 leads).' },
            { name: 'Mailgun',     limit: '10k / month free', batch: '50 / 2s', note: 'Reliable deliverability with generous free tier.' },
            { name: 'SendGrid',    limit: '100 / day free', batch: '50 / 2s',  note: 'Free tier works for small campaigns.' },
            { name: 'Amazon SES',  limit: '62k / month free (EC2)', batch: '100 / 1s', note: 'Best for high volume; needs domain verification.' },
          ].map(p => (
            <div key={p.name} className="flex items-start gap-2 py-1.5 border-b border-slate-100 last:border-0">
              <div className="w-20 font-semibold text-slate-700 shrink-0">{p.name}</div>
              <div className="min-w-0">
                <span className="text-slate-500">{p.limit} · suggested {p.batch}</span>
                <span className="text-slate-400 ml-1">— {p.note}</span>
              </div>
            </div>
          ))}
        </div>
      </Section>
    </div>
  )
}

// ─── Email Templates tab ──────────────────────────────────────────────────────

const TEMPLATE_STYLES = {
  '#7c3aed': {
    bg: 'from-violet-500 to-indigo-600',
    header: 'bg-gradient-to-r from-violet-500 to-indigo-600',
    body: 'bg-white',
    footer: 'bg-indigo-950',
  },
  '#6366f1': {
    bg: 'from-indigo-400 to-indigo-600',
    header: 'bg-white border-t-4 border-indigo-500',
    body: 'bg-white',
    footer: 'bg-white border-t border-slate-100',
  },
  '#0f172a': {
    bg: 'from-slate-800 to-slate-900',
    header: 'bg-slate-900',
    body: 'bg-slate-900',
    footer: 'bg-slate-950',
  },
}

function TemplateMiniPreview({ color }) {
  const s = TEMPLATE_STYLES[color] || TEMPLATE_STYLES['#7c3aed']
  const isDark = color === '#0f172a'

  return (
    <div className="w-full rounded-lg overflow-hidden border border-slate-100 shadow-sm" style={{ aspectRatio: '4/3' }}>
      {/* mini header */}
      <div className={cn('px-3 py-2', s.header)} style={color === '#6366f1' ? { borderTop: '3px solid #6366f1' } : {}}>
        <div className={cn('h-2 rounded w-16 mb-1', isDark ? 'bg-slate-600' : color === '#6366f1' ? 'bg-slate-800' : 'bg-white/80')} />
        <div className={cn('h-1.5 rounded w-10', isDark ? 'bg-slate-700' : color === '#6366f1' ? 'bg-slate-300' : 'bg-white/50')} />
      </div>
      {/* mini body */}
      <div className={cn('px-3 py-2 flex-1', s.body)} style={{ minHeight: 52 }}>
        <div className={cn('h-2 rounded w-24 mb-1.5', isDark ? 'bg-slate-700' : 'bg-slate-200')} />
        <div className={cn('h-1.5 rounded w-full mb-1', isDark ? 'bg-slate-800' : 'bg-slate-100')} />
        <div className={cn('h-1.5 rounded w-4/5 mb-1', isDark ? 'bg-slate-800' : 'bg-slate-100')} />
        <div className={cn('h-1.5 rounded w-3/5', isDark ? 'bg-slate-800' : 'bg-slate-100')} />
      </div>
      {/* mini footer */}
      <div className={cn('px-3 py-1.5', s.footer)}>
        <div className={cn('h-1.5 rounded w-20 mx-auto', isDark ? 'bg-slate-700' : color === '#6366f1' ? 'bg-slate-200' : 'bg-white/30')} />
      </div>
    </div>
  )
}

function TemplatePreviewModal({ template, onClose }) {
  const previewUrl = `/email-templates/${template.id}/preview`

  return (
    <Dialog open onOpenChange={v => !v && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col p-0 gap-0">
        <DialogHeader className="px-5 py-3.5 border-b border-slate-100">
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-[13.5px] font-semibold">{template.name}</DialogTitle>
              {template.description && (
                <p className="text-[11.5px] text-slate-400 mt-0.5">{template.description}</p>
              )}
            </div>
            <a href={previewUrl} target="_blank" rel="noreferrer"
              className="flex items-center gap-1 text-[11px] text-violet-600 hover:text-violet-700 mr-6">
              <ExternalLink size={11} /> Open full
            </a>
          </div>
        </DialogHeader>
        <div className="flex-1 overflow-hidden" style={{ minHeight: 500 }}>
          <iframe
            src={previewUrl}
            title={`Preview: ${template.name}`}
            className="w-full h-full border-0"
            style={{ minHeight: 500 }}
          />
        </div>
      </DialogContent>
    </Dialog>
  )
}

function CustomTemplateDialog({ onClose }) {
  const [form, setForm] = useState({
    name: '', description: '', thumbnail_color: '#7c3aed', html_content: '',
  })
  const [saving, setSaving] = useState(false)

  const COLORS = ['#7c3aed', '#6366f1', '#0f172a', '#0ea5e9', '#10b981', '#ef4444', '#f59e0b']

  const handleSubmit = e => {
    e.preventDefault()
    setSaving(true)
    router.post('/email-templates', form, {
      preserveState: true, preserveScroll: true,
      onSuccess: () => { toast.success('Template created'); onClose() },
      onError: errs => toast.error(Object.values(errs)[0] || 'Validation error'),
      onFinish: () => setSaving(false),
    })
  }

  return (
    <Dialog open onOpenChange={v => !v && onClose()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-[14px]">Create custom template</DialogTitle>
          <DialogDescription className="text-[12px]">
            Write a full HTML email document. Use <code className="text-[11px] bg-slate-100 px-1 rounded">{'{{content}}'}</code>, <code className="text-[11px] bg-slate-100 px-1 rounded">{'{{company_name}}'}</code>, <code className="text-[11px] bg-slate-100 px-1 rounded">{'{{from_name}}'}</code>, <code className="text-[11px] bg-slate-100 px-1 rounded">{'{{year}}'}</code> as placeholders.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <Field label="Template name">
              <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                className="h-8 text-[13px]" placeholder="My Template" required />
            </Field>
            <Field label="Description">
              <Input value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                className="h-8 text-[13px]" placeholder="One-line description" />
            </Field>
          </div>

          <Field label="Card color">
            <div className="flex gap-2 mt-1">
              {COLORS.map(c => (
                <button key={c} type="button"
                  onClick={() => setForm(f => ({ ...f, thumbnail_color: c }))}
                  className="w-6 h-6 rounded-full border-2 transition-all"
                  style={{
                    background: c,
                    borderColor: form.thumbnail_color === c ? '#fff' : 'transparent',
                    boxShadow: form.thumbnail_color === c ? `0 0 0 2px ${c}` : 'none',
                  }} />
              ))}
            </div>
          </Field>

          <Field label="HTML content">
            <textarea
              value={form.html_content}
              onChange={e => setForm(f => ({ ...f, html_content: e.target.value }))}
              rows={12}
              required
              placeholder={'<!DOCTYPE html>\n<html>\n<body>\n  {{content}}\n</body>\n</html>'}
              className="w-full text-[12px] font-mono rounded-lg border border-slate-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-violet-500 resize-y"
            />
          </Field>

          <DialogFooter className="gap-2">
            <Button type="button" variant="outline" size="sm" className="h-7 text-xs" onClick={onClose}>Cancel</Button>
            <button type="submit" disabled={saving}
              className="h-7 px-4 text-[12px] font-semibold text-white rounded-lg transition-all hover:opacity-90 disabled:opacity-60"
              style={{ background: 'linear-gradient(135deg,#7C3AED,#4F46E5)' }}>
              {saving ? 'Creating…' : 'Create template'}
            </button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function TemplateCard({ template, isActive, onActivate, onPreview, onDeactivate }) {
  const [deleting, setDeleting] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)

  const doDelete = () => {
    setDeleting(true)
    router.delete(`/email-templates/${template.id}`, {
      preserveState: true, preserveScroll: true,
      onSuccess: () => toast.success('Template removed'),
      onFinish: () => { setDeleting(false); setConfirmDelete(false) },
    })
  }

  return (
    <>
      <div className={cn(
        'rounded-xl border p-3 transition-all hover:shadow-sm',
        isActive ? 'border-violet-300 bg-violet-50/50 shadow-sm' : 'border-slate-200 bg-white'
      )}>
        {/* mini visual preview */}
        <div className="mb-3 relative">
          <TemplateMiniPreview color={template.thumbnail_color} />
          {isActive && (
            <div className="absolute top-2 right-2 flex items-center gap-1 bg-violet-600 text-white text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full shadow">
              <CheckCircle2 size={9} /> Active
            </div>
          )}
          {template.is_system && (
            <div className="absolute top-2 left-2 bg-slate-700/70 text-white text-[9px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded-full backdrop-blur-sm">
              Built-in
            </div>
          )}
        </div>

        <p className="text-[13px] font-semibold text-slate-800 mb-0.5">{template.name}</p>
        {template.description && (
          <p className="text-[11.5px] text-slate-400 leading-snug mb-3">{template.description}</p>
        )}

        <div className="flex items-center gap-1.5 flex-wrap">
          {isActive ? (
            <button onClick={onDeactivate}
              className="h-6 px-2.5 text-[11px] font-medium rounded-lg bg-violet-100 text-violet-700 hover:bg-violet-200 transition-colors">
              Deactivate
            </button>
          ) : (
            <button onClick={onActivate}
              className="h-6 px-2.5 text-[11px] font-medium rounded-lg bg-slate-100 text-slate-600 hover:bg-violet-100 hover:text-violet-700 transition-colors flex items-center gap-1">
              <Check size={10} /> Use template
            </button>
          )}
          <button onClick={onPreview}
            className="h-6 px-2.5 text-[11px] font-medium rounded-lg bg-slate-100 text-slate-600 hover:bg-blue-100 hover:text-blue-700 transition-colors flex items-center gap-1">
            <Eye size={10} /> Preview
          </button>
          {!template.is_system && (
            <button onClick={() => setConfirmDelete(true)}
              className="h-6 px-2.5 text-[11px] font-medium rounded-lg bg-slate-100 text-red-500 hover:bg-red-50 transition-colors">
              Remove
            </button>
          )}
        </div>
      </div>

      <Dialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-[13px]">Remove "{template.name}"?</DialogTitle>
            <DialogDescription className="text-[12px]">This template will be permanently deleted.</DialogDescription>
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

function TemplatesTab({ templates, activeTemplateId }) {
  const [previewTemplate, setPreviewTemplate] = useState(null)
  const [showCreate, setShowCreate]           = useState(false)

  const activate = (template) => {
    router.patch(`/email-templates/${template.id}/activate`, {}, {
      preserveState: true, preserveScroll: true,
      onSuccess: () => toast.success(`"${template.name}" set as active template`),
    })
  }

  const deactivate = () => {
    router.patch('/email-templates/deactivate', {}, {
      preserveState: true, preserveScroll: true,
      onSuccess: () => toast.success('Template deactivated — emails will send without a wrapper'),
    })
  }

  const activeTemplate = templates.find(t => t.id === activeTemplateId)

  return (
    <div className="space-y-4 max-w-2xl">
      {/* Info banner */}
      <div className="bg-violet-50 border border-violet-100 rounded-xl px-4 py-3 text-[12px] text-violet-800 space-y-1">
        <p className="font-semibold flex items-center gap-1.5"><LayoutTemplate size={13} /> Email templates</p>
        <p className="text-[11.5px] text-violet-700">
          The active template wraps every email you send — campaigns, test emails, everything.
          It injects your <strong>company name</strong>, <strong>from name</strong>, and <strong>campaign content</strong> automatically.
          {activeTemplate
            ? <> Currently using <strong>{activeTemplate.name}</strong>.</>
            : <> No template active — emails will send as raw HTML.</>}
        </p>
      </div>

      {/* Template grid */}
      <div className="grid grid-cols-3 gap-3">
        {templates.map(template => (
          <TemplateCard
            key={template.id}
            template={template}
            isActive={template.id === activeTemplateId}
            onActivate={() => activate(template)}
            onDeactivate={deactivate}
            onPreview={() => setPreviewTemplate(template)}
          />
        ))}
        {/* Add custom card */}
        <button onClick={() => setShowCreate(true)}
          className="rounded-xl border-2 border-dashed border-slate-200 hover:border-violet-300 hover:bg-violet-50/30 transition-all flex flex-col items-center justify-center gap-2 p-4 min-h-[180px] group">
          <div className="w-9 h-9 rounded-full bg-slate-100 group-hover:bg-violet-100 flex items-center justify-center transition-colors">
            <Plus size={16} className="text-slate-400 group-hover:text-violet-600" />
          </div>
          <span className="text-[12px] font-medium text-slate-400 group-hover:text-violet-600">Add custom</span>
        </button>
      </div>

      {previewTemplate && (
        <TemplatePreviewModal template={previewTemplate} onClose={() => setPreviewTemplate(null)} />
      )}
      {showCreate && <CustomTemplateDialog onClose={() => setShowCreate(false)} />}
    </div>
  )
}

// ─── Page root ────────────────────────────────────────────────────────────────

export default function ProfileEdit({
  mustVerifyEmail, smtpCredentials, mailSettings,
  emailTemplates, activeTemplateId, smtpSuccess,
}) {
  const [tab, setTab] = useState('profile')

  React.useEffect(() => {
    if (smtpSuccess) toast.success(smtpSuccess)
  }, [smtpSuccess])

  return (
    <>
      <Head title="Settings" />
      <AppLayout title="Settings">
        <PageHeader title="Settings" description="Manage your workspace, profile, and email configuration" />

        <TabNav active={tab} onChange={setTab} />

        {tab === 'profile'   && <ProfileTab mustVerifyEmail={mustVerifyEmail} />}
        {tab === 'workspace' && <WorkspaceTab />}
        {tab === 'smtp'      && <SmtpTab credentials={smtpCredentials} />}
        {tab === 'mail'      && <MailTab mailSettings={mailSettings} />}
        {tab === 'templates' && <TemplatesTab templates={emailTemplates ?? []} activeTemplateId={activeTemplateId} />}
      </AppLayout>
    </>
  )
}
