import React, { useState, useCallback, useEffect, useRef, useMemo, memo } from 'react'
import { Head, router } from '@inertiajs/react'
import AppLayout from '@/Components/Layout/AppLayout'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import {
  Inbox, Star, Trash2, RefreshCw, Mail, MailOpen,
  StarOff, RotateCcw, Trash, AlertCircle, Settings,
  ChevronRight, User, Clock, PenLine, X, Send,
} from 'lucide-react'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/Components/ui/dialog'
import { Input } from '@/Components/ui/input'
import { Label } from '@/Components/ui/label'
import { formatDistanceToNow, format, isToday, isThisYear } from 'date-fns'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatEmailDate(iso) {
  if (!iso) return ''
  const d = new Date(iso)
  if (isToday(d)) return format(d, 'h:mm a')
  if (isThisYear(d)) return format(d, 'MMM d')
  return format(d, 'MMM d, yyyy')
}

function avatarLetter(name, email) {
  const src = name || email || '?'
  return src.trim()[0]?.toUpperCase() ?? '?'
}

const AVATAR_COLORS = [
  'from-violet-500 to-indigo-500',
  'from-blue-500 to-cyan-500',
  'from-emerald-500 to-teal-500',
  'from-rose-500 to-pink-500',
  'from-amber-500 to-orange-500',
]

function avatarGradient(email) {
  let hash = 0
  for (const c of (email ?? '')) hash = (hash * 31 + c.charCodeAt(0)) & 0xffffffff
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length]
}

// ─── No SMTP / No IMAP banners ────────────────────────────────────────────────

function SetupBanner({ hasSmtp }) {
  return (
    <div className="flex-1 flex items-center justify-center p-8">
      <div className="max-w-sm text-center">
        <div className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center"
          style={{ background: 'linear-gradient(135deg,#7C3AED22,#4F46E522)', border: '1px solid rgba(124,58,237,0.15)' }}>
          <AlertCircle size={28} className="text-violet-500" />
        </div>
        <h3 className="text-[15px] font-semibold text-slate-800 mb-1.5">
          {hasSmtp ? 'IMAP not configured' : 'No email account connected'}
        </h3>
        <p className="text-[12.5px] text-slate-500 leading-relaxed mb-5">
          {hasSmtp
            ? 'Your active SMTP account doesn\'t have IMAP settings yet. Edit it in Settings → SMTP and add the IMAP host, port, and encryption.'
            : 'Connect an email account to fetch and read your inbox. Go to Settings → SMTP and add an account with IMAP enabled.'
          }
        </p>
        <button
          onClick={() => router.visit('/profile')}
          className="inline-flex items-center gap-2 h-9 px-5 text-[13px] font-semibold text-white rounded-xl transition-all hover:opacity-90"
          style={{ background: 'linear-gradient(135deg,#7C3AED,#4F46E5)' }}>
          <Settings size={14} /> Go to Settings
        </button>
      </div>
    </div>
  )
}

// ─── Folder sidebar ───────────────────────────────────────────────────────────

const FOLDERS = [
  { key: 'inbox',   label: 'Inbox',   icon: Inbox,  countKey: 'inbox'   },
  { key: 'sent',    label: 'Sent',    icon: Send,   countKey: 'sent'    },
  { key: 'starred', label: 'Starred', icon: Star,   countKey: 'starred' },
  { key: 'trash',   label: 'Trash',   icon: Trash2, countKey: 'trash'   },
]

