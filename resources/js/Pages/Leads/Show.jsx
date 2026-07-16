import { Head, Link, router } from '@inertiajs/react'
import { useState, useMemo } from 'react'
import AppLayout from '@/Components/Layout/AppLayout'
import StatusBadge from '@/Components/Common/StatusBadge'
import PriorityBadge from '@/Components/Common/PriorityBadge'
import LeadAvatar from '@/Components/Common/LeadAvatar'
import ConfirmDialog from '@/Components/Common/ConfirmDialog'
import OutreachChannels from '@/Components/Common/OutreachChannels'
import { Button } from '@/Components/ui/button'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/Components/ui/select'
import {
  Building2, Globe, Link2, MapPin, Mail, Phone,
  DollarSign, Calendar, Clock, Tag, Pencil, Trash2,
  ChevronLeft, MessageSquare, PhoneCall, Send, Star,
  ExternalLink, Activity, Briefcase, Users, UserCheck,
  MousePointerClick, Eye, ArrowRightLeft, ClipboardList,
} from 'lucide-react'
import { toast } from 'sonner'
import { formatDistanceToNow } from 'date-fns'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import usePermissions from '@/Hooks/usePermissions'

const STATUSES = ['new','contacted','qualified','proposal','negotiation','won','lost','unqualified']

// Non-form sources ("csv", "google_sheet", …) get a friendlier label — form
// sources are handled separately since they carry a linked lead_form record.
const humanizeSource = source => {
  switch (source) {
    case 'csv': return 'CSV import'
    case 'google_sheet': return 'Google Sheet'
    case 'manual': return 'Manual'
    default: return source || 'Manual'
  }
}

const CLIENT_STATUSES = [
  { value: 'onboarding', label: 'Onboarding', desc: 'Just getting started' },
  { value: 'active',     label: 'Active',     desc: 'Current paying client' },
  { value: 'inactive',   label: 'Inactive',   desc: 'Paused or on hold' },
  { value: 'churned',    label: 'Churned',    desc: 'No longer a client' },
]

