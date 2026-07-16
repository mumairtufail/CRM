import React, { useState } from 'react'
import { Head, Link, router } from '@inertiajs/react'
import AppLayout from '@/Components/Layout/AppLayout'
import { Button } from '@/Components/ui/button'
import { Input } from '@/Components/ui/input'
import {
  Phone, PhoneCall, PhoneForwarded, MessageSquare,
  Clock, Volume2, RefreshCw, AlertCircle, Play, Pause,
  Calendar, Search, ChevronRight, User
} from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

export default function TwilioIndex({ calls, messages, twilioSetting, quickLeads }) {
  const [activeTab, setActiveTab] = useState('calls')
  const [syncing, setSyncing] = useState(false)
  const [callSearch, setCallSearch] = useState('')
  const [msgSearch, setMsgSearch] = useState('')
  const [selectedQuickLead, setSelectedQuickLead] = useState('')

  const [playingVoicemail, setPlayingVoicemail] = useState(null)
  const audioRef = React.useRef(null)

  const handleManualSync = async () => {
    setSyncing(true)
    try {
      const res = await fetch(route('twilio.sync'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': document.head.querySelector('meta[name="csrf-token"]')?.content ?? '',
          Accept: 'application/json',
        }
      })
      const data = await res.json()
      if (res.ok) {
        toast.success(data.message ?? 'Sync complete.')
        router.reload()
      } else {
        toast.error(data.error ?? 'Sync failed.')
      }
    } catch {
      toast.error('Network error during sync.')
    } finally {
      setSyncing(false)
    }
  }

  const triggerCall = (phone) => {
    if (!phone) return
    window.dispatchEvent(new CustomEvent('twilio-dial', { detail: { phoneNumber: phone } }))
    toast.info(`Pre-filled dialer with ${phone}`)
  }

  const playVoicemail = (call) => {
    if (!call.recording_url) return

    if (playingVoicemail === call.id) {
      audioRef.current.pause()
      setPlayingVoicemail(null)
    } else {
      if (audioRef.current) {
        audioRef.current.pause()
      }
      const audio = new Audio(call.recording_url)
      audio.play()
      audio.onended = () => setPlayingVoicemail(null)
      audioRef.current = audio
      setPlayingVoicemail(call.id)
    }
  }

  const formatDuration = (secs) => {
    if (!secs) return '0s'
    const mins = Math.floor(secs / 60)
    const remaining = secs % 60
    return mins > 0 ? `${mins}m ${remaining}s` : `${remaining}s`
  }

  // Filter lists based on search
  const filteredCalls = (calls.data ?? []).filter(call => {
    if (!callSearch) return true
    return call.from_number.includes(callSearch) || call.to_number.includes(callSearch)
  })

  const filteredMessages = (messages.data ?? []).filter(msg => {
    if (!msgSearch) return true
    return msg.from_number.includes(msgSearch) || msg.to_number.includes(msgSearch) || msg.body.toLowerCase().includes(msgSearch.toLowerCase())
  })

  // Glassmorphic cards styling
  const glassCard = {
    background: 'rgba(255, 255, 255, 0.9)',
    backdropFilter: 'blur(12px)',
    border: '1px solid rgba(255, 255, 255, 0.95)',
    boxShadow: '0 4px 20px rgba(0,0,0,0.02)'
  }

  return (
    <>
      <Head title="Twilio Dialer & logs" />
      <AppLayout title="Twilio Communications">
        {/* Header Section */}
        <div className="px-4 sm:px-6 pt-4 pb-5 border-b border-slate-100 bg-white flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-[20px] font-bold text-slate-800 tracking-tight">Twilio Hub</h1>
            <p className="text-[13px] text-slate-500 mt-0.5">Place calls, send messages, and review voicemail logs</p>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={handleManualSync}
              disabled={syncing || !twilioSetting}
              variant="outline"
              size="sm"
              className="h-9 gap-1.5 text-xs text-slate-600 border-slate-200"
            >
              <RefreshCw size={13} className={cn(syncing && 'animate-spin')} />
              {syncing ? 'Syncing...' : 'Sync Logs'}
            </Button>
            <Link href="/profile?tab=twilio">
              <Button size="sm" className="h-9 text-xs gap-1.5 bg-brand-600 hover:bg-brand-700">
                Configure Twilio Settings
              </Button>
            </Link>
          </div>
        </div>

        {!twilioSetting ? (
          <div className="p-10 text-center max-w-lg mx-auto mt-10" style={glassCard}>
            <AlertCircle size={40} className="text-amber-500 mx-auto mb-3" />
            <h3 className="text-[16px] font-bold text-slate-800">Twilio is not configured</h3>
            <p className="text-[13px] text-slate-500 mt-1 mb-5">
              Configure your Account SID and phone number in settings to start calling and messaging.
            </p>
            <Link href="/profile?tab=twilio">
              <Button size="sm" className="bg-brand-600 hover:bg-brand-700 text-xs">Configure Settings</Button>
            </Link>
          </div>
        ) : (
          <div className="p-4 sm:p-6 space-y-6 bg-slate-50 min-h-0 flex-1 overflow-y-auto">
            {/* Quick dial dropdown card */}
            <div className="rounded-2xl p-4 flex flex-col sm:flex-row gap-3 items-center" style={glassCard}>
              <span className="text-[12.5px] font-semibold text-slate-500 shrink-0">Quick Dial Lead:</span>
              <select
                value={selectedQuickLead}
                onChange={e => {
                  setSelectedQuickLead(e.target.value)
                  triggerCall(e.target.value)
                }}
                className="w-full sm:w-64 rounded-xl border border-slate-200 text-xs py-1.5 focus:border-brand-500 focus:ring-0 text-slate-700"
              >
                <option value="">Select Lead with Phone...</option>
                {quickLeads.map(lead => (
                  <option key={lead.id} value={lead.phone}>
                    {lead.name} ({lead.phone})
                  </option>
                ))}
              </select>
            </div>

            {/* Main Comm Tabs */}
            <div className="rounded-2xl overflow-hidden" style={glassCard}>
              {/* Tab Selector */}
              <div className="flex border-b border-slate-100 bg-slate-50/50">
                <button
                  onClick={() => setActiveTab('calls')}
                  className={cn(
                    'px-5 py-3 text-xs font-bold uppercase tracking-wider transition-all border-b-2',
                    activeTab === 'calls' ? 'border-brand-600 text-brand-600 bg-white' : 'border-transparent text-slate-400 hover:text-slate-600'
                  )}
                >
                  Call Logs
                </button>
                <button
                  onClick={() => setActiveTab('sms')}
                  className={cn(
                    'px-5 py-3 text-xs font-bold uppercase tracking-wider transition-all border-b-2',
                    activeTab === 'sms' ? 'border-brand-600 text-brand-600 bg-white' : 'border-transparent text-slate-400 hover:text-slate-600'
                  )}
                >
                  SMS Inbox
                </button>
                <button
                  onClick={() => setActiveTab('voicemails')}
                  className={cn(
                    'px-5 py-3 text-xs font-bold uppercase tracking-wider transition-all border-b-2',
                    activeTab === 'voicemails' ? 'border-brand-600 text-brand-600 bg-white' : 'border-transparent text-slate-400 hover:text-slate-600'
                  )}
                >
                  Voicemails
                </button>
              </div>

              {/* 1. CALL LOGS */}
              {activeTab === 'calls' && (
                <div className="p-4 space-y-4">
                  <div className="relative w-full max-w-sm">
                    <Search size={14} className="absolute left-3 top-2.5 text-slate-400" />
                    <Input
                      size="sm"
                      placeholder="Search phone number..."
                      value={callSearch}
                      onChange={e => setCallSearch(e.target.value)}
                      className="pl-9 text-xs h-9 rounded-xl"
                    />
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider">
                          <th className="py-2.5 px-3">Direction</th>
                          <th className="py-2.5 px-3">From</th>
                          <th className="py-2.5 px-3">To</th>
                          <th className="py-2.5 px-3">Status</th>
                          <th className="py-2.5 px-3">Duration</th>
                          <th className="py-2.5 px-3">Date / Time</th>
                          <th className="py-2.5 px-3 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50">
                        {filteredCalls.map(call => (
                          <tr key={call.id} className="hover:bg-slate-50/50">
                            <td className="py-3 px-3">
                              <span className={cn(
                                'px-2 py-0.5 rounded-full font-bold uppercase text-[9px] tracking-wider border',
                                call.direction === 'inbound' ? 'bg-blue-50 text-blue-600 border-blue-100' : 'bg-purple-50 text-purple-600 border-purple-100'
                              )}>
                                {call.direction}
                              </span>
                            </td>
                            <td className="py-3 px-3 font-semibold text-slate-700">{call.from_number}</td>
                            <td className="py-3 px-3 font-semibold text-slate-700">{call.to_number}</td>
                            <td className="py-3 px-3">
                              <span className={cn(
                                'px-2 py-0.5 rounded-full text-[10px] font-medium capitalize',
                                call.status === 'completed' && 'bg-emerald-50 text-emerald-700',
                                call.status === 'voicemail' && 'bg-amber-50 text-amber-700',
                                ['failed', 'busy', 'no-answer'].includes(call.status) && 'bg-red-50 text-red-700'
                              )}>
                                {call.status}
                              </span>
                            </td>
                            <td className="py-3 px-3 font-mono text-slate-500">{formatDuration(call.duration)}</td>
                            <td className="py-3 px-3 text-slate-450">
                              {new Date(call.created_at).toLocaleString()}
                            </td>
                            <td className="py-3 px-3 text-right">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => triggerCall(call.direction === 'inbound' ? call.from_number : call.to_number)}
                                className="h-7 text-[10px] rounded-lg border-slate-200"
                              >
                                Call Back
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* 2. SMS LOGS */}
              {activeTab === 'sms' && (
                <div className="p-4 space-y-4">
                  <div className="relative w-full max-w-sm">
                    <Search size={14} className="absolute left-3 top-2.5 text-slate-400" />
                    <Input
                      size="sm"
                      placeholder="Search phone or body..."
                      value={msgSearch}
                      onChange={e => setMsgSearch(e.target.value)}
                      className="pl-9 text-xs h-9 rounded-xl"
                    />
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider">
                          <th className="py-2.5 px-3">Direction</th>
                          <th className="py-2.5 px-3">From</th>
                          <th className="py-2.5 px-3">To</th>
                          <th className="py-2.5 px-3">Body</th>
                          <th className="py-2.5 px-3">Status</th>
                          <th className="py-2.5 px-3">Date</th>
                          <th className="py-2.5 px-3 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50">
                        {filteredMessages.map(msg => (
                          <tr key={msg.id} className="hover:bg-slate-50/50">
                            <td className="py-3 px-3">
                              <span className={cn(
                                'px-2 py-0.5 rounded-full font-bold uppercase text-[9px] tracking-wider border',
                                msg.direction === 'inbound' ? 'bg-blue-50 text-blue-600 border-blue-100' : 'bg-purple-50 text-purple-600 border-purple-100'
                              )}>
                                {msg.direction}
                              </span>
                            </td>
                            <td className="py-3 px-3 font-semibold text-slate-700">{msg.from_number}</td>
                            <td className="py-3 px-3 font-semibold text-slate-700">{msg.to_number}</td>
                            <td className="py-3 px-3 text-slate-600 font-medium max-w-xs truncate">{msg.body}</td>
                            <td className="py-3 px-3">
                              <span className={cn(
                                'px-2 py-0.5 rounded-full text-[10px] font-medium capitalize',
                                ['sent', 'delivered', 'received'].includes(msg.status) ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                              )}>
                                {msg.status}
                              </span>
                            </td>
                            <td className="py-3 px-3 text-slate-450">
                              {new Date(msg.created_at).toLocaleString()}
                            </td>
                            <td className="py-3 px-3 text-right">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => triggerCall(msg.direction === 'inbound' ? msg.from_number : msg.to_number)}
                                className="h-7 text-[10px] rounded-lg border-slate-200"
                              >
                                Call Back
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* 3. VOICEMAILS */}
              {activeTab === 'voicemails' && (
                <div className="p-4 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {filteredCalls.filter(c => c.status === 'voicemail').length === 0 ? (
                      <div className="py-10 text-center col-span-2 text-slate-400">
                        <Volume2 size={24} className="mx-auto mb-2 text-slate-300" />
                        No voicemails recorded.
                      </div>
                    ) : (
                      filteredCalls
                        .filter(c => c.status === 'voicemail')
                        .map(call => (
                          <div
                            key={call.id}
                            className="bg-white border border-slate-100 rounded-xl p-4 flex flex-col justify-between hover:border-brand-200 transition-colors shadow-sm"
                          >
                            <div className="flex justify-between items-start gap-4 mb-3">
                              <div>
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.06em]">Caller</span>
                                <p className="text-[13px] font-bold text-slate-800 mt-0.5">{call.from_number}</p>
                              </div>
                              <span className="text-[10px] text-slate-400">
                                {new Date(call.created_at).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                              </span>
                            </div>

                            <div className="flex items-center gap-3.5 bg-slate-50 px-3 py-2.5 rounded-xl border border-slate-100">
                              <button
                                onClick={() => playVoicemail(call)}
                                className={cn(
                                  'w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-sm transition-all',
                                  playingVoicemail === call.id ? 'bg-amber-500 text-white' : 'bg-brand-600 text-white hover:bg-brand-700'
                                )}
                              >
                                {playingVoicemail === call.id ? <Pause size={12} fill="white" /> : <Play size={12} fill="white" className="ml-0.5" />}
                              </button>
                              <div className="flex-1 min-w-0">
                                <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide">Recording File</p>
                                <p className="text-[11px] text-slate-500 truncate mt-0.5">Duration: {formatDuration(call.duration)}</p>
                              </div>
                            </div>
                          </div>
                        ))
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </AppLayout>
    </>
  )
}
