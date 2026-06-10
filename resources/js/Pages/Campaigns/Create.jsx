import { Head, Link, useForm } from '@inertiajs/react'
import { useState, useCallback, useEffect } from 'react'
import AppLayout from '@/Components/Layout/AppLayout'
import { Button } from '@/Components/ui/button'
import { Input } from '@/Components/ui/input'
import { Label } from '@/Components/ui/label'
import { Badge } from '@/Components/ui/badge'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/Components/ui/select'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from '@/Components/ui/dialog'
import { ChevronLeft, Eye, Users, UsersRound, Filter, Layers } from 'lucide-react'
import { toast } from 'sonner'
import RichEditor from '@/Components/Common/RichEditor'
import { cn } from '@/lib/utils'

const TEMPLATES = {
  blank: { name: 'Blank', body: '' },
  intro: {
    name: 'Introduction',
    body: `<p>Hi {{first_name}},</p><p>I wanted to reach out and introduce myself. I'm [Your Name] from [Your Company].</p><p>We help businesses like {{company}} achieve [outcome] through [your solution].</p><p>I'd love to schedule a quick 15-minute call to learn more about your goals. Would any of these times work for you?</p><p>Looking forward to connecting,<br>[Your Name]</p>`,
  },
  followup: {
    name: 'Follow-up',
    body: `<p>Hi {{first_name}},</p><p>I'm following up on my previous message. I know you're busy, so I'll keep this brief.</p><p>I believe we can help {{company}} with [specific value proposition]. Many companies in [industry] have seen [result] after working with us.</p><p>Would you have 15 minutes this week to connect?</p><p>Best,<br>[Your Name]</p>`,
  },
  promo: {
    name: 'Promotion',
    body: `<p>Hi {{first_name}},</p><p>We have an exciting update we'd love to share with you.</p><p>[Describe your offer or announcement here]</p><p>This offer is available until [date]. Reply to this email or click the button below to learn more.</p><p>Best regards,<br>[Your Name]</p>`,
  },
}

// Available tokens for subject + body
const TOKENS = [
  { label: '{{first_name}}', desc: "Lead's first name" },
  { label: '{{last_name}}',  desc: "Lead's last name" },
  { label: '{{name}}',       desc: 'Full name' },
  { label: '{{company}}',    desc: 'Company name' },
  { label: '{{email}}',      desc: 'Email address' },
  { label: '{{status}}',     desc: 'Lead status' },
]

const STATUS_OPTIONS = [
  'new', 'contacted', 'qualified', 'proposal', 'negotiation', 'won', 'lost', 'unqualified',
]

function Field({ label, error, hint, children }) {
  return (
    <div className="space-y-1">
      <Label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">{label}</Label>
      {children}
      {hint  && <p className="text-[10.5px] text-slate-400">{hint}</p>}
      {error && <p className="text-red-500 text-[11px]">{error}</p>}
    </div>
  )
}

function FormCard({ title, action, children }) {
  return (
    <div className="form-card">
      <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
        <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">{title}</p>
        {action}
      </div>
      <div className="px-4 py-3 space-y-3">{children}</div>
    </div>
  )
}

function TokenPill({ token, onClick }) {
  return (
    <button
      type="button"
      onClick={() => onClick(token.label)}
      title={token.desc}
      className="text-[11px] text-violet-600 hover:text-white hover:bg-violet-600 font-medium px-2 py-0.5 rounded border border-violet-200 hover:border-violet-600 transition-all"
    >
      {token.label}
    </button>
  )
}

// Tab constants
const TABS = [
  { id: 'all',    label: 'All Leads',         icon: Users },
  { id: 'filter', label: 'Filter by criteria', icon: Filter },
  { id: 'group',  label: 'Select a Group',     icon: UsersRound },
]

