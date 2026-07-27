import { useState } from 'react'
import { Head, router, usePage } from '@inertiajs/react'
import { toast } from 'sonner'
import AppLayout from '@/Components/Layout/AppLayout'
import { Button } from '@/Components/ui/button'
import { Textarea } from '@/Components/ui/textarea'
import { Badge } from '@/Components/ui/badge'
import { Card, CardContent } from '@/Components/ui/card'
import { Input } from '@/Components/ui/input'
import { Label } from '@/Components/ui/label'
import { Separator } from '@/Components/ui/separator'
import { Skeleton } from '@/Components/ui/skeleton'
import { Checkbox } from '@/Components/ui/checkbox'
import {
  Table, TableBody, TableCell, TableHead,
  TableHeader, TableRow,
} from '@/Components/ui/table'
import {
  Select, SelectContent, SelectItem, SelectTrigger,
} from '@/Components/ui/select'
import {
  Tooltip, TooltipContent, TooltipProvider, TooltipTrigger,
} from '@/Components/ui/tooltip'
import { Avatar, AvatarFallback } from '@/Components/ui/avatar'
import { Alert, AlertDescription } from '@/Components/ui/alert'
import {
  Sparkles, Search, X, Plus, Link2,
  ChevronLeft, ChevronRight, AlertCircle, Users, SearchX,
} from 'lucide-react'

const csrf = () => document.querySelector('meta[name=csrf-token]')?.content

const EXAMPLE_PROMPTS = [
  'CEOs of construction companies in the United States',
  'Founders of manufacturing businesses in USA with 50-200 employees',
  'Sales managers at real estate agencies in New York',
  'CTOs at technology companies in the United States',
  'VP of Sales at finance and accounting firms in USA',
]

const SENIORITY_LABELS = {
  c_suite:  'C-Suite',
  owner:    'Owner',
  founder:  'Founder',
  vp:       'VP',
  director: 'Director',
  manager:  'Manager',
  senior:   'Senior',
  entry:    'Entry',
}

const COMPANY_SIZE_LABELS = {
  '1,10':    '1–10',
  '11,50':   '11–50',
  '51,200':  '51–200',
  '201,500': '201–500',
  '501,1000':'501–1000',
  '1001,5000':'1001–5000',
}

const FILTER_LABELS = {
  job_titles:       'Job Titles',
  seniority_levels: 'Seniority',
  industries:       'Industry',
  locations:        'Location',
  company_sizes:    'Company Size',
  keywords:         'Keywords',
}

// Common values offered as autocomplete suggestions for the free-text filters.
const INDUSTRY_SUGGESTIONS = [
  'SaaS', 'Software', 'Fintech', 'Healthcare', 'E-Commerce', 'Marketing',
  'Finance', 'Accounting', 'Real Estate', 'Education', 'Technology',
  'Construction', 'Manufacturing', 'Logistics', 'Retail', 'Hospitality',
  'Legal Services', 'Consulting', 'Insurance', 'Telecommunications',
  'Field Services', 'Architecture', 'Engineering', 'Transportation',
]

const LOCATION_SUGGESTIONS = [
  'United States', 'United Kingdom', 'Canada', 'Australia', 'New York',
  'London', 'San Francisco', 'Los Angeles', 'Chicago', 'Houston', 'Dallas',
  'Miami', 'Florida', 'Texas', 'California', 'Dubai',
]

const toOptions = (labelMap) => Object.entries(labelMap).map(([value, label]) => ({ value, label }))

// Per-filter behaviour: dropdown (fixed options the user picks from — no
// format guessing) vs. free-text with type-specific placeholder + suggestions.
const FILTER_CONFIG = {
  job_titles:       { kind: 'text',   placeholder: 'Add a job title…' },
  seniority_levels: { kind: 'select', placeholder: 'Add seniority',     options: toOptions(SENIORITY_LABELS) },
  industries:       { kind: 'text',   placeholder: 'Add an industry…',  suggestions: INDUSTRY_SUGGESTIONS },
  locations:        { kind: 'text',   placeholder: 'Add a city or country…', suggestions: LOCATION_SUGGESTIONS },
  company_sizes:    { kind: 'select', placeholder: 'Add company size',  options: toOptions(COMPANY_SIZE_LABELS) },
  keywords:         { kind: 'text',   placeholder: 'Add a keyword…' },
}