function FolderPanel({ folder, counts, credential, syncing, onSync, onFolderChange, onCompose }) {
  return (
    <div className="hidden lg:flex w-[188px] shrink-0 flex-col border-r border-slate-100"
      style={{ background: '#F7F6FB' }}>

      {/* Compose button */}
      <div className="px-3 pt-3 pb-1">
        <button
          onClick={onCompose}
          className="w-full flex items-center justify-center gap-2 h-9 rounded-xl text-[12.5px] font-semibold text-white transition-all hover:opacity-90"
          style={{ background: 'linear-gradient(135deg,#7C3AED,#4F46E5)', boxShadow: '0 3px 10px rgba(124,58,237,0.25)' }}
        >
          <PenLine size={13} /> Compose
        </button>
      </div>

      {/* Account chip */}
      <div className="px-3 pt-3 pb-3">
        {credential ? (
          <div className="flex items-center gap-2 px-2 py-2 rounded-xl bg-white border border-slate-100 shadow-sm">
            <div className={cn('w-7 h-7 rounded-lg flex items-center justify-center shrink-0 text-[11px] font-bold text-white bg-gradient-to-br', avatarGradient(credential.from_email))}>
              {avatarLetter('', credential.from_email)}
            </div>
            <div className="min-w-0">
              <p className="text-[11.5px] font-semibold text-slate-700 truncate">{credential.name}</p>
              <p className="text-[10px] text-slate-400 truncate">{credential.from_email}</p>
            </div>
          </div>
        ) : (
          <div className="px-2 py-2 rounded-xl bg-white border border-dashed border-slate-200 text-center">
            <p className="text-[11px] text-slate-400">No account</p>
          </div>
        )}
      </div>

      {/* Folder list */}
      <nav className="flex-1 px-2 space-y-0.5">
        {FOLDERS.map(({ key, label, icon: Icon, countKey }) => {
          const count = counts?.[countKey] ?? 0
          const active = folder === key
          return (
            <button key={key}
              onClick={() => onFolderChange(key)}
              className={cn(
                'w-full flex items-center gap-2.5 px-3 py-[8px] rounded-xl text-left transition-all text-[13px] font-medium',
                active
                  ? 'bg-white shadow-sm text-slate-800 border border-slate-100'
                  : 'text-slate-500 hover:bg-white/70 hover:text-slate-700'
              )}
            >
              <Icon size={14} strokeWidth={active ? 2.2 : 1.8}
                className={active ? 'text-violet-600' : 'text-slate-400'} />
              <span className="flex-1">{label}</span>
              {count > 0 && (
                <span className={cn(
                  'text-[10.5px] font-bold rounded-full px-1.5 py-0.5 min-w-[18px] text-center leading-none',
                  key === 'inbox' && counts.unread > 0
                    ? 'bg-violet-600 text-white'
                    : 'bg-slate-200 text-slate-600'
                )}>
                  {key === 'inbox' && counts.unread > 0 ? counts.unread : count}
                </span>
              )}
            </button>
          )
        })}
      </nav>

      {/* Sync button */}
      <div className="p-3 border-t border-slate-100">
        <button
          onClick={onSync}
          disabled={syncing || !credential}
          className={cn(
            'w-full flex items-center justify-center gap-2 h-8 rounded-xl text-[12px] font-semibold transition-all',
            syncing || !credential
              ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
              : 'bg-white border border-slate-200 text-slate-600 hover:border-violet-300 hover:text-violet-600 hover:bg-violet-50/50'
          )}
        >
          <RefreshCw size={12} className={syncing ? 'animate-spin' : ''} />
          {syncing ? 'Syncing…' : 'Sync inbox'}
        </button>
        {credential?.last_fetched_at && (
          <p className="text-[10px] text-slate-400 text-center mt-1.5">
            {formatDistanceToNow(new Date(credential.last_fetched_at), { addSuffix: true })}
          </p>
        )}
      </div>
    </div>
  )
}

