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
import OutreachChannels, { CONTACT_CHANNELS } from '@/Components/Common/OutreachChannels'
import { Button } from '@/Components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/Components/ui/popover'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger
} from '@/Components/ui/dropdown-menu'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/Components/ui/select'
import { Plus, MoreHorizontal, Pencil, Trash2, ExternalLink, Filter, X, UsersRound, ChevronDown, MapPin, Check, Send } from 'lucide-react'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/Components/ui/dialog'
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

const PRIORITY_OPTIONS = [
  { value: 'all',    label: 'Any priority' },
  { value: 'high',   label: 'High' },
  { value: 'medium', label: 'Medium' },
  { value: 'low',    label: 'Low' },
]

const CONTACTED_OPTIONS = [
  { value: 'all', label: 'Anyone' },
  { value: 'no',  label: 'Not contacted yet' },
  { value: 'yes', label: 'Already contacted' },
]

// Turn a plain string list into {value,label} options with a leading "Any …" entry.
const toOptions = (allLabel, list) => [
  { value: 'all', label: allLabel },
  ...((list ?? []).map(v => ({ value: v, label: v }))),
]

// A compact inline <select>-style filter that sits in the toolbar and highlights when set.
function InlineSelect({ icon, placeholder, value, options, onChange }) {
  const active = !!value && value !== 'all'
  return (
    <Select value={value || 'all'} onValueChange={v => onChange(v === 'all' ? undefined : v)}>
      <SelectTrigger
        className={`h-9 w-auto gap-1.5 text-sm transition-colors ${
          active
            ? 'border-brand-300 bg-brand-50 text-brand-700 font-medium'
            : 'bg-white text-slate-600'
        }`}
      >
        {icon}
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent className="max-h-64">
        {options.map(opt => (
          <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

const PLATFORM_META = {
  linkedin:  { label: 'in',  bg: '#0A66C2', title: 'LinkedIn' },
  twitter:   { label: 'X',   bg: '#000000', title: 'X / Twitter' },
  x:         { label: 'X',   bg: '#000000', title: 'X / Twitter' },
  facebook:  { label: 'fb',  bg: '#1877F2', title: 'Facebook' },
  instagram: { label: 'ig',  bg: '#E1306C', title: 'Instagram' },
  youtube:   { label: 'yt',  bg: '#FF0000', title: 'YouTube' },
  tiktok:    { label: 'tk',  bg: '#010101', title: 'TikTok' },
  github:    { label: 'gh',  bg: '#24292e', title: 'GitHub' },
  website:   { label: 'www', bg: 'rgb(var(--brand2-500))', title: 'Website' },
}

function normalizeUrl(url) {
  if (!url) return null
  return url.startsWith('http') ? url : `https://${url}`
}

function SocialLinks({ handles, linkedinUrl }) {
  // Merge linkedin_url into the handles list if no LinkedIn handle already exists
  const base = handles || []
  const hasLinkedin = base.some(h => h.platform?.toLowerCase() === 'linkedin')
  const merged = (linkedinUrl && !hasLinkedin)
    ? [{ platform: 'linkedin', url: normalizeUrl(linkedinUrl) }, ...base]
    : base

  const visible = merged.filter(h => h.url).slice(0, 4)
  if (!visible.length) return <span className="text-gray-200 text-sm">—</span>

  return (
    <div className="flex items-center gap-1 flex-wrap">
      {visible.map((h, i) => {
        const key  = (h.platform || '').toLowerCase()
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
      className="w-[15px] h-[15px] rounded cursor-pointer accent-brand-600"
    />
  )
}

export default function LeadsIndex({ leads, filters, filterOptions }) {
  const [deleteId, setDeleteId]             = useState(null)
  const [deleting, setDeleting]             = useState(false)
  const [loading, setLoading]               = useState(false)
  const [selectedIds, setSelectedIds]       = useState(new Set())
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false)
  const [bulkDeleting, setBulkDeleting]     = useState(false)
  const [addGroupOpen, setAddGroupOpen]     = useState(false)
  const [groups, setGroups]                 = useState([])
  const [addingGroup, setAddingGroup]       = useState(false)
  const [chosenGroupId, setChosenGroupId]   = useState(null)

  const fetchGroups = async () => {
    try {
      const res = await fetch('/groups/list', { headers: { Accept: 'application/json' } })
      const data = await res.json()
      setGroups(data)
    } catch {}
  }

  useEffect(() => {
    const start = router.on('start', () => setLoading(true))
    const finish = router.on('finish', () => setLoading(false))
    return () => { start(); finish() }
  }, [])

  const { data: rows = [], ...pagination } = leads ?? {}

  // Clear selection whenever the page data changes (filter / page change)
  useEffect(() => { setSelectedIds(new Set()) }, [leads])

  // Merge a patch into the current filters, drop empty values, and navigate.
  const applyFilters = useCallback((patch) => {
    const next = { ...filters, ...patch, page: 1 }
    Object.keys(next).forEach(k => {
      const v = next[k]
      if (v === undefined || v === null || v === '' || v === 'all' || (Array.isArray(v) && v.length === 0)) {
        delete next[k]
      }
    })
    router.get('/leads', next, { preserveState: true, replace: true, preserveScroll: true })
  }, [filters])

  const handleSearch = useCallback(search => applyFilters({ search }), [applyFilters])
  const handleStatusFilter = useCallback(status => applyFilters({ status }), [applyFilters])

  const reached = filters?.reached ?? []
  const toggleReached = useCallback((key) => {
    const set = new Set(reached)
    set.has(key) ? set.delete(key) : set.add(key)
    applyFilters({ reached: [...set] })
  }, [reached, applyFilters])

  const clearAllFilters = useCallback(() => {
    router.get('/leads', filters?.search ? { search: filters.search } : {}, {
      preserveState: true, replace: true, preserveScroll: true,
    })
  }, [filters])

  // Whether any filter (status or advanced) is set — drives the single Clear-all button.
  const hasActiveFilters = Boolean(
    (filters?.status && filters.status !== 'all') ||
    filters?.country || filters?.city || filters?.industry ||
    filters?.source || filters?.priority || filters?.contacted ||
    filters?.group || filters?.assigned_to ||
    reached.length
  )

  const handlePageChange = useCallback(page => {
    router.get('/leads', { ...filters, page }, { preserveState: true })
  }, [filters])

  const perPage = Number(filters?.per_page) || 25
  const handlePerPageChange = useCallback(n => applyFilters({ per_page: n, page: 1 }), [applyFilters])

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

  // Bulk add to group
  const openAddToGroup = async () => {
    await fetchGroups()
    setChosenGroupId(null)
    setAddGroupOpen(true)
  }

  const handleAddToGroup = () => {
    if (!chosenGroupId) return
    const ids = [...selectedIds]
    setAddingGroup(true)
    router.post(`/groups/${chosenGroupId}/leads`, { lead_ids: ids }, {
      preserveState: true,
      onSuccess: () => {
        toast.success(`${ids.length} lead${ids.length !== 1 ? 's' : ''} added to group`)
        setSelectedIds(new Set())
        setAddGroupOpen(false)
      },
      onError: () => toast.error('Failed to add leads to group'),
      onFinish: () => setAddingGroup(false),
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
              className="font-medium text-gray-900 hover:text-brand-600 text-sm leading-none block truncate"
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
      meta: { className: 'hidden md:table-cell' },
      cell: ({ getValue }) => (
        <span className="text-sm text-gray-600 truncate block max-w-[140px]">{getValue() || '—'}</span>
      ),
    },
    {
      id: 'groups',
      header: 'Group',
      size: 140,
      enableSorting: false,
      meta: { className: 'hidden md:table-cell' },
      cell: ({ row }) => {
        const grps = row.original.groups ?? []
        if (!grps.length) return <span className="text-gray-200 text-xs">—</span>
        const first = grps[0]
        const extra = grps.length - 1
        return (
          <div className="flex items-center gap-1 flex-wrap">
            <span
              className="inline-flex items-center gap-1 text-[11px] font-medium px-1.5 py-0.5 rounded-full border"
              style={{
                background: (first.color ?? 'rgb(var(--brand2-500))') + '18',
                borderColor: (first.color ?? 'rgb(var(--brand2-500))') + '40',
                color: first.color ?? 'rgb(var(--brand2-500))',
              }}
            >
              <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: first.color ?? 'rgb(var(--brand2-500))' }} />
              {first.name}
            </span>
            {extra > 0 && <span className="text-[10px] text-slate-400">+{extra}</span>}
          </div>
        )
      },
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
      meta: { className: 'hidden md:table-cell' },
      cell: ({ getValue }) => <PriorityBadge priority={getValue()} />,
    },
    {
      id: 'social',
      header: 'Social',
      size: 110,
      meta: { className: 'hidden lg:table-cell' },
      cell: ({ row }) => <SocialLinks handles={row.original.social_handles} linkedinUrl={row.original.linkedin_url} />,
    },
    {
      id: 'outreach',
      header: 'Outreach',
      size: 120,
      enableSorting: false,
      meta: { className: 'hidden lg:table-cell' },
      cell: ({ row }) => <OutreachChannels key={row.original.id} lead={row.original} />,
    },
    {
      accessorKey: 'deal_value',
      header: 'Value',
      size: 100,
      meta: { className: 'hidden md:table-cell' },
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
            <Button variant="ghost" size="icon" className="h-7 w-7 text-slate-400 hover:text-brand2-600 transition-colors">
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

        {/* ── Inline filter toolbar ── every filter sits next to the search bar ── */}
        <div className="flex flex-wrap items-center gap-2 mb-4">
          <SearchInput
            value={filters?.search ?? ''}
            onChange={handleSearch}
            placeholder="Search leads…"
            className="w-full sm:w-56"
          />

          <InlineSelect
            icon={<Filter size={13} className="shrink-0 opacity-60" />}
            placeholder="All statuses"
            value={filters?.status}
            options={STATUS_OPTIONS}
            onChange={handleStatusFilter}
          />
          <InlineSelect
            icon={<MapPin size={13} className="shrink-0 opacity-60" />}
            placeholder="Any country"
            value={filters?.country}
            options={toOptions('Any country', filterOptions?.countries)}
            onChange={v => applyFilters({ country: v })}
          />
          <InlineSelect
            icon={<MapPin size={13} className="shrink-0 opacity-60" />}
            placeholder="Any city"
            value={filters?.city}
            options={toOptions('Any city', filterOptions?.cities)}
            onChange={v => applyFilters({ city: v })}
          />
          <InlineSelect
            placeholder="Any industry"
            value={filters?.industry}
            options={toOptions('Any industry', filterOptions?.industries)}
            onChange={v => applyFilters({ industry: v })}
          />
          <InlineSelect
            placeholder="Any source"
            value={filters?.source}
            options={toOptions('Any source', filterOptions?.sources)}
            onChange={v => applyFilters({ source: v })}
          />
          <InlineSelect
            placeholder="Any priority"
            value={filters?.priority}
            options={PRIORITY_OPTIONS}
            onChange={v => applyFilters({ priority: v })}
          />
          <InlineSelect
            placeholder="Anyone"
            value={filters?.contacted}
            options={CONTACTED_OPTIONS}
            onChange={v => applyFilters({ contacted: v })}
          />
          <InlineSelect
            icon={<UsersRound size={13} className="shrink-0 opacity-60" />}
            placeholder="Any group"
            value={filters?.group}
            options={[
              { value: 'all', label: 'Any group' },
              ...(filterOptions?.groups ?? []).map(g => ({ value: String(g.id), label: g.name })),
            ]}
            onChange={v => applyFilters({ group: v })}
          />
          <InlineSelect
            icon={<UsersRound size={13} className="shrink-0 opacity-60" />}
            placeholder="Anyone"
            value={filters?.assigned_to ? String(filters.assigned_to) : undefined}
            options={[
              { value: 'all', label: 'Anyone' },
              ...(filterOptions?.users ?? []).map(u => ({ value: String(u.id), label: u.name })),
            ]}
            onChange={v => applyFilters({ assigned_to: v })}
          />

          {/* ── Reached-on multi-select (one compact dropdown for all channels) ── */}
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className={`h-9 gap-1.5 text-sm transition-colors ${
                  reached.length
                    ? 'border-brand-300 bg-brand-50 text-brand-700 font-medium hover:bg-brand-50'
                    : 'bg-white text-slate-600'
                }`}
              >
                <Send size={13} className="opacity-60" />
                Reached on
                {reached.length > 0 && (
                  <span className="ml-0.5 inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-brand-600 text-white text-[10px] font-semibold">
                    {reached.length}
                  </span>
                )}
                <ChevronDown size={13} className="opacity-60" />
              </Button>
            </PopoverTrigger>
            <PopoverContent
              align="start"
              className="w-[300px] p-3 bg-white border border-slate-200 shadow-xl rounded-xl"
            >
              <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-slate-400 mb-2">
                <Send size={11} /> Already reached on
              </p>
              <div className="grid grid-cols-2 gap-1.5">
                {CONTACT_CHANNELS.map(ch => {
                  const active = reached.includes(ch.key)
                  return (
                    <button
                      key={ch.key}
                      type="button"
                      onClick={() => toggleReached(ch.key)}
                      className={`flex items-center gap-2 h-9 px-2.5 rounded-lg border text-left transition-colors ${
                        active ? 'border-brand-300 bg-brand-50' : 'border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <span
                        className="inline-flex items-center justify-center w-[18px] h-[18px] rounded text-white font-bold shrink-0"
                        style={{ background: ch.bg, fontSize: '9px', letterSpacing: '-0.5px' }}
                      >
                        {ch.letter.toUpperCase()}
                      </span>
                      <span className={`text-xs flex-1 truncate ${active ? 'font-medium text-slate-800' : 'text-slate-500'}`}>
                        {ch.label}
                      </span>
                      {active && <Check size={13} className="text-brand-600 shrink-0" />}
                    </button>
                  )
                })}
              </div>
            </PopoverContent>
          </Popover>

          {/* ── Single clear-all · always visible, disabled when nothing to clear ── */}
          <Button
            variant="ghost"
            size="sm"
            onClick={clearAllFilters}
            disabled={!hasActiveFilters}
            className="h-9 gap-1.5 text-sm text-slate-500 hover:text-slate-700 disabled:opacity-40"
          >
            <X size={13} /> Clear all filters
          </Button>
        </div>

        <DataTable
          data={rows}
          columns={columns}
          pagination={pagination}
          onPageChange={handlePageChange}
          loading={loading}
          perPageSelector={
            <Select value={String(perPage)} onValueChange={v => handlePerPageChange(Number(v))}>
              <SelectTrigger className="h-7 w-auto text-xs gap-1 border-slate-200">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[25, 50, 100, 200].map(n => (
                  <SelectItem key={n} value={String(n)} className="text-xs">{n} per page</SelectItem>
                ))}
              </SelectContent>
            </Select>
          }
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

        {/* ── Add to Group dialog ── */}
        <Dialog open={addGroupOpen} onOpenChange={open => { if (!open) setAddGroupOpen(false) }}>
          <DialogContent className="max-w-sm">
            <DialogHeader>
              <DialogTitle className="text-sm font-semibold">
                Add {selectionCount} lead{selectionCount !== 1 ? 's' : ''} to Group
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-1.5 max-h-60 overflow-y-auto">
              {groups.length === 0 && (
                <p className="text-xs text-slate-400 text-center py-4">No groups yet. Create one first.</p>
              )}
              {groups.map(g => (
                <button
                  key={g.id}
                  type="button"
                  onClick={() => setChosenGroupId(g.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl border text-left transition-all ${
                    chosenGroupId === g.id
                      ? 'border-brand-300 bg-brand-50'
                      : 'border-slate-100 hover:border-slate-200'
                  }`}
                >
                  <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: g.color }} />
                  <span className="text-[13px] font-medium text-slate-700 flex-1 truncate">{g.name}</span>
                  <span className="text-[11px] text-slate-400">{g.leads_count} leads</span>
                  {chosenGroupId === g.id && (
                    <div className="w-4 h-4 rounded-full bg-brand-600 flex items-center justify-center shrink-0">
                      <span className="text-white text-[9px]">✓</span>
                    </div>
                  )}
                </button>
              ))}
            </div>
            <DialogFooter className="gap-2">
              <Button variant="outline" size="sm" className="h-8 text-xs" onClick={() => setAddGroupOpen(false)}>
                Cancel
              </Button>
              <Button
                size="sm"
                disabled={!chosenGroupId || addingGroup}
                className="h-8 text-xs"
                onClick={handleAddToGroup}
              >
                {addingGroup ? 'Adding…' : 'Add to Group'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
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
            onClick={openAddToGroup}
            style={{
              display: 'flex', alignItems: 'center', gap: 5,
              background: 'rgb(var(--brand-600))',
              border: 'none',
              borderRadius: 7, padding: '4px 12px',
              color: 'white', fontSize: 12.5, fontWeight: 600,
              cursor: 'pointer', transition: 'background 0.15s',
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgb(var(--brand-700))'}
            onMouseLeave={e => e.currentTarget.style.background = 'rgb(var(--brand-600))'}
          >
            <UsersRound size={12} /> Add to Group
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
