import React, { useState, useEffect, useRef } from 'react'
import { Head, Link, router, usePage } from '@inertiajs/react'
import { Device } from '@twilio/voice-sdk'
import AppLayout from '@/Components/Layout/AppLayout'
import { Button } from '@/Components/ui/button'
import { Input } from '@/Components/ui/input'
import { Label } from '@/Components/ui/label'
import { Alert, AlertDescription } from '@/Components/ui/alert'
import { Card } from '@/Components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/Components/ui/dialog'
import { Checkbox } from '@/Components/ui/checkbox'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/Components/ui/select'
import StatusBadge from '@/Components/Common/StatusBadge'
import usePermissions from '@/Hooks/usePermissions'
import { reportError } from '@/lib/reportError'
import {
  Phone, PhoneCall, PhoneOff, PhoneForwarded, MessageSquare,
  Clock, Volume2, VolumeX, Delete, HelpCircle, X, Play, Pause,
  AlertCircle, RefreshCw, Mic, MicOff, Search, ChevronRight, ChevronLeft, User, Send,
  RotateCcw, RotateCw, Trash2, CheckCircle2, UsersRound, Grid3x3,
} from 'lucide-react'

// Keep in sync with LeadController's status options (Leads/Index.jsx STATUS_OPTIONS).
const LEAD_STATUS_OPTIONS = [
  { value: 'new',         label: 'New' },
  { value: 'contacted',   label: 'Contacted' },
  { value: 'qualified',   label: 'Qualified' },
  { value: 'proposal',    label: 'Proposal' },
  { value: 'negotiation', label: 'Negotiation' },
  { value: 'won',         label: 'Won' },
  { value: 'lost',        label: 'Lost' },
]

function PaginationBar({ paginator, pageParam, onPageChange }) {
  if (!paginator || paginator.last_page <= 1) return null
  return (
    <div className="flex items-center justify-between px-3 py-2.5 border-t border-slate-100">
      <p className="text-[11px] text-slate-400">
        Showing {paginator.from}–{paginator.to} of {paginator.total}
      </p>
      <div className="flex items-center gap-1.5">
        <Button
          variant="outline"
          size="sm"
          className="h-7 w-7 p-0 rounded-lg border-slate-200"
          onClick={() => onPageChange(pageParam, paginator.current_page - 1)}
          disabled={paginator.current_page === 1}
        >
          <ChevronLeft size={13} />
        </Button>
        <span className="text-[11px] font-semibold text-slate-500 px-1">
          {paginator.current_page} / {paginator.last_page}
        </span>
        <Button
          variant="outline"
          size="sm"
          className="h-7 w-7 p-0 rounded-lg border-slate-200"
          onClick={() => onPageChange(pageParam, paginator.current_page + 1)}
          disabled={paginator.current_page === paginator.last_page}
        >
          <ChevronRight size={13} />
        </Button>
      </div>
    </div>
  )
}
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

