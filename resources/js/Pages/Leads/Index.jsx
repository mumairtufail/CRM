import { Head, Link, router } from '@inertiajs/react'
import { useState, useCallback, useEffect, useRef } from 'react'
import AppLayout from '@/Components/Layout/AppLayout'
import PageHeader from '@/Components/Common/PageHeader'
import DataTable from '@/Components/Common/DataTable'
import StatusBadge from '@/Components/Common/StatusBadge'
import PriorityBadge from '@/Components/Common/PriorityBadge'
import LeadAvatar from '@/Components/Common/LeadAvatar'
import SearchInput from '@/Components/Common/SearchInput'
import ConfirmDialog from '@/Components/Common/ConfirmDialog'
import { LeadsTableSkeleton } from '@/Components/Common/Skeletons'
import { Button } from '@/Components/ui/button'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger
} from '@/Components/ui/dropdown-menu'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/Components/ui/select'
import { Plus, MoreHorizontal, Pencil, Trash2, ExternalLink, Filter, X } from 'lucide-react'
import { toast } from 'sonner'

const STATUS_OPTIONS = [
  { value: 'all',         label: 'All statuses' },
  { value: 'new',         label: 'New' },
  { value: 'contacted',   label: 'Contacted' },
  { value: 'qualified',   label: 'Qualified' },
  { value: 'proposal',    label: 'Proposal' },
  { value: 'negotiation', label: 'Negotiation' },
  { value: 'won',         label: 'Won' },
  { value: 'lost',        label: 'Lost' },
]

const LEAD_STATUSES = STATUS_OPTIONS.filter(s => s.value !== 'all')

const PLATFORM_META = {
  linkedin:  { label: 'in',  bg: '#0A66C2', title: 'LinkedIn' },
  twitter:   { label: 'X',   bg: '#000000', title: 'X / Twitter' },
  x:         { label: 'X',   bg: '#000000', title: 'X / Twitter' },
  facebook:  { label: 'fb',  bg: '#1877F2', title: 'Facebook' },
  instagram: { label: 'ig',  bg: '#E1306C', title: 'Instagram' },
  youtube:   { label: 'yt',  bg: '#FF0000', title: 'YouTube' },
  tiktok:    { label: 'tk',  bg: '#010101', title: 'TikTok' },
  github:    { label: 'gh',  bg: '#24292e', title: 'GitHub' },
  website:   { label: 'www', bg: '#6366f1', title: 'Website' },
}

function SocialLinks({ handles }) {
  if (!handles?.length) return <span className="text-gray-200 text-sm">—</span>
  return (
    <div className="flex items-center gap-1 flex-wrap">
      {handles.filter(h => h.url).slice(0, 4).map((h, i) => {
        const key = (h.platform || '').toLowerCase()
        const meta = PLATFORM_META[key] || { label: key.slice(0, 2) || '?', bg: '#94a3b8', title: h.platform || 'Link' }
        return (
          <a
            key={i}
            href={h.url}
            target="_blank"
            rel="noopener noreferrer"
            title={meta.title}
            className="inline-flex items-center justify-center w-5 h-5 rounded text-white font-bold hover:opacity-80 transition-opacity"
            style={{ background: meta.bg, fontSize: '8px', letterSpacing: '-0.5px' }}
            onClick={e => e.stopPropagation()}
          >
            {meta.label.toUpperCase()}
          </a>
        )
      })}
    </div>
  )
}

