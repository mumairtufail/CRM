import { Head, Link, router } from '@inertiajs/react'
import { useState, useRef, useEffect } from 'react'
import AppLayout from '@/Components/Layout/AppLayout'
import ConfirmDialog from '@/Components/Common/ConfirmDialog'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import {
  ChevronLeft, Building2, Mail, Phone, DollarSign,
  FileText, Upload, Trash2, Download, FilePlus, Pencil,
  Check, X, Briefcase, User, Calendar,
} from 'lucide-react'
import { format, formatDistanceToNow } from 'date-fns'

// ─── Status config ─────────────────────────────────────────────────────────────

const CLIENT_STATUSES = ['onboarding', 'active', 'inactive', 'churned']

const STATUS_STYLE = {
  onboarding: { dot: 'bg-amber-400',   badge: 'bg-amber-50 text-amber-700 border-amber-200' },
  active:     { dot: 'bg-emerald-400', badge: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  inactive:   { dot: 'bg-slate-400',   badge: 'bg-slate-100 text-slate-600 border-slate-200' },
  churned:    { dot: 'bg-red-400',     badge: 'bg-red-50 text-red-700 border-red-200' },
}

// ─── Helpers ───────────────────────────────────────────────────────────────────

const csrf = () => document.querySelector('meta[name=csrf-token]')?.content

function avatarLetter(name) { return (name ?? '?').trim()[0]?.toUpperCase() ?? '?' }

const GRADIENTS = [
  'from-violet-500 to-indigo-500', 'from-emerald-500 to-teal-500',
  'from-blue-500 to-cyan-500', 'from-rose-500 to-pink-500', 'from-amber-500 to-orange-500',
]
function avatarGradient(str) {
  let h = 0
  for (const c of (str ?? '')) h = (h * 31 + c.charCodeAt(0)) & 0xffffffff
  return GRADIENTS[Math.abs(h) % GRADIENTS.length]
}

function mimeIcon(mime) {
  if (!mime) return '📄'
  if (mime.startsWith('image/')) return '🖼️'
  if (mime === 'application/pdf') return '📕'
  if (mime.includes('word') || mime.includes('document')) return '📝'
  if (mime.includes('sheet') || mime.includes('excel')) return '📊'
  if (mime.includes('zip') || mime.includes('compressed')) return '🗜️'
  return '📄'
}

// ─── Inline editable field ─────────────────────────────────────────────────────

function EditableField({ label, value, onSave, textarea = false, icon: Icon }) {
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
          <textarea
            autoFocus
            value={draft}
            onChange={e => setDraft(e.target.value)}
            rows={4}
            className="w-full px-3 py-2 rounded-xl border border-violet-300 text-[13px] text-slate-700 focus:outline-none focus:ring-2 focus:ring-violet-200 resize-none"
          />
        ) : (
          <input
            autoFocus
            value={draft}
            onChange={e => setDraft(e.target.value)}
            className="w-full px-3 py-2 rounded-xl border border-violet-300 text-[13px] text-slate-700 focus:outline-none focus:ring-2 focus:ring-violet-200"
          />
        )}
        <div className="flex gap-1.5 mt-1.5">
          <button onClick={save}
            className="flex items-center gap-1 h-7 px-2.5 rounded-lg bg-violet-600 text-white text-[11.5px] font-medium hover:bg-violet-700 transition-colors">
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
      <Pencil size={11} className="text-slate-300 group-hover:text-violet-400 mt-1.5 shrink-0 transition-colors" />
    </button>
  )
}

// ─── Document upload form ──────────────────────────────────────────────────────