function RecipientSelector({ data, setData, leadCount, groups, tags, recipientCount }) {
  const tab = data.recipient_mode || 'all'

  const setTab = (t) => setData(prev => ({ ...prev, recipient_mode: t }))

  const toggleStatus = (s) => {
    const current = data.filters?.statuses ?? []
    const next = current.includes(s) ? current.filter(x => x !== s) : [...current, s]
    setData(prev => ({ ...prev, filters: { ...prev.filters, statuses: next } }))
  }

  const toggleTag = (id) => {
    const current = data.filters?.tag_ids ?? []
    const next = current.includes(id) ? current.filter(x => x !== id) : [...current, id]
    setData(prev => ({ ...prev, filters: { ...prev.filters, tag_ids: next } }))
  }

  return (
    <div className="form-card">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
        <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Recipients</p>
        <div className="flex items-center gap-1.5 text-[12px] font-semibold text-violet-700">
          <Users size={12} />
          {recipientCount} leads
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-100 px-4">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
            className={cn(
              'flex items-center gap-1.5 px-3 py-2.5 text-[12px] font-medium border-b-2 -mb-px transition-colors',
              tab === id
                ? 'border-violet-600 text-violet-700'
                : 'border-transparent text-slate-400 hover:text-slate-600'
            )}
          >
            <Icon size={13} />
            {label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="px-4 py-4">
        {tab === 'all' && (
          <div className="flex items-center gap-3 py-1">
            <div className="w-10 h-10 rounded-xl bg-violet-50 flex items-center justify-center">
              <Users size={18} className="text-violet-600" />
            </div>
            <div>
              <p className="text-[13px] font-semibold text-slate-800">All Leads</p>
              <p className="text-[11.5px] text-slate-400 mt-0.5">
                Send to all <span className="font-semibold text-slate-600">{leadCount}</span> leads in your CRM
              </p>
            </div>
          </div>
        )}

        {tab === 'filter' && (
          <div className="space-y-4">
            <div className="space-y-2">
              <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Filter by Status</p>
              <div className="flex flex-wrap gap-1.5">
                {STATUS_OPTIONS.map(s => {
                  const active = (data.filters?.statuses ?? []).includes(s)
                  return (
                    <button
                      key={s}
                      type="button"
                      onClick={() => toggleStatus(s)}
                      className={cn(
                        'text-[12px] px-3 py-1 rounded-full border font-medium capitalize transition-all',
                        active
                          ? 'bg-violet-600 text-white border-violet-600'
                          : 'border-slate-200 text-slate-500 hover:border-violet-300 hover:text-violet-600'
                      )}
                    >
                      {s}
                    </button>
                  )
                })}
              </div>
            </div>
            {tags.length > 0 && (
              <div className="space-y-2">
                <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Filter by Tag</p>
                <div className="flex flex-wrap gap-1.5">
                  {tags.map(t => {
                    const active = (data.filters?.tag_ids ?? []).includes(t.id)
                    return (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => toggleTag(t.id)}
                        className={cn(
                          'text-[12px] px-3 py-1 rounded-full border font-medium transition-all',
                          active
                            ? 'text-white border-transparent'
                            : 'border-slate-200 text-slate-500 hover:text-slate-700'
                        )}
                        style={active ? { background: t.color, borderColor: t.color } : {}}
                      >
                        {active && <span className="mr-1">✓</span>}
                        {t.name}
                      </button>
                    )
                  })}
                </div>
              </div>
            )}
            {(data.filters?.statuses ?? []).length === 0 && (data.filters?.tag_ids ?? []).length === 0 && (
              <p className="text-[11.5px] text-slate-400 italic">No filters selected — will match all leads.</p>
            )}
          </div>
        )}

        {tab === 'group' && (
          <div className="space-y-1.5">
            {groups.length === 0 ? (
              <div className="text-center py-4">
                <p className="text-[12.5px] text-slate-500">No groups yet.</p>
                <Link href="/groups" className="text-[12px] text-violet-600 hover:underline">
                  Create a group first →
                </Link>
              </div>
            ) : (
              groups.map(g => {
                const active = data.group_id === g.id
                return (
                  <button
                    key={g.id}
                    type="button"
                    onClick={() => setData(prev => ({ ...prev, group_id: active ? null : g.id }))}
                    className={cn(
                      'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl border text-left transition-all',
                      active
                        ? 'border-violet-300 bg-violet-50'
                        : 'border-slate-100 hover:border-slate-200 hover:bg-slate-50'
                    )}
                  >
                    <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: g.color }} />
                    <div className="flex-1 min-w-0">
                      <p className={cn('text-[13px] font-semibold truncate', active ? 'text-violet-800' : 'text-slate-700')}>
                        {g.name}
                      </p>
                    </div>
                    <span className={cn('text-[11px] font-medium shrink-0', active ? 'text-violet-600' : 'text-slate-400')}>
                      {g.leads_count} leads
                    </span>
                    {active && (
                      <div className="w-4 h-4 rounded-full bg-violet-600 flex items-center justify-center shrink-0">
                        <span className="text-white text-[9px]">✓</span>
                      </div>
                    )}
                  </button>
                )
              })
            )}
          </div>
        )}
      </div>
    </div>
  )
}

