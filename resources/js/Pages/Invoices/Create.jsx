import { Head, Link, useForm, usePage } from '@inertiajs/react'
import AppLayout from '@/Components/Layout/AppLayout'
import { Button } from '@/Components/ui/button'
import { Input } from '@/Components/ui/input'
import { Label } from '@/Components/ui/label'
import { Textarea } from '@/Components/ui/textarea'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/Components/ui/select'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter
} from '@/Components/ui/dialog'
import {
  ChevronLeft, Plus, Trash2, Printer, Send, Save, Check, Search,
} from 'lucide-react'
import { toast } from 'sonner'
import { useState, useMemo } from 'react'
import { cn } from '@/lib/utils'

const STATUSES = ['draft', 'sent', 'paid', 'overdue']

function Field({ label, error, required, children }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-[12px] font-medium text-slate-600">
        {label}{required && <span className="text-red-500 ml-0.5">*</span>}
      </Label>
      {children}
      {error && <p className="text-[11px] text-red-500">{error}</p>}
    </div>
  )
}

function Card({ title, children, className = '', overflow = 'overflow-hidden' }) {
  return (
    <div className={`bg-white rounded-xl border border-slate-200 shadow-sm ${overflow} ${className}`}>
      {title && (
        <div className="px-5 py-3 border-b border-slate-100 bg-slate-50/50">
          <h3 className="text-[13px] font-semibold text-slate-700">{title}</h3>
        </div>
      )}
      <div className="p-5">{children}</div>
    </div>
  )
}

