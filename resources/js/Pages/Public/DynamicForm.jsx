import { useRef } from 'react'
import { Head, useForm, usePage } from '@inertiajs/react'
import { Button } from '@/Components/ui/button'
import { Input } from '@/Components/ui/input'
import { Label } from '@/Components/ui/label'
import { Textarea } from '@/Components/ui/textarea'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/Components/ui/select'
import { LogoMark } from '@/Components/Common/Logo'
import { Check, ShieldCheck, Sparkles, Clock3 } from 'lucide-react'

const BRAND_GRADIENT = 'linear-gradient(135deg, rgb(var(--brand-600)) 0%, rgb(var(--brand2-600)) 100%)'

const csrf = () => document.querySelector('meta[name=csrf-token]')?.content

// A fresh tab counts as a new visit — sessionStorage (not localStorage) both
// expresses that and naturally avoids two tabs on the same form racing to
// update the same tracking row.
function getSessionToken(slug) {
  const key = `form_session_${slug}`
  let token = sessionStorage.getItem(key)
  if (!token) {
    token = crypto.randomUUID()
    sessionStorage.setItem(key, token)
  }
  return token
}

function getUtmParams() {
  const params = new URLSearchParams(window.location.search)
  return {
    utm_source: params.get('utm_source') || '',
    utm_medium: params.get('utm_medium') || '',
    utm_campaign: params.get('utm_campaign') || '',
  }
}

// Fields short enough to sit two-per-row; everything else (email, phone,
// long text) stays full-width.
const WIDE_FIELD_TYPES = ['textarea', 'email', 'phone']

function groupFieldsIntoRows(fields) {
  const rows = []
  let pendingShort = null

  for (const field of fields) {
    if (WIDE_FIELD_TYPES.includes(field.type)) {
      if (pendingShort) { rows.push([pendingShort]); pendingShort = null }
      rows.push([field])
    } else if (pendingShort) {
      rows.push([pendingShort, field])
      pendingShort = null
    } else {
      pendingShort = field
    }
  }
  if (pendingShort) rows.push([pendingShort])

  return rows
}

function Field({ label, error, required, children }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-[12.5px] font-medium text-slate-700">
        {label}{required && <span className="text-brand-500 ml-0.5">*</span>}
      </Label>
      {children}
      {error && <p className="text-[11px] text-red-500">{error}</p>}
    </div>
  )
}

function SuccessView({ message }) {
  return (
    <div className="text-center py-14 px-6">
      <div className="mx-auto w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mb-5">
        <Check size={28} className="text-emerald-600" strokeWidth={2.5} />
      </div>
      <h2 className="text-[22px] font-bold text-slate-800 mb-2">Thank you!</h2>
      <p className="text-[14px] text-slate-500 max-w-xs mx-auto">
        {message || "Your information has been submitted successfully. We'll be in touch soon."}
      </p>
    </div>
  )
}

const PERKS = [
  { icon: Clock3, text: 'Takes less than a minute' },
  { icon: ShieldCheck, text: 'Your details stay private' },
  { icon: Sparkles, text: "We'll follow up personally" },
]

