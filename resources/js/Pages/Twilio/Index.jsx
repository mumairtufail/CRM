import React, { useState, useEffect, useRef } from 'react'
import { Head, Link, router } from '@inertiajs/react'
import AppLayout from '@/Components/Layout/AppLayout'
import { Button } from '@/Components/ui/button'
import { Input } from '@/Components/ui/input'
import { Label } from '@/Components/ui/label'
import { Alert, AlertDescription } from '@/Components/ui/alert'
import { Card } from '@/Components/ui/card'
import {
  Phone, PhoneCall, PhoneOff, PhoneForwarded, MessageSquare,
  Clock, Volume2, VolumeX, Delete, HelpCircle, X, Play, Pause,
  AlertCircle, RefreshCw, Mic, MicOff, Search, ChevronRight, User
} from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

export default function TwilioIndex({ calls, messages, twilioSetting, quickLeads }) {
  // Tabs and general state
  const [activeTab, setActiveTab] = useState('calls')
  const [syncing, setSyncing] = useState(false)
  const [callSearch, setCallSearch] = useState('')
  const [msgSearch, setMsgSearch] = useState('')
  const [selectedQuickLead, setSelectedQuickLead] = useState('')

  const [playingVoicemail, setPlayingVoicemail] = useState(null)
  const audioRef = useRef(null)

  // Embedded Dialer States
  const [dialNumber, setDialNumber] = useState('')
  const [callState, setCallState] = useState('idle') // 'idle' | 'ringing' | 'connecting' | 'connected' | 'ended'
  const [callDuration, setCallDuration] = useState(0)
  const [isMuted, setIsMuted] = useState(false)
  const [isSoftphone, setIsSoftphone] = useState(false)

  const deviceRef = useRef(null)
  const connectionRef = useRef(null)
  const timerRef = useRef(null)

  // Web Audio Tester States
  const [audioContext, setAudioContext] = useState(null)
  const [analyser, setAnalyser] = useState(null)
  const [micStream, setMicStream] = useState(null)
  const [isMicTesting, setIsMicTesting] = useState(false)
  const [isLoopback, setIsLoopback] = useState(false)

  const canvasRef = useRef(null)
  const loopbackGainNodeRef = useRef(null)
  const animationFrameRef = useRef(null)

  // ─── Twilio Sync ─────────────────────────────────────────────────────────────
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

  // ─── Twilio Device Setup ──────────────────────────────────────────────────────
  useEffect(() => {
    if (!twilioSetting) return

    // Inject Twilio JS Client SDK dynamically if not loaded
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
  }, [twilioSetting])

  const initTwilioDevice = async () => {
    try {
      const res = await fetch('/twilio/token')
      if (!res.ok) return
      
      const { token } = await res.json()
      if (!token) return

      setIsSoftphone(true)

      const device = new window.Twilio.Device(token, {
        debug: true,
        codecPreferences: ['opus', 'pcmu'],
      })

      device.on('ready', () => {
        console.log('Embedded Twilio Softphone Ready')
      })

      device.on('error', (err) => {
        console.warn('Embedded Twilio Device Error:', err)
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
        setCallState('ringing')
        connectionRef.current = conn
        toast.info(`Incoming call from ${conn.parameters.From}`, {
          action: {
            label: 'Answer',
            onClick: () => conn.accept(),
          },
          duration: 15000,
        })
      })

      deviceRef.current = device
    } catch (e) {
      console.error('Failed to init Softphone:', e)
      setIsSoftphone(false) // Fallback to Click-to-Call bridging
    }
  }

  // ─── Call Timer ─────────────────────────────────────────────────────────────
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
    router.reload({ only: ['calls'] })
  }

  const triggerCall = (phone) => {
    if (!phone) return
    setDialNumber(phone)
    toast.info(`Pre-filled dialer with ${phone}`)
  }

  const handleCall = async () => {
    if (!dialNumber.trim()) {
      toast.error('Please enter a phone number.')
      return
    }

    if (isSoftphone && deviceRef.current) {
      setCallState('connecting')
      deviceRef.current.connect({ params: { To: dialNumber } })
    } else {
      // Click-to-Call bridging
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
          toast.success('Ringing your phone to connect call...')
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

  const handleHangup = () => {
    if (isSoftphone && deviceRef.current) {
      deviceRef.current.disconnectAll()
    } else {
      endCallState()
      toast.info('Call ended.')
    }
  }

  const toggleMute = () => {
    if (connectionRef.current) {
      const nextMuted = !isMuted
      connectionRef.current.mute(nextMuted)
      setIsMuted(nextMuted)
    }
  }

  // Keypad keys
  const addKey = (val) => {
    if (callState === 'connected' && connectionRef.current) {
      connectionRef.current.sendDigits(val)
    }
    setDialNumber(prev => prev + val)
  }

  const deleteKey = () => {
    setDialNumber(prev => prev.slice(0, -1))
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

  const formatTime = (secs) => {
    const mins = Math.floor(secs / 60)
    const remaining = secs % 60
    return `${mins}:${remaining < 10 ? '0' : ''}${remaining}`
  }

  // ─── Voice Wave Visualizer & Audio Tester ──────────────────────────────────
  const startMicTest = async () => {
    if (isMicTesting) {
      stopMicTest()
      return
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      setMicStream(stream)
      
      const AudioCtx = window.AudioContext || window.webkitAudioContext
      const ctx = new AudioCtx()
      const src = ctx.createMediaStreamSource(stream)
      const anal = ctx.createAnalyser()
      anal.fftSize = 128
      src.connect(anal)
      
      setAudioContext(ctx)
      setAnalyser(anal)
      setIsMicTesting(true)
      toast.success('Microphone active! Speak now to test.')
    } catch (err) {
      console.error(err)
      toast.error('Microphone permission denied or unavailable.')
    }
  }

  const stopMicTest = () => {
    setIsMicTesting(false)
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current)
    }
    if (micStream) {
      micStream.getTracks().forEach(track => track.stop())
      setMicStream(null)
    }
    if (audioContext) {
      audioContext.close()
      setAudioContext(null)
    }
    setAnalyser(null)
    setIsLoopback(false)
  }

  // Loopback audio connection
  useEffect(() => {
    if (!audioContext || !analyser) return

    if (isLoopback) {
      const dest = audioContext.destination
      const gainNode = audioContext.createGain()
      gainNode.gain.value = 0.4 // Restrict volume to prevent feedback loop squealing
      analyser.connect(gainNode)
      gainNode.connect(dest)
      loopbackGainNodeRef.current = gainNode
    } else {
      if (loopbackGainNodeRef.current) {
        loopbackGainNodeRef.current.disconnect()
        loopbackGainNodeRef.current = null
      }
    }
  }, [isLoopback, audioContext, analyser])

  // Draw bouncing wave bars
  useEffect(() => {
    if (!isMicTesting || !analyser || !canvasRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    const bufferLength = analyser.frequencyBinCount
    const dataArray = new Uint8Array(bufferLength)

    const draw = () => {
      if (!canvas) return
      animationFrameRef.current = requestAnimationFrame(draw)
      analyser.getByteFrequencyData(dataArray)

      ctx.clearRect(0, 0, canvas.width, canvas.height)
      
      // Draw background wave bar grid
      ctx.fillStyle = '#f8fafc'
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      const barWidth = (canvas.width / bufferLength) * 2.5
      let barHeight
      let x = 0

      for (let i = 0; i < bufferLength; i++) {
        barHeight = dataArray[i] / 2.2
        ctx.fillStyle = `rgba(99, 102, 241, ${Math.max(0.15, barHeight / 80)})`
        ctx.fillRect(x, canvas.height - barHeight, barWidth - 1.5, barHeight)
        x += barWidth
      }
    }

    draw()

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [isMicTesting, analyser])

  const playTestChime = () => {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext
      const ctx = new AudioCtx()
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()

      osc.type = 'sine'
      osc.frequency.setValueAtTime(440, ctx.currentTime)
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.15)

      gain.gain.setValueAtTime(0.15, ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.45)

      osc.connect(gain)
      gain.connect(ctx.destination)

      osc.start()
      osc.stop(ctx.currentTime + 0.5)
      toast.success('Test tone played.')
    } catch {
      toast.error('Audio context blocked.')
    }
  }

  // ─── Filter Lists ───────────────────────────────────────────────────────────
  const filteredCalls = (calls.data ?? []).filter(call => {
    if (!callSearch) return true
    return call.from_number.includes(callSearch) || call.to_number.includes(callSearch)
  })

  const filteredMessages = (messages.data ?? []).filter(msg => {
    if (!msgSearch) return true
    return msg.from_number.includes(msgSearch) || msg.to_number.includes(msgSearch) || msg.body.toLowerCase().includes(msgSearch.toLowerCase())
  })

  const glassCard = {
    background: 'rgba(255, 255, 255, 0.9)',
    backdropFilter: 'blur(12px)',
    border: '1px solid rgba(241, 245, 249, 1)',
    boxShadow: '0 4px 20px rgba(0,0,0,0.015)'
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
              <Button size="sm" className="h-9 text-xs bg-brand-600 hover:bg-brand-700">
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
          <div className="p-4 sm:p-6 bg-slate-50 min-h-0 flex-1 overflow-y-auto">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              
              {/* Left Column: Logs, SMS & Voicemails (8 columns) */}
              <div className="lg:col-span-8 space-y-6">
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
                    <div className="p-4 space-y-4 bg-white">
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
                    <div className="p-4 space-y-4 bg-white">
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
                                <td className="py-3 px-3 text-slate-650 font-medium max-w-xs truncate">{msg.body}</td>
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
                    <div className="p-4 space-y-4 bg-white">
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
                                className="bg-white border border-slate-100 rounded-xl p-4 flex flex-col justify-between hover:border-brand-205 transition-colors shadow-sm"
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

              {/* Right Column: Embedded Light-Mode Dialer & Voice Tester (4 columns) */}
              <div className="lg:col-span-4 space-y-6">
                
                {/* Embedded Dialer Card */}
                <div className="bg-white rounded-2xl border border-slate-150 shadow-sm overflow-hidden flex flex-col">
                  {/* Card Header */}
                  <div className="px-4 py-3 bg-slate-50/50 border-b border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={cn("w-2 h-2 rounded-full", callState !== 'idle' ? "bg-red-500 animate-pulse" : "bg-emerald-500")} />
                      <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                        {isSoftphone ? 'Softphone Mode' : 'Click-to-Call'}
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-400 font-semibold uppercase">Twilio Line</span>
                  </div>

                  {/* Active call duration display */}
                  {callState !== 'idle' && (
                    <div className={cn(
                      "px-4 py-2 flex justify-between items-center text-xs font-semibold",
                      callState === 'connected' ? "bg-emerald-50 text-emerald-700" : "bg-brand-50 text-brand-700"
                    )}>
                      <span>{callState === 'connected' ? `Connected: ${formatTime(callDuration)}` : `${callState}...`}</span>
                      <span className="font-mono">{dialNumber}</span>
                    </div>
                  )}

                  {/* Dialer Body */}
                  <div className="p-4 flex flex-col items-center">
                    {/* User Identity Display */}
                    <div className="w-full text-center pb-2 border-b border-slate-100">
                      <span className="text-[9.5px] font-bold text-slate-400 uppercase tracking-wider block">Agent Line</span>
                      <span className="text-[12.5px] font-bold text-slate-700 block truncate mt-0.5">{user?.name ?? 'Agent'}</span>
                    </div>

                    {/* Dialer input */}
                    <div className="w-full flex items-center justify-between bg-slate-50 border border-slate-100 rounded-xl px-3 py-2 mt-3.5">
                      <input
                        type="text"
                        value={dialNumber}
                        onChange={e => setDialNumber(e.target.value)}
                        placeholder="Enter phone number..."
                        disabled={callState !== 'idle'}
                        className="bg-transparent border-none text-[16px] font-bold tracking-wider w-full focus:outline-none focus:ring-0 text-slate-800 placeholder-slate-300 p-0 h-7"
                      />
                      {dialNumber && callState === 'idle' && (
                        <button onClick={deleteKey} className="text-slate-400 hover:text-slate-600 transition-colors p-1">
                          <Delete size={14} />
                        </button>
                      )}
                    </div>

                    {/* Numeric Keypad Grid */}
                    <div className="grid grid-cols-3 gap-x-5 gap-y-2.5 my-4">
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
                          className="w-[45px] h-[45px] rounded-full bg-slate-50 hover:bg-slate-100 active:scale-95 transition-all flex flex-col items-center justify-center border border-slate-100"
                        >
                          <span className="text-[15px] font-bold text-slate-800 leading-none">{num}</span>
                          {letters && <span className="text-[7.5px] font-bold text-slate-400 uppercase mt-0.5">{letters}</span>}
                        </button>
                      ))}
                    </div>

                    {/* Dial button controls */}
                    <div className="w-full flex justify-center pt-1">
                      {callState === 'idle' ? (
                        <button
                          type="button"
                          onClick={handleCall}
                          className="w-12 h-12 rounded-full bg-emerald-600 hover:bg-emerald-700 active:scale-95 transition-all flex items-center justify-center shadow-sm hover:shadow"
                        >
                          <PhoneCall size={18} className="text-white" />
                        </button>
                      ) : (
                        <div className="flex gap-3">
                          {isSoftphone && (
                            <button
                              type="button"
                              onClick={toggleMute}
                              className={cn(
                                "w-11 h-11 rounded-full active:scale-95 transition-all flex items-center justify-center border border-slate-200",
                                isMuted ? "bg-amber-500 text-white" : "bg-slate-50 text-slate-600 hover:bg-slate-100"
                              )}
                            >
                              {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={handleHangup}
                            className="w-12 h-12 rounded-full bg-red-600 hover:bg-red-700 active:scale-95 transition-all flex items-center justify-center shadow-sm"
                          >
                            <PhoneOff size={18} className="text-white" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Voice Permissions & Web Audio Tester Card */}
                <div className="bg-white rounded-2xl border border-slate-150 shadow-sm p-4 space-y-4">
                  <div>
                    <h3 className="text-[12.5px] font-bold text-slate-800 uppercase tracking-wider">Voice & Audio Tester</h3>
                    <p className="text-[11.5px] text-slate-400 leading-relaxed mt-0.5">
                      Verify your browser voice permissions, test speaker output, and view live microphone frequency waves.
                    </p>
                  </div>

                  {/* Frequency Visualizer Canvas */}
                  <div className="relative">
                    <canvas
                      ref={canvasRef}
                      width={300}
                      height={60}
                      className="w-full h-15 bg-slate-50 rounded-xl border border-slate-100 overflow-hidden"
                    />
                    {!isMicTesting && (
                      <div className="absolute inset-0 flex items-center justify-center bg-slate-50/70 rounded-xl text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                        Waveform Visualizer Inactive
                      </div>
                    )}
                  </div>

                  {/* Testing Actions */}
                  <div className="space-y-2.5">
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        onClick={startMicTest}
                        variant={isMicTesting ? "destructive" : "outline"}
                        size="sm"
                        className="flex-1 text-xs h-8.5 rounded-lg"
                      >
                        {isMicTesting ? 'Stop Mic Test' : 'Test Microphone'}
                      </Button>

                      <Button
                        type="button"
                        onClick={playTestChime}
                        variant="outline"
                        size="sm"
                        className="flex-1 text-xs h-8.5 rounded-lg"
                      >
                        Test Speakers
                      </Button>
                    </div>

                    {isMicTesting && (
                      <div className="flex items-center gap-2 p-2 bg-slate-50 rounded-xl border border-slate-100 animate-in fade-in duration-300">
                        <input
                          id="loopback_toggle"
                          type="checkbox"
                          checked={isLoopback}
                          onChange={e => setIsLoopback(e.target.checked)}
                          className="rounded text-brand-600 focus:ring-0 border-slate-300 h-3.5 w-3.5"
                        />
                        <Label htmlFor="loopback_toggle" className="text-[11px] text-slate-600 font-semibold cursor-pointer select-none">
                          Listen Back (Loopback to speakers)
                        </Label>
                      </div>
                    )}
                  </div>
                </div>

              </div>
            </div>
          </div>
        )}
      </AppLayout>
    </>
  )
}
