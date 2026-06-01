import { Head, router, useForm } from '@inertiajs/react'
import { useState } from 'react'
import AppLayout from '@/Components/Layout/AppLayout'
import PageHeader from '@/Components/Common/PageHeader'
import ConfirmDialog from '@/Components/Common/ConfirmDialog'
import EmptyState from '@/Components/Common/EmptyState'
import { Button } from '@/Components/ui/button'
import { Input } from '@/Components/ui/input'
import { Label } from '@/Components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/Components/ui/dialog'
import { Pencil, Trash2, Plus, Tag as TagIcon } from 'lucide-react'
import { toast } from 'sonner'

const PRESET_COLORS = [
  '#7C3AED', '#4F46E5', '#0EA5E9', '#10B981', '#F59E0B',
  '#EF4444', '#EC4899', '#8B5CF6', '#14B8A6', '#F97316',
]

export default function TagsIndex({ tags }) {
  const [deleteId, setDeleteId] = useState(null)
  const [deleting, setDeleting] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const { data, setData, post, put, processing, errors, reset, clearErrors } = useForm({
    id: null,
    name: '',
    color: '#7C3AED',
  })

  const openCreateModal = () => {
    reset()
    clearErrors()
    setData({ id: null, name: '', color: '#7C3AED' })
    setIsModalOpen(true)
  }

  const openEditModal = (tag) => {
    reset()
    clearErrors()
    setData({ id: tag.id, name: tag.name, color: tag.color || '#7C3AED' })
    setIsModalOpen(true)
  }

  const handleModalClose = () => {
    setIsModalOpen(false)
    reset()
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (data.id) {
      put(`/tags/${data.id}`, {
        onSuccess: () => { toast.success('Tag updated'); handleModalClose() },
        onError: () => toast.error('Failed to update tag'),
      })
    } else {
      post('/tags', {
        onSuccess: () => { toast.success('Tag created'); handleModalClose() },
        onError: () => toast.error('Failed to create tag'),
      })
    }
  }

  const handleDelete = () => {
    setDeleting(true)
    router.delete(`/tags/${deleteId}`, {
      onSuccess: () => toast.success('Tag deleted'),
      onError: () => toast.error('Failed to delete tag'),
      onFinish: () => { setDeleting(false); setDeleteId(null) },
    })
  }

  return (
    <>
      <Head title="Tags" />
      <AppLayout title="Tags">
        <PageHeader
          title="Tags"
          description={`${tags?.length ?? 0} tags`}
          action={
            <Button
              size="sm"
              className="gap-1.5 h-9"
              onClick={openCreateModal}
            >
              <Plus size={14} /> Add Tag
            </Button>
          }
        />

        {tags?.length ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
            {tags.map(tag => (
              <div key={tag.id} className="form-card group p-3.5 flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 min-w-0">
                    <div
                      className="w-3 h-3 rounded-full shrink-0"
                      style={{ background: tag.color || '#7C3AED' }}
                    />
                    <span className="text-[13px] font-semibold text-slate-800 truncate">{tag.name}</span>
                  </div>
                </div>
                <p className="text-[11px] text-slate-400">{tag.leads_count ?? 0} leads</p>
                <div className="flex items-center gap-1 mt-auto">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                    onClick={() => openEditModal(tag)}
                    title="Edit tag"
                  >
                    <Pencil size={11} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                    onClick={() => setDeleteId(tag.id)}
                    title="Delete tag"
                  >
                    <Trash2 size={11} />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            icon={TagIcon}
            title="No tags yet"
            description="Tags help you categorize and filter your leads. Create one to get started."
            action={
              <Button size="sm" className="gap-1.5 h-9" onClick={openCreateModal}>
                <Plus size={14} /> Add Tag
              </Button>
            }
          />
        )}

        {/* Create / Edit modal */}
        <Dialog open={isModalOpen} onOpenChange={open => !open && handleModalClose()}>
          <DialogContent className="sm:max-w-sm">
            <DialogHeader>
              <DialogTitle className="text-[14px] font-bold text-slate-800">
                {data.id ? 'Edit Tag' : 'Create Tag'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 pt-1">
              <div className="space-y-1">
                <Label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Name</Label>
                <Input
                  value={data.name}
                  onChange={(e) => setData('name', e.target.value)}
                  placeholder="e.g. VIP, Hot Lead, Enterprise"
                  className="h-8 text-[13px]"
                  autoFocus
                />
                {errors.name && <p className="text-red-500 text-[11px]">{errors.name}</p>}
              </div>

              <div className="space-y-2">
                <Label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Color</Label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {PRESET_COLORS.map(c => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setData('color', c)}
                      className="w-6 h-6 rounded-full transition-transform hover:scale-110 focus:outline-none"
                      style={{
                        background: c,
                        boxShadow: data.color === c ? `0 0 0 2px white, 0 0 0 4px ${c}` : 'none',
                      }}
                    />
                  ))}
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={data.color}
                    onChange={(e) => setData('color', e.target.value)}
                    className="w-8 h-8 p-0.5 rounded border border-slate-200 cursor-pointer"
                  />
                  <Input
                    type="text"
                    value={data.color}
                    onChange={(e) => setData('color', e.target.value)}
                    className="flex-1 h-8 text-[13px] font-mono"
                    placeholder="#7C3AED"
                  />
                  <div className="w-8 h-8 rounded-lg shrink-0" style={{ background: data.color }} />
                </div>
                {errors.color && <p className="text-red-500 text-[11px]">{errors.color}</p>}
              </div>

              <DialogFooter className="gap-2 pt-2">
                <Button type="button" variant="outline" size="sm" className="h-8 text-xs" onClick={handleModalClose}>
                  Cancel
                </Button>
                <button
                  type="submit"
                  disabled={processing}
                  className="h-8 px-5 text-[12.5px] font-semibold text-white rounded-lg transition-all hover:opacity-90 disabled:opacity-60"
                  style={{ background: 'linear-gradient(135deg,#7C3AED,#4F46E5)' }}
                >
                  {processing ? 'Saving…' : data.id ? 'Save Changes' : 'Create Tag'}
                </button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        <ConfirmDialog
          open={!!deleteId}
          onOpenChange={open => !open && setDeleteId(null)}
          title="Delete tag?"
          description="This tag will be removed from all leads. This cannot be undone."
          onConfirm={handleDelete}
          loading={deleting}
        />
      </AppLayout>
    </>
  )
}
