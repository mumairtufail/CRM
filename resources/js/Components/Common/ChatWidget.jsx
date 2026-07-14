import { useState, useEffect, useRef, useMemo } from 'react'
import axios from 'axios'
import { MessageCircle, Send, X, Sparkles, RotateCcw } from 'lucide-react'
import { cn } from '@/lib/utils'
import { LogoMark } from '@/Components/Common/Logo'

const SESSION_KEY = 'chatbot_session_id'
const HISTORY_KEY = 'chatbot_history'

function getSessionId() {
  let id = localStorage.getItem(SESSION_KEY)
  if (!id) {
    id = (crypto.randomUUID?.() ||
      'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
        const r = Math.random() * 16 | 0
        return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16)
      }))
    localStorage.setItem(SESSION_KEY, id)
  }
  return id
}

function timeLabel(ts) {
  return new Date(ts).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
}

/**
 * Floating live-chat widget for the public landing page. Talks to the
 * platform chatbot (POST /chatbot/message); history is kept in localStorage
 * so the thread survives reloads within the same browser.
 */
export default function ChatWidget({ agentName = 'Sarah', welcomeMessage }) {
  const [mounted, setMounted] = useState(false)
  const [open, setOpen] = useState(false)
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const [unread, setUnread] = useState(false)
  const [messages, setMessages] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]')
      if (Array.isArray(saved) && saved.length) {
        const lastMsg = saved[saved.length - 1]
        if (lastMsg && lastMsg.at && (Date.now() - lastMsg.at) > 2 * 60 * 60 * 1000) {
          localStorage.removeItem(SESSION_KEY)
          localStorage.removeItem(HISTORY_KEY)
        } else {
          return saved
        }
      }
    } catch { /* fall through to welcome */ }
    return welcomeMessage
      ? [{ role: 'agent', content: welcomeMessage, at: Date.now() }]
      : []
  })
  const endRef = useRef(null)
  const inputRef = useRef(null)

  // Small delayed entrance so the launcher doesn't just pop in with the rest of the page.
  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 600)
    return () => clearTimeout(t)
  }, [])

  useEffect(() => {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(messages.slice(-60)))
  }, [messages])

  useEffect(() => {
    if (open) {
      setUnread(false)
      endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
      inputRef.current?.focus()
    }
  }, [open, messages, sending])

  useEffect(() => {
    if (!open) return
    const onKey = (e) => e.key === 'Escape' && setOpen(false)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  // Group consecutive same-role messages so avatars/gaps read like a real thread.
  const grouped = useMemo(() => {
    return messages.map((msg, i) => ({
      ...msg,
      isFirstOfGroup: i === 0 || messages[i - 1].role !== msg.role,
      isLastOfGroup: i === messages.length - 1 || messages[i + 1].role !== msg.role,
    }))
  }, [messages])

  const startNewChat = () => {
    if (confirm('Start a new conversation? Your current chat history will be cleared.')) {
      localStorage.removeItem(SESSION_KEY)
      localStorage.removeItem(HISTORY_KEY)
      setMessages(welcomeMessage ? [{ role: 'agent', content: welcomeMessage, at: Date.now() }] : [])
      setInput('')
    }
  }

  const send = async () => {
    const text = input.trim()
    if (!text || sending) return
    setInput('')
    setMessages(prev => [...prev, { role: 'visitor', content: text, at: Date.now() }])
    setSending(true)
    try {
      const res = await axios.post('/chatbot/message', {
        session_id: getSessionId(),
        message: text,
        page: window.location.pathname,
      })
      setMessages(prev => [...prev, { role: 'agent', content: res.data.reply, at: Date.now() }])
      if (!open) setUnread(true)
    } catch {
      setMessages(prev => [...prev, {
        role: 'agent',
        content: "Sorry, something went wrong on my end, mind trying that again in a moment?",
        at: Date.now(),
      }])
    } finally {
      setSending(false)
    }
  }

  return (
    <>
      {/* Chat panel */}
      <div
        role="dialog"
        aria-label={`Chat with ${agentName}`}
        aria-hidden={!open}
        className={cn(
          'fixed bottom-[88px] right-4 sm:right-6 z-[70] w-[calc(100vw-2rem)] max-w-[368px]',
          'rounded-[24px] overflow-hidden flex flex-col bg-white',
          'transition-all duration-250 ease-[cubic-bezier(0.16,1,0.3,1)] origin-bottom-right',
          open
            ? 'opacity-100 scale-100 translate-y-0 pointer-events-auto'
            : 'opacity-0 scale-[0.96] translate-y-2 pointer-events-none'
        )}
        style={{
          border: '1px solid rgba(15,10,30,0.08)',
          boxShadow: '0 20px 50px -14px rgba(20,10,50,0.22), 0 4px 16px -6px rgba(20,10,50,0.1)',
        }}
      >
        {/* Header */}
        <div className="relative flex items-center gap-3 px-4 py-4 shrink-0 border-b border-slate-100">
          <div className="relative shrink-0">
            <div className="w-9 h-9 rounded-full flex items-center justify-center overflow-hidden ring-2 ring-white"
                 style={{ boxShadow: '0 2px 8px rgb(var(--brand-600) / 0.25)' }}>
              <LogoMark size={36} />
            </div>
            <span className="absolute -bottom-px -right-px w-2.5 h-2.5 rounded-full bg-emerald-400 ring-2 ring-white" />
          </div>

          <div className="flex-1 min-w-0">
            <p className="text-[13.5px] font-bold text-slate-900 leading-tight">{agentName}</p>
            <p className="text-[11px] text-slate-400 font-medium leading-tight mt-0.5">Usually replies in a few seconds</p>
          </div>

          <button
            onClick={startNewChat}
            className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors shrink-0"
            title="Start new chat"
            aria-label="Start new chat"
          >
            <RotateCcw size={14} />
          </button>

          <button
            onClick={() => setOpen(false)}
            className="p-1.5 -mr-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors shrink-0"
            aria-label="Close chat"
          >
            <X size={17} />
          </button>
        </div>

        {/* Messages */}
        <div className="chat-scroll h-[380px] overflow-y-auto px-3.5 py-4 space-y-[3px] bg-slate-50/60">
          {grouped.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center text-center px-6">
              <div className="w-11 h-11 rounded-2xl flex items-center justify-center mb-3"
                   style={{ background: 'linear-gradient(135deg,rgb(var(--brand-600)),rgb(var(--brand2-600)))' }}>
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <p className="text-slate-400 text-[12.5px] leading-relaxed">
                Ask a question and {agentName} will get back to you right away.
              </p>
            </div>
          )}

          {grouped.map((msg, i) => (
            <div
              key={i}
              className={cn(
                'flex items-end group',
                msg.role === 'agent' ? 'justify-start' : 'justify-end',
                msg.isFirstOfGroup && i !== 0 && 'mt-3'
              )}
              style={{ animation: 'chatMsgIn 0.22s ease-out' }}
            >
              <div className="flex flex-col max-w-[80%]">
                <div className={cn(
                  'px-3.5 py-2.5 text-[13px] leading-[1.5] whitespace-pre-wrap',
                  msg.role === 'agent'
                    ? cn('bg-white text-slate-700 border border-slate-100 rounded-r-[16px]', msg.isFirstOfGroup ? 'rounded-tl-[16px]' : 'rounded-tl-[4px]', msg.isLastOfGroup ? 'rounded-bl-[4px]' : 'rounded-bl-[16px]')
                    : cn('text-white rounded-l-[16px]', msg.isFirstOfGroup ? 'rounded-tr-[16px]' : 'rounded-tr-[4px]', msg.isLastOfGroup ? 'rounded-br-[4px]' : 'rounded-br-[16px]')
                )}
                  style={msg.role === 'visitor'
                    ? { background: 'linear-gradient(135deg, rgb(var(--brand-600)), rgb(var(--brand-800)))', boxShadow: '0 1px 2px rgb(var(--brand-600) / 0.25)' }
                    : undefined
                  }
                >
                  {msg.content}
                </div>
                {msg.isLastOfGroup && msg.at && (
                  <span className={cn(
                    'text-[9.5px] text-slate-300 mt-1 px-1 opacity-0 group-hover:opacity-100 transition-opacity',
                    msg.role === 'agent' ? 'text-left' : 'text-right'
                  )}>
                    {timeLabel(msg.at)}
                  </span>
                )}
              </div>
            </div>
          ))}

          {sending && (
            <div className="flex items-end mt-3">
              <div className="px-3.5 py-3 rounded-[16px] rounded-bl-[4px] bg-white border border-slate-100 flex items-center gap-1">
                <span className="w-[5px] h-[5px] rounded-full bg-slate-300 animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-[5px] h-[5px] rounded-full bg-slate-300 animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-[5px] h-[5px] rounded-full bg-slate-300 animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          )}
          <div ref={endRef} />
        </div>

        {/* Input */}
        <div className="flex items-center gap-2 px-3 py-3 shrink-0 border-t border-slate-100 bg-white">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !e.shiftKey && send()}
            placeholder="Type your message..."
            maxLength={2000}
            className="flex-1 rounded-full px-4 py-2.5 text-[13px] text-slate-800 placeholder:text-slate-350 outline-none transition-all bg-slate-100 border border-transparent focus:bg-white focus:border-brand-300"
          />
          <button
            onClick={send}
            disabled={!input.trim() || sending}
            className="w-9 h-9 rounded-full flex items-center justify-center text-white transition-all disabled:opacity-30 disabled:cursor-not-allowed shrink-0 hover:scale-105 active:scale-95"
            style={{ background: 'linear-gradient(135deg, rgb(var(--brand-500)), rgb(var(--brand-800)))' }}
            aria-label="Send message"
          >
            <Send size={14} strokeWidth={2.4} className="-ml-px" />
          </button>
        </div>
      </div>

      {/* Launcher bubble */}
      <button
        onClick={() => setOpen(true)}
        aria-label={`Chat with ${agentName}`}
        aria-hidden={open}
        tabIndex={open ? -1 : 0}
        className={cn(
          'fixed bottom-5 right-4 sm:right-6 z-[70] w-14 h-14 rounded-full',
          'flex items-center justify-center text-white',
          'transition-all duration-300 ease-out',
          open
            ? 'opacity-0 scale-75 translate-y-2 pointer-events-none'
            : mounted
              ? 'opacity-100 translate-y-0 scale-100 hover:scale-[1.06] active:scale-95 pointer-events-auto'
              : 'opacity-0 translate-y-3 scale-90 pointer-events-none'
        )}
        style={{
          background: 'linear-gradient(150deg, rgb(var(--brand-500)), rgb(var(--brand-800)) 55%, rgb(var(--brand2-600)))',
          boxShadow: '0 10px 28px -8px rgb(var(--brand-600) / 0.5), 0 2px 8px rgba(0,0,0,0.18)',
        }}
      >
        <MessageCircle size={23} strokeWidth={2.1} />

        {unread && !open && (
          <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-rose-500 ring-2 ring-white" />
        )}
      </button>

      <style>{`
        @keyframes chatMsgIn {
          from { opacity: 0; transform: translateY(4px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .chat-scroll { scrollbar-width: thin; scrollbar-color: rgba(15,10,30,0.14) transparent; }
        .chat-scroll::-webkit-scrollbar { width: 6px; }
        .chat-scroll::-webkit-scrollbar-track { background: transparent; }
        .chat-scroll::-webkit-scrollbar-thumb { background: rgba(15,10,30,0.14); border-radius: 999px; }
        .chat-scroll::-webkit-scrollbar-thumb:hover { background: rgba(15,10,30,0.22); }
      `}</style>
    </>
  )
}
