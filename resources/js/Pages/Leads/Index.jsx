import { Head, Link, router } from '@inertiajs/react'
import { useState, useCallback, useEffect } from 'react'
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
import { Plus, MoreHorizontal, Pencil, Trash2, ExternalLink, Filter } from 'lucide-react'
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

// Map platform names to short labels + colors
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

export default function LeadsIndex({ leads, filters }) {
  const [deleteId, setDeleteId] = useState(null)
  const [deleting, setDeleting] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const start = router.on('start', () => setLoading(true))
    const finish = router.on('finish', () => setLoading(false))
    return () => { start(); finish() }
  }, [])

  const { data: rows, ...pagination } = leads

  const handleSearch = useCallback(search => {
    router.get('/leads', { ...filters, search, page: 1 }, { preserveState: true, replace: true })
  }, [filters])

  const handleStatusFilter = useCallback(status => {
    router.get('/leads', { ...filters, status: status === 'all' ? undefined : status, page: 1 }, { preserveState: true, replace: true })
  }, [filters])

  const handlePageChange = useCallback(page => {
    router.get('/leads', { ...filters, page }, { preserveState: true })
  }, [filters])

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

  const columns = [
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

        <div className="flex flex-wrap items-center gap-2 mb-4">
          <SearchInput
            value={filters?.search ?? ''}
            onChange={handleSearch}
            placeholder="Search leads…"
            className="w-64"
          />
          <Select
            value={filters?.status ?? 'all'}
            onValueChange={handleStatusFilter}
          >
            <SelectTrigger className="h-9 w-40 text-sm bg-white">
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

        <ConfirmDialog
          open={!!deleteId}
          onOpenChange={open => !open && setDeleteId(null)}
          title="Delete lead?"
          description="This lead and all associated data will be permanently deleted."
          onConfirm={handleDelete}
          loading={deleting}
        />
      </AppLayout>
    </>
  )
}