// Live invoice preview component
function InvoicePreview({ data, items, companyName }) {
  const subtotal = useMemo(
    () => items.reduce((s, i) => s + (parseFloat(i.quantity) || 0) * (parseFloat(i.rate) || 0), 0),
    [items]
  )
  const taxAmt = subtotal * ((parseFloat(data.tax_rate) || 0) / 100)
  const total  = subtotal + taxAmt

  const fmt = (n) => Number(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

  return (
    <div id="invoice-print-area" className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden text-[12px] text-slate-700">
      {/* Header */}
      <div className="px-7 py-6 border-b border-slate-100" style={{ background: 'linear-gradient(135deg, #6366F1 0%, #7C3AED 100%)' }}>
        <div className="flex items-start justify-between">
          <div>
            <p className="text-white/60 text-[10px] font-semibold uppercase tracking-widest mb-0.5">Invoice</p>
            <p className="text-white text-[20px] font-bold tracking-tight">
              {data.invoice_number || 'INV-XXXX-XXX'}
            </p>
          </div>
          <div className="text-right">
            <p className="text-white font-bold text-[14px]">{companyName || 'Your Company'}</p>
          </div>
        </div>
      </div>

      <div className="px-7 py-5 space-y-5">
        {/* Meta row */}
        <div className="grid grid-cols-3 gap-4">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-0.5">Bill To</p>
            {data.lead_id ? (
              <>
                <p className="font-semibold text-slate-800 text-[12.5px]">{data._leadName || '—'}</p>
                {data._leadCompany && <p className="text-slate-500">{data._leadCompany}</p>}
                {data._leadEmail && <p className="text-slate-500">{data._leadEmail}</p>}
              </>
            ) : (
              <p className="text-slate-400 italic">No lead selected</p>
            )}
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-0.5">Issue Date</p>
            <p className="text-slate-800 font-medium">{data.issue_date || '—'}</p>
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-0.5">Due Date</p>
            <p className="text-slate-800 font-medium">{data.due_date || '—'}</p>
          </div>
        </div>

        {/* Items table */}
        <div>
          <table className="w-full text-[11.5px]">
            <thead>
              <tr className="border-b-2 border-slate-200">
                <th className="text-left pb-2 font-semibold text-slate-500 uppercase tracking-wide text-[10px]">Description</th>
                <th className="text-right pb-2 font-semibold text-slate-500 uppercase tracking-wide text-[10px] w-12">Qty</th>
                <th className="text-right pb-2 font-semibold text-slate-500 uppercase tracking-wide text-[10px] w-20">Rate</th>
                <th className="text-right pb-2 font-semibold text-slate-500 uppercase tracking-wide text-[10px] w-20">Amount</th>
              </tr>
            </thead>
            <tbody>
              {items.length === 0 && (
                <tr>
                  <td colSpan={4} className="py-4 text-center text-slate-400 italic">No items added</td>
                </tr>
              )}
              {items.map((item, i) => (
                <tr key={i} className="border-b border-slate-100">
                  <td className="py-2 pr-4 text-slate-700">{item.description || <span className="text-slate-400 italic">—</span>}</td>
                  <td className="py-2 text-right text-slate-600">{item.quantity || '—'}</td>
                  <td className="py-2 text-right text-slate-600">${fmt(item.rate || 0)}</td>
                  <td className="py-2 text-right font-medium text-slate-800">
                    ${fmt((parseFloat(item.quantity) || 0) * (parseFloat(item.rate) || 0))}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totals */}
        <div className="flex justify-end">
          <div className="w-52 space-y-1.5">
            <div className="flex justify-between text-slate-600">
              <span>Subtotal</span>
              <span>${fmt(subtotal)}</span>
            </div>
            {(parseFloat(data.tax_rate) || 0) > 0 && (
              <div className="flex justify-between text-slate-600">
                <span>Tax ({data.tax_rate}%)</span>
                <span>${fmt(taxAmt)}</span>
              </div>
            )}
            <div className="flex justify-between font-bold text-slate-900 text-[13.5px] pt-1.5 border-t border-slate-200">
              <span>Total</span>
              <span>${fmt(total)}</span>
            </div>
          </div>
        </div>

        {/* Notes */}
        {data.notes && (
          <div className="pt-2 border-t border-slate-100">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1">Notes</p>
            <p className="text-slate-600 whitespace-pre-wrap">{data.notes}</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default function InvoiceCreate({ leads = [], next_number, default_dates }) {
  const { props } = usePage()
  const companyName = props?.auth?.user?.company_name || 'CRM'

  const { data, setData, post, processing, errors } = useForm({
    lead_id:        '',
    invoice_number: next_number ?? '',
    status:         'draft',
    issue_date:     default_dates?.issue ?? '',
    due_date:       default_dates?.due ?? '',
    tax_rate:       '0',
    notes:          '',
    items:          [{ description: '', quantity: '1', rate: '' }],
    // UI-only preview helpers (not submitted)
    _leadName:    '',
    _leadCompany: '',
    _leadEmail:   '',
  })

  const [sendDialog, setSendDialog]   = useState(false)
  const [sendEmail, setSendEmail]     = useState('')
  const [leadSearch, setLeadSearch]   = useState('')
  const [leadDropdown, setLeadDropdown] = useState(false)

  const filteredLeads = useMemo(() =>
    leads.filter(l =>
      l.full_name.toLowerCase().includes(leadSearch.toLowerCase()) ||
      (l.company ?? '').toLowerCase().includes(leadSearch.toLowerCase()) ||
      (l.primary_email ?? '').toLowerCase().includes(leadSearch.toLowerCase())
    ).slice(0, 8),
  [leads, leadSearch])

  const selectLead = (lead) => {
    setData(d => ({
      ...d,
      lead_id:      lead.id,
      _leadName:    lead.full_name,
      _leadCompany: lead.company ?? '',
      _leadEmail:   lead.primary_email ?? '',
    }))
    setSendEmail(lead.primary_email ?? '')
    setLeadSearch(lead.full_name + (lead.company ? ` · ${lead.company}` : ''))
    setLeadDropdown(false)
  }

  const clearLead = () => {
    setData(d => ({ ...d, lead_id: '', _leadName: '', _leadCompany: '', _leadEmail: '' }))
    setLeadSearch('')
  }

  // Item helpers
  const addItem = () =>
    setData('items', [...data.items, { description: '', quantity: '1', rate: '' }])

  const removeItem = (i) =>
    setData('items', data.items.filter((_, idx) => idx !== i))

  const setItem = (i, field, val) =>
    setData('items', data.items.map((item, idx) => idx === i ? { ...item, [field]: val } : item))

  const handleSubmit = (status) => {
    setData('status', status)
    post('/invoices', {
      onSuccess: () => toast.success('Invoice created!'),
      onError:   () => toast.error('Please fix the errors and try again.'),
    })
  }

  const handlePrint = () => {
    window.print()
  }

  const handleSend = (e) => {
    e.preventDefault()
    setData('status', 'sent')
    post('/invoices', {
      onSuccess: () => {
        toast.success(`Invoice sent to ${sendEmail}`)
        setSendDialog(false)
      },
      onError: () => toast.error('Please fix the errors and try again.'),
    })
  }

  return (
    <>
      <Head title="New Invoice" />
      {/* Print styles */}
      <style>{`
        @media print {
          body * { visibility: hidden !important; }
          #invoice-print-area, #invoice-print-area * { visibility: visible !important; }
          #invoice-print-area { position: fixed; inset: 0; padding: 40px; box-shadow: none !important; border: none !important; }
        }
      `}</style>

      <AppLayout title="New Invoice">
        <div className="flex items-center gap-2 mb-4">
          <Link href="/invoices">
            <Button variant="ghost" size="sm" className="gap-1.5 text-slate-500 hover:text-slate-700 -ml-1">
              <ChevronLeft size={14} /> Invoices
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-[1fr_420px] gap-5">
          {/* ── LEFT: Form ───────────────────────── */}
          <div className="space-y-4 min-w-0">

            {/* Invoice details */}
            <Card title="Invoice Details">
              <div className="grid grid-cols-2 gap-4">
                <Field label="Invoice Number" required error={errors.invoice_number}>
                  <Input
                    value={data.invoice_number}
                    onChange={e => setData('invoice_number', e.target.value)}
                    className="h-9 text-[13px]"
                  />
                </Field>
                <Field label="Status" error={errors.status}>
                  <Select value={data.status} onValueChange={v => setData('status', v)}>
                    <SelectTrigger className="h-9 text-[13px]"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {STATUSES.map(s => (
                        <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
                <Field label="Issue Date" required error={errors.issue_date}>
                  <Input
                    type="date" value={data.issue_date}
                    onChange={e => setData('issue_date', e.target.value)}
                    className="h-9 text-[13px]"
                  />
                </Field>
                <Field label="Due Date" required error={errors.due_date}>
                  <Input
                    type="date" value={data.due_date}
                    onChange={e => setData('due_date', e.target.value)}
                    className="h-9 text-[13px]"
                  />
                </Field>
              </div>
            </Card>

            {/* Lead selection */}
            <Card title="Bill To (Lead)" overflow="overflow-visible">
              <Field label="Search Lead" error={errors.lead_id}>
                <div className="relative">
                  <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  <Input
                    value={leadSearch}
                    onChange={e => { setLeadSearch(e.target.value); setLeadDropdown(true); if (!e.target.value) clearLead() }}
                    onFocus={() => setLeadDropdown(true)}
                    placeholder="Search by name, company, or email…"
                    className="pl-8 h-9 text-[13px]"
                  />
                  {data.lead_id && (
                    <button
                      onClick={clearLead}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-[10px]"
                    >✕</button>
                  )}

                  {leadDropdown && !data.lead_id && filteredLeads.length > 0 && (
                    <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-lg overflow-hidden max-h-52 overflow-y-auto">
                      {filteredLeads.map(lead => (
                        <button
                          key={lead.id}
                          type="button"
                          onClick={() => selectLead(lead)}
                          className="w-full text-left px-3 py-2.5 hover:bg-slate-50 transition-colors border-b border-slate-100 last:border-0"
                        >
                          <p className="text-[13px] font-medium text-slate-800">{lead.full_name}</p>
                          {(lead.company || lead.primary_email) && (
                            <p className="text-[11px] text-slate-400 mt-0.5">
                              {[lead.company, lead.primary_email].filter(Boolean).join(' · ')}
                            </p>
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </Field>
            </Card>

            {/* Line items */}
            <Card title="Line Items">
              <div className="space-y-2">
                {/* Header */}
                <div className="grid grid-cols-[1fr_80px_100px_100px_32px] gap-2 pb-1 border-b border-slate-100">
                  {['Description', 'Qty', 'Rate ($)', 'Amount'].map(h => (
                    <p key={h} className="text-[10.5px] font-semibold text-slate-400 uppercase tracking-wide">{h}</p>
                  ))}
                  <span />
                </div>

                {data.items.map((item, i) => {
                  const amount = (parseFloat(item.quantity) || 0) * (parseFloat(item.rate) || 0)
                  return (
                    <div key={i} className="grid grid-cols-[1fr_80px_100px_100px_32px] gap-2 items-center">
                      <Input
                        value={item.description}
                        onChange={e => setItem(i, 'description', e.target.value)}
                        placeholder="Service or product description"
                        className={cn('h-8 text-[12.5px]', errors[`items.${i}.description`] && 'border-red-300')}
                      />
                      <Input
                        type="number" min="0.01" step="0.01"
                        value={item.quantity}
                        onChange={e => setItem(i, 'quantity', e.target.value)}
                        className="h-8 text-[12.5px] text-center"
                      />
                      <Input
                        type="number" min="0" step="0.01"
                        value={item.rate}
                        onChange={e => setItem(i, 'rate', e.target.value)}
                        placeholder="0.00"
                        className="h-8 text-[12.5px]"
                      />
                      <div className="h-8 flex items-center px-2 bg-slate-50 rounded-md border border-slate-200">
                        <span className="text-[12px] text-slate-700 font-medium">
                          ${amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                      <button
                        onClick={() => removeItem(i)}
                        disabled={data.items.length === 1}
                        className="p-1.5 rounded-md hover:bg-red-50 text-slate-300 hover:text-red-400 transition-colors disabled:opacity-30"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  )
                })}

                <button
                  type="button"
                  onClick={addItem}
                  className="flex items-center gap-1.5 text-[12px] text-violet-600 hover:text-violet-800 font-medium mt-1 transition-colors"
                >
                  <Plus size={13} /> Add line item
                </button>
              </div>

              {/* Totals summary */}
              <div className="mt-4 pt-4 border-t border-slate-100 space-y-2">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <Label className="text-[12px] text-slate-600 whitespace-nowrap">Tax Rate (%)</Label>
                    <Input
                      type="number" min="0" max="100" step="0.1"
                      value={data.tax_rate}
                      onChange={e => setData('tax_rate', e.target.value)}
                      className="h-8 w-20 text-[12.5px]"
                    />
                  </div>
                  <div className="text-right space-y-1">
                    {(() => {
                      const sub = data.items.reduce((s, i) => s + (parseFloat(i.quantity)||0)*(parseFloat(i.rate)||0), 0)
                      const tax = sub * ((parseFloat(data.tax_rate)||0)/100)
                      return (
                        <>
                          <div className="flex gap-6 text-[12px] text-slate-500 justify-end">
                            <span>Subtotal</span>
                            <span className="w-24 text-right">${sub.toLocaleString('en-US',{minimumFractionDigits:2})}</span>
                          </div>
                          {tax > 0 && (
                            <div className="flex gap-6 text-[12px] text-slate-500 justify-end">
                              <span>Tax ({data.tax_rate}%)</span>
                              <span className="w-24 text-right">${tax.toLocaleString('en-US',{minimumFractionDigits:2})}</span>
                            </div>
                          )}
                          <div className="flex gap-6 text-[13.5px] font-bold text-slate-800 justify-end pt-1 border-t border-slate-200">
                            <span>Total</span>
                            <span className="w-24 text-right">${(sub+tax).toLocaleString('en-US',{minimumFractionDigits:2})}</span>
                          </div>
                        </>
                      )
                    })()}
                  </div>
                </div>
              </div>
            </Card>

            {/* Notes */}
            <Card title="Notes">
              <Textarea
                value={data.notes}
                onChange={e => setData('notes', e.target.value)}
                placeholder="Payment terms, bank details, or any other notes…"
                rows={3}
                className="text-[13px] resize-none"
              />
            </Card>

            {/* Action buttons */}
            <div className="flex items-center gap-3 flex-wrap pb-6">
              <Button
                onClick={() => handleSubmit('draft')}
                disabled={processing}
                variant="outline"
                className="gap-2"
              >
                <Save size={14} /> Save as Draft
              </Button>
              <Button
                onClick={handlePrint}
                variant="outline"
                className="gap-2"
              >
                <Printer size={14} /> Download / Print PDF
              </Button>
              <Button
                onClick={() => setSendDialog(true)}
                disabled={processing}
                className="gap-2"
                style={{ background: 'linear-gradient(135deg, #6366F1, #7C3AED)' }}
              >
                <Send size={14} /> Send via Email
              </Button>
            </div>
          </div>

          {/* ── RIGHT: Live Preview ────────────── */}
          <div className="xl:sticky xl:top-6 xl:self-start space-y-3">
            <p className="text-[11.5px] font-semibold text-slate-400 uppercase tracking-widest px-1">Live Preview</p>
            <InvoicePreview data={data} items={data.items} companyName={companyName} />
          </div>
        </div>
      </AppLayout>

      {/* Send via Email Dialog */}
      <Dialog open={sendDialog} onOpenChange={setSendDialog}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-[15px]">Send Invoice via Email</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSend} className="space-y-4">
            <Field label="Recipient Email" required>
              <Input
                type="email"
                value={sendEmail}
                onChange={e => setSendEmail(e.target.value)}
                placeholder="recipient@example.com"
                className="h-9 text-[13px]"
                required
                autoFocus
              />
            </Field>
            <p className="text-[12px] text-slate-500">
              The invoice will be saved and marked as <strong>Sent</strong>. You can download the PDF and send it manually.
            </p>
            <DialogFooter className="gap-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setSendDialog(false)}>Cancel</Button>
              <Button
                type="submit"
                size="sm"
                disabled={processing}
                className="gap-1.5"
                style={{ background: 'linear-gradient(135deg, #6366F1, #7C3AED)' }}
              >
                <Send size={13} /> Confirm Send
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}