// Condensed folder switcher + actions for narrow screens, replacing the vertical sidebar.
function MobileTopBar({ folder, counts, syncing, onSync, onFolderChange, onCompose }) {
  return (
    <div className="lg:hidden shrink-0 border-b border-slate-100 bg-white">
      <div className="flex items-center gap-2 px-3 py-2">
        <button
          onClick={onCompose}
          className="shrink-0 h-8 w-8 rounded-xl flex items-center justify-center text-white"
          style={{ background: 'linear-gradient(135deg,#7C3AED,#4F46E5)' }}
          aria-label="Compose"
        >
          <PenLine size={14} />
        </button>

        <div className="flex-1 flex items-center gap-1.5 overflow-x-auto scrollbar-none">
          {FOLDERS.map(({ key, label, icon: Icon, countKey }) => {
            const count = counts?.[countKey] ?? 0
            const active = folder === key
            return (
              <button key={key}
                onClick={() => onFolderChange(key)}
                className={cn(
                  'shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-medium transition-all whitespace-nowrap',
                  active ? 'bg-violet-600 text-white' : 'bg-slate-100 text-slate-500'
                )}
              >
                <Icon size={12} className={active ? 'text-white' : 'text-slate-400'} />
                {label}
                {count > 0 && (
                  <span className={cn(
                    'text-[10px] font-bold rounded-full px-1.5 leading-tight',
                    active ? 'bg-white/25 text-white' : 'bg-slate-200 text-slate-600'
                  )}>
                    {key === 'inbox' && counts.unread > 0 ? counts.unread : count}
                  </span>
                )}
              </button>
            )
          })}
        </div>

        <button
          onClick={onSync}
          disabled={syncing}
          className="shrink-0 h-8 w-8 rounded-xl flex items-center justify-center border border-slate-200 text-slate-500 disabled:opacity-50"
          aria-label="Sync inbox"
        >
          <RefreshCw size={13} className={syncing ? 'animate-spin' : ''} />
        </button>
      </div>
    </div>
  )
}

// ─── Email list ───────────────────────────────────────────────────────────────

const EmailListItem = memo(function EmailListItem({ email, active, onSelect }) {
  // In the Sent folder the meaningful party is the recipient, not the sender (you).
  const isSent    = email.folder === 'sent'
  const partyName = isSent ? (email.to?.name || email.to?.email || '') : email.from_name
  const partyMail = isSent ? (email.to?.email || '') : email.from_email
  const letter    = avatarLetter(partyName, partyMail)
  const gradient  = avatarGradient(partyMail)

  return (
    <button
      onClick={() => onSelect(email)}
      className={cn(
        'w-full text-left px-3 py-3 border-b border-slate-100 transition-all relative group',
        active
          ? 'bg-violet-50 border-l-2 border-l-violet-500'
          : 'hover:bg-slate-50/80',
        !email.is_read && !active && 'bg-white'
      )}
    >
      <div className="flex items-start gap-2.5">
        {/* Avatar */}
        <div className={cn(
          'w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-[12px] font-bold text-white bg-gradient-to-br mt-0.5',
          gradient
        )}>
          {letter}
        </div>

        <div className="flex-1 min-w-0">
          {/* Row 1: sender + time */}
          <div className="flex items-center gap-1 justify-between mb-0.5">
            <span className={cn(
              'text-[12.5px] truncate',
              email.is_read ? 'font-medium text-slate-600' : 'font-bold text-slate-900'
            )}>
              {isSent && <span className="text-slate-400 font-normal">To: </span>}
              {partyName || partyMail}
            </span>
            <span className="text-[10.5px] text-slate-400 shrink-0 ml-1">{formatEmailDate(email.sent_at)}</span>
          </div>

          {/* Row 2: subject */}
          <p className={cn(
            'text-[12px] truncate mb-0.5',
            email.is_read ? 'text-slate-500' : 'text-slate-700 font-semibold'
          )}>
            {email.subject || '(No subject)'}
          </p>

          {/* Row 3: snippet */}
          <p className="text-[11px] text-slate-400 truncate leading-relaxed">
            {email.snippet || 'No preview available'}
          </p>
        </div>
      </div>

      {/* Unread dot */}
      {!email.is_read && (
        <div className="absolute left-1 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-violet-600" />
      )}

      {/* Star indicator */}
      {email.is_starred && (
        <Star size={10} className="absolute right-2.5 bottom-2.5 text-amber-400 fill-amber-400" />
      )}
    </button>
  )
})

function EmailListSkeleton() {
  return (
    <div className="flex-1 overflow-y-auto animate-pulse">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="flex items-start gap-2.5 px-3 py-3 border-b border-slate-100">
          <div className="w-8 h-8 rounded-full bg-slate-200 shrink-0 mt-0.5" />
          <div className="flex-1 space-y-2 pt-0.5">
            <div className="flex justify-between">
              <div className="h-3 bg-slate-200 rounded w-28" />
              <div className="h-2.5 bg-slate-100 rounded w-10" />
            </div>
            <div className="h-2.5 bg-slate-200 rounded w-40" />
            <div className="h-2.5 bg-slate-100 rounded w-52" />
          </div>
        </div>
      ))}
    </div>
  )
}

