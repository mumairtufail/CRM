import { useState, useEffect } from 'react'
import { Popover, PopoverTrigger, PopoverContent } from '@/Components/ui/popover'
import { Check } from 'lucide-react'
import { toast } from 'sonner'

// Keep in sync with LeadController::CONTACT_CHANNELS (PHP).
export const CONTACT_CHANNELS = [
  { key: 'mail',      label: 'Email',      verb: 'via', letter: '@',  bg: '#6366f1' },
  { key: 'call',      label: 'Phone Call', verb: 'via', letter: 'ph', bg: '#0d9488' },
  { key: 'linkedin',  label: 'LinkedIn',   verb: 'on',  letter: 'in', bg: '#0A66C2' },
  { key: 'instagram', label: 'Instagram',  verb: 'on',  letter: 'ig', bg: '#E1306C' },
  { key: 'facebook',  label: 'Facebook',   verb: 'on',  letter: 'fb', bg: '#1877F2' },
  { key: 'whatsapp',  label: 'WhatsApp',   verb: 'on',  letter: 'wa', bg: '#25D366' },
  { key: 'reddit',    label: 'Reddit',     verb: 'on',  letter: 're', bg: '#FF4500' },
  { key: 'social',    label: 'Social / X', verb: 'on',  letter: 'X',  bg: '#0f172a' },
]

const csrf = () => document.querySelector('meta[name=csrf-token]')?.content

function ChannelChip({ ch, active, size = 16 }) {
  return (
    <span
      title={ch.label}
      className="inline-flex items-center justify-center rounded font-bold transition-colors"
      style={{
        width: size,
        height: size,
        fontSize: size <= 16 ? '8px' : '9px',
        letterSpacing: '-0.5px',
        background: active ? ch.bg : '#e2e8f0',
        color: active ? '#fff' : '#94a3b8',
      }}
    >
      {ch.letter.toUpperCase()}
    </span>
  )
}

/**
 * Outreach channel marker for a lead.
 *  - variant="cell"  → compact popover trigger (used in the leads table)
 *  - variant="panel" → inline checklist (used on the lead detail page)
 *
 * Persists each toggle optimistically via fetch so the table never reloads.
 */
export default function OutreachChannels({ lead, variant = 'cell' }) {
  const [channels, setChannels] = useState(lead.contact_channels || {})
  const [open, setOpen] = useState(false)

  // Re-seed when the underlying lead changes (e.g. table pagination reuses rows).
  useEffect(() => { setChannels(lead.contact_channels || {}) }, [lead.id])

  const toggle = async (key) => {
    const isOn = !!channels[key]
    const prev = channels
    const next = { ...channels }
    if (isOn) delete next[key]
    else next[key] = new Date().toISOString()
    setChannels(next)

    try {
      const res = await fetch(`/leads/${lead.id}/channels`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          'X-CSRF-TOKEN': csrf(),
        },
        body: JSON.stringify({ channel: key, value: !isOn }),
      })
      if (!res.ok) throw new Error()
    } catch {
      setChannels(prev)
      toast.error('Could not update outreach')
    }
  }

  const activeKeys = CONTACT_CHANNELS.filter(c => channels[c.key])
  const activeCount = activeKeys.length

  const checklist = (
    <div className="space-y-px">
      {CONTACT_CHANNELS.map(ch => {
        const active = !!channels[ch.key]
        return (
          <button
            key={ch.key}
            type="button"
            onClick={() => toggle(ch.key)}
            className="w-full flex items-center gap-2 px-1.5 py-1 rounded-md hover:bg-slate-100 transition-colors text-left"
          >
            <ChannelChip ch={ch} active={active} size={15} />
            <span className={`text-[12px] leading-tight flex-1 ${active ? 'font-medium text-slate-800' : 'text-slate-500'}`}>
              Contacted {ch.verb} {ch.label}
            </span>
            <span
              className={`w-3.5 h-3.5 rounded border flex items-center justify-center shrink-0 transition-colors ${
                active ? 'bg-violet-600 border-violet-600' : 'border-slate-300'
              }`}
            >
              {active && <Check size={10} className="text-white" />}
            </span>
          </button>
        )
      })}
    </div>
  )

  if (variant === 'panel') return checklist

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          onClick={e => e.stopPropagation()}
          className="inline-flex items-center gap-0.5 rounded-md px-1.5 py-1 hover:bg-slate-100 transition-colors"
          title="Mark outreach channels"
        >
          {activeCount === 0 ? (
            <span className="text-[11px] text-slate-300 px-0.5">Mark…</span>
          ) : (
            <span className="flex items-center gap-0.5">
              {activeKeys.slice(0, 4).map(ch => <ChannelChip key={ch.key} ch={ch} active size={15} />)}
              {activeCount > 4 && <span className="text-[10px] text-slate-400 ml-0.5">+{activeCount - 4}</span>}
            </span>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-52 p-1 bg-white border-slate-200 shadow-lg" onClick={e => e.stopPropagation()}>
        <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400 px-1.5 pt-0.5 pb-1">
          Outreach
        </p>
        {checklist}
      </PopoverContent>
    </Popover>
  )
}
