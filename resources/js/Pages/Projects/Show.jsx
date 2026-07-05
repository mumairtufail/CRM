import { Head, Link, router } from '@inertiajs/react'
import { useState, useRef, useEffect } from 'react'
import AppLayout from '@/Components/Layout/AppLayout'
import ConfirmDialog from '@/Components/Common/ConfirmDialog'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import {
  ChevronLeft, Building2, Calendar, DollarSign,
  FileText, Upload, Trash2, Download, FilePlus, Pencil,
  Check, X, FolderKanban, User, Plus, CheckSquare, Square,
  Circle, AlertCircle, Clock, CheckCircle2, Flag, MoreVertical,
} from 'lucide-react'
import { format } from 'date-fns'

// ─── Config ─────────────────────────────────────────────────────────────────────

const STATUS_STYLE = {
  planning:  { dot: 'bg-blue-400',    badge: 'bg-blue-50 text-blue-700 border-blue-200',       stripe: 'linear-gradient(90deg,#3b82f6,#60a5fa)' },
  active:    { dot: 'bg-emerald-400', badge: 'bg-emerald-50 text-emerald-700 border-emerald-200', stripe: 'linear-gradient(90deg,#10b981,#34d399)' },
  on_hold:   { dot: 'bg-amber-400',   badge: 'bg-amber-50 text-amber-700 border-amber-200',    stripe: 'linear-gradient(90deg,#f59e0b,#fbbf24)' },
  completed: { dot: 'bg-brand-400',  badge: 'bg-brand-50 text-brand-700 border-brand-200', stripe: 'linear-gradient(90deg,rgb(var(--brand-600)),rgb(var(--brand-400)))' },
  cancelled: { dot: 'bg-red-400',     badge: 'bg-red-50 text-red-700 border-red-200',          stripe: 'linear-gradient(90deg,#ef4444,#f87171)' },
}

const PROJECT_STATUSES = ['planning', 'active', 'on_hold', 'completed', 'cancelled']
const STATUS_LABELS     = { planning: 'Planning', active: 'Active', on_hold: 'On Hold', completed: 'Completed', cancelled: 'Cancelled' }

const PRIORITY_STYLE = {
  low:    { label: 'Low',    color: 'text-slate-400',   dot: 'bg-slate-300' },
  medium: { label: 'Medium', color: 'text-amber-500',   dot: 'bg-amber-400' },
  high:   { label: 'High',   color: 'text-red-500',     dot: 'bg-red-400' },
}

const TASK_STATUS_CYCLE = { todo: 'in_progress', in_progress: 'done', done: 'todo' }

const AVATAR_GRADIENTS = [
  'from-brand-500 to-brand2-500', 'from-emerald-500 to-teal-500',
  'from-blue-500 to-cyan-500', 'from-rose-500 to-pink-500', 'from-amber-500 to-orange-500',
]
function avatarGradient(str) {
  let h = 0
  for (const c of (str ?? '')) h = (h * 31 + c.charCodeAt(0)) & 0xffffffff
  return AVATAR_GRADIENTS[Math.abs(h) % AVATAR_GRADIENTS.length]
}
function avatarLetter(name) { return (name ?? '?').trim()[0]?.toUpperCase() ?? '?' }

const csrf = () => document.querySelector('meta[name=csrf-token]')?.content

function mimeIcon(mime) {
  if (!mime) return '📄'
  if (mime.startsWith('image/')) return '🖼️'
  if (mime === 'application/pdf') return '📕'
  if (mime.includes('word') || mime.includes('document')) return '📝'
  if (mime.includes('sheet') || mime.includes('excel')) return '📊'
  if (mime.includes('zip') || mime.includes('compressed')) return '🗜️'
  return '📄'
}

// ─── Inline editable field ────────────────────────────────────────────────────

