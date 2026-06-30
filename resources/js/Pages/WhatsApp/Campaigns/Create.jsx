import { Head, useForm, router } from '@inertiajs/react'
import AppLayout from '@/Components/Layout/AppLayout'
import { Button } from '@/Components/ui/button'
import { Input } from '@/Components/ui/input'
import { Label } from '@/Components/ui/label'
import { Textarea } from '@/Components/ui/textarea'
import { Badge } from '@/Components/ui/badge'
import {
  Select, SelectTrigger, SelectValue, SelectContent, SelectItem,
} from '@/Components/ui/select'
import { toast } from 'sonner'
import { MessageSquare, Users, Filter, FolderOpen, AlertCircle, Info, Clock } from 'lucide-react'
import { cn } from '@/lib/utils'

function Field({ label, error, hint, children }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-[12px] font-medium text-slate-600">{label}</Label>
      {children}
      {hint && !error && <p className="text-[11px] text-slate-400">{hint}</p>}
      {error          && <p className="text-[11px] text-red-500">{error}</p>}
    </div>
  )
}

const TOKENS = ['{{first_name}}', '{{last_name}}', '{{name}}', '{{company}}', '{{email}}', '{{phone}}']

export default function WhatsappCampaignCreate({
  statuses, leadCount, groups, tags,
  hasCredential, fromNumber, campaign,
}) {
  const isEdit = !!campaign

  const { data, setData, post, put, processing, errors } = useForm({
    name:                 campaign?.name ?? '',
    message_body:         campaign?.message_body ?? '',
    recipient_mode:       campaign?.recipient_mode ?? 'all',
    group_id:             campaign?.group_id ?? '',
    filters:              campaign?.filters ?? {},
    followup_enabled:     campaign?.followup_enabled ?? false,
    followup_body:        campaign?.followup_body ?? '',
    followup_delay_hours: campaign?.followup_delay_hours ?? 48,
  })

  const insertToken = (token) => {
    setData('message_body', data.message_body + token)
  }

  const submit = (e) => {
    e.preventDefault()
    if (isEdit) {
      put(route('whatsapp.campaigns.update', campaign.id), {
        onSuccess: () => toast.success('Campaign updated.'),
        onError:   () => toast.error('Please fix the errors below.'),
      })
    } else {
      post(route('whatsapp.campaigns.store'), {
        onError: () => toast.error('Please fix the errors below.'),
      })
    }
  }

  const recipientCount = data.recipient_mode === 'all'
    ? leadCount
    : data.recipient_mode === 'group' && data.group_id
      ? groups.find(g => g.id === +data.group_id)?.leads_count ?? 0
      : 0

  return (
    <AppLayout>
      <Head title={isEdit ? 'Edit WhatsApp Campaign' : 'New WhatsApp Campaign'} />

      <div className="px-4 md:px-8 py-6 max-w-2xl mx-auto space-y-4">
        {/* Header */}
        <div>
          <h1 className="text-[18px] font-bold text-slate-800">
            {isEdit ? 'Edit Campaign' : 'New WhatsApp Campaign'}
          </h1>
          <p className="text-[13px] text-slate-500 mt-0.5">
            {fromNumber
              ? `Sending from: ${fromNumber}`
              : 'Configure WhatsApp credentials in Settings before sending'}
          </p>
        </div>

        {!hasCredential && (
          <div className="flex items-start gap-2.5 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
            <AlertCircle size={15} className="text-amber-500 mt-0.5 shrink-0" />
            <div>
              <p className="text-[13px] font-medium text-amber-800">No WhatsApp account connected</p>
              <p className="text-[12px] text-amber-700 mt-0.5">
                Add your Twilio credentials in{' '}
                <button className="underline" onClick={() => router.get(route('profile.edit'))}>
                  Settings → WhatsApp
                </button>{' '}
                before you can send campaigns.
              </p>
            </div>
          </div>
        )}

        <form onSubmit={submit} className="space-y-4">
          {/* Campaign name */}
          <div className="bg-white rounded-xl border border-slate-200 px-5 py-4 space-y-4">
            <p className="text-[11.5px] font-semibold uppercase tracking-wider text-slate-400">Campaign Details</p>

            <Field label="Campaign name" error={errors.name}>
              <Input value={data.name} onChange={e => setData('name', e.target.value)}
                className="h-8 text-[13px]" placeholder="e.g. June Outreach" />
            </Field>

            <Field label="Message" error={errors.message_body}
              hint="Use tokens to personalise each message">
              <Textarea
                value={data.message_body}
                onChange={e => setData('message_body', e.target.value)}
                rows={5}
                className="text-[13px] resize-none"
                placeholder="Hi {{first_name}}, I wanted to reach out about..."
              />
              <div className="flex flex-wrap gap-1 mt-1.5">
                {TOKENS.map(t => (
                  <button key={t} type="button"
                    onClick={() => insertToken(t)}
                    className="px-2 py-0.5 rounded-md bg-violet-50 text-violet-700 text-[11px] font-mono hover:bg-violet-100 transition-colors">
                    {t}
                  </button>
                ))}
              </div>
            </Field>
          </div>

          {/* Recipients */}
          <div className="bg-white rounded-xl border border-slate-200 px-5 py-4 space-y-4">
            <p className="text-[11.5px] font-semibold uppercase tracking-wider text-slate-400">Recipients</p>

            <Field label="Recipient mode" error={errors.recipient_mode}>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { value: 'all',    icon: Users,      label: 'All leads' },
                  { value: 'group',  icon: FolderOpen, label: 'Group' },
                  { value: 'filter', icon: Filter,     label: 'Filter' },
                ].map(({ value, icon: Icon, label }) => (
                  <button key={value} type="button"
                    onClick={() => setData('recipient_mode', value)}
                    className={cn(
                      'flex flex-col items-center gap-1 py-3 rounded-lg border-2 text-[12px] font-medium transition-all',
                      data.recipient_mode === value
                        ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                        : 'border-slate-200 text-slate-600 hover:border-slate-300'
                    )}>
                    <Icon size={16} />
                    {label}
                  </button>
                ))}
              </div>
            </Field>

            {data.recipient_mode === 'group' && (
              <Field label="Select group" error={errors.group_id}>
                <Select value={String(data.group_id)} onValueChange={v => setData('group_id', v)}>
                  <SelectTrigger className="h-8 text-[13px]">
                    <SelectValue placeholder="Choose a group…" />
                  </SelectTrigger>
                  <SelectContent>
                    {groups.map(g => (
                      <SelectItem key={g.id} value={String(g.id)}>
                        {g.name} ({g.leads_count} leads)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
            )}

            {data.recipient_mode === 'filter' && (
              <Field label="Filter by status" error={errors['filters.status']}>
                <Select
                  value={data.filters?.status ?? ''}
                  onValueChange={v => setData('filters', { ...data.filters, status: v })}>
                  <SelectTrigger className="h-8 text-[13px]">
                    <SelectValue placeholder="Any status" />
                  </SelectTrigger>
                  <SelectContent>
                    {statuses.map(s => (
                      <SelectItem key={s} value={s}>{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
            )}

            <div className="flex items-center gap-2 bg-slate-50 rounded-lg px-3 py-2">
              <Info size={13} className="text-slate-400 shrink-0" />
              <p className="text-[12px] text-slate-600">
                Only leads with a WhatsApp number will receive this message.
                {data.recipient_mode === 'all' && ` Estimated: up to ${leadCount} leads.`}
                {data.recipient_mode === 'group' && ` Estimated: ${recipientCount} leads.`}
              </p>
            </div>
          </div>

          {/* Follow-up */}
          <div className="bg-white rounded-xl border border-slate-200 px-5 py-4 space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-[11.5px] font-semibold uppercase tracking-wider text-slate-400">Automated Follow-up</p>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox"
                  checked={data.followup_enabled}
                  onChange={e => setData('followup_enabled', e.target.checked)}
                  className="rounded" />
                <span className="text-[13px] text-slate-600">Enable follow-up</span>
              </label>
            </div>

            {data.followup_enabled && (
              <>
                <Field label="Delay before follow-up" error={errors.followup_delay_hours}>
                  <Select
                    value={String(data.followup_delay_hours)}
                    onValueChange={v => setData('followup_delay_hours', +v)}>
                    <SelectTrigger className="h-8 text-[13px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="24">24 hours</SelectItem>
                      <SelectItem value="48">48 hours</SelectItem>
                      <SelectItem value="72">72 hours</SelectItem>
                      <SelectItem value="168">7 days</SelectItem>
                    </SelectContent>
                  </Select>
                </Field>

                <Field label="Follow-up message" error={errors.followup_body}
                  hint="Only sent to leads who did not reply to the original message">
                  <Textarea
                    value={data.followup_body}
                    onChange={e => setData('followup_body', e.target.value)}
                    rows={4}
                    className="text-[13px] resize-none"
                    placeholder="Hi {{first_name}}, just following up on my previous message…"
                  />
                </Field>
              </>
            )}
          </div>

          {/* Submit */}
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" className="h-8 text-[13px]"
              onClick={() => router.get(route('whatsapp.campaigns.index'))}>
              Cancel
            </Button>
            <button type="submit" disabled={processing}
              className="h-8 px-5 text-[13px] font-semibold text-white rounded-lg transition-all hover:opacity-90 disabled:opacity-50"
              style={{ background: 'linear-gradient(135deg,#25D366,#128C7E)' }}>
              {processing ? 'Saving…' : isEdit ? 'Save Changes' : 'Create Campaign'}
            </button>
          </div>
        </form>
      </div>
    </AppLayout>
  )
}