function BrandPanel({ form }) {
  return (
    <div
      className="relative hidden lg:flex flex-col justify-between p-9 text-white overflow-hidden"
      style={{ background: 'linear-gradient(160deg, rgb(var(--brand-600)) 0%, rgb(var(--brand2-600)) 55%, rgb(var(--brand2-700)) 100%)' }}
    >
      {/* Decorative dot grid */}
      <div
        className="absolute inset-0 opacity-[0.15] pointer-events-none"
        style={{ backgroundImage: 'radial-gradient(rgba(255,255,255,0.9) 1px, transparent 1px)', backgroundSize: '16px 16px' }}
      />
      {/* Soft glow blobs */}
      <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(255,255,255,0.16) 0%, transparent 70%)', filter: 'blur(20px)' }} />
      <div className="absolute -bottom-20 -left-10 w-72 h-72 rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(255,255,255,0.12) 0%, transparent 70%)', filter: 'blur(30px)' }} />

      <div className="relative z-10 flex items-center gap-2.5">
        <div className="w-9 h-9 rounded-xl bg-white/15 backdrop-blur-sm flex items-center justify-center ring-1 ring-white/25">
          <LogoMark size={20} />
        </div>
        <span className="text-[15px] font-bold tracking-tight">Lumenia CRM</span>
      </div>

      <div className="relative z-10 space-y-5">
        <h1 className="text-[28px] leading-tight font-bold tracking-tight">{form.name}</h1>
        {form.description && (
          <p className="text-[14px] text-white/80 leading-relaxed max-w-sm">{form.description}</p>
        )}

        <div className="space-y-3 pt-1">
          {PERKS.map(({ icon: Icon, text }) => (
            <div key={text} className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-full bg-white/15 flex items-center justify-center shrink-0">
                <Icon size={13} strokeWidth={2.25} />
              </div>
              <span className="text-[13px] text-white/85">{text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Floating mock card — decorative illustration */}
      <div className="relative z-10 hidden xl:block">
        <div className="rounded-2xl bg-white/10 backdrop-blur-sm ring-1 ring-white/20 p-4 shadow-xl -rotate-2">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-6 h-6 rounded-full bg-white/25" />
            <div className="h-2 w-24 rounded-full bg-white/25" />
          </div>
          <div className="space-y-2">
            <div className="h-2 w-full rounded-full bg-white/15" />
            <div className="h-2 w-4/5 rounded-full bg-white/15" />
          </div>
        </div>
      </div>

      <p className="relative z-10 text-[11px] text-white/50">Secured &amp; encrypted submission</p>
    </div>
  )
}

export default function DynamicForm({ form }) {
  const { props } = usePage()
  const submitted = props?.flash?.submitted ?? false
  const successMessage = props?.flash?.success_message ?? form.success_message

  const sessionToken = useRef(null)
  if (sessionToken.current === null) sessionToken.current = getSessionToken(form.slug)
  const utmParams = useRef(null)
  if (utmParams.current === null) utmParams.current = getUtmParams()

  const initialFields = {}
  for (const field of form.fields) initialFields[field.key] = ''

  const { data, setData, post, processing, errors } = useForm({
    fields: initialFields,
    session_token: sessionToken.current,
    ...utmParams.current,
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    post(route('forms.public.store', form.slug))
  }

  // Best-effort — a visitor who abandons the form shouldn't be blocked by
  // (or even notice) this failing.
  const autosave = (fieldKey, value) => {
    fetch(route('forms.public.autosave', form.slug), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json', 'X-CSRF-TOKEN': csrf() },
      body: JSON.stringify({ session_token: sessionToken.current, field_key: fieldKey, value, ...utmParams.current }),
      keepalive: true,
    }).catch(() => {})
  }

  const renderInput = (field) => {
    const value = data.fields[field.key] ?? ''
    const onChange = (v) => setData('fields', { ...data.fields, [field.key]: v })
    const onBlur = () => autosave(field.key, data.fields[field.key] ?? '')

    switch (field.type) {
      case 'textarea':
        return (
          <Textarea value={value} onChange={e => onChange(e.target.value)} onBlur={onBlur}
            placeholder={field.placeholder ?? ''} rows={3} className="text-[13.5px] resize-none" />
        )
      case 'dropdown':
        return (
          <Select value={value} onValueChange={v => { onChange(v); autosave(field.key, v) }}>
            <SelectTrigger className="h-10 text-[13.5px]">
              <SelectValue placeholder="Select an option" />
            </SelectTrigger>
            <SelectContent>
              {(field.options ?? []).map(raw => {
                const opt = typeof raw === 'string' ? { value: raw, label: raw } : raw
                return <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
              })}
            </SelectContent>
          </Select>
        )
      case 'number':
        return (
          <Input type="number" value={value} onChange={e => onChange(e.target.value)} onBlur={onBlur}
            placeholder={field.placeholder ?? ''} className="h-10 text-[13.5px]" />
        )
      case 'date':
        return (
          <Input type="date" value={value} onChange={e => onChange(e.target.value)} onBlur={onBlur}
            className="h-10 text-[13.5px]" />
        )
      case 'email':
        return (
          <Input type="email" value={value} onChange={e => onChange(e.target.value)} onBlur={onBlur}
            placeholder={field.placeholder ?? 'you@company.com'} className="h-10 text-[13.5px]" />
        )
      case 'phone':
        return (
          <Input type="tel" value={value} onChange={e => onChange(e.target.value)} onBlur={onBlur}
            placeholder={field.placeholder ?? '+1 (555) 000-0000'} className="h-10 text-[13.5px]" />
        )
      default:
        return (
          <Input value={value} onChange={e => onChange(e.target.value)} onBlur={onBlur}
            placeholder={field.placeholder ?? ''} className="h-10 text-[13.5px]" />
        )
    }
  }

  return (
    <>
      <Head title={form.name} />

      <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2 bg-white">
        <BrandPanel form={form} />

        <div className="flex items-center justify-center p-6 sm:p-10">
          <div className="w-full max-w-xl">
            {/* Mobile-only compact header, since the branded panel is hidden below lg */}
            <div className="lg:hidden text-center pb-1 mb-2">
              <div className="inline-flex items-center justify-center w-11 h-11 rounded-2xl mb-3 shadow-lg"
                style={{ background: BRAND_GRADIENT }}>
                <LogoMark size={22} />
              </div>
              {/* h2, not h1 — BrandPanel's heading (same form.name, desktop-only
                  via `hidden lg:flex`) is the page's one true h1; both exist in
                  the DOM at once regardless of viewport since Tailwind's
                  responsive classes only toggle CSS display, not mounting. */}
              <h2 className="text-[20px] font-bold text-slate-900 tracking-tight">{form.name}</h2>
              {form.description && (
                <p className="text-[13px] text-slate-500 mt-1">{form.description}</p>
              )}
            </div>

            {submitted ? (
              <SuccessView message={successMessage} />
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="hidden lg:block mb-2">
                  <h2 className="text-[20px] font-bold text-slate-900 tracking-tight">Your details</h2>
                  <p className="text-[13px] text-slate-500 mt-1">We'll get back to you within one business day.</p>
                </div>

                {groupFieldsIntoRows(form.fields).map((row, i) => (
                  <div key={i} className={row.length === 2 ? 'grid grid-cols-2 gap-4' : ''}>
                    {row.map(field => (
                      <Field key={field.key} label={field.label} required={field.required} error={errors[`fields.${field.key}`]}>
                        {renderInput(field)}
                      </Field>
                    ))}
                  </div>
                ))}

                <Button
                  type="submit"
                  disabled={processing}
                  className="w-full h-11 text-[14px] font-semibold gap-2 mt-1"
                  style={{ background: BRAND_GRADIENT }}
                >
                  {processing ? 'Submitting…' : 'Submit'}
                </Button>

                <p className="text-center text-[11px] text-slate-400">
                  Your information is kept private and will only be used to follow up with you.
                </p>
              </form>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
