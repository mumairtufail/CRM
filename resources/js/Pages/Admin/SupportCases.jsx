import { Head, router } from '@inertiajs/react'
import { useState, useEffect, useRef } from 'react'
import AdminLayout from '@/Components/Layout/AdminLayout'
import PageHeader from '@/Components/Common/PageHeader'
import SearchInput from '@/Components/Common/SearchInput'
import { Input } from '@/Components/ui/input'
import { Button } from '@/Components/ui/button'
import {
  Select, SelectTrigger, SelectValue, SelectContent, SelectItem,
} from '@/Components/ui/select'
import { toast } from 'sonner'
import {
  LifeBuoy, Send, Inbox, Clock3, CheckCircle2, ChevronLeft,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const STATUS_CFG = {
  open:    { label: 'Open',    cls: 'bg-brand-50 text-brand-700 border-brand-200' },
  pending: { label: 'Pending', cls: 'bg-amber-50 text-amber-700 border-amber-200' },
  closed:  { label: 'Closed',  cls: 'bg-slate-100 text-slate-500 border-slate-200' },
}

function StatusPill({ status }) {
  const cfg = STATUS_CFG[status] ?? STATUS_CFG.open
  return (
    <span className={cn('inline-flex items-center px-2 py-0.5 rounded-full text-[10.5px] font-semibold border', cfg.cls)}>
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

function AdminCaseThread({ caseSummary, onBack, onStatusChanged }) {
  const [messages, setMessages] = useState([])
  const [status, setStatus]     = useState(caseSummary.status)
  const [text, setText]         = useState('')
  const [sending, setSending]   = useState(false)
  const bottomRef = useRef(null)

  const load = async () => {
    const res  = await fetch(route('admin.support.show', caseSummary.id))
    const data = await res.json()
    setMessages(data.messages ?? [])
    setStatus(data.case?.status ?? caseSummary.status)
  }

  useEffect(() => {
    load()
    const interval = setInterval(load, 5000)
    return () => clearInterval(interval)
  }, [caseSummary.id])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const send = async (e) => {
    e.preventDefault()
    if (!text.trim()) return
    setSending(true)

    const res = await fetch(route('admin.support.reply', caseSummary.id), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-TOKEN': document.head.querySelector('meta[name="csrf-token"]')?.content ?? '',
        'Accept': 'application/json',
      },
      body: JSON.stringify({ body: text }),
    })
    const data = await res.json()
    setSending(false)

    if (data.success) {
      setText('')
      load()
      onStatusChanged?.('pending')
    } else {
      toast.error('Failed to send reply.')
    }
  }

  const changeStatus = (value) => {
    setStatus(value)
    router.patch(route('admin.support.status', caseSummary.id), { status: value }, {
      preserveScroll: true,
      preserveState: true,
      onSuccess: () => { toast.success('Status updated'); onStatusChanged?.(value) },
    })
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-100 bg-slate-50">
        <button onClick={onBack} className="lg:hidden -ml-1 p-1 text-slate-500 hover:text-slate-800">
          <ChevronLeft size={18} />
        </button>
        <div className="min-w-0 flex-1">
          <p className="text-[13px] font-semibold text-slate-800 truncate">{caseSummary.subject}</p>
          <p className="text-[11px] text-slate-400 truncate">{caseSummary.organization_name}</p>
        </div>
        <Select value={status} onValueChange={changeStatus}>
          <SelectTrigger className="h-7 text-[11.5px] w-28"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="open">Open</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="closed">Closed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-2 bg-slate-50">
        {messages.length === 0 && (
          <div className="text-center py-8 text-[13px] text-slate-400">No messages yet.</div>
        )}
        {messages.map(msg => (
          <div key={msg.id} className={cn('flex', msg.sender_type === 'admin' ? 'justify-end' : 'justify-start')}>
            <div className={cn(
              'max-w-[85%] sm:max-w-[75%] px-3 py-2 rounded-xl text-[13px] shadow-sm',
              msg.sender_type === 'admin' ? 'bg-brand-600 text-white rounded-tr-none' : 'bg-white rounded-tl-none'
            )}>
              <p className={cn('text-[10px] font-semibold mb-0.5', msg.sender_type === 'admin' ? 'text-white/70' : 'text-slate-400')}>
                {msg.sender_name}
              </p>
              <p className={cn('whitespace-pre-wrap', msg.sender_type === 'admin' ? 'text-white' : 'text-slate-800')}>{msg.body}</p>
              <p className={cn('text-[10px] mt-1 text-right', msg.sender_type === 'admin' ? 'text-white/60' : 'text-slate-400')}>
                {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      <form onSubmit={send} className="px-4 py-3 border-t border-slate-200 bg-white flex items-center gap-2">
        <Input value={text} onChange={e => setText(e.target.value)}
          placeholder="Reply to this case…" className="h-8 text-[13px] flex-1" disabled={sending} />
        <Button type="submit" size="sm" disabled={sending || !text.trim()} className="h-8 w-8 p-0 shrink-0">
          <Send size={14} />
        </Button>
      </form>
    </div>
  )
}

export default function AdminSupportCases({ cases, filters, stats }) {
  const [activeCase, setActiveCase] = useState(null)
  const [showThreadOnMobile, setShowThreadOnMobile] = useState(false)
  const rows = cases.data ?? cases

  const applyFilter = (status) => {
    router.get(route('admin.support.index'), { ...filters, status: status || undefined }, { preserveState: true, replace: true })
  }

  const handleSearch = (search) => {
    router.get(route('admin.support.index'), { ...filters, search: search || undefined }, { preserveState: true, replace: true })
  }

  const openCase = (c) => {
    setActiveCase(c)
    setShowThreadOnMobile(true)
  }

  const STATUS_TABS = [
    { label: 'All',     value: '',        count: stats.total },
    { label: 'Open',    value: 'open',    count: stats.open },
    { label: 'Pending', value: 'pending', count: stats.pending },
    { label: 'Closed',  value: 'closed',  count: stats.closed },
  ]

  return (
    <AdminLayout>
      <Head title="Support Cases" />

      <PageHeader title="Support Cases" description="Cases raised by workspaces across the platform" />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard icon={LifeBuoy}       label="Total cases" value={stats.total}   color="rgb(var(--brand-600))" bg="rgb(var(--brand-50))" />
        <StatCard icon={Inbox}          label="Open"         value={stats.open}    color="rgb(var(--brand-600))" bg="rgb(var(--brand-50))" />
        <StatCard icon={Clock3}         label="Pending"      value={stats.pending} color="#D97706" bg="#FFFBEB" />
        <StatCard icon={CheckCircle2}   label="Closed"       value={stats.closed}  color="#059669" bg="#ECFDF5" />
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between gap-4 px-4 py-3 border-b border-slate-50">
          <div className="flex gap-1">
            {STATUS_TABS.map(({ label, value, count }) => (
              <button key={value} onClick={() => applyFilter(value)}
                className={cn(
                  'px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors',
                  (filters.status ?? '') === value ? 'bg-brand-600 text-white' : 'text-slate-500 hover:bg-slate-100'
                )}>
                {label}
                <span className={cn(
                  'ml-1.5 px-1.5 py-0.5 rounded-full text-[10px] font-bold',
                  (filters.status ?? '') === value ? 'bg-white/20' : 'bg-slate-100 text-slate-400'
                )}>{count}</span>
              </button>
            ))}
          </div>
          <SearchInput value={filters.search ?? ''} onChange={handleSearch}
            placeholder="Search subject or workspace…" className="w-64" />
        </div>

        <div className="flex" style={{ height: '65vh' }}>
          <div className={cn(
            'w-full lg:w-80 border-r border-slate-100 flex-col shrink-0 overflow-y-auto',
            showThreadOnMobile ? 'hidden lg:flex' : 'flex'
          )}>
            {rows.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-slate-400 px-4">
                <LifeBuoy size={32} className="mb-3 text-slate-200" />
                <p className="font-semibold text-sm">No cases found</p>
              </div>
            ) : (
              rows.map(c => (
                <button key={c.id} onClick={() => openCase(c)}
                  className={cn(
                    'w-full text-left px-4 py-3 border-b border-slate-50 hover:bg-slate-50 transition-colors',
                    activeCase?.id === c.id ? 'bg-brand-50 border-l-2 border-l-brand-500' : ''
                  )}>
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-[13px] font-medium text-slate-800 truncate">{c.subject}</p>
                    <StatusPill status={c.status} />
                  </div>
                  <p className="text-[11px] text-slate-400 truncate mt-1">{c.organization_name}</p>
                  {c.last_message_at && <p className="text-[10px] text-slate-300 mt-0.5">{c.last_message_at}</p>}
                </button>
              ))
            )}
          </div>

          <div className={cn('flex-1 flex-col', showThreadOnMobile ? 'flex' : 'hidden lg:flex')}>
            {activeCase ? (
              <AdminCaseThread
                caseSummary={activeCase}
                onBack={() => setShowThreadOnMobile(false)}
                onStatusChanged={(s) => setActiveCase(prev => prev && { ...prev, status: s })}
              />
            ) : (
              <div className="flex-1 flex items-center justify-center bg-slate-50">
                <div className="text-center">
                  <LifeBuoy size={40} className="mx-auto text-slate-300 mb-3" />
                  <p className="text-[14px] text-slate-500">Select a case to view the conversation</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}
