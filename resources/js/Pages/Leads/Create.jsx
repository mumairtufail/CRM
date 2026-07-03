import { Head, Link, useForm } from '@inertiajs/react'
import AppLayout from '@/Components/Layout/AppLayout'
import { Button } from '@/Components/ui/button'
import { Input } from '@/Components/ui/input'
import { Label } from '@/Components/ui/label'
import { Textarea } from '@/Components/ui/textarea'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/Components/ui/select'
import TagPicker from '@/Components/Common/TagPicker'
import { ChevronLeft, Plus, X, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { useState } from 'react'

const STATUSES = ['new','contacted','qualified','proposal','negotiation','won','lost','unqualified']
const PRIORITIES = ['low','medium','high']
const SOURCES = ['manual','csv','google_sheet','claude_ai','apollo','facebook','instagram']
const SOCIAL_PLATFORMS = ['linkedin','twitter','facebook','instagram','youtube','tiktok','reddit','github','x','website','other']

function FormField({ label, error, children, required }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-[12.5px] font-medium text-slate-700">
        {label}{required && <span className="text-red-500 ml-0.5">*</span>}
      </Label>
      {children}
      {error && <p className="text-red-500 text-[11px] mt-0.5">{error}</p>}
    </div>
  )
}

function SectionCard({ title, action, children, className = "", contentClassName = "" }) {
  return (
    <div className={`bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col ${className}`}>
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100 bg-slate-50/50">
        <h3 className="text-[14px] font-semibold text-slate-800">{title}</h3>
        {action}
      </div>
      <div className={`p-5 space-y-4 ${contentClassName}`}>{children}</div>
    </div>
  )
}

