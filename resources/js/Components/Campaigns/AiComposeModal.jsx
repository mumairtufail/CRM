import { useEffect, useState } from 'react'
import { router } from '@inertiajs/react'
import { toast } from 'sonner'
import { Button } from '@/Components/ui/button'
import { Textarea } from '@/Components/ui/textarea'
import { Input } from '@/Components/ui/input'
import { Label } from '@/Components/ui/label'
import { Checkbox } from '@/Components/ui/checkbox'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/Components/ui/select'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/Components/ui/dialog'
import { Alert, AlertDescription } from '@/Components/ui/alert'
import { Sparkles, AlertCircle, ChevronLeft, Check, Wand2, RefreshCw } from 'lucide-react'
import RichEditor from '@/Components/Common/RichEditor'
import { cn } from '@/lib/utils'

const csrf = () => document.querySelector('meta[name=csrf-token]')?.content
const gradientStyle = { background: 'linear-gradient(135deg,rgb(var(--brand-600)),rgb(var(--brand2-600)))' }

function Spinner({ className = 'border-white/30 border-t-white' }) {
  return <span className={cn('w-3.5 h-3.5 rounded-full border-2 animate-spin', className)} />
}

async function apiPost(url, body) {
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept':       'application/json',
      'X-CSRF-TOKEN': csrf(),
    },
    body: JSON.stringify(body),
  })

  if (res.status === 429) throw new Error('Too many requests — please wait a moment and try again.')
  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    if (data.not_configured) router.visit('/profile')
    throw new Error(data.message || `Request failed (${res.status})`)
  }
  return res.json()
}

// ── Creative "thinking" status lines ──────────────────────────────────────────

const THINKING_MESSAGES = {
  draft: [
    'Reading between the lines…',
    "Digging up your prospect's pain points…",
    "Writing something that isn't “Dear Sir/Madam”…",
    'Sanding down the sales-y edges…',
    'Making sure this reads human, not robotic…',
    'Proofreading — unlike most cold emails…',
  ],
  followups: [
    'Politely nudging without being annoying…',
    'Loading up the second (and third) impression…',
    "Keeping it short — nobody wants a follow-up novel…",
    'Adding just enough FOMO…',
    'Lining up the follow-through…',
  ],
  rewrite: [
    'Taking notes…',
    'Erasing the boring parts…',
    'Giving it a little more you…',
    'Editing like a caffeinated copywriter…',
    'Tightening the screws…',
  ],
}

function useThinkingMessage(active, phase) {
  const messages = THINKING_MESSAGES[phase] ?? THINKING_MESSAGES.draft
  const [index, setIndex] = useState(0)

  useEffect(() => {
    if (!active) { setIndex(0); return }
    const id = setInterval(() => setIndex(i => (i + 1) % messages.length), 1700)
    return () => clearInterval(id)
  }, [active, phase])

  return messages[index]
}

function ThinkingLine({ active, phase, className = '' }) {
  const message = useThinkingMessage(active, phase)
  if (!active) return null
  return (
    <div className={cn('flex items-center gap-2 rounded-lg bg-brand-50 border border-brand-100 px-3 py-2', className)}>
      <Spinner className="border-brand-300 border-t-brand-600" />
      <p className="text-[12px] text-brand-700">{message}</p>
    </div>
  )
}

const FOLLOWUP_COUNT_OPTIONS = [
  { value: 0, label: 'No follow-ups' },
  { value: 1, label: '1 follow-up' },
  { value: 2, label: '2 follow-ups' },
  { value: 3, label: '3 follow-ups' },
]

const REWRITE_TARGETS = [
  { value: 'subject', label: 'Subject' },
  { value: 'body', label: 'Body' },
  { value: 'both', label: 'Both' },
]

