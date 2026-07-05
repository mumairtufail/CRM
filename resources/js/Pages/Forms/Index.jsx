import { Head, router } from '@inertiajs/react'
import { useState } from 'react'
import AppLayout from '@/Components/Layout/AppLayout'
import PageHeader from '@/Components/Common/PageHeader'
import EmptyState from '@/Components/Common/EmptyState'
import { Button } from '@/Components/ui/button'
import { Badge } from '@/Components/ui/badge'
import { Switch } from '@/Components/ui/switch'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/Components/ui/dialog'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/Components/ui/dropdown-menu'
import { ClipboardList, Plus, MoreHorizontal, Pencil, Trash2, Copy, ExternalLink } from 'lucide-react'
import { toast } from 'sonner'

function copyLink(url) {
  navigator.clipboard?.writeText(url)
    .then(() => toast.success('Form link copied'))
    .catch(() => toast.error('Could not copy link'))
}

export default function FormsIndex({ forms }) {
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleting, setDeleting]         = useState(false)

  const onlyOneForm = (forms?.length ?? 0) === 1

  const toggleActive = (form) => {
    router.patch(`/forms/${form.id}/toggle`, {}, { preserveScroll: true, preserveState: true })
  }

  const handleDelete = () => {
    if (!deleteTarget) return
    setDeleting(true)
    router.delete(`/forms/${deleteTarget.id}`, {
      onSuccess: () => toast.success(`"${deleteTarget.name}" deleted`),
      onError:   () => toast.error('Failed to delete form'),
      onFinish:  () => { setDeleting(false); setDeleteTarget(null) },
    })
  }

  return (
    <>
      <Head title="Forms" />
      <AppLayout title="Forms">
        <PageHeader
          title="Lead Capture Forms"
          description={`${forms?.length ?? 0} form${forms?.length !== 1 ? 's' : ''}`}
          action={
            <Button size="sm" className="gap-1.5 h-9" onClick={() => router.visit('/forms/create')}>
              <Plus size={14} /> New Form
            </Button>
          }
        />

        {forms?.length ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-w-5xl">
            {forms.map(f => (
              <div key={f.id} className="form-card relative px-4 py-3.5 border border-transparent hover:border-slate-200 hover:shadow-md transition-all">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 shadow-sm bg-brand-100 border-[1.5px] border-brand-200">
                      <ClipboardList size={16} className="text-brand-600" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <p className="text-[13.5px] font-semibold text-slate-800 truncate">{f.name}</p>
                        {f.is_default && <Badge variant="secondary" className="text-[9.5px] px-1.5 py-0">Default</Badge>}
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        {f.submissions_count} submission{f.submissions_count !== 1 ? 's' : ''}
                        {f.last_submitted_at ? ` · last ${f.last_submitted_at}` : ''}
                      </p>
                    </div>
                  </div>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-slate-300 hover:text-slate-600 shrink-0">
                        <MoreHorizontal size={14} />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-44">
                      <DropdownMenuItem className="flex items-center gap-2 text-xs" onClick={() => copyLink(f.public_url)}>
                        <Copy size={12} /> Copy link
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild className="flex items-center gap-2 text-xs">
                        <a href={f.public_url} target="_blank" rel="noopener noreferrer">
                          <ExternalLink size={12} /> Open
                        </a>
                      </DropdownMenuItem>
                      <DropdownMenuItem className="flex items-center gap-2 text-xs" onClick={() => router.visit(`/forms/${f.id}/edit`)}>
                        <Pencil size={12} /> Edit
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        disabled={onlyOneForm}
                        className="flex items-center gap-2 text-xs text-red-600 focus:text-red-600"
                        onClick={() => setDeleteTarget(f)}
                      >
                        <Trash2 size={12} /> Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <div className="flex items-center justify-between mt-3 pl-12">
                  <p className="text-[11px] text-slate-400 truncate max-w-[160px]">{f.public_url}</p>
                  <Switch checked={f.is_active} onCheckedChange={() => toggleActive(f)} />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            icon={ClipboardList}
            title="No forms yet"
            description="Create a lead capture form to start collecting submissions, then share its link anywhere."
            action={
              <Button size="sm" className="gap-1.5 h-9" onClick={() => router.visit('/forms/create')}>
                <Plus size={14} /> Create Form
              </Button>
            }
          />
        )}

        <Dialog open={!!deleteTarget} onOpenChange={open => !open && setDeleteTarget(null)}>
          <DialogContent className="max-w-sm">
            <DialogHeader>
              <DialogTitle className="text-sm font-semibold">Delete form?</DialogTitle>
            </DialogHeader>
            <p className="text-xs text-muted-foreground">
              <span className="font-semibold text-foreground">"{deleteTarget?.name}"</span> will be deleted.
              Its public link will stop working. Leads already captured through it won't be deleted.
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