function EditableField({ label, value, onSave, textarea = false, icon: Icon, type = 'text' }) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft]     = useState(value ?? '')

  useEffect(() => {
    if (!editing) setDraft(value ?? '')
  }, [value])

  const save = async () => {
    if (draft === (value ?? '')) { setEditing(false); return }
    await onSave(draft)
    setEditing(false)
  }

  if (editing) {
    return (
      <div className="py-2">
        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">{label}</p>
        {textarea ? (
          <textarea autoFocus value={draft} onChange={e => setDraft(e.target.value)} rows={4}
            className="w-full px-3 py-2 rounded-xl border border-brand-300 text-[13px] text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-200 resize-none" />
        ) : (
          <input autoFocus type={type} value={draft} onChange={e => setDraft(e.target.value)}
            className="w-full px-3 py-2 rounded-xl border border-brand-300 text-[13px] text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-200" />
        )}
        <div className="flex gap-1.5 mt-1.5">
          <button onClick={save}
            className="flex items-center gap-1 h-7 px-2.5 rounded-lg bg-brand-600 text-white text-[11.5px] font-medium hover:bg-brand-700 transition-colors">
            <Check size={11} /> Save
          </button>
          <button onClick={() => { setDraft(value ?? ''); setEditing(false) }}
            className="flex items-center gap-1 h-7 px-2.5 rounded-lg bg-slate-100 text-slate-600 text-[11.5px] font-medium hover:bg-slate-200 transition-colors">
            <X size={11} /> Cancel
          </button>
        </div>
      </div>
    )
  }

  return (
    <button onClick={() => setEditing(true)}
      className="w-full flex items-start gap-3 py-2.5 text-left group hover:bg-slate-50/70 rounded-xl px-1 transition-colors">
      {Icon && (
        <div className="w-7 h-7 rounded-lg bg-slate-50 flex items-center justify-center shrink-0 mt-0.5">
          <Icon size={13} className="text-slate-400" />
        </div>
      )}
      <div className="flex-1 min-w-0">
        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{label}</p>
        <p className={cn('text-[13px] mt-0.5 truncate', value ? 'text-slate-700' : 'text-slate-300 italic')}>
          {value || 'Click to add…'}
        </p>
      </div>
      <Pencil size={11} className="text-slate-300 group-hover:text-brand-400 mt-1.5 shrink-0 transition-colors" />
    </button>
  )
}

// ─── Task row ─────────────────────────────────────────────────────────────────

