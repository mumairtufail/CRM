import { useEffect, useState } from 'react'
import { useForm, router } from '@inertiajs/react'
import { Button } from '@/Components/ui/button'
import { Input } from '@/Components/ui/input'
import { Label } from '@/Components/ui/label'
import { Checkbox } from '@/Components/ui/checkbox'
import {
  Select, SelectTrigger, SelectValue, SelectContent, SelectItem,
} from '@/Components/ui/select'
import { Badge } from '@/Components/ui/badge'
import { toast } from 'sonner'
import { Plus, X, ArrowUp, ArrowDown, Copy, Check, Loader2 } from 'lucide-react'

const CUSTOM_TYPES = [
  { value: 'text',     label: 'Text' },
  { value: 'number',   label: 'Number' },
  { value: 'dropdown', label: 'Dropdown' },
  { value: 'date',     label: 'Date' },
  { value: 'textarea', label: 'Long text' },
]

const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

function slugify(text) {
  return text.toLowerCase().trim().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '') || 'field'
}

// Same shape as slugify() above but hyphenated, matching the backend's slug regex.
function slugifyDash(text) {
  return text.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
}

function Field({ label, error, hint, children }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-[12px] font-medium text-slate-600">{label}</Label>
      {children}
      {hint && !error && <p className="text-[11px] text-slate-400">{hint}</p>}
      {error && <p className="text-[11px] text-red-500">{error}</p>}
    </div>
  )
}

