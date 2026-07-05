import { Head, router } from '@inertiajs/react'
import { useRef, useState } from 'react'
import AppLayout from '@/Components/Layout/AppLayout'
import PageHeader from '@/Components/Common/PageHeader'
import { Button } from '@/Components/ui/button'
import { Input } from '@/Components/ui/input'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/Components/ui/select'
import {
  Upload, FileText, CheckCircle, XCircle, AlertCircle,
  Download, Sheet, Loader2, ExternalLink, Info
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

// All importable columns, grouped for display
const COL_GROUPS = [
  { label: 'Required',  cols: ['first_name'] },
  { label: 'Contact',   cols: ['last_name', 'email', 'phone'] },
  { label: 'Company',   cols: ['company', 'job_title'] },
  { label: 'Pipeline',  cols: ['status', 'priority', 'deal_value', 'currency'] },
  { label: 'Location',  cols: ['country', 'city', 'industry'] },
  { label: 'Online',    cols: ['website', 'linkedin_url'] },
  { label: 'Social',    cols: ['twitter', 'instagram', 'facebook', 'tiktok', 'youtube'] },
  { label: 'Other',     cols: ['notes'] },
]

const ALL_COLS = COL_GROUPS.flatMap(g => g.cols)

// Template sample row — matches ALL_COLS order
const TEMPLATE_ROW = [
  'John',                                // first_name
  'Doe',                                 // last_name
  'john@acme.com',                       // email
  '+1 555-0100',                         // phone
  'Acme Inc.',                           // company
  'CEO',                                 // job_title
  'new',                                 // status
  'medium',                              // priority
  '10000',                               // deal_value
  'USD',                                 // currency
  'United States',                       // country
  'New York',                            // city
  'Software',                            // industry
  'https://acme.com',                    // website
  'https://linkedin.com/in/johndoe',     // linkedin_url
  'https://twitter.com/johndoe',         // twitter
  'https://instagram.com/johndoe',       // instagram
  'https://facebook.com/johndoe',        // facebook
  '',                                    // tiktok
  '',                                    // youtube
  'Sample note about this lead',         // notes
]

// ── Template download (client-side, no backend needed) ────────────────────────
function downloadTemplate() {
  const csv = [ALL_COLS.join(','), TEMPLATE_ROW.map(v => `"${v}"`).join(',')].join('\n')
  const a   = document.createElement('a')
  a.href    = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csv)
  a.download = 'leads_import_template.csv'
  a.click()
}

// ── Mode tab ──────────────────────────────────────────────────────────────────
function ModeTab({ active, onClick, icon: Icon, label, description }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex-1 flex flex-col items-center gap-1.5 px-4 py-3.5 rounded-xl border-2 transition-all text-center',
        active
          ? 'border-brand-500 bg-brand-50'
          : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
      )}
    >
      <Icon size={20} className={active ? 'text-brand-600' : 'text-slate-400'} />
      <span className={cn('text-[13px] font-semibold', active ? 'text-brand-700' : 'text-slate-700')}>{label}</span>
      <span className="text-[11px] text-slate-400 leading-snug">{description}</span>
    </button>
  )
}

