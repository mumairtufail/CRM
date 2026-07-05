import { Head, router } from '@inertiajs/react'
import { useCallback, useState, useEffect } from 'react'
import AdminLayout from '@/Components/Layout/AdminLayout'
import PageHeader from '@/Components/Common/PageHeader'
import DataTable from '@/Components/Common/DataTable'
import SearchInput from '@/Components/Common/SearchInput'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/Components/ui/dialog'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/Components/ui/select'
import { Switch } from '@/Components/ui/switch'
import { Users, UserCircle, CreditCard, Pencil, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import ConfirmDialog from '@/Components/Common/ConfirmDialog'

function ChangePlanDialog({ organization, plans, onOpenChange }) {
  const [planId, setPlanId] = useState(organization.plan?.id ? String(organization.plan.id) : '')
  const [active, setActive] = useState(organization.plan_status === 'active')
  const [saving, setSaving] = useState(false)

  const submit = () => {
    setSaving(true)
    router.patch(`/admin/organizations/${organization.id}/plan`, {
      plan_id: planId || null,
      plan_status: active ? 'active' : 'inactive',
    }, {
      preserveScroll: true,
      onSuccess: () => { toast.success(`Updated ${organization.name}'s plan`); onOpenChange(false) },
      onError: () => toast.error('Could not update plan'),
      onFinish: () => setSaving(false),
    })
  }

  return (
    <Dialog open onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Change plan — {organization.name}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Plan</label>
            <Select value={planId} onValueChange={setPlanId}>
              <SelectTrigger>
                <SelectValue placeholder="No plan" />
              </SelectTrigger>
              <SelectContent>
                {plans.map(p => (
                  <SelectItem key={p.id} value={String(p.id)}>{p.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between rounded-lg border border-slate-200 px-3 py-2.5">
            <div>
              <p className="text-sm font-medium text-slate-700">Plan active</p>
              <p className="text-xs text-slate-400">Suspends module access without removing the plan</p>
            </div>
            <Switch checked={active} onCheckedChange={setActive} />
          </div>
        </div>

        <DialogFooter>
          <button
            onClick={() => onOpenChange(false)}
            className="px-4 py-2 rounded-lg text-sm font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={submit}
            disabled={saving}
            className="px-4 py-2 rounded-lg text-sm font-semibold text-white transition-all hover:opacity-90 disabled:opacity-60"
            style={{ background: 'linear-gradient(135deg,rgb(var(--brand-600)),rgb(var(--brand2-600)))' }}
          >
            {saving ? 'Saving…' : 'Save'}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default function AdminOrganizations({ organizations, filters, plans }) {
  const [loading, setLoading] = useState(false)
  const [planTarget, setPlanTarget] = useState(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedOrg, setSelectedOrg] = useState(null)
  const [deleting, setDeleting] = useState(false)
  const [selectedIds, setSelectedIds] = useState([])
  const [deleteMode, setDeleteMode] = useState('single') // 'single' | 'bulk'

  const requestDeleteOrg = (org) => {
    setDeleteMode('single')
    setSelectedOrg(org)
    setIsDeleteDialogOpen(true)
  }

  const requestBulkDelete = () => {
    if (selectedIds.length === 0) return
    setDeleteMode('bulk')
    setIsDeleteDialogOpen(true)
  }

  const confirmDeleteOrg = () => {
    setDeleting(true)
    if (deleteMode === 'single') {
      if (!selectedOrg) return
      router.delete(`/admin/organizations/${selectedOrg.id}`, {
        onSuccess: () => {
          setIsDeleteDialogOpen(false)
          setSelectedOrg(null)
          setSelectedIds(prev => prev.filter(id => id !== selectedOrg.id))
          toast.success('Workspace deleted successfully.')
        },
        onFinish: () => {
          setDeleting(false)
        }
      })
    } else {
      router.post('/admin/organizations/bulk-delete', { ids: selectedIds }, {
        onSuccess: () => {
          setIsDeleteDialogOpen(false)
          setSelectedIds([])
          toast.success('Selected workspaces have been deleted.')
        },
        onFinish: () => {
          setDeleting(false)
        }
      })
    }
  }

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
      id: 'selection',
      header: () => (
        <input
          type="checkbox"
          checked={selectedIds.length === rows.length && rows.length > 0}
          onChange={(e) => {
            if (e.target.checked) {
              setSelectedIds(rows.map(r => r.id))
            } else {
              setSelectedIds([])
            }
          }}
          className="rounded border-slate-300 text-brand-600 focus:ring-brand-500 w-4 h-4 cursor-pointer animate-in fade-in duration-200"
        />
      ),
      size: 40,
      cell: ({ row }) => (
        <input
          type="checkbox"
          checked={selectedIds.includes(row.original.id)}
          onChange={(e) => {
            if (e.target.checked) {
              setSelectedIds(prev => [...prev, row.original.id])
            } else {
              setSelectedIds(prev => prev.filter(id => id !== row.original.id))
            }
          }}
          className="rounded border-slate-300 text-brand-600 focus:ring-brand-500 w-4 h-4 cursor-pointer"
        />
      ),
    },
    {
      id: 'organization',
      header: 'Organization',
      size: 240,
      cell: ({ row }) => (
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-[12px] font-bold shrink-0"
            style={{ background: 'linear-gradient(135deg, rgb(var(--brand-600)) 0%, rgb(var(--brand2-600)) 100%)' }}>
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
      id: 'plan',
      header: 'Plan',
      size: 160,
      cell: ({ row }) => (
        <button
          onClick={() => setPlanTarget(row.original)}
          className="group inline-flex items-center gap-2 px-2.5 py-1 rounded-lg hover:bg-brand-50 transition-colors"
        >
          <CreditCard size={13} className="text-brand-400 shrink-0" />
          <span className="text-sm text-gray-700 font-medium">{row.original.plan?.name ?? 'No plan'}</span>
          <span className={cn(
            'w-1.5 h-1.5 rounded-full shrink-0',
            row.original.plan_status === 'active' ? 'bg-emerald-500' : 'bg-slate-300'
          )} />
          <Pencil size={11} className="text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
        </button>
      ),
    },
    {
      accessorKey: 'created_at',
      header: 'Created',
      size: 110,
      cell: ({ getValue }) => <span className="text-sm text-gray-500">{getValue()}</span>,
    },
    {
      id: 'actions',
      header: 'Actions',
      size: 80,
      cell: ({ row }) => (
        <button
          onClick={() => requestDeleteOrg(row.original)}
          className="p-1.5 rounded-lg border border-red-200 hover:bg-red-50 text-red-500 hover:text-red-700 transition-colors"
          title="Delete Workspace"
        >
          <Trash2 size={13.5} />
        </button>
      ),
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

        <div className="mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <SearchInput
            value={filters?.search ?? ''}
            onChange={handleSearch}
            placeholder="Search by name or URL…"
            className="w-full sm:w-72"
          />
          {selectedIds.length > 0 && (
            <button
              onClick={requestBulkDelete}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-[13px] font-bold shadow-sm shadow-red-500/10 transition-colors cursor-pointer self-start sm:self-auto animate-in fade-in slide-in-from-top-1 duration-200"
            >
              <Trash2 size={14} />
              Delete Selected ({selectedIds.length})
            </button>
          )}
        </div>

        <DataTable
          data={rows}
          columns={columns}
          pagination={pagination}
          onPageChange={handlePageChange}
          loading={loading}
        />

        {planTarget && (
          <ChangePlanDialog
            organization={planTarget}
            plans={plans}
            onOpenChange={(open) => { if (!open) setPlanTarget(null) }}
          />
        )}

        <ConfirmDialog
          open={isDeleteDialogOpen}
          onOpenChange={setIsDeleteDialogOpen}
          title={deleteMode === 'single' ? 'Delete Workspace' : 'Delete Selected Workspaces'}
          description={deleteMode === 'single'
            ? `Are you sure you want to delete the workspace "${selectedOrg?.name}"? This will permanently delete all associated users, leads, settings, campaigns, and workspace data. This action cannot be undone.`
            : `Are you sure you want to delete the ${selectedIds.length} selected workspaces? This will permanently delete all associated users, leads, settings, campaigns, and workspace data for these workspaces. This action cannot be undone.`
          }
          onConfirm={confirmDeleteOrg}
          loading={deleting}
          confirmText="Delete"
          loadingText="Deleting..."
        />
      </AdminLayout>
    </>
  )
}