function UploadDocForm({ clientId, onUploaded }) {
  const [name, setName]   = useState('')
  const [notes, setNotes] = useState('')
  const [file, setFile]   = useState(null)
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
      const res = await fetch(`/clients/${clientId}/documents`, {
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
        const first = Object.values(json.errors)[0]?.[0] ?? 'Validation failed'
        toast.error(first)
      } else {
        toast.error(json.message ?? `Upload failed (${res.status})`)
      }
    } catch (err) {
      toast.error('Upload failed: ' + (err.message ?? 'network error'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}
      className="rounded-2xl border-2 border-dashed border-slate-200 hover:border-violet-300 transition-colors p-4 bg-slate-50/50">
      <div className="flex items-center gap-2 mb-3">
        <FilePlus size={15} className="text-violet-500" />
        <p className="text-[12.5px] font-semibold text-slate-700">Upload document</p>
      </div>
      <div className="space-y-2">
        <input
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="Document name *"
          required
          className="w-full px-3 py-2 rounded-xl border border-slate-200 text-[13px] text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-violet-200 focus:border-violet-400 transition"
        />
        <textarea
          value={notes}
          onChange={e => setNotes(e.target.value)}
          placeholder="Notes or instructions (optional)"
          rows={2}
          className="w-full px-3 py-2 rounded-xl border border-slate-200 text-[13px] text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-violet-200 focus:border-violet-400 transition resize-none"
        />
        <div className="flex items-center gap-2">
          <label className="flex-1 flex items-center gap-2 px-3 py-2 rounded-xl border border-slate-200 bg-white cursor-pointer hover:border-violet-300 transition-colors">
            <Upload size={13} className="text-slate-400 shrink-0" />
            <span className="text-[12.5px] text-slate-500 truncate">{file ? file.name : 'Choose file…'}</span>
            <input ref={fileRef} type="file" className="hidden" onChange={e => setFile(e.target.files[0] ?? null)} />
          </label>
          <button type="submit" disabled={loading || !file || !name.trim()}
            className="h-9 px-4 rounded-xl text-[12.5px] font-semibold text-white transition-all disabled:opacity-50"
            style={{ background: 'linear-gradient(135deg,#7C3AED,#4F46E5)' }}>
            {loading ? 'Uploading…' : 'Upload'}
          </button>
        </div>
      </div>
    </form>
  )
}

// ─── Document row ──────────────────────────────────────────────────────────────

function DocRow({ doc, clientId, onDeleted }) {
  const [deleting, setDeleting]       = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)

  const handleDelete = async () => {
    setDeleting(true)
    try {
      await fetch(`/clients/${clientId}/documents/${doc.id}`, {
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
        description={`"${doc.name}" will be permanently deleted and cannot be recovered.`}
        onConfirm={handleDelete}
        loading={deleting}
        confirmText="Delete"
        loadingText="Deleting…"
        variant="destructive"
      />
      <div className="flex items-start gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors group">
        <div className="text-xl shrink-0 mt-0.5">{mimeIcon(doc.mime_type)}</div>
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
            className="h-7 w-7 rounded-lg flex items-center justify-center bg-white border border-slate-200 hover:border-violet-300 hover:text-violet-600 transition-colors text-slate-500">
            <Download size={13} />
          </a>
          <button onClick={() => setConfirmOpen(true)} disabled={deleting}
            className="h-7 w-7 rounded-lg flex items-center justify-center bg-white border border-slate-200 hover:border-red-300 hover:text-red-500 transition-colors text-slate-500 disabled:opacity-40">
            <Trash2 size={13} />
          </button>
        </div>
      </div>
    </>
  )
}

// ─── Main page ─────────────────────────────────────────────────────────────────

export default function ClientShow({ client: initialClient }) {
  const [client, setClient]           = useState(initialClient)
  const [docs, setDocs]               = useState(initialClient.documents ?? [])
  const [savingStatus, setSavingStatus] = useState(false)
  const [deleteOpen, setDeleteOpen]   = useState(false)
  const [deleting, setDeleting]       = useState(false)

  const handleDeleteClient = () => {
    setDeleting(true)
    router.delete(`/clients/${client.id}`, {
      onError: () => { setDeleting(false); toast.error('Failed to delete client') },
    })
  }

  const st = STATUS_STYLE[client.status] ?? STATUS_STYLE.active

  const patch = async (data) => {
    try {
      const res = await fetch(`/clients/${client.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json', 'X-CSRF-TOKEN': csrf() },
        body: JSON.stringify(data),
      })
      const json = await res.json()
      if (json.ok) {
        setClient(prev => ({ ...prev, ...data }))
        toast.success('Saved')
      } else {
        toast.error('Save failed')
      }
    } catch {
      toast.error('Save failed')
    }
  }

  const handleStatusChange = async (status) => {
    setSavingStatus(true)
    await patch({ status })
    setSavingStatus(false)
  }

  return (
    <>
      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Delete client?"
        description={`"${client.name}" and all their documents will be permanently deleted. This cannot be undone.`}
        onConfirm={handleDeleteClient}
        loading={deleting}
        confirmText="Delete Client"
        loadingText="Deleting…"
        variant="destructive"
      />
      <Head title={client.name} />
      <AppLayout title={client.name}>

        {/* ── Hero ─────────────────────────────────────────── */}
        <div className="relative overflow-hidden rounded-2xl px-6 py-5 mb-5"
          style={{ background: 'linear-gradient(135deg,#0f172a 0%,#1e293b 60%,#0f172a 100%)', boxShadow: '0 4px 30px rgba(0,0,0,0.15)' }}>
          <div className="absolute top-0 right-0 w-56 h-56 rounded-full pointer-events-none opacity-[0.08]"
            style={{ background: 'radial-gradient(circle,#10b981 0%,transparent 70%)', transform: 'translate(30%,-50%)' }} />

          <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            {/* Left */}
            <div className="flex items-center gap-4">
              <div className={cn(
                'w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 text-[20px] font-bold text-white bg-gradient-to-br shadow-lg',
                avatarGradient(client.name)
              )}>
                {avatarLetter(client.name)}
              </div>
              <div className="min-w-0">
                <h2 className="text-[20px] font-bold text-white leading-tight truncate">{client.name}</h2>
                {client.company && (
                  <p className="text-white/40 text-[13px] mt-0.5 flex items-center gap-1.5">
                    <Building2 size={12} /> {client.company}
                  </p>
                )}
                <div className="flex items-center gap-2 mt-2">
                  <span className={cn('inline-flex items-center gap-1.5 text-[11.5px] font-semibold px-2.5 py-1 rounded-full border', st.badge)}>
                    <span className={cn('w-1.5 h-1.5 rounded-full', st.dot)} />
                    {client.status.charAt(0).toUpperCase() + client.status.slice(1)}
                  </span>
                  {client.converted_at && (
                    <span className="text-white/30 text-[11px]">
                      Client since {format(new Date(client.converted_at), 'MMM d, yyyy')}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Right — actions */}
            <div className="flex items-center gap-2 shrink-0 flex-wrap">
              <Link href="/clients"
                className="flex items-center gap-1.5 h-8 px-3 rounded-xl text-[12px] font-medium text-white/50 hover:text-white hover:bg-white/10 transition-colors">
                <ChevronLeft size={13} /> Back
              </Link>
              {client.lead_id && (
                <Link href={`/leads/${client.lead_id}`}
                  className="flex items-center gap-1.5 h-8 px-3 rounded-xl text-[12px] font-medium bg-white/10 hover:bg-white/20 text-white border border-white/10 transition-colors">
                  <User size={12} /> View Lead
                </Link>
              )}
              <button onClick={() => setDeleteOpen(true)}
                className="flex items-center gap-1.5 h-8 px-3 rounded-xl text-[12px] font-medium bg-red-500/20 hover:bg-red-500/35 text-red-300 border border-red-500/20 transition-colors">
                <Trash2 size={12} /> Delete
              </button>
            </div>
          </div>
        </div>

        {/* ── Main grid ─────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

          {/* ── Left col — info ────────────────────────────── */}
          <div className="space-y-4">

            {/* Status */}
            <div className="rounded-2xl bg-white border border-slate-100 overflow-hidden"
              style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
              <div className="px-4 py-3 border-b border-slate-100">
                <p className="text-[10.5px] font-bold uppercase tracking-[0.12em] text-slate-400">Client Status</p>
              </div>
              <div className="p-3 grid grid-cols-2 gap-2">
                {CLIENT_STATUSES.map(s => {
                  const sst = STATUS_STYLE[s]
                  return (
                    <button key={s} onClick={() => handleStatusChange(s)} disabled={savingStatus}
                      className={cn(
                        'flex items-center gap-2 px-3 py-2 rounded-xl border text-left transition-all text-[12.5px] font-medium',
                        client.status === s
                          ? 'border-current shadow-sm ' + sst.badge
                          : 'border-slate-200 text-slate-500 hover:border-slate-300 hover:bg-slate-50'
                      )}>
                      <span className={cn('w-2 h-2 rounded-full shrink-0', sst.dot)} />
                      {s.charAt(0).toUpperCase() + s.slice(1)}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Contact info */}
            <div className="rounded-2xl bg-white border border-slate-100 overflow-hidden"
              style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
              <div className="px-4 py-3 border-b border-slate-100">
                <p className="text-[10.5px] font-bold uppercase tracking-[0.12em] text-slate-400">Contact Info</p>
              </div>
              <div className="px-3 py-1 divide-y divide-slate-50">
                <EditableField label="Email" value={client.email} icon={Mail}
                  onSave={v => patch({ email: v })} />
                <EditableField label="Phone" value={client.phone} icon={Phone}
                  onSave={v => patch({ phone: v })} />
                <EditableField label="Company" value={client.company} icon={Building2}
                  onSave={v => patch({ company: v })} />
                {client.deal_value && (
                  <div className="flex items-start gap-3 py-2.5">
                    <div className="w-7 h-7 rounded-lg bg-slate-50 flex items-center justify-center shrink-0 mt-0.5">
                      <DollarSign size={13} className="text-slate-400" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Deal Value</p>
                      <p className="text-[13px] text-slate-700 mt-0.5">
                        {client.currency} {Number(client.deal_value).toLocaleString()}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

          </div>

          {/* ── Right 2/3 — notes + docs ───────────────────── */}
          <div className="lg:col-span-2 space-y-4">

            {/* Notes */}
            <div className="rounded-2xl bg-white border border-slate-100 overflow-hidden"
              style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
              <div className="px-4 py-3 border-b border-slate-100">
                <p className="text-[10.5px] font-bold uppercase tracking-[0.12em] text-slate-400">Notes</p>
              </div>
              <div className="px-4 py-2">
                <EditableField label="" value={client.notes} textarea
                  onSave={v => patch({ notes: v })} />
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
                <UploadDocForm clientId={client.id} onUploaded={doc => setDocs(prev => [doc, ...prev])} />

                {docs.length > 0 ? (
                  <div className="divide-y divide-slate-50">
                    {docs.map(doc => (
                      <DocRow key={doc.id} doc={doc} clientId={client.id}
                        onDeleted={id => setDocs(prev => prev.filter(d => d.id !== id))} />
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center py-8 text-center">
                    <FileText size={28} className="text-slate-300 mb-2" />
                    <p className="text-[12.5px] text-slate-400">No documents yet</p>
                    <p className="text-[11.5px] text-slate-400">Upload contracts, proposals, or any files above.</p>
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