function EmailPreviewModal({ open, onClose, subject, fromName, fromEmail, body }) {
  const sampleReplace = (s) => (s || '')
    .replace(/\{\{name\}\}/g, 'John Doe')
    .replace(/\{\{first_name\}\}/g, 'John')
    .replace(/\{\{last_name\}\}/g, 'Doe')
    .replace(/\{\{company\}\}/g, 'Acme Inc.')
    .replace(/\{\{email\}\}/g, 'john@acme.com')
    .replace(/\{\{phone\}\}/g, '+1 555-0100')
    .replace(/\{\{status\}\}/g, 'qualified')

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-xl max-h-[88vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-[13px] font-semibold">Email Preview</DialogTitle>
        </DialogHeader>
        <div className="rounded-xl overflow-hidden" style={{ border: '1px solid rgba(0,0,0,0.08)' }}>
          <div className="px-4 py-3 space-y-2" style={{ background: '#f8f8f8', borderBottom: '1px solid rgba(0,0,0,0.07)' }}>
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center text-white text-xs font-bold shrink-0"
                style={{ background: 'linear-gradient(135deg,#7C3AED,#4F46E5)' }}>
                {fromName?.charAt(0)?.toUpperCase() ?? 'S'}
              </div>
              <div>
                <p className="text-[12.5px] font-semibold text-slate-800">{fromName || 'Sender'}</p>
                <p className="text-[11px] text-slate-500">{fromEmail || 'sender@example.com'}</p>
              </div>
            </div>
            <p className="text-[13px] font-semibold text-slate-800">{sampleReplace(subject) || '(no subject)'}</p>
          </div>
          <div className="bg-white px-5 py-4">
            {body ? (
              <div
                className="tiptap-body text-[13px] text-slate-700 leading-relaxed prose prose-sm max-w-none"
                dangerouslySetInnerHTML={{ __html: sampleReplace(body) }}
              />
            ) : (
              <p className="text-[12px] text-slate-400 italic">No body content yet.</p>
            )}
          </div>
          <div className="px-5 py-2.5 text-center" style={{ background: '#f8f8f8', borderTop: '1px solid rgba(0,0,0,0.07)' }}>
            <p className="text-[10.5px] text-slate-400">Tokens shown with sample data · Unsubscribe</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default function CampaignCreate({ statuses, leadCount, groups = [], tags = [], campaign = null }) {
  const isEdit = !!campaign
  const [previewOpen, setPreviewOpen]       = useState(false)
  const [recipientCount, setRecipientCount] = useState(campaign?.total_recipients ?? leadCount ?? 0)
  const [subjectRef, setSubjectRef]         = useState(null)

  const { data, setData, post, put, processing, errors } = useForm({
    name:           campaign?.name           ?? '',
    subject:        campaign?.subject        ?? '',
    from_name:      campaign?.from_name      ?? '',
    from_email:     campaign?.from_email     ?? '',
    body_html:      campaign?.body_html      ?? '',
    recipient_mode: campaign?.recipient_mode ?? 'all',
    group_id:       campaign?.group_id       ?? null,
    filters:        campaign?.filters        ?? { statuses: [], tag_ids: [] },
  })

  // Fetch recipient count whenever relevant fields change
  const fetchCount = useCallback(async (formData) => {
    try {
      const params = new URLSearchParams({ recipient_mode: formData.recipient_mode })
      if (formData.group_id) params.set('group_id', formData.group_id)
      if ((formData.filters?.statuses ?? []).length > 0) {
        formData.filters.statuses.forEach(s => params.append('filters[statuses][]', s))
      }
      if ((formData.filters?.tag_ids ?? []).length > 0) {
        formData.filters.tag_ids.forEach(id => params.append('filters[tag_ids][]', id))
      }
      const res = await fetch(`/campaigns/recipient-count?${params}`, {
        headers: { Accept: 'application/json' },
      })
      const json = await res.json()
      if (json.count != null) setRecipientCount(json.count)
    } catch {}
  }, [])

  useEffect(() => {
    fetchCount(data)
  }, [data.recipient_mode, data.group_id, data.filters])

  const insertToken = (token) => {
    // Insert at cursor in subject if focused there, otherwise append
    const el = subjectRef
    if (el && document.activeElement === el) {
      const start = el.selectionStart
      const end   = el.selectionEnd
      const val   = el.value
      setData('subject', val.slice(0, start) + token + val.slice(end))
      setTimeout(() => {
        el.selectionStart = start + token.length
        el.selectionEnd   = start + token.length
        el.focus()
      }, 0)
    } else {
      // Append to subject
      setData('subject', (data.subject || '') + token)
    }
  }

  const submit = (e) => {
    e.preventDefault()
    const opts = { onError: () => toast.error('Please fix the errors below') }
    if (isEdit) put(`/campaigns/${campaign.id}`, opts)
    else post('/campaigns', opts)
  }

  return (
    <>
      <Head title={isEdit ? 'Edit Campaign' : 'New Campaign'} />
      <AppLayout title={isEdit ? 'Edit Campaign' : 'New Campaign'}>
        <div className="max-w-4xl">

          {/* Page header */}
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-[17px] font-bold text-slate-800 tracking-tight">
                {isEdit ? 'Edit Campaign' : 'New Campaign'}
              </h2>
              <p className="text-[12.5px] text-slate-500 mt-0.5">Configure and compose your email campaign</p>
            </div>
            <Link href="/campaigns">
              <Button variant="outline" size="sm" className="h-8 text-xs gap-1 border-slate-200">
                <ChevronLeft size={13} /> Back
              </Button>
            </Link>
          </div>

          <form onSubmit={submit} className="space-y-3">

            {/* Sender details */}
            <FormCard title="Sender details">
              <Field label="Campaign name" error={errors.name}>
                <Input value={data.name} onChange={e => setData('name', e.target.value)}
                  className="h-8 text-[13px]" placeholder="March Follow-up Blast" />
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="From name" error={errors.from_name}>
                  <Input value={data.from_name} onChange={e => setData('from_name', e.target.value)}
                    className="h-8 text-[13px]" placeholder="Your Name" />
                </Field>
                <Field label="From email" error={errors.from_email}>
                  <Input type="email" value={data.from_email} onChange={e => setData('from_email', e.target.value)}
                    className="h-8 text-[13px]" placeholder="you@company.com" />
                </Field>
              </div>

              {/* Dynamic subject with token pills */}
              <Field label="Subject line" error={errors.subject}
                hint="Click a token below to insert it into the subject line">
                <Input
                  ref={el => setSubjectRef(el)}
                  value={data.subject}
                  onChange={e => setData('subject', e.target.value)}
                  className="h-8 text-[13px]"
                  placeholder="Quick question about {{company}}"
                />
                <div className="flex flex-wrap gap-1 mt-1.5">
                  {TOKENS.map(t => (
                    <TokenPill key={t.label} token={t} onClick={insertToken} />
                  ))}
                </div>
              </Field>
            </FormCard>

            {/* Recipients — 3-tab selector */}
            <RecipientSelector
              data={data}
              setData={(updater) => {
                if (typeof updater === 'function') {
                  setData(current => updater(current))
                } else {
                  setData(updater)
                }
              }}
              leadCount={leadCount}
              groups={groups}
              tags={tags}
              recipientCount={recipientCount}
            />

            {/* Email body */}
            <div className="form-card">
              <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
                <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Email body</p>
                <div className="flex items-center gap-1.5">
                  <span className="text-[10.5px] text-slate-400">Template:</span>
                  {Object.entries(TEMPLATES).map(([key, t]) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setData('body_html', t.body)}
                      className="text-[11px] text-violet-600 hover:text-violet-800 font-medium underline underline-offset-2 transition-colors"
                    >
                      {t.name}
                    </button>
                  ))}
                </div>
              </div>
              <div className="px-4 py-3">
                {/* Token reference */}
                <div className="flex flex-wrap gap-1 mb-2">
                  <span className="text-[10.5px] text-slate-400 self-center">Tokens:</span>
                  {TOKENS.map(t => (
                    <span key={t.label} title={t.desc}
                      className="text-[10.5px] text-violet-500 font-mono bg-violet-50 px-1.5 py-0.5 rounded">
                      {t.label}
                    </span>
                  ))}
                </div>
                <RichEditor
                  value={data.body_html}
                  onChange={v => setData('body_html', v)}
                  minHeight={200}
                />
                {errors.body_html && (
                  <p className="text-red-500 text-[11px] mt-1.5">{errors.body_html}</p>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 pt-0.5 pb-4">
              <Button
                type="button" variant="outline" size="sm"
                className="h-8 text-xs gap-1.5 border-slate-200"
                onClick={() => setPreviewOpen(true)}
              >
                <Eye size={13} /> Preview
              </Button>
              <div className="flex-1" />
              <Link href="/campaigns">
                <Button type="button" variant="outline" size="sm" className="h-8 text-xs border-slate-200">
                  Cancel
                </Button>
              </Link>
              <button
                type="submit"
                disabled={processing}
                className="h-8 px-5 text-[12.5px] font-semibold text-white rounded-lg transition-all hover:opacity-90 disabled:opacity-60"
                style={{ background: 'linear-gradient(135deg,#7C3AED,#4F46E5)', boxShadow: '0 3px 12px rgba(124,58,237,0.3)' }}
              >
                {processing ? 'Saving…' : (isEdit ? 'Update Campaign' : 'Save Campaign')}
              </button>
            </div>
          </form>
        </div>

        <EmailPreviewModal
          open={previewOpen}
          onClose={() => setPreviewOpen(false)}
          subject={data.subject}
          fromName={data.from_name}
          fromEmail={data.from_email}
          body={data.body_html}
        />
      </AppLayout>
    </>
  )
}