function InlineStatusSelect({ lead }) {
  const [changing, setChanging] = useState(false)

  const handleChange = (newStatus) => {
    if (newStatus === lead.status) return
    setChanging(true)
    router.patch(`/leads/${lead.id}/status`, { status: newStatus }, {
      preserveState: true,
      preserveScroll: true,
      onSuccess: () => toast.success(`Status → ${newStatus}`),
      onError: () => toast.error('Failed to update status'),
      onFinish: () => setChanging(false),
    })
  }

  return (
    <Select value={lead.status} onValueChange={handleChange} disabled={changing}>
      <SelectTrigger
        className="h-6 border-0 bg-transparent p-0 shadow-none focus:ring-0 w-auto gap-1 [&>svg]:w-3 [&>svg]:h-3 [&>svg]:opacity-40"
        onClick={e => e.stopPropagation()}
      >
        <StatusBadge status={lead.status} />
      </SelectTrigger>
      <SelectContent>
        {LEAD_STATUSES.map(opt => (
          <SelectItem key={opt.value} value={opt.value} className="text-xs">
            {opt.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

// Standalone checkbox that supports indeterminate
function Checkbox({ checked, indeterminate, onChange, onClick }) {
  const ref = useRef(null)
  useEffect(() => {
    if (ref.current) ref.current.indeterminate = !!indeterminate
  }, [indeterminate])
  return (
    <input
      ref={ref}
      type="checkbox"
      checked={checked}
      onChange={onChange}
      onClick={onClick}
      className="w-[15px] h-[15px] rounded cursor-pointer accent-violet-600"
    />
  )
}

export default function LeadsIndex({ leads, filters }) {
  const [deleteId, setDeleteId]           = useState(null)
  const [deleting, setDeleting]           = useState(false)
  const [loading, setLoading]             = useState(false)
  const [selectedIds, setSelectedIds]     = useState(new Set())
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false)
  const [bulkDeleting, setBulkDeleting]   = useState(false)

  useEffect(() => {
    const start = router.on('start', () => setLoading(true))
    const finish = router.on('finish', () => setLoading(false))
    return () => { start(); finish() }
  }, [])

  const { data: rows, ...pagination } = leads

  // Clear selection whenever the page data changes (filter / page change)
  useEffect(() => { setSelectedIds(new Set()) }, [leads])

  const handleSearch = useCallback(search => {
    router.get('/leads', { ...filters, search, page: 1 }, { preserveState: true, replace: true })
  }, [filters])

  const handleStatusFilter = useCallback(status => {
    router.get('/leads', { ...filters, status: status === 'all' ? undefined : status, page: 1 }, { preserveState: true, replace: true })
  }, [filters])

  const handlePageChange = useCallback(page => {
    router.get('/leads', { ...filters, page }, { preserveState: true })
  }, [filters])

  // Single delete
  const handleDelete = () => {
    if (!deleteId) return
    setDeleting(true)
    router.delete(`/leads/${deleteId}`, {
      preserveState: false,
      onSuccess: () => toast.success('Lead deleted'),
      onError: () => toast.error('Failed to delete lead'),
      onFinish: () => { setDeleting(false); setDeleteId(null) },
    })
  }

  // Toggle one row
  const toggleRow = useCallback((id) => {
    setSelectedIds(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id); else next.add(id)
      return next
    })
  }, [])

  // Toggle all rows on current page
  const toggleAll = useCallback((rowIds) => {
    setSelectedIds(prev => {
      const allSelected = rowIds.length > 0 && rowIds.every(id => prev.has(id))
      if (allSelected) {
        const next = new Set(prev)
        rowIds.forEach(id => next.delete(id))
        return next
      }
      return new Set([...prev, ...rowIds])
    })
  }, [])

  // Bulk delete
  const handleBulkDelete = () => {
    setBulkDeleting(true)
    const ids = [...selectedIds]
    router.post('/leads/bulk-destroy', { ids }, {
      preserveState: false,
      onSuccess: () => {
        toast.success(`${ids.length} lead${ids.length !== 1 ? 's' : ''} deleted`)
        setSelectedIds(new Set())
      },
      onError: () => toast.error('Failed to delete leads'),
      onFinish: () => { setBulkDeleting(false); setBulkDeleteOpen(false) },
    })
  }

  const columns = [
    // ── Checkbox column ──
    {
      id: 'select',
      enableSorting: false,
      size: 44,
      header: ({ table }) => {
        const rowIds = table.getRowModel().rows.map(r => r.original.id)
        const allChecked = rowIds.length > 0 && rowIds.every(id => selectedIds.has(id))
        const someChecked = rowIds.some(id => selectedIds.has(id)) && !allChecked
        return (
          <Checkbox
            checked={allChecked}
            indeterminate={someChecked}
            onChange={() => toggleAll(rowIds)}
          />
        )
      },
      cell: ({ row }) => (
        <Checkbox
          checked={selectedIds.has(row.original.id)}
          onChange={() => toggleRow(row.original.id)}
          onClick={e => e.stopPropagation()}
        />
      ),
    },
    {
      id: 'lead',
      header: 'Lead',
      size: 220,
      cell: ({ row }) => (
        <div className="flex items-center gap-2.5">
          <LeadAvatar name={row.original.full_name} size="sm" />
          <div className="min-w-0">
            <Link
              href={`/leads/${row.original.id}`}
              className="font-medium text-gray-900 hover:text-blue-600 text-sm leading-none block truncate"
            >
              {row.original.full_name}
            </Link>
            <p className="text-xs text-gray-400 mt-0.5 truncate">{row.original.primary_email}</p>
          </div>
        </div>
      ),
    },
    {
      accessorKey: 'company',
      header: 'Company',
      size: 150,
      cell: ({ getValue }) => (
        <span className="text-sm text-gray-600 truncate block max-w-[140px]">{getValue() || '—'}</span>
      ),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      size: 130,
      cell: ({ row }) => <InlineStatusSelect lead={row.original} />,
    },
    {
      accessorKey: 'priority',
      header: 'Priority',
      size: 90,
      cell: ({ getValue }) => <PriorityBadge priority={getValue()} />,
    },
    {
      id: 'social',
      header: 'Social',
      size: 110,
      cell: ({ row }) => <SocialLinks handles={row.original.social_handles} />,
    },
    {
      accessorKey: 'deal_value',
      header: 'Value',
      size: 100,
      cell: ({ getValue }) => getValue()
        ? <span className="text-sm font-semibold text-green-600">${Number(getValue()).toLocaleString()}</span>
        : <span className="text-gray-300 text-sm">—</span>,
    },
    {
      id: 'actions',
      header: '',
      size: 44,
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-7 w-7 text-slate-400 hover:text-indigo-600 transition-colors">
              <MoreHorizontal size={14} />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-40">
            <DropdownMenuItem asChild>
              <Link href={`/leads/${row.original.id}`} className="flex items-center gap-2">
                <ExternalLink size={13} /> View
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href={`/leads/${row.original.id}/edit`} className="flex items-center gap-2">
                <Pencil size={13} /> Edit
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-red-600 focus:text-red-600 flex items-center gap-2"
              onClick={() => setDeleteId(row.original.id)}
            >
              <Trash2 size={13} /> Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ]

  const selectionCount = selectedIds.size

  return (
    <>
      <Head title="Leads" />
      <AppLayout title="Leads">
        <PageHeader
          title="All Leads"
          description={`${pagination.total ?? 0} total leads`}
          action={
            <Link href="/leads/create">
              <Button size="sm" className="gap-1.5 h-9">
                <Plus size={14} /> Add Lead
              </Button>
            </Link>
          }
        />

        <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-4">
          <SearchInput
            value={filters?.search ?? ''}
            onChange={handleSearch}
            placeholder="Search leads…"
            className="w-full sm:w-64"
          />
          <Select
            value={filters?.status ?? 'all'}
            onValueChange={handleStatusFilter}
          >
            <SelectTrigger className="h-9 w-full sm:w-40 text-sm bg-white">
              <Filter size={13} className="text-gray-400 mr-1" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {STATUS_OPTIONS.map(opt => (
                <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <DataTable
          data={rows}
          columns={columns}
          pagination={pagination}
          onPageChange={handlePageChange}
          loading={loading}
        />

        {/* ── Single delete dialog ── */}
        <ConfirmDialog
          open={!!deleteId}
          onOpenChange={open => !open && setDeleteId(null)}
          title="Delete lead?"
          description="This lead and all associated data will be permanently deleted."
          onConfirm={handleDelete}
          loading={deleting}
        />

        {/* ── Bulk delete dialog ── */}
        <ConfirmDialog
          open={bulkDeleteOpen}
          onOpenChange={open => !open && setBulkDeleteOpen(false)}
          title={`Delete ${selectionCount} lead${selectionCount !== 1 ? 's' : ''}?`}
          description="All selected leads and their associated data will be permanently deleted. This cannot be undone."
          onConfirm={handleBulkDelete}
          loading={bulkDeleting}
        />
      </AppLayout>

      {/* ── Bulk action bar ── */}
      {selectionCount > 0 && (
        <div style={{
          position: 'fixed',
          bottom: 28,
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 50,
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          background: '#0f172a',
          borderRadius: 12,
          padding: '10px 14px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.28), 0 0 0 1px rgba(255,255,255,0.06)',
          whiteSpace: 'nowrap',
        }}>
          <span style={{ fontSize: 13, fontWeight: 500, color: 'white' }}>
            {selectionCount} lead{selectionCount !== 1 ? 's' : ''} selected
          </span>

          <div style={{ width: 1, height: 16, background: 'rgba(255,255,255,0.12)' }} />

          <button
            onClick={() => setSelectedIds(new Set())}
            style={{
              display: 'flex', alignItems: 'center', gap: 5,
              background: 'rgba(255,255,255,0.08)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 7, padding: '4px 10px',
              color: 'rgba(255,255,255,0.7)', fontSize: 12.5, fontWeight: 500,
              cursor: 'pointer', transition: 'background 0.15s',
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.13)'}
            onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'}
          >
            <X size={12} /> Clear
          </button>

          <button
            onClick={() => setBulkDeleteOpen(true)}
            style={{
              display: 'flex', alignItems: 'center', gap: 5,
              background: '#ef4444',
              border: 'none',
              borderRadius: 7, padding: '4px 12px',
              color: 'white', fontSize: 12.5, fontWeight: 600,
              cursor: 'pointer', transition: 'background 0.15s',
            }}
            onMouseEnter={e => e.currentTarget.style.background = '#dc2626'}
            onMouseLeave={e => e.currentTarget.style.background = '#ef4444'}
          >
            <Trash2 size={12} /> Delete
          </button>
        </div>
      )}
    </>
  )
}
