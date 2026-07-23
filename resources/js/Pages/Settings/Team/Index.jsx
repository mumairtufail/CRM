import { useState } from 'react'
import { Head, Link, useForm } from '@inertiajs/react'
import AppLayout from '@/Components/Layout/AppLayout'
import PageHeader from '@/Components/Common/PageHeader'
import ConfirmDialog from '@/Components/Common/ConfirmDialog'
import { Button } from '@/Components/ui/button'
import { Input } from '@/Components/ui/input'
import { Label } from '@/Components/ui/label'
import {
  Select, SelectTrigger, SelectValue, SelectContent, SelectItem,
} from '@/Components/ui/select'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/Components/ui/dialog'
import { Plus, UserX, Pencil, ShieldCheck } from 'lucide-react'
import { toast } from 'sonner'
import usePermissions from '@/Hooks/usePermissions'

function MemberForm({ open, onOpenChange, roles, member }) {
  const isEdit = !!member
  const { data, setData, post, patch, processing, errors, reset } = useForm({
    name:     member?.name ?? '',
    email:    member?.email ?? '',
    password: '',
    role_id:  member?.role?.id ? String(member.role.id) : '',
  })

  const submit = e => {
    e.preventDefault()
    const options = {
      preserveScroll: true,
      onSuccess: () => { onOpenChange(false); reset() },
    }
    if (isEdit) {
      patch(route('settings.team.update', member.id), options)
    } else {
      post(route('settings.team.store'), options)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit team member' : 'Add team member'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-3">
          <div className="space-y-1.5">
            <Label className="text-[12px]">Name</Label>
            <Input value={data.name} onChange={e => setData('name', e.target.value)} />
            {errors.name && <p className="text-[11px] text-red-500">{errors.name}</p>}
          </div>
          <div className="space-y-1.5">
            <Label className="text-[12px]">Email</Label>
            <Input type="email" value={data.email} onChange={e => setData('email', e.target.value)} />
            {errors.email && <p className="text-[11px] text-red-500">{errors.email}</p>}
          </div>
          {!isEdit && (
            <div className="space-y-1.5">
              <Label className="text-[12px]">Password</Label>
              <Input type="password" value={data.password} onChange={e => setData('password', e.target.value)} />
              {errors.password && <p className="text-[11px] text-red-500">{errors.password}</p>}
            </div>
          )}
          <div className="space-y-1.5">
            <Label className="text-[12px]">Role</Label>
            <Select value={data.role_id} onValueChange={v => setData('role_id', v)}>
              <SelectTrigger><SelectValue placeholder="Select a role" /></SelectTrigger>
              <SelectContent>
                {roles.map(r => (
                  <SelectItem key={r.id} value={String(r.id)}>{r.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.role_id && <p className="text-[11px] text-red-500">{errors.role_id}</p>}
          </div>
          <DialogFooter>
            <Button type="submit" disabled={processing}>
              {processing ? 'Saving…' : isEdit ? 'Save changes' : 'Add member'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default function TeamIndex({ members, roles }) {
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [deactivating, setDeactivating] = useState(null)
  const { can } = usePermissions()

  const openCreate = () => { setEditing(null); setFormOpen(true) }
  const openEdit = (m) => { setEditing(m); setFormOpen(true) }

  const { delete: destroy, processing } = useForm({})
  const confirmDeactivate = () => {
    destroy(route('settings.team.destroy', deactivating.id), {
      preserveScroll: true,
      onSuccess: () => { toast.success('Team member deactivated'); setDeactivating(null) },
    })
  }

  return (
    <>
      <Head title="Team" />
      <AppLayout title="Team">
        <PageHeader
          title="Team members"
          description={`${members.length} member${members.length === 1 ? '' : 's'} in this workspace`}
          action={
            <div className="flex items-center gap-2">
              {can('team.manage_roles') && (
                <Link href={route('settings.roles.index')}>
                  <Button variant="outline" className="gap-1.5">
                    <ShieldCheck size={14} /> Roles & permissions
                  </Button>
                </Link>
              )}
              <Button onClick={openCreate} className="gap-1.5">
                <Plus size={14} /> Add team member
              </Button>
            </div>
          }
        />

        <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-left">
                <th className="px-4 py-2.5 text-[11.5px] font-semibold text-slate-400 uppercase tracking-wide">Name</th>
                <th className="px-4 py-2.5 text-[11.5px] font-semibold text-slate-400 uppercase tracking-wide">Role</th>
                <th className="px-4 py-2.5 text-[11.5px] font-semibold text-slate-400 uppercase tracking-wide">Status</th>
                <th className="px-4 py-2.5 text-[11.5px] font-semibold text-slate-400 uppercase tracking-wide">Joined</th>
                <th className="px-4 py-2.5" />
              </tr>
            </thead>
            <tbody>
              {members.length === 0 && (
                <tr><td colSpan={5} className="px-4 py-10 text-center text-slate-400 text-[13px]">No team members yet.</td></tr>
              )}
              {members.map(m => (
                <tr key={m.id} className="border-b border-slate-50 last:border-0">
                  <td className="px-4 py-2.5">
                    <Link href={route('settings.team.show', m.id)} className="font-medium text-slate-800 hover:text-brand-600 hover:underline">
                      {m.name}
                    </Link>
                    <p className="text-slate-400 text-[12px]">{m.email}</p>
                  </td>
                  <td className="px-4 py-2.5 text-slate-600">{m.role?.name ?? <span className="text-amber-600">No role</span>}</td>
                  <td className="px-4 py-2.5">
                    <span className={`inline-block px-2 py-0.5 rounded-full text-[10.5px] font-semibold ${m.is_active ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>
                      {m.is_active ? 'Active' : 'Deactivated'}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 text-slate-500">{m.created_at}</td>
                  <td className="px-4 py-2.5 text-right whitespace-nowrap">
                    <Button variant="outline" size="sm" className="h-7 gap-1 text-[12px] mr-1.5" onClick={() => openEdit(m)}>
                      <Pencil size={12} /> Edit
                    </Button>
                    {m.is_active && (
                      <Button variant="outline" size="sm" className="h-7 gap-1 text-[12px] text-red-500 hover:text-red-600" onClick={() => setDeactivating(m)}>
                        <UserX size={12} /> Deactivate
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <MemberForm open={formOpen} onOpenChange={setFormOpen} roles={roles} member={editing} />

        <ConfirmDialog
          open={!!deactivating}
          onOpenChange={open => !open && setDeactivating(null)}
          title={`Deactivate ${deactivating?.name}?`}
          description="They will no longer be able to sign in. Their history and assigned leads are kept."
          confirmText="Deactivate"
          loadingText="Deactivating…"
          onConfirm={confirmDeactivate}
          loading={processing}
        />
      </AppLayout>
    </>
  )
}