function displayValue(filterKey, value) {
  if (filterKey === 'seniority_levels') return SENIORITY_LABELS[value] || value
  if (filterKey === 'company_sizes')   return COMPANY_SIZE_LABELS[value] || value
  return value
}

// ── FilterRow ────────────────────────────────────────────────────────────────

function FilterRow({ filterKey, values, onRemove, onAdd }) {
  const cfg = FILTER_CONFIG[filterKey] || { kind: 'text', placeholder: 'Add…' }
  const [adding, setAdding] = useState(false)
  const [newVal, setNewVal] = useState('')

  // Add a value, skipping blanks and duplicates.
  const addValue = (raw) => {
    const trimmed = (raw ?? '').toString().trim()
    if (trimmed && !values.includes(trimmed)) onAdd(filterKey, trimmed)
  }

  const commitText = () => {
    addValue(newVal)
    setNewVal('')
    setAdding(false)
  }

  // For dropdowns, only offer options not already chosen.
  const remainingOptions = cfg.kind === 'select'
    ? cfg.options.filter(o => !values.includes(o.value))
    : []
  const listId = `suggest-${filterKey}`

  return (
    <div className="flex items-start gap-3 py-2 min-h-[32px]">
      <Label className="w-28 shrink-0 text-xs text-muted-foreground pt-1.5">
        {FILTER_LABELS[filterKey] || filterKey}
      </Label>
      <div className="flex flex-wrap gap-1.5 flex-1 items-center">
        {values.map((v, i) => (
          <Badge key={i} variant="secondary" className="flex items-center gap-1 pr-1 font-normal">
            {displayValue(filterKey, v)}
            <button
              onClick={() => onRemove(filterKey, i)}
              className="ml-0.5 rounded-full hover:text-destructive transition-colors"
            >
              <X size={9} />
            </button>
          </Badge>
        ))}

        {cfg.kind === 'select' ? (
          remainingOptions.length > 0 && (
            // Pick-from-list — the user never has to guess a format (e.g. "51–200").
            <Select value="" onValueChange={addValue}>
              <SelectTrigger
                className="h-6 w-auto gap-1 border-dashed px-2 text-[11px] text-muted-foreground hover:text-brand-600"
              >
                <Plus size={10} /> {cfg.placeholder}
              </SelectTrigger>
              <SelectContent>
                {remainingOptions.map(o => (
                  <SelectItem key={o.value} value={o.value} className="text-xs">
                    {o.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )
        ) : adding ? (
          <div className="flex items-center gap-1">
            <Input
              list={cfg.suggestions ? listId : undefined}
              value={newVal}
              onChange={e => setNewVal(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter') { e.preventDefault(); commitText() }
                if (e.key === 'Escape') { setAdding(false); setNewVal('') }
              }}
              className="h-6 w-44 text-xs px-2"
              autoFocus
              placeholder={cfg.placeholder}
            />
            {cfg.suggestions && (
              <datalist id={listId}>
                {cfg.suggestions.map(s => <option key={s} value={s} />)}
              </datalist>
            )}
            <button onClick={commitText} className="text-brand-600 hover:text-brand-800">
              <Plus size={12} />
            </button>
            <button onClick={() => { setAdding(false); setNewVal('') }} className="text-muted-foreground hover:text-foreground">
              <X size={12} />
            </button>
          </div>
        ) : (
          <button
            onClick={() => setAdding(true)}
            className="flex items-center gap-0.5 text-[11px] text-muted-foreground hover:text-brand-600 transition-colors"
          >
            <Plus size={10} /> Add
          </button>
        )}
      </div>
    </div>
  )
}

// ── ResultRow ────────────────────────────────────────────────────────────────

function ResultRow({ contact, selected, onToggle, importing }) {
  const initials = `${contact.first_name?.[0] ?? ''}${contact.last_name?.[0] ?? ''}`.toUpperCase() || '?'
  const location = [contact.city, contact.country].filter(Boolean).join(', ')

  return (
    <TableRow className={selected ? 'bg-brand-50/60' : ''}>
      <TableCell className="w-10">
        <Checkbox checked={selected} onCheckedChange={onToggle} disabled={importing} />
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-2.5">
          <Avatar className="h-8 w-8 shrink-0">
            <AvatarFallback className="text-[11px] font-semibold bg-brand-100 text-brand-700">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <p className="text-sm font-medium text-slate-800 truncate">
              {contact.first_name} {contact.last_name}
            </p>
            <p className="text-xs text-muted-foreground truncate">{contact.company_name || '—'}</p>
          </div>
        </div>
      </TableCell>
      <TableCell className="text-xs">
        {contact.email
          ? <span className="text-slate-700">{contact.email}</span>
          : (
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="text-amber-600 cursor-help underline decoration-dotted underline-offset-2">no email (free plan)</span>
              </TooltipTrigger>
              <TooltipContent className="max-w-[220px] text-xs">
                This provider didn't return an email for this lead — usually a free-plan limit. The lead still imports with name, title, company, and LinkedIn.
              </TooltipContent>
            </Tooltip>
          )}
      </TableCell>
      <TableCell>
        <p className="text-sm text-slate-700">{contact.title || '—'}</p>
        {contact.seniority && (
          <Badge variant="outline" className="text-[10px] mt-0.5 py-0 font-normal">
            {SENIORITY_LABELS[contact.seniority] || contact.seniority}
          </Badge>
        )}
      </TableCell>
      <TableCell className="text-xs text-slate-600">{contact.industry || '—'}</TableCell>
      <TableCell className="text-xs text-slate-600">{location || '—'}</TableCell>
      <TableCell>
        {contact.linkedin_url ? (
          <a
            href={contact.linkedin_url.startsWith('http') ? contact.linkedin_url : `https://${contact.linkedin_url}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs text-brand-600 hover:text-brand-800 transition-colors"
          >
            <Link2 size={12} /> View
          </a>
        ) : (
          <span className="text-xs text-muted-foreground">—</span>
        )}
      </TableCell>
    </TableRow>
  )
}

// ── Spinner ──────────────────────────────────────────────────────────────────

function Spinner({ className = 'border-white/30 border-t-white' }) {
  return (
    <span className={`w-3.5 h-3.5 rounded-full border-2 animate-spin ${className}`} />
  )
}

// ── Main Page ────────────────────────────────────────────────────────────────

// ── Unconfigured empty state ──────────────────────────────────────────────────

function NotConfigured() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Card className="max-w-sm w-full glass-card text-center">
        <CardContent className="pt-10 pb-8 px-8">
          <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
            <SearchX size={26} className="text-slate-400" />
          </div>
          <h2 className="text-[15px] font-bold text-slate-800 mb-1.5">No Provider Configured</h2>
          <p className="text-[13px] text-slate-500 leading-relaxed mb-6">
            Connect Apollo.io or People Data Labs in Settings to start finding leads with AI.
          </p>
          <Button
            onClick={() => router.visit('/profile')}
            style={{ background: 'linear-gradient(135deg,rgb(var(--brand-600)),rgb(var(--brand2-600)))' }}
            className="text-white w-full gap-2"
          >
            <Sparkles size={14} /> Go to Settings
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

// ── Main Page ────────────────────────────────────────────────────────────────

export default function LeadGenerationIndex({ configured, providerName }) {
  const [prompt,       setPrompt]       = useState('')
  const [parsedFilters,setParsedFilters] = useState(null)
  const [searchResults,setSearchResults] = useState([])
  const [totalResults, setTotalResults]  = useState(0)
  const [totalPages,   setTotalPages]    = useState(1)
  const [currentPage,  setCurrentPage]   = useState(1)
  const [selectedIds,  setSelectedIds]   = useState(new Set())
  const [isParsing,    setIsParsing]     = useState(false)
  const [isSearching,  setIsSearching]   = useState(false)
  const [isImporting,  setIsImporting]   = useState(false)
  const [step,         setStep]          = useState('prompt') // 'prompt'|'filters'|'results'
  const [error,        setError]         = useState(null)
  const [creditsLeft,  setCreditsLeft]   = useState(null)

  // ── Helpers ──────────────────────────────────────────────────────────────

  async function apiPost(url, body) {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type':  'application/json',
        'Accept':        'application/json',
        'X-CSRF-TOKEN':  csrf(),
      },
      body: JSON.stringify(body),
    })

    if (res.status === 429) throw new Error('Too many requests — please wait a moment and try again.')
    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      if (data.not_configured) router.visit('/profile')
      throw new Error(data.message || `Request failed (${res.status})`)
    }
    try {
      return await res.json()
    } catch {
      // The server responded 2xx but the body wasn't JSON (e.g. a redirected-to
      // HTML page) — surface a message users can act on instead of the raw
      // browser parse error.
      throw new Error('Unexpected response from the server. Please try again.')
    }
  }

  // ── Handlers ─────────────────────────────────────────────────────────────

  async function handleSearch() {
    if (!prompt.trim()) return
    setError(null)
    setIsParsing(true)
    try {
      const data = await apiPost('/lead-generation/parse-prompt', { prompt })
      setParsedFilters(data.filters)
      setStep('filters')
    } catch (e) {
      setError(e.message)
    } finally {
      setIsParsing(false)
    }
  }

  async function handleRunSearch(page = 1) {
    setError(null)
    setIsSearching(true)
    setStep('results')
    try {
      const data = await apiPost('/lead-generation/search', { filters: parsedFilters, page })
      setSearchResults(data.contacts ?? [])
      setTotalResults(data.total ?? 0)
      setTotalPages(data.total_pages ?? 1)
      setCurrentPage(data.page ?? page)
      setSelectedIds(new Set())
      if (data.credits_remaining != null) setCreditsLeft(data.credits_remaining)
    } catch (e) {
      setError(e.message)
      setStep('filters')
    } finally {
      setIsSearching(false)
    }
  }

  async function handleImport() {
    const selected = searchResults.filter(c => selectedIds.has(c.id))
    if (!selected.length) return
    setIsImporting(true)
    try {
      const data = await apiPost('/lead-generation/import', { contacts: selected })
      const msg = data.skipped > 0
        ? `${data.imported} imported, ${data.skipped} duplicate${data.skipped !== 1 ? 's' : ''} skipped`
        : `${data.imported} lead${data.imported !== 1 ? 's' : ''} imported successfully`
      toast.success(msg)
      setSelectedIds(new Set())
    } catch (e) {
      toast.error(e.message)
    } finally {
      setIsImporting(false)
    }
  }

  function removeFilter(key, index) {
    setParsedFilters(prev => ({ ...prev, [key]: prev[key].filter((_, i) => i !== index) }))
  }

  function addFilter(key, value) {
    setParsedFilters(prev => ({ ...prev, [key]: [...(prev[key] || []), value] }))
  }

  function toggleSelect(id) {
    setSelectedIds(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  function toggleSelectAll() {
    if (selectedIds.size === searchResults.length) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(searchResults.map(c => c.id)))
    }
  }

  function resetToPrompt() {
    setParsedFilters(null)
    setSearchResults([])
    setSelectedIds(new Set())
    setError(null)
    setStep('prompt')
  }

  // ── Render ───────────────────────────────────────────────────────────────

  const gradientStyle = { background: 'linear-gradient(135deg, rgb(var(--brand-600)), rgb(var(--brand2-600)))' }

  if (!configured) {
    return (
      <AppLayout>
        <Head title="AI Lead Search" />
        <NotConfigured />
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      <Head title="AI Lead Search" />

      <TooltipProvider delayDuration={150}>
      <div className="p-6 max-w-5xl mx-auto space-y-5">

        {/* ── Header ──────────────────────────────────────────────────── */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={gradientStyle}>
              <Sparkles size={18} className="text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-800">AI Lead Search</h1>
              <p className="text-sm text-slate-500">
                Describe your ideal prospect in plain English
                {providerName && <span className="ml-1 text-slate-400">· via {providerName}</span>}
              </p>
            </div>
          </div>

          {creditsLeft != null && (
            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-[12px] font-medium ${
              creditsLeft < 50
                ? 'bg-red-50 border-red-200 text-red-600'
                : creditsLeft < 200
                ? 'bg-amber-50 border-amber-200 text-amber-700'
                : 'bg-emerald-50 border-emerald-200 text-emerald-700'
            }`}>
              <span className={`w-1.5 h-1.5 rounded-full ${
                creditsLeft < 50 ? 'bg-red-500' : creditsLeft < 200 ? 'bg-amber-500' : 'bg-emerald-500'
              }`} />
              <span>{creditsLeft.toLocaleString()} credits left</span>
            </div>
          )}
        </div>

        {/* ── Error banner ─────────────────────────────────────────────── */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle size={14} />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* ── Section 1 — Prompt ───────────────────────────────────────── */}
        <Card className="glass-card">
          <CardContent className="pt-6 space-y-4">
            <Textarea
              value={prompt}
              onChange={e => setPrompt(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSearch() } }}
              placeholder={`"Find CTOs at SaaS companies in the US with 50–200 employees"`}
              rows={3}
              className="resize-none text-sm"
            />

            <div className="flex flex-wrap items-center gap-3">
              <Button
                onClick={handleSearch}
                disabled={!prompt.trim() || isParsing}
                style={gradientStyle}
                className="text-white gap-2 shrink-0"
              >
                {isParsing ? <><Spinner /> Analyzing…</> : <><Search size={14} /> Search Leads</>}
              </Button>

              <div className="flex flex-wrap gap-1.5">
                {EXAMPLE_PROMPTS.map(ex => (
                  <Badge
                    key={ex}
                    variant="outline"
                    className="cursor-pointer hover:bg-brand-50 hover:border-brand-300 text-xs py-1 font-normal"
                    onClick={() => setPrompt(ex)}
                  >
                    {ex}
                  </Badge>
                ))}
              </div>
            </div>

            {isParsing && (
              <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                <Spinner className="border-brand-300 border-t-brand-600" />
                AI is interpreting your search…
              </p>
            )}
          </CardContent>
        </Card>

        {/* ── Filters skeleton while parsing ───────────────────────────── */}
        {isParsing && (
          <Card className="glass-card">
            <CardContent className="pt-6 space-y-3">
              {[140, 100, 120, 90, 110].map((w, i) => (
                <div key={i} className="flex items-center gap-3 py-1">
                  <Skeleton className="h-3 w-24" />
                  <Skeleton className={`h-5 w-${w > 110 ? '20' : '16'}`} style={{ width: w }} />
                  <Skeleton className="h-5 w-14" />
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* ── Section 2 — Extracted Filters ────────────────────────────── */}
        {parsedFilters && (step === 'filters' || step === 'results') && (
          <Card className="glass-card">
            <CardContent className="pt-5 pb-4">
              <div className="flex items-start gap-2 mb-3">
                <span className="w-4 h-4 mt-0.5 rounded-full bg-emerald-500 flex items-center justify-center text-white text-[9px] font-bold shrink-0">
                  ✓
                </span>
                <div>
                  <p className="text-sm font-medium text-slate-700">Filters detected from your prompt</p>
                  <p className="text-xs text-muted-foreground">
                    Adjust or add anything before searching — pick from the list for Seniority and Company Size, or type to add titles, industries, and locations.
                  </p>
                </div>
              </div>

              <div className="divide-y divide-border/50">
                {Object.entries(FILTER_LABELS).map(([key]) => (
                  <FilterRow
                    key={key}
                    filterKey={key}
                    values={parsedFilters[key] || []}
                    onRemove={removeFilter}
                    onAdd={addFilter}
                  />
                ))}
              </div>

              <div className="flex gap-2 mt-4 pt-2">
                <Button variant="outline" size="sm" onClick={resetToPrompt}>
                  Refine Search
                </Button>
                <Button
                  size="sm"
                  onClick={() => handleRunSearch(1)}
                  disabled={isSearching}
                  style={gradientStyle}
                  className="text-white gap-2"
                >
                  {isSearching ? <><Spinner /> Searching…</> : 'Run Search →'}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* ── Section 3 — Results ──────────────────────────────────────── */}
        {step === 'results' && (
          <Card className="glass-card overflow-hidden">

            {/* Results header */}
            {!isSearching && (
              <div className="flex items-center justify-between px-4 py-3 border-b bg-white/40">
                <div className="flex items-center gap-2.5">
                  <Checkbox
                    checked={searchResults.length > 0 && selectedIds.size === searchResults.length}
                    onCheckedChange={toggleSelectAll}
                    disabled={searchResults.length === 0 || isImporting}
                  />
                  <p className="text-sm text-slate-600">
                    <span className="font-semibold text-slate-800">{totalResults.toLocaleString()}</span> leads found
                  </p>
                </div>

                <Button
                  size="sm"
                  disabled={selectedIds.size === 0 || isImporting}
                  onClick={handleImport}
                  style={selectedIds.size > 0 && !isImporting ? gradientStyle : {}}
                  className={selectedIds.size > 0 && !isImporting ? 'text-white gap-2' : 'gap-2'}
                >
                  {isImporting
                    ? <><Spinner className="border-white/30 border-t-white" /> Importing…</>
                    : `Import Selected (${selectedIds.size})`
                  }
                </Button>
              </div>
            )}

            {/* Skeleton rows */}
            {isSearching && (
              <div className="p-4 space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex items-center gap-3 py-1">
                    <Skeleton className="h-4 w-4 rounded" />
                    <Skeleton className="h-8 w-8 rounded-full" />
                    <div className="flex-1 space-y-1.5">
                      <Skeleton className="h-3 w-40" />
                      <Skeleton className="h-3 w-28" />
                    </div>
                    <Skeleton className="h-3 w-24" />
                    <Skeleton className="h-3 w-20" />
                    <Skeleton className="h-3 w-16" />
                    <Skeleton className="h-3 w-12" />
                  </div>
                ))}
              </div>
            )}

            {/* Empty state */}
            {!isSearching && searchResults.length === 0 && (
              <div className="py-14 text-center">
                <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-3">
                  <Users size={22} className="text-slate-400" />
                </div>
                <p className="text-sm font-semibold text-slate-700">No leads found</p>
                <p className="text-xs text-muted-foreground mt-1 max-w-xs mx-auto">
                  Try broadening your filters or rephrasing your prompt
                </p>
                <Button variant="outline" size="sm" className="mt-4" onClick={resetToPrompt}>
                  Try a new search
                </Button>
              </div>
            )}

            {/* Results table */}
            {!isSearching && searchResults.length > 0 && (
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="w-10"></TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Title / Seniority</TableHead>
                    <TableHead>Industry</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>LinkedIn</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {searchResults.map(contact => (
                    <ResultRow
                      key={contact.id}
                      contact={contact}
                      selected={selectedIds.has(contact.id)}
                      onToggle={() => toggleSelect(contact.id)}
                      importing={isImporting}
                    />
                  ))}
                </TableBody>
              </Table>
            )}

            {/* Pagination */}
            {!isSearching && totalPages > 1 && (
              <div className="flex items-center justify-between px-4 py-3 border-t bg-white/30">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage <= 1}
                  onClick={() => handleRunSearch(currentPage - 1)}
                  className="gap-1"
                >
                  <ChevronLeft size={14} /> Previous
                </Button>
                <p className="text-xs text-muted-foreground">
                  Page {currentPage} of {totalPages}
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage >= totalPages}
                  onClick={() => handleRunSearch(currentPage + 1)}
                  className="gap-1"
                >
                  Next <ChevronRight size={14} />
                </Button>
              </div>
            )}
          </Card>
        )}
      </div>
      </TooltipProvider>
    </AppLayout>
  )
}
