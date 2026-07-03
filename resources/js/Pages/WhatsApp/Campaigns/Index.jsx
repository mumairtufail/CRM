import { Head, router } from '@inertiajs/react'
import { useState } from 'react'
import AppLayout from '@/Components/Layout/AppLayout'
import { Button } from '@/Components/ui/button'
import { Badge } from '@/Components/ui/badge'
import { toast } from 'sonner'
import {
  Plus, Send, Pause, Play, Copy, Trash2, MessageSquare,
  CheckCheck, Eye, AlertCircle, Clock, Users, Lock,
} from 'lucide-react'

const STATUS_COLOR = {
  draft:   'bg-slate-100 text-slate-600',
  sending: 'bg-blue-100 text-blue-700',
  paused:  'bg-amber-100 text-amber-700',
  sent:    'bg-emerald-100 text-emerald-700',
  failed:  'bg-red-100 text-red-700',
}

function CampaignActions({ campaign }) {
  const [busy, setBusy] = useState(false)

  const post = (url, label) => {
    setBusy(true)
    router.post(url, {}, {
      onSuccess: () => toast.success(label),
      onError:   () => toast.error('Something went wrong.'),
      onFinish:  () => setBusy(false),
    })
  }

  const del = () => {
    if (!confirm(`Delete "${campaign.name}"?`)) return
    router.delete(route('whatsapp.campaigns.destroy', campaign.id), {
      onSuccess: () => toast.success('Deleted.'),
    })
  }

  return (
    <div className="flex items-center gap-1.5 flex-wrap">
      {campaign.status === 'draft' && (
        <>
          <Button size="sm" variant="outline" className="h-7 text-[12px]"
            onClick={() => router.get(route('whatsapp.campaigns.edit', campaign.id))}>
            Edit
          </Button>
          <Button size="sm" className="h-7 text-[12px] bg-emerald-600 hover:bg-emerald-700 text-white"
            disabled={busy}
            onClick={() => post(route('whatsapp.campaigns.send', campaign.id), 'Campaign started!')}>
            <Send size={12} className="mr-1" /> Send
          </Button>
        </>
      )}

      {campaign.status === 'sending' && (
        <Button size="sm" className="h-7 text-[12px] bg-amber-500 hover:bg-amber-600 text-white"
          disabled={busy}
          onClick={() => post(route('whatsapp.campaigns.stop', campaign.id), 'Campaign paused.')}>
          <Pause size={12} className="mr-1" /> Pause
        </Button>
      )}

      {campaign.status === 'paused' && (
        <Button size="sm" className="h-7 text-[12px] bg-emerald-600 hover:bg-emerald-700 text-white"
          disabled={busy}
          onClick={() => post(route('whatsapp.campaigns.resume', campaign.id), 'Campaign resumed.')}>
          <Play size={12} className="mr-1" /> Resume
        </Button>
      )}

      {campaign.status === 'sent' && campaign.followup_enabled && (
        <Button size="sm" className="h-7 text-[12px] bg-amber-500 hover:bg-amber-600 text-white"
          disabled={busy}
          onClick={() => post(route('whatsapp.campaigns.stop', campaign.id), 'Follow-ups stopped.')}>
          <Pause size={12} className="mr-1" /> Stop Follow-ups
        </Button>
      )}

      {campaign.status === 'sent' && !campaign.followup_enabled && campaign.followup_body && (
        <Button size="sm" className="h-7 text-[12px] bg-emerald-600 hover:bg-emerald-700 text-white"
          disabled={busy}
          onClick={() => post(route('whatsapp.campaigns.resume', campaign.id), 'Follow-ups re-enabled.')}>
          <Play size={12} className="mr-1" /> Resume Follow-ups
        </Button>
      )}

      {(campaign.status === 'sent' || campaign.status === 'failed') && (
        <Button size="sm" variant="outline" className="h-7 text-[12px]"
          disabled={busy}
          onClick={() => post(route('whatsapp.campaigns.clone', campaign.id), 'Campaign cloned.')}>
          <Copy size={12} className="mr-1" /> Run Again
        </Button>
      )}

      <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-red-400 hover:text-red-600 hover:bg-red-50"
        onClick={del}>
        <Trash2 size={13} />
      </Button>
    </div>
  )
}

