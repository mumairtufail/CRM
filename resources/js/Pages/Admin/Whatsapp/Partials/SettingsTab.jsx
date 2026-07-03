import { useForm } from '@inertiajs/react'
import { useState } from 'react'
import PageHeader from '@/Components/Common/PageHeader'
import { Input } from '@/Components/ui/input'
import { Label } from '@/Components/ui/label'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/Components/ui/dialog'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import {
  MessageCircle, Lock, CheckCircle2, AlertCircle,
  Send, Loader2, ShieldAlert, History,
} from 'lucide-react'

function Field({ label, error, hint, required, children }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-[12px] font-medium text-slate-600">
        {label}{required && <span className="text-red-400 ml-0.5">*</span>}
      </Label>
      {children}
      {hint && !error && <p className="text-[11px] text-slate-400 leading-snug">{hint}</p>}
      {error && <p className="text-[11px] text-red-500 leading-snug">{error}</p>}
    </div>
  )
}

function SectionTitle({ icon: Icon, label, description }) {
  return (
    <div className="flex items-start gap-3 mb-4">
      <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
        style={{ background: 'linear-gradient(135deg,rgba(124,58,237,0.12),rgba(79,70,229,0.12))' }}>
        <Icon size={15} className="text-violet-600" />
      </div>
      <div>
        <p className="text-[13.5px] font-semibold text-slate-800">{label}</p>
        {description && <p className="text-[12px] text-slate-400 mt-0.5">{description}</p>}
      </div>
    </div>
  )
}

