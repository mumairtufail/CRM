import { Head, router } from '@inertiajs/react'
import { useCallback, useState, useEffect } from 'react'
import AdminLayout from '@/Components/Layout/AdminLayout'
import PageHeader from '@/Components/Common/PageHeader'
import DataTable from '@/Components/Common/DataTable'
import SearchInput from '@/Components/Common/SearchInput'
import ConfirmDialog from '@/Components/Common/ConfirmDialog'
import { Button } from '@/Components/ui/button'
import { Eye } from 'lucide-react'
import { toast } from 'sonner'

const ROLE_STYLES = {
  owner:  'bg-violet-50 text-violet-600',
  member: 'bg-slate-100 text-slate-500',
}

export default function AdminUsers({ users, filters }) {
  const [loading, setLoading] = useState(false)
  const [impersonateUser, setImpersonateUser] = useState(null)
  const [impersonating, setImpersonating] = useState(false)

  useEffect(() => {
    const start = router.on('start', () => setLoading(true))
    const finish = router.on('finish', () => setLoading(false))
    return () => { start(); finish() }
  }, [])

  const { data: rows, ...pagination } = users

  const handleSearch = useCallback(search => {
    router.get('/admin/users', { ...filters, search, page: 1 }, { preserveState: true, replace: true })
  }, [filters])

  const handlePageChange = useCallback(page => {
    router.get('/admin/users', { ...filters, page }, { preserveState: true })
  }, [filters])

  const confirmImpersonate = () => {
    if (!impersonateUser) return
    setImpersonating(true)
    router.post(`/admin/users/${impersonateUser.id}/impersonate`, {}, {
      onError: () => { toast.error('Could not impersonate user'); setImpersonating(false) },
    })
  }

  const columns = [
    {
      id: 'user',
      header: 'User',
      size: 240,
      cell: ({ row }) => (
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500 text-[12px] font-bold shrink-0">
            {row.original.name.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="font-medium text-gray-900 text-sm leading-none truncate">{row.original.name}</span>
            </div>
            <p className="text-xs text-gray-400 mt-0.5 truncate">{row.original.email}</p>
          </div>
        </div>
      ),
    },
    {
      id: 'organization',
      header: 'Organization',
      size: 180,
      cell: ({ row }) => row.original.organization
        ? <span className="text-sm text-gray-600 truncate block max-w-[160px]">{row.original.organization.name}</span>
        : <span className="text-gray-300 text-sm">— Platform —</span>,
    },
    {
      accessorKey: 'role',
      header: 'Role',
      size: 100,
      cell: ({ row }) => (
        <span className={`inline-block px-2 py-0.5 rounded-full text-[10.5px] font-semibold capitalize ${ROLE_STYLES[row.original.role] || ROLE_STYLES.member}`}>{row.original.role}</span>
      ),
    },
    {
      accessorKey: 'created_at',
      header: 'Joined',
      size: 110,
      cell: ({ getValue }) => <span className="text-sm text-gray-500">{getValue()}</span>,
    },
    {
      id: 'actions',
      header: '',
      size: 120,
      cell: ({ row }) => (
        <Button
          variant="outline"
          size="sm"
          className="h-7 gap-1.5 text-[12px]"
          onClick={() => setImpersonateUser(row.original)}
        >
          <Eye size={12} /> Impersonate
        </Button>
      ),
    },
  ]

  return (
    <>
      <Head title="Admin · Users" />
      <AdminLayout title="Users">
        <PageHeader
          title="All Users"
          description={`${pagination.total ?? 0} registered users across all workspaces`}
        />

        <div className="mb-4">
          <SearchInput
            value={filters?.search ?? ''}
            onChange={handleSearch}
            placeholder="Search by name or email…"
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

        <ConfirmDialog
          open={!!impersonateUser}
          onOpenChange={open => !open && !impersonating && setImpersonateUser(null)}
          title={`Impersonate ${impersonateUser?.name}?`}
          description="You'll be logged in as this user and see exactly what they see. Use the banner at the top to return to your admin account."
          confirmText="Impersonate"
          loadingText="Switching…"
          variant="default"
          onConfirm={confirmImpersonate}
          loading={impersonating}
        />
      </AdminLayout>
    </>
  )
}