function LockedState() {
  return (
    <div className="flex items-center justify-center py-20">
      <div className="text-center max-w-sm">
        <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
          <Lock size={22} className="text-slate-400" />
        </div>
        <p className="text-[15px] font-semibold text-slate-700">WhatsApp isn't active on your account yet</p>
        <p className="text-[13px] text-slate-500 mt-1.5 leading-relaxed">
          Contact your account manager to enable WhatsApp messaging for your workspace.
        </p>
      </div>
    </div>
  )
}

export default function WhatsappCampaignsIndex({ campaigns, enabled }) {
  if (!enabled) {
    return (
      <AppLayout>
        <Head title="WhatsApp Campaigns" />
        <LockedState />
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      <Head title="WhatsApp Campaigns" />

      <div className="space-y-4 max-w-screen-xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-[18px] font-bold text-slate-800">WhatsApp Campaigns</h1>
            <p className="text-[13px] text-slate-500 mt-0.5">Send bulk WhatsApp messages to your leads</p>
          </div>
          <Button onClick={() => router.get(route('whatsapp.campaigns.create'))}
            className="h-8 text-[13px] text-white"
            style={{ background: 'linear-gradient(135deg,#25D366,#128C7E)' }}>
            <Plus size={14} className="mr-1.5" /> New Campaign
          </Button>
        </div>

        {/* Campaign list */}
        {campaigns.length === 0 ? (
          <div className="rounded-xl border border-slate-200 bg-white py-16 text-center">
            <MessageSquare size={32} className="mx-auto text-slate-300 mb-3" />
            <p className="text-[14px] font-medium text-slate-500">No WhatsApp campaigns yet</p>
            <p className="text-[12px] text-slate-400 mt-1">Create your first campaign to start reaching leads on WhatsApp</p>
            <Button className="mt-4 h-8 text-[13px] text-white"
              style={{ background: 'linear-gradient(135deg,#25D366,#128C7E)' }}
              onClick={() => router.get(route('whatsapp.campaigns.create'))}>
              <Plus size={13} className="mr-1" /> Create Campaign
            </Button>
          </div>
        ) : (
          <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
            <table className="w-full text-[13px]">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50">
                  <th className="text-left px-4 py-2.5 text-[11px] font-semibold text-slate-500 uppercase tracking-wide">Campaign</th>
                  <th className="text-left px-4 py-2.5 text-[11px] font-semibold text-slate-500 uppercase tracking-wide">Status</th>
                  <th className="text-right px-4 py-2.5 text-[11px] font-semibold text-slate-500 uppercase tracking-wide">Sent</th>
                  <th className="text-right px-4 py-2.5 text-[11px] font-semibold text-slate-500 uppercase tracking-wide">Delivered</th>
                  <th className="text-right px-4 py-2.5 text-[11px] font-semibold text-slate-500 uppercase tracking-wide">Read</th>
                  <th className="text-right px-4 py-2.5 text-[11px] font-semibold text-slate-500 uppercase tracking-wide">Failed</th>
                  <th className="px-4 py-2.5"></th>
                </tr>
              </thead>
              <tbody>
                {campaigns.map((c, i) => (
                  <tr key={c.id}
                    className={`border-b border-slate-50 hover:bg-slate-50 transition-colors ${i % 2 === 0 ? '' : 'bg-slate-50/40'}`}>
                    <td className="px-4 py-3">
                      <button className="text-left"
                        onClick={() => router.get(route('whatsapp.campaigns.show', c.id))}>
                        <p className="font-medium text-slate-800 hover:text-violet-700 transition-colors">{c.name}</p>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          <Users size={10} className="inline mr-0.5" />
                          {c.total_recipients} recipients
                          {c.sent_at && <> · {c.sent_at}</>}
                        </p>
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold ${STATUS_COLOR[c.status] || STATUS_COLOR.draft}`}>
                        {c.status === 'sending' && <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse mr-1" />}
                        {c.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className="font-medium text-slate-700">{c.sent_count}</span>
                      <span className="text-slate-400"> / {c.total_recipients}</span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className="text-emerald-600 font-medium flex items-center justify-end gap-0.5">
                        <CheckCheck size={13} /> {c.delivered_count}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className="text-blue-600 font-medium flex items-center justify-end gap-0.5">
                        <Eye size={13} /> {c.read_count}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className={`font-medium flex items-center justify-end gap-0.5 ${c.failed_count > 0 ? 'text-red-500' : 'text-slate-300'}`}>
                        <AlertCircle size={13} /> {c.failed_count}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <CampaignActions campaign={c} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AppLayout>
  )
}