export default function LeadCreate({ tags = [] }) {
  const { data, setData, post, transform, processing, errors } = useForm({
    first_name: '', last_name: '', company: '', job_title: '',
    website: '', linkedin_url: '', notes: '',
    source: 'manual', status: 'new', priority: 'medium',
    deal_value: '', currency: 'USD', country: '', city: '', industry: '',
    emails: [{ email: '', type: 'work', is_primary: true }],
    phones: [{ phone: '', type: 'mobile', is_primary: true }],
    social_handles: [],
    tag_ids: [],
  })

  // Strip empty email/phone/social rows before the request is sent
  transform(d => ({
    ...d,
    emails: d.emails.filter(em => em.email.trim() !== ''),
    phones: d.phones.filter(ph => ph.phone.trim() !== ''),
    social_handles: d.social_handles.filter(h => h.url.trim() !== ''),
  }))

  const addSocial    = ()      => setData('social_handles', [...data.social_handles, { platform: 'linkedin', url: '' }])
  const removeSocial = (i)     => setData('social_handles', data.social_handles.filter((_, idx) => idx !== i))
  const setSocial    = (i,k,v) => setData('social_handles', data.social_handles.map((h, idx) => idx === i ? { ...h, [k]: v } : h))

  const addEmail = () => setData('emails', [...data.emails, { email: '', type: 'work', is_primary: false }])
  const removeEmail = i => setData('emails', data.emails.filter((_, idx) => idx !== i))
  const updateEmail = (i, field, val) => {
    const next = [...data.emails]
    next[i] = { ...next[i], [field]: val }
    setData('emails', next)
  }

  const addPhone = () => setData('phones', [...data.phones, { phone: '', type: 'mobile', is_primary: false }])
  const removePhone = i => setData('phones', data.phones.filter((_, idx) => idx !== i))
  const updatePhone = (i, field, val) => {
    const next = [...data.phones]
    next[i] = { ...next[i], [field]: val }
    setData('phones', next)
  }

  const submit = e => {
    e.preventDefault()
    post('/leads', {
      onSuccess: () => toast.success('Lead created successfully'),
      onError: () => toast.error('Please fix the errors below'),
    })
  }

  return (
    <>
      <Head title="Add Lead" />
      <AppLayout title="Add Lead">
        <div className="max-w-6xl">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-[17px] font-bold text-slate-800 tracking-tight">Add Lead</h2>
              <p className="text-[12.5px] text-slate-500 mt-0.5">Fill in the details to create a new lead</p>
            </div>
            <Link href="/leads">
              <Button variant="outline" size="sm" className="gap-1.5 h-8 text-xs border-slate-200">
                <ChevronLeft size={13} /> Back
              </Button>
            </Link>
          </div>

          <form onSubmit={submit}>
            <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
              
              {/* Left Column - Main Details */}
              <div className="xl:col-span-2 space-y-6">
                
                {/* Basic Info */}
                <SectionCard title="Basic Info">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormField label="First Name" error={errors.first_name} required>
                      <Input value={data.first_name} onChange={e => setData('first_name', e.target.value)}
                        className="h-9 text-xs" placeholder="John" />
                    </FormField>
                    <FormField label="Last Name" error={errors.last_name}>
                      <Input value={data.last_name} onChange={e => setData('last_name', e.target.value)}
                        className="h-9 text-xs" placeholder="Doe" />
                    </FormField>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormField label="Company" error={errors.company}>
                      <Input value={data.company} onChange={e => setData('company', e.target.value)}
                        className="h-9 text-xs" placeholder="Acme Inc." />
                    </FormField>
                    <FormField label="Job Title" error={errors.job_title}>
                      <Input value={data.job_title} onChange={e => setData('job_title', e.target.value)}
                        className="h-9 text-xs" placeholder="CEO" />
                    </FormField>
                  </div>
                  <FormField label="Notes" error={errors.notes}>
                    <Textarea value={data.notes} onChange={e => setData('notes', e.target.value)}
                      rows={3} className="text-xs resize-none" placeholder="Add any relevant notes…" />
                  </FormField>
                </SectionCard>

                {/* Contact Info */}
                <SectionCard title="Contact Information">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormField label="Website" error={errors.website}>
                      <Input value={data.website} onChange={e => setData('website', e.target.value)}
                        className="h-9 text-xs" placeholder="https://acme.com" />
                    </FormField>
                    <FormField label="LinkedIn Profile" error={errors.linkedin_url}>
                      <Input value={data.linkedin_url} onChange={e => setData('linkedin_url', e.target.value)}
                        className="h-9 text-xs" placeholder="linkedin.com/in/username" />
                    </FormField>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    {/* Emails */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Label className="text-[12.5px] font-medium text-slate-700">Emails</Label>
                        <Button type="button" variant="ghost" size="sm" className="h-6 gap-1 text-[10px] px-2 text-indigo-600 hover:text-indigo-700" onClick={addEmail}>
                          <Plus size={12} /> Add Email
                        </Button>
                      </div>
                      <div className="space-y-2">
                        {data.emails.map((em, i) => (
                          <div key={i} className="flex gap-2 items-center">
                            <Input
                              type="email"
                              value={em.email}
                              onChange={e => updateEmail(i, 'email', e.target.value)}
                              placeholder="email@example.com"
                              className="h-9 text-xs flex-1 min-w-0"
                            />
                            <Select value={em.type} onValueChange={v => updateEmail(i, 'type', v)}>
                              <SelectTrigger className="h-9 text-xs w-24 shrink-0"><SelectValue /></SelectTrigger>
                              <SelectContent>
                                {['work','personal','other'].map(t => <SelectItem key={t} value={t} className="capitalize text-xs">{t}</SelectItem>)}
                              </SelectContent>
                            </Select>
                            {data.emails.length > 1 && (
                              <Button type="button" variant="ghost" size="icon" className="h-9 w-8 shrink-0 text-muted-foreground hover:text-red-500"
                                onClick={() => removeEmail(i)}>
                                <X size={14} />
                              </Button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Phones */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Label className="text-[12.5px] font-medium text-slate-700">Phones</Label>
                        <Button type="button" variant="ghost" size="sm" className="h-6 gap-1 text-[10px] px-2 text-indigo-600 hover:text-indigo-700" onClick={addPhone}>
                          <Plus size={12} /> Add Phone
                        </Button>
                      </div>
                      <div className="space-y-2">
                        {data.phones.map((ph, i) => (
                          <div key={i} className="flex gap-2 items-center">
                            <Input
                              value={ph.phone}
                              onChange={e => updatePhone(i, 'phone', e.target.value)}
                              placeholder="+1 555 000 0000"
                              className="h-9 text-xs flex-1 min-w-0"
                            />
                            <Select value={ph.type} onValueChange={v => updatePhone(i, 'type', v)}>
                              <SelectTrigger className="h-9 text-xs w-24 shrink-0"><SelectValue /></SelectTrigger>
                              <SelectContent>
                                {['mobile','work','home','whatsapp','other'].map(t => <SelectItem key={t} value={t} className="capitalize text-xs">{t}</SelectItem>)}
                              </SelectContent>
                            </Select>
                            {data.phones.length > 1 && (
                              <Button type="button" variant="ghost" size="icon" className="h-9 w-8 shrink-0 text-muted-foreground hover:text-red-500"
                                onClick={() => removePhone(i)}>
                                <X size={14} />
                              </Button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Social handles */}
                  <div className="space-y-2 pt-1">
                    <div className="flex items-center justify-between">
                      <Label className="text-[12px] font-semibold text-slate-600">Social media handles</Label>
                      <button type="button" onClick={addSocial}
                        className="flex items-center gap-1 text-[11px] font-medium text-violet-600 hover:text-violet-800 transition-colors">
                        <Plus size={11} /> Add
                      </button>
                    </div>
                    {data.social_handles.length === 0 && (
                      <p className="text-[11.5px] text-slate-400 italic">No social handles yet — click Add to include LinkedIn, Twitter, Instagram, etc.</p>
                    )}
                    {data.social_handles.map((h, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <select
                          value={h.platform}
                          onChange={e => setSocial(i, 'platform', e.target.value)}
                          className="h-8 rounded-md border border-input bg-background px-2 text-[11.5px] text-slate-700 w-32 shrink-0 focus:outline-none focus:ring-1 focus:ring-ring"
                        >
                          {SOCIAL_PLATFORMS.map(p => (
                            <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>
                          ))}
                        </select>
                        <Input
                          value={h.url}
                          onChange={e => setSocial(i, 'url', e.target.value)}
                          className="h-8 text-xs flex-1"
                          placeholder="https://…"
                        />
                        <button type="button" onClick={() => removeSocial(i)}
                          className="shrink-0 text-slate-300 hover:text-red-500 transition-colors">
                          <Trash2 size={13} />
                        </button>
                      </div>
                    ))}
                  </div>
                </SectionCard>
              </div>

              {/* Middle Column - Pipeline & Details */}
              <div className="xl:col-span-1 flex flex-col">
                <SectionCard title="Pipeline & Details" className="h-full flex flex-col" contentClassName="flex flex-col flex-1 p-5 gap-6">
                  
                  {/* Status & Priority */}
                  <div className="space-y-4">
                    <FormField label="Status" error={errors.status}>
                      <Select value={data.status} onValueChange={v => setData('status', v)}>
                        <SelectTrigger className="h-9 text-xs"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {STATUSES.map(s => <SelectItem key={s} value={s} className="capitalize text-xs">{s}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </FormField>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <FormField label="Priority" error={errors.priority}>
                        <Select value={data.priority} onValueChange={v => setData('priority', v)}>
                          <SelectTrigger className="h-9 text-xs"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {PRIORITIES.map(p => <SelectItem key={p} value={p} className="capitalize text-xs">{p}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </FormField>

                      <FormField label="Source" error={errors.source}>
                        <Select value={data.source} onValueChange={v => setData('source', v)}>
                          <SelectTrigger className="h-9 text-xs"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {SOURCES.map(s => <SelectItem key={s} value={s} className="capitalize text-xs">{s.replace(/_/g,' ')}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </FormField>
                    </div>
                  </div>

                  <hr className="border-slate-100" />

                  {/* Financial & Industry */}
                  <div className="space-y-4">
                    <FormField label="Deal Value" error={errors.deal_value}>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs">$</span>
                        <Input type="number" value={data.deal_value} onChange={e => setData('deal_value', e.target.value)}
                          className="h-9 text-xs pl-6" placeholder="0.00" />
                      </div>
                    </FormField>

                    <FormField label="Industry" error={errors.industry}>
                      <Input value={data.industry} onChange={e => setData('industry', e.target.value)}
                        className="h-9 text-xs" placeholder="Software" />
                    </FormField>
                  </div>

                  <hr className="border-slate-100" />

                  {/* Location Area (pushes to bottom nicely) */}
                  <div className="space-y-4 flex-1">
                    <div className="grid grid-cols-2 gap-3">
                      <FormField label="Country" error={errors.country}>
                        <Input value={data.country} onChange={e => setData('country', e.target.value)}
                          className="h-9 text-xs" placeholder="United States" />
                      </FormField>
                      <FormField label="City" error={errors.city}>
                        <Input value={data.city} onChange={e => setData('city', e.target.value)}
                          className="h-9 text-xs" placeholder="New York" />
                      </FormField>
                    </div>

                    <TagPicker tags={tags} selectedIds={data.tag_ids} onChange={v => setData('tag_ids', v)} />
                  </div>

                </SectionCard>
              </div>

              {/* Right Column - Tips & Help */}
              <div className="xl:col-span-1 flex flex-col space-y-6">
                <SectionCard title="Tips & Guidance" className="bg-gradient-to-b from-indigo-50/50 to-white">
                  <div className="text-[12.5px] text-slate-600 space-y-4">
                    <div>
                      <h4 className="font-semibold text-indigo-900 mb-1">Qualifying Leads</h4>
                      <p>Ensure you add as much detail as possible to help the sales team qualify this lead effectively. Phone numbers and LinkedIn URLs are highly recommended.</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-indigo-900 mb-1">Deal Value</h4>
                      <p>If the exact deal value is unknown, leave it blank or enter a conservative estimate based on company size.</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-indigo-900 mb-1">Source Tracking</h4>
                      <p>Correctly tagging the lead source helps our marketing team understand which channels are performing best.</p>
                    </div>
                  </div>
                </SectionCard>

                <SectionCard title="Quick Actions" className="bg-slate-50/50">
                  <div className="text-[12.5px] text-slate-600 space-y-3">
                    <button type="button" onClick={() => setData({ ...data, source: 'linkedin', status: 'new' })} className="w-full text-left px-3 py-2 rounded-md hover:bg-white hover:shadow-sm border border-transparent hover:border-slate-200 transition-all text-indigo-600 font-medium">
                      Set as LinkedIn Lead
                    </button>
                    <button type="button" onClick={() => setData({ ...data, priority: 'high', status: 'qualified' })} className="w-full text-left px-3 py-2 rounded-md hover:bg-white hover:shadow-sm border border-transparent hover:border-slate-200 transition-all text-indigo-600 font-medium">
                      Mark as High Priority
                    </button>

                    <hr className="border-slate-200/70 !my-4" />

                    {/* Primary actions */}
                    <button type="submit" disabled={processing}
                      className="w-full h-10 text-[13.5px] font-semibold text-white rounded-lg transition-all hover:opacity-90 disabled:opacity-60 flex items-center justify-center gap-2"
                      style={{ background: 'linear-gradient(135deg,#7C3AED,#4F46E5)', boxShadow: '0 4px 14px rgba(124,58,237,0.3)' }}>
                      {processing ? 'Saving…' : (<><Plus size={15} /> Create Lead</>)}
                    </button>
                    <Link href="/leads" className="block">
                      <Button type="button" variant="outline" className="w-full h-10 text-[13px] border-slate-200 font-medium">
                        Cancel
                      </Button>
                    </Link>
                  </div>
                </SectionCard>
              </div>

            </div>
          </form>
        </div>
      </AppLayout>
    </>
  )
}
