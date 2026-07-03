import { Head, router } from '@inertiajs/react'
import { useState, useEffect, useRef } from 'react'
import AppLayout from '@/Components/Layout/AppLayout'
import { Input } from '@/Components/ui/input'
import { Button } from '@/Components/ui/button'
import {
  Select, SelectTrigger, SelectValue, SelectContent, SelectItem,
} from '@/Components/ui/select'
import { toast } from 'sonner'
import {
  Search, Send, MessageSquare, AlertCircle, Bot, ChevronLeft,
  Check, CheckCheck, Clock, XCircle, Lock,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const STATUS_ICON = {
  queued:    <Clock size={11} className="text-slate-400" />,
  sent:      <Check size={11} className="text-slate-400" />,
  delivered: <CheckCheck size={11} className="text-slate-400" />,
  read:      <CheckCheck size={11} className="text-blue-500" />,
  failed:    <XCircle size={11} className="text-red-500" />,
}

function ConversationThread({ lead, templates, onBack }) {
  const [messages, setMessages]     = useState([])
  const [sessionOpen, setSessionOpen] = useState(true)
  const [text, setText]             = useState('')
  const [templateName, setTemplateName] = useState('')
  const [sending, setSending]       = useState(false)
  const bottomRef = useRef(null)

  const load = async () => {
    const res  = await fetch(route('whatsapp.conversations.show', lead.id))
    const data = await res.json()
    setMessages(data.messages ?? [])
    setSessionOpen(!!data.session_open)
  }

  useEffect(() => {
    load()
    const interval = setInterval(load, 5000)
    return () => clearInterval(interval)
  }, [lead.id])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendMsg = async (e) => {
    e.preventDefault()
    const usingTemplate = !sessionOpen
    if (usingTemplate && !templateName) { toast.error('Choose a template to start this conversation.'); return }
    if (!usingTemplate && !text.trim()) return

    setSending(true)

    const res = await fetch(route('whatsapp.conversations.send', lead.id), {
      method:  'POST',
      headers: {
        'Content-Type':  'application/json',
        'X-CSRF-TOKEN':  document.head.querySelector('meta[name="csrf-token"]')?.content ?? '',
        'Accept':        'application/json',
      },
      body: JSON.stringify(usingTemplate
        ? { message_type: 'template', template_name: templateName }
        : { message_type: 'text', message: text }),
    })

    const data = await res.json()
    setSending(false)

    if (data.success) {
      setText('')
      setTemplateName('')
      load()
    } else {
      toast.error(data.message ?? 'Failed to send message.')
    }
  }

  return (
    <div className="flex flex-col h-full">
      {/* Thread header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-100 bg-slate-50">
        <button onClick={onBack} className="md:hidden -ml-1 p-1 text-slate-500 hover:text-slate-800">
          <ChevronLeft size={18} />
        </button>
        <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-[13px] font-bold shrink-0"
          style={{ background: 'linear-gradient(135deg,#25D366,#128C7E)' }}>
          {lead.name?.charAt(0)?.toUpperCase()}
        </div>
        <div className="min-w-0">
          <p className="text-[13px] font-semibold text-slate-800 truncate">{lead.name}</p>
          <p className="text-[11px] text-slate-400 truncate">{lead.whatsapp_number}</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2 bg-[#E5DDD5]">
        {messages.length === 0 && (
          <div className="text-center py-8 text-[13px] text-slate-500">
            No messages yet. Start the conversation.
          </div>
        )}

        {messages.map(msg => (
          <div key={msg.id}
            className={cn('flex', msg.direction === 'outbound' ? 'justify-end' : 'justify-start')}>
            <div className={cn(
              'max-w-[85%] sm:max-w-[75%] px-3 py-2 rounded-xl text-[13px] shadow-sm',
              msg.direction === 'outbound'
                ? 'bg-[#DCF8C6] rounded-tr-none'
                : 'bg-white rounded-tl-none'
            )}>
              {msg.is_bot_reply && (
                <p className="text-[10px] text-violet-500 font-semibold mb-0.5 flex items-center gap-0.5">
                  <Bot size={10} /> AI Assistant
                </p>
              )}
              <p className="text-slate-800 whitespace-pre-wrap">{msg.message_body}</p>
              <p className="text-[10px] text-slate-400 mt-1 flex items-center justify-end gap-1">
                {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                {msg.direction === 'outbound' && (STATUS_ICON[msg.status] ?? null)}
              </p>
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Compose */}
      <form onSubmit={sendMsg} className="px-4 py-3 border-t border-slate-200 bg-white space-y-2">
        {!sessionOpen && (
          <p className="text-[11px] text-amber-600 flex items-center gap-1">
            <AlertCircle size={11} /> No open session — send an approved template to start this conversation.
          </p>
        )}
        <div className="flex items-center gap-2">
          {!sessionOpen ? (
            <Select value={templateName} onValueChange={setTemplateName}>
              <SelectTrigger className="h-8 text-[13px] flex-1">
                <SelectValue placeholder={templates?.length ? 'Choose a template…' : 'No approved templates configured'} />
              </SelectTrigger>
              <SelectContent>
                {(templates ?? []).map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
              </SelectContent>
            </Select>
          ) : (
            <Input
              value={text}
              onChange={e => setText(e.target.value)}
              placeholder="Type a message…"
              className="h-8 text-[13px] flex-1"
              disabled={sending}
            />
          )}
          <Button type="submit" size="sm" disabled={sending || (sessionOpen ? !text.trim() : !templateName)}
            className="h-8 w-8 p-0 text-white shrink-0"
            style={{ background: 'linear-gradient(135deg,#25D366,#128C7E)' }}>
            <Send size={14} />
          </Button>
        </div>
      </form>
    </div>
  )
}

function LockedState() {
  return (
    <div className="flex-1 flex items-center justify-center bg-slate-50 p-6">
      <div className="text-center max-w-sm">
        <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
          <Lock size={22} className="text-slate-400" />
        </div>
        <p className="text-[15px] font-semibold text-slate-700">WhatsApp isn't active on your account yet</p>
        <p className="text-[13px] text-slate-500 mt-1.5 leading-relaxed">
          Contact your account manager to enable WhatsApp messaging for your workspace.
        </p>
      </div>
    </div>
  )
}

export default function WhatsappConversationsIndex({ leads, search, enabled, quotaLimit, quotaUsed, templates }) {
  const [activeLead, setActiveLead] = useState(null)
  const [searchText, setSearchText] = useState(search ?? '')
  const [showThreadOnMobile, setShowThreadOnMobile] = useState(false)

  const doSearch = (e) => {
    e.preventDefault()
    router.get(route('whatsapp.conversations.index'), { search: searchText }, { preserveState: true })
  }

  const openLead = (lead) => {
    setActiveLead(lead)
    setShowThreadOnMobile(true)
  }

  if (!enabled) {
    return (
      <AppLayout noPadding>
        <Head title="WhatsApp Conversations" />
        <div className="flex flex-1 min-h-0">
          <LockedState />
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout noPadding>
      <Head title="WhatsApp Conversations" />

      {quotaLimit != null && (
        <div className="mx-4 mt-3 shrink-0 flex items-center gap-2.5 bg-blue-50 border border-blue-100 rounded-lg px-3 py-2">
          <p className="text-[12px] text-blue-700">
            <span className="font-semibold">{quotaUsed}</span> of <span className="font-semibold">{quotaLimit}</span> WhatsApp messages used this month
          </p>
        </div>
      )}

      <div className="flex flex-1 min-h-0">
        {/* Sidebar: lead list — hidden on mobile once a thread is open */}
        <div className={cn(
          'w-full md:w-72 border-r border-slate-200 bg-white flex-col shrink-0',
          showThreadOnMobile ? 'hidden md:flex' : 'flex'
        )}>
          <div className="px-3 py-3 border-b border-slate-100 shrink-0">
            <form onSubmit={doSearch}>
              <div className="relative">
                <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <Input
                  value={searchText}
                  onChange={e => setSearchText(e.target.value)}
                  placeholder="Search leads…"
                  className="h-7 pl-7 text-[12px]"
                />
              </div>
            </form>
          </div>

          <div className="flex-1 overflow-y-auto" data-scroll-region>
            {leads.length === 0 ? (
              <div className="py-10 text-center">
                <MessageSquare size={24} className="mx-auto text-slate-300 mb-2" />
                <p className="text-[12px] text-slate-400">No conversations yet</p>
              </div>
            ) : (
              leads.map(lead => (
                <button key={lead.id}
                  onClick={() => openLead(lead)}
                  className={cn(
                    'w-full text-left px-4 py-3 border-b border-slate-50 hover:bg-slate-50 transition-colors',
                    activeLead?.id === lead.id ? 'bg-emerald-50 border-l-2 border-l-emerald-500' : ''
                  )}>
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-[12px] font-bold shrink-0"
                      style={{ background: 'linear-gradient(135deg,#25D366,#128C7E)' }}>
                      {lead.name?.charAt(0)?.toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-[13px] font-medium text-slate-800 truncate">{lead.name}</p>
                        {lead.unread_count > 0 && (
                          <span className="w-4 h-4 rounded-full bg-emerald-500 text-white text-[10px] font-bold flex items-center justify-center shrink-0">
                            {lead.unread_count}
                          </span>
                        )}
                      </div>
                      {lead.last_message && (
                        <p className="text-[11px] text-slate-400 truncate mt-0.5">
                          {lead.last_message.direction === 'outbound' ? '→ ' : ''}
                          {lead.last_message.message_body}
                        </p>
                      )}
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Chat panel — hidden on mobile until a thread is opened */}
        <div className={cn('flex-1 min-h-0 flex-col', showThreadOnMobile ? 'flex' : 'hidden md:flex')}>
          {activeLead ? (
            <ConversationThread
              lead={activeLead}
              templates={templates}
              onBack={() => setShowThreadOnMobile(false)}
            />
          ) : (
            <div className="flex-1 flex items-center justify-center bg-[#E5DDD5]">
              <div className="text-center">
                <MessageSquare size={40} className="mx-auto text-slate-300 mb-3" />
                <p className="text-[14px] text-slate-500">Select a conversation to open it</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  )
}