function ConvertModal({ lead, onClose }) {
  const [status, setStatus] = useState('onboarding')
  const [loading, setLoading] = useState(false)

  const csrf = () => document.querySelector('meta[name=csrf-token]')?.content

  const handleConvert = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/leads/${lead.id}/convert`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json', 'X-CSRF-TOKEN': csrf() },
        body: JSON.stringify({ client_status: status }),
      })
      const json = await res.json()
      if (json.ok) {
        toast.success(`${lead.full_name} converted to client!`)
        router.visit(`/clients/${json.client_id}`)
      } else {
        toast.error(json.error ?? 'Conversion failed')
        setLoading(false)
      }
    } catch {
      toast.error('Something went wrong')
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 8 }}
        transition={{ duration: 0.2 }}
        className="relative w-full max-w-md rounded-2xl bg-white shadow-2xl p-6"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start gap-3 mb-5">
          <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
            style={{ background: 'linear-gradient(135deg,#059669,#10b981)' }}>
            <UserCheck size={20} className="text-white" />
          </div>
          <div>
            <h3 className="text-[15px] font-bold text-slate-900">Convert to Client</h3>
            <p className="text-[12.5px] text-slate-500 mt-0.5">
              {lead.full_name} will be marked as a client and added to your client list.
            </p>
          </div>
        </div>

        {/* Status picker */}
        <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">Initial status</p>
        <div className="grid grid-cols-2 gap-2 mb-6">
          {CLIENT_STATUSES.map(s => (
            <button key={s.value}
              onClick={() => setStatus(s.value)}
              className={cn(
                'flex flex-col items-start px-3 py-2.5 rounded-xl border text-left transition-all',
                status === s.value
                  ? 'border-emerald-500 bg-emerald-50 shadow-sm'
                  : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
              )}
            >
              <span className={cn('text-[12.5px] font-semibold', status === s.value ? 'text-emerald-700' : 'text-slate-700')}>
                {s.label}
              </span>
              <span className="text-[11px] text-slate-400 mt-0.5">{s.desc}</span>
            </button>
          ))}
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <button onClick={onClose}
            className="flex-1 h-9 rounded-xl border border-slate-200 text-[13px] font-medium text-slate-600 hover:bg-slate-50 transition-colors">
            Cancel
          </button>
          <button onClick={handleConvert} disabled={loading}
            className="flex-1 h-9 rounded-xl text-[13px] font-semibold text-white transition-all disabled:opacity-60"
            style={{ background: 'linear-gradient(135deg,#059669,#10b981)' }}>
            {loading ? 'Converting…' : 'Convert to Client'}
          </button>
        </div>
      </motion.div>
    </div>
  )
}

const ACT_CFG = {
  note:          { icon: MessageSquare,  cls: 'text-slate-500 bg-slate-100',   label: 'Note' },
  email_sent:    { icon: Send,           cls: 'text-blue-500 bg-blue-50',      label: 'Email' },
  call:          { icon: PhoneCall,      cls: 'text-green-500 bg-green-50',    label: 'Call' },
  status_change: { icon: Star,           cls: 'text-amber-500 bg-amber-50',    label: 'Status' },
  import:        { icon: Tag,            cls: 'text-purple-500 bg-purple-50',  label: 'Import' },
  reassignment:  { icon: ArrowRightLeft, cls: 'text-blue-500 bg-blue-50',      label: 'Reassigned' },
  deletion:      { icon: Trash2,         cls: 'text-red-500 bg-red-50',        label: 'Deleted' },
  whatsapp:      { icon: MessageSquare,  cls: 'text-emerald-500 bg-emerald-50', label: 'WhatsApp' },
}

const glass = {
  background: 'rgba(255,255,255,0.9)',
  backdropFilter: 'blur(12px)',
  border: '1px solid rgba(255,255,255,0.95)',
  boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 4px 20px rgba(0,0,0,0.04)',
}

function InfoRow({ icon: Icon, label, value, href }) {
  if (!value) return null
  return (
    <div className="flex items-center gap-2 py-1.5 min-w-0">
      <Icon size={12} className="text-slate-350 shrink-0" />
      <span className="text-[10.5px] font-semibold text-slate-400 uppercase tracking-wide shrink-0 w-[72px]">{label}</span>
      {href
        ? <a href={href} target="_blank" rel="noopener noreferrer"
            className="text-[12.5px] text-blue-600 hover:underline truncate">{value}</a>
        : <span className="text-[12.5px] text-slate-700 truncate">{value}</span>
      }
    </div>
  )
}

function Card({ title, children, className = '' }) {
  return (
    <div className={cn('rounded-2xl overflow-hidden', className)} style={glass}>
      <div className="px-4 py-2.5 border-b border-slate-100/80">
        <p className="text-[10.5px] font-bold uppercase tracking-[0.12em] text-slate-400">{title}</p>
      </div>
      <div className="px-4 py-2 divide-y divide-slate-50/80">{children}</div>
    </div>
  )
}

function MiniStat({ icon: Icon, label, value, color = 'text-brand-600', bg = 'bg-brand-50' }) {
  return (
    <div className="rounded-xl p-3 flex items-center gap-2.5" style={glass}>
      <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center shrink-0', bg)}>
        <Icon size={14} className={color} strokeWidth={1.75} />
      </div>
      <div className="min-w-0">
        <p className="text-[9.5px] font-bold uppercase tracking-wider text-slate-400 leading-none">{label}</p>
        <p className="text-[14px] font-bold text-slate-800 mt-0.5 leading-none truncate">{value}</p>
      </div>
    </div>
  )
}

function QuickAction({ icon: Icon, label, href, onClick, color = 'text-slate-600' }) {
  const cls = 'flex items-center gap-2 w-full px-2.5 py-1.5 rounded-lg hover:bg-slate-50 transition-colors text-left'
  const inner = (
    <>
      <div className="w-6 h-6 rounded-md bg-slate-100 flex items-center justify-center shrink-0">
        <Icon size={12} className={color} />
      </div>
      <span className="text-[12px] font-medium text-slate-700">{label}</span>
    </>
  )
  if (href) return <a href={href} className={cls}>{inner}</a>
  return <button onClick={onClick} className={cls}>{inner}</button>
}

const EMAIL_STATUS_CFG = {
  sent:         { label: 'Sent',         cls: 'bg-blue-50 text-blue-700',      dot: 'bg-blue-500' },
  opened:       { label: 'Opened',       cls: 'bg-green-50 text-green-700',    dot: 'bg-green-500' },
  clicked:      { label: 'Clicked',      cls: 'bg-brand-50 text-brand-700',  dot: 'bg-brand-500' },
  bounced:      { label: 'Bounced',      cls: 'bg-red-50 text-red-700',        dot: 'bg-red-400' },
  unsubscribed: { label: 'Unsubscribed', cls: 'bg-amber-50 text-amber-700',    dot: 'bg-amber-400' },
  pending:      { label: 'Pending',      cls: 'bg-slate-100 text-slate-500',   dot: 'bg-slate-300' },
  failed:       { label: 'Failed',       cls: 'bg-red-50 text-red-500',        dot: 'bg-red-300' },
}

function stripHtml(html) {
  return (html || '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
}

function EmailTimeline({ emailSends }) {
  const [expanded, setExpanded] = useState({})

  const campaigns = useMemo(() => {
    const map = {}
    emailSends.forEach(es => {
      const cid = es.email_campaign_id ?? 'unknown'
      if (!map[cid]) map[cid] = { campaignId: cid, campaign: es.campaign, sends: [] }
      map[cid].sends.push(es)
    })
    Object.values(map).forEach(g => {
      g.sends.sort((a, b) => {
        if (!a.is_followup && b.is_followup) return -1
        if (a.is_followup && !b.is_followup) return 1
        return (a.followup_step || 0) - (b.followup_step || 0)
      })
    })
    return Object.values(map)
  }, [emailSends])

  const getSubject = (es) => {
    if (!es.is_followup) return es.campaign?.subject || '(No subject)'
    const steps = es.campaign?.followup_steps
    if (Array.isArray(steps) && steps[es.followup_step - 1]?.subject) return steps[es.followup_step - 1].subject
    return es.campaign?.followup_subject || `Follow-up #${es.followup_step}`
  }

  const getBodyPreview = (es) => {
    if (!es.is_followup) return stripHtml(es.campaign?.body_text || es.campaign?.body_html || '')
    const steps = es.campaign?.followup_steps
    if (Array.isArray(steps) && steps[es.followup_step - 1]?.body_html) return stripHtml(steps[es.followup_step - 1].body_html)
    return stripHtml(es.campaign?.followup_body_html || '')
  }

  if (!campaigns.length) return null

  return (
    <div className="space-y-4">
      {campaigns.map(({ campaign, sends, campaignId }) => (
        <div key={campaignId}
          className="rounded-2xl overflow-hidden"
          style={{ ...glass, border: '1px solid rgb(var(--brand2-500) / 0.1)' }}>

          {/* Campaign header */}
          <div className="px-4 py-3 border-b border-slate-100/80"
            style={{ background: 'linear-gradient(135deg,rgb(var(--brand2-500) / 0.06) 0%,transparent 100%)' }}>
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
                style={{ background: 'linear-gradient(135deg,rgb(var(--brand2-500)),rgb(var(--brand-500)))' }}>
                <Mail size={14} className="text-white" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[13px] font-bold text-slate-800 truncate">{campaign?.name ?? '(Deleted campaign)'}</p>
                <p className="text-[10.5px] text-slate-400 mt-0.5">
                  {sends.length} email{sends.length !== 1 ? 's' : ''}{campaign ? ` · from ${campaign.from_email || campaign.from_name}` : ''}
                </p>
              </div>
              <div className="shrink-0 text-right hidden sm:block">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">
                  {sends.filter(s => s.opened_at).length}/{sends.length} opened
                </p>
                <p className="text-[10px] text-slate-300 mt-0.5">
                  {sends.filter(s => s.clicked_at).length} clicked
                </p>
              </div>
            </div>
          </div>

          {/* Email flow tree */}
          <div className="px-4 py-3">
            <div className="relative">
              {/* Vertical connector line */}
              {sends.length > 1 && (
                <div className="absolute left-[13px] top-7 w-px"
                  style={{
                    bottom: '28px',
                    background: 'linear-gradient(to bottom, rgb(var(--brand2-500)) 0%, rgb(var(--brand-500)) 50%, rgb(var(--brand-400)) 100%)',
                    opacity: 0.25,
                  }} />
              )}

              <div className="space-y-3">
                {sends.map((es, idx) => {
                  const subject    = getSubject(es)
                  const preview    = getBodyPreview(es)
                  const isExpanded = expanded[es.id]
                  const cfg        = EMAIL_STATUS_CFG[es.status] ?? { label: es.status, cls: 'bg-slate-50 text-slate-600', dot: 'bg-slate-400' }
                  const isLast     = idx === sends.length - 1

                  return (
                    <div key={es.id} className="flex gap-3 relative">
                      {/* Step dot */}
                      <div className="shrink-0 flex flex-col items-center z-10">
                        <div className={cn(
                          'w-7 h-7 rounded-full flex items-center justify-center ring-2 ring-white shadow-sm',
                          cfg.dot
                        )}>
                          {es.is_followup
                            ? <Send size={11} className="text-white" />
                            : <Mail size={11} className="text-white" />
                          }
                        </div>
                      </div>

                      {/* Email card */}
                      <div className="flex-1 min-w-0 rounded-xl border border-slate-100 bg-white shadow-sm hover:shadow-md transition-shadow overflow-hidden">
                        <div className="px-3 py-2.5">
                          {/* Top row */}
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-1.5 flex-wrap mb-1">
                                <span className="text-[9.5px] font-black text-slate-400 uppercase tracking-widest">
                                  {es.is_followup ? `Follow-up #${es.followup_step}` : 'Initial email'}
                                </span>
                                <span className={cn('text-[10px] font-bold px-1.5 py-0.5 rounded-full', cfg.cls)}>
                                  {cfg.label}
                                </span>
                              </div>
                              <p className="text-[13px] font-semibold text-slate-800 leading-snug truncate">{subject}</p>
                              <p className="text-[11px] text-slate-400 mt-0.5 truncate">→ {es.email_used}</p>
                            </div>
                            {preview && (
                              <button
                                onClick={() => setExpanded(p => ({ ...p, [es.id]: !p[es.id] }))}
                                className="shrink-0 mt-0.5 text-[10.5px] text-brand2-500 hover:text-brand2-700 font-medium transition-colors"
                              >
                                {isExpanded ? '▲ Hide' : '▼ Preview'}
                              </button>
                            )}
                          </div>

                          {/* Tracking bar */}
                          <div className="flex items-center gap-3 mt-2 flex-wrap">
                            {es.sent_at && (
                              <span className="flex items-center gap-1 text-[10.5px] text-slate-400">
                                <Send size={9} />
                                {formatDistanceToNow(new Date(es.sent_at), { addSuffix: true })}
                              </span>
                            )}
                            {es.opened_at ? (
                              <span className="flex items-center gap-1 text-[10.5px] font-medium text-green-600">
                                <Eye size={9} /> Opened {formatDistanceToNow(new Date(es.opened_at), { addSuffix: true })}
                              </span>
                            ) : (
                              <span className="flex items-center gap-1 text-[10.5px] text-slate-300">
                                <Eye size={9} /> Not opened
                              </span>
                            )}
                            {es.clicked_at ? (
                              <span className="flex items-center gap-1 text-[10.5px] font-medium text-brand-600">
                                <MousePointerClick size={9} /> Clicked {formatDistanceToNow(new Date(es.clicked_at), { addSuffix: true })}
                              </span>
                            ) : (
                              <span className="flex items-center gap-1 text-[10.5px] text-slate-300">
                                <MousePointerClick size={9} /> No click
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Expandable body preview */}
                        {isExpanded && preview && (
                          <div className="px-3 py-3 border-t border-slate-50 bg-slate-50/60">
                            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Email body</p>
                            <p className="text-[11.5px] text-slate-600 leading-relaxed line-clamp-8 whitespace-pre-wrap">
                              {preview}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

const FORM_SESSION_STATUS_CFG = {
  in_progress: { label: 'In progress', cls: 'bg-amber-50 text-amber-700', dot: 'bg-amber-400' },
  submitted:   { label: 'Submitted',   cls: 'bg-green-50 text-green-700', dot: 'bg-green-500' },
  abandoned:   { label: 'Abandoned',   cls: 'bg-red-50 text-red-700',     dot: 'bg-red-400' },
}

function FormSessionTimeline({ formSessions }) {
  const groups = useMemo(() => {
    const map = {}
    formSessions.forEach(fs => {
      const fid = fs.lead_form_id ?? 'unknown'
      if (!map[fid]) map[fid] = { formId: fid, formName: fs.lead_form?.name ?? '(Deleted form)', sessions: [] }
      map[fid].sessions.push(fs)
    })
    return Object.values(map)
  }, [formSessions])

  if (!groups.length) return null

  return (
    <div className="space-y-4">
      {groups.map(({ formId, formName, sessions }) => (
        <div key={formId}
          className="rounded-2xl overflow-hidden"
          style={{ ...glass, border: '1px solid rgb(var(--brand2-500) / 0.1)' }}>

          <div className="px-4 py-3 border-b border-slate-100/80"
            style={{ background: 'linear-gradient(135deg,rgb(var(--brand2-500) / 0.06) 0%,transparent 100%)' }}>
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
                style={{ background: 'linear-gradient(135deg,rgb(var(--brand2-500)),rgb(var(--brand-500)))' }}>
                <ClipboardList size={14} className="text-white" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[13px] font-bold text-slate-800 truncate">{formName}</p>
                <p className="text-[10.5px] text-slate-400 mt-0.5">{sessions.length} visit{sessions.length !== 1 ? 's' : ''}</p>
              </div>
            </div>
          </div>

          <div className="px-4 py-3 space-y-3">
            {sessions.map(fs => {
              const cfg = FORM_SESSION_STATUS_CFG[fs.status] ?? { label: fs.status, cls: 'bg-slate-50 text-slate-600', dot: 'bg-slate-400' }
              const fieldDefs    = fs.lead_form?.fields ?? []
              const filledFields = Object.entries(fs.values || {}).filter(([, v]) => v !== null && v !== '')
              const totalFields  = fieldDefs.length
              const percent      = totalFields > 0 ? Math.round((filledFields.length / totalFields) * 100) : null
              const labelFor     = (key) => fieldDefs.find(f => f.key === key)?.label ?? key

              return (
                <div key={fs.id} className="flex gap-3">
                  <div className="shrink-0 flex flex-col items-center z-10">
                    <div className={cn('w-7 h-7 rounded-full flex items-center justify-center ring-2 ring-white shadow-sm', cfg.dot)}>
                      <ClipboardList size={11} className="text-white" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0 rounded-xl border border-slate-100 bg-white shadow-sm px-3 py-2.5">
                    <div className="flex items-center gap-1.5 flex-wrap mb-1">
                      <span className={cn('text-[10px] font-bold px-1.5 py-0.5 rounded-full', cfg.cls)}>{cfg.label}</span>
                      <span className="text-[10.5px] text-slate-400">
                        Started {formatDistanceToNow(new Date(fs.started_at), { addSuffix: true })}
                      </span>
                    </div>
                    {/* Completion progress — only meaningful for sessions that never
                        submitted, since "submitted" already means "done" regardless
                        of whether every optional field was filled. */}
                    {fs.status !== 'submitted' && percent !== null && (
                      <div className="mt-1.5 mb-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[10px] font-semibold text-slate-400">
                            {filledFields.length} of {totalFields} fields completed
                          </span>
                          <span className="text-[10px] font-bold text-slate-500">{percent}%</span>
                        </div>
                        <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden">
                          <div className={cn('h-full rounded-full', cfg.dot)} style={{ width: `${percent}%` }} />
                        </div>
                      </div>
                    )}
                    {filledFields.length > 0 && (
                      <p className="text-[11.5px] text-slate-600 mt-1">
                        Filled in: {filledFields.map(([k]) => labelFor(k)).join(', ')}
                      </p>
                    )}
                    {fs.submitted_at ? (
                      <p className="text-[10.5px] font-medium text-green-600 mt-1 flex items-center gap-1">
                        <Eye size={9} /> Submitted {formatDistanceToNow(new Date(fs.submitted_at), { addSuffix: true })}
                      </p>
                    ) : (
                      <p className="text-[10.5px] text-slate-400 mt-1">
                        Last active {formatDistanceToNow(new Date(fs.last_active_at), { addSuffix: true })}
                      </p>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}

export default function LeadShow({ lead, activities, leadStats, emailSends = [], formSessions = [], assignableUsers = [] }) {
  const [deleting, setDeleting]       = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [changingStatus, setChangingStatus] = useState(false)
  const [convertOpen, setConvertOpen] = useState(false)
  const [assigning, setAssigning] = useState(false)
  const { can } = usePermissions()

  const isClient = lead.status === 'client'

  const handleAssign = (userId) => {
    setAssigning(true)
    router.patch(`/leads/${lead.id}/assign`, { assigned_to: userId === 'unassigned' ? null : userId }, {
      preserveScroll: true,
      onSuccess: () => toast.success('Lead reassigned'),
      onError: () => toast.error('Failed to reassign lead'),
      onFinish: () => setAssigning(false),
    })
  }

  const handleDelete = () => {
    setDeleting(true)
    router.delete(`/leads/${lead.id}`, {
      onSuccess: () => toast.success('Lead deleted'),
      onError: () => { toast.error('Failed to delete'); setDeleting(false); setConfirmOpen(false) },
    })
  }

  const handleStatusChange = (newStatus) => {
    if (newStatus === lead.status) return
    setChangingStatus(true)
    router.patch(`/leads/${lead.id}/status`, { status: newStatus }, {
      preserveScroll: true,
      onSuccess: () => toast.success(`Status → ${newStatus}`),
      onError: () => toast.error('Failed to update status'),
      onFinish: () => setChangingStatus(false),
    })
  }

  const primaryEmail = lead.emails?.find(e => e.is_primary)?.email || lead.emails?.[0]?.email
  const primaryPhone = lead.phones?.find(p => p.is_primary)?.phone || lead.phones?.[0]?.phone

  return (
    <>
      <Head title={lead.full_name} />
      <AppLayout title={lead.full_name}>

        {/* ── Hero banner ─────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          className="relative overflow-hidden rounded-2xl px-6 py-5 mb-4"
          style={{ background: 'linear-gradient(135deg, rgb(var(--brand-ink)) 0%, rgb(var(--brand-800)) 55%, rgb(var(--brand-ink)) 100%)', boxShadow: '0 4px 30px rgb(var(--brand-600) / 0.2)' }}
        >
          <div className="absolute top-0 right-0 w-64 h-64 rounded-full pointer-events-none opacity-[0.12]"
            style={{ background: 'radial-gradient(circle, rgb(var(--brand-600)) 0%, transparent 70%)', transform: 'translate(35%,-55%)' }} />

          <div className="relative flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
            {/* Left — avatar + info */}
            <div className="flex items-center gap-3 sm:gap-4">
              <LeadAvatar name={lead.full_name} size="xl" />
              <div className="min-w-0">
                <h2 className="text-[18px] sm:text-[22px] font-bold text-white leading-tight truncate">{lead.full_name}</h2>
                {(lead.job_title || lead.company) && (
                  <p className="text-white/45 text-[12px] sm:text-[13px] mt-0.5 truncate">
                    {[lead.job_title, lead.company].filter(Boolean).join(' · ')}
                  </p>
                )}
                <div className="flex items-center flex-wrap gap-2 mt-2">
                  <StatusBadge status={lead.status} />
                  <PriorityBadge priority={lead.priority} />
                  {lead.tags?.map(tag => (
                    <span key={tag.id} className="text-[11px] px-2 py-0.5 rounded-full font-semibold text-white"
                      style={{ background: tag.color }}>{tag.name}</span>
                  ))}
                </div>
              </div>
            </div>

            {/* Right — actions */}
            <div className="flex items-center gap-2 shrink-0 flex-wrap">
              <Link href="/leads">
                <Button variant="ghost" size="sm" className="gap-1.5 h-8 text-white/50 hover:text-white hover:bg-white/10 border-0">
                  <ChevronLeft size={14} /> Back
                </Button>
              </Link>
              {isClient && lead.client ? (
                <Link href={`/clients/${lead.client.id}`}>
                  <Button size="sm" className="gap-1.5 h-8 text-[12px] bg-emerald-500/25 hover:bg-emerald-500/35 text-emerald-300 border border-emerald-400/30">
                    <UserCheck size={12} /> View Client
                  </Button>
                </Link>
              ) : (
                <Button size="sm" className="gap-1.5 h-8 text-[12px] bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-400/20"
                  onClick={() => setConvertOpen(true)}>
                  <UserCheck size={12} /> Convert to Client
                </Button>
              )}
              <Link href={`/leads/${lead.id}/edit`}>
                <Button size="sm" className="gap-1.5 h-8 text-[12px] bg-white/10 hover:bg-white/20 text-white border border-white/10">
                  <Pencil size={12} /> Edit
                </Button>
              </Link>
              <Button size="sm" className="gap-1.5 h-8 text-[12px] bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-400/20"
                onClick={() => setConfirmOpen(true)}>
                <Trash2 size={12} /> Delete
              </Button>
            </div>
          </div>
        </motion.div>

        {/* ── Mini stats row ────────────────────────────── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
          <MiniStat icon={DollarSign} label="Deal value"
            value={lead.deal_value ? `${lead.currency} ${Number(lead.deal_value).toLocaleString()}` : 'Not set'}
            color="text-teal-600" bg="bg-teal-50" />
          <MiniStat icon={Mail} label="Emails sent"
            value={leadStats?.emails_sent ?? 0}
            color="text-blue-600" bg="bg-blue-50" />
          <MiniStat icon={Activity} label="Activities"
            value={leadStats?.activities_total ?? 0}
            color="text-brand-600" bg="bg-brand-50" />
          <MiniStat icon={Calendar} label="Days in CRM"
            value={`${leadStats?.days_known ?? 0} days`}
            color="text-amber-600" bg="bg-amber-50" />
        </div>

        {/* ── Main grid ─────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

          {/* Left 2/3 — details */}
          <div className="lg:col-span-2 space-y-3">

            {/* Contact + Company side-by-side */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {(lead.emails?.length > 0 || lead.phones?.length > 0) && (
                <Card title="Contact">
                  {lead.emails?.map(em => (
                    <InfoRow key={em.id} icon={Mail} label={em.type || 'Email'}
                      value={em.email} href={`mailto:${em.email}`} />
                  ))}
                  {lead.phones?.map(ph => (
                    <InfoRow key={ph.id} icon={Phone} label={ph.type || 'Phone'}
                      value={ph.phone} href={`tel:${ph.phone}`} />
                  ))}
                </Card>
              )}

              {(lead.company || lead.website || lead.linkedin_url || lead.city || lead.industry) && (
                <Card title="Company & Location">
                  <InfoRow icon={Building2} label="Company"  value={lead.company} />
                  <InfoRow icon={Globe}    label="Website"   value={lead.website}      href={lead.website} />
                  <InfoRow icon={Link2}    label="LinkedIn"  value={lead.linkedin_url} href={lead.linkedin_url} />
                  <InfoRow icon={MapPin}   label="Location"  value={[lead.city, lead.country].filter(Boolean).join(', ')} />
                  <InfoRow icon={Tag}      label="Industry"  value={lead.industry} />
                </Card>
              )}
            </div>

            {/* Pipeline + Social side-by-side */}
            {(lead.deal_value || lead.last_contacted_at || lead.follow_up_at || lead.social_handles?.filter(h => h.url).length > 0) && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {(lead.deal_value || lead.last_contacted_at || lead.follow_up_at) && (
                  <Card title="Pipeline">
                    <InfoRow icon={DollarSign} label="Deal"
                      value={lead.deal_value ? `${lead.currency} ${Number(lead.deal_value).toLocaleString()}` : null} />
                    <InfoRow icon={Calendar} label="Contacted"
                      value={lead.last_contacted_at ? formatDistanceToNow(new Date(lead.last_contacted_at), { addSuffix: true }) : null} />
                    <InfoRow icon={Clock} label="Follow-up"
                      value={lead.follow_up_at ? formatDistanceToNow(new Date(lead.follow_up_at), { addSuffix: true }) : null} />
                  </Card>
                )}

                {lead.social_handles?.filter(h => h.url).length > 0 && (
                  <Card title="Social Media">
                    {lead.social_handles.filter(h => h.url).map((h, i) => (
                      <InfoRow key={i} icon={ExternalLink} label={h.platform} value={h.url} href={h.url} />
                    ))}
                  </Card>
                )}
              </div>
            )}

            {/* Email flow timeline */}
            {emailSends.length > 0 && (
              <div>
                <p className="text-[10.5px] font-bold uppercase tracking-[0.12em] text-slate-400 mb-2 px-1">
                  Emails sent ({emailSends.length})
                </p>
                <EmailTimeline emailSends={emailSends} />
              </div>
            )}

            {/* Form activity — visits, autosaved fills, and abandonment */}
            {formSessions.length > 0 && (
              <div>
                <p className="text-[10.5px] font-bold uppercase tracking-[0.12em] text-slate-400 mb-2 px-1">
                  Form activity ({formSessions.length})
                </p>
                <FormSessionTimeline formSessions={formSessions} />
              </div>
            )}

            {/* Notes */}
            {lead.notes && (
              <div className="rounded-2xl p-4" style={glass}>
                <p className="text-[10.5px] font-bold uppercase tracking-[0.12em] text-slate-400 mb-2">Notes</p>
                <p className="text-[13px] text-slate-600 whitespace-pre-wrap leading-relaxed">{lead.notes}</p>
              </div>
            )}
          </div>

          {/* Right 1/3 — actions + timeline */}
          <div className="space-y-3">

            {/* Quick actions */}
            <div className="rounded-2xl overflow-hidden" style={glass}>
              <div className="px-4 py-2.5 border-b border-slate-100/80">
                <p className="text-[10.5px] font-bold uppercase tracking-[0.12em] text-slate-400">Quick actions</p>
              </div>
              <div className="px-2 py-1.5">
                {primaryEmail && <QuickAction icon={Mail} label="Send email" href={`mailto:${primaryEmail}`} color="text-blue-500" />}
                {primaryPhone && <QuickAction icon={PhoneCall} label="Call (Twilio)" onClick={() => window.dispatchEvent(new CustomEvent('twilio-dial', { detail: { phoneNumber: primaryPhone } }))} color="text-green-500" />}
                <QuickAction icon={Pencil} label="Edit lead" href={`/leads/${lead.id}/edit`} color="text-brand-500" />
                <QuickAction icon={Briefcase} label="View pipeline" href="/pipeline" color="text-teal-500" />
                <QuickAction icon={Users} label="All leads" href="/leads" color="text-slate-400" />
              </div>
            </div>

            {/* Inline status change */}
            <div className="rounded-2xl p-3" style={glass}>
              <p className="text-[10.5px] font-bold uppercase tracking-[0.12em] text-slate-400 mb-2">Change status</p>
              <Select value={lead.status} onValueChange={handleStatusChange} disabled={changingStatus}>
                <SelectTrigger className="h-9 text-[12.5px] bg-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STATUSES.map(s => (
                    <SelectItem key={s} value={s} className="capitalize text-[12.5px]">{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-[10.5px] text-slate-400 mt-1.5 flex items-center gap-1">
                Source:{' '}
                {lead.lead_form ? (
                  <Link
                    href={`/forms/${lead.lead_form.id}/edit`}
                    className="font-semibold text-brand-600 hover:text-brand-700 inline-flex items-center gap-1 truncate"
                  >
                    <ClipboardList size={11} className="shrink-0" />
                    {lead.lead_form.name}
                  </Link>
                ) : (
                  <span className="font-semibold capitalize text-slate-600">{humanizeSource(lead.source)}</span>
                )}
              </p>
            </div>

            {/* Assigned to */}
            <div className="rounded-2xl p-3" style={glass}>
              <p className="text-[10.5px] font-bold uppercase tracking-[0.12em] text-slate-400 mb-2">Assigned to</p>
              {can('leads.assign') ? (
                <Select value={String(lead.assignee?.id ?? 'unassigned')} onValueChange={handleAssign} disabled={assigning}>
                  <SelectTrigger className="h-9 text-[12.5px] bg-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="unassigned" className="text-[12.5px]">Unassigned</SelectItem>
                    {assignableUsers.map(u => (
                      <SelectItem key={u.id} value={String(u.id)} className="text-[12.5px]">{u.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <p className="text-[12.5px] font-medium text-slate-700">{lead.assignee?.name ?? 'Unassigned'}</p>
              )}
              <p className="text-[10.5px] text-slate-400 mt-1.5">
                Added by <span className="font-semibold text-slate-600">{lead.creator?.name ?? 'Public form / unknown'}</span>
              </p>
            </div>

            {/* Outreach channels */}
            <div className="rounded-2xl overflow-hidden" style={glass}>
              <div className="px-4 py-2.5 border-b border-slate-100/80">
                <p className="text-[10.5px] font-bold uppercase tracking-[0.12em] text-slate-400">Outreach</p>
              </div>
              <div className="px-2 py-1.5">
                <OutreachChannels lead={lead} variant="panel" />
              </div>
            </div>

            {/* Activity timeline */}
            <div className="rounded-2xl overflow-hidden" style={glass}>
              <div className="px-4 py-2.5 border-b border-slate-100/80">
                <p className="text-[10.5px] font-bold uppercase tracking-[0.12em] text-slate-400">
                  Activity timeline
                  {activities?.length > 0 && <span className="ml-1.5 text-brand-500">({activities.length})</span>}
                </p>
              </div>
              <div className="px-4 py-2.5">
                {activities?.length ? (
                  <div className="relative">
                    {/* timeline line */}
                    <div className="absolute left-[11px] top-1 bottom-1 w-px bg-slate-100" />
                    <div className="space-y-3">
                      {activities.map(act => {
                        const cfg = ACT_CFG[act.type] ?? ACT_CFG.note
                        const Icon = cfg.icon
                        return (
                          <div key={act.id} className="flex gap-2.5 relative">
                            <div className={cn('w-5 h-5 rounded-full flex items-center justify-center shrink-0 z-10', cfg.cls)}>
                              <Icon size={10} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-[11.5px] text-slate-700 leading-snug">{act.description}</p>
                              <p className="text-[10px] text-slate-400 mt-0.5">
                                {formatDistanceToNow(new Date(act.created_at), { addSuffix: true })}
                                {act.user?.name && (
                                  <> · <span className="text-slate-500 font-medium">{act.user.name}</span></>
                                )}
                              </p>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-8 gap-2">
                    <Activity size={20} className="text-slate-200" />
                    <p className="text-[12px] text-slate-400">No activity yet</p>
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>

        <ConfirmDialog
          open={confirmOpen}
          onOpenChange={setConfirmOpen}
          title="Delete this lead?"
          description={`${lead.full_name} and all associated data will be permanently removed.`}
          onConfirm={handleDelete}
          loading={deleting}
        />
      </AppLayout>

      <AnimatePresence>
        {convertOpen && <ConvertModal lead={lead} onClose={() => setConvertOpen(false)} />}
      </AnimatePresence>
    </>
  )
}
