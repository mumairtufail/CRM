import { Head, router, useForm } from '@inertiajs/react'
import { useState, useEffect, useRef } from 'react'
import AppLayout from '@/Components/Layout/AppLayout'
import { Input } from '@/Components/ui/input'
import { Button } from '@/Components/ui/button'
import { toast } from 'sonner'
import { Search, Send, MessageSquare, AlertCircle, Bot, User } from 'lucide-react'
import { cn } from '@/lib/utils'

function ConversationThread({ lead, onClose }) {
  const [messages, setMessages] = useState([])
  const [text, setText] = useState('')
  const [sending, setSending] = useState(false)
  const bottomRef = useRef(null)

  useEffect(() => {
    const load = async () => {
      const res  = await fetch(route('whatsapp.conversations.show', lead.id))
      const data = await res.json()
      setMessages(data.messages ?? [])
    }
    load()
  }, [lead.id])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendMsg = async (e) => {
    e.preventDefault()
    if (!text.trim()) return
    setSending(true)

    const res = await fetch(route('whatsapp.conversations.send', lead.id), {
      method:  'POST',
      headers: {
        'Content-Type':  'application/json',
        'X-CSRF-TOKEN':  document.head.querySelector('meta[name="csrf-token"]')?.content ?? '',
        'Accept':        'application/json',
      },
      body: JSON.stringify({ message: text }),
    })

    const data = await res.json()
    setSending(false)

    if (data.success) {
      setMessages(prev => [...prev, {
        id:           Date.now(),
        direction:    'outbound',
        message_body: text,
        is_bot_reply: false,
        created_at:   new Date().toISOString(),
      }])
      setText('')
    } else {
      toast.error(data.message ?? 'Failed to send message.')
    }
  }

  return (
    <div className="flex flex-col h-full">
      {/* Thread header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-100 bg-slate-50">
        <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-[13px] font-bold"
          style={{ background: 'linear-gradient(135deg,#25D366,#128C7E)' }}>
          {lead.name?.charAt(0)?.toUpperCase()}
        </div>
        <div>
          <p className="text-[13px] font-semibold text-slate-800">{lead.name}</p>
          <p className="text-[11px] text-slate-400">{lead.whatsapp_number}</p>
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
              'max-w-[75%] px-3 py-2 rounded-xl text-[13px] shadow-sm',
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
              <p className="text-[10px] text-slate-400 mt-1 text-right">
                {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <form onSubmit={sendMsg} className="flex items-center gap-2 px-4 py-3 border-t border-slate-200 bg-white">
        <Input
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder="Type a message…"
          className="h-8 text-[13px] flex-1"
          disabled={sending}
        />
        <Button type="submit" size="sm" disabled={sending || !text.trim()}
          className="h-8 w-8 p-0 text-white"
          style={{ background: 'linear-gradient(135deg,#25D366,#128C7E)' }}>
          <Send size={14} />
        </Button>
      </form>
    </div>
  )
}

export default function WhatsappConversationsIndex({ leads, search, hasCredential, isVerified }) {
  const [activeLead, setActiveLead] = useState(leads[0] ?? null)
  const [searchText, setSearchText] = useState(search ?? '')

  const doSearch = (e) => {
    e.preventDefault()
    router.get(route('whatsapp.conversations.index'), { search: searchText }, { preserveState: true })
  }

  return (
    <AppLayout>
      <Head title="WhatsApp Conversations" />

      {!hasCredential && (
        <div className="m-4 flex items-start gap-2.5 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
          <AlertCircle size={15} className="text-amber-500 mt-0.5 shrink-0" />
          <p className="text-[13px] text-amber-800">
            Connect your Twilio account in{' '}
            <button className="underline font-medium" onClick={() => router.get('/profile?tab=whatsapp')}>
              Settings → WhatsApp
            </button>{' '}
            to start receiving and sending WhatsApp messages.
          </p>
        </div>
      )}

      <div className="flex h-[calc(100vh-3.5rem)]">
        {/* Sidebar: lead list */}
        <div className="w-72 border-r border-slate-200 bg-white flex flex-col">
          <div className="px-3 py-3 border-b border-slate-100">
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

          <div className="flex-1 overflow-y-auto">
            {leads.length === 0 ? (
              <div className="py-10 text-center">
                <MessageSquare size={24} className="mx-auto text-slate-300 mb-2" />
                <p className="text-[12px] text-slate-400">No conversations yet</p>
              </div>
            ) : (
              leads.map(lead => (
                <button key={lead.id}
                  onClick={() => setActiveLead(lead)}
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

        {/* Chat panel */}
        <div className="flex-1 flex flex-col">
          {activeLead ? (
            <ConversationThread lead={activeLead} onClose={() => setActiveLead(null)} />
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
