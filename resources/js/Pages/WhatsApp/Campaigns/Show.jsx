import { Head, router } from '@inertiajs/react'
import { useState, useEffect, useRef } from 'react'
import AppLayout from '@/Components/Layout/AppLayout'
import { Button } from '@/Components/ui/button'
import { toast } from 'sonner'
import {
  ArrowLeft, Send, Pause, Play, Copy, CheckCheck, Eye,
  AlertCircle, Users, Clock, MessageSquare, RefreshCw,
} from 'lucide-react'

const STATUS_ICON = {
  pending:     '⏳',
  queued:      '📤',
  sent:        '✓',
  delivered:   '✓✓',
  read:        '👁',
  failed:      '✗',
  undelivered: '✗',
}

const STATUS_COLOR = {
  draft:   'text-slate-500 bg-slate-50',
  sending: 'text-blue-700 bg-blue-50',
  paused:  'text-amber-700 bg-amber-50',
  sent:    'text-emerald-700 bg-emerald-50',
  failed:  'text-red-700 bg-red-50',
}

export default function WhatsappCampaignShow({ campaign: initial, sends: initialSends }) {
  const [campaign, setCampaign]   = useState(initial)
  const [sends, setSends]         = useState(initialSends)
  const [busy, setBusy]           = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const intervalRef = useRef(null)

  const isLive = campaign.status === 'sending'

  const fetchLog = async () => {
    try {
      const res  = await fetch(route('whatsapp.campaigns.log', campaign.id))
      const data = await res.json()
      setCampaign(prev => ({ ...prev, ...data }))
    } catch {}
  }

  useEffect(() => {
    if (isLive) {
      intervalRef.current = setInterval(fetchLog, 3000)
    }
    return () => clearInterval(intervalRef.current)
  }, [isLive])

  const post = (url, label) => {
    setBusy(true)
    router.post(url, {}, {
      onSuccess: () => {
        toast.success(label)
        router.reload({ only: ['campaign'] })
      },
      onError:   () => toast.error('Something went wrong.'),
      onFinish:  () => setBusy(false),
    })
  }

  const refresh = () => {
    setRefreshing(true)
    router.reload({ only: ['campaign', 'sends'], onFinish: () => setRefreshing(false) })
  }

  const pct = campaign.total_recipients > 0
    ? Math.round((campaign.sent_count / campaign.total_recipients) * 100)
    : 0

  return (
    <AppLayout>
      <Head title={campaign.name} />

      <div className="px-4 md:px-8 py-6 max-w-screen-xl mx-auto space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <button onClick={() => router.get(route('whatsapp.campaigns.index'))}
              className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors">
              <ArrowLeft size={16} className="text-slate-500" />
            </button>
            <div>
              <h1 className="text-[18px] font-bold text-slate-800">{campaign.name}</h1>
              <span className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full ${STATUS_COLOR[campaign.status]}`}>
                {campaign.status === 'sending' && <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />}
                {campaign.status}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button onClick={refresh}
              className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors text-slate-400">
              <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
            </button>

            {campaign.status === 'draft' && (
              <Button size="sm" className="h-7 text-[12px] text-white"
                style={{ background: 'linear-gradient(135deg,#25D366,#128C7E)' }}
                disabled={busy}
                onClick={() => post(route('whatsapp.campaigns.send', campaign.id), 'Campaign started!')}>
                <Send size={12} className="mr-1" /> Send
              </Button>
            )}

            {campaign.status === 'sending' && (
              <Button size="sm" className="h-7 text-[12px] bg-amber-500 hover:bg-amber-600 text-white"
                disabled={busy}
                onClick={() => post(route('whatsapp.campaigns.stop', campaign.id), 'Paused.')}>
                <Pause size={12} className="mr-1" /> Pause
              </Button>
            )}

            {campaign.status === 'paused' && (
              <Button size="sm" className="h-7 text-[12px] bg-emerald-600 hover:bg-emerald-700 text-white"
                disabled={busy}
                onClick={() => post(route('whatsapp.campaigns.resume', campaign.id), 'Resumed.')}>
                <Play size={12} className="mr-1" /> Resume
              </Button>
            )}

            {(campaign.status === 'sent' || campaign.status === 'failed') && (
              <Button size="sm" variant="outline" className="h-7 text-[12px]"
                disabled={busy}
                onClick={() => post(route('whatsapp.campaigns.clone', campaign.id), 'Cloned.')}>
                <Copy size={12} className="mr-1" /> Run Again
              </Button>
            )}
          </div>
        </div>

        {/* Stats cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: 'Sent',      value: campaign.sent_count,      icon: Send,      color: 'text-blue-600' },
            { label: 'Delivered', value: campaign.delivered_count, icon: CheckCheck, color: 'text-emerald-600' },
            { label: 'Read',      value: campaign.read_count,      icon: Eye,       color: 'text-violet-600' },
            { label: 'Failed',    value: campaign.failed_count,    icon: AlertCircle, color: 'text-red-500' },
          ].map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="bg-white rounded-xl border border-slate-200 px-4 py-3">
              <div className="flex items-center gap-2">
                <Icon size={14} className={color} />
                <p className="text-[11px] text-slate-500 font-medium">{label}</p>
              </div>
              <p className="text-[22px] font-bold text-slate-800 mt-1">{value}</p>
            </div>
          ))}
        </div>

        {/* Progress bar */}
        {campaign.total_recipients > 0 && (
          <div className="bg-white rounded-xl border border-slate-200 px-5 py-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-[12px] font-medium text-slate-600">
                Progress: {campaign.sent_count} / {campaign.total_recipients}
              </p>
              <p className="text-[12px] font-bold text-slate-700">{pct}%</p>
            </div>
            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${pct}%`,
                  background: 'linear-gradient(90deg,#25D366,#128C7E)',
                }}
              />
            </div>
            {isLive && (
              <p className="text-[11px] text-blue-600 mt-1.5 animate-pulse">
                Live — updating every 3 seconds…
              </p>
            )}
          </div>
        )}

        {/* Message preview */}
        <div className="bg-white rounded-xl border border-slate-200 px-5 py-4">
          <p className="text-[11.5px] font-semibold uppercase tracking-wider text-slate-400 mb-3">Message</p>
          <div className="bg-[#DCF8C6] rounded-xl rounded-tl-none p-3 max-w-sm">
            <p className="text-[13px] text-slate-800 whitespace-pre-wrap">{campaign.message_body}</p>
          </div>
          {campaign.followup_enabled && campaign.followup_body && (
            <div className="mt-3">
              <p className="text-[11px] text-slate-400 mb-1.5 flex items-center gap-1">
                <Clock size={11} /> Follow-up after {campaign.followup_delay_hours}h
              </p>
              <div className="bg-slate-100 rounded-xl rounded-tl-none p-3 max-w-sm">
                <p className="text-[13px] text-slate-700 whitespace-pre-wrap">{campaign.followup_body}</p>
              </div>
            </div>
          )}
        </div>

        {/* Sends table */}
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="px-4 py-2.5 border-b border-slate-100 bg-slate-50">
            <p className="text-[11.5px] font-semibold uppercase tracking-wider text-slate-400">
              Individual Sends ({sends.length})
            </p>
          </div>
          {sends.length === 0 ? (
            <div className="py-10 text-center text-[13px] text-slate-400">
              No messages sent yet.
            </div>
          ) : (
            <table className="w-full text-[12px]">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="text-left px-4 py-2 text-[11px] font-semibold text-slate-400 uppercase tracking-wide">Lead</th>
                  <th className="text-left px-4 py-2 text-[11px] font-semibold text-slate-400 uppercase tracking-wide">Number</th>
                  <th className="text-left px-4 py-2 text-[11px] font-semibold text-slate-400 uppercase tracking-wide">Status</th>
                  <th className="text-left px-4 py-2 text-[11px] font-semibold text-slate-400 uppercase tracking-wide">Type</th>
                  <th className="text-left px-4 py-2 text-[11px] font-semibold text-slate-400 uppercase tracking-wide">Sent</th>
                </tr>
              </thead>
              <tbody>
                {sends.map(s => (
                  <tr key={s.id} className="border-b border-slate-50 hover:bg-slate-50">
                    <td className="px-4 py-2 font-medium text-slate-700">{s.lead_name}</td>
                    <td className="px-4 py-2 text-slate-500 font-mono">{s.to_number}</td>
                    <td className="px-4 py-2">
                      <span className={`font-medium ${s.status === 'failed' || s.status === 'undelivered' ? 'text-red-500' : s.status === 'read' ? 'text-violet-600' : s.status === 'delivered' ? 'text-emerald-600' : 'text-slate-600'}`}>
                        {STATUS_ICON[s.status] ?? '?'} {s.status}
                      </span>
                      {s.error_message && (
                        <p className="text-[10px] text-red-400 mt-0.5">{s.error_message}</p>
                      )}
                    </td>
                    <td className="px-4 py-2 text-slate-500">
                      {s.is_followup ? '↩ Follow-up' : 'Original'}
                    </td>
                    <td className="px-4 py-2 text-slate-400">
                      {s.sent_at ? new Date(s.sent_at).toLocaleString() : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </AppLayout>
  )
}
