import { router } from '@inertiajs/react'
import { useCallback, useState, useEffect } from 'react'
import PageHeader from '@/Components/Common/PageHeader'
import DataTable from '@/Components/Common/DataTable'
import SearchInput from '@/Components/Common/SearchInput'
import { Switch } from '@/Components/ui/switch'
import {
  Select, SelectTrigger, SelectValue, SelectContent, SelectItem,
} from '@/Components/ui/select'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { AlertTriangle } from 'lucide-react'

const PLAN_STYLES = {
  trial:     'bg-amber-50 text-amber-700 border-amber-200',
  paid:      'bg-emerald-50 text-emerald-700 border-emerald-200',
  suspended: 'bg-red-50 text-red-700 border-red-200',
}

export default function TenantsTab({ organizations, filters, platformCredentialActive }) {
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const start = router.on('start', () => setLoading(true))
    const finish = router.on('finish', () => setLoading(false))
    return () => { start(); finish() }
  }, [])

  const { data: rows, ...pagination } = organizations

  const handleSearch = useCallback(search => {
    router.get('/admin/whatsapp-settings', { ...filters, tenant_search: search, tenant_page: 1 }, { preserveState: true, replace: true })
  }, [filters])

  const handlePageChange = useCallback(page => {
    router.get('/admin/whatsapp-settings', { ...filters, tenant_page: page }, { preserveState: true })
  }, [filters])

  const patch = (org, fields) => {
    router.patch(route('admin.whatsapp-tenants.update', org.id), {
      is_enabled:             fields.is_enabled ?? org.is_enabled,
      plan_type:              fields.plan_type ?? org.plan_type,
      monthly_message_quota:  fields.monthly_message_quota !== undefined ? fields.monthly_message_quota : org.monthly_message_quota,
      billing_note:           org.billing_note,
    }, {
      preserveState: true,
      preserveScroll: true,
      onError: (errors) => toast.error(errors.is_enabled ?? 'Could not update WhatsApp access.'),
      onSuccess: () => toast.success(`WhatsApp access updated for ${org.name}.`),
    })
  }

  const columns = [
    {
      id: 'organization',
      header: 'Organization',
      size: 220,
      cell: ({ row }) => (
        <div className="min-w-0">
          <p className="font-medium text-gray-900 text-sm leading-none truncate">{row.original.name}</p>
          <p className="text-xs text-gray-400 mt-0.5 truncate">/{row.original.slug}</p>
        </div>
      ),
    },
    {
      id: 'enabled',
      header: 'Enabled',
      size: 100,
      cell: ({ row }) => (
        <Switch
          checked={row.original.is_enabled}
          disabled={!platformCredentialActive && !row.original.is_enabled}
          title={!platformCredentialActive && !row.original.is_enabled ? 'Configure pooled credentials first' : undefined}
          onCheckedChange={(checked) => patch(row.original, { is_enabled: checked })}
        />
      ),
    },
    {
      id: 'plan',
      header: 'Plan',
      size: 150,
      cell: ({ row }) => (
        <Select value={row.original.plan_type} onValueChange={(v) => patch(row.original, { plan_type: v })}>
          <SelectTrigger className={cn('h-8 text-[12px] w-[130px] border', PLAN_STYLES[row.original.plan_type])}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="trial">Trial</SelectItem>
            <SelectItem value="paid">Paid</SelectItem>
            <SelectItem value="suspended">Suspended</SelectItem>
          </SelectContent>
        </Select>
      ),
    },
    {
      id: 'quota',
      header: 'Monthly Quota',
      size: 130,
      cell: ({ row }) => (
        <input
          type="number"
          min={0}
          defaultValue={row.original.monthly_message_quota ?? ''}
          placeholder="Unlimited"
          className="h-8 w-24 text-[12.5px] px-2 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-200"
          onBlur={(e) => {
            const value = e.target.value === '' ? null : parseInt(e.target.value, 10)
            if (value !== row.original.monthly_message_quota) {
              patch(row.original, { monthly_message_quota: value })
            }
          }}
        />
      ),
    },
    {
      id: 'usage',
      header: 'Usage this month',
      size: 160,
      cell: ({ row }) => (
        <div className="text-[12.5px] text-slate-600">
          <span className="font-semibold text-slate-800">{row.original.used_this_month}</span>
          {row.original.monthly_message_quota ? ` / ${row.original.monthly_message_quota}` : ' sent'}
          {row.original.failed_this_month > 0 && (
            <span className="ml-1.5 text-red-500">({row.original.failed_this_month} failed)</span>
          )}
        </div>
      ),
    },
  ]

  return (
    <>
      <PageHeader
        title="WhatsApp Access"
        description="Toggle WhatsApp on/off per tenant, set plan tier and monthly quota"
      />

      {!platformCredentialActive && (
        <div className="flex items-center gap-2.5 px-4 py-3 rounded-xl mb-4 border bg-amber-50 border-amber-200 text-amber-700 text-[13px]">
          <AlertTriangle size={15} className="shrink-0" />
          No active pooled WhatsApp credentials configured yet — enable it on the Settings tab first before turning tenants on.
        </div>
      )}

      <div className="mb-4">
        <SearchInput
          value={filters?.tenant_search ?? ''}
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
    </>
  )
}
