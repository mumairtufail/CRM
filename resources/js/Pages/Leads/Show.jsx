import { Head, Link, router } from '@inertiajs/react'
import { useState } from 'react'
import AppLayout from '@/Components/Layout/AppLayout'
import StatusBadge from '@/Components/Common/StatusBadge'
import PriorityBadge from '@/Components/Common/PriorityBadge'
import LeadAvatar from '@/Components/Common/LeadAvatar'
import ConfirmDialog from '@/Components/Common/ConfirmDialog'
import { Button } from '@/Components/ui/button'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/Components/ui/select'
import {
  Building2, Globe, Link2, MapPin, Mail, Phone,
  DollarSign, Calendar, Clock, Tag, Pencil, Trash2,
  ChevronLeft, MessageSquare, PhoneCall, Send, Star,
  ExternalLink, Activity, Briefcase, Users, UserCheck,
} from 'lucide-react'
import { toast } from 'sonner'
import { formatDistanceToNow } from 'date-fns'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'

const STATUSES = ['new','contacted','qualified','proposal','negotiation','won','lost','unqualified']

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
  note:          { icon: MessageSquare, cls: 'text-slate-500 bg-slate-100',   label: 'Note' },
  email_sent:    { icon: Send,          cls: 'text-blue-500 bg-blue-50',      label: 'Email' },
  call:          { icon: PhoneCall,     cls: 'text-green-500 bg-green-50',    label: 'Call' },
  status_change: { icon: Star,          cls: 'text-amber-500 bg-amber-50',    label: 'Status' },
  import:        { icon: Tag,           cls: 'text-purple-500 bg-purple-50',  label: 'Import' },
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
    <div className="flex items-start gap-3 py-2.5">
      <div className="w-7 h-7 rounded-lg bg-slate-50 flex items-center justify-center shrink-0 mt-0.5">
        <Icon size={13} className="text-slate-400" />
      </div>
      <div className="min-w-0">
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{label}</p>
        {href
          ? <a href={href} target="_blank" rel="noopener noreferrer"
              className="text-[13px] text-blue-600 hover:underline truncate block mt-0.5">{value}</a>
          : <p className="text-[13px] text-slate-700 truncate mt-0.5">{value}</p>
        }
      </div>
    </div>
  )
}

function Card({ title, children, className = '' }) {
  return (
    <div className={cn('rounded-2xl overflow-hidden', className)} style={glass}>
      <div className="px-4 py-3 border-b border-slate-100/80">
        <p className="text-[10.5px] font-bold uppercase tracking-[0.12em] text-slate-400">{title}</p>
      </div>
      <div className="px-4 py-1 divide-y divide-slate-50">{children}</div>
    </div>
  )
}

function MiniStat({ icon: Icon, label, value, color = 'text-violet-600', bg = 'bg-violet-50' }) {
  return (
    <div className="rounded-xl p-3.5 flex items-center gap-3" style={glass}>
      <div className={cn('w-9 h-9 rounded-xl flex items-center justify-center shrink-0', bg)}>
        <Icon size={16} className={color} strokeWidth={1.75} />
      </div>
      <div className="min-w-0">
        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 leading-none">{label}</p>
        <p className="text-[15px] font-bold text-slate-800 mt-0.5 leading-none truncate">{value}</p>
      </div>
    </div>
  )
}

function QuickAction({ icon: Icon, label, href, onClick, color = 'text-slate-600' }) {
  const cls = 'flex items-center gap-2.5 w-full px-3 py-2.5 rounded-xl hover:bg-slate-50 transition-colors text-left'
  const inner = (
    <>
      <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
        <Icon size={13} className={color} />
      </div>
      <span className="text-[12.5px] font-medium text-slate-700">{label}</span>
    </>
  )
  if (href) return <a href={href} className={cls}>{inner}</a>
  return <button onClick={onClick} className={cls}>{inner}</button>
}