function EmailList({ emails, selectedId, onSelect, folder, syncing }) {
  const items = emails?.data ?? []

  if (items.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-center p-6">
        <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-3"
          style={{ background: 'rgba(124,58,237,0.07)' }}>
          {folder === 'starred' ? <Star size={22} className="text-violet-400" />
            : folder === 'trash' ? <Trash2 size={22} className="text-violet-400" />
            : folder === 'sent' ? <Send size={22} className="text-violet-400" />
            : <Inbox size={22} className="text-violet-400" />}
        </div>
        <p className="text-[13px] font-medium text-slate-600 mb-1">
          {folder === 'starred' ? 'No starred emails'
            : folder === 'trash' ? 'Trash is empty'
            : folder === 'sent' ? 'No sent emails yet'
            : 'Inbox is empty'}
        </p>
        <p className="text-[11.5px] text-slate-400">
          {folder === 'inbox' ? 'Click "Sync inbox" to fetch emails' : ''}
        </p>
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-y-auto">
      {items.map(email => (
        <EmailListItem
          key={email.id}
          email={email}
          active={selectedId === email.id}
          onSelect={onSelect}
        />
      ))}
      {/* Pagination hint */}
      {emails?.last_page > 1 && (
        <div className="px-4 py-3 flex items-center justify-between border-t border-slate-100">
          <button
            disabled={emails.current_page <= 1}
            onClick={() => router.get('/inbox', { folder, page: emails.current_page - 1 }, { preserveState: true })}
            className="text-[11.5px] text-slate-500 hover:text-violet-600 disabled:opacity-30 disabled:cursor-not-allowed">
            ← Prev
          </button>
          <span className="text-[11px] text-slate-400">{emails.current_page} / {emails.last_page}</span>
          <button
            disabled={emails.current_page >= emails.last_page}
            onClick={() => router.get('/inbox', { folder, page: emails.current_page + 1 }, { preserveState: true })}
            className="text-[11.5px] text-slate-500 hover:text-violet-600 disabled:opacity-30 disabled:cursor-not-allowed">
            Next →
          </button>
        </div>
      )}
    </div>
  )
}

// ─── Reading pane ──────────────────────────────────────────────────────────────

