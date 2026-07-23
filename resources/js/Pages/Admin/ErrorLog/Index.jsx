import { Head, router } from '@inertiajs/react'
import { useState } from 'react'
import AdminLayout from '@/Components/Layout/AdminLayout'
import PageHeader from '@/Components/Common/PageHeader'
import DataTable from '@/Components/Common/DataTable'
import SearchInput from '@/Components/Common/SearchInput'
import { Badge } from '@/Components/ui/badge'
import { Button } from '@/Components/ui/button'
import { Input } from '@/Components/ui/input'
import {
  Select, SelectTrigger, SelectValue, SelectContent, SelectItem,
} from '@/Components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/Components/ui/dialog'
import { Code2 } from 'lucide-react'

function SourceBadge({ source }) {
  return (
    <Badge variant="outline" className={source === 'backend'
      ? 'bg-red-50 text-red-700 border-red-100 text-[11px] font-normal'
      : 'bg-orange-50 text-orange-700 border-orange-100 text-[11px] font-normal'}>
      {source}
    </Badge>
  )
}

export default function Index({ errors, filters, organizations }) {
  const [search, setSearch] = useState(filters.search ?? '')
  const [viewing, setViewing] = useState(null)

  const applyFilters = (next) => {
    router.get(route('admin.error-log.index'), { ...filters, ...next }, {
      preserveState: true, preserveScroll: true, replace: true,
    })
  }

  const hasFilters = filters.source || filters.organization_id || filters.search || filters.from || filters.to

  const columns = [
    {
      header: 'Source',
      accessorKey: 'source',
      cell: ({ row }) => <SourceBadge source={row.original.source} />,
    },
    {
      header: 'Message',
      accessorKey: 'message',
      cell: ({ row }) => <span className="text-[13px] text-slate-700 line-clamp-1">{row.original.message}</span>,
    },
    {
      header: 'File : Line',
      accessorKey: 'file',
      cell: ({ row }) => (
        <span className="text-[12px] font-mono text-slate-500">
          {row.original.file ? `${row.original.file.split(/[\\/]/).pop()}${row.original.line ? `:${row.original.line}` : ''}` : '—'}
        </span>
      ),
    },
    {
      header: 'Organization',
      accessorKey: 'organization',
      cell: ({ row }) => <span className="text-[13px] text-slate-600">{row.original.organization}</span>,
    },
    {
      header: 'User',
      accessorKey: 'causer_name',
      cell: ({ row }) => <span className="text-[13px] text-slate-600">{row.original.causer_name}</span>,
    },
    {
      header: 'When',
      accessorKey: 'created_at',
      cell: ({ row }) => <span className="text-[12.5px] text-slate-500">{row.original.created_at}</span>,
    },
    {
      header: '',
      id: 'actions',
      cell: ({ row }) => (
        <Button variant="ghost" size="sm" className="gap-1.5" onClick={() => setViewing(row.original)}>
          <Code2 size={13} /> Details
        </Button>
      ),
    },
  ]

  return (
    <>
      <Head title="Error Log" />
      <AdminLayout title="Error Log">
        <PageHeader
          title="Error log"
          description="Backend exceptions and frontend crashes, with exactly where they happened — kept for the last 30 days."
        />

        <div className="flex flex-wrap items-center gap-2 mb-4">
          <Select value={filters.source ?? 'all'} onValueChange={v => applyFilters({ source: v === 'all' ? undefined : v })}>
            <SelectTrigger className="h-9 w-[160px] bg-white text-sm"><SelectValue placeholder="All sources" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All sources</SelectItem>
              <SelectItem value="backend">Backend</SelectItem>
              <SelectItem value="frontend">Frontend</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filters.organization_id ?? 'all'} onValueChange={v => applyFilters({ organization_id: v === 'all' ? undefined : v })}>
            <SelectTrigger className="h-9 w-[200px] bg-white text-sm"><SelectValue placeholder="All organizations" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All organizations</SelectItem>
              {organizations.map(o => <SelectItem key={o.id} value={String(o.id)}>{o.name}</SelectItem>)}
            </SelectContent>
          </Select>

          <SearchInput
            value={search}
            onChange={v => { setSearch(v); applyFilters({ search: v || undefined }) }}
            placeholder="Search message or file..."
            className="w-[220px]"
          />

          <Input type="date" value={filters.from ?? ''} onChange={e => applyFilters({ from: e.target.value || undefined })} className="h-9 w-[150px] bg-white text-sm" />
          <span className="text-slate-400 text-sm">to</span>
          <Input type="date" value={filters.to ?? ''} onChange={e => applyFilters({ to: e.target.value || undefined })} className="h-9 w-[150px] bg-white text-sm" />

          {hasFilters && (
            <Button variant="ghost" size="sm" onClick={() => { setSearch(''); router.get(route('admin.error-log.index')) }}>
              Clear filters
            </Button>
          )}
        </div>

        <DataTable
          data={errors.data}
          columns={columns}
          pagination={errors}
          onPageChange={page => applyFilters({ page })}
        />

        <Dialog open={!!viewing} onOpenChange={(open) => !open && setViewing(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <SourceBadge source={viewing?.source} />
                {viewing?.exception_class ?? 'Error details'}
              </DialogTitle>
              <DialogDescription>{viewing?.created_at} · {viewing?.organization} · {viewing?.causer_name} · {viewing?.ip_address}</DialogDescription>
            </DialogHeader>
            <div className="space-y-3">
              <p className="text-[13px] text-slate-700 font-medium">{viewing?.message}</p>
              {viewing?.file && (
                <p className="text-[12px] font-mono text-slate-500">{viewing.file}{viewing.line ? `:${viewing.line}` : ''}</p>
              )}
              {viewing?.url && (
                <p className="text-[12px] text-slate-500 break-all">URL: {viewing.url}</p>
              )}
              {viewing?.trace && (
                <pre className="text-[11px] font-mono bg-slate-950 text-slate-100 rounded-lg p-3 max-h-80 overflow-auto whitespace-pre-wrap break-all">
                  {viewing.trace}
                </pre>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </AdminLayout>
    </>
  )
}
