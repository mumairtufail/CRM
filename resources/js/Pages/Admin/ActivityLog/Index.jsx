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

const ACTION_COLORS = {
  auth:    'bg-blue-50 text-blue-700 border-blue-100',
  lead:    'bg-violet-50 text-violet-700 border-violet-100',
  client:  'bg-emerald-50 text-emerald-700 border-emerald-100',
  project: 'bg-amber-50 text-amber-700 border-amber-100',
  invoice: 'bg-teal-50 text-teal-700 border-teal-100',
  twilio:  'bg-pink-50 text-pink-700 border-pink-100',
  dialer:  'bg-pink-50 text-pink-700 border-pink-100',
  smtp:    'bg-sky-50 text-sky-700 border-sky-100',
}

function ActionBadge({ action }) {
  const group = action?.split('.')[0]
  return (
    <Badge variant="outline" className={`font-mono text-[11px] font-normal ${ACTION_COLORS[group] ?? 'bg-slate-50 text-slate-600 border-slate-100'}`}>
      {action}
    </Badge>
  )
}

export default function Index({ logs, filters, organizations, actions }) {
  const [user, setUser] = useState(filters.user ?? '')
  const [ip, setIp] = useState(filters.ip ?? '')

  const applyFilters = (next) => {
    router.get(route('admin.activity-log.index'), { ...filters, ...next }, {
      preserveState: true, preserveScroll: true, replace: true,
    })
  }

  const hasFilters = filters.organization_id || filters.user || filters.action || filters.ip || filters.from || filters.to

  const columns = [
    {
      header: 'Organization',
      accessorKey: 'organization',
      cell: ({ row }) => <span className="text-[13px] text-slate-600">{row.original.organization}</span>,
    },
    {
      header: 'User',
      accessorKey: 'causer_name',
      cell: ({ row }) => <span className="text-[13px] font-medium text-slate-700">{row.original.causer_name}</span>,
    },
    {
      header: 'Action',
      accessorKey: 'action',
      cell: ({ row }) => <ActionBadge action={row.original.action} />,
    },
    {
      header: 'Description',
      accessorKey: 'description',
      cell: ({ row }) => <span className="text-[13px] text-slate-600">{row.original.description}</span>,
    },
    {
      header: 'IP Address',
      accessorKey: 'ip_address',
      cell: ({ row }) => <span className="text-[12.5px] font-mono text-slate-500">{row.original.ip_address ?? '—'}</span>,
    },
    {
      header: 'Date / Time',
      accessorKey: 'created_at',
      cell: ({ row }) => <span className="text-[12.5px] text-slate-500">{row.original.created_at}</span>,
    },
  ]

  return (
    <>
      <Head title="Activity Log" />
      <AdminLayout title="Activity Log">
        <PageHeader
          title="Activity log"
          description="Who did what, in which workspace, and from where — kept for the last 30 days."
        />

        <div className="flex flex-wrap items-center gap-2 mb-4">
          <Select value={filters.organization_id ?? 'all'} onValueChange={v => applyFilters({ organization_id: v === 'all' ? undefined : v })}>
            <SelectTrigger className="h-9 w-[200px] bg-white text-sm"><SelectValue placeholder="All organizations" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All organizations</SelectItem>
              {organizations.map(o => <SelectItem key={o.id} value={String(o.id)}>{o.name}</SelectItem>)}
            </SelectContent>
          </Select>

          <Select value={filters.action ?? 'all'} onValueChange={v => applyFilters({ action: v === 'all' ? undefined : v })}>
            <SelectTrigger className="h-9 w-[200px] bg-white text-sm"><SelectValue placeholder="All actions" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All actions</SelectItem>
              {actions.map(a => <SelectItem key={a} value={a}>{a}</SelectItem>)}
            </SelectContent>
          </Select>

          <SearchInput
            value={user}
            onChange={v => { setUser(v); applyFilters({ user: v || undefined }) }}
            placeholder="Search user name..."
            className="w-[180px]"
          />

          <SearchInput
            value={ip}
            onChange={v => { setIp(v); applyFilters({ ip: v || undefined }) }}
            placeholder="Search IP address..."
            className="w-[180px]"
          />

          <Input type="date" value={filters.from ?? ''} onChange={e => applyFilters({ from: e.target.value || undefined })} className="h-9 w-[150px] bg-white text-sm" />
          <span className="text-slate-400 text-sm">to</span>
          <Input type="date" value={filters.to ?? ''} onChange={e => applyFilters({ to: e.target.value || undefined })} className="h-9 w-[150px] bg-white text-sm" />

          {hasFilters && (
            <Button variant="ghost" size="sm" onClick={() => { setUser(''); setIp(''); router.get(route('admin.activity-log.index')) }}>
              Clear filters
            </Button>
          )}
        </div>

        <DataTable
          data={logs.data}
          columns={columns}
          pagination={logs}
          onPageChange={page => applyFilters({ page })}
        />
      </AdminLayout>
    </>
  )
}