function ReadingPane({ email, bodyLoading, onClose, onStar, onTrash, onRestore, onDelete, folder }) {
  // Rewrite all links to open in new tab — iframe sandbox blocks navigation otherwise
  const safeBodyHtml = useMemo(() => {
    if (!email?.body_html) return ''
    return email.body_html.replace(/<a(\s)/gi, '<a target="_blank" rel="noopener noreferrer"$1')
  }, [email?.body_html])

  if (!email) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-center text-slate-400 select-none">
        <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-3"
          style={{ background: 'rgba(124,58,237,0.06)', border: '1px solid rgba(124,58,237,0.1)' }}>
          <MailOpen size={26} className="text-violet-300" />
        </div>
        <p className="text-[13px] font-medium text-slate-500">Select an email to read</p>
        <p className="text-[11.5px] text-slate-400 mt-1">Your emails will appear here</p>
      </div>
    )
  }

  const sentDate = email.sent_at ? format(new Date(email.sent_at), "EEEE, MMMM d, yyyy 'at' h:mm a") : ''
  const toList   = email.to_addresses ?? []

  return (
    <div className="flex-1 flex flex-col min-h-0">
      {/* Toolbar */}
      <div className="flex items-center gap-1.5 px-3 sm:px-5 py-3 border-b border-slate-100 shrink-0 overflow-x-auto">
        <button onClick={onClose}
          className="h-7 px-2.5 rounded-lg text-[11.5px] text-slate-500 hover:bg-slate-100 transition-colors shrink-0">
          ← Back
        </button>
        <div className="flex-1" />

        <button onClick={() => onStar(email)}
          title={email.is_starred ? 'Unstar' : 'Star'}
          className="h-7 w-7 rounded-lg flex items-center justify-center hover:bg-amber-50 transition-colors group">
          <Star size={14} className={email.is_starred ? 'text-amber-400 fill-amber-400' : 'text-slate-400 group-hover:text-amber-400'} />
        </button>

        {folder === 'trash' ? (
          <>
            <button onClick={() => onRestore(email)}
              className="h-7 px-2.5 rounded-lg text-[11.5px] text-emerald-600 hover:bg-emerald-50 flex items-center gap-1 transition-colors">
              <RotateCcw size={12} /> Restore
            </button>
            <button onClick={() => onDelete(email)}
              className="h-7 px-2.5 rounded-lg text-[11.5px] text-red-500 hover:bg-red-50 flex items-center gap-1 transition-colors">
              <Trash size={12} /> Delete forever
            </button>
          </>
        ) : (
          <button onClick={() => onTrash(email)}
            className="h-7 px-2.5 rounded-lg text-[11.5px] text-slate-500 hover:bg-red-50 hover:text-red-500 flex items-center gap-1 transition-colors">
            <Trash2 size={12} /> Trash
          </button>
        )}
      </div>

      {/* Email header */}
      <div className="px-4 sm:px-6 pt-5 pb-4 border-b border-slate-100 shrink-0">
        <h2 className="text-[16px] sm:text-[17px] font-semibold text-slate-900 leading-snug mb-3">
          {email.subject || '(No subject)'}
        </h2>
        <div className="flex items-start gap-3">
          <div className={cn('w-9 h-9 rounded-full flex items-center justify-center shrink-0 text-[13px] font-bold text-white bg-gradient-to-br mt-0.5', avatarGradient(email.from_email))}>
            {avatarLetter(email.from_name, email.from_email)}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[13px] font-semibold text-slate-800">
                {email.from_name || email.from_email}
              </span>
              {email.from_name && (
                <span className="text-[12px] text-slate-400">&lt;{email.from_email}&gt;</span>
              )}
            </div>
            {toList.length > 0 && (
              <p className="text-[11.5px] text-slate-400 mt-0.5">
                To: {toList.map(t => t.name ? `${t.name} <${t.email}>` : t.email).join(', ')}
              </p>
            )}
            <div className="flex items-center gap-1.5 mt-0.5">
              <Clock size={10} className="text-slate-300" />
              <span className="text-[11px] text-slate-400">{sentDate}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Email body */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-5">
        {bodyLoading && !email.body_html && !email.body_text ? (
          <div className="space-y-2.5 animate-pulse">
            {[3, 4, 2, 5, 3, 2, 4].map((w, i) => (
              <div key={i} className={`h-3 bg-slate-200 rounded`} style={{ width: `${w * 13}%` }} />
            ))}
          </div>
        ) : safeBodyHtml ? (
          <iframe
            srcDoc={safeBodyHtml}
            title="Email body"
            sandbox="allow-same-origin allow-popups allow-popups-to-escape-sandbox"
            className="w-full border-0 rounded-xl"
            style={{ minHeight: 400 }}
            onLoad={e => {
              const doc = e.target.contentDocument
              if (doc) {
                e.target.style.height = (doc.body.scrollHeight + 32) + 'px'
              }
            }}
          />
        ) : email.body_text ? (
          <pre className="text-[13px] text-slate-700 whitespace-pre-wrap font-sans leading-relaxed">
            {email.body_text}
          </pre>
        ) : (
          <p className="text-[13px] text-slate-400 italic">No content</p>
        )}
      </div>
    </div>
  )
}

// ─── Compose dialog ───────────────────────────────────────────────────────────

