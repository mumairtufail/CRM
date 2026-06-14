import { Head, Link, router } from '@inertiajs/react'
import { useState } from 'react'
import AppLayout from '@/Components/Layout/AppLayout'
import PageHeader from '@/Components/Common/PageHeader'
import EmptyState from '@/Components/Common/EmptyState'
import { Button } from '@/Components/ui/button'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from '@/Components/ui/dialog'
import { Mail, Plus, Users, Send, Eye, MousePointerClick, Trash2 } from 'lucide-react'
import { toast } from 'sonner'

const STATUS_STYLE = {
  draft:     'bg-slate-100 text-slate-600',
  scheduled: 'bg-blue-50 text-blue-600',
  sending:   'bg-violet-50 text-violet-600',
  sent:      'bg-emerald-50 text-emerald-700',
  paused:    'bg-amber-50 text-amber-600',
  failed:    'bg-red-50 text-red-600',
}

export default function CampaignsIndex({ campaigns }) {
  const [selected, setSelected]       = useState(new Set())
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [deleting, setDeleting]       = useState(false)

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
          <div className="space-y-2 max-w-3xl">
            {/* Select all row */}
            {campaigns.length > 1 && (
              <div className="flex items-center gap-3 px-1 pb-1">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={toggleAll}
                  className="w-4 h-4 rounded border-slate-300 text-violet-600 cursor-pointer accent-violet-600"
                />
                <span className="text-[11px] text-slate-400">
                  {allSelected ? 'Deselect all' : 'Select all'}
                </span>
              </div>
            )}

            {campaigns.map(c => (
              <div key={c.id} className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={selected.has(c.id)}
                  onChange={e => toggleOne(c.id, e)}
                  onClick={e => e.stopPropagation()}
                  className="w-4 h-4 rounded border-slate-300 text-violet-600 cursor-pointer accent-violet-600 shrink-0"
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
              </div>
            ))}
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

        {/* Confirmation modal */}
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
      </AppLayout>
    </>
  )
}
