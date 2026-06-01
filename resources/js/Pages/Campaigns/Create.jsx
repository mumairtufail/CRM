import { Head, Link, useForm, router } from '@inertiajs/react'
import { useState } from 'react'
import AppLayout from '@/Components/Layout/AppLayout'
import { Button } from '@/Components/ui/button'
import { Input } from '@/Components/ui/input'
import { Label } from '@/Components/ui/label'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/Components/ui/select'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle
} from '@/Components/ui/dialog'
import { ChevronLeft, Eye, Users } from 'lucide-react'
import { toast } from 'sonner'
import RichEditor from '@/Components/Common/RichEditor'

const TEMPLATES = {
  blank: { name: 'Blank', body: '' },
  intro: {
    name: 'Introduction',
    body: `<p>Hi {{name}},</p><p>I wanted to reach out and introduce myself. I'm [Your Name] from [Your Company].</p><p>We help businesses like {{company}} achieve [outcome] through [your solution].</p><p>I'd love to schedule a quick 15-minute call to learn more about your goals. Would any of these times work for you?</p><p>Looking forward to connecting,<br>[Your Name]</p>`,
  },
  followup: {
    name: 'Follow-up',
    body: `<p>Hi {{name}},</p><p>I'm following up on my previous message. I know you're busy, so I'll keep this brief.</p><p>I believe we can help {{company}} with [specific value proposition]. Many companies in [industry] have seen [result] after working with us.</p><p>Would you have 15 minutes this week to connect?</p><p>Best,<br>[Your Name]</p>`,
  },
  promo: {
    name: 'Promotion',
    body: `<p>Hi {{name}},</p><p>We have an exciting update we'd love to share with you.</p><p>[Describe your offer or announcement here]</p><p>This offer is available until [date]. Reply to this email or click the button below to learn more.</p><p>Best regards,<br>[Your Name]</p>`,
  },
}

function Field({ label, error, hint, children }) {
  return (
    <div className="space-y-1">
      <Label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">{label}</Label>
      {children}
      {hint && <p className="text-[10.5px] text-slate-400">{hint}</p>}
      {error && <p className="text-red-500 text-[11px]">{error}</p>}
    </div>
  )
}

function FormCard({ title, action, children }) {
  return (
    <div className="form-card">
      <div className="flex items-center justify-between px-4 py-3"
        style={{ borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
        <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">{title}</p>
        {action}
      </div>
      <div className="px-4 py-3 space-y-3">{children}</div>
    </div>
  )
}

function EmailPreviewModal({ open, onClose, subject, fromName, fromEmail, body }) {
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
            <p className="text-[13px] font-semibold text-slate-800">{subject || '(no subject)'}</p>
          </div>
          <div className="bg-white px-5 py-4">
            {body ? (
              <div
                className="tiptap-body text-[13px] text-slate-700 leading-relaxed prose prose-sm max-w-none"
                dangerouslySetInnerHTML={{
                  __html: body
                    .replace(/\{\{name\}\}/g, 'John Doe')
                    .replace(/\{\{first_name\}\}/g, 'John')
                    .replace(/\{\{last_name\}\}/g, 'Doe')
                    .replace(/\{\{company\}\}/g, 'Acme Inc.')
                    .replace(/\{\{email\}\}/g, 'john@acme.com')
                    .replace(/\{\{phone\}\}/g, '+1 555-0100')
                    .replace(/\{\{status\}\}/g, 'qualified'),
                }}
              />
            ) : (
              <p className="text-[12px] text-slate-400 italic">No body content yet.</p>
            )}
          </div>
          <div className="px-5 py-2.5 text-center" style={{ background: '#f8f8f8', borderTop: '1px solid rgba(0,0,0,0.07)' }}>
            <p className="text-[10.5px] text-slate-400">Tokens shown with sample data</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default function CampaignCreate({ statuses, leadCount }) {
  const [previewOpen, setPreviewOpen] = useState(false)
  const [recipientCount, setRecipientCount] = useState(leadCount ?? 0)

  const { data, setData, post, processing, errors } = useForm({
    name: '', subject: '', from_name: '', from_email: '',
    body_html: '',
    filters: { status: '' },
  })

  const updateFilter = (key, val) => {
    const filters = { ...data.filters, [key]: val || '' }
    setData('filters', filters)
    router.get('/campaigns/recipient-count', { filters }, {
      preserveState: true, replace: true,
      onSuccess: page => { if (page.props?.count != null) setRecipientCount(page.props.count) },
    })
  }

  const submit = e => {
    e.preventDefault()
    post('/campaigns', { onError: () => toast.error('Please fix the errors below') })
  }

  return (
    <>
      <Head title="New Campaign" />
      <AppLayout title="New Campaign">
        <div className="max-w-4xl">

          {/* Page header */}
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-[17px] font-bold text-slate-800 tracking-tight">New Campaign</h2>
              <p className="text-[12.5px] text-slate-500 mt-0.5">Configure and compose your email campaign</p>
            </div>
            <Link href="/campaigns">
              <Button variant="outline" size="sm" className="h-8 text-xs gap-1 border-slate-200">
                <ChevronLeft size={13} /> Back
              </Button>
            </Link>
          </div>

          <form onSubmit={submit} className="space-y-3">

            {/* Sender */}
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
              <Field label="Subject line" error={errors.subject}>
                <Input value={data.subject} onChange={e => setData('subject', e.target.value)}
                  className="h-8 text-[13px]" placeholder="Quick question about {{company}}" />
              </Field>
            </FormCard>

            {/* Recipients */}
            <FormCard
              title="Recipients"
              action={
                <div className="flex items-center gap-1.5 text-[12px] font-semibold text-violet-700">
                  <Users size={12} />
                  {recipientCount} leads
                </div>
              }
            >
              <Field label="Filter by status" hint="Leave blank to send to all leads">
                <Select
                  value={data.filters.status || 'all'}
                  onValueChange={v => updateFilter('status', v === 'all' ? '' : v)}
                >
                  <SelectTrigger className="h-8 text-[13px]">
                    <SelectValue placeholder="All leads" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all" className="text-xs">All leads ({leadCount})</SelectItem>
                    {statuses?.map(s => (
                      <SelectItem key={s} value={s} className="capitalize text-xs">{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
            </FormCard>

            {/* Email body */}
            <div className="form-card">
              <div className="flex items-center justify-between px-4 py-3"
                style={{ borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
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
                {processing ? 'Saving…' : 'Save Campaign'}
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