export default function AiComposeModal({
  open, onClose, forms = [], aiConfigured = false, onApply,
}) {
  const [step, setStep] = useState('inputs') // 'inputs' | 'review'
  const [hook, setHook] = useState('')
  const [freeOffer, setFreeOffer] = useState('')
  const [hasForm, setHasForm] = useState(false)
  const [leadFormId, setLeadFormId] = useState(null)
  const [followupCount, setFollowupCount] = useState(2)

  const [isDrafting, setIsDrafting] = useState(false)
  const [isFollowingUp, setIsFollowingUp] = useState(false)
  const [isRewriting, setIsRewriting] = useState(false)
  const [error, setError] = useState(null)

  const [subjects, setSubjects] = useState([])
  const [chosenSubject, setChosenSubject] = useState('')
  const [bodyHtml, setBodyHtml] = useState('')
  const [followupSteps, setFollowupSteps] = useState(null)

  const [showRewrite, setShowRewrite] = useState(false)
  const [rewriteTarget, setRewriteTarget] = useState('both')
  const [rewriteInstruction, setRewriteInstruction] = useState('')

  function reset() {
    setStep('inputs')
    setHook('')
    setFreeOffer('')
    setHasForm(false)
    setLeadFormId(null)
    setFollowupCount(2)
    setError(null)
    setSubjects([])
    setChosenSubject('')
    setBodyHtml('')
    setFollowupSteps(null)
    setShowRewrite(false)
    setRewriteTarget('both')
    setRewriteInstruction('')
  }

  function handleClose() {
    reset()
    onClose()
  }

  async function handleGenerateDraft() {
    if (!hook.trim() || !freeOffer.trim()) return
    setError(null)
    setIsDrafting(true)
    try {
      const data = await apiPost('/campaigns/ai-compose/draft', {
        hook, free_offer: freeOffer, has_form: hasForm,
      })
      setSubjects(data.subjects)
      setChosenSubject(data.subjects[0])
      setBodyHtml(data.body_html)
      setStep('review')
    } catch (e) {
      setError(e.message)
    } finally {
      setIsDrafting(false)
    }
  }

  async function handleGenerateFollowUps() {
    setError(null)
    setIsFollowingUp(true)
    try {
      const data = await apiPost('/campaigns/ai-compose/followups', {
        hook, free_offer: freeOffer, chosen_subject: chosenSubject, body_html: bodyHtml,
        count: followupCount,
      })
      setFollowupSteps(data.steps)
    } catch (e) {
      setError(e.message)
    } finally {
      setIsFollowingUp(false)
    }
  }

  async function handleRewrite() {
    if (!rewriteInstruction.trim()) return
    setError(null)
    setIsRewriting(true)
    try {
      const data = await apiPost('/campaigns/ai-compose/rewrite', {
        hook, free_offer: freeOffer, has_form: hasForm,
        subject: chosenSubject, body_html: bodyHtml,
        instruction: rewriteInstruction, target: rewriteTarget,
      })
      if (data.subjects) {
        setSubjects(data.subjects)
        setChosenSubject(data.subjects[0])
      }
      if (data.body_html) setBodyHtml(data.body_html)
      setRewriteInstruction('')
      setShowRewrite(false)
      toast.success('Rewritten — take a look')
    } catch (e) {
      setError(e.message)
    } finally {
      setIsRewriting(false)
    }
  }

  function handleApply() {
    onApply({
      subject:      chosenSubject,
      body_html:    bodyHtml,
      lead_form_id: hasForm ? leadFormId : null,
      followup_steps: followupSteps ?? [],
    })
    handleClose()
  }

  return (
    <Dialog open={open} onOpenChange={v => !v && handleClose()}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles size={16} className="text-brand-500" /> AI Compose
          </DialogTitle>
        </DialogHeader>

        {error && (
          <Alert variant="destructive">
            <AlertCircle size={14} />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {step === 'inputs' && (
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-xs">What's the pain point or angle for this outreach?</Label>
              <Textarea
                value={hook}
                onChange={e => setHook(e.target.value)}
                placeholder={`e.g. "They're hiring 3 SDRs but have no outbound sequence in place"`}
                rows={3}
                className="text-sm resize-none"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs">What free offer do you want to give?</Label>
              <Input
                value={freeOffer}
                onChange={e => setFreeOffer(e.target.value)}
                placeholder={`e.g. "A free 15-minute outbound audit"`}
                className="h-8 text-[13px]"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <Checkbox id="ai-has-form" checked={hasForm} onCheckedChange={v => setHasForm(!!v)} />
                <Label htmlFor="ai-has-form" className="text-xs font-normal cursor-pointer">
                  Attach a form to this email
                </Label>
              </div>
              {hasForm && (
                <Select value={leadFormId ? String(leadFormId) : ''} onValueChange={v => setLeadFormId(Number(v))}>
                  <SelectTrigger className="h-8 text-[13px]"><SelectValue placeholder="Which form?" /></SelectTrigger>
                  <SelectContent>
                    {forms.map(f => <SelectItem key={f.id} value={String(f.id)}>{f.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              )}
            </div>

            <ThinkingLine active={isDrafting} phase="draft" />

            <DialogFooter>
              <Button
                onClick={handleGenerateDraft}
                disabled={!hook.trim() || !freeOffer.trim() || (hasForm && !leadFormId) || isDrafting || !aiConfigured}
                className="text-white gap-2"
                style={gradientStyle}
              >
                {isDrafting ? <><Spinner /> Generating…</> : <><Sparkles size={14} /> Generate</>}
              </Button>
            </DialogFooter>
          </div>
        )}

        {step === 'review' && (
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-xs">Pick a subject line</Label>
              <div className="space-y-1.5">
                {subjects.map(s => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setChosenSubject(s)}
                    className={cn(
                      'w-full text-left px-3 py-2 rounded-lg border text-[13px] flex items-center justify-between gap-2 transition-colors',
                      chosenSubject === s
                        ? 'border-brand-400 bg-brand-50 text-brand-800'
                        : 'border-slate-200 hover:border-brand-200'
                    )}
                  >
                    {s}
                    {chosenSubject === s && <Check size={14} className="text-brand-600 shrink-0" />}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs">Email body</Label>
              <RichEditor value={bodyHtml} onChange={setBodyHtml} minHeight={180} />
            </div>

            {/* Rewrite */}
            {!showRewrite ? (
              <button
                type="button"
                onClick={() => setShowRewrite(true)}
                className="flex items-center gap-1 text-[11.5px] text-brand-600 hover:text-brand-800 font-medium underline underline-offset-2"
              >
                <Wand2 size={12} /> Not quite right? Rewrite it
              </button>
            ) : (
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 space-y-2">
                <p className="text-[12px] font-semibold text-slate-700">What do you want to rewrite?</p>
                <div className="flex gap-1.5">
                  {REWRITE_TARGETS.map(o => (
                    <button
                      key={o.value}
                      type="button"
                      onClick={() => setRewriteTarget(o.value)}
                      className={cn(
                        'px-2.5 py-1 rounded-full border text-[11px] font-medium transition-colors',
                        rewriteTarget === o.value
                          ? 'border-brand-400 bg-brand-100 text-brand-700'
                          : 'border-slate-200 text-slate-500 hover:border-brand-200'
                      )}
                    >
                      {o.label}
                    </button>
                  ))}
                </div>
                <Textarea
                  value={rewriteInstruction}
                  onChange={e => setRewriteInstruction(e.target.value)}
                  placeholder={`e.g. "Make it punchier", "Shorter", "Mention their recent funding round"`}
                  rows={2}
                  className="text-[12.5px] resize-none bg-white"
                />
                <ThinkingLine active={isRewriting} phase="rewrite" />
                <div className="flex items-center gap-2">
                  <Button
                    type="button" size="sm"
                    onClick={handleRewrite}
                    disabled={!rewriteInstruction.trim() || isRewriting}
                    className="text-white gap-1.5 h-7 text-[11.5px]"
                    style={gradientStyle}
                  >
                    {isRewriting ? <><Spinner /> Rewriting…</> : <><Sparkles size={12} /> Rewrite</>}
                  </Button>
                  <button
                    type="button"
                    onClick={() => { setShowRewrite(false); setRewriteInstruction('') }}
                    className="text-[11px] text-slate-400 hover:text-slate-600"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            <div className="space-y-1.5 border-t pt-3">
                <Label className="text-xs">Want suggested follow-ups for this?</Label>
                <div className="flex flex-wrap gap-1.5">
                  {FOLLOWUP_COUNT_OPTIONS.map(o => (
                    <button
                      key={o.value}
                      type="button"
                      onClick={() => { setFollowupCount(o.value); setFollowupSteps(null) }}
                      className={cn(
                        'px-2.5 py-1 rounded-full border text-[11.5px] font-medium transition-colors',
                        followupCount === o.value
                          ? 'border-brand-400 bg-brand-50 text-brand-700'
                          : 'border-slate-200 text-slate-500 hover:border-brand-200'
                      )}
                    >
                      {o.label}
                    </button>
                  ))}
                </div>

                {followupCount > 0 && !followupSteps && (
                  <Button
                    type="button" size="sm" variant="outline"
                    onClick={handleGenerateFollowUps}
                    disabled={isFollowingUp}
                    className="gap-1.5 text-xs mt-1"
                  >
                    {isFollowingUp ? <><Spinner className="border-brand-300 border-t-brand-600" /> Generating…</> : <><Sparkles size={13} /> Generate follow-ups</>}
                  </Button>
                )}

                <ThinkingLine active={isFollowingUp} phase="followups" className="mt-1" />

                {followupSteps && !isFollowingUp && (
                  <div className="space-y-1.5 mt-1">
                    {followupSteps.map((s, i) => (
                      <div key={i} className="rounded-lg border border-slate-200 px-2.5 py-2">
                        <p className="text-[11px] font-semibold text-slate-500 mb-0.5">
                          Follow-up {i + 1} · {Math.round(s.delay_hours / 24)} day{s.delay_hours / 24 !== 1 ? 's' : ''} later
                        </p>
                        <p className="text-[12.5px] font-medium text-slate-800">{s.subject}</p>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={handleGenerateFollowUps}
                      className="flex items-center gap-1 text-[11px] text-brand-600 hover:text-brand-800 font-medium"
                    >
                      <RefreshCw size={11} /> Regenerate
                    </button>
                  </div>
                )}
            </div>

            <DialogFooter className="gap-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setStep('inputs')} className="gap-1">
                <ChevronLeft size={13} /> Back
              </Button>
              <div className="flex-1" />
              <Button
                onClick={handleApply}
                disabled={followupCount > 0 && !followupSteps}
                className="text-white"
                style={gradientStyle}
              >
                Insert into Campaign
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