export default function LeadShow({ lead, activities, leadStats }) {
  const [deleting, setDeleting]       = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [changingStatus, setChangingStatus] = useState(false)
  const [convertOpen, setConvertOpen] = useState(false)

  const isClient = lead.status === 'client'

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
          style={{ background: 'linear-gradient(135deg, #1A1628 0%, #2D1B6B 55%, #1A1628 100%)', boxShadow: '0 4px 30px rgba(124,58,237,0.2)' }}
        >
          <div className="absolute top-0 right-0 w-64 h-64 rounded-full pointer-events-none opacity-[0.12]"
            style={{ background: 'radial-gradient(circle, #7C3AED 0%, transparent 70%)', transform: 'translate(35%,-55%)' }} />

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
            color="text-violet-600" bg="bg-violet-50" />
          <MiniStat icon={Calendar} label="Days in CRM"
            value={`${leadStats?.days_known ?? 0} days`}
            color="text-amber-600" bg="bg-amber-50" />
        </div>

        {/* ── Main grid ─────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

          {/* Left 2/3 — details */}
          <div className="lg:col-span-2 space-y-3">

            {/* Contact */}
            {(lead.emails?.length > 0 || lead.phones?.length > 0) && (
              <Card title="Contact">
                {lead.emails?.map(em => (
                  <InfoRow key={em.id} icon={Mail} label={`Email · ${em.type}`}
                    value={em.email} href={`mailto:${em.email}`} />
                ))}
                {lead.phones?.map(ph => (
                  <InfoRow key={ph.id} icon={Phone} label={`Phone · ${ph.type}`}
                    value={ph.phone} href={`tel:${ph.phone}`} />
                ))}
              </Card>
            )}

            {/* Company */}
            {(lead.company || lead.website || lead.linkedin_url || lead.city || lead.industry) && (
              <Card title="Company & Location">
                <InfoRow icon={Building2} label="Company"  value={lead.company} />
                <InfoRow icon={Globe}    label="Website"   value={lead.website}      href={lead.website} />
                <InfoRow icon={Link2}    label="LinkedIn"  value={lead.linkedin_url} href={lead.linkedin_url} />
                <InfoRow icon={MapPin}   label="Location"  value={[lead.city, lead.country].filter(Boolean).join(', ')} />
                <InfoRow icon={Tag}      label="Industry"  value={lead.industry} />
              </Card>
            )}

            {/* Social handles */}
            {lead.social_handles?.filter(h => h.url).length > 0 && (
              <Card title="Social Media">
                {lead.social_handles.filter(h => h.url).map((h, i) => (
                  <div key={i} className="flex items-center gap-3 py-2.5">
                    <div className="w-7 h-7 rounded-lg bg-slate-50 flex items-center justify-center shrink-0">
                      <ExternalLink size={12} className="text-slate-400" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{h.platform}</p>
                      <a href={h.url} target="_blank" rel="noopener noreferrer"
                        className="text-[13px] text-blue-600 hover:underline truncate block mt-0.5">{h.url}</a>
                    </div>
                  </div>
                ))}
              </Card>
            )}

            {/* Pipeline */}
            {(lead.deal_value || lead.last_contacted_at || lead.follow_up_at) && (
              <Card title="Pipeline">
                <InfoRow icon={DollarSign} label="Deal value"
                  value={lead.deal_value ? `${lead.currency} ${Number(lead.deal_value).toLocaleString()}` : null} />
                <InfoRow icon={Calendar} label="Last contacted"
                  value={lead.last_contacted_at ? formatDistanceToNow(new Date(lead.last_contacted_at), { addSuffix: true }) : null} />
                <InfoRow icon={Clock} label="Follow-up"
                  value={lead.follow_up_at ? formatDistanceToNow(new Date(lead.follow_up_at), { addSuffix: true }) : null} />
              </Card>
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
              <div className="px-4 py-3 border-b border-slate-100/80">
                <p className="text-[10.5px] font-bold uppercase tracking-[0.12em] text-slate-400">Quick actions</p>
              </div>
              <div className="px-2 py-2">
                {primaryEmail && <QuickAction icon={Mail} label="Send email" href={`mailto:${primaryEmail}`} color="text-blue-500" />}
                {primaryPhone && <QuickAction icon={PhoneCall} label="Call" href={`tel:${primaryPhone}`} color="text-green-500" />}
                <QuickAction icon={Pencil} label="Edit lead" href={`/leads/${lead.id}/edit`} color="text-violet-500" />
                <QuickAction icon={Briefcase} label="View pipeline" href="/pipeline" color="text-teal-500" />
                <QuickAction icon={Users} label="All leads" href="/leads" color="text-slate-400" />
              </div>
            </div>

            {/* Inline status change */}
            <div className="rounded-2xl p-4" style={glass}>
              <p className="text-[10.5px] font-bold uppercase tracking-[0.12em] text-slate-400 mb-2.5">Change status</p>
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
              <p className="text-[10.5px] text-slate-400 mt-1.5">
                Source: <span className="font-semibold capitalize text-slate-600">{lead.source || 'manual'}</span>
              </p>
            </div>

            {/* Activity timeline */}
            <div className="rounded-2xl overflow-hidden" style={glass}>
              <div className="px-4 py-3 border-b border-slate-100/80">
                <p className="text-[10.5px] font-bold uppercase tracking-[0.12em] text-slate-400">
                  Activity timeline
                  {activities?.length > 0 && <span className="ml-1.5 text-violet-500">({activities.length})</span>}
                </p>
              </div>
              <div className="px-4 py-3">
                {activities?.length ? (
                  <div className="relative">
                    {/* timeline line */}
                    <div className="absolute left-[11px] top-1 bottom-1 w-px bg-slate-100" />
                    <div className="space-y-4">
                      {activities.map(act => {
                        const cfg = ACT_CFG[act.type] ?? ACT_CFG.note
                        const Icon = cfg.icon
                        return (
                          <div key={act.id} className="flex gap-3 relative">
                            <div className={cn('w-6 h-6 rounded-full flex items-center justify-center shrink-0 z-10', cfg.cls)}>
                              <Icon size={11} />
                            </div>
                            <div className="flex-1 min-w-0 pb-1">
                              <p className="text-[12px] text-slate-700 leading-snug">{act.description}</p>
                              <p className="text-[10.5px] text-slate-400 mt-0.5">
                                {formatDistanceToNow(new Date(act.created_at), { addSuffix: true })}
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