function ComposeDialog({ open, onClose, activeTemplate }) {
  const [toEmail, setToEmail]   = useState('')
  const [subject, setSubject]   = useState('')
  const [body, setBody]         = useState('')
  const [sending, setSending]   = useState(false)

  const reset = () => { setToEmail(''); setSubject(''); setBody(''); setSending(false) }

  const handleClose = () => { reset(); onClose() }

  const handleSend = async () => {
    if (!toEmail.trim() || !subject.trim() || !body.trim()) {
      toast.error('Please fill in To, Subject, and Body.')
      return
    }
    setSending(true)
    try {
      const res = await fetch('/inbox/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.content ?? '',
        },
        body: JSON.stringify({ to_email: toEmail.trim(), subject: subject.trim(), body_html: body }),
      })
      const json = await res.json()
      if (json.ok) {
        toast.success('Email sent!')
        handleClose()
      } else {
        toast.error(json.error || 'Failed to send email.')
      }
    } catch {
      toast.error('Send failed — check your connection.')
    } finally {
      setSending(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={v => !v && handleClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-[14px] font-semibold flex items-center gap-2">
            <PenLine size={14} className="text-violet-600" /> New Message
          </DialogTitle>
        </DialogHeader>

        {activeTemplate && (
          <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11.5px] text-violet-700 font-medium"
            style={{ background: 'rgba(124,58,237,0.07)', border: '1px solid rgba(124,58,237,0.12)' }}>
            <span>Template:</span>
            <span className="font-semibold">{activeTemplate.name}</span>
            <span className="text-violet-400 ml-0.5">will wrap this email</span>
          </div>
        )}

        <div className="space-y-3">
          <div className="space-y-1">
            <Label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">To</Label>
            <Input
              type="email"
              value={toEmail}
              onChange={e => setToEmail(e.target.value)}
              placeholder="recipient@example.com"
              className="h-8 text-[13px]"
              autoFocus
            />
          </div>
          <div className="space-y-1">
            <Label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Subject</Label>
            <Input
              value={subject}
              onChange={e => setSubject(e.target.value)}
              placeholder="Subject…"
              className="h-8 text-[13px]"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Message</Label>
            <textarea
              value={body}
              onChange={e => setBody(e.target.value)}
              placeholder="Write your message…"
              rows={8}
              className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-[13px] text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400 resize-none"
            />
          </div>
        </div>

        <DialogFooter className="gap-2">
          <button
            type="button"
            onClick={handleClose}
            className="h-8 px-4 text-[12.5px] font-medium text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={sending}
            onClick={handleSend}
            className="h-8 px-5 text-[12.5px] font-semibold text-white rounded-lg transition-all hover:opacity-90 disabled:opacity-50 flex items-center gap-1.5"
            style={{ background: 'linear-gradient(135deg,#7C3AED,#4F46E5)' }}
          >
            {sending ? 'Sending…' : 'Send Email'}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const csrf = () => document.querySelector('meta[name=csrf-token]')?.content

// ─── Main page ─────────────────────────────────────────────────────────────────

export default function InboxIndex({ emails: initialEmails, folder, counts: initialCounts, hasSmtp, hasImap, credential: initialCredential, activeTemplate }) {
  // Local state — updated optimistically; reset when Inertia navigates
  const [emails, setEmails]           = useState(initialEmails)
  const [counts, setCounts]           = useState(initialCounts)
  const [credential, setCredential]   = useState(initialCredential)
  const [selected, setSelected]       = useState(null) // full or partial email shown in pane
  const [bodyLoading, setBodyLoading] = useState(false)
  const [syncing, setSyncing]         = useState(false)
  const [composeOpen, setComposeOpen] = useState(false)
  const bodyCache = useRef(new Map())
  const pollRef   = useRef(null)

  useEffect(() => () => { if (pollRef.current) clearInterval(pollRef.current) }, [])

  // Sync Inertia prop updates → local state whenever server refreshes props
  useEffect(() => {
    setEmails(initialEmails)
    setCounts(initialCounts)
    setCredential(initialCredential)
    setSelected(null)
  }, [initialEmails, initialCounts, initialCredential])

  // ── Helpers ────────────────────────────────────────────────────────────────

  const updateInList = useCallback((id, patch) => {
    setEmails(prev => ({ ...prev, data: prev.data.map(e => e.id === id ? { ...e, ...patch } : e) }))
    setSelected(prev => prev?.id === id ? { ...prev, ...patch } : prev)
    if (bodyCache.current.has(id)) {
      bodyCache.current.set(id, { ...bodyCache.current.get(id), ...patch })
    }
  }, [])

  const removeFromList = useCallback((id) => {
    setEmails(prev => ({ ...prev, data: prev.data.filter(e => e.id !== id) }))
    setSelected(prev => prev?.id === id ? null : prev)
    bodyCache.current.delete(id)
  }, [])

  // ── Handlers ───────────────────────────────────────────────────────────────

  const handleFolderChange = useCallback((f) => {
    router.get('/inbox', { folder: f }, { preserveState: false })
  }, [])

  const handleSelect = useCallback((email) => {
    // Show header/meta immediately — no waiting
    setSelected(email)

    // Mark as read optimistically
    if (!email.is_read) {
      updateInList(email.id, { is_read: true })
      setCounts(prev => ({ ...prev, unread: Math.max(0, (prev.unread ?? 0) - 1) }))
    }

    // Cache hit — body available instantly
    if (bodyCache.current.has(email.id)) {
      setSelected(bodyCache.current.get(email.id))
      return
    }

    // Fetch body in background while header is already visible
    setBodyLoading(true)
    fetch(`/inbox/${email.id}`, { headers: { Accept: 'application/json', 'X-CSRF-TOKEN': csrf() } })
      .then(r => r.json())
      .then(data => {
        const full = { ...email, ...data, is_read: true }
        bodyCache.current.set(email.id, full)
        setSelected(curr => curr?.id === email.id ? full : curr)
      })
      .catch(() => {})
      .finally(() => setBodyLoading(false))
  }, [updateInList])

  const handleStar = useCallback((email) => {
    const next = !email.is_starred
    updateInList(email.id, { is_starred: next })
    if (folder === 'starred' && !next) removeFromList(email.id)
    toast.success(next ? 'Starred' : 'Unstarred', { duration: 3000 })
    fetch(`/inbox/${email.id}/starred`, { method: 'PATCH', headers: { Accept: 'application/json', 'X-CSRF-TOKEN': csrf() } })
      .catch(() => updateInList(email.id, { is_starred: !next }))
  }, [folder, updateInList, removeFromList])

  const handleTrash = useCallback((email) => {
    removeFromList(email.id)
    setCounts(prev => ({ ...prev, inbox: Math.max(0, (prev.inbox ?? 0) - 1), trash: (prev.trash ?? 0) + 1 }))
    toast.success('Moved to trash', { duration: 3000 })
    fetch(`/inbox/${email.id}/trash`, { method: 'PATCH', headers: { Accept: 'application/json', 'X-CSRF-TOKEN': csrf() } })
      .catch(() => {})
  }, [removeFromList])

  const handleRestore = useCallback((email) => {
    removeFromList(email.id)
    setCounts(prev => ({ ...prev, inbox: (prev.inbox ?? 0) + 1, trash: Math.max(0, (prev.trash ?? 0) - 1) }))
    toast.success('Restored to inbox', { duration: 3000 })
    fetch(`/inbox/${email.id}/restore`, { method: 'PATCH', headers: { Accept: 'application/json', 'X-CSRF-TOKEN': csrf() } })
      .catch(() => {})
  }, [removeFromList])

  const handleDelete = useCallback((email) => {
    removeFromList(email.id)
    setCounts(prev => ({ ...prev, trash: Math.max(0, (prev.trash ?? 0) - 1) }))
    toast.success('Email permanently deleted', { duration: 3000 })
    fetch(`/inbox/${email.id}`, { method: 'DELETE', headers: { Accept: 'application/json', 'X-CSRF-TOKEN': csrf() } })
      .catch(() => {})
  }, [removeFromList])

  const handleSync = useCallback(async () => {
    if (syncing) return
    setSyncing(true)
    if (pollRef.current) clearInterval(pollRef.current)

    const prevFetchedAt   = credential?.last_fetched_at
    const prevInboxCount  = counts?.inbox ?? 0
    const syncToastId     = toast.loading('Syncing inbox…')

    const finish = (clear) => {
      clearInterval(pollRef.current)
      pollRef.current = null
      setSyncing(false)
      toast.dismiss(syncToastId)
      clear()
    }

    try {
      const res  = await fetch('/inbox/sync', { method: 'POST', headers: { Accept: 'application/json', 'X-CSRF-TOKEN': csrf() } })
      const json = await res.json()

      if (!json.ok) {
        finish(() => toast.error(json.error, { duration: 5000 }))
        return
      }

      // Poll every 5 s — max 24 attempts (2 min)
      let attempts = 0
      pollRef.current = setInterval(async () => {
        attempts++
        try {
          const sr     = await fetch('/inbox/sync-status', { headers: { Accept: 'application/json', 'X-CSRF-TOKEN': csrf() } })
          const status = await sr.json()
          const done   = status.last_fetched_at && status.last_fetched_at !== prevFetchedAt

          if (!done && attempts < 24) return

          const newCount  = status.inbox_count ?? 0
          const newEmails = newCount - prevInboxCount

          if (done && newEmails > 0) {
            // New emails arrived — reload to show them
            finish(() =>
              router.reload({
                only: ['emails', 'counts', 'credential'],
                preserveScroll: true,
                onSuccess: () =>
                  toast.success(
                    `${newEmails} new email${newEmails !== 1 ? 's' : ''} received!`,
                    { duration: 5000 }
                  ),
              })
            )
          } else if (done) {
            // Sync ran but no new emails
            finish(() => toast.success('Inbox is up to date', { duration: 4000 }))
          } else {
            // Timed out
            finish(() => toast.info('Sync is still running — check back in a moment.', { duration: 5000 }))
          }
        } catch {
          finish(() => toast.error('Sync check failed — try again.', { duration: 4000 }))
        }
      }, 5000)
    } catch {
      finish(() => toast.error('Sync failed — check your connection.', { duration: 5000 }))
    }
  }, [syncing, credential?.last_fetched_at, counts?.inbox])

  const notReady = !hasSmtp || !hasImap

  return (
    <>
      <Head title="Inbox" />
      <AppLayout title="Inbox" noPadding>
        <div className="flex flex-col flex-1 overflow-hidden lg:flex-row">

          <FolderPanel
            folder={folder}
            counts={counts}
            credential={credential}
            syncing={syncing}
            onSync={handleSync}
            onFolderChange={handleFolderChange}
            onCompose={() => setComposeOpen(true)}
          />

          <MobileTopBar
            folder={folder}
            counts={counts}
            syncing={syncing}
            onSync={handleSync}
            onFolderChange={handleFolderChange}
            onCompose={() => setComposeOpen(true)}
          />

          {/* Email list — full width on mobile, hidden once an email is open */}
          <div className={cn(
            'w-full lg:w-[300px] shrink-0 flex-col border-r border-slate-100 bg-white',
            selected ? 'hidden lg:flex' : 'flex'
          )}>
            <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between shrink-0">
              <h3 className="text-[13px] font-semibold text-slate-800 capitalize">{folder}</h3>
              <div className="flex items-center gap-2">
                {syncing && (
                  <span className="flex items-center gap-1 text-[10.5px] text-violet-500 font-medium">
                    <RefreshCw size={10} className="animate-spin" />
                    Syncing…
                  </span>
                )}
                {!syncing && counts?.[folder] > 0 && (
                  <span className="text-[11px] text-slate-400">{counts[folder]} messages</span>
                )}
              </div>
            </div>
            {notReady ? (
              <SetupBanner hasSmtp={hasSmtp} />
            ) : (
              <EmailList
                emails={emails}
                selectedId={selected?.id}
                onSelect={handleSelect}
                folder={folder}
                syncing={syncing}
              />
            )}
          </div>

          {/* Reading pane — full width on mobile, shown only once an email is selected */}
          <div className={cn(
            'flex-1 flex-col bg-white min-w-0',
            selected ? 'flex' : 'hidden lg:flex'
          )}>
            {notReady ? (
              <div className="flex-1 flex items-center justify-center">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center"
                  style={{ background: 'rgba(124,58,237,0.06)' }}>
                  <Mail size={28} className="text-violet-300" />
                </div>
              </div>
            ) : (
              <ReadingPane
                email={selected}
                bodyLoading={bodyLoading}
                folder={folder}
                onClose={() => setSelected(null)}
                onStar={handleStar}
                onTrash={handleTrash}
                onRestore={handleRestore}
                onDelete={handleDelete}
              />
            )}
          </div>

        </div>
      </AppLayout>

      <ComposeDialog
        open={composeOpen}
        onClose={() => setComposeOpen(false)}
        activeTemplate={activeTemplate}
      />
    </>
  )
}
