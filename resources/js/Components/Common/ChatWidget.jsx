import { useState, useEffect, useRef, useMemo } from 'react'
import axios from 'axios'
import { MessageCircle, X, Send, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

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
      if (Array.isArray(saved) && saved.length) return saved
    } catch { /* fall through to welcome */ }
    return welcomeMessage
      ? [{ role: 'agent', content: welcomeMessage, at: Date.now() }]
      : []
  })
  const endRef = useRef(null)
  const inputRef = useRef(null)
  const panelRef = useRef(null)

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

  // Close on outside click / Escape, like a real product widget.
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
        content: "Sorry, something went wrong on my end — mind trying that again in a moment?",
        at: Date.now(),
      }])
    } finally {
      setSending(false)
    }
  }

  const initial = agentName?.charAt(0)?.toUpperCase() || 'S'

  return (
    <>
      {/* Chat panel */}
      <div
        ref={panelRef}
        role="dialog"
        aria-label={`Chat with ${agentName}`}
        aria-hidden={!open}
        className={cn(
          'fixed bottom-[92px] right-4 sm:right-6 z-[70] w-[calc(100vw-2rem)] max-w-[380px]',
          'rounded-[20px] overflow-hidden flex flex-col',
          'transition-all duration-250 ease-[cubic-bezier(0.16,1,0.3,1)] origin-bottom-right',
          open
            ? 'opacity-100 scale-100 translate-y-0 pointer-events-auto'
            : 'opacity-0 scale-[0.96] translate-y-2 pointer-events-none'
        )}
        style={{
          background: '#0C0815',
          border: '1px solid rgba(255,255,255,0.09)',
          boxShadow: '0 24px 60px -12px rgba(0,0,0,0.55), 0 4px 20px -4px rgba(124,58,237,0.25), inset 0 1px 0 rgba(255,255,255,0.04)',
        }}
      >
        {/* Header */}
        <div
          className="relative flex items-center gap-3 px-4 py-3.5 shrink-0"
          style={{
            background: 'linear-gradient(150deg, #241A44 0%, #150F29 60%, #0C0815 100%)',
            borderBottom: '1px solid rgba(255,255,255,0.08)',
          }}
        >
          <div
            className="absolute inset-x-0 top-0 h-px"
            style={{ background: 'linear-gradient(90deg, transparent, rgba(196,181,253,0.6), transparent)' }}
          />

          <div className="relative shrink-0">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-[15px]"
              style={{
                background: 'linear-gradient(140deg, #8B5CF6, #6D28D9)',
                boxShadow: '0 2px 8px rgba(124,58,237,0.5), inset 0 1px 1px rgba(255,255,255,0.25)',
              }}
            >
              {initial}
            </div>
            <span className="absolute -bottom-px -right-px w-3 h-3 rounded-full bg-emerald-400 ring-[2.5px] ring-[#1B1330]" />
          </div>

          <div className="flex-1 min-w-0">
            <p className="text-[13.5px] font-bold text-white leading-tight tracking-[-0.01em]">{agentName}</p>
            <p className="text-[11px] text-white/45 font-medium leading-tight mt-0.5">Typically replies in a few seconds</p>
          </div>

          <button
            onClick={() => setOpen(false)}
            className="p-1.5 -mr-1 rounded-lg hover:bg-white/[0.08] text-white/40 hover:text-white/80 transition-colors shrink-0"
            aria-label="Close chat"
          >
            <ChevronDown size={17} />
          </button>
        </div>

        {/* Messages */}
        <div className="h-[380px] overflow-y-auto px-3.5 py-4 space-y-[3px]" style={{ scrollbarWidth: 'thin' }}>
          {grouped.map((msg, i) => (
            <div
              key={i}
              className={cn(
                'flex items-end gap-1.5 group',
                msg.role === 'agent' ? 'justify-start' : 'justify-end',
                msg.isFirstOfGroup && i !== 0 && 'mt-3'
              )}
              style={{ animation: 'chatMsgIn 0.22s ease-out' }}
            >
              {msg.role === 'agent' && (
                <div className="w-5 h-5 rounded-full shrink-0 mb-0.5" style={{ visibility: msg.isLastOfGroup ? 'visible' : 'hidden' }}>
                  <div
                    className="w-full h-full rounded-full flex items-center justify-center text-[9px] font-bold text-white"
                    style={{ background: 'linear-gradient(140deg, #8B5CF6, #6D28D9)' }}
                  >
                    {initial}
                  </div>
                </div>
              )}

              <div className="flex flex-col max-w-[78%]">
                <div className={cn(
                  'px-3.5 py-2.5 text-[13px] leading-[1.5] whitespace-pre-wrap',
                  msg.role === 'agent'
                    ? 'text-white/90'
                    : 'text-white',
                  // Rounded-corner tails only on the group's outer edges, iMessage-style.
                  msg.role === 'agent'
                    ? cn('rounded-r-[16px]', msg.isFirstOfGroup ? 'rounded-tl-[16px]' : 'rounded-tl-[4px]', msg.isLastOfGroup ? 'rounded-bl-[4px]' : 'rounded-bl-[16px]')
                    : cn('rounded-l-[16px]', msg.isFirstOfGroup ? 'rounded-tr-[16px]' : 'rounded-tr-[4px]', msg.isLastOfGroup ? 'rounded-br-[4px]' : 'rounded-br-[16px]')
                )}
                  style={msg.role === 'agent'
                    ? { background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.07)' }
                    : { background: 'linear-gradient(135deg, #7C3AED, #6425D0)', boxShadow: '0 1px 2px rgba(124,58,237,0.3)' }
                  }
                >
                  {msg.content}
                </div>
                {msg.isLastOfGroup && msg.at && (
                  <span className={cn(
                    'text-[9.5px] text-white/25 mt-1 px-1 opacity-0 group-hover:opacity-100 transition-opacity',
                    msg.role === 'agent' ? 'text-left' : 'text-right'
                  )}>
                    {timeLabel(msg.at)}
                  </span>
                )}
              </div>
            </div>
          ))}

          {sending && (
            <div className="flex items-end gap-1.5 mt-3">
              <div className="w-5 h-5 rounded-full shrink-0">
                <div
                  className="w-full h-full rounded-full flex items-center justify-center text-[9px] font-bold text-white"
                  style={{ background: 'linear-gradient(140deg, #8B5CF6, #6D28D9)' }}
                >
                  {initial}
                </div>
              </div>
              <div
                className="px-3.5 py-3 rounded-[16px] rounded-bl-[4px] flex items-center gap-1"
                style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.07)' }}
              >
                <span className="w-[5px] h-[5px] rounded-full bg-white/45 animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-[5px] h-[5px] rounded-full bg-white/45 animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-[5px] h-[5px] rounded-full bg-white/45 animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          )}
          <div ref={endRef} />
        </div>

        {/* Input */}
        <div className="flex items-center gap-2 px-3 py-3 shrink-0" style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !e.shiftKey && send()}
            placeholder="Type your message…"
            maxLength={2000}
            className="flex-1 rounded-full px-4 py-2.5 text-[13px] text-white placeholder:text-white/30 outline-none transition-all"
            style={{ background: 'rgba(255,255,255,0.055)', border: '1px solid rgba(255,255,255,0.09)' }}
            onFocus={e => { e.target.style.borderColor = 'rgba(139,92,246,0.55)'; e.target.style.background = 'rgba(255,255,255,0.07)' }}
            onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.09)'; e.target.style.background = 'rgba(255,255,255,0.055)' }}
          />
          <button
            onClick={send}
            disabled={!input.trim() || sending}
            className="w-9 h-9 rounded-full flex items-center justify-center text-white transition-all disabled:opacity-30 disabled:cursor-not-allowed shrink-0 hover:scale-105 active:scale-95"
            style={{ background: 'linear-gradient(135deg, #8B5CF6, #6425D0)' }}
            aria-label="Send message"
          >
            <Send size={14} strokeWidth={2.4} className="-ml-px" />
          </button>
        </div>
      </div>

      {/* Launcher bubble */}
      <button
        onClick={() => setOpen(o => !o)}
        aria-label={open ? 'Close chat' : `Chat with ${agentName}`}
        className={cn(
          'fixed bottom-5 right-4 sm:right-6 z-[70] w-14 h-14 rounded-full',
          'flex items-center justify-center text-white',
          'transition-all duration-300 ease-out hover:scale-[1.06] active:scale-95',
          mounted ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-3 scale-90'
        )}
        style={{
          background: 'linear-gradient(150deg, #8B5CF6, #6425D0 55%, #4F46E5)',
          boxShadow: '0 10px 30px -6px rgba(124,58,237,0.55), 0 2px 8px rgba(0,0,0,0.25)',
        }}
      >
        <span className={cn(
          'absolute inset-0 rounded-full transition-transform duration-300',
          open ? 'scale-0' : 'scale-100'
        )}>
          <MessageCircle size={23} strokeWidth={2.1} className="absolute inset-0 m-auto" />
        </span>
        <X
          size={22}
          strokeWidth={2.2}
          className={cn('absolute inset-0 m-auto transition-transform duration-300', open ? 'scale-100 rotate-0' : 'scale-0 rotate-45')}
        />

        {unread && !open && (
          <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-rose-500 ring-2 ring-[#0C0815]" />
        )}
      </button>

      <style>{`
        @keyframes chatMsgIn {
          from { opacity: 0; transform: translateY(4px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </>
  )
}
