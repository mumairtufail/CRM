import { useState } from 'react'
import { Head, Link, useForm } from '@inertiajs/react'
import AppLayout from '@/Components/Layout/AppLayout'
import PageHeader from '@/Components/Common/PageHeader'
import ConfirmDialog from '@/Components/Common/ConfirmDialog'
import { Button } from '@/Components/ui/button'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import { toast } from 'sonner'

export default function RolesIndex({ roles }) {
  const [deleting, setDeleting] = useState(null)
  const { delete: destroy, processing } = useForm({})

  const confirmDelete = () => {
    destroy(route('settings.roles.destroy', deleting.id), {
      preserveScroll: true,
      onSuccess: () => { toast.success('Role deleted'); setDeleting(null) },
      onError: (errors) => {
        toast.error(errors.role ?? 'Could not delete role')
        setDeleting(null)
      },
    })
  }

  return (
    <>
      <Head title="Roles & Permissions" />
      <AppLayout title="Roles & Permissions">
        <PageHeader
          title="Roles & permissions"
          description={`${roles.length} role${roles.length === 1 ? '' : 's'} in this workspace`}
          action={
            <Link href={route('settings.roles.create')}>
              <Button className="gap-1.5"><Plus size={14} /> New role</Button>
            </Link>
          }
        />

        <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-left">
                <th className="px-4 py-2.5 text-[11.5px] font-semibold text-slate-400 uppercase tracking-wide">Role</th>
                <th className="px-4 py-2.5 text-[11.5px] font-semibold text-slate-400 uppercase tracking-wide">Permissions</th>
                <th className="px-4 py-2.5 text-[11.5px] font-semibold text-slate-400 uppercase tracking-wide">Members</th>
                <th className="px-4 py-2.5" />
              </tr>
            </thead>
            <tbody>
              {roles.map(r => (
                <tr key={r.id} className="border-b border-slate-50 last:border-0">
                  <td className="px-4 py-2.5">
                    <span className="font-medium text-slate-800">{r.name}</span>
                    {r.is_default && (
                      <span className="ml-2 inline-block px-1.5 py-0.5 rounded text-[10px] font-semibold bg-violet-50 text-violet-600">Default</span>
                    )}
                  </td>
                  <td className="px-4 py-2.5 text-slate-600">{r.permission_count} permission{r.permission_count === 1 ? '' : 's'}</td>
                  <td className="px-4 py-2.5 text-slate-600">{r.users_count} member{r.users_count === 1 ? '' : 's'}</td>
                  <td className="px-4 py-2.5 text-right whitespace-nowrap">
                    <Link href={route('settings.roles.edit', r.id)}>
                      <Button variant="outline" size="sm" className="h-7 gap-1 text-[12px] mr-1.5">
                        <Pencil size={12} /> Edit
                      </Button>
                    </Link>
                    <Button
                      variant="outline" size="sm"
                      className="h-7 gap-1 text-[12px] text-red-500 hover:text-red-600"
                      onClick={() => setDeleting(r)}
                    >
                      <Trash2 size={12} /> Delete
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <ConfirmDialog
          open={!!deleting}
          onOpenChange={open => !open && setDeleting(null)}
          title={`Delete ${deleting?.name}?`}
          description="Reassign or remove any team members using this role first."
          confirmText="Delete"
          loadingText="Deleting…"
          onConfirm={confirmDelete}
          loading={processing}
        />
      </AppLayout>
    </>
  )
}
