import { Head, useForm, Link } from '@inertiajs/react'
import AppLayout from '@/Components/Layout/AppLayout'
import PageHeader from '@/Components/Common/PageHeader'
import { Button } from '@/Components/ui/button'
import { Input } from '@/Components/ui/input'
import { Label } from '@/Components/ui/label'
import { Checkbox } from '@/Components/ui/checkbox'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

const GROUP_LABELS = {
  leads: 'Leads',
  pipeline: 'Pipeline',
  campaigns: 'Campaigns',
  whatsapp: 'WhatsApp',
  inbox: 'Inbox',
  clients_projects: 'Clients & Projects',
  invoices: 'Invoices',
  team: 'Team',
  settings: 'Settings',
  dashboard: 'Dashboard',
  reports: 'Reports',
  twilio: 'Dialer',
}

export default function RoleForm({ role, permissionGroups, selectedIds }) {
  const isEdit = !!role
  const allIds = permissionGroups.flatMap(g => g.permissions.map(p => p.id))

  const { data, setData, post, patch, processing, errors } = useForm({
    name: role?.name ?? '',
    permission_ids: selectedIds ?? [],
  })

  const toggleOne = (id) => {
    setData('permission_ids',
      data.permission_ids.includes(id)
        ? data.permission_ids.filter(x => x !== id)
        : [...data.permission_ids, id]
    )
  }

  const toggleGroup = (groupIds, checked) => {
    setData('permission_ids', checked
      ? [...new Set([...data.permission_ids, ...groupIds])]
      : data.permission_ids.filter(id => !groupIds.includes(id))
    )
  }

  const toggleAll = (checked) => {
    setData('permission_ids', checked ? allIds : [])
  }

  const allChecked = allIds.length > 0 && allIds.every(id => data.permission_ids.includes(id))

  const submit = e => {
    e.preventDefault()
    const options = { onSuccess: () => toast.success(isEdit ? 'Role updated' : 'Role created') }
    if (isEdit) {
      patch(route('settings.roles.update', role.id), options)
    } else {
      post(route('settings.roles.store'), options)
    }
  }

  return (
    <>
      <Head title={isEdit ? `Edit ${role.name}` : 'New role'} />
      <AppLayout title={isEdit ? 'Edit role' : 'New role'}>
        <PageHeader
          title={isEdit ? `Edit “${role.name}”` : 'New role'}
          description="Choose exactly what this role can see and do."
        />

        <form onSubmit={submit} className="space-y-3 max-w-5xl">
          <div className="rounded-xl border border-slate-200 bg-white p-3.5 space-y-1.5">
            <Label className="text-[12px]">Role name</Label>
            <Input value={data.name} onChange={e => setData('name', e.target.value)} className="max-w-xs" />
            {errors.name && <p className="text-[11px] text-red-500">{errors.name}</p>}
          </div>

          <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
            <div className="flex items-center justify-between px-4 py-2.5 border-b border-slate-100">
              <p className="text-[12.5px] font-semibold text-slate-700">Permissions</p>
              <label className="flex items-center gap-2 text-[12px] font-medium text-slate-600 cursor-pointer">
                <Checkbox checked={allChecked} onCheckedChange={toggleAll} />
                Select all
              </label>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2">
              {permissionGroups.map(({ group, permissions }, i) => {
                if (permissions.length === 0) return null
                const groupIds = permissions.map(p => p.id)
                const groupChecked = groupIds.every(id => data.permission_ids.includes(id))

                return (
                  <div key={group} className={cn(
                    'px-4 py-2.5 border-b border-slate-100',
                    i % 2 === 0 && 'lg:border-r'
                  )}>
                    <label className="flex items-center gap-2 mb-1.5 cursor-pointer">
                      <Checkbox checked={groupChecked} onCheckedChange={(c) => toggleGroup(groupIds, c)} />
                      <span className="text-[12px] font-semibold uppercase tracking-wide text-slate-500">
                        {GROUP_LABELS[group] ?? group}
                      </span>
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 pl-6">
                      {permissions.map(p => (
                        <label key={p.id} className="flex items-center gap-2 text-[12.5px] text-slate-700 cursor-pointer">
                          <Checkbox
                            checked={data.permission_ids.includes(p.id)}
                            onCheckedChange={() => toggleOne(p.id)}
                          />
                          {p.label}
                        </label>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button type="submit" disabled={processing}>
              {processing ? 'Saving…' : isEdit ? 'Save changes' : 'Create role'}
            </Button>
            <Link href={route('settings.roles.index')}>
              <Button type="button" variant="outline">Cancel</Button>
            </Link>
          </div>
        </form>
      </AppLayout>
    </>
  )
}