export default function SettingsTab({ credential, auditLog }) {
  const [editing, setEditing]           = useState(!credential)
  const [confirmDialog, setConfirmDialog] = useState(false)
  const [password, setPassword]         = useState('')
  const [testLoading, setTestLoading]   = useState(false)

  const { data, setData, post, processing, errors, reset } = useForm({
    current_password:         '',
    meta_app_id:               credential?.meta_app_id ?? '',
    meta_business_account_id:  credential?.meta_business_account_id ?? '',
    phone_number_id:           credential?.phone_number_id ?? '',
    access_token:              '',
    meta_app_secret:           '',
    webhook_verify_token:      '',
  })

  const requestEdit = () => {
    if (!credential) { setEditing(true); return }
    setPassword('')
    setConfirmDialog(true)
  }

  const confirmEdit = () => {
    setData('current_password', password)
    setConfirmDialog(false)
    setEditing(true)
  }

  const submit = (e) => {
    e.preventDefault()
    post(route('admin.whatsapp.update'), {
      preserveState: true,
      onSuccess: () => {
        toast.success('WhatsApp credentials saved and verified.')
        setEditing(false)
        reset('access_token', 'meta_app_secret', 'webhook_verify_token', 'current_password')
      },
      onError: () => toast.error('Please fix the errors below.'),
    })
  }

  const testConnection = async () => {
    setTestLoading(true)
    try {
      const res = await fetch(route('admin.whatsapp.test'), {
        method:  'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN':  document.querySelector('meta[name="csrf-token"]')?.content ?? '',
          Accept:          'application/json',
        },
      })
      const json = await res.json()
      if (json.success) toast.success(json.message)
      else               toast.error(json.message)
    } catch {
      toast.error('Failed to reach the test-connection endpoint.')
    } finally {
      setTestLoading(false)
    }
  }

  const configured = credential?.status === 'active'

  return (
    <>
      <PageHeader
        title="Pooled WhatsApp Credentials"
        description="One shared Meta WhatsApp Cloud API number used by every enabled tenant"
      />

      <div className={cn(
        'flex items-center gap-3 px-4 py-3 rounded-xl mb-6 border text-[13px]',
        configured
          ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
          : 'bg-amber-50 border-amber-200 text-amber-700'
      )}>
        {configured
          ? <CheckCircle2 size={15} className="text-emerald-500 shrink-0" />
          : <AlertCircle size={15} className="text-amber-500 shrink-0" />}
        <div className="flex-1 min-w-0">
          {configured ? (
            <>
              <span className="font-semibold">Connected</span>
              <span className="text-emerald-600/70 mx-1.5">·</span>
              <span className="font-mono text-[12px]">{credential?.display_phone_number ?? credential?.phone_number_id}</span>
              <span className="text-emerald-600/70 mx-1.5">·</span>
              <span>token {credential?.access_token_masked}</span>
              {credential?.last_verified_at && (
                <>
                  <span className="text-emerald-600/70 mx-1.5">·</span>
                  <span>verified {new Date(credential.last_verified_at).toLocaleString()}</span>
                </>
              )}
            </>
          ) : (
            <span className="font-semibold">No pooled WhatsApp credentials configured yet</span>
          )}
        </div>
        {configured && (
          <button
            onClick={testConnection}
            disabled={testLoading}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-semibold bg-emerald-100 hover:bg-emerald-200 text-emerald-700 transition-colors disabled:opacity-50 shrink-0"
          >
            {testLoading ? <Loader2 size={12} className="animate-spin" /> : <Send size={12} />}
            {testLoading ? 'Testing…' : 'Test connection'}
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-5">
        <div className="space-y-5">
          {!editing ? (
            <div className="glass-card rounded-2xl p-5">
              <SectionTitle icon={Lock} label="Credentials" description="Edit requires re-entering your password" />
              <button
                onClick={requestEdit}
                className="flex items-center gap-2 h-9 px-4 text-[13px] font-semibold text-violet-700 border border-violet-200 bg-violet-50 hover:bg-violet-100 rounded-lg transition-all"
              >
                <ShieldAlert size={13} /> Edit Credentials
              </button>
            </div>
          ) : (
            <form onSubmit={submit}>
              <div className="glass-card rounded-2xl p-5 border-2 border-amber-200">
                <SectionTitle
                  icon={MessageCircle}
                  label="Meta WhatsApp Cloud API"
                  description="These credentials are shared across every tenant — double-check before saving"
                />
                <div className="space-y-4">
                  <Field label="Meta App ID" error={errors.meta_app_id}>
                    <Input value={data.meta_app_id} onChange={e => setData('meta_app_id', e.target.value)} className="h-9 text-[13px] font-mono" />
                  </Field>
                  <Field label="WABA (Business Account) ID" error={errors.meta_business_account_id} required>
                    <Input value={data.meta_business_account_id} onChange={e => setData('meta_business_account_id', e.target.value)} className="h-9 text-[13px] font-mono" />
                  </Field>
                  <Field label="Phone Number ID" error={errors.phone_number_id} required>
                    <Input value={data.phone_number_id} onChange={e => setData('phone_number_id', e.target.value)} className="h-9 text-[13px] font-mono" />
                  </Field>
                  <Field label="Access Token" error={errors.access_token} required
                    hint="Permanent system-user token from Meta Business settings.">
                    <Input type="password" value={data.access_token} onChange={e => setData('access_token', e.target.value)} className="h-9 text-[13px] font-mono" autoComplete="new-password" />
                  </Field>
                  <Field label="App Secret" error={errors.meta_app_secret} required
                    hint="Used to verify webhook signatures (X-Hub-Signature-256).">
                    <Input type="password" value={data.meta_app_secret} onChange={e => setData('meta_app_secret', e.target.value)} className="h-9 text-[13px] font-mono" autoComplete="new-password" />
                  </Field>
                  <Field label="Webhook Verify Token" error={errors.webhook_verify_token} required
                    hint="Must match the token you set in the Meta App webhook config.">
                    <Input type="password" value={data.webhook_verify_token} onChange={e => setData('webhook_verify_token', e.target.value)} className="h-9 text-[13px] font-mono" autoComplete="new-password" />
                  </Field>
                </div>

                <div className="flex items-center gap-3 pt-5">
                  <button
                    type="submit"
                    disabled={processing}
                    className="flex items-center gap-2 h-9 px-5 text-[13px] font-semibold text-white rounded-lg transition-all hover:opacity-90 disabled:opacity-50"
                    style={{ background: 'linear-gradient(135deg,#7C3AED,#4F46E5)' }}
                  >
                    {processing ? <><Loader2 size={13} className="animate-spin" /> Verifying &amp; saving…</> : <>Save &amp; Verify</>}
                  </button>
                  {credential && (
                    <button type="button" onClick={() => setEditing(false)}
                      className="h-9 px-4 text-[13px] font-medium text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
                      Cancel
                    </button>
                  )}
                </div>
              </div>
            </form>
          )}

          <div className="glass-card rounded-2xl p-5">
            <SectionTitle icon={History} label="Audit Log" description="Every credential change is recorded" />
            {auditLog?.length ? (
              <div className="space-y-2">
                {auditLog.map(log => (
                  <div key={log.id} className="flex items-center justify-between text-[12.5px] py-1.5 border-b border-slate-100 last:border-0">
                    <span className="text-slate-700 font-medium capitalize">{log.action.replace(/_/g, ' ')}</span>
                    <span className="text-slate-400">{log.changed_by ?? 'System'} · {log.created_at}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-[12px] text-slate-400">No changes recorded yet.</p>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <div className="glass-card rounded-2xl p-4">
            <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-3">How this works</p>
            <p className="text-[12px] text-slate-500 leading-relaxed">
              Every tenant with WhatsApp enabled sends and receives through this one pooled number.
              Tenants never see or configure these credentials — isolation happens at the application layer via the Tenants tab.
            </p>
          </div>
        </div>
      </div>

      <Dialog open={confirmDialog} onOpenChange={setConfirmDialog}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-[15px]">Confirm your password</DialogTitle>
          </DialogHeader>
          <div className="py-2 space-y-1.5">
            <Label className="text-[12px] font-medium text-slate-600">Current password <span className="text-red-400">*</span></Label>
            <Input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && confirmEdit()}
              className="h-9 text-[13px]"
              autoFocus
            />
            <p className="text-[11.5px] text-slate-400">This is a shared secret used by every paying client — re-confirm before editing.</p>
          </div>
          <DialogFooter className="gap-2">
            <button type="button" onClick={() => setConfirmDialog(false)}
              className="h-8 px-4 text-[12.5px] font-medium text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
              Cancel
            </button>
            <button type="button" onClick={confirmEdit} disabled={!password}
              className="h-8 px-4 text-[12.5px] font-semibold text-white rounded-lg transition-all hover:opacity-90 disabled:opacity-40"
              style={{ background: 'linear-gradient(135deg,#7C3AED,#4F46E5)' }}>
              Continue
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
