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
  Loader2, StopCircle, RefreshCw, Terminal, RotateCcw, RotateCw, PauseCircle, FileText,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

const STATUS_STYLE = {
  draft:     'bg-gray-100 text-gray-600',
  scheduled: 'bg-blue-50 text-blue-600',
  sending:   'bg-amber-50 text-amber-600',
  sent:      'bg-emerald-50 text-emerald-700',
  paused:    'bg-orange-50 text-orange-600',
  failed:    'bg-red-50 text-red-600',
}

const SEND_STATUS = {
  queued:   { label: 'Queued',   bg: 'bg-slate-100 text-slate-400' },
  pending:  { label: 'Pending',  bg: 'bg-amber-50 text-amber-600' },
  sent:     { label: 'Sent',     bg: 'bg-blue-50 text-blue-600' },
  opened:   { label: 'Opened',   bg: 'bg-emerald-50 text-emerald-700' },
  clicked:  { label: 'Clicked',  bg: 'bg-violet-50 text-violet-700' },
  failed:   { label: 'Failed',   bg: 'bg-red-50 text-red-600' },
  bounced:  { label: 'Bounced',  bg: 'bg-orange-50 text-orange-600' },
  skipped:  { label: 'Skipped',  bg: 'bg-slate-100 text-slate-500' },
}

const LOG_STATUS = {
  queued:   { symbol: '⧖', color: '#555d6b' },
  pending:  { symbol: '○', color: '#e3b341' },
  sent:     { symbol: '✓', color: '#3fb950' },
  opened:   { symbol: '◎', color: '#79c0ff' },
  clicked:  { symbol: '◈', color: '#d2a8ff' },
  failed:   { symbol: '✗', color: '#f85149' },
  bounced:  { symbol: '⚠', color: '#ffa657' },
  skipped:  { symbol: '—', color: '#555d6b' },
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
    <div className="px-3 py-[3px] hover:bg-white/[0.04] rounded-sm">
      <div className="flex items-baseline gap-2">
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
      {(entry.status === 'failed' || entry.status === 'skipped') && entry.error_message && (
        <div className="pl-[76px] pr-2 pb-0.5">
          <p className="text-[10px] font-mono leading-relaxed break-words" style={{ color: entry.status === 'skipped' ? 'rgba(85,93,107,0.9)' : 'rgba(248,81,73,0.75)' }}>
            └ {entry.error_message}
          </p>
        </div>
      )}
    </div>
  )
}