export default function FormBuilder({ builtinCatalog, initial, submitUrl, method = 'post', submitLabel = 'Create Form', onChange }) {
  const isCreate = !initial

  const { data, setData, post, put, processing, errors } = useForm({
    name:             initial?.name ?? '',
    description:      initial?.description ?? '',
    success_message:  initial?.success_message ?? '',
    slug:             '',
    fields: initial?.fields ?? builtinCatalog
      .filter(c => c.key === 'first_name' || c.key === 'email')
      .map((c, i) => ({
        key: c.key, kind: 'builtin', type: c.type, label: c.label,
        required: c.always_required || c.key === 'email', placeholder: null, options: null, order: i,
      })),
  })

  const [newField, setNewField] = useState(null)
  const [slugTouched, setSlugTouched] = useState(false)
  const [slugStatus, setSlugStatus] = useState('idle') // idle | checking | available | taken | invalid

  useEffect(() => { onChange?.(data) }, [data])

  // Auto-derive the slug from the form name until the user edits it directly.
  useEffect(() => {
    if (!isCreate || slugTouched) return
    setData('slug', slugifyDash(data.name))
  }, [data.name, isCreate, slugTouched])

  // Debounced live availability check against every workspace, not just ours.
  useEffect(() => {
    if (!isCreate) return
    const slug = data.slug

    if (!slug) { setSlugStatus('idle'); return }
    if (!SLUG_RE.test(slug) || slug.length < 3 || slug.length > 24) { setSlugStatus('invalid'); return }

    setSlugStatus('checking')
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`${route('forms.check-slug')}?slug=${encodeURIComponent(slug)}`)
        const json = await res.json()
        setSlugStatus(json.available ? 'available' : 'taken')
      } catch {
        setSlugStatus('idle')
      }
    }, 400)
    return () => clearTimeout(timer)
  }, [data.slug, isCreate])

  const existingKeys = data.fields.map(f => f.key)
  const isBuiltinOn = (key) => data.fields.some(f => f.key === key)

  const toggleBuiltin = (catalogField) => {
    if (catalogField.always_required) return
    if (isBuiltinOn(catalogField.key)) {
      setData('fields', data.fields.filter(f => f.key !== catalogField.key))
    } else {
      setData('fields', [...data.fields, {
        key: catalogField.key, kind: 'builtin', type: catalogField.type,
        label: catalogField.label, required: false, placeholder: null,
        options: catalogField.options ?? null,
        order: data.fields.length,
      }])
    }
  }

  const updateField = (key, patch) => {
    setData('fields', data.fields.map(f => f.key === key ? { ...f, ...patch } : f))
  }

  const removeField = (key) => {
    setData('fields', data.fields.filter(f => f.key !== key))
  }

  const moveField = (index, dir) => {
    const next = [...data.fields]
    const swapWith = index + dir
    if (swapWith < 0 || swapWith >= next.length) return
    ;[next[index], next[swapWith]] = [next[swapWith], next[index]]
    setData('fields', next.map((f, i) => ({ ...f, order: i })))
  }

  const startAddCustom = () => setNewField({ label: '', type: 'text', required: false, options: [''] })

  const saveCustomField = () => {
    if (!newField.label.trim()) { toast.error('Give the field a label.'); return }
    if (newField.type === 'dropdown' && newField.options.filter(o => o.trim()).length === 0) {
      toast.error('Add at least one option.'); return
    }
    const base = slugify(newField.label)
    let key = base, i = 2
    while (existingKeys.includes(key)) { key = `${base}_${i}`; i++ }

    setData('fields', [...data.fields, {
      key, kind: 'custom', type: newField.type, label: newField.label,
      required: newField.required,
      placeholder: null,
      options: newField.type === 'dropdown' ? newField.options.filter(o => o.trim()) : null,
      order: data.fields.length,
    }])
    setNewField(null)
  }

  const submit = (e) => {
    e.preventDefault()
    if (isCreate && data.slug && (slugStatus === 'taken' || slugStatus === 'invalid' || slugStatus === 'checking')) {
      toast.error(slugStatus === 'checking' ? 'Still checking that link — try again in a moment.' : 'Choose an available link before saving.')
      return
    }
    const options = { onError: () => toast.error('Please fix the errors below.') }
    if (method === 'put') put(submitUrl, options)
    else post(submitUrl, options)
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="bg-white rounded-xl border border-slate-200 px-5 py-4 space-y-4">
        <p className="text-[11.5px] font-semibold uppercase tracking-wider text-slate-400">Form Details</p>
        <Field label="Form name" error={errors.name}>
          <Input value={data.name} onChange={e => setData('name', e.target.value)}
            className="h-8 text-[13px]" placeholder="e.g. Website Contact Form" />
        </Field>
        <Field label="Description (internal, optional)" error={errors.description}>
          <Input value={data.description} onChange={e => setData('description', e.target.value)}
            className="h-8 text-[13px]" placeholder="What is this form used for?" />
        </Field>
        <Field label="Success message (optional)" error={errors.success_message}
          hint="Shown after someone submits the form">
          <Input value={data.success_message} onChange={e => setData('success_message', e.target.value)}
            className="h-8 text-[13px]" placeholder="Thanks! We'll be in touch soon." />
        </Field>
        {isCreate && (
          <Field label="Public link">
            <div className="flex items-center gap-2">
              <span className="text-[12.5px] text-slate-400 shrink-0 truncate max-w-[40%]">
                {typeof window !== 'undefined' ? `${window.location.origin}/f/` : '/f/'}
              </span>
              <div className="relative flex-1">
                <Input
                  value={data.slug}
                  onChange={e => { setSlugTouched(true); setData('slug', slugifyDash(e.target.value)) }}
                  className="h-8 text-[13px] pr-7"
                  placeholder="acme-contact-form"
                />
                <span className="absolute right-2 top-1/2 -translate-y-1/2">
                  {slugStatus === 'checking'  && <Loader2 size={13} className="text-slate-300 animate-spin" />}
                  {slugStatus === 'available' && <Check size={13} className="text-emerald-500" />}
                  {(slugStatus === 'taken' || slugStatus === 'invalid') && <X size={13} className="text-red-500" />}
                </span>
              </div>
            </div>
            {errors.slug ? (
              <p className="text-[11px] text-red-500">{errors.slug}</p>
            ) : slugStatus === 'taken' ? (
              <p className="text-[11px] text-red-500">That link is already taken — try another.</p>
            ) : slugStatus === 'invalid' && data.slug ? (
              <p className="text-[11px] text-red-500">3-24 characters, lowercase letters, numbers and hyphens only.</p>
            ) : (
              <p className="text-[11px] text-slate-400">This can't be changed after the form is created.</p>
            )}
          </Field>
        )}
        {initial?.public_url && (
          <Field label="Public link">
            <div className="flex items-center gap-2">
              <Input readOnly value={initial.public_url} className="h-8 text-[13px] flex-1" />
              <Button type="button" variant="outline" size="icon" className="h-8 w-8 shrink-0"
                onClick={() => { navigator.clipboard?.writeText(initial.public_url); toast.success('Link copied') }}>
                <Copy size={13} />
              </Button>
            </div>
          </Field>
        )}
      </div>

      <div className="bg-white rounded-xl border border-slate-200 px-5 py-4 space-y-3">
        <p className="text-[11.5px] font-semibold uppercase tracking-wider text-slate-400">Suggested Fields</p>
        <div className="flex flex-wrap gap-1.5">
          {builtinCatalog.map(c => {
            const on = isBuiltinOn(c.key)
            return (
              <button key={c.key} type="button" disabled={c.always_required}
                onClick={() => toggleBuiltin(c)}
                className={`px-2.5 py-1 rounded-full text-[11.5px] font-medium border transition-colors ${
                  on ? 'bg-violet-600 text-white border-violet-600' : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                } ${c.always_required ? 'opacity-70 cursor-not-allowed' : ''}`}
              >
                {c.label}{c.always_required ? ' (always on)' : ''}
              </button>
            )
          })}
        </div>
        {errors.fields && <p className="text-[11px] text-red-500">{errors.fields}</p>}
      </div>

      <div className="bg-white rounded-xl border border-slate-200 px-5 py-4 space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-[11.5px] font-semibold uppercase tracking-wider text-slate-400">Fields on this form</p>
          <Button type="button" size="sm" variant="outline" className="h-7 text-[11.5px] gap-1" onClick={startAddCustom}>
            <Plus size={12} /> Add custom field
          </Button>
        </div>

        <div className="space-y-2">
          {data.fields.map((f, i) => (
            <div key={f.key} className="flex items-start gap-2 border border-slate-100 rounded-lg px-3 py-2">
              <div className="flex flex-col gap-0.5 pt-0.5">
                <button type="button" disabled={i === 0} onClick={() => moveField(i, -1)}
                  className="text-slate-300 hover:text-slate-600 disabled:opacity-30">
                  <ArrowUp size={12} />
                </button>
                <button type="button" disabled={i === data.fields.length - 1} onClick={() => moveField(i, 1)}
                  className="text-slate-300 hover:text-slate-600 disabled:opacity-30">
                  <ArrowDown size={12} />
                </button>
              </div>

              <div className="flex-1 min-w-0 space-y-1.5">
                <div className="flex items-center gap-2">
                  <Input value={f.label} onChange={e => updateField(f.key, { label: e.target.value })}
                    className="h-7 text-[12.5px] flex-1" />
                  <Badge variant="outline" className="text-[10px] shrink-0">{f.type}</Badge>
                  {f.kind === 'custom' && <Badge variant="secondary" className="text-[10px] shrink-0">custom</Badge>}
                </div>
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <Checkbox checked={f.required} disabled={f.kind === 'builtin' && f.key === 'first_name'}
                    onCheckedChange={v => updateField(f.key, { required: !!v })} />
                  <span className="text-[11.5px] text-slate-500">Required</span>
                </label>
                {f.type === 'dropdown' && f.kind === 'builtin' && (
                  // Builtin dropdowns (e.g. Budget) come from a fixed server-side
                  // catalog — {value,label,deal_value} objects, not editable text.
                  <div className="space-y-1">
                    <div className="flex flex-wrap gap-1">
                      {(f.options ?? []).map(opt => (
                        <Badge key={opt.value} variant="outline" className="text-[10px] font-normal">{opt.label}</Badge>
                      ))}
                    </div>
                    <p className="text-[10.5px] text-slate-400">Fixed ranges — can't be edited here.</p>
                  </div>
                )}
                {f.type === 'dropdown' && f.kind === 'custom' && (
                  <div className="space-y-1">
                    {(f.options ?? ['']).map((opt, oi) => (
                      <div key={oi} className="flex items-center gap-1.5">
                        <Input value={opt} className="h-6 text-[11.5px]" placeholder={`Option ${oi + 1}`}
                          onChange={e => {
                            const opts = [...(f.options ?? [''])]
                            opts[oi] = e.target.value
                            updateField(f.key, { options: opts })
                          }} />
                        <button type="button" className="text-slate-300 hover:text-red-500"
                          onClick={() => updateField(f.key, { options: (f.options ?? ['']).filter((_, x) => x !== oi) })}>
                          <X size={12} />
                        </button>
                      </div>
                    ))}
                    <button type="button" className="text-[11px] text-violet-600 hover:text-violet-700"
                      onClick={() => updateField(f.key, { options: [...(f.options ?? []), ''] })}>
                      + Add option
                    </button>
                  </div>
                )}
              </div>

              {f.kind === 'custom' && (
                <button type="button" className="text-slate-300 hover:text-red-500 pt-0.5" onClick={() => removeField(f.key)}>
                  <X size={14} />
                </button>
              )}
            </div>
          ))}
        </div>

        {newField && (
          <div className="border border-violet-200 bg-violet-50/40 rounded-lg px-3 py-3 space-y-2">
            <div className="grid grid-cols-2 gap-2">
              <Input value={newField.label} onChange={e => setNewField({ ...newField, label: e.target.value })}
                className="h-8 text-[12.5px]" placeholder="Field label, e.g. Company size" />
              <Select value={newField.type} onValueChange={v => setNewField({ ...newField, type: v, options: v === 'dropdown' ? [''] : newField.options })}>
                <SelectTrigger className="h-8 text-[12.5px]"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {CUSTOM_TYPES.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            {newField.type === 'dropdown' && (
              <div className="space-y-1">
                {newField.options.map((opt, oi) => (
                  <div key={oi} className="flex items-center gap-1.5">
                    <Input value={opt} className="h-7 text-[11.5px]" placeholder={`Option ${oi + 1}`}
                      onChange={e => {
                        const opts = [...newField.options]; opts[oi] = e.target.value
                        setNewField({ ...newField, options: opts })
                      }} />
                    <button type="button" className="text-slate-300 hover:text-red-500"
                      onClick={() => setNewField({ ...newField, options: newField.options.filter((_, x) => x !== oi) })}>
                      <X size={12} />
                    </button>
                  </div>
                ))}
                <button type="button" className="text-[11px] text-violet-600 hover:text-violet-700"
                  onClick={() => setNewField({ ...newField, options: [...newField.options, ''] })}>
                  + Add option
                </button>
              </div>
            )}
            <label className="flex items-center gap-1.5 cursor-pointer">
              <Checkbox checked={newField.required} onCheckedChange={v => setNewField({ ...newField, required: !!v })} />
              <span className="text-[11.5px] text-slate-500">Required</span>
            </label>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" size="sm" className="h-7 text-[11.5px]" onClick={() => setNewField(null)}>Cancel</Button>
              <Button type="button" size="sm" className="h-7 text-[11.5px]" onClick={saveCustomField}>Add field</Button>
            </div>
          </div>
        )}
      </div>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" className="h-8 text-[13px]" onClick={() => router.visit('/forms')}>
          Cancel
        </Button>
        <Button type="submit" disabled={processing} className="h-8 text-[13px]">
          {processing ? 'Saving…' : submitLabel}
        </Button>
      </div>
    </form>
  )
}
