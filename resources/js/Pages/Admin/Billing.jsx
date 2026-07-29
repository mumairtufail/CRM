import { Head, router } from '@inertiajs/react'
import { useCallback, useState } from 'react'
import AdminLayout from '@/Components/Layout/AdminLayout'
import PageHeader from '@/Components/Common/PageHeader'
import DataTable from '@/Components/Common/DataTable'
import ConfirmDialog from '@/Components/Common/ConfirmDialog'
import { Badge } from '@/Components/ui/badge'
import { Button } from '@/Components/ui/button'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/Components/ui/tabs'
import { CreditCard, Receipt, Download, PauseCircle, PlayCircle } from 'lucide-react'
import { toast } from 'sonner'

const ACTIVE_STATUSES = ['active', 'trialing', 'past_due']

function OrgCell({ organization }) {
  if (!organization) return <span className="text-gray-300 text-sm">—</span>
  return (
    <div className="min-w-0">
      <p className="text-sm text-gray-700 truncate">{organization.name}</p>
    </div>
  )
}

export default function AdminBilling({ subscriptions, transactions }) {
  const { data: subRows, ...subPagination } = subscriptions
  const { data: txnRows, ...txnPagination } = transactions
  const [actingId, setActingId] = useState(null)
  const [pauseTarget, setPauseTarget] = useState(null)

  const handleSubsPage = useCallback((page) => {
    router.get('/admin/billing', { subs_page: page }, { preserveState: true })
  }, [])

  const handleTxnsPage = useCallback((page) => {
    router.get('/admin/billing', { txns_page: page }, { preserveState: true })
  }, [])

  const confirmPause = () => {
    const subscription = pauseTarget
    setActingId(subscription.id)
    router.post(`/admin/billing/${subscription.id}/pause`, {}, {
      preserveScroll: true,
      onSuccess: () => { toast.success('Subscription will pause at the end of the current period.'); setPauseTarget(null) },
      onError: () => toast.error('Failed to pause subscription.'),
      onFinish: () => setActingId(null),
    })
  }

  // Also cancels a scheduled-but-not-yet-effective pause — resume() is the
  // correct call for both, per Admin\BillingController::resume().
  const resume = (subscription) => {
    setActingId(subscription.id)
    router.post(`/admin/billing/${subscription.id}/resume`, {}, {
      preserveScroll: true,
      onSuccess: () => toast.success(subscription.status === 'paused' ? 'Subscription resumed.' : 'Scheduled pause canceled.'),
      onError: () => toast.error('Failed to resume subscription.'),
      onFinish: () => setActingId(null),
    })
  }

  const subColumns = [
    { id: 'organization', header: 'Organization', size: 220, cell: ({ row }) => <OrgCell organization={row.original.organization} /> },
    { id: 'plan', header: 'Plan', size: 120, cell: ({ row }) => <span className="text-sm text-gray-700 capitalize">{row.original.plan_slug || '—'}</span> },
    {
      id: 'status', header: 'Status', size: 140,
      cell: ({ row }) => (
        <Badge variant={ACTIVE_STATUSES.includes(row.original.status) ? 'default' : 'secondary'}>
          {row.original.status}
        </Badge>
      ),
    },
    {
      id: 'scheduled', header: 'Scheduled change', size: 160,
      cell: ({ row }) => row.original.scheduled_change_action
        ? <span className="text-xs text-amber-600 capitalize">{row.original.scheduled_change_action}</span>
        : <span className="text-gray-300 text-sm">—</span>,
    },
    { id: 'created_at', header: 'Since', size: 120, cell: ({ row }) => <span className="text-sm text-gray-500">{row.original.created_at}</span> },
    {
      id: 'actions', header: '', size: 140,
      cell: ({ row }) => {
        const s = row.original
        const busy = actingId === s.id
        const isPaused = s.status === 'paused'
        const isPausing = s.scheduled_change_action === 'pause'
        if (isPaused || isPausing) {
          return (
            <Button type="button" variant="outline" size="sm" disabled={busy} onClick={() => resume(s)} className="h-7 text-[11px] gap-1">
              <PlayCircle size={11} /> {isPaused ? 'Resume' : 'Cancel pause'}
            </Button>
          )
        }
        if (ACTIVE_STATUSES.includes(s.status)) {
          return (
            <Button type="button" variant="outline" size="sm" disabled={busy} onClick={() => setPauseTarget(s)} className="h-7 text-[11px] gap-1">
              <PauseCircle size={11} /> Pause
            </Button>
          )
        }
        return null
      },
    },
  ]

  const txnColumns = [
    { id: 'organization', header: 'Organization', size: 220, cell: ({ row }) => <OrgCell organization={row.original.organization} /> },
    { id: 'plan', header: 'Plan', size: 100, cell: ({ row }) => <span className="text-sm text-gray-700 capitalize">{row.original.plan_slug || '—'}</span> },
    { id: 'total', header: 'Amount', size: 100, cell: ({ row }) => <span className="text-sm font-semibold text-gray-800">{row.original.total}</span> },
    {
      id: 'status', header: 'Status', size: 120,
      cell: ({ row }) => (
        <Badge variant={row.original.status === 'completed' || row.original.status === 'paid' ? 'default' : 'secondary'}>
          {row.original.status}
        </Badge>
      ),
    },
    { id: 'billed_at', header: 'Date', size: 110, cell: ({ row }) => <span className="text-sm text-gray-500">{row.original.billed_at || '—'}</span> },
    {
      id: 'invoice', header: '', size: 90,
      cell: ({ row }) => (
        <a href={`/admin/billing/invoices/${row.original.id}/download`} className="inline-flex items-center gap-1 text-brand-600 text-xs font-medium hover:underline">
          <Download size={12} /> PDF
        </a>
      ),
    },
  ]

  return (
    <>
      <Head title="Billing" />
      <div className="p-4 sm:p-6">
        <PageHeader title="Billing" description="Every organization's subscription status and invoice history." />

        <Tabs defaultValue="subscriptions">
          <TabsList className="h-9 bg-slate-100/70 p-0.5 mb-4">
            <TabsTrigger value="subscriptions" className="text-[12.5px] px-3.5 h-8 gap-1.5"><CreditCard size={13} /> Subscriptions</TabsTrigger>
            <TabsTrigger value="transactions" className="text-[12.5px] px-3.5 h-8 gap-1.5"><Receipt size={13} /> Invoices</TabsTrigger>
          </TabsList>

          <TabsContent value="subscriptions">
            <DataTable data={subRows} columns={subColumns} pagination={subPagination} onPageChange={handleSubsPage} />
          </TabsContent>

          <TabsContent value="transactions">
            <DataTable data={txnRows} columns={txnColumns} pagination={txnPagination} onPageChange={handleTxnsPage} />
          </TabsContent>
        </Tabs>
      </div>

      <ConfirmDialog
        open={!!pauseTarget}
        onOpenChange={(open) => { if (!open) setPauseTarget(null) }}
        title={pauseTarget ? `Pause ${pauseTarget.organization?.name}'s subscription?` : undefined}
        description="They keep access until the end of their current billing period."
        onConfirm={confirmPause}
        loading={!!actingId}
        confirmText="Pause subscription"
        loadingText="Pausing…"
        variant="default"
      />
    </>
  )
}

AdminBilling.layout = (page) => <AdminLayout children={page} />