// ── CSV Drop Zone ─────────────────────────────────────────────────────────────
function DropZone({ onFile, uploading }) {
  const inputRef = useRef()
  const [drag, setDrag]   = useState(false)

  const handleDrop = e => {
    e.preventDefault()
    setDrag(false)
    const f = e.dataTransfer.files[0]
    if (f) onFile(f)
  }

  return (
    <div
      onClick={() => inputRef.current?.click()}
      onDragOver={e => { e.preventDefault(); setDrag(true) }}
      onDragLeave={() => setDrag(false)}
      onDrop={handleDrop}
      className={cn(
        'border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-colors',
        drag ? 'border-brand-400 bg-brand-50' : 'border-slate-200 hover:border-brand-300 hover:bg-brand-50/40'
      )}
    >
      <input ref={inputRef} type="file" accept=".csv,.txt" className="hidden"
        onChange={e => e.target.files[0] && onFile(e.target.files[0])} />
      <div className={cn(
        'w-12 h-12 rounded-xl mx-auto mb-3 flex items-center justify-center',
        drag ? 'bg-brand-100' : 'bg-slate-100'
      )}>
        <Upload size={20} className={drag ? 'text-brand-600' : 'text-slate-400'} />
      </div>
      <p className="text-[13px] font-semibold text-slate-700">Drop your CSV here or click to browse</p>
      <p className="text-[12px] text-slate-400 mt-1">Max 500 rows · .csv or .txt</p>
      {uploading && (
        <div className="flex items-center justify-center gap-1.5 mt-2 text-brand-600">
          <Loader2 size={13} className="animate-spin" />
          <span className="text-[12px] font-medium">Uploading & parsing…</span>
        </div>
      )}
    </div>
  )
}

