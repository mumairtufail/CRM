import { Head, Link, useForm } from '@inertiajs/react'
import AppLayout from '@/Components/Layout/AppLayout'
import PageHeader from '@/Components/Common/PageHeader'
import { Button } from '@/Components/ui/button'
import { Input } from '@/Components/ui/input'
import { Label } from '@/Components/ui/label'
import { Textarea } from '@/Components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/Components/ui/select'
import TagPicker from '@/Components/Common/TagPicker'
import { ChevronLeft, Mail, Phone, Plus, Star, Trash2 } from 'lucide-react'
import { toast } from 'sonner'

const STATUSES   = ['new','contacted','qualified','proposal','negotiation','won','lost','unqualified']
const PRIORITIES = ['low','medium','high']
const SOURCES    = ['manual','csv','google_sheet','claude_ai','apollo','facebook','instagram']
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

function SectionCard({ title, children, className = "" }) {
  return (
    <div className={`bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden ${className}`}>
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100 bg-slate-50/50">
        <h3 className="text-[14px] font-semibold text-slate-800">{title}</h3>
      </div>
      <div className="p-5 space-y-4">{children}</div>
    </div>
  )
}

export default function LeadEdit({ lead, tags = [] }) {
  const { data, setData, put, processing, errors } = useForm({
    first_name:      lead.first_name ?? '',
    last_name:       lead.last_name  ?? '',
    company:         lead.company    ?? '',
    job_title:       lead.job_title  ?? '',
    website:         lead.website    ?? '',
    linkedin_url:    lead.linkedin_url ?? '',
    notes:           lead.notes      ?? '',
    status:          lead.status     ?? 'new',
    priority:        lead.priority   ?? 'medium',
    deal_value:      lead.deal_value ?? '',
    currency:        lead.currency   ?? 'USD',
    country:         lead.country    ?? '',
    city:            lead.city       ?? '',
    industry:        lead.industry   ?? '',
    social_handles:  lead.social_handles ?? [],
    emails:          (lead.emails ?? []).map(e => ({ email: e.email, type: e.type ?? 'work', is_primary: !!e.is_primary })),
    phones:          (lead.phones ?? []).map(p => ({ phone: p.phone, type: p.type ?? 'mobile', is_primary: !!p.is_primary })),
    tag_ids:         (lead.tags ?? []).map(t => t.id),
  })

  const addSocial    = ()      => setData('social_handles', [...data.social_handles, { platform: 'linkedin', url: '' }])
  const removeSocial = (i)     => setData('social_handles', data.social_handles.filter((_, idx) => idx !== i))
  const setSocial    = (i,k,v) => setData('social_handles', data.social_handles.map((h, idx) => idx === i ? { ...h, [k]: v } : h))

  const addEmail       = ()      => setData('emails', [...data.emails, { email: '', type: 'work', is_primary: data.emails.length === 0 }])
  const removeEmail    = (i)     => {
    const updated = data.emails.filter((_, idx) => idx !== i)
    // If we removed the primary, promote the first remaining one
    if (data.emails[i]?.is_primary && updated.length > 0) updated[0].is_primary = true
    setData('emails', updated)
  }
  const setEmail       = (i,k,v) => setData('emails', data.emails.map((e, idx) => idx === i ? { ...e, [k]: v } : e))
  const setPrimaryEmail = (i)    => setData('emails', data.emails.map((e, idx) => ({ ...e, is_primary: idx === i })))

  const addPhone       = ()      => setData('phones', [...data.phones, { phone: '', type: 'mobile', is_primary: data.phones.length === 0 }])
  const removePhone    = (i)     => {
    const updated = data.phones.filter((_, idx) => idx !== i)
    if (data.phones[i]?.is_primary && updated.length > 0) updated[0].is_primary = true
    setData('phones', updated)
  }
  const setPhone       = (i,k,v) => setData('phones', data.phones.map((p, idx) => idx === i ? { ...p, [k]: v } : p))
  const setPrimaryPhone = (i)    => setData('phones', data.phones.map((p, idx) => ({ ...p, is_primary: idx === i })))

  const submit = e => {
    e.preventDefault()
    put(`/leads/${lead.id}`, {
      onSuccess: () => toast.success('Lead updated'),
      onError:   () => toast.error('Please fix the errors below'),
    })
  }

  return (
    <>
      <Head title={`Edit ${lead.full_name}`} />
      <AppLayout title="Edit Lead">
        <div className="max-w-6xl">
          <PageHeader
            title={`Edit ${lead.full_name}`}
            action={
              <Link href={`/leads/${lead.id}`}>
                <Button variant="outline" size="sm" className="gap-1.5 h-8 text-xs border-border">
                  <ChevronLeft size={13} /> Back
                </Button>
              </Link>
            }
          />

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
                      rows={3} className="text-xs resize-none" placeholder="Notes…" />
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

                  {/* Social handles */}
                  <div className="space-y-2">
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

                  {/* Emails */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="text-[12px] font-semibold text-slate-600 flex items-center gap-1.5">
                        <Mail size={12} className="text-violet-500" /> Email Addresses
                      </Label>
                      <button type="button" onClick={addEmail}
                        className="flex items-center gap-1 text-[11px] font-medium text-violet-600 hover:text-violet-800 transition-colors">
                        <Plus size={11} /> Add Email
                      </button>
                    </div>
                    {data.emails.length === 0 && (
                      <p className="text-[11.5px] text-slate-400 italic">No emails yet — click Add Email to add one.</p>
                    )}
                    {data.emails.map((em, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <select
                          value={em.type}
                          onChange={e => setEmail(i, 'type', e.target.value)}
                          className="h-8 rounded-md border border-input bg-background px-2 text-[11.5px] text-slate-700 w-24 shrink-0 focus:outline-none focus:ring-1 focus:ring-ring"
                        >
                          {['work','personal','other'].map(t => (
                            <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
                          ))}
                        </select>
                        <Input
                          type="email"
                          value={em.email}
                          onChange={e => setEmail(i, 'email', e.target.value)}
                          className="h-8 text-xs flex-1"
                          placeholder="email@example.com"
                        />
                        <button
                          type="button"
                          title={em.is_primary ? 'Primary email' : 'Set as primary'}
                          onClick={() => setPrimaryEmail(i)}
                          className={`shrink-0 transition-colors ${
                            em.is_primary
                              ? 'text-amber-400'
                              : 'text-slate-300 hover:text-amber-400'
                          }`}
                        >
                          <Star size={13} fill={em.is_primary ? 'currentColor' : 'none'} />
                        </button>
                        <button type="button" onClick={() => removeEmail(i)}
                          className="shrink-0 text-slate-300 hover:text-red-500 transition-colors">
                          <Trash2 size={13} />
                        </button>
                      </div>
                    ))}
                    {errors['emails.0.email'] && (
                      <p className="text-red-500 text-[11px]">{errors['emails.0.email']}</p>
                    )}
                  </div>

                  {/* Phones */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="text-[12px] font-semibold text-slate-600 flex items-center gap-1.5">
                        <Phone size={12} className="text-violet-500" /> Phone Numbers
                      </Label>
                      <button type="button" onClick={addPhone}
                        className="flex items-center gap-1 text-[11px] font-medium text-violet-600 hover:text-violet-800 transition-colors">
                        <Plus size={11} /> Add Phone
                      </button>
                    </div>
                    {data.phones.length === 0 && (
                      <p className="text-[11.5px] text-slate-400 italic">No phones yet — click Add Phone to add one.</p>
                    )}
                    {data.phones.map((ph, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <select
                          value={ph.type}
                          onChange={e => setPhone(i, 'type', e.target.value)}
                          className="h-8 rounded-md border border-input bg-background px-2 text-[11.5px] text-slate-700 w-24 shrink-0 focus:outline-none focus:ring-1 focus:ring-ring"
                        >
                          {['mobile','work','home','other'].map(t => (
                            <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
                          ))}
                        </select>
                        <Input
                          type="tel"
                          value={ph.phone}
                          onChange={e => setPhone(i, 'phone', e.target.value)}
                          className="h-8 text-xs flex-1"
                          placeholder="+1 555 000 0000"
                        />
                        <button
                          type="button"
                          title={ph.is_primary ? 'Primary phone' : 'Set as primary'}
                          onClick={() => setPrimaryPhone(i)}
                          className={`shrink-0 transition-colors ${
                            ph.is_primary
                              ? 'text-amber-400'
                              : 'text-slate-300 hover:text-amber-400'
                          }`}
                        >
                          <Star size={13} fill={ph.is_primary ? 'currentColor' : 'none'} />
                        </button>
                        <button type="button" onClick={() => removePhone(i)}
                          className="shrink-0 text-slate-300 hover:text-red-500 transition-colors">
                          <Trash2 size={13} />
                        </button>
                      </div>
                    ))}
                    {errors['phones.0.phone'] && (
                      <p className="text-red-500 text-[11px]">{errors['phones.0.phone']}</p>
                    )}
                  </div>
                </SectionCard>
              </div>

              {/* Middle Column - Pipeline & Details */}
              <div className="xl:col-span-1 space-y-6 flex flex-col">
                <SectionCard title="Status & Pipeline">
                  <FormField label="Status" error={errors.status}>
                    <Select value={data.status} onValueChange={v => setData('status', v)}>
                      <SelectTrigger className="h-9 text-xs"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {STATUSES.map(s => <SelectItem key={s} value={s} className="capitalize text-xs">{s}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </FormField>
                  <FormField label="Priority" error={errors.priority}>
                    <Select value={data.priority} onValueChange={v => setData('priority', v)}>
                      <SelectTrigger className="h-9 text-xs"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {PRIORITIES.map(p => <SelectItem key={p} value={p} className="capitalize text-xs">{p}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </FormField>
                  <hr className="my-4 border-slate-100" />
                  <FormField label="Deal Value" error={errors.deal_value}>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs">$</span>
                      <Input type="number" value={data.deal_value} onChange={e => setData('deal_value', e.target.value)}
                        className="h-9 text-xs pl-6" placeholder="0.00" />
                    </div>
                  </FormField>
                </SectionCard>

                <SectionCard title="Additional Details">
                  <FormField label="Industry" error={errors.industry}>
                    <Input value={data.industry} onChange={e => setData('industry', e.target.value)}
                      className="h-9 text-xs" placeholder="Software" />
                  </FormField>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
                    <FormField label="Country" error={errors.country}>
                      <Input value={data.country} onChange={e => setData('country', e.target.value)}
                        className="h-9 text-xs" placeholder="United States" />
                    </FormField>
                    <FormField label="City" error={errors.city}>
                      <Input value={data.city} onChange={e => setData('city', e.target.value)}
                        className="h-9 text-xs" placeholder="New York" />
                    </FormField>
                  </div>
                  <div className="mt-4">
                    <TagPicker tags={tags} selectedIds={data.tag_ids} onChange={v => setData('tag_ids', v)} />
                  </div>
                </SectionCard>
              </div>

              {/* Right Column - Tips & Help */}
              <div className="xl:col-span-1 flex flex-col space-y-6">
                <SectionCard title="Tips & Guidance" className="bg-gradient-to-b from-indigo-50/50 to-white h-full">
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
              </div>

            </div>

            <div className="flex items-center justify-center gap-5 pt-8 pb-4 mt-6 border-t border-slate-100">
              <Link href={`/leads/${lead.id}`}>
                <Button type="button" variant="outline" size="sm" className="h-11 text-[14px] border-slate-200 px-8 font-medium">Cancel</Button>
              </Link>
              <Button type="submit" size="sm" disabled={processing}
                className="h-11 px-10 text-[14px] bg-primary hover:bg-primary/90 text-primary-foreground border-0 tracking-wide font-semibold shadow-md">
                {processing ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </form>
        </div>
      </AppLayout>
    </>
  )
}