export default function TwilioIndex({ calls, messages, twilioSetting, quickLeads, leadGroups }) {
  const { auth } = usePage().props
  const user = auth?.user
  const { can } = usePermissions()

  // Tabs and general state
  const [activeTab, setActiveTab] = useState('calls')
  const [syncing, setSyncing] = useState(false)
  const [callSearch, setCallSearch] = useState('')
  const [msgSearch, setMsgSearch] = useState('')
  const [selectedQuickLead, setSelectedQuickLead] = useState('')

  const [recordingModalCall, setRecordingModalCall] = useState(null)
  const [playerState, setPlayerState] = useState({ isPlaying: false, currentTime: 0, duration: 0 })
  const audioRef = useRef(null)

  // Embedded Dialer States
  const [dialNumber, setDialNumber] = useState('')
  const [callState, setCallState] = useState('idle') // 'idle' | 'ringing' | 'connecting' | 'connected' | 'ended'
  const [callDuration, setCallDuration] = useState(0)
  const [isMuted, setIsMuted] = useState(false)
  const [isSoftphone, setIsSoftphone] = useState(false)
  const [deviceError, setDeviceError] = useState(null)
  const [showInCallKeypad, setShowInCallKeypad] = useState(false)

  const deviceRef = useRef(null)
  const connectionRef = useRef(null)
  const timerRef = useRef(null)

  // Smartphone Mockup Tabs
  const [activeMockupTab, setActiveMockupTab] = useState('keypad') // 'keypad' | 'recent' | 'messages' | 'voicemail' | 'settings'
  const [activeSmsNumber, setActiveSmsNumber] = useState('')
  const [smsMessage, setSmsMessage] = useState('')
  const [sendingSms, setSendingSms] = useState(false)

  // Searchable Quick Dial Lead States
  const [leadSearchQuery, setLeadSearchQuery] = useState('')
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const dropdownRef = useRef(null)

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const [searchResults, setSearchResults] = useState(quickLeads)

  // Debounced search for leads against all leads in DB
  useEffect(() => {
    const fetchLeads = async () => {
      try {
        const res = await fetch(`/twilio/leads?q=${encodeURIComponent(leadSearchQuery)}`)
        if (res.ok) {
          const data = await res.json()
          setSearchResults(data)
        }
      } catch (e) {
        console.error('Failed to search leads:', e)
      }
    }

    const delayDebounce = setTimeout(() => {
      fetchLeads()
    }, 300)

    return () => clearTimeout(delayDebounce)
  }, [leadSearchQuery, quickLeads])

  // ─── "Leads" tab — browse/call leads filtered by group & status ───────────
  const [leadsTabGroup, setLeadsTabGroup] = useState('all')
  const [leadsTabStatus, setLeadsTabStatus] = useState('all')
  const [leadsTabSearch, setLeadsTabSearch] = useState('')
  const [leadsTabResults, setLeadsTabResults] = useState([])
  const [leadsTabLoading, setLeadsTabLoading] = useState(false)
  const [markingContactedId, setMarkingContactedId] = useState(null)

  useEffect(() => {
    if (activeTab !== 'leads') return

    const params = new URLSearchParams()
    if (leadsTabSearch) params.set('q', leadsTabSearch)
    if (leadsTabGroup !== 'all') params.set('group', leadsTabGroup)
    if (leadsTabStatus !== 'all') params.set('status', leadsTabStatus)

    setLeadsTabLoading(true)
    const delayDebounce = setTimeout(async () => {
      try {
        const res = await fetch(`/twilio/leads?${params.toString()}`)
        if (res.ok) setLeadsTabResults(await res.json())
      } catch (e) {
        console.error('Failed to load leads:', e)
      } finally {
        setLeadsTabLoading(false)
      }
    }, 300)

    return () => clearTimeout(delayDebounce)
  }, [activeTab, leadsTabGroup, leadsTabStatus, leadsTabSearch])

  // Auto-dials a lead's number immediately (used by the Leads tab's Call button),
  // rather than just pre-filling the keypad like triggerCall() does elsewhere.
  const callLeadNow = (lead) => {
    if (!lead.phone) {
      toast.warning(`${lead.name} does not have a phone number.`)
      return
    }
    setActiveMockupTab('keypad')
    handleCall(lead.phone)
  }

  const markLeadContactedViaCall = async (lead) => {
    const alreadyContacted = !!lead.contact_channels?.call
    setMarkingContactedId(lead.id)
    try {
      const res = await fetch(`/leads/${lead.id}/channels`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': document.head.querySelector('meta[name="csrf-token"]')?.content ?? '',
          Accept: 'application/json',
        },
        body: JSON.stringify({ channel: 'call', value: !alreadyContacted }),
      })
      if (!res.ok) throw new Error()
      setLeadsTabResults(prev => prev.map(l => l.id !== lead.id ? l : {
        ...l,
        contact_channels: { ...l.contact_channels, call: alreadyContacted ? undefined : new Date().toISOString() },
      }))
      toast.success(alreadyContacted ? 'Unmarked as contacted' : 'Marked contacted via call')
    } catch {
      toast.error('Could not update contact status')
    } finally {
      setMarkingContactedId(null)
    }
  }

  const changeLeadStatus = async (lead, newStatus) => {
    if (newStatus === lead.status) return
    const prevStatus = lead.status
    setLeadsTabResults(prev => prev.map(l => l.id === lead.id ? { ...l, status: newStatus } : l))
    try {
      const res = await fetch(`/leads/${lead.id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': document.head.querySelector('meta[name="csrf-token"]')?.content ?? '',
          Accept: 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      })
      if (!res.ok) throw new Error()
      toast.success(`Status → ${newStatus}`)
    } catch {
      setLeadsTabResults(prev => prev.map(l => l.id === lead.id ? { ...l, status: prevStatus } : l))
      toast.error('Failed to update status')
    }
  }

  // Web Audio Tester States
  const [audioContext, setAudioContext] = useState(null)
  const [analyser, setAnalyser] = useState(null)
  const [micStream, setMicStream] = useState(null)
  const [isMicTesting, setIsMicTesting] = useState(false)
  const [isLoopback, setIsLoopback] = useState(false)

  // Audio input/output device selection
  const [inputDevices, setInputDevices] = useState([])
  const [outputDevices, setOutputDevices] = useState([])
  const [selectedInputId, setSelectedInputId] = useState('')
  const [selectedOutputId, setSelectedOutputId] = useState('')

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

  const goToPage = (pageParam, page) => {
    const params = new URLSearchParams(window.location.search)
    params.set(pageParam, page)
    router.get(`${window.location.pathname}?${params.toString()}`, {}, {
      preserveState: true,
      preserveScroll: true,
      only: [pageParam === 'calls_page' ? 'calls' : 'messages'],
    })
  }

  // ─── Call Log Selection & Deletion ─────────────────────────────────────────
  const [selectedCallIds, setSelectedCallIds] = useState([])

  const toggleCallSelected = (id) => {
    setSelectedCallIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
  }

  const toggleAllCallsSelected = (ids) => {
    setSelectedCallIds(prev => ids.every(id => prev.includes(id)) ? prev.filter(id => !ids.includes(id)) : [...new Set([...prev, ...ids])])
  }

  const deleteCall = (call) => {
    if (!window.confirm('Delete this call record? This cannot be undone.')) return
    router.delete(`/twilio/calls/${call.id}`, {
      preserveScroll: true,
      preserveState: true,
      only: ['calls'],
      onSuccess: () => setSelectedCallIds(prev => prev.filter(id => id !== call.id)),
    })
  }

  const deleteSelectedCalls = () => {
    if (selectedCallIds.length === 0) return
    if (!window.confirm(`Delete ${selectedCallIds.length} call record(s)? This cannot be undone.`)) return
    router.delete('/twilio/calls/bulk', {
      data: { ids: selectedCallIds },
      preserveScroll: true,
      preserveState: true,
      only: ['calls'],
      onSuccess: () => setSelectedCallIds([]),
    })
  }

  // Wires up per-call lifecycle events (accept/disconnect/cancel/reject/error).
  // These live on the Call object returned by connect()/incoming — the Device
  // itself has no 'connect' or 'disconnect' event.
  const bindCallEvents = (call) => {
    call.on('accept', () => {
      setCallState('connected')
      setShowInCallKeypad(true)
      startTimer()
    })
    const endThisCall = () => {
      connectionRef.current = null
      endCallState()
    }
    call.on('disconnect', endThisCall)
    call.on('cancel', endThisCall)
    call.on('reject', endThisCall)
    call.on('error', (err) => {
      console.warn('Call error:', err)
      toast.error(`Call error: ${err.message || 'Unable to connect audio for this call.'}`)
      connectionRef.current = null
      setCallState('idle')
    })
  }

  // ─── Twilio Device Setup ──────────────────────────────────────────────────────
  useEffect(() => {
    if (twilioSetting) {
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
      setDeviceError(null)
      const res = await fetch('/twilio/token')
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}))
        const errMsg = errData.error ?? 'Verification failed.'
        setDeviceError(errMsg)
        toast.error(`Dialer calling setup failed: ${errMsg}`)
        setIsSoftphone(false)
        return
      }
      
      const { token } = await res.json()
      if (!token) {
        setDeviceError('No voice token received from server.')
        toast.error('Dialer calling setup failed: No token returned.')
        setIsSoftphone(false)
        return
      }

      setIsSoftphone(true)

      const device = new Device(token, {
        debug: true,
        codecPreferences: ['opus', 'pcmu'],
      })

      device.register()

      device.on('registered', () => {
        console.log('Embedded Twilio Softphone Registered & Ready')
        if (selectedOutputId && device.audio?.isOutputSelectionSupported) {
          device.audio.speakerDevices.set(selectedOutputId).catch(e => console.warn('Failed to set speaker device:', e))
        }
      })

      device.on('error', (err) => {
        console.warn('Embedded Dialer Device Error:', err)
        setDeviceError(err.message || 'Dialer connection error.')
        toast.error(`Dialer connection error: ${err.message || 'Please check your calling settings configuration.'}`)
        setCallState('idle')
        reportError({
          message: `Twilio Device error: ${err.message || err.code || 'unknown'}`,
          context: { code: err.code, source: 'Twilio/Index dialer' },
        })
      })

      // NOTE: Device itself only ever emits error/incoming/registered/unregistered/
      // tokenWillExpire — 'connect' and 'disconnect' are events on the individual
      // Call object, not the Device. bindCallEvents() wires those up per-call.
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

      device.on('incoming', (conn) => {
        setCallState('ringing')
        connectionRef.current = conn
        bindCallEvents(conn)
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
    if (timerRef.current) {
      clearInterval(timerRef.current)
    }
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
    setCallState('idle')
    setCallDuration(0)
    setShowInCallKeypad(false)
    router.reload({ only: ['calls'] })
  }

  const triggerCall = (phone) => {
    if (!phone) return
    setDialNumber(phone)
    setActiveMockupTab('keypad')
    toast.info(`Pre-filled dialer with ${phone}`)
  }

  // `numberOverride` lets callers (e.g. the Leads tab's "Call" button) dial
  // immediately without waiting on the `dialNumber` state to re-render first.
  const handleCall = async (numberOverride) => {
    const to = (numberOverride ?? dialNumber).trim()
    if (!to) {
      toast.error('Please enter a phone number.')
      return
    }
    setDialNumber(to)

    if (isSoftphone && deviceRef.current) {
      setCallState('connecting')
      try {
        await navigator.mediaDevices.getUserMedia({
          audio: selectedInputId ? { deviceId: { exact: selectedInputId } } : true,
        }).then(stream => {
          stream.getTracks().forEach(track => track.stop())
        })
      } catch (e) {
        console.error('Microphone permission denied or unavailable:', e)
        toast.error('Microphone access is blocked. Please allow microphone permissions for this site in your browser settings and try again.')
        setCallState('idle')
        return
      }

      if (selectedInputId && deviceRef.current.audio) {
        try {
          await deviceRef.current.audio.setInputDevice(selectedInputId)
        } catch (e) {
          console.warn('Failed to set input device before call, using default:', e)
        }
      }

      try {
        const call = await deviceRef.current.connect({ params: { To: to } })
        connectionRef.current = call
        bindCallEvents(call)
      } catch (e) {
        console.error('Failed to start call:', e)
        toast.error('Failed to start the call.')
        setCallState('idle')
      }
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
          body: JSON.stringify({ to }),
        })
        const data = await res.json()
        if (res.ok) {
          toast.success('Ringing your phone to connect call...')
          setCallState('connected')
          setShowInCallKeypad(true)
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
    if (connectionRef.current) {
      try { connectionRef.current.disconnect() } catch {}
    }
    if (deviceRef.current) {
      try { deviceRef.current.disconnectAll() } catch {}
    }
    endCallState()
    toast.info('Call ended.')
  }

  const handleAccept = () => {
    if (connectionRef.current) {
      try {
        // Call state flips to 'connected' via the 'accept' listener bound in
        // bindCallEvents() when the incoming call arrived, not here.
        connectionRef.current.accept()
        toast.success('Call connected.')
      } catch (e) {
        console.error('Failed to accept incoming call:', e)
        toast.error('Failed to answer call.')
      }
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

  const openRecordingModal = (call) => {
    if (!call.recording_url) return
    setPlayerState({ isPlaying: false, currentTime: 0, duration: 0 })
    setRecordingModalCall(call)
  }

  const closeRecordingModal = () => {
    if (audioRef.current) {
      audioRef.current.pause()
    }
    setRecordingModalCall(null)
  }

  const togglePlayback = () => {
    if (!audioRef.current) return
    if (audioRef.current.paused) {
      audioRef.current.play()
    } else {
      audioRef.current.pause()
    }
  }

  const seekTo = (time) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time
    }
  }

  const skip = (deltaSecs) => {
    if (!audioRef.current) return
    audioRef.current.currentTime = Math.min(
      Math.max(0, audioRef.current.currentTime + deltaSecs),
      playerState.duration || 0
    )
  }

  const formatDuration = (secs) => {
    if (!secs) return '0s'
    const mins = Math.floor(secs / 60)
    const remaining = secs % 60
    return mins > 0 ? `${mins}m ${remaining}s` : `${remaining}s`
  }

  const formatTime = (secs) => {
    if (!Number.isFinite(secs)) return '00:00'
    const mins = Math.floor(secs / 60)
    const remaining = Math.floor(secs % 60)
    return `${mins.toString().padStart(2, '0')}:${remaining.toString().padStart(2, '0')}`
  }

  // ─── SMS Threads Inside Mockup ─────────────────────────────────────────────
  const getSmsThreads = () => {
    const threads = {}
    const msgList = messages?.data ?? []
    msgList.forEach(msg => {
      const partner = msg.direction === 'inbound' ? msg.from_number : msg.to_number
      if (!partner) return
      if (!threads[partner]) {
        threads[partner] = []
      }
      threads[partner].push(msg)
    })
    return threads
   }

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
         toast.success('SMS sent successfully.')
         setSmsMessage('')
         router.reload({ only: ['messages'] })
       } else {
         toast.error(data.error ?? 'Failed to send SMS.')
       }
     } catch {
       toast.error('Network error sending SMS.')
     } finally {
       setSendingSms(false)
     }
   }

  // ─── Audio Input/Output Device Selection ───────────────────────────────────
  const AUDIO_DEVICE_STORAGE_KEYS = { input: 'twilio_softphone_input_device', output: 'twilio_softphone_output_device' }

  // Resolve which device to use: keep the current selection if it's still connected,
  // otherwise fall back to the user's last saved choice, otherwise fall back to the
  // browser's "default" pseudo-device (which Windows keeps pointed at whatever device
  // is currently set as the system default — e.g. it switches to a headset when plugged in).
  const pickAudioDevice = (currentId, devices, storageKey) => {
    if (currentId && devices.some(d => d.deviceId === currentId)) return currentId
    const saved = typeof window !== 'undefined' ? window.localStorage.getItem(storageKey) : null
    if (saved && devices.some(d => d.deviceId === saved)) return saved
    const osDefault = devices.find(d => d.deviceId === 'default')
    return (osDefault ?? devices[0])?.deviceId ?? ''
  }

  const refreshAudioDevices = async () => {
    if (!navigator.mediaDevices?.enumerateDevices) return
    try {
      const devices = await navigator.mediaDevices.enumerateDevices()
      const inputs = devices.filter(d => d.kind === 'audioinput')
      const outputs = devices.filter(d => d.kind === 'audiooutput')
      setInputDevices(inputs)
      setOutputDevices(outputs)
      setSelectedInputId(prev => pickAudioDevice(prev, inputs, AUDIO_DEVICE_STORAGE_KEYS.input))
      setSelectedOutputId(prev => pickAudioDevice(prev, outputs, AUDIO_DEVICE_STORAGE_KEYS.output))
    } catch (e) {
      console.warn('Unable to list audio devices:', e)
    }
  }

  useEffect(() => {
    refreshAudioDevices()
    if (!navigator.mediaDevices?.addEventListener) return
    navigator.mediaDevices.addEventListener('devicechange', refreshAudioDevices)
    return () => navigator.mediaDevices.removeEventListener('devicechange', refreshAudioDevices)
  }, [])

  const handleInputDeviceChange = async (deviceId) => {
    setSelectedInputId(deviceId)
    window.localStorage.setItem(AUDIO_DEVICE_STORAGE_KEYS.input, deviceId)
    if (deviceRef.current?.audio) {
      try {
        await deviceRef.current.audio.setInputDevice(deviceId)
      } catch (e) {
        console.warn('Failed to switch input device:', e)
      }
    }
    // Restart the mic tester on the newly selected device so the waveform reflects it
    if (isMicTesting) {
      stopMicTest()
    }
  }

  const handleOutputDeviceChange = async (deviceId) => {
    setSelectedOutputId(deviceId)
    window.localStorage.setItem(AUDIO_DEVICE_STORAGE_KEYS.output, deviceId)
    if (deviceRef.current?.audio?.isOutputSelectionSupported) {
      try {
        await deviceRef.current.audio.speakerDevices.set(deviceId)
      } catch (e) {
        console.warn('Failed to switch output device:', e)
      }
    }
  }

  // ─── Voice Wave Visualizer & Audio Tester ──────────────────────────────────
  const startMicTest = async () => {
    if (isMicTesting) {
      stopMicTest()
      return
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: selectedInputId ? { deviceId: { exact: selectedInputId } } : true,
      })
      setMicStream(stream)
      refreshAudioDevices() // device labels are only populated after permission is granted

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
      if (!canvas || !analyser) return
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
        ctx.fillStyle = `rgba(124, 58, 237, ${Math.max(0.15, barHeight / 80)})` // Purple color (#7C3AED / brand-600)
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
  }, [isMicTesting, analyser, activeMockupTab])

  const playTestChime = async () => {
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

      const canSelectOutput = selectedOutputId && typeof HTMLMediaElement !== 'undefined'
        && typeof HTMLMediaElement.prototype.setSinkId === 'function'

      if (canSelectOutput) {
        const dest = ctx.createMediaStreamDestination()
        gain.connect(dest)
        const audioEl = new Audio()
        audioEl.srcObject = dest.stream
        await audioEl.setSinkId(selectedOutputId)
        await audioEl.play()
        setTimeout(() => {
          audioEl.pause()
          ctx.close()
        }, 700)
      } else {
        gain.connect(ctx.destination)
        setTimeout(() => ctx.close(), 700)
      }

      osc.start()
      osc.stop(ctx.currentTime + 0.5)
      toast.success('Test tone played.')
    } catch {
      toast.error('Audio context blocked.')
    }
  }

  // ─── Filter Lists ───────────────────────────────────────────────────────────
  const filteredCalls = (calls?.data ?? []).filter(call => {
    if (!callSearch) return true
    const fromNum = call.from_number ?? ''
    const toNum = call.to_number ?? ''
    return fromNum.includes(callSearch) || toNum.includes(callSearch)
  })

  const filteredMessages = (messages?.data ?? []).filter(msg => {
    if (!msgSearch) return true
    const fromNum = msg.from_number ?? ''
    const toNum = msg.to_number ?? ''
    const msgBody = msg.body ?? ''
    return fromNum.includes(msgSearch) || toNum.includes(msgSearch) || msgBody.toLowerCase().includes(msgSearch.toLowerCase())
  })

  const glassCard = {
    background: 'rgba(255, 255, 255, 0.9)',
    backdropFilter: 'blur(12px)',
    border: '1px solid rgba(241, 245, 249, 1)',
    boxShadow: '0 4px 20px rgba(0,0,0,0.015)'
  }

  return (
    <>
      <Head title="Dialer & Logs" />
      <AppLayout title="Dialer">
        {/* Header Section */}
        <div className="px-4 sm:px-6 pt-4 pb-5 border-b border-slate-100 bg-white flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-[20px] font-bold text-slate-800 tracking-tight">Dialer Hub</h1>
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
                Configure Settings
              </Button>
            </Link>
          </div>
        </div>

        {!twilioSetting ? (
          <div className="p-10 text-center max-w-lg mx-auto mt-10" style={glassCard}>
            <AlertCircle size={40} className="text-amber-500 mx-auto mb-3" />
            <h3 className="text-[16px] font-bold text-slate-800">Dialer is not configured</h3>
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
              <div className="lg:col-span-8 space-y-6 order-2 lg:order-1">
                {/* Quick dial dropdown card (Searchable) */}
                <div className="rounded-2xl p-4 flex flex-col sm:flex-row gap-3 items-center relative z-[40]" style={glassCard}>
                  <span className="text-[12.5px] font-semibold text-slate-500 shrink-0">Quick Dial Lead:</span>
                  <div className="relative w-full sm:w-80" ref={dropdownRef}>
                    <div className="relative">
                      <Search size={14} className="absolute left-3 top-2.5 text-slate-400" />
                      <Input
                        type="text"
                        placeholder="Search lead by name, email, or phone..."
                        value={leadSearchQuery}
                        onChange={e => {
                          setLeadSearchQuery(e.target.value)
                          setIsDropdownOpen(true)
                        }}
                        onFocus={() => setIsDropdownOpen(true)}
                        className="pl-9 text-xs h-9 rounded-xl pr-8 w-full border-slate-200 focus:border-brand-500 focus:ring-0 text-slate-700"
                      />
                      {(leadSearchQuery || selectedQuickLead) && (
                        <button
                          onClick={() => {
                            setLeadSearchQuery('')
                            setSelectedQuickLead('')
                            setIsDropdownOpen(false)
                          }}
                          className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                        >
                          <X size={14} />
                        </button>
                      )}
                    </div>

                    {isDropdownOpen && (
                      <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-150 rounded-xl shadow-lg max-h-60 overflow-y-auto z-50 divide-y divide-slate-50">
                        {searchResults.length === 0 ? (
                          <div className="p-3 text-xs text-slate-450 text-center">No matching leads found</div>
                        ) : (
                          searchResults.map(lead => (
                            <button
                              key={lead.id}
                              type="button"
                              onClick={() => {
                                if (!lead.phone) {
                                  toast.warning(`${lead.name} does not have a phone number.`)
                                  return
                                }
                                triggerCall(lead.phone)
                                setLeadSearchQuery(lead.name)
                                setSelectedQuickLead(lead.phone)
                                setIsDropdownOpen(false)
                              }}
                              className="w-full text-left p-2.5 hover:bg-slate-50 flex flex-col gap-0.5 transition-colors"
                            >
                              <div className="flex justify-between items-baseline w-full">
                                <span className="text-xs font-bold text-slate-700">{lead.name}</span>
                                {lead.phone ? (
                                  <span className="text-[10px] font-mono font-bold text-brand-600">{lead.phone}</span>
                                ) : (
                                  <span className="text-[10px] text-amber-600 font-semibold italic">No phone number</span>
                                )}
                              </div>
                              {lead.email && (
                                <span className="text-[10px] text-slate-400 truncate">{lead.email}</span>
                              )}
                            </button>
                          ))
                        )}
                      </div>
                    )}
                  </div>
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
                    {/* SMS Inbox disabled — incoming webhook needs a public HTTPS URL (APP_URL is localhost), so nothing was ever arriving here.
                    <button
                      onClick={() => setActiveTab('sms')}
                      className={cn(
                        'px-5 py-3 text-xs font-bold uppercase tracking-wider transition-all border-b-2',
                        activeTab === 'sms' ? 'border-brand-600 text-brand-600 bg-white' : 'border-transparent text-slate-400 hover:text-slate-600'
                      )}
                    >
                      SMS Inbox
                    </button>
                    */}
                    <button
                      onClick={() => setActiveTab('voicemails')}
                      className={cn(
                        'px-5 py-3 text-xs font-bold uppercase tracking-wider transition-all border-b-2',
                        activeTab === 'voicemails' ? 'border-brand-600 text-brand-600 bg-white' : 'border-transparent text-slate-400 hover:text-slate-600'
                      )}
                    >
                      Voicemails
                    </button>
                    <button
                      onClick={() => setActiveTab('leads')}
                      className={cn(
                        'px-5 py-3 text-xs font-bold uppercase tracking-wider transition-all border-b-2',
                        activeTab === 'leads' ? 'border-brand-600 text-brand-600 bg-white' : 'border-transparent text-slate-400 hover:text-slate-600'
                      )}
                    >
                      Leads
                    </button>
                  </div>

                  {/* 1. CALL LOGS */}
                  {activeTab === 'calls' && (
                    <div className="p-4 space-y-4 bg-white">
                      <div className="flex items-center justify-between gap-3 flex-wrap">
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
                        {can('twilio.delete') && selectedCallIds.length > 0 && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={deleteSelectedCalls}
                            className="h-9 text-xs rounded-xl border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                          >
                            <Trash2 size={13} className="mr-1.5" />
                            Delete {selectedCallIds.length} selected
                          </Button>
                        )}
                      </div>

                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs border-collapse">
                          <thead>
                            <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider">
                              {can('twilio.delete') && (
                                <th className="py-2.5 px-3 w-8">
                                  <Checkbox
                                    checked={filteredCalls.length > 0 && filteredCalls.every(c => selectedCallIds.includes(c.id))}
                                    onCheckedChange={() => toggleAllCallsSelected(filteredCalls.map(c => c.id))}
                                    aria-label="Select all calls"
                                  />
                                </th>
                              )}
                              <th className="py-2.5 px-3">Direction</th>
                              <th className="py-2.5 px-3">From</th>
                              <th className="py-2.5 px-3">To</th>
                              <th className="py-2.5 px-3">Agent</th>
                              <th className="py-2.5 px-3">Status</th>
                              <th className="py-2.5 px-3">Duration</th>
                              <th className="py-2.5 px-3">Date / Time</th>
                              <th className="py-2.5 px-3 text-right">Action</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-50">
                            {filteredCalls.map(call => (
                              <tr key={call.id} className="hover:bg-slate-50/50">
                                {can('twilio.delete') && (
                                  <td className="py-3 px-3">
                                    <Checkbox
                                      checked={selectedCallIds.includes(call.id)}
                                      onCheckedChange={() => toggleCallSelected(call.id)}
                                      aria-label={`Select call ${call.id}`}
                                    />
                                  </td>
                                )}
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
                                <td className="py-3 px-3 text-slate-600">
                                  {call.user ? (
                                    <Link href={route('settings.team.show', call.user.id)} className="hover:text-brand-600 hover:underline">
                                      {call.user.name}
                                    </Link>
                                  ) : '—'}
                                </td>
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
                                  <div className="flex items-center justify-end gap-1.5">
                                    {call.recording_url && (
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => openRecordingModal(call)}
                                        title="Play call recording"
                                        className="h-7 w-7 p-0 rounded-lg border-slate-200"
                                      >
                                        <Play size={12} />
                                      </Button>
                                    )}
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => triggerCall(call.direction === 'inbound' ? call.from_number : call.to_number)}
                                      className="h-7 text-[10px] rounded-lg border-slate-200"
                                    >
                                      Call Back
                                    </Button>
                                    {can('twilio.delete') && (
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => deleteCall(call)}
                                        title="Delete call record"
                                        className="h-7 w-7 p-0 rounded-lg border-slate-200 text-red-500 hover:bg-red-50 hover:text-red-600 hover:border-red-200"
                                      >
                                        <Trash2 size={12} />
                                      </Button>
                                    )}
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      <PaginationBar paginator={calls} pageParam="calls_page" onPageChange={goToPage} />
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
                      <PaginationBar paginator={messages} pageParam="messages_page" onPageChange={goToPage} />
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
                                    onClick={() => openRecordingModal(call)}
                                    className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-sm transition-all bg-brand-600 text-white hover:bg-brand-700"
                                  >
                                    <Play size={12} fill="white" className="ml-0.5" />
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

                  {/* 4. LEADS — browse leads by group/status, call one instantly */}
                  {activeTab === 'leads' && (
                    <div className="p-4 space-y-3 bg-white">
                      <div className="flex flex-wrap items-center gap-2">
                        <div className="relative flex-1 min-w-[160px] max-w-xs">
                          <Search size={14} className="absolute left-3 top-2.5 text-slate-400" />
                          <Input
                            placeholder="Search leads..."
                            value={leadsTabSearch}
                            onChange={e => setLeadsTabSearch(e.target.value)}
                            className="pl-9 text-xs h-9 rounded-xl"
                          />
                        </div>

                        <Select value={leadsTabGroup} onValueChange={setLeadsTabGroup}>
                          <SelectTrigger className="h-9 w-auto gap-1.5 text-xs rounded-xl border-slate-200">
                            <UsersRound size={13} className="opacity-60" />
                            <SelectValue placeholder="Any group" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all" className="text-xs">All groups</SelectItem>
                            {(leadGroups ?? []).map(g => (
                              <SelectItem key={g.id} value={String(g.id)} className="text-xs">{g.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>

                        <Select value={leadsTabStatus} onValueChange={setLeadsTabStatus}>
                          <SelectTrigger className="h-9 w-auto gap-1.5 text-xs rounded-xl border-slate-200">
                            <SelectValue placeholder="Any status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all" className="text-xs">All statuses</SelectItem>
                            {LEAD_STATUS_OPTIONS.map(s => (
                              <SelectItem key={s.value} value={s.value} className="text-xs">{s.label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>

                        <span className="text-[11px] text-slate-400 ml-auto">
                          {leadsTabLoading ? 'Loading…' : `${leadsTabResults.length} lead${leadsTabResults.length !== 1 ? 's' : ''}`}
                        </span>
                      </div>

                      <div className="border border-slate-100 rounded-xl divide-y divide-slate-50 max-h-[420px] overflow-y-auto">
                        {leadsTabResults.length === 0 ? (
                          <div className="py-10 text-center text-slate-400">
                            <UsersRound size={22} className="mx-auto mb-2 text-slate-300" />
                            <p className="text-xs">{leadsTabLoading ? 'Loading leads…' : 'No leads match these filters.'}</p>
                          </div>
                        ) : (
                          leadsTabResults.map(lead => {
                            const contactedViaCall = !!lead.contact_channels?.call
                            const hasName = !!lead.name?.trim()
                            const displayName = hasName ? lead.name : (lead.company || 'Unnamed Lead')
                            const subtitleParts = [lead.phone || 'No phone']
                            if (hasName && lead.company) subtitleParts.push(lead.company)
                            return (
                              <div
                                key={lead.id}
                                role="button"
                                tabIndex={0}
                                onClick={() => router.visit(route('leads.show', lead.id))}
                                onKeyDown={e => { if (e.key === 'Enter') router.visit(route('leads.show', lead.id)) }}
                                className="flex flex-wrap items-center gap-2.5 px-3 py-2.5 hover:bg-slate-50/60 transition-colors cursor-pointer"
                              >
                                <div className="min-w-0 flex-1">
                                  <p className="text-[12.5px] font-bold text-slate-700 truncate">{displayName}</p>
                                  <p className="text-[10.5px] text-slate-400 truncate">
                                    {subtitleParts.join(' · ')}
                                  </p>
                                </div>

                                {lead.groups?.length > 0 && (
                                  <div className="hidden sm:flex items-center gap-1">
                                    {lead.groups.slice(0, 2).map(g => (
                                      <span
                                        key={g.id}
                                        className="text-[9.5px] font-semibold px-1.5 py-0.5 rounded-full border whitespace-nowrap"
                                        style={{
                                          background: (g.color ?? '#6366f1') + '18',
                                          borderColor: (g.color ?? '#6366f1') + '40',
                                          color: g.color ?? '#6366f1',
                                        }}
                                      >
                                        {g.name}
                                      </span>
                                    ))}
                                  </div>
                                )}

                                <div onClick={e => e.stopPropagation()}>
                                  <Select value={lead.status} onValueChange={v => changeLeadStatus(lead, v)}>
                                    <SelectTrigger className="h-7 w-auto gap-1 text-[11px] border-0 bg-transparent shadow-none focus:ring-0 px-1 [&>svg]:w-3 [&>svg]:h-3 [&>svg]:opacity-40">
                                      <StatusBadge status={lead.status} size="sm" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {LEAD_STATUS_OPTIONS.map(s => (
                                        <SelectItem key={s.value} value={s.value} className="text-xs">{s.label}</SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </div>

                                <div className="flex items-center gap-1 shrink-0" onClick={e => e.stopPropagation()}>
                                  <Button
                                    size="sm"
                                    onClick={() => callLeadNow(lead)}
                                    disabled={!lead.phone}
                                    title={lead.phone ? `Call ${lead.phone}` : 'No phone number'}
                                    className="h-7 w-7 p-0 rounded-lg bg-emerald-600 hover:bg-emerald-700 disabled:opacity-30"
                                  >
                                    <PhoneCall size={12} />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => markLeadContactedViaCall(lead)}
                                    disabled={markingContactedId === lead.id}
                                    title={contactedViaCall ? 'Contacted via call — click to unmark' : 'Mark contacted via call'}
                                    className={cn(
                                      'h-7 gap-1 text-[10px] rounded-lg px-2',
                                      contactedViaCall ? 'border-brand-200 bg-brand-50 text-brand-700' : 'border-slate-200 text-slate-500'
                                    )}
                                  >
                                    <CheckCircle2 size={11} /> {contactedViaCall ? 'Contacted' : 'Mark'}
                                  </Button>
                                </div>
                              </div>
                            )
                          })
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Right Column: Embedded Smartphone Dialer & Voice Tester (4 columns) */}
              <div className="lg:col-span-4 space-y-6 flex flex-col items-center order-1 lg:order-2">

                {/* iPhone Pro Mockup Container (Purple Metallic Frame) */}
                <div 
                  className="w-[280px] bg-white rounded-[44px] overflow-hidden flex flex-col relative select-none"
                  style={{
                    border: '6px solid rgb(var(--brand-600, 124 58 237))', // Thinner premium purple metallic frame matching CRM theme
                    boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.15), 0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 35px rgba(var(--brand-600) / 0.15)'
                  }}
                >
                  {/* Phone screen inside bezel */}
                  <div className="bg-white flex flex-col h-[460px] relative w-full">
                    
                    {/* Active call overlay screen */}
                      {callState !== 'idle' && (
                        <div className="absolute inset-0 bg-slate-900 text-white flex flex-col justify-between p-6 z-[60] animate-in fade-in zoom-in duration-200">
                          {/* Status bar mock */}
                          <div className="flex justify-between items-center text-[9px] font-bold text-slate-400 uppercase tracking-wider mt-4">
                            <span>{isSoftphone ? 'Softphone' : 'Click-to-Call'}</span>
                            <span>Dialer</span>
                          </div>

                          {/* Caller Info */}
                          <div className="flex flex-col items-center mt-6">
                            <div className="w-16 h-16 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-xl font-bold text-slate-200 shadow-inner">
                              {dialNumber ? dialNumber.replace(/[^0-9]/g, '').slice(-4) : 'User'}
                            </div>
                            <h3 className="text-sm font-bold mt-3 text-slate-100 truncate max-w-[200px]">
                              {dialNumber || 'Unknown Caller'}
                            </h3>
                            <p className="text-[10px] text-slate-400 mt-1 uppercase tracking-wider animate-pulse">
                              {callState === 'connected' ? `Connected: ${formatTime(callDuration)}` : `${callState}...`}
                            </p>
                          </div>

                          {/* Mid Visualizer / In-Call Keypad (if connected) */}
                          <div className="flex-1 flex flex-col items-center justify-center my-4">
                            {callState === 'connected' && showInCallKeypad ? (
                              <>
                                <div className="grid grid-cols-3 gap-x-3.5 gap-y-2 justify-items-center">
                                  {['1', '2', '3', '4', '5', '6', '7', '8', '9', '*', '0', '#'].map(num => (
                                    <button
                                      key={num}
                                      type="button"
                                      disabled={!isSoftphone}
                                      onClick={() => addKey(num)}
                                      className="w-9 h-9 rounded-full bg-slate-800 hover:bg-slate-700 active:scale-95 transition-all flex items-center justify-center border border-slate-700 text-[13px] font-bold text-slate-100 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-slate-800"
                                    >
                                      {num}
                                    </button>
                                  ))}
                                </div>
                                {!isSoftphone && (
                                  <p className="text-[9.5px] text-amber-400 text-center mt-3 max-w-[200px] leading-snug">
                                    This call is bridged to your real phone — press keys on that phone to navigate IVR menus, not here.
                                  </p>
                                )}
                              </>
                            ) : callState === 'connected' && (
                              <div className="flex items-center gap-1">
                                <span className="w-1 h-4 bg-brand-400 rounded-full animate-pulse" />
                                <span className="w-1 h-6 bg-brand-500 rounded-full animate-pulse delay-75" />
                                <span className="w-1 h-3 bg-brand-300 rounded-full animate-pulse delay-150" />
                              </div>
                            )}
                          </div>

                          {/* Controls */}
                          <div className="flex flex-col items-center gap-4 mb-4">
                            {callState === 'ringing' ? (
                              <div className="flex gap-8 justify-center w-full">
                                {/* Decline Button */}
                                <button
                                  type="button"
                                  onClick={handleHangup}
                                  className="w-12 h-12 rounded-full bg-red-600 hover:bg-red-700 active:scale-95 transition-all flex items-center justify-center shadow-lg text-white"
                                >
                                  <PhoneOff size={16} />
                                </button>
                                {/* Accept Button */}
                                <button
                                  type="button"
                                  onClick={handleAccept}
                                  className="w-12 h-12 rounded-full bg-emerald-600 hover:bg-emerald-700 active:scale-95 transition-all flex items-center justify-center shadow-lg text-white"
                                >
                                  <PhoneCall size={16} />
                                </button>
                              </div>
                            ) : (
                              <div className="flex gap-6 justify-center w-full">
                                {/* Keypad Toggle (DTMF digits for IVR menus) */}
                                {callState === 'connected' && (
                                  <button
                                    type="button"
                                    onClick={() => setShowInCallKeypad(v => !v)}
                                    title="Keypad"
                                    className={cn(
                                      "w-11 h-11 rounded-full active:scale-95 transition-all flex items-center justify-center border border-slate-700",
                                      showInCallKeypad ? "bg-brand-600 text-white" : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                                    )}
                                  >
                                    <Grid3x3 size={16} />
                                  </button>
                                )}
                                {/* Mute Button */}
                                {isSoftphone && (
                                  <button
                                    type="button"
                                    onClick={toggleMute}
                                    className={cn(
                                      "w-11 h-11 rounded-full active:scale-95 transition-all flex items-center justify-center border border-slate-700",
                                      isMuted ? "bg-amber-500 text-white" : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                                    )}
                                  >
                                    {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
                                  </button>
                                )}
                                {/* End Call Button */}
                                <button
                                  type="button"
                                  onClick={handleHangup}
                                  className="w-12 h-12 rounded-full bg-red-600 hover:bg-red-700 active:scale-95 transition-all flex items-center justify-center shadow-lg text-white"
                                >
                                  <PhoneOff size={16} />
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    
                    {/* iPhone Dynamic Island */}
                    <div className="absolute top-2 left-1/2 -translate-x-1/2 w-16 h-3.5 bg-black rounded-full z-50 shadow-inner" />

                    {/* Screen Header (Pushed down for Dynamic Island) */}
                    <div className="pt-7 px-4 pb-2 bg-slate-50 border-b border-slate-100 flex items-center justify-between shrink-0">
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                        {isSoftphone ? 'Softphone' : 'Click-to-Call'}
                      </span>
                      <span className="text-[9px] text-brand-600 font-extrabold uppercase tracking-wider">Dialer</span>
                    </div>

                    {/* Active call duration display */}
                    {callState !== 'idle' && (
                      <div className={cn(
                        "px-4 py-2 flex justify-between items-center text-[10px] font-bold border-b border-slate-100 shrink-0",
                        callState === 'connected' ? "bg-emerald-50 text-emerald-700" : "bg-brand-50 text-brand-700"
                      )}>
                        <span className="animate-pulse">{callState === 'connected' ? `Connected: ${formatTime(callDuration)}` : `${callState}...`}</span>
                        <span className="font-mono text-[9px]">{dialNumber}</span>
                      </div>
                    )}

                    {/* Dialer Screen Area (Scrollable Viewport) */}
                    <div className="flex-1 overflow-y-auto min-h-0 bg-white relative">
                      
                      {/* 1. KEYPAD TAB */}
                      {activeMockupTab === 'keypad' && (
                        <div className="p-3.5 flex flex-col justify-between h-full min-h-[350px]">
                          {/* Identity Display */}
                          <div className="w-full text-center pb-1.5 border-b border-slate-100">
                            <span className="text-[8.5px] font-bold text-slate-400 uppercase tracking-wider block">Agent Line</span>
                            <span className="text-[12px] font-bold text-slate-700 block truncate mt-0.5">{user?.name ?? 'Agent'}</span>
                          </div>

                          {/* Input Box */}
                          <div className="w-full flex items-center justify-between bg-slate-50 border border-slate-100 rounded-xl px-3 py-1.5 mt-2">
                            <input
                              type="text"
                              value={dialNumber}
                              onChange={e => setDialNumber(e.target.value)}
                              placeholder="Dial number..."
                              disabled={callState !== 'idle'}
                              className="bg-transparent border-none text-[15px] font-bold tracking-wider w-full focus:outline-none focus:ring-0 text-slate-800 placeholder-slate-300 p-0 h-6"
                            />
                            {dialNumber && callState === 'idle' && (
                              <button onClick={deleteKey} className="text-slate-400 hover:text-slate-600 transition-colors p-0.5">
                                <Delete size={13} />
                              </button>
                            )}
                          </div>

                          {/* Numeric Keypad Grid */}
                          <div className="grid grid-cols-3 gap-x-4 gap-y-2 my-2.5 justify-items-center">
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
                                className="w-[40px] h-[40px] rounded-full bg-slate-50 hover:bg-slate-100 active:scale-95 transition-all flex flex-col items-center justify-center border border-slate-100/60"
                              >
                                <span className="text-[14px] font-bold text-slate-700 leading-none">{num}</span>
                                {letters && <span className="text-[7px] font-bold text-slate-400 uppercase mt-0.5">{letters}</span>}
                              </button>
                            ))}
                          </div>

                          {/* Call Control Button */}
                          <div className="w-full flex justify-center">
                            {callState === 'idle' ? (
                              <button
                                type="button"
                                onClick={() => handleCall()}
                                className="w-11 h-11 rounded-full bg-brand-600 hover:bg-brand-700 active:scale-95 transition-all flex items-center justify-center shadow-md shadow-brand-600/10 text-white"
                              >
                                <PhoneCall size={16} />
                              </button>
                            ) : (
                              <div className="flex gap-3">
                                {isSoftphone && (
                                  <button
                                    type="button"
                                    onClick={toggleMute}
                                    className={cn(
                                      "w-10 h-10 rounded-full active:scale-95 transition-all flex items-center justify-center border border-slate-200",
                                      isMuted ? "bg-amber-500 text-white" : "bg-slate-50 text-slate-600 hover:bg-slate-100"
                                    )}
                                  >
                                    {isMuted ? <VolumeX size={15} /> : <Volume2 size={15} />}
                                  </button>
                                )}
                                <button
                                  type="button"
                                  onClick={handleHangup}
                                  className="w-11 h-11 rounded-full bg-red-600 hover:bg-red-700 active:scale-95 transition-all flex items-center justify-center shadow-sm text-white"
                                >
                                  <PhoneOff size={16} />
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* 2. RECENT LOGS TAB */}
                      {activeMockupTab === 'recent' && (
                        <div className="p-3 divide-y divide-slate-50 h-full overflow-y-auto">
                          {filteredCalls.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-48 text-center px-4">
                              <Clock size={20} className="text-slate-350 mb-1.5" />
                              <p className="text-[11px] font-semibold text-slate-400">No call history</p>
                            </div>
                          ) : (
                            filteredCalls.map(call => (
                              <div key={call.id} className="py-2.5 flex items-center justify-between gap-2">
                                <div className="min-w-0 flex-1">
                                  <p className="text-[11px] font-bold text-slate-700 truncate">
                                    {call.direction === 'inbound' ? call.from_number : call.to_number}
                                  </p>
                                  <span className={cn(
                                    "text-[8px] font-bold uppercase tracking-wider",
                                    call.direction === 'inbound' ? "text-blue-500" : "text-purple-500"
                                  )}>
                                    {call.direction} • {formatDuration(call.duration)}
                                  </span>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => triggerCall(call.direction === 'inbound' ? call.from_number : call.to_number)}
                                  className="w-6.5 h-6.5 rounded-lg bg-slate-50 hover:bg-slate-100 flex items-center justify-center border border-slate-100"
                                >
                                  <PhoneCall size={9.5} className="text-slate-550" />
                                </button>
                              </div>
                            ))
                          )}
                        </div>
                      )}

                      {/* 3. MESSAGES TAB */}
                      {activeMockupTab === 'messages' && (
                        <div className="h-full flex flex-col bg-slate-50/50">
                          {activeSmsNumber ? (
                            <div className="flex-1 flex flex-col min-h-0 bg-white">
                              {/* Header */}
                              <div className="px-3 py-2 border-b border-slate-100 flex items-center justify-between shrink-0 bg-slate-50">
                                <button type="button" onClick={() => setActiveSmsNumber('')} className="text-[10px] text-brand-600 hover:underline font-bold">
                                  ← Back
                                </button>
                                <span className="text-[10px] font-bold text-slate-700 truncate max-w-[130px]">{activeSmsNumber}</span>
                                <div className="w-8" />
                              </div>

                              {/* Message List */}
                              <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
                                {(messages?.data ?? [])
                                  .filter(msg => msg.from_number === activeSmsNumber || msg.to_number === activeSmsNumber)
                                  .slice()
                                  .reverse()
                                  .map(msg => {
                                    const isInbound = msg.direction === 'inbound'
                                    return (
                                      <div key={msg.id} className={cn('flex flex-col max-w-[85%]', isInbound ? 'mr-auto items-start' : 'ml-auto items-end')}>
                                        <div className={cn(
                                          'rounded-2xl px-3 py-1.5 text-[11px] leading-relaxed',
                                          isInbound ? 'bg-slate-100 text-slate-800 rounded-tl-none' : 'bg-brand-600 text-white rounded-tr-none'
                                        )}>
                                          {msg.body}
                                        </div>
                                        <span className="text-[7.5px] text-slate-400 mt-0.5 px-1 font-mono">
                                          {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                      </div>
                                    )
                                  })}
                              </div>

                              {/* Compose compose Box */}
                              <form onSubmit={handleSendSms} className="p-2 border-t border-slate-100 bg-white flex gap-1.5 items-center shrink-0">
                                <input
                                  type="text"
                                  value={smsMessage}
                                  onChange={e => setSmsMessage(e.target.value)}
                                  placeholder="Message..."
                                  className="bg-slate-50 border border-slate-150 rounded-xl text-[11px] px-3 py-1.5 flex-1 focus:outline-none focus:border-brand-500 focus:ring-0 text-slate-850 h-7.5"
                                />
                                <button
                                  type="submit"
                                  disabled={sendingSms || !smsMessage.trim()}
                                  className="w-7.5 h-7.5 rounded-xl bg-brand-600 hover:bg-brand-700 flex items-center justify-center shrink-0 disabled:opacity-45 text-white"
                                >
                                  <Send size={11} />
                                </button>
                              </form>
                            </div>
                          ) : (
                            <div className="p-3 divide-y divide-slate-50 h-full overflow-y-auto bg-white">
                              {Object.keys(getSmsThreads()).length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-48 text-center px-4">
                                  <MessageSquare size={20} className="text-slate-350 mb-1.5" />
                                  <p className="text-[11px] font-semibold text-slate-400">No messages</p>
                                </div>
                              ) : (
                                Object.entries(getSmsThreads()).map(([phone, msgs]) => {
                                  const lastMsg = msgs[0]
                                  return (
                                    <div
                                      key={phone}
                                      onClick={() => setActiveSmsNumber(phone)}
                                      className="py-2 flex items-start gap-2.5 cursor-pointer hover:bg-slate-50 px-1.5 rounded-xl transition-all"
                                    >
                                      <div className="w-7.5 h-7.5 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 shrink-0 font-bold text-[10px]">
                                        {phone.slice(-2)}
                                      </div>
                                      <div className="min-w-0 flex-1">
                                        <div className="flex justify-between items-baseline">
                                          <span className="text-[11.5px] font-bold text-slate-700 truncate">{phone}</span>
                                          <span className="text-[8px] text-slate-400 font-mono">
                                            {new Date(lastMsg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                          </span>
                                        </div>
                                        <p className="text-[10px] text-slate-500 truncate mt-0.5">{lastMsg.body}</p>
                                      </div>
                                    </div>
                                  )
                                })
                              )}
                            </div>
                          )}
                        </div>
                      )}

                      {/* 4. VOICE TESTER TAB */}
                      {activeMockupTab === 'voicemail' && (
                        <div className="p-3.5 space-y-3.5 text-[11px] h-full overflow-y-auto">
                          <div>
                            <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[9.5px]">Voice & Mic Tester</h4>
                            <p className="text-[10px] text-slate-400 leading-relaxed mt-0.5">
                              Verify browser microphone permissions, test speaker output, and view live frequencies.
                            </p>
                          </div>

                          {/* Input / Output Device Selection */}
                          <div className="space-y-1.5">
                            <div>
                              <label className="text-[8.5px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                                <Mic size={9} /> Microphone
                              </label>
                              <select
                                value={selectedInputId}
                                onChange={e => handleInputDeviceChange(e.target.value)}
                                className="w-full mt-0.5 h-7.5 text-[10px] rounded-lg border border-slate-200 bg-white px-2 text-slate-700 focus:outline-none focus:border-brand-500"
                              >
                                {inputDevices.length === 0 && <option value="">No microphone detected</option>}
                                {inputDevices.map((d, i) => (
                                  <option key={d.deviceId || i} value={d.deviceId}>
                                    {d.label || `Microphone ${i + 1}`}
                                  </option>
                                ))}
                              </select>
                            </div>
                            <div>
                              <label className="text-[8.5px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                                <Volume2 size={9} /> Speaker
                              </label>
                              <select
                                value={selectedOutputId}
                                onChange={e => handleOutputDeviceChange(e.target.value)}
                                className="w-full mt-0.5 h-7.5 text-[10px] rounded-lg border border-slate-200 bg-white px-2 text-slate-700 focus:outline-none focus:border-brand-500"
                              >
                                {outputDevices.length === 0 && <option value="">No speaker detected</option>}
                                {outputDevices.map((d, i) => (
                                  <option key={d.deviceId || i} value={d.deviceId}>
                                    {d.label || `Speaker ${i + 1}`}
                                  </option>
                                ))}
                              </select>
                            </div>
                          </div>

                          {/* Frequency Visualizer Canvas */}
                          <div className="relative">
                            <canvas
                              ref={canvasRef}
                              width={240}
                              height={50}
                              className="w-full h-12 bg-slate-50 rounded-xl border border-slate-100 overflow-hidden"
                            />
                            {!isMicTesting && (
                              <div className="absolute inset-0 flex items-center justify-center bg-slate-50/70 rounded-xl text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                                Waveform Inactive
                              </div>
                            )}
                          </div>

                          <div className="flex gap-2">
                            <Button
                              type="button"
                              onClick={startMicTest}
                              variant={isMicTesting ? 'destructive' : 'outline'}
                              className="flex-1 h-8 text-[10px] rounded-lg"
                            >
                              {isMicTesting ? 'Stop Mic' : 'Test Mic'}
                            </Button>
                            <Button
                              type="button"
                              onClick={playTestChime}
                              variant="outline"
                              className="flex-1 h-8 text-[10px] rounded-lg border-slate-200"
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
                              <Label htmlFor="loopback_toggle" className="text-[10px] text-slate-650 font-semibold cursor-pointer select-none">
                                Listen Back (Loopback)
                              </Label>
                            </div>
                          )}
                        </div>
                      )}

                      {/* 5. SETTINGS TAB */}
                      {activeMockupTab === 'settings' && (
                        <div className="p-3.5 space-y-3.5 text-[11.5px] h-full overflow-y-auto">
                          {deviceError ? (
                            <div className="bg-red-50 border border-red-100 p-2.5 rounded-xl flex flex-col gap-1.5 animate-in fade-in duration-200">
                              <div className="flex items-center gap-2 text-red-700 font-bold">
                                <AlertCircle size={14} className="shrink-0 text-red-500" />
                                <h4>Voice Connection Error</h4>
                              </div>
                              <p className="text-[10px] text-red-600/90 leading-relaxed font-medium">
                                {deviceError}
                              </p>
                              <Link href="/profile?tab=twilio" className="text-[10px] text-brand-650 hover:underline font-bold mt-0.5">
                                Fix settings in profile →
                              </Link>
                            </div>
                          ) : (
                            <div className="bg-slate-50 border border-slate-100 p-2.5 rounded-xl flex items-center gap-2.5">
                              <div className="w-6 h-6 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600 font-bold text-[12px] border border-emerald-100 shrink-0">
                                ✓
                              </div>
                              <div>
                                <h4 className="font-bold text-slate-700">Dialer Active</h4>
                                <p className="text-[9.5px] text-emerald-600 font-medium">Ready for calls and SMS</p>
                              </div>
                            </div>
                          )}

                          <div className="space-y-2.5">
                            <div>
                              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Line Number</span>
                              <span className="text-[11.5px] font-mono font-semibold text-slate-700 block mt-0.5">{twilioSetting?.phone_number}</span>
                            </div>

                            <div>
                              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Calling Method</span>
                              <span className="text-[11px] font-semibold text-slate-700 block mt-0.5 capitalize">
                                {isSoftphone ? 'Softphone (Browser)' : 'Click-to-Call (Bridged)'}
                              </span>
                            </div>
                          </div>
                        </div>
                      )}

                    </div>

                    {/* Bottom Tab Bar selector inside mockup */}
                    <div className="flex h-[52px] pb-2 pt-1.5 border-t border-slate-100 shrink-0 bg-slate-50/50">
                      {[
                        { id: 'keypad', label: 'Keypad', icon: Phone },
                        { id: 'recent', label: 'Recent', icon: Clock },
                        // SMS disabled — see note above the "SMS Inbox" tab
                        // { id: 'messages', label: 'SMS', icon: MessageSquare },
                        { id: 'voicemail', label: 'Voice', icon: Volume2 },
                        { id: 'settings', label: 'Status', icon: HelpCircle },
                      ].map(tabItem => {
                        const Icon = tabItem.icon
                        const isActive = activeMockupTab === tabItem.id
                        return (
                          <button
                            key={tabItem.id}
                            type="button"
                            onClick={() => setActiveMockupTab(tabItem.id)}
                            className={cn(
                              'flex-1 flex flex-col items-center justify-center gap-0.5 transition-colors border-t-2',
                              isActive ? 'border-brand-500 text-brand-600 bg-white' : 'border-transparent text-slate-400 hover:text-slate-600'
                            )}
                          >
                            <Icon size={12} />
                            <span className="text-[8px] font-bold tracking-wide uppercase leading-none">{tabItem.label}</span>
                          </button>
                        )
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </AppLayout>

      <Dialog open={!!recordingModalCall} onOpenChange={(open) => !open && closeRecordingModal()}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Call Recording</DialogTitle>
            <DialogDescription>
              {recordingModalCall && (
                <>
                  {recordingModalCall.direction === 'inbound'
                    ? `From ${recordingModalCall.from_number}`
                    : `To ${recordingModalCall.to_number}`}
                  {' · '}
                  {new Date(recordingModalCall.created_at).toLocaleString()}
                </>
              )}
            </DialogDescription>
          </DialogHeader>

          {recordingModalCall && (
            <div className="space-y-4">
              <audio
                ref={audioRef}
                src={`/twilio/calls/${recordingModalCall.id}/recording`}
                autoPlay
                onLoadedMetadata={e => setPlayerState(s => ({ ...s, duration: Number.isFinite(e.target.duration) ? e.target.duration : 0 }))}
                onDurationChange={e => setPlayerState(s => ({ ...s, duration: Number.isFinite(e.target.duration) ? e.target.duration : s.duration }))}
                onTimeUpdate={e => setPlayerState(s => ({ ...s, currentTime: Number.isFinite(e.target.currentTime) ? e.target.currentTime : s.currentTime }))}
                onPlay={() => setPlayerState(s => ({ ...s, isPlaying: true }))}
                onPause={() => setPlayerState(s => ({ ...s, isPlaying: false }))}
                onEnded={() => setPlayerState(s => ({ ...s, isPlaying: false, currentTime: 0 }))}
                className="hidden"
              />

              <div className="space-y-1.5">
                <input
                  type="range"
                  min={0}
                  max={playerState.duration || 0}
                  step={0.1}
                  value={Math.min(playerState.currentTime, playerState.duration || 0)}
                  onChange={e => seekTo(Number(e.target.value))}
                  className="w-full accent-brand-600 cursor-pointer"
                />
                <div className="flex justify-between text-[11px] text-slate-500 font-mono">
                  <span>{formatTime(Math.floor(playerState.currentTime))}</span>
                  <span>{formatTime(Math.floor(playerState.duration || 0))}</span>
                </div>
              </div>

              <div className="flex items-center justify-center gap-4">
                <Button variant="outline" size="icon" className="h-10 w-10 rounded-full" onClick={() => skip(-10)} title="Back 10s">
                  <RotateCcw size={16} />
                </Button>
                <Button
                  size="icon"
                  className="h-14 w-14 rounded-full bg-brand-600 hover:bg-brand-700"
                  onClick={togglePlayback}
                >
                  {playerState.isPlaying ? <Pause size={20} fill="white" /> : <Play size={20} fill="white" className="ml-0.5" />}
                </Button>
                <Button variant="outline" size="icon" className="h-10 w-10 rounded-full" onClick={() => skip(10)} title="Forward 10s">
                  <RotateCw size={16} />
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
