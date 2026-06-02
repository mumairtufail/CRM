import { Head, router } from '@inertiajs/react'
import { useCallback, useState, useEffect } from 'react'
import AdminLayout from '@/Components/Layout/AdminLayout'
import PageHeader from '@/Components/Common/PageHeader'
import DataTable from '@/Components/Common/DataTable'
import SearchInput from '@/Components/Common/SearchInput'
import { Users, UserCircle } from 'lucide-react'

export default function AdminOrganizations({ organizations, filters }) {
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const start = router.on('start', () => setLoading(true))
    const finish = router.on('finish', () => setLoading(false))
    return () => { start(); finish() }
  }, [])

  const { data: rows, ...pagination } = organizations

  const handleSearch = useCallback(search => {
    router.get('/admin/organizations', { ...filters, search, page: 1 }, { preserveState: true, replace: true })
  }, [filters])

  const handlePageChange = useCallback(page => {
    router.get('/admin/organizations', { ...filters, page }, { preserveState: true })
  }, [filters])

  const columns = [
    {
      id: 'organization',
      header: 'Organization',
      size: 240,
      cell: ({ row }) => (
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-[12px] font-bold shrink-0"
            style={{ background: 'linear-gradient(135deg, #7C3AED 0%, #4F46E5 100%)' }}>
            {row.original.name.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="font-medium text-gray-900 text-sm leading-none truncate">{row.original.name}</p>
            <p className="text-xs text-gray-400 mt-0.5 truncate">/{row.original.slug}</p>
          </div>
        </div>
      ),
    },
    {
      id: 'owner',
      header: 'Owner',
      size: 200,
      cell: ({ row }) => row.original.owner
        ? (
          <div className="min-w-0">
            <p className="text-sm text-gray-700 truncate">{row.original.owner.name}</p>
            <p className="text-xs text-gray-400 truncate">{row.original.owner.email}</p>
          </div>
        )
        : <span className="text-gray-300 text-sm">—</span>,
    },
    {
      accessorKey: 'users_count',
      header: 'Users',
      size: 90,
      cell: ({ getValue }) => (
        <span className="inline-flex items-center gap-1.5 text-sm text-gray-600">
          <Users size={13} className="text-slate-400" />{getValue()}
        </span>
      ),
    },
    {
      accessorKey: 'leads_count',
      header: 'Leads',
      size: 90,
      cell: ({ getValue }) => (
        <span className="inline-flex items-center gap-1.5 text-sm text-gray-600">
          <UserCircle size={13} className="text-slate-400" />{getValue()}
        </span>
      ),
    },
    {
      accessorKey: 'created_at',
      header: 'Created',
      size: 110,
      cell: ({ getValue }) => <span className="text-sm text-gray-500">{getValue()}</span>,
    },
  ]

  return (
    <>
      <Head title="Admin · Organizations" />
      <AdminLayout title="Organizations">
        <PageHeader
          title="All Organizations"
          description={`${pagination.total ?? 0} workspaces on the platform`}
        />

        <div className="mb-4">
          <SearchInput
            value={filters?.search ?? ''}
            onChange={handleSearch}
            placeholder="Search by name or URL…"
            className="w-full sm:w-72"
          />
        </div>

        <DataTable
          data={rows}
          columns={columns}
          pagination={pagination}
          onPageChange={handlePageChange}
          loading={loading}
        />
      </AdminLayout>
    </>
  )
}
