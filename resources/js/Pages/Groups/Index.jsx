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
import { UsersRound, Plus, MoreHorizontal, Pencil, Trash2, X, Check } from 'lucide-react'
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
  const [selectedIds, setSelectedIds]       = useState(new Set())
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false)
  const [bulkDeleting, setBulkDeleting]     = useState(false)

  const selectionCount = selectedIds.size
  const selectionActive = selectionCount > 0

  const toggleSelect = (id) => {
    setSelectedIds(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  const handleDelete = () => {
    if (!deleteTarget) return
    setDeleting(true)
    router.delete(`/groups/${deleteTarget.id}`, {
      onSuccess: () => toast.success(`"${deleteTarget.name}" deleted`),
      onError:   () => toast.error('Failed to delete group'),
      onFinish:  () => { setDeleting(false); setDeleteTarget(null) },
    })
  }

  const handleBulkDelete = () => {
    setBulkDeleting(true)
    const ids = [...selectedIds]
    router.post('/groups/bulk-destroy', { ids }, {
      preserveScroll: true,
      onSuccess: () => {
        toast.success(`${ids.length} group${ids.length !== 1 ? 's' : ''} deleted`)
        setSelectedIds(new Set())
      },
      onError:  () => toast.error('Failed to delete groups'),
      onFinish: () => { setBulkDeleting(false); setBulkDeleteOpen(false) },
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
            {groups.map(g => {
              const selected = selectedIds.has(g.id)
              return (
              <Link
                key={g.id}
                href={`/groups/${g.id}`}
                className="block group"
                onClick={e => { if (selectionActive) { e.preventDefault(); toggleSelect(g.id) } }}
              >
                <div className={`form-card relative px-4 py-3.5 transition-all cursor-pointer border ${
                  selected
                    ? 'border-violet-300 ring-1 ring-violet-200 bg-violet-50/40'
                    : 'border-transparent hover:border-slate-200 hover:shadow-md'
                }`}>
                  {/* Selection checkbox */}
                  <button
                    type="button"
                    onClick={e => { e.preventDefault(); e.stopPropagation(); toggleSelect(g.id) }}
                    className={`absolute top-2 left-2 z-10 w-[18px] h-[18px] rounded-md border flex items-center justify-center shadow-sm transition-all ${
                      selected ? 'border-violet-600 bg-violet-600' : 'border-slate-300 bg-white'
                    } ${(selected || selectionActive) ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}
                    title={selected ? 'Deselect' : 'Select'}
                  >
                    {selected && <Check size={12} className="text-white" />}
                  </button>

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
                      <DropdownMenuTrigger asChild onClick={e => { e.preventDefault(); e.stopPropagation() }}>
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
                          onClick={e => { e.preventDefault(); e.stopPropagation(); setEditGroup(g) }}
                        >
                          <Pencil size={12} /> Edit
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="flex items-center gap-2 text-xs text-red-600 focus:text-red-600"
                          onClick={e => { e.preventDefault(); e.stopPropagation(); setDeleteTarget(g) }}
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
            )})}
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

        {/* Bulk delete confirm */}
        <Dialog open={bulkDeleteOpen} onOpenChange={open => !open && setBulkDeleteOpen(false)}>
          <DialogContent className="max-w-sm">
            <DialogHeader>
              <DialogTitle className="text-sm font-semibold">
                Delete {selectionCount} group{selectionCount !== 1 ? 's' : ''}?
              </DialogTitle>
            </DialogHeader>
            <p className="text-xs text-muted-foreground">
              The selected group{selectionCount !== 1 ? 's' : ''} will be deleted. Leads inside them won't be deleted.
            </p>
            <DialogFooter className="gap-2">
              <Button variant="outline" size="sm" className="h-8 text-xs" onClick={() => setBulkDeleteOpen(false)}>
                Cancel
              </Button>
              <Button
                size="sm"
                disabled={bulkDeleting}
                className="h-8 text-xs bg-red-600 hover:bg-red-700 text-white border-0"
                onClick={handleBulkDelete}
              >
                <Trash2 size={12} className="mr-1" />
                {bulkDeleting ? 'Deleting…' : 'Delete'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </AppLayout>

      {/* ── Bulk action bar ── */}
      {selectionCount > 0 && (
        <div style={{
          position: 'fixed',
          bottom: 28,
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 50,
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          background: '#0f172a',
          borderRadius: 12,
          padding: '10px 14px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.28), 0 0 0 1px rgba(255,255,255,0.06)',
          whiteSpace: 'nowrap',
        }}>
          <span style={{ fontSize: 13, fontWeight: 500, color: 'white' }}>
            {selectionCount} group{selectionCount !== 1 ? 's' : ''} selected
          </span>

          <div style={{ width: 1, height: 16, background: 'rgba(255,255,255,0.12)' }} />

          <button
            onClick={() => setSelectedIds(new Set())}
            style={{
              display: 'flex', alignItems: 'center', gap: 5,
              background: 'rgba(255,255,255,0.08)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 7, padding: '4px 10px',
              color: 'rgba(255,255,255,0.7)', fontSize: 12.5, fontWeight: 500,
              cursor: 'pointer', transition: 'background 0.15s',
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.13)'}
            onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'}
          >
            <X size={12} /> Clear
          </button>

          <button
            onClick={() => setBulkDeleteOpen(true)}
            style={{
              display: 'flex', alignItems: 'center', gap: 5,
              background: '#ef4444',
              border: 'none',
              borderRadius: 7, padding: '4px 12px',
              color: 'white', fontSize: 12.5, fontWeight: 600,
              cursor: 'pointer', transition: 'background 0.15s',
            }}
            onMouseEnter={e => e.currentTarget.style.background = '#dc2626'}
            onMouseLeave={e => e.currentTarget.style.background = '#ef4444'}
          >
            <Trash2 size={12} /> Delete
          </button>
        </div>
      )}
    </>
  )
}