function TaskRow({ task, projectId, onUpdated, onDeleted }) {
  const [editingTitle, setEditingTitle] = useState(false)
  const [draft, setDraft]               = useState(task.title)
  const [confirmOpen, setConfirmOpen]   = useState(false)
  const [deleting, setDeleting]         = useState(false)
  const [toggling, setToggling]         = useState(false)

  const isDone = task.status === 'done'

  const toggleStatus = async () => {
    if (toggling) return
    setToggling(true)
    const nextStatus = TASK_STATUS_CYCLE[task.status] ?? 'todo'
    try {
      const res = await fetch(`/projects/${projectId}/tasks/${task.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json', 'X-CSRF-TOKEN': csrf() },
        body: JSON.stringify({ status: nextStatus }),
      })
      const json = await res.json()
      if (json.ok) onUpdated(json.task)
    } catch { toast.error('Failed to update task') }
    finally { setToggling(false) }
  }

  const saveTitle = async () => {
    if (!draft.trim() || draft === task.title) { setEditingTitle(false); setDraft(task.title); return }
    try {
      const res = await fetch(`/projects/${projectId}/tasks/${task.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json', 'X-CSRF-TOKEN': csrf() },
        body: JSON.stringify({ title: draft.trim() }),
      })
      const json = await res.json()
      if (json.ok) { onUpdated(json.task); setEditingTitle(false) }
    } catch { toast.error('Failed to save') }
  }

  const handleDelete = async () => {
    setDeleting(true)
    try {
      await fetch(`/projects/${projectId}/tasks/${task.id}`, {
        method: 'DELETE',
        headers: { Accept: 'application/json', 'X-CSRF-TOKEN': csrf() },
      })
      toast.success('Task deleted')
      onDeleted(task.id)
    } catch {
      toast.error('Failed to delete task')
      setDeleting(false)
    }
  }

  const pr = PRIORITY_STYLE[task.priority] ?? PRIORITY_STYLE.medium

  return (
    <>
      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Delete task?"
        description={`"${task.title}" will be permanently deleted.`}
        onConfirm={handleDelete}
        loading={deleting}
        confirmText="Delete"
        loadingText="Deleting…"
        variant="destructive"
      />
      <div className={cn(
        'flex items-start gap-3 px-3 py-2.5 rounded-xl group hover:bg-slate-50 transition-colors',
        isDone && 'opacity-60'
      )}>
        <button onClick={toggleStatus} disabled={toggling}
          className="mt-0.5 shrink-0 text-slate-400 hover:text-brand-500 transition-colors">
          {isDone
            ? <CheckSquare size={17} className="text-brand-500" />
            : task.status === 'in_progress'
              ? <Circle size={17} className="text-amber-400" />
              : <Square size={17} />
          }
        </button>

        <div className="flex-1 min-w-0">
          {editingTitle ? (
            <div className="flex items-center gap-1.5">
              <input autoFocus value={draft} onChange={e => setDraft(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') saveTitle(); if (e.key === 'Escape') { setEditingTitle(false); setDraft(task.title) } }}
                className="flex-1 px-2 py-1 rounded-lg border border-brand-300 text-[12.5px] text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-200"
              />
              <button onClick={saveTitle}
                className="h-7 w-7 rounded-lg bg-brand-600 text-white flex items-center justify-center hover:bg-brand-700 transition-colors">
                <Check size={11} />
              </button>
              <button onClick={() => { setEditingTitle(false); setDraft(task.title) }}
                className="h-7 w-7 rounded-lg bg-slate-100 text-slate-500 flex items-center justify-center hover:bg-slate-200 transition-colors">
                <X size={11} />
              </button>
            </div>
          ) : (
            <p className={cn('text-[13px] font-medium text-slate-800', isDone && 'line-through')}>
              {task.title}
            </p>
          )}
          <div className="flex items-center gap-3 mt-0.5">
            <span className={cn('flex items-center gap-1 text-[10.5px] font-medium', pr.color)}>
              <span className={cn('w-1.5 h-1.5 rounded-full', pr.dot)} />
              {pr.label}
            </span>
            {task.due_date && (
              <span className="text-[10.5px] text-slate-400 flex items-center gap-1">
                <Calendar size={9} /> {format(new Date(task.due_date), 'MMM d')}
              </span>
            )}
            {task.status === 'in_progress' && (
              <span className="text-[10.5px] text-amber-500 font-medium">In Progress</span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
          <button onClick={() => setEditingTitle(true)}
            className="h-6 w-6 rounded-lg flex items-center justify-center text-slate-400 hover:text-brand-500 hover:bg-slate-100 transition-colors">
            <Pencil size={11} />
          </button>
          <button onClick={() => setConfirmOpen(true)}
            className="h-6 w-6 rounded-lg flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors">
            <Trash2 size={11} />
          </button>
        </div>
      </div>
    </>
  )
}

// ─── Add task form ────────────────────────────────────────────────────────────

function AddTaskForm({ projectId, onAdded }) {
  const [open, setOpen]         = useState(false)
  const [title, setTitle]       = useState('')
  const [priority, setPriority] = useState('medium')
  const [dueDate, setDueDate]   = useState('')
  const [saving, setSaving]     = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    if (!title.trim()) return
    setSaving(true)
    try {
      const res = await fetch(`/projects/${projectId}/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json', 'X-CSRF-TOKEN': csrf() },
        body: JSON.stringify({ title: title.trim(), priority, due_date: dueDate || undefined }),
      })
      const json = await res.json()
      if (json.ok) {
        toast.success('Task added')
        onAdded(json.task)
        setTitle(''); setDueDate(''); setPriority('medium'); setOpen(false)
      } else toast.error('Failed to add task')
    } catch { toast.error('Failed to add task') }
    finally { setSaving(false) }
  }

  if (!open) {
    return (
      <button onClick={() => setOpen(true)}
        className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl border-2 border-dashed border-slate-200 text-[12.5px] text-slate-400 hover:border-brand-300 hover:text-brand-500 hover:bg-brand-50/40 transition-colors">
        <Plus size={14} /> Add task…
      </button>
    )
  }

  return (
    <form onSubmit={submit}
      className="rounded-xl border-2 border-brand-300 bg-brand-50/30 p-3 space-y-2">
      <input autoFocus value={title} onChange={e => setTitle(e.target.value)}
        placeholder="Task title…"
        className="w-full px-3 py-2 rounded-lg border border-brand-300 text-[13px] text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-brand-200"
      />
      <div className="flex items-center gap-2">
        <select value={priority} onChange={e => setPriority(e.target.value)}
          className="h-8 px-2 rounded-lg border border-slate-200 text-[12px] text-slate-600 bg-white focus:outline-none focus:ring-2 focus:ring-brand-200">
          <option value="low">Low priority</option>
          <option value="medium">Medium priority</option>
          <option value="high">High priority</option>
        </select>
        <input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)}
          className="h-8 px-2 rounded-lg border border-slate-200 text-[12px] text-slate-600 bg-white focus:outline-none focus:ring-2 focus:ring-brand-200 flex-1"
        />
      </div>
      <div className="flex gap-2">
        <button type="submit" disabled={saving || !title.trim()}
          className="h-8 px-4 rounded-lg bg-brand-600 text-white text-[12px] font-semibold hover:bg-brand-700 transition-colors disabled:opacity-50">
          {saving ? 'Adding…' : 'Add Task'}
        </button>
        <button type="button" onClick={() => { setOpen(false); setTitle('') }}
          className="h-8 px-3 rounded-lg bg-slate-100 text-slate-500 text-[12px] font-medium hover:bg-slate-200 transition-colors">
          Cancel
        </button>
      </div>
    </form>
  )
}

// ─── Document upload form ─────────────────────────────────────────────────────

function UploadDocForm({ projectId, onUploaded }) {
  const [name, setName]       = useState('')
  const [notes, setNotes]     = useState('')
  const [file, setFile]       = useState(null)
  const [loading, setLoading] = useState(false)
  const fileRef = useRef()

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!file || !name.trim()) return
    setLoading(true)
    const fd = new FormData()
    fd.append('name', name.trim())
    fd.append('notes', notes.trim())
    fd.append('file', file)
    try {
      const res = await fetch(`/projects/${projectId}/documents`, {
        method: 'POST',
        headers: { Accept: 'application/json', 'X-CSRF-TOKEN': csrf() },
        body: fd,
      })
      let json
      try { json = await res.json() } catch { json = {} }
      if (json.ok) {
        toast.success('Document uploaded')
        onUploaded(json.doc)
        setName(''); setNotes(''); setFile(null)
        if (fileRef.current) fileRef.current.value = ''
      } else if (res.status === 422 && json.errors) {
        toast.error(Object.values(json.errors)[0]?.[0] ?? 'Validation failed')
      } else {
        toast.error(json.message ?? `Upload failed (${res.status})`)
      }
    } catch (err) {
      toast.error('Upload failed: ' + (err.message ?? 'network error'))
    } finally { setLoading(false) }
  }

  return (
    <form onSubmit={handleSubmit}
      className="rounded-2xl border-2 border-dashed border-slate-200 hover:border-brand-300 transition-colors p-4 bg-slate-50/50">
      <div className="flex items-center gap-2 mb-3">
        <FilePlus size={15} className="text-brand-500" />
        <p className="text-[12.5px] font-semibold text-slate-700">Upload document</p>
      </div>
      <div className="space-y-2">
        <input value={name} onChange={e => setName(e.target.value)} placeholder="Document name *" required
          className="w-full px-3 py-2 rounded-xl border border-slate-200 text-[13px] text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-brand-200 focus:border-brand-400 transition"
        />
        <textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Notes (optional)" rows={2}
          className="w-full px-3 py-2 rounded-xl border border-slate-200 text-[13px] text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-brand-200 focus:border-brand-400 transition resize-none"
        />
        <div className="flex items-center gap-2">
          <label className="flex-1 flex items-center gap-2 px-3 py-2 rounded-xl border border-slate-200 bg-white cursor-pointer hover:border-brand-300 transition-colors">
            <Upload size={13} className="text-slate-400 shrink-0" />
            <span className="text-[12.5px] text-slate-500 truncate">{file ? file.name : 'Choose file…'}</span>
            <input ref={fileRef} type="file" className="hidden" onChange={e => setFile(e.target.files[0] ?? null)} />
          </label>
          <button type="submit" disabled={loading || !file || !name.trim()}
            className="h-9 px-4 rounded-xl text-[12.5px] font-semibold text-white transition-all disabled:opacity-50"
            style={{ background: 'linear-gradient(135deg,rgb(var(--brand-600)),rgb(var(--brand2-600)))' }}>
            {loading ? 'Uploading…' : 'Upload'}
          </button>
        </div>
      </div>
    </form>
  )
}

// ─── Document row ─────────────────────────────────────────────────────────────

function DocRow({ doc, projectId, onDeleted }) {
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [deleting, setDeleting]       = useState(false)
  const isImage = doc.mime_type?.startsWith('image/')

  const handleDelete = async () => {
    setDeleting(true)
    try {
      await fetch(`/projects/${projectId}/documents/${doc.id}`, {
        method: 'DELETE',
        headers: { Accept: 'application/json', 'X-CSRF-TOKEN': csrf() },
      })
      toast.success('Document deleted')
      onDeleted(doc.id)
    } catch {
      toast.error('Failed to delete')
      setDeleting(false)
    }
  }

  return (
    <>
      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Delete document?"
        description={`"${doc.name}" will be permanently deleted.`}
        onConfirm={handleDelete}
        loading={deleting}
        confirmText="Delete"
        loadingText="Deleting…"
        variant="destructive"
      />
      <div className="rounded-xl hover:bg-slate-50 transition-colors group overflow-hidden">
        {isImage && (
          <a href={doc.url} target="_blank" rel="noopener noreferrer" className="block">
            <img
              src={doc.url}
              alt={doc.name}
              className="w-full h-44 object-cover rounded-xl mb-1"
            />
          </a>
        )}
        <div className="flex items-start gap-3 p-3">
          {!isImage && <div className="text-xl shrink-0 mt-0.5">{mimeIcon(doc.mime_type)}</div>}
          <div className="flex-1 min-w-0">
            <p className="text-[13px] font-semibold text-slate-800 truncate">{doc.name}</p>
            <p className="text-[11px] text-slate-400 truncate">{doc.original_name} · {doc.formatted_size}</p>
            {doc.notes && (
              <p className="text-[11.5px] text-slate-500 mt-1 leading-relaxed">{doc.notes}</p>
            )}
            <p className="text-[10.5px] text-slate-400 mt-1">
              {format(new Date(doc.created_at), 'MMM d, yyyy')}
            </p>
          </div>
          <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
            <a href={doc.url} download target="_blank" rel="noopener noreferrer"
              className="h-7 w-7 rounded-lg flex items-center justify-center bg-white border border-slate-200 hover:border-brand-300 hover:text-brand-600 transition-colors text-slate-500">
              <Download size={13} />
            </a>
            <button onClick={() => setConfirmOpen(true)} disabled={deleting}
              className="h-7 w-7 rounded-lg flex items-center justify-center bg-white border border-slate-200 hover:border-red-300 hover:text-red-500 transition-colors text-slate-500 disabled:opacity-40">
              <Trash2 size={13} />
            </button>
          </div>
        </div>
      </div>
    </>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function ProjectShow({ project: initialProject }) {
  const [project, setProject]         = useState(initialProject)
  const [tasks, setTasks]             = useState(initialProject.tasks ?? [])
  const [docs, setDocs]               = useState(initialProject.documents ?? [])
  const [savingStatus, setSavingStatus] = useState(false)
  const [deleteOpen, setDeleteOpen]   = useState(false)
  const [deleting, setDeleting]       = useState(false)

  const st = STATUS_STYLE[project.status] ?? STATUS_STYLE.planning

  const patch = async (data) => {
    try {
      const res = await fetch(`/projects/${project.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json', 'X-CSRF-TOKEN': csrf() },
        body: JSON.stringify(data),
      })
      const json = await res.json()
      if (json.ok) {
        setProject(prev => ({ ...prev, ...data }))
        toast.success('Saved')
      } else toast.error('Save failed')
    } catch { toast.error('Save failed') }
  }

  const handleStatusChange = async (status) => {
    setSavingStatus(true)
    await patch({ status })
    setSavingStatus(false)
  }

  const handleDeleteProject = () => {
    setDeleting(true)
    router.delete(`/projects/${project.id}`, {
      onError: () => { setDeleting(false); toast.error('Failed to delete project') },
    })
  }

  const doneTasks  = tasks.filter(t => t.status === 'done').length
  const totalTasks = tasks.length

  return (
    <>
      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Delete project?"
        description={`"${project.name}" along with all tasks and documents will be permanently deleted. This cannot be undone.`}
        onConfirm={handleDeleteProject}
        loading={deleting}
        confirmText="Delete Project"
        loadingText="Deleting…"
        variant="destructive"
      />
      <Head title={project.name} />
      <AppLayout title={project.name}>

        {/* Hero */}
        <div className="relative overflow-hidden rounded-2xl px-6 py-5 mb-5"
          style={{ background: 'linear-gradient(135deg,#0f172a 0%,#1e293b 60%,#0f172a 100%)', boxShadow: '0 4px 30px rgba(0,0,0,0.15)' }}>
          <div className="absolute top-0 right-0 w-56 h-56 rounded-full pointer-events-none opacity-[0.08]"
            style={{ background: 'radial-gradient(circle,rgb(var(--brand-600)) 0%,transparent 70%)', transform: 'translate(30%,-50%)' }} />

          <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className={cn(
                'w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 text-[20px] font-bold text-white bg-gradient-to-br shadow-lg',
                avatarGradient(project.name)
              )}>
                {avatarLetter(project.name)}
              </div>
              <div className="min-w-0">
                <h2 className="text-[20px] font-bold text-white leading-tight truncate">{project.name}</h2>
                {project.client && (
                  <Link href={`/clients/${project.client.id}`}
                    className="text-white/40 text-[13px] mt-0.5 flex items-center gap-1.5 hover:text-white/70 transition-colors">
                    <Building2 size={12} /> {project.client.name}
                    {project.client.company && <span className="text-white/25"> · {project.client.company}</span>}
                  </Link>
                )}
                <div className="flex items-center gap-2 mt-2">
                  <span className={cn('inline-flex items-center gap-1.5 text-[11.5px] font-semibold px-2.5 py-1 rounded-full border', st.badge)}>
                    <span className={cn('w-1.5 h-1.5 rounded-full', st.dot)} />
                    {STATUS_LABELS[project.status] ?? project.status}
                  </span>
                  {totalTasks > 0 && (
                    <span className="text-white/30 text-[11px]">
                      {doneTasks}/{totalTasks} tasks done
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0 flex-wrap">
              <Link href="/projects"
                className="flex items-center gap-1.5 h-8 px-3 rounded-xl text-[12px] font-medium text-white/50 hover:text-white hover:bg-white/10 transition-colors">
                <ChevronLeft size={13} /> Back
              </Link>
              <button onClick={() => setDeleteOpen(true)}
                className="flex items-center gap-1.5 h-8 px-3 rounded-xl text-[12px] font-medium bg-red-500/20 hover:bg-red-500/35 text-red-300 border border-red-500/20 transition-colors">
                <Trash2 size={12} /> Delete
              </button>
            </div>
          </div>
        </div>

        {/* Main grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

          {/* Left — info + status */}
          <div className="space-y-4">

            {/* Status */}
            <div className="rounded-2xl bg-white border border-slate-100 overflow-hidden"
              style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
              <div className="px-4 py-3 border-b border-slate-100">
                <p className="text-[10.5px] font-bold uppercase tracking-[0.12em] text-slate-400">Project Status</p>
              </div>
              <div className="p-3 space-y-1.5">
                {PROJECT_STATUSES.map(s => {
                  const sst = STATUS_STYLE[s]
                  return (
                    <button key={s} onClick={() => handleStatusChange(s)} disabled={savingStatus}
                      className={cn(
                        'w-full flex items-center gap-2.5 px-3 py-2 rounded-xl border text-left text-[12.5px] font-medium transition-all',
                        project.status === s
                          ? sst.badge + ' shadow-sm'
                          : 'border-slate-200 text-slate-500 hover:border-slate-300 hover:bg-slate-50'
                      )}>
                      <span className={cn('w-2 h-2 rounded-full shrink-0', sst.dot)} />
                      {STATUS_LABELS[s]}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Details */}
            <div className="rounded-2xl bg-white border border-slate-100 overflow-hidden"
              style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
              <div className="px-4 py-3 border-b border-slate-100">
                <p className="text-[10.5px] font-bold uppercase tracking-[0.12em] text-slate-400">Project Info</p>
              </div>
              <div className="px-3 py-1 divide-y divide-slate-50">
                <EditableField label="Project Name" value={project.name} icon={FolderKanban}
                  onSave={v => patch({ name: v })} />
                <EditableField label="Start Date" value={project.start_date} icon={Calendar} type="date"
                  onSave={v => patch({ start_date: v })} />
                <EditableField label="Due Date" value={project.due_date} icon={Calendar} type="date"
                  onSave={v => patch({ due_date: v })} />
                {(project.budget || true) && (
                  <EditableField label="Budget" value={project.budget ? `${project.currency} ${Number(project.budget).toLocaleString()}` : ''} icon={DollarSign}
                    onSave={v => patch({ budget: v })} />
                )}
              </div>
            </div>

            {/* Client card */}
            {project.client && (
              <div className="rounded-2xl bg-white border border-slate-100 overflow-hidden"
                style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
                <div className="px-4 py-3 border-b border-slate-100">
                  <p className="text-[10.5px] font-bold uppercase tracking-[0.12em] text-slate-400">Client</p>
                </div>
                <Link href={`/clients/${project.client.id}`}
                  className="flex items-center gap-3 p-4 hover:bg-slate-50 transition-colors group">
                  <div className={cn(
                    'w-9 h-9 rounded-xl flex items-center justify-center shrink-0 text-[13px] font-bold text-white bg-gradient-to-br',
                    avatarGradient(project.client.name)
                  )}>
                    {avatarLetter(project.client.name)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[13px] font-semibold text-slate-800 group-hover:text-brand-700 transition-colors truncate">
                      {project.client.name}
                    </p>
                    {project.client.company && (
                      <p className="text-[11px] text-slate-400 truncate">{project.client.company}</p>
                    )}
                  </div>
                  <ChevronLeft size={13} className="text-slate-300 group-hover:text-brand-400 rotate-180 transition-colors" />
                </Link>
              </div>
            )}

          </div>

          {/* Right 2/3 — description + tasks + docs */}
          <div className="lg:col-span-2 space-y-4">

            {/* Description */}
            <div className="rounded-2xl bg-white border border-slate-100 overflow-hidden"
              style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
              <div className="px-4 py-3 border-b border-slate-100">
                <p className="text-[10.5px] font-bold uppercase tracking-[0.12em] text-slate-400">Description</p>
              </div>
              <div className="px-4 py-2">
                <EditableField label="" value={project.description} textarea
                  onSave={v => patch({ description: v })} />
              </div>
            </div>

            {/* Tasks */}
            <div className="rounded-2xl bg-white border border-slate-100 overflow-hidden"
              style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
              <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
                <p className="text-[10.5px] font-bold uppercase tracking-[0.12em] text-slate-400">Tasks</p>
                <div className="flex items-center gap-2">
                  {totalTasks > 0 && (
                    <span className="text-[11px] text-slate-400">{doneTasks}/{totalTasks} done</span>
                  )}
                </div>
              </div>

              {/* Progress bar */}
              {totalTasks > 0 && (
                <div className="h-1 bg-slate-100 mx-4 mt-3 rounded-full overflow-hidden">
                  <div className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${(doneTasks / totalTasks) * 100}%`, background: 'linear-gradient(90deg,rgb(var(--brand-600)),rgb(var(--brand2-600)))' }} />
                </div>
              )}

              <div className="p-3 space-y-1">
                {tasks.length === 0 ? (
                  <div className="flex flex-col items-center py-6 text-center">
                    <CheckSquare size={24} className="text-slate-300 mb-2" />
                    <p className="text-[12.5px] text-slate-400">No tasks yet. Add one below.</p>
                  </div>
                ) : (
                  <>
                    {/* Todo + In Progress */}
                    {tasks.filter(t => t.status !== 'done').map(task => (
                      <TaskRow key={task.id} task={task} projectId={project.id}
                        onUpdated={updated => setTasks(prev => prev.map(t => t.id === updated.id ? updated : t))}
                        onDeleted={id => setTasks(prev => prev.filter(t => t.id !== id))}
                      />
                    ))}
                    {/* Done tasks */}
                    {tasks.filter(t => t.status === 'done').length > 0 && (
                      <>
                        {tasks.filter(t => t.status !== 'done').length > 0 && (
                          <div className="h-px bg-slate-100 my-1" />
                        )}
                        {tasks.filter(t => t.status === 'done').map(task => (
                          <TaskRow key={task.id} task={task} projectId={project.id}
                            onUpdated={updated => setTasks(prev => prev.map(t => t.id === updated.id ? updated : t))}
                            onDeleted={id => setTasks(prev => prev.filter(t => t.id !== id))}
                          />
                        ))}
                      </>
                    )}
                  </>
                )}
                <AddTaskForm projectId={project.id}
                  onAdded={task => setTasks(prev => [task, ...prev.filter(t => t.id !== task.id)])} />
              </div>
            </div>

            {/* Documents */}
            <div className="rounded-2xl bg-white border border-slate-100 overflow-hidden"
              style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
              <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
                <p className="text-[10.5px] font-bold uppercase tracking-[0.12em] text-slate-400">Documents</p>
                <span className="text-[11px] text-slate-400">{docs.length} file{docs.length !== 1 ? 's' : ''}</span>
              </div>
              <div className="p-4 space-y-3">
                <UploadDocForm projectId={project.id}
                  onUploaded={doc => setDocs(prev => [doc, ...prev])} />
                {docs.length > 0 ? (
                  <div className="divide-y divide-slate-50">
                    {docs.map(doc => (
                      <DocRow key={doc.id} doc={doc} projectId={project.id}
                        onDeleted={id => setDocs(prev => prev.filter(d => d.id !== id))} />
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center py-8 text-center">
                    <FileText size={28} className="text-slate-300 mb-2" />
                    <p className="text-[12.5px] text-slate-400">No documents yet. Upload contracts, briefs, or any files.</p>
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>

      </AppLayout>
    </>
  )
}
