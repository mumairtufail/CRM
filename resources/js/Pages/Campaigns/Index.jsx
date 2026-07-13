import { Head, Link, router } from '@inertiajs/react'
import { useState } from 'react'
import AppLayout from '@/Components/Layout/AppLayout'
import PageHeader from '@/Components/Common/PageHeader'
import EmptyState from '@/Components/Common/EmptyState'
import { Button } from '@/Components/ui/button'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from '@/Components/ui/dialog'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/Components/ui/dropdown-menu'
import {
  Mail, Plus, Users, Send, Eye, MousePointerClick, Trash2,
  MoreHorizontal, StopCircle, RotateCcw, RotateCw, Pencil, PauseCircle,
} from 'lucide-react'
import { toast } from 'sonner'

const STATUS_STYLE = {
  draft:     'bg-slate-100 text-slate-600',
  scheduled: 'bg-blue-50 text-blue-600',
  sending:   'bg-brand-50 text-brand-600',
  sent:      'bg-emerald-50 text-emerald-700',
  paused:    'bg-amber-50 text-amber-600',
  failed:    'bg-red-50 text-red-600',
}

function CampaignActions({ campaign, onDelete }) {
  const [busy, setBusy] = useState(null)

  const post = (url, label, onSuccess) => {
    setBusy(label)
    router.post(url, {}, {
      onSuccess,
      onError: (e) => toast.error(Object.values(e)[0] || `${label} failed`),
      onFinish: () => setBusy(null),
    })
  }

  const { id, status, followup_enabled, followup_subject } = campaign
  const isSent   = status === 'sent'
  const isSending = status === 'sending'
  const isPaused = status === 'paused'

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost" size="sm"
          className="h-8 w-8 p-0 text-slate-400 hover:text-slate-600 shrink-0"
          onClick={e => e.preventDefault()}
          disabled={!!busy}
        >
          <MoreHorizontal size={15} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-44">
        {status === 'draft' && (
          <DropdownMenuItem asChild>
            <Link href={`/campaigns/${id}/edit`} className="flex items-center gap-2">
              <Pencil size={13} /> Edit
            </Link>
          </DropdownMenuItem>
        )}
        {isSending && (
          <DropdownMenuItem
            className="flex items-center gap-2 text-orange-600 focus:text-orange-700"
            onClick={() => post(`/campaigns/${id}/stop`, 'Stop', () => {
              toast.success('Campaign paused'); router.reload()
            })}
          >
            <StopCircle size={13} />
            {busy === 'Stop' ? 'Stopping…' : 'Stop'}
          </DropdownMenuItem>
        )}
        {isPaused && (
          <DropdownMenuItem
            className="flex items-center gap-2 text-emerald-600 focus:text-emerald-700"
            onClick={() => post(`/campaigns/${id}/send`, 'Resume', () => {
              toast.success('Campaign resumed'); router.visit(`/campaigns/${id}`)
            })}
          >
            <RotateCcw size={13} />
            {busy === 'Resume' ? 'Resuming…' : 'Resume'}
          </DropdownMenuItem>
        )}
        {isSent && followup_enabled && (
          <DropdownMenuItem
            className="flex items-center gap-2 text-orange-600 focus:text-orange-700"
            onClick={() => post(`/campaigns/${id}/stop`, 'Stop Follow-ups', () => {
              toast.success('Follow-ups stopped'); router.reload()
            })}
          >
            <PauseCircle size={13} />
            {busy === 'Stop Follow-ups' ? 'Stopping…' : 'Stop Follow-ups'}
          </DropdownMenuItem>
        )}
        {isSent && !followup_enabled && followup_subject && (
          <DropdownMenuItem
            className="flex items-center gap-2 text-emerald-600 focus:text-emerald-700"
            onClick={() => post(`/campaigns/${id}/resume-followups`, 'Resume Follow-ups', () => {
              toast.success('Follow-ups resumed'); router.reload()
            })}
          >
            <RotateCcw size={13} />
            {busy === 'Resume Follow-ups' ? 'Resuming…' : 'Resume Follow-ups'}
          </DropdownMenuItem>
        )}
        {(isSent || status === 'failed') && (
          <DropdownMenuItem
            className="flex items-center gap-2"
            onClick={() => post(`/campaigns/${id}/clone`, 'Run Again', () => {
              toast.success('Campaign duplicated')
            })}
          >
            <RotateCw size={13} />
            {busy === 'Run Again' ? 'Duplicating…' : 'Run Again'}
          </DropdownMenuItem>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="flex items-center gap-2 text-red-600 focus:text-red-700"
          onClick={() => onDelete(id)}
        >
          <Trash2 size={13} /> Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default function CampaignsIndex({ campaigns }) {
  const [selected, setSelected]             = useState(new Set())
  const [confirmOpen, setConfirmOpen]       = useState(false)
  const [deleting, setDeleting]             = useState(false)
  const [singleDeleteId, setSingleDeleteId] = useState(null)

  const allIds      = campaigns?.map(c => c.id) ?? []
  const allSelected = allIds.length > 0 && allIds.every(id => selected.has(id))

  const toggleAll = () => {
    if (allSelected) {
      setSelected(new Set())
    } else {
      setSelected(new Set(allIds))
    }
  }

  const toggleOne = (id, e) => {
    e.preventDefault()
    e.stopPropagation()
    setSelected(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  const handleBulkDelete = () => {
    setDeleting(true)
    router.post('/campaigns/bulk-delete', { ids: [...selected] }, {
      onSuccess: () => {
        toast.success(`${selected.size} campaign${selected.size !== 1 ? 's' : ''} deleted`)
        setSelected(new Set())
        setConfirmOpen(false)
      },
      onError: () => toast.error('Delete failed'),
      onFinish: () => setDeleting(false),
    })
  }

  const handleSingleDelete = () => {
    if (!singleDeleteId) return
    setDeleting(true)
    router.delete(`/campaigns/${singleDeleteId}`, {
      onSuccess: () => { toast.success('Campaign deleted'); setSingleDeleteId(null) },
      onError: () => toast.error('Delete failed'),
      onFinish: () => setDeleting(false),
    })
  }

  return (
    <>
      <Head title="Campaigns" />
      <AppLayout title="Campaigns">
        <PageHeader
          title="Email Campaigns"
          description={`${campaigns?.length ?? 0} campaigns`}
          action={
            <div className="flex items-center gap-2">
              {selected.size > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  className="h-9 gap-1.5 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                  onClick={() => setConfirmOpen(true)}
                >
                  <Trash2 size={14} />
                  Delete {selected.size} selected
                </Button>
              )}
              <Link href="/campaigns/create">
                <Button size="sm" className="gap-1.5 h-9">
                  <Plus size={14} /> New Campaign
                </Button>
              </Link>
            </div>
          }
        />

        {campaigns?.length ? (
          <div className="space-y-2">
            {/* Select all row */}
            {campaigns.length > 1 && (
              <div className="flex items-center gap-3 px-1 pb-1">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={toggleAll}
                  className="w-4 h-4 rounded border-slate-300 text-brand-600 cursor-pointer accent-brand-600"
                />
                <span className="text-[11px] text-slate-400">
                  {allSelected ? 'Deselect all' : 'Select all'}
                </span>
              </div>
            )}

            {/* Two columns on wide screens so the list uses the full page width */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-2.5">
            {campaigns.map(c => (
              <div key={c.id} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={selected.has(c.id)}
                  onChange={e => toggleOne(c.id, e)}
                  onClick={e => e.stopPropagation()}
                  className="w-4 h-4 rounded border-slate-300 text-brand-600 cursor-pointer accent-brand-600 shrink-0"
                />
                <Link href={`/campaigns/${c.id}`} className="block flex-1 min-w-0">
                  <div className="form-card px-4 py-3 hover:shadow-md transition-shadow cursor-pointer">
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="text-[13.5px] font-semibold text-slate-800 truncate">{c.name}</p>
                          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full capitalize ${STATUS_STYLE[c.status] ?? STATUS_STYLE.draft}`}>
                            {c.status}
                          </span>
                        </div>
                        <p className="text-[12px] text-slate-500 mt-0.5 truncate">
                          Subject: {c.subject}
                        </p>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          From {c.from_name} &lt;{c.from_email}&gt; · {c.created_at}
                        </p>
                      </div>

                      <div className="flex items-center gap-5 shrink-0">
                        <div className="text-center">
                          <div className="flex items-center gap-1 text-slate-400 justify-center">
                            <Users size={11} />
                            <span className="text-[12px] font-semibold text-slate-700">{c.total_recipients}</span>
                          </div>
                          <p className="text-[9px] text-slate-400 mt-0.5">recipients</p>
                        </div>
                        {['sent', 'paused', 'failed'].includes(c.status) && c.sent_count > 0 && (
                          <>
                            <div className="text-center">
                              <div className="flex items-center gap-1 text-slate-400 justify-center">
                                <Send size={10} />
                                <p className="text-[12px] font-semibold text-slate-700">{c.sent_count}</p>
                              </div>
                              <p className="text-[9px] text-slate-400 mt-0.5">sent</p>
                            </div>
                            <div className="text-center">
                              <div className="flex items-center gap-1 text-slate-400 justify-center">
                                <Eye size={10} />
                                <p className="text-[12px] font-semibold text-slate-700">
                                  {c.sent_count > 0 ? Math.round((c.opened_count / c.sent_count) * 100) : 0}%
                                </p>
                              </div>
                              <p className="text-[9px] text-slate-400 mt-0.5">open rate</p>
                            </div>
                            <div className="text-center">
                              <div className="flex items-center gap-1 text-slate-400 justify-center">
                                <MousePointerClick size={10} />
                                <p className="text-[12px] font-semibold text-slate-700">
                                  {c.sent_count > 0 ? Math.round((c.clicked_count / c.sent_count) * 100) : 0}%
                                </p>
                              </div>
                              <p className="text-[9px] text-slate-400 mt-0.5">click rate</p>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </Link>
                <CampaignActions campaign={c} onDelete={id => setSingleDeleteId(id)} />
              </div>
            ))}
            </div>
          </div>
        ) : (
          <EmptyState
            icon={Mail}
            title="No campaigns yet"
            description="Create your first email campaign to start reaching leads at scale."
            action={
              <Link href="/campaigns/create">
                <Button size="sm" className="gap-1.5 h-9">
                  <Plus size={14} /> Create Campaign
                </Button>
              </Link>
            }
          />
        )}

        {/* Bulk delete confirmation */}
        <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
          <DialogContent className="max-w-sm">
            <DialogHeader>
              <DialogTitle className="text-sm font-semibold">Delete {selected.size} campaign{selected.size !== 1 ? 's' : ''}?</DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground mt-1">
                This will permanently delete {selected.size === 1 ? 'this campaign' : `these ${selected.size} campaigns`} and all their send history. This cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="gap-2 mt-2">
              <Button variant="outline" size="sm" className="h-8 text-xs" onClick={() => setConfirmOpen(false)} disabled={deleting}>
                Cancel
              </Button>
              <Button
                size="sm"
                className="h-8 text-xs bg-red-600 hover:bg-red-700 text-white border-0"
                onClick={handleBulkDelete}
                disabled={deleting}
              >
                {deleting ? 'Deleting…' : `Delete ${selected.size} campaign${selected.size !== 1 ? 's' : ''}`}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Single campaign delete confirmation */}
        <Dialog open={!!singleDeleteId} onOpenChange={open => { if (!open) setSingleDeleteId(null) }}>
          <DialogContent className="max-w-sm">
            <DialogHeader>
              <DialogTitle className="text-sm font-semibold">Delete campaign?</DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground mt-1">
                This will permanently delete the campaign and all its send history. This cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="gap-2 mt-2">
              <Button variant="outline" size="sm" className="h-8 text-xs" onClick={() => setSingleDeleteId(null)} disabled={deleting}>
                Cancel
              </Button>
              <Button
                size="sm"
                className="h-8 text-xs bg-red-600 hover:bg-red-700 text-white border-0"
                onClick={handleSingleDelete}
                disabled={deleting}
              >
                {deleting ? 'Deleting…' : 'Delete'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </AppLayout>
    </>
  )
}
