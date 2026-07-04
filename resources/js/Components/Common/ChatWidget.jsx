import { useState, useEffect, useRef } from 'react'
import axios from 'axios'
import { MessageCircle, X, Send } from 'lucide-react'
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

/**
 * Floating live-chat widget for the public landing page. Talks to the
 * platform chatbot (POST /chatbot/message); history is kept in localStorage
 * so the thread survives reloads within the same browser.
 */
export default function ChatWidget({ agentName = 'Sarah', welcomeMessage }) {
  const [open, setOpen] = useState(false)
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const [messages, setMessages] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]')
      if (Array.isArray(saved) && saved.length) return saved
    } catch { /* fall through to welcome */ }
    return welcomeMessage ? [{ role: 'agent', content: welcomeMessage }] : []
  })
  const endRef = useRef(null)
  const inputRef = useRef(null)

  useEffect(() => {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(messages.slice(-60)))
  }, [messages])

  useEffect(() => {
    if (open) {
      endRef.current?.scrollIntoView({ behavior: 'smooth' })
      inputRef.current?.focus()
    }
  }, [open, messages, sending])

  const send = async () => {
    const text = input.trim()
    if (!text || sending) return
    setInput('')
    setMessages(prev => [...prev, { role: 'visitor', content: text }])
    setSending(true)
    try {
      const res = await axios.post('/chatbot/message', {
        session_id: getSessionId(),
        message: text,
        page: window.location.pathname,
      })
      setMessages(prev => [...prev, { role: 'agent', content: res.data.reply }])
    } catch {
      setMessages(prev => [...prev, {
        role: 'agent',
        content: "Sorry, something went wrong on my end — mind trying that again in a moment?",
      }])
    } finally {
      setSending(false)
    }
  }

  return (
    <>
      {/* Chat panel */}
      <div
        className={cn(
          'fixed bottom-24 right-4 sm:right-6 z-[70] w-[calc(100vw-2rem)] max-w-[370px]',
          'rounded-2xl overflow-hidden shadow-2xl border border-white/10',
          'transition-all duration-200 origin-bottom-right',
          open ? 'opacity-100 scale-100 pointer-events-auto' : 'opacity-0 scale-95 pointer-events-none'
        )}
        style={{ background: '#0B0714' }}
      >
        {/* Header */}
        <div
          className="flex items-center gap-3 px-4 py-3 border-b border-white/10"
          style={{ background: 'linear-gradient(135deg, rgba(124,58,237,0.35), rgba(79,70,229,0.25))' }}
        >
          <div className="relative">
            <div className="w-9 h-9 rounded-full bg-violet-600 flex items-center justify-center text-white font-bold text-[14px]">
              {agentName?.charAt(0)?.toUpperCase() || 'S'}
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-400 border-2 border-[#0B0714]" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[13px] font-bold text-white leading-tight">{agentName}</p>
            <p className="text-[10.5px] text-emerald-300/90 font-medium">Online now</p>
          </div>
          <button
            onClick={() => setOpen(false)}
            className="p-1.5 rounded-lg hover:bg-white/10 text-white/50 hover:text-white transition-colors"
            aria-label="Close chat"
          >
            <X size={15} />
          </button>
        </div>

        {/* Messages */}
        <div className="h-[340px] overflow-y-auto px-3.5 py-3 space-y-2.5">
          {messages.map((msg, i) => (
            <div key={i} className={cn('flex', msg.role === 'agent' ? 'justify-start' : 'justify-end')}>
              <div className={cn(
                'max-w-[82%] px-3 py-2 rounded-2xl text-[12.5px] leading-relaxed whitespace-pre-wrap',
                msg.role === 'agent'
                  ? 'bg-white/[0.07] text-white/85 rounded-tl-sm border border-white/[0.06]'
                  : 'bg-violet-600 text-white rounded-tr-sm'
              )}>
                {msg.content}
              </div>
            </div>
          ))}

          {sending && (
            <div className="flex justify-start">
              <div className="px-3.5 py-2.5 rounded-2xl rounded-tl-sm bg-white/[0.07] border border-white/[0.06] flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-white/40 animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-1.5 h-1.5 rounded-full bg-white/40 animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-1.5 h-1.5 rounded-full bg-white/40 animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          )}
          <div ref={endRef} />
        </div>

        {/* Input */}
        <div className="flex items-center gap-2 px-3 py-2.5 border-t border-white/10">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !e.shiftKey && send()}
            placeholder="Type your message…"
            maxLength={2000}
            className="flex-1 bg-white/[0.06] border border-white/10 rounded-xl px-3 py-2 text-[12.5px] text-white placeholder:text-white/30 outline-none focus:border-violet-500/60 focus:ring-2 focus:ring-violet-500/15 transition"
          />
          <button
            onClick={send}
            disabled={!input.trim() || sending}
            className="p-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
            aria-label="Send message"
          >
            <Send size={14} />
          </button>
        </div>
      </div>

      {/* Launcher bubble */}
      <button
        onClick={() => setOpen(o => !o)}
        aria-label={open ? 'Close chat' : 'Chat with us'}
        className={cn(
          'fixed bottom-5 right-4 sm:right-6 z-[70] w-[52px] h-[52px] rounded-full',
          'flex items-center justify-center text-white shadow-xl shadow-violet-900/40',
          'transition-transform duration-150 hover:scale-105 active:scale-95'
        )}
        style={{ background: 'linear-gradient(135deg, #7C3AED, #4F46E5)' }}
      >
        {open ? <X size={20} /> : <MessageCircle size={21} />}
      </button>
    </>
  )
}