function TerminalPanel({ logs, stats, onFetch, onStop, onResume, stopping, resuming }) {
  const bottomRef   = useRef(null)
  const scrollRef   = useRef(null)
  const pinToBottom = useRef(true)

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
      style={{ height: 'calc(100dvh - 88px)', minHeight: 400 }}
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
          {stats.status === 'failed' && <span className="text-[10px] font-mono" style={{ color: '#f85149' }}>✗ FAILED</span>}
          <button
            onClick={onFetch}
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
            onClick={onResume}
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
            onClick={onStop}
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
              {isLive ? '$ queuing recipients...' : '$ no sends yet'}
            </p>
            {!isLive && stats.status === 'draft' && (
              <p className="text-[10px] font-mono px-4 text-center" style={{ color: '#30363d' }}>
                click "Send Now" to start
              </p>
            )}
          </div>
        ) : (
          <>
            <div className="px-3 pt-1 pb-2 border-b border-[#21262d] mb-1">
              <p className="text-[10px] font-mono" style={{ color: '#3fb950' }}>
                $ campaign init — {stats.total_recipients} recipients queued
              </p>
            </div>
            {logs.map(entry => <LogLine key={entry.id} entry={entry} />)}
            {stats.status === 'sent' && (
              <div className="px-3 pt-2 mt-1 border-t border-[#21262d]">
                {failed > 0 ? (
                  <p className="text-[10px] font-mono" style={{ color: '#ffa657' }}>
                    $ campaign complete — {failed} failed, fix SMTP and retry
                  </p>
                ) : (
                  <p className="text-[10px] font-mono" style={{ color: '#3fb950' }}>
                    $ campaign complete ✓
                  </p>
                )}
              </div>
            )}
            {stats.status === 'paused' && (
              <div className="px-3 pt-2 mt-1 border-t border-[#21262d]">
                <p className="text-[10px] font-mono" style={{ color: '#ffa657' }}>
                  $ campaign paused — click resume to continue
                </p>
              </div>
            )}
            {stats.status === 'failed' && (
              <div className="px-3 pt-2 mt-1 border-t border-[#21262d]">
                <p className="text-[10px] font-mono" style={{ color: '#f85149' }}>
                  $ campaign failed — all sends failed, see errors above. Fix SMTP and retry.
                </p>
              </div>
            )}
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
  const [stopping, setStopping]                     = useState(false)
  const [resuming, setResuming]                     = useState(false)
  const [stoppingFollowups, setStoppingFollowups]   = useState(false)
  const [resumingFollowups, setResumingFollowups]   = useState(false)
  const [cloning, setCloning]                       = useState(false)
  const [followupEnabled, setFollowupEnabled]       = useState(campaign.followup_enabled ?? false)

  // Single source of truth — fetched from /log, drives stats card, table, and terminal
  const [liveLogs,  setLiveLogs]  = useState([])
  const [liveStats, setLiveStats] = useState({
    status:           campaign.status,
    sent_count:       campaign.sent_count,
    total_recipients: campaign.total_recipients,
    opened_count:     campaign.opened_count,
    clicked_count:    campaign.clicked_count,
  })

  const fetchLog = useCallback(async () => {
    try {
      const res  = await fetch(`/campaigns/${campaign.id}/log`)
      const data = await res.json()
      setLiveLogs(data.sends ?? [])
      setLiveStats(data)
    } catch {}
  }, [campaign.id])

  useEffect(() => { fetchLog() }, [fetchLog])

  // Poll while sending or any recipient is still queued/pending
  const hasActiveSends = liveLogs.some(l => l.status === 'queued' || l.status === 'pending')
  const shouldPoll     = liveStats.status === 'sending' || hasActiveSends

  useEffect(() => {
    if (!shouldPoll) return
    const id = setInterval(fetchLog, 2500)
    return () => clearInterval(id)
  }, [shouldPoll, fetchLog])

  const handleStop = () => {
    setStopping(true)
    router.post(`/campaigns/${campaign.id}/stop`, {}, {
      onSuccess: () => { toast.success('Campaign paused'); fetchLog() },
      onError:   (e) => toast.error(Object.values(e)[0] || 'Stop failed'),
      onFinish:  () => setStopping(false),
    })
  }

  const handleResume = () => {
    setResuming(true)
    router.post(`/campaigns/${campaign.id}/send`, {}, {
      onSuccess: () => { toast.success('Campaign resumed'); fetchLog() },
      onError:   (e) => toast.error(Object.values(e)[0] || 'Resume failed'),
      onFinish:  () => setResuming(false),
    })
  }

  const handleSend = () => {
    setSending(true)
    router.post(`/campaigns/${campaign.id}/send`, {}, {
      onSuccess: () => { toast.success('Campaign queued for sending!'); setConfirmSend(false) },
      onError:   (e) => { toast.error(Object.values(e)[0] || 'Send failed'); setSending(false); setConfirmSend(false) },
      onFinish:  () => setSending(false),
    })
  }

  const handleStopFollowups = () => {
    setStoppingFollowups(true)
    router.post(`/campaigns/${campaign.id}/stop`, {}, {
      onSuccess: () => { toast.success('Follow-ups stopped'); setFollowupEnabled(false) },
      onError:   (e) => toast.error(Object.values(e)[0] || 'Stop failed'),
      onFinish:  () => setStoppingFollowups(false),
    })
  }

  const handleResumeFollowups = () => {
    setResumingFollowups(true)
    router.post(`/campaigns/${campaign.id}/resume-followups`, {}, {
      onSuccess: () => { toast.success('Follow-ups resumed'); setFollowupEnabled(true) },
      onError:   (e) => toast.error(Object.values(e)[0] || 'Resume failed'),
      onFinish:  () => setResumingFollowups(false),
    })
  }

  const handleRunAgain = () => {
    setCloning(true)
    router.post(`/campaigns/${campaign.id}/clone`, {}, {
      onError:  (e) => { toast.error(Object.values(e)[0] || 'Clone failed'); setCloning(false) },
      onFinish: () => setCloning(false),
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

  const openRate  = liveStats.sent_count > 0 ? Math.round((liveStats.opened_count  / liveStats.sent_count) * 100) : 0
  const clickRate = liveStats.sent_count > 0 ? Math.round((liveStats.clicked_count / liveStats.sent_count) * 100) : 0

  // Use live polled rows for the table; fall back to SSR page props on first load
  const tableRows = liveLogs.length > 0 ? liveLogs : (sends?.data ?? [])
  const { ...pagination } = sends ?? {}

  const recipientDesc = () => {
    if (campaign.recipient_mode === 'group' && campaign.group_name) return `Group: ${campaign.group_name}`
    if (campaign.recipient_mode === 'filter') return 'Filtered leads'
    return 'All leads'
  }

  // 'sent' is retryable if there are failed sends (e.g. SMTP was broken)
  const hasRetryableFails = liveStats.status === 'sent' && (campaign.failed_count ?? 0) > 0
  const canSend = !['sending'].includes(liveStats.status) && (liveStats.status !== 'sent' || hasRetryableFails)

  return (
    <>
      <Head title={campaign.name} />
      <AppLayout title="Campaign">

        {/* ── Full-width page header ── */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-4">
          <div className="flex items-center gap-3">
            <Link href="/campaigns">
              <Button variant="outline" size="sm" className="h-8 text-xs gap-1 border-slate-200">
                <ChevronLeft size={13} /> Back
              </Button>
            </Link>
            <div>
              <h2 className="text-base font-bold text-foreground">{campaign.name}</h2>
              <div className="flex items-center gap-2 mt-0.5">
                <span className={cn('text-[10px] font-semibold px-2 py-0.5 rounded-full capitalize', STATUS_STYLE[liveStats.status] ?? STATUS_STYLE.draft)}>
                  {liveStats.status}
                </span>
                {liveStats.status === 'sending' && (
                  <span className="flex items-center gap-1 text-[10px] text-amber-600">
                    <Loader2 size={10} className="animate-spin" /> Sending in progress…
                  </span>
                )}
                <span className="text-[10px] text-muted-foreground">{campaign.created_at}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <Button variant="outline" size="sm" className="h-8 text-xs gap-1.5 border-slate-200"
              onClick={() => setPreviewOpen(true)}>
              <Eye size={13} /> Preview
            </Button>
            {liveStats.status !== 'sent' && liveStats.status !== 'sending' && (
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
            {liveStats.status === 'sent' && followupEnabled && (
              <Button variant="outline" size="sm" disabled={stoppingFollowups}
                className="h-8 text-xs gap-1.5 border-orange-200 text-orange-600 hover:bg-orange-50"
                onClick={handleStopFollowups}>
                <PauseCircle size={13} />
                {stoppingFollowups ? 'Stopping…' : 'Stop Follow-ups'}
              </Button>
            )}
            {liveStats.status === 'sent' && !followupEnabled && (campaign.followup_steps_count > 0 || campaign.followup_subject) && (
              <Button variant="outline" size="sm" disabled={resumingFollowups}
                className="h-8 text-xs gap-1.5 border-emerald-200 text-emerald-600 hover:bg-emerald-50"
                onClick={handleResumeFollowups}>
                <RotateCcw size={13} />
                {resumingFollowups ? 'Resuming…' : 'Resume Follow-ups'}
              </Button>
            )}
            {['sent', 'failed'].includes(liveStats.status) && (
              <Button variant="outline" size="sm" disabled={cloning}
                className="h-8 text-xs gap-1.5 border-slate-200"
                onClick={handleRunAgain}>
                <RotateCw size={13} />
                {cloning ? 'Duplicating…' : 'Run Again'}
              </Button>
            )}
            {canSend && (
              <Button size="sm" className="h-8 text-xs gap-1.5 bg-amber-500 hover:bg-amber-600 text-white border-0"
                onClick={() => setConfirmSend(true)}>
                <Send size={13} />
                {liveStats.status === 'paused'  ? 'Resume' :
                 liveStats.status === 'failed'  ? 'Retry All' :
                 hasRetryableFails              ? `Retry Failed (${campaign.failed_count})` :
                 'Send Now'}
              </Button>
            )}
          </div>
        </div>

        {/* ── Two-column grid ── */}
        <div className="grid grid-cols-1 xl:grid-cols-[1fr_360px] gap-4 items-start">

          {/* ── Left column ── */}
          <div className="min-w-0 space-y-3">

            {/* Stats row */}
            {['sent', 'sending', 'paused', 'failed'].includes(liveStats.status) && (
              <Card className="border-slate-200 shadow-none">
                <div className="grid grid-cols-2 sm:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-[#e5ddd5]">
                  <StatBox label="Recipients"  value={liveStats.total_recipients}  icon={Users}              color="text-foreground" />
                  <StatBox label="Sent"        value={liveStats.sent_count}        icon={Send}               color="text-blue-600" />
                  <StatBox label="Open rate"   value={`${openRate}%`}              icon={Eye}                color="text-amber-600" />
                  <StatBox label="Click rate"  value={`${clickRate}%`}             icon={MousePointerClick}  color="text-emerald-600" />
                </div>
                {liveStats.status === 'sending' && (
                  <div className="border-t border-slate-100 px-4 py-2 bg-amber-50/50">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1.5 rounded-full bg-slate-200 overflow-hidden">
                        <div
                          className="h-full bg-amber-500 rounded-full transition-all"
                          style={{
                            width: liveStats.total_recipients > 0
                              ? `${Math.round((liveStats.sent_count / liveStats.total_recipients) * 100)}%`
                              : '0%',
                          }}
                        />
                      </div>
                      <span className="text-[11px] text-amber-700 font-medium shrink-0">
                        {liveStats.sent_count} / {liveStats.total_recipients}
                      </span>
                    </div>
                  </div>
                )}
              </Card>
            )}

            {/* Attached form */}
            {campaign.form && (
              <Card className="border-slate-200 shadow-none">
                <CardContent className="px-4 py-3 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-violet-50 flex items-center justify-center shrink-0">
                      <FileText size={15} className="text-violet-600" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[12.5px] font-semibold text-slate-800 truncate">{campaign.form.name}</p>
                      <p className="text-[11px] text-slate-400">Linked via <span className="font-mono">{'{{form_link}}'}</span> in this email</p>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-[18px] font-bold text-slate-800 leading-none">{campaign.form_submissions ?? 0}</p>
                    <p className="text-[10px] text-slate-400 uppercase tracking-wide mt-0.5">Submitted</p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Follow-up status banner */}
            {liveStats.status === 'sent' && (campaign.followup_steps_count > 0 || campaign.followup_subject) && (
              <div className={cn(
                'flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs border',
                followupEnabled
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                  : 'bg-slate-50 border-slate-200 text-slate-500',
              )}>
                <RotateCcw size={12} className="shrink-0" />
                {followupEnabled
                  ? <>
                      Follow-up sequence is <strong>active</strong>
                      {campaign.followup_steps_count > 0 && (
                        <> — <strong>{campaign.followup_steps_count}</strong> step{campaign.followup_steps_count !== 1 ? 's' : ''} configured.</>
                      )}
                      {' '}Leads who haven't opened any email will receive follow-ups at their scheduled delays.
                    </>
                  : <>Follow-up sequence is <strong>paused</strong> — click &quot;Resume Follow-ups&quot; to re-enable.</>
                }
              </div>
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
            {tableRows.length > 0 && (
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
                      {tableRows.map((s, i) => {
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
                                <div className="min-w-0">
                                  <Link href={`/leads/${s.lead_id}`}
                                    className="font-medium text-slate-700 hover:text-violet-600 transition-colors truncate max-w-[130px] block">
                                    {s.lead_name || '—'}
                                  </Link>
                                  <span className="text-[9.5px] font-bold text-slate-400 uppercase tracking-widest">
                                    {s.is_followup ? `Follow-up #${s.followup_step}` : 'Initial email'}
                                  </span>
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-2.5 hidden sm:table-cell text-slate-400 truncate max-w-[160px]">{s.email_used}</td>
                            <td className="px-4 py-2.5">
                              <span className={cn('text-[10px] font-semibold px-2 py-0.5 rounded-full capitalize', st.bg)}>
                                {st.label}
                              </span>
                              {s.status === 'failed' && s.error_message && (
                                <p className="text-[10px] text-red-500 mt-1 max-w-[240px] leading-snug" title={s.error_message}>
                                  {s.error_message.length > 110 ? s.error_message.slice(0, 110) + '…' : s.error_message}
                                </p>
                              )}
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
              logs={liveLogs}
              stats={liveStats}
              onFetch={fetchLog}
              onStop={handleStop}
              onResume={handleResume}
              stopping={stopping}
              resuming={resuming}
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
                  You're receiving this because you're a contact.
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
                {campaign.status === 'paused'  ? 'Resume campaign?' :
                 hasRetryableFails             ? 'Retry failed sends?' :
                 campaign.status === 'failed'  ? 'Retry campaign?' :
                 'Send campaign?'}
              </DialogTitle>
              <DialogDescription className="text-xs">
                {campaign.status === 'paused'
                  ? 'This will resume sending to remaining leads.'
                  : hasRetryableFails
                    ? <><span className="font-semibold text-foreground">{campaign.failed_count} failed send{campaign.failed_count !== 1 ? 's' : ''}</span> will be retried. Recipients already delivered to will be skipped.</>
                    : campaign.status === 'failed'
                      ? <>All <span className="font-semibold text-foreground">{campaign.total_recipients} sends</span> will be retried. Fix your SMTP settings before proceeding.</>
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
