import { Head, Link, router } from '@inertiajs/react'
import { useState, useEffect, useRef, useCallback } from 'react'
import AppLayout from '@/Components/Layout/AppLayout'
import LeadAvatar from '@/Components/Common/LeadAvatar'
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card'
import { Button } from '@/Components/ui/button'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from '@/Components/ui/dialog'
import {
  ChevronLeft, Send, Eye, Users, Pencil, Trash2, MousePointerClick,
  Loader2, StopCircle, RefreshCw, Terminal, RotateCcw,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

const STATUS_STYLE = {
  draft:     'bg-gray-100 text-gray-600',
  scheduled: 'bg-blue-50 text-blue-600',
  sending:   'bg-amber-50 text-amber-600',
  sent:      'bg-emerald-50 text-emerald-700',
  paused:    'bg-orange-50 text-orange-600',
}

const SEND_STATUS = {
  pending:  { label: 'Pending',  bg: 'bg-slate-100 text-slate-500' },
  sent:     { label: 'Sent',     bg: 'bg-blue-50 text-blue-600' },
  opened:   { label: 'Opened',   bg: 'bg-emerald-50 text-emerald-700' },
  clicked:  { label: 'Clicked',  bg: 'bg-violet-50 text-violet-700' },
  failed:   { label: 'Failed',   bg: 'bg-red-50 text-red-600' },
  bounced:  { label: 'Bounced',  bg: 'bg-orange-50 text-orange-600' },
}

const LOG_STATUS = {
  pending:  { symbol: '○', color: '#e3b341' },
  sent:     { symbol: '✓', color: '#3fb950' },
  opened:   { symbol: '◎', color: '#79c0ff' },
  clicked:  { symbol: '◈', color: '#d2a8ff' },
  failed:   { symbol: '✗', color: '#f85149' },
  bounced:  { symbol: '⚠', color: '#ffa657' },
}

function StatBox({ label, value, icon: Icon, color }) {
  return (
    <div className="text-center p-4">
      <div className={cn('text-2xl font-bold font-display', color)}>{value}</div>
      <div className="flex items-center justify-center gap-1 mt-1">
        <Icon size={11} className="text-muted-foreground" />
        <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">{label}</span>
      </div>
    </div>
  )
}

function LogLine({ entry }) {
  const s = LOG_STATUS[entry.status] ?? LOG_STATUS.pending
  return (
    <div className="flex items-baseline gap-2 px-3 py-[3px] hover:bg-white/[0.04] rounded-sm">
      <span className="text-[10px] font-mono shrink-0 tabular-nums" style={{ color: '#555d6b' }}>
        {entry.sent_at ?? '--:--:--'}
      </span>
      <span className="text-[12px] font-mono shrink-0 w-4 text-center" style={{ color: s.color }}>
        {s.symbol}
      </span>
      <span className="text-[11px] font-mono truncate" style={{ color: '#cdd9e5', maxWidth: 110 }}>
        {entry.lead_name}
      </span>
      <span className="text-[10px] font-mono truncate flex-1 min-w-0" style={{ color: '#555d6b' }}>
        {entry.email_used}
      </span>
      <span className="text-[10px] font-mono shrink-0" style={{ color: s.color }}>
        {entry.status}
      </span>
    </div>
  )
}

function TerminalPanel({ campaignId, initialStats }) {
  const [logs, setLogs]         = useState([])
  const [stats, setStats]       = useState(initialStats)
  const [stopping, setStopping] = useState(false)
  const [resuming, setResuming] = useState(false)
  const bottomRef               = useRef(null)
  const scrollRef               = useRef(null)
  const pinToBottom             = useRef(true)

  const fetchLog = useCallback(async () => {
    try {
      const res  = await fetch(`/campaigns/${campaignId}/log`)
      const data = await res.json()
      setLogs(data.sends ?? [])
      setStats(data)
    } catch {}
  }, [campaignId])

  useEffect(() => { fetchLog() }, [fetchLog])

  useEffect(() => {
    if (stats.status !== 'sending') return
    const id = setInterval(fetchLog, 2500)
    return () => clearInterval(id)
  }, [stats.status, fetchLog])

  useEffect(() => {
    if (pinToBottom.current) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [logs])

  const handleScroll = () => {
    const el = scrollRef.current
    if (!el) return
    pinToBottom.current = el.scrollTop + el.clientHeight >= el.scrollHeight - 50
  }

  const handleStop = () => {
    setStopping(true)
    router.post(`/campaigns/${campaignId}/stop`, {}, {
      onSuccess: () => { toast.success('Campaign paused'); fetchLog() },
      onError:   (e) => toast.error(Object.values(e)[0] || 'Stop failed'),
      onFinish:  () => setStopping(false),
    })
  }

  const handleResume = () => {
    setResuming(true)
    router.post(`/campaigns/${campaignId}/send`, {}, {
      onSuccess: () => { toast.success('Campaign resumed'); fetchLog() },
      onError:   (e) => toast.error(Object.values(e)[0] || 'Resume failed'),
      onFinish:  () => setResuming(false),
    })
  }

  const isLive   = stats.status === 'sending'
  const isPaused = stats.status === 'paused'
  const progress = stats.total_recipients > 0
    ? Math.min(100, Math.round((stats.sent_count / stats.total_recipients) * 100))
    : 0

  const failed  = logs.filter(l => l.status === 'failed').length
  const pending = logs.filter(l => l.status === 'pending').length

  return (
    <div
      className="bg-[#0d1117] rounded-xl border border-[#30363d] flex flex-col overflow-hidden"
      style={{ height: 'calc(100vh - 88px)', minHeight: 400 }}
    >
      {/* ── macOS title bar ── */}
      <div className="flex items-center gap-2 px-3.5 py-2.5 bg-[#161b22] border-b border-[#30363d] shrink-0 select-none">
        <div className="flex gap-[5px]">
          <div className="w-[11px] h-[11px] rounded-full bg-[#ff5f57]" />
          <div className="w-[11px] h-[11px] rounded-full bg-[#febc2e]" />
          <div className="w-[11px] h-[11px] rounded-full bg-[#28c840]" />
        </div>
        <span className="ml-2 text-[11px] font-mono" style={{ color: '#768390' }}>campaign.log</span>
        <div className="ml-auto flex items-center gap-2.5">
          {isLive && (
            <span className="flex items-center gap-1.5 text-[10px] font-mono" style={{ color: '#3fb950' }}>
              <span className="w-[6px] h-[6px] rounded-full bg-[#3fb950] animate-pulse inline-block" />
              LIVE
            </span>
          )}
          {isPaused && <span className="text-[10px] font-mono" style={{ color: '#ffa657' }}>PAUSED</span>}
          {stats.status === 'sent' && <span className="text-[10px] font-mono" style={{ color: '#3fb950' }}>✓ COMPLETE</span>}
          <button
            onClick={fetchLog}
            className="transition-colors"
            style={{ color: '#555d6b' }}
            onMouseEnter={e => e.target.style.color = '#cdd9e5'}
            onMouseLeave={e => e.target.style.color = '#555d6b'}
          >
            <RefreshCw size={11} />
          </button>
        </div>
      </div>

      {/* ── Progress bar ── */}
      {(isLive || isPaused) && (
        <div className="px-3.5 py-2.5 border-b border-[#30363d] shrink-0">
          <div className="flex justify-between mb-1.5">
            <span className="text-[10px] font-mono" style={{ color: '#555d6b' }}>
              {stats.sent_count} of {stats.total_recipients} sent
            </span>
            <span className="text-[10px] font-mono tabular-nums" style={{ color: isLive ? '#e3b341' : '#768390' }}>
              {progress}%
            </span>
          </div>
          <div className="h-[3px] rounded-full overflow-hidden" style={{ background: '#21262d' }}>
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{
                width: `${progress}%`,
                background: isLive ? '#e3b341' : '#3fb950',
              }}
            />
          </div>
        </div>
      )}

      {/* ── Mini stats ── */}
      <div className="grid grid-cols-3 border-b border-[#30363d] shrink-0">
        {[
          { label: 'sent',    value: stats.sent_count,    color: '#3fb950' },
          { label: 'opened',  value: stats.opened_count,  color: '#79c0ff' },
          { label: 'clicked', value: stats.clicked_count, color: '#d2a8ff' },
        ].map((s, i) => (
          <div
            key={s.label}
            className={cn('text-center py-2.5', i < 2 && 'border-r border-[#30363d]')}
          >
            <p className="text-[17px] font-bold font-mono tabular-nums" style={{ color: s.color }}>
              {s.value}
            </p>
            <p className="text-[9px] font-mono uppercase tracking-widest mt-0.5" style={{ color: '#555d6b' }}>
              {s.label}
            </p>
          </div>
        ))}
      </div>

      {/* ── Action bar ── */}
      <div
        className="flex items-center gap-2 px-3.5 py-2 border-b border-[#30363d] shrink-0"
        style={{ background: '#161b22' }}
      >
        <Terminal size={11} style={{ color: '#555d6b' }} />
        <span className="text-[10px] font-mono mr-auto" style={{ color: '#555d6b' }}>
          {logs.length} recipients{failed > 0 ? ` · ${failed} failed` : ''}{pending > 0 ? ` · ${pending} pending` : ''}
        </span>

        {isPaused && (
          <button
            disabled={resuming}
            onClick={handleResume}
            className="flex items-center gap-1.5 text-[10px] font-mono border rounded px-2 py-1 transition-colors disabled:opacity-40"
            style={{ color: '#3fb950', borderColor: 'rgba(63,185,80,0.3)' }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(63,185,80,0.08)'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
          >
            <RotateCcw size={10} />
            {resuming ? 'resuming...' : '$ resume'}
          </button>
        )}

        {isLive && (
          <button
            disabled={stopping}
            onClick={handleStop}
            className="flex items-center gap-1.5 text-[10px] font-mono border rounded px-2 py-1 transition-colors disabled:opacity-40"
            style={{ color: '#f85149', borderColor: 'rgba(248,81,73,0.3)' }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(248,81,73,0.08)'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
          >
            <StopCircle size={10} />
            {stopping ? 'stopping...' : '$ stop'}
          </button>
        )}
      </div>

      {/* ── Scrollable log ── */}
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto py-2"
        style={{ scrollbarWidth: 'thin', scrollbarColor: '#30363d transparent' }}
      >
        {logs.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-3">
            <Terminal size={24} style={{ color: '#30363d' }} />
            <p className="text-[11px] font-mono" style={{ color: '#555d6b' }}>
              $ waiting for sends...
            </p>
          </div>
        ) : (
          <>
            <div className="px-3 pb-1.5">
              <p className="text-[10px] font-mono" style={{ color: '#555d6b' }}>
                {'# '}campaign · {stats.total_recipients} recipients
              </p>
            </div>
            {logs.map(entry => <LogLine key={entry.id} entry={entry} />)}
          </>
        )}
        <div ref={bottomRef} />
      </div>
    </div>
  )
}

export default function CampaignShow({ campaign, sends }) {
  const [previewOpen, setPreviewOpen]     = useState(false)
  const [confirmSend, setConfirmSend]     = useState(false)
  const [sending, setSending]             = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [deleting, setDeleting]           = useState(false)

  const handleSend = () => {
    setSending(true)
    router.post(`/campaigns/${campaign.id}/send`, {}, {
      onSuccess: () => { toast.success('Campaign queued for sending!'); setConfirmSend(false) },
      onError:   (e) => { toast.error(Object.values(e)[0] || 'Send failed'); setSending(false); setConfirmSend(false) },
      onFinish:  () => setSending(false),
    })
  }

  const handleDelete = () => {
    setDeleting(true)
    router.delete(`/campaigns/${campaign.id}`, {
      onSuccess: () => toast.success('Campaign deleted'),
      onError:   () => { toast.error('Delete failed'); setDeleting(false); setConfirmDelete(false) },
      onFinish:  () => setDeleting(false),
    })
  }

  const handlePageChange = (page) => {
    router.get(`/campaigns/${campaign.id}`, { page }, { preserveState: true, preserveScroll: true })
  }

  const openRate  = campaign.sent_count > 0 ? Math.round((campaign.opened_count  / campaign.sent_count) * 100) : 0
  const clickRate = campaign.sent_count > 0 ? Math.round((campaign.clicked_count / campaign.sent_count) * 100) : 0

  const { data: sendRows, ...pagination } = sends ?? { data: [] }

  const recipientDesc = () => {
    if (campaign.recipient_mode === 'group' && campaign.group_name) return `Group: ${campaign.group_name}`
    if (campaign.recipient_mode === 'filter') return 'Filtered leads'
    return 'All leads'
  }

  const canSend = !['sent', 'sending'].includes(campaign.status)

  return (
    <>
      <Head title={campaign.name} />
      <AppLayout title="Campaign">

        {/* ── Full-width page header ── */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <Link href="/campaigns">
              <Button variant="outline" size="sm" className="h-8 text-xs gap-1 border-slate-200">
                <ChevronLeft size={13} /> Back
              </Button>
            </Link>
            <div>
              <h2 className="text-base font-bold text-foreground">{campaign.name}</h2>
              <div className="flex items-center gap-2 mt-0.5">
                <span className={cn('text-[10px] font-semibold px-2 py-0.5 rounded-full capitalize', STATUS_STYLE[campaign.status] ?? STATUS_STYLE.draft)}>
                  {campaign.status}
                </span>
                {campaign.status === 'sending' && (
                  <span className="flex items-center gap-1 text-[10px] text-amber-600">
                    <Loader2 size={10} className="animate-spin" /> Sending in progress…
                  </span>
                )}
                <span className="text-[10px] text-muted-foreground">{campaign.created_at}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Button variant="outline" size="sm" className="h-8 text-xs gap-1.5 border-slate-200"
              onClick={() => setPreviewOpen(true)}>
              <Eye size={13} /> Preview
            </Button>
            {campaign.status !== 'sent' && campaign.status !== 'sending' && (
              <Link href={`/campaigns/${campaign.id}/edit`}>
                <Button variant="outline" size="sm" className="h-8 text-xs gap-1.5 border-slate-200">
                  <Pencil size={13} /> Edit
                </Button>
              </Link>
            )}
            <Button variant="outline" size="sm"
              className="h-8 text-xs gap-1.5 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
              onClick={() => setConfirmDelete(true)}>
              <Trash2 size={13} /> Delete
            </Button>
            {canSend && (
              <Button size="sm" className="h-8 text-xs gap-1.5 bg-amber-500 hover:bg-amber-600 text-white border-0"
                onClick={() => setConfirmSend(true)}>
                <Send size={13} />
                {campaign.status === 'paused' ? 'Resume' : 'Send Now'}
              </Button>
            )}
          </div>
        </div>

        {/* ── Two-column grid ── */}
        <div className="grid xl:grid-cols-[1fr_360px] gap-4 items-start">

          {/* ── Left column ── */}
          <div className="min-w-0 space-y-3">

            {/* Stats row */}
            {['sent', 'sending', 'paused'].includes(campaign.status) && (
              <Card className="border-slate-200 shadow-none">
                <div className="grid grid-cols-4 divide-x divide-[#e5ddd5]">
                  <StatBox label="Recipients"  value={campaign.total_recipients}  icon={Users}              color="text-foreground" />
                  <StatBox label="Sent"        value={campaign.sent_count}        icon={Send}               color="text-blue-600" />
                  <StatBox label="Open rate"   value={`${openRate}%`}             icon={Eye}                color="text-amber-600" />
                  <StatBox label="Click rate"  value={`${clickRate}%`}            icon={MousePointerClick}  color="text-emerald-600" />
                </div>
                {campaign.status === 'sending' && (
                  <div className="border-t border-slate-100 px-4 py-2 bg-amber-50/50">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1.5 rounded-full bg-slate-200 overflow-hidden">
                        <div
                          className="h-full bg-amber-500 rounded-full transition-all"
                          style={{
                            width: campaign.total_recipients > 0
                              ? `${Math.round((campaign.sent_count / campaign.total_recipients) * 100)}%`
                              : '0%',
                          }}
                        />
                      </div>
                      <span className="text-[11px] text-amber-700 font-medium shrink-0">
                        {campaign.sent_count} / {campaign.total_recipients}
                      </span>
                    </div>
                  </div>
                )}
              </Card>
            )}

            {/* Details */}
            <Card className="border-slate-200 shadow-none">
              <CardHeader className="pb-2 pt-3.5 px-4">
                <CardTitle className="text-xs font-semibold text-foreground uppercase tracking-wider">Details</CardTitle>
              </CardHeader>
              <CardContent className="px-4 pb-4 space-y-2">
                <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-xs">
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Subject</p>
                    <p className="text-foreground mt-0.5">{campaign.subject}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">From</p>
                    <p className="text-foreground mt-0.5">{campaign.from_name} &lt;{campaign.from_email}&gt;</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Recipients</p>
                    <p className="text-foreground mt-0.5 flex items-center gap-1">
                      <Users size={11} />
                      {campaign.total_recipients} leads
                      <span className="text-muted-foreground">({recipientDesc()})</span>
                    </p>
                  </div>
                  {campaign.sent_at && (
                    <div>
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Sent at</p>
                      <p className="text-foreground mt-0.5">{campaign.sent_at}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Per-lead send table */}
            {sendRows.length > 0 && (
              <Card className="border-slate-200 shadow-none">
                <CardHeader className="pb-2 pt-3.5 px-4 flex-row items-center justify-between">
                  <CardTitle className="text-xs font-semibold text-foreground uppercase tracking-wider">
                    Send Log
                  </CardTitle>
                  {pagination.total > 0 && (
                    <span className="text-[10px] text-muted-foreground">{pagination.total} recipients</span>
                  )}
                </CardHeader>
                <div className="overflow-x-auto">
                  <table className="w-full text-[12px]">
                    <thead>
                      <tr style={{ borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
                        <th className="px-4 py-2 text-left text-[10px] font-bold text-slate-400 uppercase tracking-wider">Recipient</th>
                        <th className="px-4 py-2 text-left text-[10px] font-bold text-slate-400 uppercase tracking-wider hidden sm:table-cell">Email</th>
                        <th className="px-4 py-2 text-left text-[10px] font-bold text-slate-400 uppercase tracking-wider">Status</th>
                        <th className="px-4 py-2 text-left text-[10px] font-bold text-slate-400 uppercase tracking-wider hidden md:table-cell">Sent</th>
                        <th className="px-4 py-2 text-left text-[10px] font-bold text-slate-400 uppercase tracking-wider hidden md:table-cell">Opened</th>
                        <th className="px-4 py-2 text-left text-[10px] font-bold text-slate-400 uppercase tracking-wider hidden lg:table-cell">Clicked</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sendRows.map((s, i) => {
                        const st = SEND_STATUS[s.status] || SEND_STATUS.pending
                        return (
                          <tr
                            key={s.id}
                            className="hover:bg-slate-50/60 transition-colors"
                            style={{ borderTop: i === 0 ? 'none' : '1px solid rgba(0,0,0,0.04)' }}
                          >
                            <td className="px-4 py-2.5">
                              <div className="flex items-center gap-2">
                                <LeadAvatar name={s.lead_name} size="sm" />
                                <Link href={`/leads/${s.lead_id}`}
                                  className="font-medium text-slate-700 hover:text-violet-600 transition-colors truncate max-w-[130px]">
                                  {s.lead_name || '—'}
                                </Link>
                              </div>
                            </td>
                            <td className="px-4 py-2.5 hidden sm:table-cell text-slate-400 truncate max-w-[160px]">{s.email_used}</td>
                            <td className="px-4 py-2.5">
                              <span className={cn('text-[10px] font-semibold px-2 py-0.5 rounded-full capitalize', st.bg)}>
                                {st.label}
                              </span>
                            </td>
                            <td className="px-4 py-2.5 hidden md:table-cell text-slate-400">{s.sent_at || '—'}</td>
                            <td className="px-4 py-2.5 hidden md:table-cell text-slate-400">{s.opened_at || '—'}</td>
                            <td className="px-4 py-2.5 hidden lg:table-cell text-slate-400">{s.clicked_at || '—'}</td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>

                  {(pagination.prev_page_url || pagination.next_page_url) && (
                    <div className="flex items-center justify-between px-4 py-2.5 border-t border-slate-100">
                      <span className="text-[11px] text-slate-400">
                        Page {pagination.current_page} of {pagination.last_page}
                      </span>
                      <div className="flex gap-1.5">
                        <Button variant="outline" size="sm" className="h-7 text-xs px-2"
                          disabled={!pagination.prev_page_url}
                          onClick={() => handlePageChange(pagination.current_page - 1)}>
                          Prev
                        </Button>
                        <Button variant="outline" size="sm" className="h-7 text-xs px-2"
                          disabled={!pagination.next_page_url}
                          onClick={() => handlePageChange(pagination.current_page + 1)}>
                          Next
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </Card>
            )}

            {/* Email body */}
            <Card className="border-slate-200 shadow-none">
              <CardHeader className="pb-2 pt-3.5 px-4">
                <CardTitle className="text-xs font-semibold text-foreground uppercase tracking-wider">Email Body</CardTitle>
              </CardHeader>
              <CardContent className="px-4 pb-4">
                <div
                  className="text-xs text-gray-700 leading-relaxed prose prose-sm max-w-none bg-[#faf8f5] rounded-lg p-4 border border-slate-200"
                  dangerouslySetInnerHTML={{ __html: campaign.body_html }}
                />
              </CardContent>
            </Card>
          </div>

          {/* ── Right column: terminal ── */}
          <div className="hidden xl:block sticky top-4">
            <TerminalPanel
              campaignId={campaign.id}
              initialStats={{
                status:           campaign.status,
                sent_count:       campaign.sent_count,
                total_recipients: campaign.total_recipients,
                opened_count:     campaign.opened_count,
                clicked_count:    campaign.clicked_count,
              }}
            />
          </div>
        </div>

        {/* ── Preview modal ── */}
        <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-sm font-semibold">Email Preview</DialogTitle>
            </DialogHeader>
            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <div className="bg-[#faf8f5] border-b border-slate-200 p-4 space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-amber-500 flex items-center justify-center text-white text-xs font-bold shrink-0">
                    {campaign.from_name?.charAt(0)?.toUpperCase() ?? 'S'}
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-foreground">{campaign.from_name}</p>
                    <p className="text-[10px] text-muted-foreground">{campaign.from_email}</p>
                  </div>
                </div>
                <p className="text-sm font-semibold text-foreground">
                  {(campaign.subject || '')
                    .replace(/\{\{name\}\}/g, 'John Doe')
                    .replace(/\{\{first_name\}\}/g, 'John')
                    .replace(/\{\{company\}\}/g, 'Acme Inc.')}
                </p>
              </div>
              <div className="bg-white p-6">
                <div
                  className="text-sm text-gray-700 leading-relaxed prose prose-sm max-w-none"
                  dangerouslySetInnerHTML={{
                    __html: (campaign.body_html || '')
                      .replace(/\{\{name\}\}/g, 'John Doe')
                      .replace(/\{\{first_name\}\}/g, 'John')
                      .replace(/\{\{last_name\}\}/g, 'Doe')
                      .replace(/\{\{company\}\}/g, 'Acme Inc.')
                      .replace(/\{\{email\}\}/g, 'john@acme.com')
                      .replace(/\{\{status\}\}/g, 'qualified'),
                  }}
                />
              </div>
              <div className="bg-[#faf8f5] border-t border-slate-200 px-6 py-3">
                <p className="text-[10px] text-muted-foreground text-center">
                  You're receiving this because you're a contact. · Unsubscribe
                </p>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* ── Send confirmation ── */}
        <Dialog open={confirmSend} onOpenChange={setConfirmSend}>
          <DialogContent className="max-w-sm">
            <DialogHeader>
              <DialogTitle className="text-sm font-semibold">
                {campaign.status === 'paused' ? 'Resume campaign?' : 'Send campaign?'}
              </DialogTitle>
              <DialogDescription className="text-xs">
                {campaign.status === 'paused'
                  ? 'This will resume sending to remaining leads.'
                  : <>This will queue the campaign to send to <span className="font-semibold text-foreground">{campaign.total_recipients} leads</span>. Emails will be sent in batches in the background.</>
                }
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="gap-2">
              <Button variant="outline" size="sm" className="h-8 text-xs border-slate-200" onClick={() => setConfirmSend(false)}>
                Cancel
              </Button>
              <Button size="sm" disabled={sending}
                className="h-8 text-xs gap-1.5 bg-amber-500 hover:bg-amber-600 text-white border-0"
                onClick={handleSend}>
                <Send size={13} /> {sending ? 'Queuing…' : 'Confirm & Send'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* ── Delete confirmation ── */}
        <Dialog open={confirmDelete} onOpenChange={setConfirmDelete}>
          <DialogContent className="max-w-sm">
            <DialogHeader>
              <DialogTitle className="text-sm font-semibold">Delete campaign?</DialogTitle>
              <DialogDescription className="text-xs">
                <span className="font-semibold text-foreground">{campaign.name}</span> will be removed.
                This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="gap-2">
              <Button variant="outline" size="sm" className="h-8 text-xs border-slate-200" onClick={() => setConfirmDelete(false)}>
                Cancel
              </Button>
              <Button size="sm" disabled={deleting}
                className="h-8 text-xs gap-1.5 bg-red-600 hover:bg-red-700 text-white border-0"
                onClick={handleDelete}>
                <Trash2 size={13} /> {deleting ? 'Deleting…' : 'Delete'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

      </AppLayout>
    </>
  )
}