// ── Preview Table ─────────────────────────────────────────────────────────────
function PreviewTable({ rows, headers }) {
  const displayHeaders = headers.slice(0, 8)
  const displayRows    = rows.slice(0, 10)

  return (
    <div className="overflow-x-auto rounded-lg border border-slate-200">
      <table className="w-full text-xs">
        <thead className="bg-slate-50">
          <tr>
            <th className="text-left px-3 py-2 font-semibold text-slate-400 w-8">#</th>
            {displayHeaders.map(h => (
              <th key={h} className="text-left px-3 py-2 font-semibold text-slate-600 whitespace-nowrap">{h}</th>
            ))}
            {headers.length > 8 && (
              <th className="text-left px-3 py-2 text-slate-400">+{headers.length - 8} more</th>
            )}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {displayRows.map((row, i) => (
            <tr key={i} className="hover:bg-slate-50/60">
              <td className="px-3 py-2 text-slate-400">{i + 1}</td>
              {displayHeaders.map(h => (
                <td key={h} className="px-3 py-2 text-slate-600 max-w-32 truncate">{row[h] ?? '—'}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      {rows.length > 10 && (
        <div className="px-3 py-2 bg-slate-50 text-[11px] text-slate-400 border-t border-slate-100">
          Showing 10 of {rows.length} rows
        </div>
      )}
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────
export default function Import({ importJob }) {
  const [mode, setMode] = useState('csv')

  // CSV
  const [uploading, setUploading] = useState(false)

  // Google Sheets
  const [gsUrl, setGsUrl]                 = useState('')
  const [gsSheets, setGsSheets]           = useState(null)   // null = not yet fetched
  const [gsSheet, setGsSheet]             = useState('')
  const [gsSpreadsheetId, setGsId]        = useState('')
  const [gsFetching, setGsFetching]       = useState(false)
  const [gsWarning, setGsWarning]         = useState('')
  const [gsUrlError, setGsUrlError]       = useState('')
  const [gsImporting, setGsImporting]     = useState(false)
  const [gsManualInput, setGsManualInput] = useState(false)

  // Shared preview
  const [confirming, setConfirming] = useState(false)

  // ── CSV handlers ──
  const handleFile = file => {
    setUploading(true)
    const fd = new FormData()
    fd.append('file', file)
    fd.append('_token', document.querySelector('meta[name=csrf-token]').content)
    router.post('/import/upload', fd, {
      forceFormData: true,
      onFinish: () => setUploading(false),
      onError: () => { toast.error('Failed to parse CSV'); setUploading(false) },
    })
  }

  // ── Sheets handlers ──
  const fetchSheetNames = async () => {
    setGsFetching(true)
    setGsUrlError('')
    setGsWarning('')
    setGsSheets(null)
    setGsManualInput(false)

    try {
      const res = await fetch('/import/sheets/fetch', {
        method:  'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN':  document.querySelector('meta[name=csrf-token]')?.content ?? '',
          'Accept':        'application/json',
        },
        body: JSON.stringify({ url: gsUrl }),
      })

      // Parse body — may fail if server returned an HTML error page
      let json
      const text = await res.text()
      try {
        json = JSON.parse(text)
      } catch {
        // Server returned HTML (e.g. 500 page) — show the HTTP status
        setGsUrlError(`Server error (HTTP ${res.status}). Check storage/logs/laravel.log for details.`)
        return
      }

      if (!res.ok) {
        setGsUrlError(json.message || json.error || `Request failed (HTTP ${res.status})`)
        return
      }

      setGsId(json.spreadsheet_id)
      setGsSheets(json.sheets)
      setGsSheet(json.sheets[0] || 'Sheet1')
      // Always use manual input — Google's sheet-listing API is deprecated
      setGsManualInput(true)
      if (json.warning) setGsWarning(json.warning)
    } catch (err) {
      setGsUrlError(`Connection error: ${err.message}`)
    } finally {
      setGsFetching(false)
    }
  }

  const importFromSheets = () => {
    setGsImporting(true)
    router.post('/import/sheets/upload', {
      spreadsheet_id: gsSpreadsheetId,
      sheet:          gsSheet,
    }, {
      onFinish: () => setGsImporting(false),
      onError:  () => toast.error('Failed to import. Check URL and sheet name.'),
    })
  }

  const handleConfirm = () => {
    if (!importJob) return
    setConfirming(true)
    router.post(`/import/${importJob.id}/confirm`, {}, {
      onFinish: () => setConfirming(false),
      onError:  () => { toast.error('Import failed'); setConfirming(false) },
    })
  }

  const handleCancel = () => {
    if (!importJob) return
    router.delete(`/import/${importJob.id}`)
  }

  const previewRows  = importJob?.preview_data ?? []
  const headers      = previewRows.length > 0 ? Object.keys(previewRows[0]) : []
  const missingCols  = ['first_name'].filter(c => !headers.some(h => h.toLowerCase().replace(/\s/g,'_') === c))
  const isGSUrl      = gsUrl.includes('docs.google.com/spreadsheets')

  return (
    <>
      <Head title="Import" />
      <AppLayout title="Import">
        <PageHeader title="Import Leads" description="Bulk-import leads from a CSV file or Google Sheet" />

        <div className="max-w-3xl space-y-3">

          {/* ── If a job is in preview, show the shared preview UI ── */}
          {importJob ? (
            <>
              {/* Source badge */}
              <div className="flex items-center gap-2">
                <span className={cn(
                  'inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full',
                  importJob.source === 'google_sheet'
                    ? 'bg-emerald-50 text-emerald-700'
                    : 'bg-brand-50 text-brand-700'
                )}>
                  {importJob.source === 'google_sheet' ? <Sheet size={11} /> : <FileText size={11} />}
                  {importJob.source === 'google_sheet' ? 'Google Sheets' : 'CSV Upload'}
                </span>
              </div>

              {/* Preview card */}
              <div className="form-card">
                <div className="flex items-center justify-between px-4 py-2.5" style={{ borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
                  <div className="flex items-center gap-2">
                    <FileText size={13} className="text-brand-500" />
                    <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                      Preview — {previewRows.length} rows detected
                    </p>
                  </div>
                  {missingCols.length > 0 ? (
                    <div className="flex items-center gap-1.5 text-red-500">
                      <XCircle size={13} />
                      <span className="text-[12px] font-medium">Missing: {missingCols.join(', ')}</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 text-emerald-600">
                      <CheckCircle size={13} />
                      <span className="text-[12px] font-medium">Ready to import</span>
                    </div>
                  )}
                </div>
                <div className="px-4 py-3">
                  {headers.length > 0 && <PreviewTable rows={previewRows} headers={headers} />}
                </div>
              </div>

              {/* Detected columns */}
              <div className="form-card px-4 py-3">
                <div className="flex items-start gap-2.5">
                  <AlertCircle size={13} className="text-brand-400 mt-0.5 shrink-0" />
                  <p className="text-[12px] text-slate-500">
                    <span className="font-semibold text-slate-700">Detected columns: </span>
                    {headers.join(', ')}
                  </p>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-3 pt-1">
                <button
                  onClick={handleConfirm}
                  disabled={confirming || missingCols.length > 0}
                  className="h-9 px-5 text-[12.5px] font-semibold text-white rounded-lg transition-all hover:opacity-90 disabled:opacity-50"
                  style={{ background: 'linear-gradient(135deg,rgb(var(--brand-600)),rgb(var(--brand2-600)))' }}
                >
                  {confirming ? 'Importing…' : `Import ${previewRows.length} leads`}
                </button>
                <Button variant="outline" onClick={handleCancel} disabled={confirming} size="sm" className="h-9 text-[12.5px] border-slate-200">
                  Cancel
                </Button>
              </div>
            </>
          ) : (
            <>
              {/* ── Mode switcher ── */}
              <div className="flex gap-3">
                <ModeTab
                  active={mode === 'csv'}
                  onClick={() => setMode('csv')}
                  icon={FileText}
                  label="CSV Upload"
                  description="Upload a .csv or .txt file"
                />
                <ModeTab
                  active={mode === 'sheets'}
                  onClick={() => setMode('sheets')}
                  icon={Sheet}
                  label="Google Sheets"
                  description="Import directly from a shared sheet"
                />
              </div>

              {/* ── CSV mode ── */}
              {mode === 'csv' && (
                <>
                  {/* Expected columns + template */}
                  <div className="form-card">
                    <div className="flex items-center justify-between px-4 py-2.5" style={{ borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
                      <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                        Supported columns <span className="normal-case font-normal text-slate-400">({ALL_COLS.length} total)</span>
                      </p>
                      <button
                        type="button"
                        onClick={downloadTemplate}
                        className="flex items-center gap-1.5 text-[11px] font-semibold text-brand-600 hover:text-brand-700 transition-colors"
                      >
                        <Download size={12} /> Download template
                      </button>
                    </div>
                    <div className="px-4 py-3 space-y-2.5">
                      {COL_GROUPS.map(group => (
                        <div key={group.label} className="flex items-start gap-3">
                          <span className={cn(
                            'shrink-0 text-[9.5px] font-bold uppercase tracking-wider w-16 pt-0.5',
                            group.label === 'Required' ? 'text-brand-600' : 'text-slate-400'
                          )}>
                            {group.label}
                          </span>
                          <div className="flex flex-wrap gap-1.5">
                            {group.cols.map(c => (
                              <span key={c} className={cn(
                                'text-[10.5px] px-2 py-0.5 rounded-full font-mono leading-snug',
                                group.label === 'Required'
                                  ? 'bg-brand-100 text-brand-700 font-bold ring-1 ring-brand-200'
                                  : 'bg-slate-100 text-slate-500'
                              )}>
                                {c}
                              </span>
                            ))}
                          </div>
                        </div>
                      ))}
                      <p className="text-[11px] text-slate-400 pt-1 border-t border-slate-100">
                        Only <span className="text-brand-600 font-semibold">first_name</span> is required.
                        Social columns (twitter, instagram, etc.) accept full URLs.
                        Column names are case-insensitive.
                      </p>
                    </div>
                  </div>

                  {/* Drop zone */}
                  <div className="form-card p-4">
                    <DropZone onFile={handleFile} uploading={uploading} />
                  </div>
                </>
              )}

              {/* ── Google Sheets mode ── */}
              {mode === 'sheets' && (
                <>
                  {/* Instructions */}
                  <div className="form-card px-4 py-3">
                    <div className="flex items-start gap-2.5">
                      <Info size={13} className="text-brand-400 mt-0.5 shrink-0" />
                      <p className="text-[12px] text-slate-500">
                        Make sure your Google Sheet is shared as <span className="font-semibold text-slate-700">"Anyone with the link can view"</span>.
                        Open the sheet → Share → change to Anyone with the link.
                      </p>
                    </div>
                  </div>

                  {/* URL input */}
                  <div className="form-card">
                    <div className="px-4 py-2.5" style={{ borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
                      <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Google Sheets URL</p>
                    </div>
                    <div className="px-4 py-3 space-y-3">
                      <div className="flex gap-2">
                        <Input
                          value={gsUrl}
                          onChange={e => { setGsUrl(e.target.value); setGsUrlError(''); setGsSheets(null) }}
                          placeholder="https://docs.google.com/spreadsheets/d/…"
                          className={cn('h-9 text-[13px] flex-1', gsUrlError && 'border-red-400 focus:ring-red-400')}
                          onKeyDown={e => e.key === 'Enter' && isGSUrl && fetchSheetNames()}
                        />
                        <Button
                          type="button"
                          size="sm"
                          className="h-9 px-4 shrink-0"
                          disabled={!isGSUrl || gsFetching}
                          onClick={fetchSheetNames}
                          style={{ background: 'linear-gradient(135deg,rgb(var(--brand-600)),rgb(var(--brand2-600)))' }}
                        >
                          {gsFetching ? (
                            <span className="flex items-center gap-1.5 text-white">
                              <Loader2 size={13} className="animate-spin" /> Loading…
                            </span>
                          ) : (
                            <span className="text-white">Load Sheets</span>
                          )}
                        </Button>
                      </div>

                      {gsUrlError && (
                        <p className="text-[12px] text-red-500 flex items-center gap-1.5">
                          <XCircle size={12} /> {gsUrlError}
                        </p>
                      )}

                      {!isGSUrl && gsUrl.length > 5 && (
                        <p className="text-[12px] text-amber-600 flex items-center gap-1.5">
                          <AlertCircle size={12} /> This doesn't look like a Google Sheets URL.
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Sheet selector (shown once sheets are fetched) */}
                  {gsSheets !== null && (
                    <div className="form-card">
                      <div className="px-4 py-2.5" style={{ borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
                        <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Sheet / Tab Name</p>
                      </div>
                      <div className="px-4 py-3 space-y-3">

                        {/* Verified banner */}
                        <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2.5">
                          <CheckCircle size={13} className="text-emerald-600 shrink-0" />
                          <p className="text-[12px] text-emerald-700 font-medium">
                            Spreadsheet verified — enter the sheet tab name below and import.
                          </p>
                        </div>

                        <div className="space-y-1">
                          <p className="text-[11px] text-slate-500">
                            Tab name exactly as shown at the bottom of your Google Sheet (e.g. <span className="font-mono">Sheet1</span>)
                          </p>
                          <Input
                            value={gsSheet}
                            onChange={e => setGsSheet(e.target.value)}
                            placeholder="Sheet1"
                            className="h-9 text-[13px]"
                            autoFocus
                          />
                        </div>

                        <div className="flex justify-end pt-1">
                          <button
                            type="button"
                            disabled={!gsSheet.trim() || gsImporting}
                            onClick={importFromSheets}
                            className="h-9 px-5 text-[12.5px] font-semibold text-white rounded-lg transition-all hover:opacity-90 disabled:opacity-50 flex items-center gap-1.5"
                            style={{ background: 'linear-gradient(135deg,rgb(var(--brand-600)),rgb(var(--brand2-600)))' }}
                          >
                            {gsImporting ? (
                              <><Loader2 size={13} className="animate-spin" /> Importing…</>
                            ) : (
                              <><ExternalLink size={13} /> Import "{gsSheet}"</>
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}
            </>
          )}
        </div>
      </AppLayout>
    </>
  )
}
