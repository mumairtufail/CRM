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
import { Plus, X, ArrowUp, ArrowDown, Copy, Check, Loader2, Layers, Eye, Settings, Trash2 } from 'lucide-react'
import { LogoMark } from '@/Components/Common/Logo'

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

function slugifyDash(text) {
  return text.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
}

function FieldWrapper({ label, error, hint, children }) {
  return (
    <div className="space-y-1">
      <Label className="text-[12px] font-bold text-slate-700">{label}</Label>
      {children}
      {hint && !error && <p className="text-[10px] text-slate-400 font-normal">{hint}</p>}
      {error && <p className="text-[10px] text-red-500 font-semibold">{error}</p>}
    </div>
  )
}

export default function FormBuilder({ builtinCatalog, initial, submitUrl, method = 'post', submitLabel = 'Create Form', onChange }) {
  const isCreate = !initial
  const [activeSubTab, setActiveSubTab] = useState('build') // build, settings

  const { data, setData, post, put, processing, errors } = useForm({
    name:             initial?.name ?? '',
    description:      initial?.description ?? '',
    success_message:  initial?.success_message ?? '',
    slug:             initial?.slug ?? '',
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

  // Derive slug
  useEffect(() => {
    if (!isCreate || slugTouched) return
    setData('slug', slugifyDash(data.name))
  }, [data.name, isCreate, slugTouched])

  // Validate slug
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
    if (!newField.label.trim()) { toast.error('Please enter a field label.'); return }
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
      toast.error(slugStatus === 'checking' ? 'Checking link availability...' : 'Choose an available URL slug.')
      return
    }
    const options = { onError: () => toast.error('Please fix errors.') }
    if (method === 'put') put(submitUrl, options)
    else post(submitUrl, options)
  }

  return (
    <div className="w-full h-full flex flex-col md:flex-row min-h-0 overflow-hidden bg-white border border-slate-200 rounded-3xl shadow-sm">
      
      {/* LEFT PANEL: CONFIGURATION */}
      <div className="flex-1 md:flex-[5] flex flex-col min-h-0 overflow-hidden p-4 md:p-6 justify-between">
        
        {/* Top Header & Selector */}
        <div className="space-y-4 shrink-0">
          <div className="flex border border-slate-100 bg-slate-50/50 p-0.5 rounded-xl gap-0.5 max-w-sm">
            {[
              { id: 'build', label: 'Form Fields', icon: Layers },
              { id: 'settings', label: 'Form Settings', icon: Settings },
            ].map(tab => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => { setActiveSubTab(tab.id); setNewField(null) }}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-bold transition-all ${
                    activeSubTab === tab.id
                      ? 'bg-slate-900 text-white shadow-sm'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <Icon size={12} />
                  {tab.label}
                </button>
              )
            })}
          </div>
        </div>

        {/* Scrollable inputs inside left panel */}
        <form onSubmit={submit} className="flex-1 min-h-0 flex flex-col justify-between mt-4">
          <div className="flex-1 min-h-0 overflow-y-auto pr-1 space-y-4">
            
            {/* BUILD FIELDS TAB */}
            {activeSubTab === 'build' && (
              <div className="space-y-4">
                
                {/* Suggested fields */}
                <div className="bg-slate-50/50 border border-slate-100 rounded-xl p-3.5 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Suggested Fields</span>
                    <span className="text-[9px] text-slate-400 font-semibold">Click to toggle</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {builtinCatalog.map(c => {
                      const on = isBuiltinOn(c.key)
                      return (
                        <button
                          key={c.key}
                          type="button"
                          disabled={c.always_required}
                          onClick={() => toggleBuiltin(c)}
                          className={`px-3 py-1 rounded-full text-[11px] font-bold border transition-all ${
                            on
                              ? 'bg-violet-600 text-white border-violet-600'
                              : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                          } ${c.always_required ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                          {c.label} {c.always_required && '★'}
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* Form fields editor list */}
                <div className="space-y-2.5">
                  <div className="flex justify-between items-center border-b border-slate-100 pb-1.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Active Form Fields</span>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      className="h-7 text-[11px] font-bold gap-1 bg-slate-50 hover:bg-slate-100 px-3"
                      onClick={startAddCustom}
                    >
                      <Plus size={11} /> Add Custom Field
                    </Button>
                  </div>

                  <div className="space-y-2">
                    {data.fields.map((f, i) => (
                      <div key={f.key} className="flex items-start gap-3 border border-slate-150 rounded-lg p-3 bg-white hover:border-slate-300 transition-colors">
                        
                        {/* Drag handles (arrows) */}
                        <div className="flex flex-col gap-0.5 pt-0.5 shrink-0">
                          <button
                            type="button"
                            disabled={i === 0}
                            onClick={() => moveField(i, -1)}
                            className="text-slate-400 hover:text-slate-700 disabled:opacity-30"
                          >
                            <ArrowUp size={13} />
                          </button>
                          <button
                            type="button"
                            disabled={i === data.fields.length - 1}
                            onClick={() => moveField(i, 1)}
                            className="text-slate-400 hover:text-slate-700 disabled:opacity-30"
                          >
                            <ArrowDown size={13} />
                          </button>
                        </div>

                        {/* Details */}
                        <div className="flex-1 min-w-0 space-y-2">
                          <div className="flex items-center gap-2">
                            <Input
                              value={f.label}
                              onChange={e => updateField(f.key, { label: e.target.value })}
                              className="h-8.5 text-xs font-bold text-slate-700 bg-white"
                            />
                            <Badge variant="outline" className="text-[9px] uppercase font-bold shrink-0 py-0.5">
                              {f.type}
                            </Badge>
                            {f.kind === 'custom' && (
                              <Badge variant="secondary" className="text-[9px] uppercase font-bold shrink-0 py-0.5">
                                custom
                              </Badge>
                            )}
                          </div>

                          <div className="flex items-center gap-3">
                            <label className="flex items-center gap-1.5 cursor-pointer select-none">
                              <Checkbox
                                checked={f.required}
                                disabled={f.kind === 'builtin' && f.key === 'first_name'}
                                onCheckedChange={v => updateField(f.key, { required: !!v })}
                              />
                              <span className="text-[11px] text-slate-500 font-bold">Required field</span>
                            </label>
                          </div>

                          {/* Custom Option creator for custom dropdowns */}
                          {f.type === 'dropdown' && f.kind === 'custom' && (
                            <div className="space-y-1.5 pt-1.5 border-t border-slate-100">
                              <div className="flex flex-wrap gap-1.5">
                                {(f.options ?? ['']).map((opt, oi) => (
                                  <div key={oi} className="flex items-center gap-1">
                                    <Input
                                      value={opt}
                                      className="h-7 text-[11px] bg-slate-50 w-24"
                                      placeholder={`Option ${oi + 1}`}
                                      onChange={e => {
                                        const opts = [...(f.options ?? [''])]
                                        opts[oi] = e.target.value
                                        updateField(f.key, { options: opts })
                                      }}
                                    />
                                    <button
                                      type="button"
                                      className="text-slate-400 hover:text-rose-500"
                                      onClick={() => updateField(f.key, { options: (f.options ?? ['']).filter((_, x) => x !== oi) })}
                                    >
                                      <X size={12} />
                                    </button>
                                  </div>
                                ))}
                                <button
                                  type="button"
                                  className="text-[11px] font-bold text-violet-600 hover:text-violet-700 flex items-center gap-0.5 px-2"
                                  onClick={() => updateField(f.key, { options: [...(f.options ?? []), ''] })}
                                >
                                  <Plus size={10} /> Option
                                </button>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Remove custom field */}
                        {f.kind === 'custom' && (
                          <button
                            type="button"
                            className="text-slate-400 hover:text-rose-500 p-1.5 rounded hover:bg-slate-50 shrink-0"
                            onClick={() => removeField(f.key)}
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Inline custom field creator */}
                {newField && (
                  <div className="border border-violet-200 bg-violet-50/10 rounded-xl p-4 space-y-3 animate-scale">
                    <div className="flex justify-between items-center border-b border-violet-100 pb-1">
                      <span className="text-[10px] font-black uppercase text-violet-600 tracking-wider">New Custom Field</span>
                      <button type="button" onClick={() => setNewField(null)} className="text-slate-400 hover:text-slate-600">
                        <X size={14} />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <FieldWrapper label="Field Label">
                        <Input
                          value={newField.label}
                          onChange={e => setNewField({ ...newField, label: e.target.value })}
                          className="h-8 text-xs bg-white"
                          placeholder="e.g. Budget range"
                        />
                      </FieldWrapper>

                      <FieldWrapper label="Field Type">
                        <Select
                          value={newField.type}
                          onValueChange={v => setNewField({ ...newField, type: v, options: v === 'dropdown' ? [''] : newField.options })}
                        >
                          <SelectTrigger className="h-8 text-xs bg-white"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {CUSTOM_TYPES.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </FieldWrapper>
                    </div>

                    {newField.type === 'dropdown' && (
                      <div className="space-y-1.5 p-3 bg-white border border-slate-100 rounded-lg">
                        <Label className="text-[10px] font-bold text-slate-400 uppercase">Dropdown Options</Label>
                        <div className="flex flex-wrap gap-1.5">
                          {newField.options.map((opt, oi) => (
                            <div key={oi} className="flex items-center gap-1">
                              <Input
                                value={opt}
                                className="h-7 text-[11px] bg-slate-50 w-24"
                                placeholder={`Option ${oi + 1}`}
                                onChange={e => {
                                  const opts = [...newField.options]; opts[oi] = e.target.value
                                  setNewField({ ...newField, options: opts })
                                }}
                              />
                              <button
                                type="button"
                                className="text-slate-400 hover:text-rose-500"
                                onClick={() => setNewField({ ...newField, options: newField.options.filter((_, x) => x !== oi) })}
                              >
                                <X size={12} />
                              </button>
                            </div>
                          ))}
                          <button
                            type="button"
                            className="text-[11px] font-bold text-violet-600 hover:text-violet-700 flex items-center gap-0.5 px-2"
                            onClick={() => setNewField({ ...newField, options: [...newField.options, ''] })}
                          >
                            <Plus size={10} /> Option
                          </button>
                        </div>
                      </div>
                    )}

                    <div className="flex justify-between items-center border-t border-slate-100 pt-3">
                      <label className="flex items-center gap-1.5 cursor-pointer select-none">
                        <Checkbox
                          checked={newField.required}
                          onCheckedChange={v => setNewField({ ...newField, required: !!v })}
                        />
                        <span className="text-[11px] text-slate-500 font-bold">Required</span>
                      </label>
                      <div className="flex gap-1.5">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="h-7 text-xs font-bold"
                          onClick={() => setNewField(null)}
                        >
                          Cancel
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          className="h-7 text-xs font-bold bg-violet-600 hover:bg-violet-700 text-white"
                          onClick={saveCustomField}
                        >
                          Add Field
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* SETTINGS TAB */}
            {activeSubTab === 'settings' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FieldWrapper label="Form Name" error={errors.name}>
                    <Input
                      value={data.name}
                      onChange={e => setData('name', e.target.value)}
                      className="h-8.5 text-xs bg-white"
                      placeholder="e.g. Contact Form"
                    />
                  </FieldWrapper>

                  <FieldWrapper label="Success Message" error={errors.success_message} hint="Shown after submission">
                    <Input
                      value={data.success_message}
                      onChange={e => setData('success_message', e.target.value)}
                      className="h-8.5 text-xs bg-white"
                      placeholder="Thanks! We will reach out to you shortly."
                    />
                  </FieldWrapper>
                </div>

                <FieldWrapper label="Internal Description (Optional)" error={errors.description}>
                  <textarea
                    value={data.description}
                    onChange={e => setData('description', e.target.value)}
                    rows={2}
                    className="w-full rounded-lg border border-slate-200 text-xs p-2.5 focus:outline-none focus:border-violet-500 resize-none bg-white"
                    placeholder="What is this form used for?"
                  />
                </FieldWrapper>

                {isCreate && (
                  <FieldWrapper label="Public URL Link" hint="Custom slug for public page. Cannot be modified later.">
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] text-slate-400 font-bold shrink-0 truncate max-w-[40%]">
                        {typeof window !== 'undefined' ? `${window.location.origin}/f/` : '/f/'}
                      </span>
                      <div className="relative flex-1">
                        <Input
                          value={data.slug}
                          onChange={e => { setSlugTouched(true); setData('slug', slugifyDash(e.target.value)) }}
                          className="h-8.5 text-xs pr-8 bg-white"
                          placeholder="e.g. requesting-demo"
                        />
                        <span className="absolute right-2 top-1/2 -translate-y-1/2">
                          {slugStatus === 'checking'  && <Loader2 size={12} className="text-slate-400 animate-spin" />}
                          {slugStatus === 'available' && <Check size={12} className="text-emerald-500" />}
                          {(slugStatus === 'taken' || slugStatus === 'invalid') && <X size={12} className="text-rose-500" />}
                        </span>
                      </div>
                    </div>
                    {errors.slug ? (
                      <p className="text-[10px] text-red-500 font-semibold">{errors.slug}</p>
                    ) : slugStatus === 'taken' ? (
                      <p className="text-[10px] text-rose-500 font-semibold">This link is already taken.</p>
                    ) : slugStatus === 'invalid' && data.slug ? (
                      <p className="text-[10px] text-rose-500 font-semibold">3-24 chars, lowercase and hyphens only.</p>
                    ) : null}
                  </FieldWrapper>
                )}

                {initial?.public_url && (
                  <FieldWrapper label="Public URL Link">
                    <div className="flex items-center gap-2">
                      <Input readOnly value={initial.public_url} className="h-8.5 text-xs bg-slate-50 flex-1" />
                      <Button
                        type="button"
                        variant="outline"
                        className="h-8.5 font-bold text-[11px] gap-1 px-3"
                        onClick={() => { navigator.clipboard?.writeText(initial.public_url); toast.success('URL copied!') }}
                      >
                        <Copy size={12} />
                        Copy
                      </Button>
                    </div>
                  </FieldWrapper>
                )}
              </div>
            )}

          </div>

          {/* Bottom Action Bar */}
          <div className="shrink-0 flex justify-between items-center border-t border-slate-200 pt-3.5 bg-white mt-3">
            <div className="text-[10.5px] text-slate-400 font-normal">
              Unified Form Builder. Pinned screen.
            </div>
            
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                className="h-9 text-xs font-bold px-4"
                onClick={() => router.visit('/forms')}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={processing}
                className="h-9 text-xs font-bold px-5 bg-violet-600 hover:bg-violet-700 text-white"
              >
                {processing ? (
                  <>
                    <Loader2 size={12} className="animate-spin mr-1.5" />
                    Saving...
                  </>
                ) : (
                  submitLabel
                )}
              </Button>
            </div>
          </div>

        </form>
      </div>

      {/* RIGHT PANEL: LIVE MOCKUP PREVIEW */}
      <div className="hidden lg:flex lg:flex-[3] bg-slate-50/50 border-l border-slate-100 flex-col min-h-0 p-5 md:p-6 overflow-y-auto items-center justify-start select-none">
        <div className="w-full flex items-center gap-1 px-1 mb-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider shrink-0">
          <Eye size={12} />
          Live Interactive Preview
        </div>
        
        <div className="w-full max-w-sm bg-white border border-slate-200 rounded-2xl shadow-sm p-5 space-y-4">
          <div className="text-center space-y-1">
            <div className="inline-flex items-center justify-center w-8 h-8 rounded-lg shadow-sm" style={{ background: 'linear-gradient(135deg, #7C3AED 0%, #4F46E5 100%)' }}>
              <LogoMark size={16} className="opacity-95 text-white" />
            </div>
            <h3 className="text-sm font-black text-slate-900 tracking-tight leading-tight">
              {data.name || 'Your Form Name'}
            </h3>
            {data.description && (
              <p className="text-[10px] text-slate-400 font-normal leading-relaxed line-clamp-2">
                {data.description}
              </p>
            )}
          </div>

          <div className="space-y-3">
            {data.fields.length === 0 ? (
              <p className="text-[11px] text-slate-400 text-center py-4">Add fields to see the interactive preview.</p>
            ) : (
              data.fields.map(f => (
                <div key={f.key} className="space-y-1">
                  <Label className="text-[10px] font-bold text-slate-500">
                    {f.label || 'Untitled Field'}
                    {f.required && <span className="text-rose-500 ml-0.5">*</span>}
                  </Label>
                  
                  {f.type === 'dropdown' ? (
                    <select disabled className="w-full h-8 rounded-lg border border-slate-200 bg-slate-50 text-[11px] px-2 focus:outline-none">
                      <option>Select an option...</option>
                      {f.options && f.options.map(opt => (
                        <option key={opt.value ?? opt}>{opt.label ?? opt}</option>
                      ))}
                    </select>
                  ) : f.type === 'textarea' ? (
                    <textarea disabled rows={1} className="w-full rounded-lg border border-slate-200 bg-slate-50 text-[11px] p-2 focus:outline-none resize-none" placeholder="Enter text..." />
                  ) : (
                    <input disabled type={f.type === 'number' ? 'number' : f.type === 'date' ? 'date' : 'text'} className="w-full h-8 rounded-lg border border-slate-200 bg-slate-50 text-[11px] px-2.5 focus:outline-none" placeholder="..." />
                  )}
                </div>
              ))
            )}

            <button type="button" disabled className="w-full h-8 rounded-lg text-[10.5px] font-bold text-white uppercase tracking-wider mt-2" style={{ background: 'linear-gradient(135deg, #7C3AED 0%, #4F46E5 100%)', opacity: 0.85 }}>
              Submit Details
            </button>
          </div>
        </div>
      </div>

    </div>
  )
}
