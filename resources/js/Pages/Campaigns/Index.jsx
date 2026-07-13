import { Head, Link, router } from '@inertiajs/react'
import { useState, useMemo } from 'react'
import DataTable from '@/Components/Common/DataTable'
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
  LayoutGrid, List,
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
  // Selection shared between both views — object keyed by campaign id (as string),
  // matching the shape DataTable's row selection expects.
  const [rowSelection, setRowSelection]     = useState({})
  const [confirmOpen, setConfirmOpen]       = useState(false)
  const [deleting, setDeleting]             = useState(false)
  const [singleDeleteId, setSingleDeleteId] = useState(null)
  const [view, setView] = useState(() => localStorage.getItem('campaigns_view') || 'card')

  const switchView = v => { setView(v); localStorage.setItem('campaigns_view', v) }

  const selectedIds = useMemo(() => Object.keys(rowSelection).map(Number), [rowSelection])
  const selCount    = selectedIds.length

  // Sequence number per workspace: newest-first list, so #total is the latest send.
  const data = useMemo(
    () => (campaigns ?? []).map((c, i) => ({ ...c, seq: campaigns.length - i })),
    [campaigns]
  )

  const allIds      = campaigns?.map(c => c.id) ?? []
  const allSelected = allIds.length > 0 && allIds.every(id => rowSelection[String(id)])

  const toggleAll = () => {
    setRowSelection(allSelected ? {} : Object.fromEntries(allIds.map(id => [String(id), true])))
  }

  const toggleSel = (id) => {
    setRowSelection(prev => {
      const next = { ...prev }
      const key  = String(id)
      if (next[key]) delete next[key]; else next[key] = true
      return next
    })
  }

  const handleBulkDelete = () => {
    setDeleting(true)
    router.post('/campaigns/bulk-delete', { ids: selectedIds }, {
      onSuccess: () => {
        toast.success(`${selectedIds.length} campaign${selectedIds.length !== 1 ? 's' : ''} deleted`)
        setRowSelection({})
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

  const rate = (num, den) => den > 0 ? `${Math.round((num / den) * 100)}%` : '—'
  const hasStats = c => ['sent', 'paused', 'failed'].includes(c.status) && c.sent_count > 0

  // Table (list view) columns — memoized so DataTable can memoize rows.
  const columns = useMemo(() => [
    {
      id: 'select',
      enableSorting: false,
      size: 40,
      header: ({ table }) => (
        <input
          type="checkbox"
          checked={table.getIsAllRowsSelected()}
          onChange={table.getToggleAllRowsSelectedHandler()}
          className="w-4 h-4 rounded border-slate-300 cursor-pointer accent-brand-600"
        />
      ),
      cell: ({ row }) => (
        <input
          type="checkbox"
          checked={row.getIsSelected()}
          onChange={row.getToggleSelectedHandler()}
          onClick={e => e.stopPropagation()}
          className="w-4 h-4 rounded border-slate-300 cursor-pointer accent-brand-600"
        />
      ),
    },
    {
      accessorKey: 'seq',
      header: '#',
      size: 50,
      cell: ({ getValue }) => (
        <span className="text-xs font-bold text-slate-300 tabular-nums" title="Higher = more recent">#{getValue()}</span>
      ),
    },
    {
      id: 'name',
      header: 'Campaign',
      size: 300,
      enableSorting: false,
      cell: ({ row }) => (
        <Link href={`/campaigns/${row.original.id}`} className="block min-w-0 group">
          <p className="text-[13px] font-semibold text-slate-800 truncate group-hover:text-brand-600 transition-colors">
            {row.original.name}
          </p>
          <p className="text-[11.5px] text-slate-400 truncate mt-0.5">{row.original.subject}</p>
        </Link>
      ),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      size: 100,
      cell: ({ getValue }) => (
        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full capitalize ${STATUS_STYLE[getValue()] ?? STATUS_STYLE.draft}`}>
          {getValue()}
        </span>
      ),
    },
    {
      accessorKey: 'total_recipients',
      header: 'Recipients',
      size: 90,
      cell: ({ getValue }) => <span className="text-sm text-slate-600 tabular-nums">{getValue()}</span>,
    },
    {
      accessorKey: 'sent_count',
      header: 'Sent',
      size: 70,
      cell: ({ row }) => (
        <span className="text-sm text-slate-600 tabular-nums">
          {hasStats(row.original) ? row.original.sent_count : '—'}
        </span>
      ),
    },
    {
      id: 'open_rate',
      header: 'Open rate',
      size: 90,
      enableSorting: false,
      cell: ({ row }) => (
        <span className="text-sm font-medium text-slate-700 tabular-nums">
          {hasStats(row.original) ? rate(row.original.opened_count, row.original.sent_count) : '—'}
        </span>
      ),
    },
    {
      id: 'click_rate',
      header: 'Click rate',
      size: 90,
      enableSorting: false,
      cell: ({ row }) => (
        <span className="text-sm font-medium text-slate-700 tabular-nums">
          {hasStats(row.original) ? rate(row.original.clicked_count, row.original.sent_count) : '—'}
        </span>
      ),
    },
    {
      id: 'date',
      header: 'Date',
      size: 120,
      enableSorting: false,
      meta: { className: 'hidden lg:table-cell' },
      cell: ({ row }) => (
        <span className="text-xs text-slate-400">
          {row.original.sent_at ? `Sent ${row.original.sent_at}` : `Created ${row.original.created_at}`}
        </span>
      ),
    },
    {
      id: 'actions',
      header: '',
      size: 44,
      enableSorting: false,
      cell: ({ row }) => <CampaignActions campaign={row.original} onDelete={id => setSingleDeleteId(id)} />,
    },
  ], [])

  return (
    <>
      <Head title="Campaigns" />
      <AppLayout title="Campaigns">
        <PageHeader
          title="Email Campaigns"
          description={`${campaigns?.length ?? 0} campaigns`}
          action={
            <div className="flex items-center gap-2">
              {/* Card / list view toggle */}
              <div className="flex items-center rounded-lg border border-slate-200 bg-white p-0.5">
                {[['card', LayoutGrid], ['list', List]].map(([v, Icon]) => (
                  <button
                    key={v}
                    type="button"
                    title={`${v === 'card' ? 'Card' : 'List'} view`}
                    onClick={() => switchView(v)}
                    className={`flex items-center justify-center w-8 h-7 rounded-md transition-colors ${
                      view === v ? 'bg-brand-50 text-brand-600' : 'text-slate-400 hover:text-slate-600'
                    }`}
                  >
                    <Icon size={14} />
                  </button>
                ))}
              </div>
              {selCount > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  className="h-9 gap-1.5 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                  onClick={() => setConfirmOpen(true)}
                >
                  <Trash2 size={14} />
                  Delete {selCount} selected
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
            {/* Select all row (table view has its own header checkbox) */}
            {view === 'card' && campaigns.length > 1 && (
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

            {view === 'card' ? (
              /* ── Card view · compact 3-up grid ── */
              <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-3">
                {data.map(c => {
                  const showStats = hasStats(c)
                  return (
                    /* The link is an overlay so the checkbox/actions are real siblings
                       (a checkbox inside an <a> needs preventDefault, which also
                       cancels the browser's check-toggle). */
                    <div key={c.id} className="form-card relative h-full px-4 py-3 hover:shadow-md transition-shadow flex flex-col gap-1.5 min-w-0">
                      <Link href={`/campaigns/${c.id}`} aria-label={c.name} className="absolute inset-0 z-[1] rounded-xl" />
                      <div className="relative z-[2] flex items-center gap-2 pointer-events-none">
                        <input
                          type="checkbox"
                          checked={!!rowSelection[String(c.id)]}
                          onChange={() => toggleSel(c.id)}
                          className="pointer-events-auto w-4 h-4 rounded border-slate-300 text-brand-600 cursor-pointer accent-brand-600 shrink-0"
                        />
                        <span className="text-[10.5px] font-bold text-slate-300 tabular-nums" title={`Campaign #${c.seq} — higher means more recent`}>
                          #{c.seq}
                        </span>
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full capitalize ${STATUS_STYLE[c.status] ?? STATUS_STYLE.draft}`}>
                          {c.status}
                        </span>
                        <span className="flex-1" />
                        <span className="pointer-events-auto">
                          <CampaignActions campaign={c} onDelete={id => setSingleDeleteId(id)} />
                        </span>
                      </div>
                      <div className="min-w-0">
                        <p className="text-[13.5px] font-semibold text-slate-800 truncate">{c.name}</p>
                        <p className="text-[12px] text-slate-500 mt-0.5 truncate">{c.subject}</p>
                        <p className="text-[11px] text-slate-400 mt-0.5 truncate">
                          {c.sent_at ? `Sent ${c.sent_at}` : `Created ${c.created_at}`} · {c.from_email}
                        </p>
                      </div>
                      <div className="mt-auto pt-2 border-t border-slate-100 flex items-center justify-between text-[11.5px]">
                        <span className="flex items-center gap-1 text-slate-500" title="Recipients">
                          <Users size={11} className="text-slate-400" />
                          <b className="font-semibold text-slate-700">{c.total_recipients}</b>
                        </span>
                        {showStats ? (
                          <>
                            <span className="flex items-center gap-1 text-slate-500" title="Sent">
                              <Send size={10} className="text-slate-400" />
                              <b className="font-semibold text-slate-700">{c.sent_count}</b>
                            </span>
                            <span className="flex items-center gap-1 text-slate-500" title="Open rate">
                              <Eye size={10} className="text-slate-400" />
                              <b className="font-semibold text-slate-700">{Math.round((c.opened_count / c.sent_count) * 100)}%</b>
                            </span>
                            <span className="flex items-center gap-1 text-slate-500" title="Click rate">
                              <MousePointerClick size={10} className="text-slate-400" />
                              <b className="font-semibold text-slate-700">{Math.round((c.clicked_count / c.sent_count) * 100)}%</b>
                            </span>
                          </>
                        ) : (
                          <span className="text-slate-300">not sent yet</span>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              /* ── List view · standard app table ── */
              <DataTable
                data={data}
                columns={columns}
                rowSelection={rowSelection}
                onRowSelectionChange={setRowSelection}
                getRowId={row => String(row.id)}
              />
            )}
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
              <DialogTitle className="text-sm font-semibold">Delete {selCount} campaign{selCount !== 1 ? 's' : ''}?</DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground mt-1">
                This will permanently delete {selCount === 1 ? 'this campaign' : `these ${selCount} campaigns`} and all their send history. This cannot be undone.
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
                {deleting ? 'Deleting…' : `Delete ${selCount} campaign${selCount !== 1 ? 's' : ''}`}
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
