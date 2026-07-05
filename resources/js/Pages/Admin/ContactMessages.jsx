import { Head, router, useForm } from '@inertiajs/react'
import { useState, useCallback, useEffect } from 'react'
import AdminLayout from '@/Components/Layout/AdminLayout'
import PageHeader from '@/Components/Common/PageHeader'
import SearchInput from '@/Components/Common/SearchInput'
import {
    MessageSquare, Mail, Building2, Phone, Clock,
    CheckCircle2, Eye, Trash2, X, ChevronDown, Send,
} from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

const STATUS_CONFIG = {
    new:     { label: 'New',     color: 'bg-brand-50 text-brand-700 border-brand-200',  dot: 'bg-brand-500' },
    read:    { label: 'Read',    color: 'bg-blue-50 text-blue-700 border-blue-200',         dot: 'bg-blue-400'   },
    replied: { label: 'Replied', color: 'bg-green-50 text-green-700 border-green-200',      dot: 'bg-green-500'  },
}

function StatusBadge({ status }) {
    const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.new
    return (
        <span className={cn('inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border', cfg.color)}>
            <span className={cn('w-1.5 h-1.5 rounded-full', cfg.dot)} />
            {cfg.label}
        </span>
    )
}

function StatCard({ icon: Icon, label, value, color, bg }) {
    return (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex items-center gap-4">
            <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0" style={{ background: bg }}>
                <Icon className="w-5 h-5" style={{ color }} />
            </div>
            <div>
                <div className="text-2xl font-black text-slate-900 leading-none">{value}</div>
                <div className="text-xs text-slate-400 mt-1 font-medium">{label}</div>
            </div>
        </div>
    )
}

