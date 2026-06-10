import { Head, Link, router } from '@inertiajs/react'
import { useState } from 'react'
import AppLayout from '@/Components/Layout/AppLayout'
import PageHeader from '@/Components/Common/PageHeader'
import EmptyState from '@/Components/Common/EmptyState'
import { Button } from '@/Components/ui/button'
import { Input } from '@/Components/ui/input'
import { Label } from '@/Components/ui/label'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/Components/ui/dialog'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/Components/ui/dropdown-menu'
import { UsersRound, Plus, MoreHorizontal, Pencil, Trash2 } from 'lucide-react'
import { toast } from 'sonner'

const PRESET_COLORS = [
  '#6366f1', '#8b5cf6', '#ec4899', '#ef4444',
  '#f59e0b', '#10b981', '#06b6d4', '#3b82f6',
  '#14b8a6', '#84cc16', '#0ea5e9', '#f97316',
]

function GroupFormDialog({ open, onClose, initial = null, onSaved }) {
  const [name, setName]         = useState(initial?.name ?? '')
  const [description, setDesc]  = useState(initial?.description ?? '')
  const [color, setColor]       = useState(initial?.color ?? '#6366f1')
  const [saving, setSaving]     = useState(false)

  const isEdit = !!initial

  const handleSubmit = (e) => {
    e.preventDefault()
    setSaving(true)
    if (isEdit) {
      router.patch(`/groups/${initial.id}`, { name, description, color }, {
        onSuccess: () => { onSaved?.(); toast.success('Group updated') },
        onError:   () => toast.error('Failed to update group'),
        onFinish:  () => setSaving(false),
      })
    } else {
      router.post('/groups', { name, description, color }, {
        onSuccess: () => { onClose(); toast.success('Group created') },
        onError:   () => toast.error('Failed to create group'),
        onFinish:  () => setSaving(false),
      })
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-sm font-semibold">
            {isEdit ? 'Edit Group' : 'New Group'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-3 mt-1">
          <div className="space-y-1">
            <Label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Name</Label>
            <Input
              value={name}
              onChange={e => setName(e.target.value)}
              className="h-8 text-[13px]"
              placeholder="e.g. VIP Leads"
              required
            />
          </div>
          <div className="space-y-1">
            <Label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Description (optional)</Label>
            <Input
              value={description}
              onChange={e => setDesc(e.target.value)}
              className="h-8 text-[13px]"
              placeholder="What is this group for?"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Color</Label>
            <div className="flex flex-wrap gap-2">
              {PRESET_COLORS.map(c => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className="w-6 h-6 rounded-full transition-transform hover:scale-110 focus:outline-none"
                  style={{
                    background: c,
                    outline: color === c ? `2px solid ${c}` : 'none',
                    outlineOffset: 2,
                  }}
                />
              ))}
            </div>
          </div>
          <DialogFooter className="gap-2 pt-1">
            <Button type="button" variant="outline" size="sm" className="h-8 text-xs" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={saving || !name.trim()}
              className="h-8 text-xs"
              style={{ background: color }}
            >
              {saving ? 'Saving…' : (isEdit ? 'Update' : 'Create Group')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default function GroupsIndex({ groups }) {
  const [createOpen, setCreateOpen]         = useState(false)
  const [editGroup, setEditGroup]           = useState(null)
  const [deleteTarget, setDeleteTarget]     = useState(null)
  const [deleting, setDeleting]             = useState(false)

  const handleDelete = () => {
    if (!deleteTarget) return
    setDeleting(true)
    router.delete(`/groups/${deleteTarget.id}`, {
      onSuccess: () => toast.success(`"${deleteTarget.name}" deleted`),
      onError:   () => toast.error('Failed to delete group'),
      onFinish:  () => { setDeleting(false); setDeleteTarget(null) },
    })
  }

  return (
    <>
      <Head title="Groups" />
      <AppLayout title="Groups">
        <PageHeader
          title="Lead Groups"
          description={`${groups?.length ?? 0} groups`}
          action={
            <Button size="sm" className="gap-1.5 h-9" onClick={() => setCreateOpen(true)}>
              <Plus size={14} /> New Group
            </Button>
          }
        />

        {groups?.length ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-w-5xl">
            {groups.map(g => (
              <Link key={g.id} href={`/groups/${g.id}`} className="block group">
                <div className="form-card px-4 py-3.5 hover:shadow-md transition-all cursor-pointer border border-transparent hover:border-slate-200">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 shadow-sm"
                        style={{ background: g.color + '22', border: `1.5px solid ${g.color}44` }}
                      >
                        <UsersRound size={16} style={{ color: g.color }} />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[13.5px] font-semibold text-slate-800 truncate">{g.name}</p>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          {g.leads_count} lead{g.leads_count !== 1 ? 's' : ''} · {g.created_at}
                        </p>
                      </div>
                    </div>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild onClick={e => e.preventDefault()}>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-slate-300 hover:text-slate-600 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <MoreHorizontal size={14} />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-36">
                        <DropdownMenuItem
                          className="flex items-center gap-2 text-xs"
                          onClick={e => { e.preventDefault(); setEditGroup(g) }}
                        >
                          <Pencil size={12} /> Edit
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="flex items-center gap-2 text-xs text-red-600 focus:text-red-600"
                          onClick={e => { e.preventDefault(); setDeleteTarget(g) }}
                        >
                          <Trash2 size={12} /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  {g.description && (
                    <p className="text-[11.5px] text-slate-400 mt-2 line-clamp-2 pl-12">{g.description}</p>
                  )}

                  {/* Color accent bar */}
                  <div
                    className="absolute bottom-0 left-0 right-0 h-0.5 rounded-b-xl opacity-0 group-hover:opacity-100 transition-opacity"
                    style={{ background: g.color }}
                  />
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <EmptyState
            icon={UsersRound}
            title="No groups yet"
            description="Create a group to organize your leads into targeted audiences for campaigns."
            action={
              <Button size="sm" className="gap-1.5 h-9" onClick={() => setCreateOpen(true)}>
                <Plus size={14} /> Create Group
              </Button>
            }
          />
        )}

        {/* Create dialog */}
        <GroupFormDialog
          open={createOpen}
          onClose={() => setCreateOpen(false)}
        />

        {/* Edit dialog */}
        {editGroup && (
          <GroupFormDialog
            open={!!editGroup}
            onClose={() => setEditGroup(null)}
            initial={editGroup}
            onSaved={() => setEditGroup(null)}
          />
        )}

        {/* Delete confirm */}
        <Dialog open={!!deleteTarget} onOpenChange={open => !open && setDeleteTarget(null)}>
          <DialogContent className="max-w-sm">
            <DialogHeader>
              <DialogTitle className="text-sm font-semibold">Delete group?</DialogTitle>
            </DialogHeader>
            <p className="text-xs text-muted-foreground">
              <span className="font-semibold text-foreground">"{deleteTarget?.name}"</span> will be deleted.
              Leads in this group won't be deleted.
            </p>
            <DialogFooter className="gap-2">
              <Button variant="outline" size="sm" className="h-8 text-xs" onClick={() => setDeleteTarget(null)}>
                Cancel
              </Button>
              <Button
                size="sm"
                disabled={deleting}
                className="h-8 text-xs bg-red-600 hover:bg-red-700 text-white border-0"
                onClick={handleDelete}
              >
                <Trash2 size={12} className="mr-1" />
                {deleting ? 'Deleting…' : 'Delete'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </AppLayout>
    </>
  )
}
