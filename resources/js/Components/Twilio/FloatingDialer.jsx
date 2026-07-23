import React, { useState, useEffect, useRef } from 'react'
import { usePage, router } from '@inertiajs/react'
import {
  Phone, PhoneCall, PhoneOff, PhoneForwarded, MessageSquare,
  Clock, Volume2, VolumeX, Delete, HelpCircle, X, ChevronUp,
  ChevronDown, Play, Pause, AlertCircle, Info, Sparkles, Send, CheckCircle2
} from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { reportError } from '@/lib/reportError'

export default function FloatingDialer() {
  const { props } = usePage()
  const user = props?.auth?.user
  
  // Only mount if organization has validated Twilio credentials
  const [hasTwilio, setHasTwilio] = useState(() => {
    return !!props?.auth?.twilio_configured
  })
  
  useEffect(() => {
    setHasTwilio(!!props?.auth?.twilio_configured)
  }, [props])

  const [isOpen, setIsOpen] = useState(() => {
    try {
      return sessionStorage.getItem('crm_dialer_open') === 'true'
    } catch {
      return false
    }
  })

  const [activeTab, setActiveTab] = useState(() => {
    try {
      return sessionStorage.getItem('crm_dialer_tab') || 'keypad'
    } catch {
      return 'keypad'
    }
  })

  const [dialNumber, setDialNumber] = useState(() => {
    try {
      return sessionStorage.getItem('crm_dialer_number') || ''
    } catch {
      return ''
    }
  })

  // Call state: 'idle' | 'ringing' | 'connecting' | 'connected' | 'ended'
  const [callState, setCallState] = useState('idle')
  const [callDuration, setCallDuration] = useState(0)
  const [isMuted, setIsMuted] = useState(false)
  const [isSoftphone, setIsSoftphone] = useState(false)
  const [callLogs, setCallLogs] = useState([])
  const [smsLogs, setSmsLogs] = useState([])
  const [activeSmsNumber, setActiveSmsNumber] = useState('')
  const [smsMessage, setSmsMessage] = useState('')
  const [sendingSms, setSendingSms] = useState(false)
  const [playingVoicemail, setPlayingVoicemail] = useState(null) // ID of playing voicemail

  const deviceRef = useRef(null)
  const connectionRef = useRef(null)
  const timerRef = useRef(null)
  const audioRef = useRef(null)

  // Listen to window-level 'twilio-dial' event (for quick click-to-dial on Lead Detail)
  useEffect(() => {
    const handleGlobalDial = (e) => {
      if (e.detail?.phoneNumber) {
        setDialNumber(e.detail.phoneNumber)
        setIsOpen(true)
        setActiveTab('keypad')
        try {
          sessionStorage.setItem('crm_dialer_open', 'true')
          sessionStorage.setItem('crm_dialer_number', e.detail.phoneNumber)
          sessionStorage.setItem('crm_dialer_tab', 'keypad')
        } catch {}
      }
    }
    window.addEventListener('twilio-dial', handleGlobalDial)
    return () => window.removeEventListener('twilio-dial', handleGlobalDial)
  }, [])

  // Save states to sessionStorage to persist on Inertia page loads
  useEffect(() => {
    try {
      sessionStorage.setItem('crm_dialer_open', String(isOpen))
      sessionStorage.setItem('crm_dialer_tab', activeTab)
      sessionStorage.setItem('crm_dialer_number', dialNumber)
    } catch {}
  }, [isOpen, activeTab, dialNumber])

  // Fetch logs
  const fetchLogs = async () => {
    try {
      const res = await fetch('/twilio/logs')
      if (res.ok) {
        const data = await res.json()
        setCallLogs(data.calls ?? [])
        setSmsLogs(data.messages ?? [])
      }
    } catch {}
  }

  useEffect(() => {
    if (isOpen) {
      fetchLogs()
    }
  }, [isOpen])

  // Softphone Twilio Device Setup
  useEffect(() => {
    if (!hasTwilio) return

    // Inject Twilio JS SDK
    if (!window.Twilio) {
      const script = document.createElement('script')
      script.src = 'https://sdk.twilio.com/js/client/releases/1.14.0/twilio.js'
      script.async = true
      script.onload = () => initTwilioDevice()
      document.body.appendChild(script)
    } else {
      initTwilioDevice()
    }

    return () => {
      if (deviceRef.current) {
        deviceRef.current.destroy()
        deviceRef.current = null
      }
    }
  }, [hasTwilio])

  const initTwilioDevice = async () => {
    try {
      const res = await fetch('/twilio/token')
      if (!res.ok) return
      
      const { token } = await res.json()
      if (!token) return

      setIsSoftphone(true)

      // Initialize Twilio Device
      const device = new window.Twilio.Device(token, {
        debug: true,
        codecPreferences: ['opus', 'pcmu'],
      })

      device.on('ready', () => {
        console.log('Twilio Softphone Ready')
      })

      device.on('error', (error) => {
        console.warn('Twilio Device Error:', error)
        reportError({
          message: `Twilio Device error: ${error.message || error.code || 'unknown'}`,
          context: { code: error.code, source: 'FloatingDialer' },
        })
      })

      device.on('tokenWillExpire', async () => {
        try {
          const res = await fetch('/twilio/token')
          if (!res.ok) return
          const { token: freshToken } = await res.json()
          if (freshToken) device.updateToken(freshToken)
        } catch (e) {
          console.warn('Failed to refresh Twilio token:', e)
        }
      })

      device.on('connect', (conn) => {
        connectionRef.current = conn
        setCallState('connected')
        startTimer()
      })

      device.on('disconnect', () => {
        connectionRef.current = null
        endCallState()
      })

      device.on('incoming', (conn) => {
        // Automatically accept or show ringing
        setIsOpen(true)
        setActiveTab('keypad')
        setCallState('ringing')
        connectionRef.current = conn
        toast.info(`Incoming Call: ${conn.parameters.From}`, {
          action: {
            label: 'Answer',
            onClick: () => conn.accept(),
          },
          duration: 15000,
        })
      })

      deviceRef.current = device
    } catch (e) {
      console.error('Failed to init Twilio Softphone:', e)
      setIsSoftphone(false) // Fallback to click-to-call
    }
  }

  // Timer logic
  const startTimer = () => {
    setCallDuration(0)
    timerRef.current = setInterval(() => {
      setCallDuration(d => d + 1)
    }, 1000)
  }

  const stopTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
  }

  const endCallState = () => {
    stopTimer()
    setCallState('ended')
    setTimeout(() => {
      setCallState('idle')
      setCallDuration(0)
    }, 2000)
    fetchLogs()
  }

  // Handle Call trigger
  const handleCall = async () => {
    if (!dialNumber.trim()) {
      toast.error('Please enter a phone number.')
      return
    }

    if (isSoftphone && deviceRef.current) {
      setCallState('connecting')
      deviceRef.current.connect({ params: { To: dialNumber } })
    } else {
      // Fallback Click-to-Call bridging
      setCallState('connecting')
      try {
        const res = await fetch('/twilio/call', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-CSRF-TOKEN': document.head.querySelector('meta[name="csrf-token"]')?.content ?? '',
            Accept: 'application/json',
          },
          body: JSON.stringify({ to: dialNumber }),
        })
        const data = await res.json()
        if (res.ok) {
          toast.success('Ringing your company phone to connect call...')
          setCallState('connected')
          startTimer()
        } else {
          toast.error(data.error ?? 'Failed to place call.')
          setCallState('idle')
        }
      } catch {
        toast.error('Network error placing call.')
        setCallState('idle')
      }
    }
  }

  // Hangup call
  const handleHangup = () => {
    if (isSoftphone && deviceRef.current) {
      deviceRef.current.disconnectAll()
    } else {
      endCallState()
      toast.info('Bridged call session ended.')
    }
  }

  // Send SMS
  const handleSendSms = async (e) => {
    e.preventDefault()
    if (!activeSmsNumber.trim() || !smsMessage.trim()) return

    setSendingSms(true)
    try {
      const res = await fetch('/twilio/sms', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': document.head.querySelector('meta[name="csrf-token"]')?.content ?? '',
          Accept: 'application/json',
        },
        body: JSON.stringify({ to: activeSmsNumber, body: smsMessage }),
      })
      const data = await res.json()
      if (res.ok) {
        toast.success('SMS sent successfully!')
        setSmsMessage('')
        fetchLogs()
      } else {
        toast.error(data.error ?? 'Failed to send SMS.')
      }
    } catch {
      toast.error('Network error sending SMS.')
    } finally {
      setSendingSms(false)
    }
  }

  const toggleMute = () => {
    if (connectionRef.current) {
      const muteState = !isMuted
      connectionRef.current.mute(muteState)
      setIsMuted(muteState)
    }
  }

  // Format call duration MM:SS
  const formatTime = (secs) => {
    const mins = Math.floor(secs / 60)
    const remaining = secs % 60
    return `${mins.toString().padStart(2, '0')}:${remaining.toString().padStart(2, '0')}`
  }

  // Dial keys helper
  const addKey = (key) => {
    setDialNumber(prev => prev + key)
  }

  const deleteKey = () => {
    setDialNumber(prev => prev.slice(0, -1))
  }

  // Play Voicemail Audio
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

  // SMS thread grouping
  const getSmsThreads = () => {
    const threads = {}
    smsLogs.forEach(msg => {
      const partner = msg.direction === 'inbound' ? msg.from_number : msg.to_number
      if (!threads[partner]) {
        threads[partner] = []
      }
      threads[partner].push(msg)
    })
    return threads
  }

  const isHubPage = typeof window !== 'undefined' && window.location.pathname === '/twilio'
  if (isHubPage || !hasTwilio) return null

  return (
    <div className="fixed bottom-5 right-5 z-[99] flex flex-col items-end font-sans">
      {/* Dialer Trigger Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-full shadow-lg border border-slate-100 bg-white text-slate-700 transition-all duration-300 transform hover:scale-105 active:scale-95"
          style={{
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)'
          }}
        >
          <PhoneCall size={15} className="text-brand-600 animate-pulse" />
          <span className="text-[12px] font-semibold tracking-wide">Twilio Dialer</span>
          {callState !== 'idle' && (
            <span className="bg-red-500 h-2 w-2 rounded-full animate-ping" />
          )}
        </button>
      )}

      {/* Dialer Card */}
      {isOpen && (
        <div
          className="w-[320px] h-[500px] rounded-2xl flex flex-col overflow-hidden shadow-2xl border border-slate-100 bg-white text-slate-800 animate-in slide-in-from-bottom-5 duration-200"
        >
          {/* Header */}
          <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <div className="flex items-center gap-2">
              <div className={cn("w-2 h-2 rounded-full", callState !== 'idle' ? "bg-red-500 animate-pulse" : "bg-emerald-500")} />
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">
                {isSoftphone ? 'Softphone' : 'Click-to-Call'}
              </span>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-md hover:bg-slate-100 transition-colors"
            >
              <X size={14} className="text-slate-400 hover:text-slate-600" />
            </button>
          </div>

          {/* Active Call Banner */}
          {callState !== 'idle' && (
            <div
              className={cn(
                'px-4 py-2 flex items-center justify-between text-xs transition-colors border-b border-slate-50',
                callState === 'connected' ? 'bg-emerald-50 text-emerald-700' : 'bg-brand-50 text-brand-700'
              )}
            >
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-current animate-ping" />
                <span className="font-semibold capitalize tracking-wide">
                  {callState === 'connected' ? `In Call: ${formatTime(callDuration)}` : `${callState}...`}
                </span>
              </div>
              <span className="font-mono text-[11px] font-bold">{dialNumber}</span>
            </div>
          )}

          {/* Tab Content */}
          <div className="flex-1 overflow-y-auto min-h-0 bg-white">
            {/* 1. KEYPAD TAB */}
            {activeTab === 'keypad' && (
              <div className="p-4 flex flex-col h-full items-center justify-between">
                {/* User Display */}
                <div className="w-full text-center py-1.5 border-b border-slate-100">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Agent Line</p>
                  <p className="text-[12px] font-semibold text-slate-700 mt-0.5 truncate capitalize">
                    {user?.name ?? 'Agent'}
                  </p>
                </div>

                {/* Dial Input */}
                <div className="w-full flex items-center justify-between bg-slate-50 px-4 py-2 rounded-xl border border-slate-100 mt-3">
                  <input
                    type="text"
                    value={dialNumber}
                    onChange={e => setDialNumber(e.target.value)}
                    placeholder="Enter number..."
                    disabled={callState !== 'idle'}
                    className="bg-transparent border-none text-[18px] font-bold tracking-wider w-full focus:outline-none focus:ring-0 text-slate-800 placeholder-slate-300 p-0 h-8"
                  />
                  {dialNumber && callState === 'idle' && (
                    <button onClick={deleteKey} className="text-slate-400 hover:text-slate-600 transition-colors p-1">
                      <Delete size={15} />
                    </button>
                  )}
                </div>

                {/* Keypad Grid */}
                <div className="grid grid-cols-3 gap-x-5 gap-y-2.5 my-3">
                  {[
                    { num: '1', letters: '' },
                    { num: '2', letters: 'ABC' },
                    { num: '3', letters: 'DEF' },
                    { num: '4', letters: 'GHI' },
                    { num: '5', letters: 'JKL' },
                    { num: '6', letters: 'MNO' },
                    { num: '7', letters: 'PQRS' },
                    { num: '8', letters: 'TUV' },
                    { num: '9', letters: 'WXYZ' },
                    { num: '*', letters: '' },
                    { num: '0', letters: '+' },
                    { num: '#', letters: '' },
                  ].map(({ num, letters }) => (
                    <button
                      key={num}
                      type="button"
                      disabled={callState !== 'idle' && callState !== 'connected'}
                      onClick={() => addKey(num)}
                      className="w-[48px] h-[48px] rounded-full bg-slate-50 hover:bg-slate-100 active:scale-95 transition-all flex flex-col items-center justify-center border border-slate-100"
                    >
                      <span className="text-[16px] font-semibold text-slate-800 leading-none">{num}</span>
                      {letters && <span className="text-[7.5px] font-bold text-slate-400 uppercase mt-0.5">{letters}</span>}
                    </button>
                  ))}
                </div>

                {/* Call Control Button */}
                <div className="flex gap-4 w-full justify-center">
                  {callState === 'idle' ? (
                    <button
                      type="button"
                      onClick={handleCall}
                      className="w-12 h-12 rounded-full bg-emerald-600 hover:bg-emerald-700 active:scale-95 transition-all flex items-center justify-center shadow-md shadow-emerald-600/10"
                    >
                      <PhoneCall size={18} className="text-white" />
                    </button>
                  ) : (
                    <>
                      {isSoftphone && (
                        <button
                          type="button"
                          onClick={toggleMute}
                          className={cn(
                            'w-11 h-11 rounded-full active:scale-95 transition-all flex items-center justify-center border border-slate-150',
                            isMuted ? 'bg-amber-500 text-white' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                          )}
                        >
                          {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={handleHangup}
                        className="w-12 h-12 rounded-full bg-red-600 hover:bg-red-700 active:scale-95 transition-all flex items-center justify-center shadow-md shadow-red-600/10"
                      >
                        <PhoneOff size={18} className="text-white" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* 2. RECENT TAB */}
            {activeTab === 'recent' && (
              <div className="p-3 divide-y divide-slate-50 h-full overflow-y-auto">
                {callLogs.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-48 text-center px-4">
                    <Clock size={24} className="text-slate-300 mb-2" />
                    <p className="text-[12px] font-semibold text-slate-400">No call history</p>
                  </div>
                ) : (
                  callLogs.map(call => (
                    <div key={call.id} className="py-2 flex items-center justify-between group">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className={cn(
                          'w-7 h-7 rounded-lg flex items-center justify-center shrink-0',
                          call.direction === 'inbound' ? 'bg-blue-50 text-blue-600' : 'bg-purple-50 text-purple-600'
                        )}>
                          <PhoneForwarded size={11} className={call.direction === 'inbound' ? 'rotate-180' : ''} />
                        </div>
                        <div className="min-w-0">
                          <p className="text-[11.5px] font-bold text-slate-700 truncate">
                            {call.direction === 'inbound' ? call.from_number : call.to_number}
                          </p>
                          <p className="text-[9.5px] text-slate-400 mt-0.5">
                            {new Date(call.created_at).toLocaleString([], { hour: '2-digit', minute: '2-digit', month: 'short', day: 'numeric' })}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {call.status === 'voicemail' && (
                          <span className="text-[8px] font-bold bg-amber-50 text-amber-600 px-1.5 py-0.5 rounded border border-amber-100">VM</span>
                        )}
                        <button
                          type="button"
                          onClick={() => {
                            setDialNumber(call.direction === 'inbound' ? call.from_number : call.to_number)
                            setActiveTab('keypad')
                          }}
                          className="w-7 h-7 rounded-md bg-slate-50 hover:bg-slate-100 flex items-center justify-center transition-colors"
                        >
                          <PhoneCall size={10} className="text-slate-500" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* 3. MESSAGES TAB */}
            {activeTab === 'messages' && (
              <div className="h-full flex flex-col bg-slate-50/50">
                {activeSmsNumber ? (
                  // SMS thread detail
                  <div className="flex-1 flex flex-col min-h-0">
                    {/* Thread Header */}
                    <div className="px-3 py-2 border-b border-slate-100 bg-white flex items-center gap-2">
                      <button type="button" onClick={() => setActiveSmsNumber('')} className="text-xs text-brand-600 hover:underline font-medium">← Threads</button>
                      <span className="text-[11px] font-bold text-slate-700 truncate flex-1 text-center">{activeSmsNumber}</span>
                    </div>

                    {/* Thread message list */}
                    <div className="flex-1 overflow-y-auto p-3 space-y-2 bg-white">
                      {smsLogs
                        .filter(msg => msg.from_number === activeSmsNumber || msg.to_number === activeSmsNumber)
                        .reverse()
                        .map(msg => {
                          const isInbound = msg.direction === 'inbound'
                          return (
                            <div key={msg.id} className={cn('flex flex-col max-w-[80%]', isInbound ? 'mr-auto items-start' : 'ml-auto items-end')}>
                              <div className={cn(
                                'rounded-2xl px-3 py-2 text-[12px] leading-relaxed',
                                isInbound ? 'bg-slate-100 text-slate-800 rounded-tl-none' : 'bg-brand-600 text-white rounded-tr-none'
                              )}>
                                {msg.body}
                              </div>
                              <span className="text-[9px] text-slate-400 mt-0.5 px-1">
                                {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                          )
                        })}
                    </div>

                    {/* Compose Box */}
                    <form onSubmit={handleSendSms} className="p-2 border-t border-slate-100 bg-white flex gap-1.5 items-center">
                      <input
                        type="text"
                        value={smsMessage}
                        onChange={e => setSmsMessage(e.target.value)}
                        placeholder="Type message..."
                        className="bg-slate-50 border border-slate-150 rounded-xl text-xs px-3 py-1.5 flex-1 focus:outline-none focus:border-brand-500 focus:ring-0 text-slate-800 h-8"
                      />
                      <button
                        type="submit"
                        disabled={sendingSms || !smsMessage.trim()}
                        className="w-8 h-8 rounded-xl bg-brand-600 hover:bg-brand-700 flex items-center justify-center shrink-0 disabled:opacity-40"
                      >
                        <Send size={12} className="text-white" />
                      </button>
                    </form>
                  </div>
                ) : (
                  // SMS thread list
                  <div className="p-3 divide-y divide-slate-50 h-full overflow-y-auto bg-white">
                    {Object.keys(getSmsThreads()).length === 0 ? (
                      <div className="flex flex-col items-center justify-center h-48 text-center px-4">
                        <MessageSquare size={24} className="text-slate-300 mb-2" />
                        <p className="text-[12px] font-semibold text-slate-400">No message threads</p>
                      </div>
                    ) : (
                      Object.entries(getSmsThreads()).map(([phone, msgs]) => {
                        const lastMsg = msgs[0]
                        return (
                          <div
                            key={phone}
                            onClick={() => setActiveSmsNumber(phone)}
                            className="py-2.5 flex items-start gap-2.5 cursor-pointer hover:bg-slate-50 px-2 rounded-xl transition-all"
                          >
                            <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 shrink-0 font-bold text-xs uppercase">
                              {phone.replace('+', '').slice(0, 2)}
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="flex justify-between items-baseline">
                                <span className="text-[12px] font-bold text-slate-700 truncate">{phone}</span>
                                <span className="text-[8.5px] text-slate-400">
                                  {new Date(lastMsg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                              </div>
                              <p className="text-[10.5px] text-slate-500 truncate mt-0.5 font-medium">{lastMsg.body}</p>
                            </div>
                          </div>
                        )
                      })
                    )}
                  </div>
                )}
              </div>
            )}

            {/* 4. VOICEMAIL TAB */}
            {activeTab === 'voicemail' && (
              <div className="p-3 space-y-2 h-full overflow-y-auto">
                {callLogs.filter(c => c.status === 'voicemail').length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-48 text-center px-4">
                    <Volume2 size={24} className="text-slate-300 mb-2" />
                    <p className="text-[12px] font-semibold text-slate-400">No voicemails</p>
                  </div>
                ) : (
                  callLogs
                    .filter(c => c.status === 'voicemail')
                    .map(call => (
                      <div
                        key={call.id}
                        className="bg-slate-50/50 border border-slate-100 rounded-xl p-3 flex flex-col justify-between hover:border-slate-200 transition-colors"
                      >
                        <div className="flex justify-between items-start gap-4 mb-2">
                          <div>
                            <span className="text-[8.5px] font-bold text-slate-400 uppercase tracking-wide">From</span>
                            <p className="text-[11.5px] font-bold text-slate-700">{call.from_number}</p>
                          </div>
                          <span className="text-[9px] text-slate-400">
                            {new Date(call.created_at).toLocaleString([], { month: 'short', day: 'numeric' })}
                          </span>
                        </div>

                        <div className="flex items-center gap-3 bg-white px-2.5 py-2 rounded-lg border border-slate-100">
                          <button
                            type="button"
                            onClick={() => playVoicemail(call)}
                            className={cn(
                              'w-6 h-6 rounded-full flex items-center justify-center shrink-0 shadow-sm transition-all',
                              playingVoicemail === call.id ? 'bg-amber-500 text-white' : 'bg-brand-600 text-white hover:bg-brand-700'
                            )}
                          >
                            {playingVoicemail === call.id ? <Pause size={10} fill="white" /> : <Play size={10} fill="white" className="ml-0.5" />}
                          </button>
                          <div className="flex-1 min-w-0">
                            <p className="text-[10px] text-slate-500 truncate">Duration: {formatTime(call.duration)}</p>
                          </div>
                        </div>
                      </div>
                    ))
                )}
              </div>
            )}

            {/* 5. SETTINGS TAB */}
            {activeTab === 'settings' && (
              <div className="p-4 space-y-4 text-[12px]">
                <div className="bg-slate-50 border border-slate-100 p-3 rounded-xl flex items-center gap-3">
                  <div className="w-7 h-7 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600 font-bold text-[13px] border border-emerald-100">
                    ✓
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-700">Twilio Connected</h4>
                    <p className="text-[10px] text-emerald-600 mt-0.5 font-medium">Ready for calls and SMS</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <span className="text-[9.5px] font-bold text-slate-400 uppercase tracking-wider block">Your Twilio Line</span>
                    <span className="text-[12px] font-mono font-semibold text-slate-700 block mt-0.5">{props?.organization?.settings?.twilio_phone_number ?? 'Configured phone'}</span>
                  </div>

                  <div>
                    <span className="text-[9.5px] font-bold text-slate-400 uppercase tracking-wider block">Calling Method</span>
                    <span className="text-[11.5px] font-semibold text-slate-700 block mt-0.5 capitalize">
                      {isSoftphone ? 'Softphone (Browser Audio)' : 'Click-to-Call (Bridged Phone)'}
                    </span>
                  </div>

                  <p className="text-[10.5px] text-slate-400 leading-relaxed border-t border-slate-100 pt-3">
                    If you're having trouble receiving browser calls, check that you've granted microphone permissions and that your TwiML App SID is configured in settings.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Footer Tabs */}
          <div
            className="flex h-[52px] border-t border-slate-100 shrink-0 bg-slate-50/50"
          >
            {[
              { id: 'keypad', label: 'Keypad', icon: Phone },
              { id: 'recent', label: 'Recent', icon: Clock },
              { id: 'messages', label: 'Messages', icon: MessageSquare },
              { id: 'voicemail', label: 'Voicemail', icon: Volume2 },
              { id: 'settings', label: 'Settings', icon: HelpCircle },
            ].map(tabItem => {
              const Icon = tabItem.icon
              const isActive = activeTab === tabItem.id
              return (
                <button
                  key={tabItem.id}
                  type="button"
                  onClick={() => setActiveTab(tabItem.id)}
                  className={cn(
                    'flex-1 flex flex-col items-center justify-center gap-1 transition-colors border-t-2',
                    isActive ? 'border-brand-500 text-brand-600 bg-white' : 'border-transparent text-slate-400 hover:text-slate-600'
                  )}
                >
                  <Icon size={13} />
                  <span className="text-[8px] font-bold tracking-wide uppercase leading-none">{tabItem.label}</span>
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