function MessagePanel({ message, onClose, onUpdate }) {
    const form = useForm({
        status:      message.status,
        admin_notes: message.admin_notes || '',
    })

    const submit = () => {
        form.patch(`/admin/contact-messages/${message.id}`, {
            preserveScroll: true,
            onSuccess: () => { toast.success('Message updated'); onUpdate() },
            onError:   () => toast.error('Could not save changes'),
        })
    }

    return (
        <div className="fixed inset-0 z-50 flex">
            {/* Overlay */}
            <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" onClick={onClose} />

            {/* Panel */}
            <div className="relative ml-auto w-full max-w-[520px] h-full bg-white shadow-2xl flex flex-col overflow-y-auto">

                {/* Header */}
                <div className="flex items-start justify-between px-6 py-5 border-b border-slate-100 shrink-0">
                    <div className="min-w-0 pr-4">
                        <h2 className="font-bold text-slate-900 text-base leading-tight truncate">{message.subject}</h2>
                        <p className="text-slate-400 text-xs mt-1">{message.created_at_full}</p>
                    </div>
                    <button onClick={onClose}
                        className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors text-slate-400 shrink-0">
                        <X size={16} />
                    </button>
                </div>

                {/* Sender info */}
                <div className="px-6 py-5 border-b border-slate-50 bg-slate-50/60">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-xl bg-brand-100 flex items-center justify-center text-brand-700 font-bold text-sm shrink-0">
                            {message.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                            <div className="font-semibold text-slate-900 text-sm">{message.name}</div>
                            <div className="text-slate-400 text-xs">{message.email}</div>
                        </div>
                        <StatusBadge status={message.status} />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        {message.company && (
                            <div className="flex items-center gap-2 text-xs text-slate-500">
                                <Building2 size={13} className="shrink-0 text-slate-400" />
                                {message.company}
                            </div>
                        )}
                        {message.phone && (
                            <div className="flex items-center gap-2 text-xs text-slate-500">
                                <Phone size={13} className="shrink-0 text-slate-400" />
                                {message.phone}
                            </div>
                        )}
                        {message.read_at && (
                            <div className="flex items-center gap-2 text-xs text-slate-400">
                                <Eye size={13} className="shrink-0" />
                                Read {message.read_at}
                            </div>
                        )}
                        {message.replied_at && (
                            <div className="flex items-center gap-2 text-xs text-slate-400">
                                <Send size={13} className="shrink-0" />
                                Replied {message.replied_at}
                            </div>
                        )}
                    </div>
                </div>

                {/* Message body */}
                <div className="px-6 py-5 flex-1">
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Message</p>
                    <p className="text-slate-700 text-sm leading-relaxed whitespace-pre-wrap">{message.message}</p>
                </div>

                {/* Admin controls */}
                <div className="px-6 py-5 border-t border-slate-100 space-y-4 shrink-0">
                    <div>
                        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                            Update Status
                        </label>
                        <div className="relative">
                            <select
                                value={form.data.status}
                                onChange={e => form.setData('status', e.target.value)}
                                className="w-full appearance-none px-3 py-2.5 rounded-xl border border-slate-200 bg-white
                                           text-slate-800 text-sm pr-8 focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent"
                            >
                                <option value="new">New</option>
                                <option value="read">Read</option>
                                <option value="replied">Replied</option>
                            </select>
                            <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                            Internal Notes
                        </label>
                        <textarea
                            rows={3}
                            value={form.data.admin_notes}
                            onChange={e => form.setData('admin_notes', e.target.value)}
                            placeholder="Add private notes visible only to admins…"
                            className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-800 text-sm
                                       placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent resize-none"
                        />
                    </div>

                    <button
                        onClick={submit}
                        disabled={form.processing}
                        className="w-full py-2.5 rounded-xl text-white text-sm font-semibold transition-all
                                   hover:opacity-90 disabled:opacity-60"
                        style={{ background: 'linear-gradient(135deg,rgb(var(--brand-600)),rgb(var(--brand2-600)))' }}
                    >
                        {form.processing ? 'Saving…' : 'Save Changes'}
                    </button>
                </div>
            </div>
        </div>
    )
}

export default function AdminContactMessages({ messages, filters, stats }) {
    const [loading, setLoading] = useState(false)
    const [selected, setSelected] = useState(null)
    const [deleteTarget, setDeleteTarget] = useState(null)
    const [activeStatus, setActiveStatus] = useState(filters.status || '')

    const { data: rows, ...pagination } = messages

    useEffect(() => {
        const start = router.on('start',  () => setLoading(true))
        const finish = router.on('finish', () => setLoading(false))
        return () => { start(); finish() }
    }, [])

    const applyFilter = useCallback((status) => {
        setActiveStatus(status)
        router.get('/admin/contact-messages', { ...filters, status: status || undefined, page: 1 }, { preserveState: true, replace: true })
    }, [filters])

    const handleSearch = useCallback(search => {
        router.get('/admin/contact-messages', { ...filters, search, page: 1 }, { preserveState: true, replace: true })
    }, [filters])

    const handlePageChange = useCallback(page => {
        router.get('/admin/contact-messages', { ...filters, page }, { preserveState: true })
    }, [filters])

    const openMessage = (msg) => {
        setSelected(msg)
        // Auto-mark as read when opened
        if (msg.status === 'new') {
            router.patch(`/admin/contact-messages/${msg.id}`, { status: 'read', admin_notes: msg.admin_notes || '' }, {
                preserveScroll: true,
                preserveState: true,
            })
        }
    }

    const confirmDelete = () => {
        if (!deleteTarget) return
        router.delete(`/admin/contact-messages/${deleteTarget.id}`, {
            preserveScroll: true,
            onSuccess: () => { toast.success('Message deleted'); setDeleteTarget(null); setSelected(null) },
            onError:   () => toast.error('Could not delete message'),
        })
    }

    const STATUS_TABS = [
        { label: 'All',     value: '',        count: stats.total   },
        { label: 'New',     value: 'new',     count: stats.new     },
        { label: 'Read',    value: 'read',    count: stats.read    },
        { label: 'Replied', value: 'replied', count: stats.replied },
    ]

    return (
        <AdminLayout>
            <Head title="Contact Messages" />

            <PageHeader title="Contact Messages" subtitle="Queries submitted from the public contact form" />

            {/* ── Stats ── */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <StatCard icon={MessageSquare} label="Total messages" value={stats.total}   color="rgb(var(--brand-600))" bg="rgb(var(--brand-50))" />
                <StatCard icon={Mail}          label="Unread"         value={stats.new}     color="#2563EB" bg="#EFF6FF" />
                <StatCard icon={Eye}           label="Read"           value={stats.read}    color="#D97706" bg="#FFFBEB" />
                <StatCard icon={CheckCircle2}  label="Replied"        value={stats.replied} color="#059669" bg="#ECFDF5" />
            </div>

            {/* ── Filters + Search ── */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden mb-0.5">
                <div className="flex items-center justify-between gap-4 px-4 py-3 border-b border-slate-50">
                    {/* Status tabs */}
                    <div className="flex gap-1">
                        {STATUS_TABS.map(({ label, value, count }) => (
                            <button
                                key={value}
                                onClick={() => applyFilter(value)}
                                className={cn(
                                    'px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors',
                                    activeStatus === value
                                        ? 'bg-brand-600 text-white'
                                        : 'text-slate-500 hover:bg-slate-100'
                                )}
                            >
                                {label}
                                <span className={cn(
                                    'ml-1.5 px-1.5 py-0.5 rounded-full text-[10px] font-bold',
                                    activeStatus === value ? 'bg-white/20' : 'bg-slate-100 text-slate-400'
                                )}>
                                    {count}
                                </span>
                            </button>
                        ))}
                    </div>

                    <SearchInput
                        defaultValue={filters.search}
                        onSearch={handleSearch}
                        placeholder="Search name, email, subject…"
                        className="w-56"
                    />
                </div>

                {/* ── Table ── */}
                {rows.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                        <MessageSquare size={36} className="mb-3 text-slate-200" />
                        <p className="font-semibold text-sm">No messages found</p>
                        <p className="text-xs mt-1">Messages from the Contact Us form will appear here.</p>
                    </div>
                ) : (
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-slate-50">
                                {['From', 'Subject', 'Status', 'Received', ''].map(h => (
                                    <th key={h} className="px-4 py-3 text-left text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                                        {h}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {rows.map(msg => (
                                <tr
                                    key={msg.id}
                                    onClick={() => openMessage(msg)}
                                    className={cn(
                                        'hover:bg-slate-50/80 cursor-pointer transition-colors',
                                        msg.status === 'new' && 'bg-brand-50/30'
                                    )}
                                >
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-2.5">
                                            {msg.status === 'new' && (
                                                <div className="w-2 h-2 rounded-full bg-brand-500 shrink-0" />
                                            )}
                                            <div className="min-w-0">
                                                <div className={cn('font-semibold text-slate-900 text-[13px] truncate max-w-[160px]', msg.status === 'new' && 'font-bold')}>
                                                    {msg.name}
                                                </div>
                                                <div className="text-slate-400 text-xs truncate max-w-[160px]">{msg.email}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="font-medium text-slate-700 text-[13px] truncate max-w-[220px]">{msg.subject}</div>
                                        {msg.company && (
                                            <div className="text-slate-400 text-xs truncate max-w-[220px]">{msg.company}</div>
                                        )}
                                    </td>
                                    <td className="px-4 py-3">
                                        <StatusBadge status={msg.status} />
                                    </td>
                                    <td className="px-4 py-3 text-slate-400 text-xs whitespace-nowrap">
                                        <div className="flex items-center gap-1.5">
                                            <Clock size={11} />
                                            {msg.created_at}
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        <button
                                            onClick={e => { e.stopPropagation(); setDeleteTarget(msg) }}
                                            className="p-1.5 rounded-lg text-slate-300 hover:text-red-500 hover:bg-red-50 transition-colors"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}

                {/* Pagination */}
                {pagination.last_page > 1 && (
                    <div className="flex items-center justify-between px-4 py-3 border-t border-slate-50">
                        <p className="text-xs text-slate-400">
                            Showing {pagination.from}–{pagination.to} of {pagination.total}
                        </p>
                        <div className="flex gap-1">
                            {Array.from({ length: pagination.last_page }, (_, i) => i + 1).map(p => (
                                <button
                                    key={p}
                                    onClick={() => handlePageChange(p)}
                                    className={cn(
                                        'w-8 h-8 rounded-lg text-xs font-semibold transition-colors',
                                        p === pagination.current_page
                                            ? 'bg-brand-600 text-white'
                                            : 'text-slate-500 hover:bg-slate-100'
                                    )}
                                >
                                    {p}
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* ── Message detail panel ── */}
            {selected && (
                <MessagePanel
                    message={selected}
                    onClose={() => setSelected(null)}
                    onUpdate={() => {
                        router.reload({ preserveScroll: true })
                    }}
                />
            )}

            {/* ── Delete confirm ── */}
            {deleteTarget && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/40" onClick={() => setDeleteTarget(null)} />
                    <div className="relative bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm">
                        <div className="w-12 h-12 rounded-2xl bg-red-50 flex items-center justify-center mb-4">
                            <Trash2 className="w-6 h-6 text-red-500" />
                        </div>
                        <h3 className="font-bold text-slate-900 text-base mb-1">Delete this message?</h3>
                        <p className="text-slate-500 text-sm mb-5">
                            From <strong>{deleteTarget.name}</strong> — this action cannot be undone.
                        </p>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setDeleteTarget(null)}
                                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-sm font-semibold hover:bg-slate-50 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmDelete}
                                className="flex-1 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-semibold transition-colors"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </AdminLayout>
    )
}
