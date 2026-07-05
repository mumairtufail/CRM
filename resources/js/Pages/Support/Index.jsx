import { Head, useForm } from '@inertiajs/react'
import { useState, useEffect, useRef } from 'react'
import AppLayout from '@/Components/Layout/AppLayout'
import { Input } from '@/Components/ui/input'
import { Textarea } from '@/Components/ui/textarea'
import { Button } from '@/Components/ui/button'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/Components/ui/dialog'
import { toast } from 'sonner'
import { LifeBuoy, Send, Plus, ChevronLeft } from 'lucide-react'
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

function NewCaseDialog({ open, onClose }) {
  const { data, setData, post, processing, errors, reset } = useForm({ subject: '', body: '' })

  const submit = (e) => {
    e.preventDefault()
    post(route('support.store'), {
      onSuccess: () => { toast.success('Case created'); reset(); onClose() },
      onError:   () => toast.error('Please fix the errors below.'),
    })
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-sm font-semibold">New support case</DialogTitle>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-3 mt-1">
          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Subject</label>
            <Input value={data.subject} onChange={e => setData('subject', e.target.value)}
              className="h-8 text-[13px]" placeholder="What do you need help with?" />
            {errors.subject && <p className="text-[11px] text-red-500">{errors.subject}</p>}
          </div>
          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Message</label>
            <Textarea value={data.body} onChange={e => setData('body', e.target.value)}
              rows={5} className="text-[13px] resize-none" placeholder="Describe the issue in detail…" />
            {errors.body && <p className="text-[11px] text-red-500">{errors.body}</p>}
          </div>
          <DialogFooter className="gap-2 pt-1">
            <Button type="button" variant="outline" size="sm" className="h-8 text-xs" onClick={onClose}>Cancel</Button>
            <Button type="submit" size="sm" disabled={processing} className="h-8 text-xs">
              {processing ? 'Creating…' : 'Create case'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function SupportCaseThread({ caseSummary, onBack }) {
  const [messages, setMessages] = useState([])
  const [status, setStatus]     = useState(caseSummary.status)
  const [text, setText]         = useState('')
  const [sending, setSending]   = useState(false)
  const bottomRef = useRef(null)

  const load = async () => {
    const res  = await fetch(route('support.show', caseSummary.id))
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

    const res = await fetch(route('support.reply', caseSummary.id), {
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
    } else {
      toast.error('Failed to send reply.')
    }
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-100 bg-slate-50">
        <button onClick={onBack} className="md:hidden -ml-1 p-1 text-slate-500 hover:text-slate-800">
          <ChevronLeft size={18} />
        </button>
        <div className="w-8 h-8 rounded-full flex items-center justify-center text-white shrink-0"
          style={{ background: 'linear-gradient(135deg,rgb(var(--brand-600)),rgb(var(--brand2-600)))' }}>
          <LifeBuoy size={14} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[13px] font-semibold text-slate-800 truncate">{caseSummary.subject}</p>
        </div>
        <StatusPill status={status} />
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-2 bg-slate-50">
        {messages.length === 0 && (
          <div className="text-center py-8 text-[13px] text-slate-400">No messages yet.</div>
        )}
        {messages.map(msg => (
          <div key={msg.id} className={cn('flex', msg.sender_type === 'user' ? 'justify-end' : 'justify-start')}>
            <div className={cn(
              'max-w-[85%] sm:max-w-[75%] px-3 py-2 rounded-xl text-[13px] shadow-sm',
              msg.sender_type === 'user' ? 'bg-brand-600 text-white rounded-tr-none' : 'bg-white rounded-tl-none'
            )}>
              {msg.sender_type === 'admin' && (
                <p className="text-[10px] text-emerald-600 font-semibold mb-0.5 flex items-center gap-0.5">
                  <LifeBuoy size={10} /> Support Team
                </p>
              )}
              <p className={cn('whitespace-pre-wrap', msg.sender_type === 'user' ? 'text-white' : 'text-slate-800')}>{msg.body}</p>
              <p className={cn('text-[10px] mt-1 text-right', msg.sender_type === 'user' ? 'text-white/60' : 'text-slate-400')}>
                {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      <form onSubmit={send} className="px-4 py-3 border-t border-slate-200 bg-white flex items-center gap-2">
        <Input value={text} onChange={e => setText(e.target.value)}
          placeholder="Type a reply…" className="h-8 text-[13px] flex-1" disabled={sending} />
        <Button type="submit" size="sm" disabled={sending || !text.trim()} className="h-8 w-8 p-0 shrink-0">
          <Send size={14} />
        </Button>
      </form>
    </div>
  )
}

export default function SupportIndex({ cases }) {
  const [activeCase, setActiveCase] = useState(null)
  const [showThreadOnMobile, setShowThreadOnMobile] = useState(false)
  const [newCaseOpen, setNewCaseOpen] = useState(false)

  const openCase = (c) => {
    setActiveCase(c)
    setShowThreadOnMobile(true)
  }

  return (
    <AppLayout title="Support" noPadding>
      <Head title="Support" />

      <div className="flex flex-1 min-h-0">
        <div className={cn(
          'w-full md:w-80 border-r border-slate-200 bg-white flex-col shrink-0',
          showThreadOnMobile ? 'hidden md:flex' : 'flex'
        )}>
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 shrink-0">
            <p className="text-[13px] font-semibold text-slate-700">Your cases</p>
            <Button size="sm" className="h-7 text-[11.5px] gap-1" onClick={() => setNewCaseOpen(true)}>
              <Plus size={12} /> New case
            </Button>
          </div>

          <div className="flex-1 overflow-y-auto" data-scroll-region>
            {cases.length === 0 ? (
              <div className="py-10 text-center px-4">
                <LifeBuoy size={24} className="mx-auto text-slate-300 mb-2" />
                <p className="text-[12px] text-slate-400">No cases yet — create one to get help from our support team.</p>
              </div>
            ) : (
              cases.map(c => (
                <button key={c.id}
                  onClick={() => openCase(c)}
                  className={cn(
                    'w-full text-left px-4 py-3 border-b border-slate-50 hover:bg-slate-50 transition-colors',
                    activeCase?.id === c.id ? 'bg-brand-50 border-l-2 border-l-brand-500' : ''
                  )}>
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-[13px] font-medium text-slate-800 truncate">{c.subject}</p>
                    <StatusPill status={c.status} />
                  </div>
                  {c.last_message && (
                    <p className="text-[11px] text-slate-400 truncate mt-1">
                      {c.last_message.sender_type === 'admin' ? 'Support: ' : ''}
                      {c.last_message.body}
                    </p>
                  )}
                  {c.last_message_at && (
                    <p className="text-[10px] text-slate-300 mt-0.5">{c.last_message_at}</p>
                  )}
                </button>
              ))
            )}
          </div>
        </div>

        <div className={cn('flex-1 min-h-0 flex-col', showThreadOnMobile ? 'flex' : 'hidden md:flex')}>
          {activeCase ? (
            <SupportCaseThread caseSummary={activeCase} onBack={() => setShowThreadOnMobile(false)} />
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

      <NewCaseDialog open={newCaseOpen} onClose={() => setNewCaseOpen(false)} />
    </AppLayout>
  )
}
