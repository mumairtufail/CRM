import { Head, router } from '@inertiajs/react'
import { useState, useEffect, useRef } from 'react'
import AdminLayout from '@/Components/Layout/AdminLayout'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from '@/Components/ui/dialog'
import { toast } from 'sonner'
import axios from 'axios'
import { cn } from '@/lib/utils'
import {
  Search, Bot, User, Trash2, MessageSquare, Loader2, Globe, Clock,
} from 'lucide-react'

function timeAgo(dateStr) {
  if (!dateStr) return '—'
  const diff = (Date.now() - new Date(dateStr).getTime()) / 1000
  if (diff < 60) return 'just now'
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  return new Date(dateStr).toLocaleDateString()
}

export default function ChatbotConversations({ conversations, filters }) {
  const [search, setSearch] = useState(filters?.search || '')
  const [viewing, setViewing] = useState(null) // conversation being viewed
  const [messages, setMessages] = useState([])
  const [loadingMessages, setLoadingMessages] = useState(false)
  const messagesEndRef = useRef(null)

  // Debounced server-side search
  useEffect(() => {
    const t = setTimeout(() => {
      if ((filters?.search || '') !== search) {
        router.get('/admin/chatbot-conversations', search ? { search } : {}, {
          preserveState: true, preserveScroll: true, replace: true,
        })
      }
    }, 350)
    return () => clearTimeout(t)
  }, [search])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'auto' })
  }, [messages])

  const openConversation = async (conversation) => {
    setViewing(conversation)
    setLoadingMessages(true)
    setMessages([])
    try {
      const res = await axios.get(`/admin/chatbot-conversations/${conversation.id}`)
      setMessages(res.data.messages || [])
    } catch {
      toast.error('Failed to load the transcript.')
    } finally {
      setLoadingMessages(false)
    }
  }

  const deleteConversation = (conversation, e) => {
    e.stopPropagation()
    if (!confirm('Delete this conversation and its full transcript?')) return
    router.delete(`/admin/chatbot-conversations/${conversation.id}`, {
      preserveScroll: true,
      onSuccess: () => {
        toast.success('Conversation deleted.')
        if (viewing?.id === conversation.id) setViewing(null)
      },
    })
  }

  const rows = conversations?.data || []

  return (
    <>
      <Head title="Admin · Chatbot Conversations" />
      <AdminLayout title="Chatbot Conversations">
        <div className="max-w-5xl mx-auto w-full space-y-4">

          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 bg-white p-4 border border-slate-200 rounded-2xl shadow-sm">
            <div>
              <h1 className="text-[18px] font-bold text-slate-800 leading-tight">Chatbot Conversations</h1>
              <p className="text-[12px] text-slate-400 font-normal">
                Every visitor chat from the landing page widget, recorded separately with its full transcript.
              </p>
            </div>
            <div className="relative w-full md:w-72 shrink-0">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              <input
                type="text"
                placeholder="Search by name, email, or session…"
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-1.5 rounded-xl border border-slate-200 bg-white text-[12.5px] text-slate-700 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-violet-500/10 focus:border-violet-400 transition"
              />
            </div>
          </div>

          {/* List */}
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
            {rows.length === 0 ? (
              <div className="py-14 text-center">
                <MessageSquare size={22} className="mx-auto text-slate-300 mb-2" />
                <p className="text-[13px] font-semibold text-slate-500">No conversations yet</p>
                <p className="text-[11.5px] text-slate-400 mt-0.5">
                  Once visitors start chatting with the widget, transcripts will show up here.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {rows.map(c => (
                  <button
                    key={c.id}
                    onClick={() => openConversation(c)}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-50/80 transition-colors text-left"
                  >
                    <div className="w-9 h-9 rounded-xl bg-violet-50 border border-violet-100 flex items-center justify-center shrink-0">
                      <User size={15} className="text-violet-500" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="text-[12.5px] font-bold text-slate-700 truncate">
                          {c.visitor_name || c.visitor_email || `Visitor ${c.session_id.slice(0, 8)}`}
                        </p>
                        <span className="px-1.5 py-0.5 rounded-full text-[9.5px] font-bold bg-slate-100 text-slate-500 border border-slate-200 shrink-0">
                          {c.messages_count} {c.messages_count === 1 ? 'message' : 'messages'}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 mt-0.5 text-[10.5px] text-slate-400">
                        <span className="flex items-center gap-1"><Clock size={10} />{timeAgo(c.last_message_at)}</span>
                        {c.page && <span className="flex items-center gap-1 truncate"><Globe size={10} />{c.page}</span>}
                      </div>
                    </div>
                    <div
                      role="button"
                      tabIndex={0}
                      title="Delete conversation"
                      onClick={(e) => deleteConversation(c, e)}
                      onKeyDown={(e) => e.key === 'Enter' && deleteConversation(c, e)}
                      className="p-1.5 rounded-lg border border-slate-200 hover:border-red-200 hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors shrink-0"
                    >
                      <Trash2 size={12} />
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Pagination */}
          {conversations?.links && conversations.data.length > 0 && (
            <div className="flex items-center justify-center gap-1 flex-wrap">
              {conversations.links.map((link, i) => (
                <button
                  key={i}
                  disabled={!link.url}
                  onClick={() => link.url && router.get(link.url, {}, { preserveState: true, preserveScroll: true })}
                  dangerouslySetInnerHTML={{ __html: link.label }}
                  className={cn(
                    'px-2.5 py-1 rounded-lg text-[11.5px] font-semibold border transition-colors',
                    link.active
                      ? 'bg-violet-600 text-white border-violet-600'
                      : link.url
                        ? 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                        : 'bg-white text-slate-300 border-slate-100 cursor-default'
                  )}
                />
              ))}
            </div>
          )}
        </div>
      </AdminLayout>

      {/* Transcript viewer */}
      <Dialog open={!!viewing} onOpenChange={(open) => !open && setViewing(null)}>
        <DialogContent className="sm:max-w-xl max-h-[85vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="text-[14px] font-bold text-slate-800 flex items-center gap-2">
              <MessageSquare size={14} className="text-violet-600" />
              {viewing?.visitor_name || viewing?.visitor_email || `Visitor ${viewing?.session_id?.slice(0, 8)}`}
            </DialogTitle>
            {viewing && (
              <p className="text-[10.5px] text-slate-400 font-normal">
                Started {new Date(viewing.created_at).toLocaleString()}
                {viewing.page ? ` · ${viewing.page}` : ''}
              </p>
            )}
          </DialogHeader>

          <div className="flex-1 overflow-y-auto py-2 space-y-2.5 min-h-[200px]">
            {loadingMessages ? (
              <div className="flex items-center justify-center py-10">
                <Loader2 size={18} className="animate-spin text-slate-300" />
              </div>
            ) : messages.length === 0 ? (
              <p className="text-center text-[12px] text-slate-400 py-10">No messages in this conversation.</p>
            ) : (
              messages.map(msg => (
                <div key={msg.id} className={cn('flex gap-2', msg.role === 'agent' ? 'justify-start' : 'justify-end')}>
                  {msg.role === 'agent' && (
                    <div className="w-6 h-6 rounded-lg bg-violet-100 flex items-center justify-center shrink-0 mt-0.5">
                      <Bot size={12} className="text-violet-600" />
                    </div>
                  )}
                  <div className={cn(
                    'max-w-[78%] px-3 py-2 rounded-2xl text-[12px] leading-relaxed whitespace-pre-wrap',
                    msg.role === 'agent'
                      ? 'bg-slate-100 text-slate-700 rounded-tl-sm'
                      : 'bg-violet-600 text-white rounded-tr-sm'
                  )}>
                    {msg.content}
                    <div className={cn(
                      'text-[9px] mt-1 opacity-60',
                      msg.role === 'agent' ? 'text-slate-500' : 'text-violet-100'
                    )}>
                      {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
