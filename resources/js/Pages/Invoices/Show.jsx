import { Head, Link, router, usePage, useForm } from '@inertiajs/react'
import AppLayout from '@/Components/Layout/AppLayout'
import { Button } from '@/Components/ui/button'
import { Input } from '@/Components/ui/input'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter
} from '@/Components/ui/dialog'
import {
  ChevronLeft, Printer, Send, Trash2, Check, ExternalLink,
} from 'lucide-react'
import { toast } from 'sonner'
import { useState } from 'react'

const STATUS_CONFIG = {
  draft:   { label: 'Draft',   cls: 'bg-slate-100 text-slate-600 border-slate-200' },
  sent:    { label: 'Sent',    cls: 'bg-blue-50 text-blue-600 border-blue-200' },
  paid:    { label: 'Paid',    cls: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  overdue: { label: 'Overdue', cls: 'bg-red-50 text-red-600 border-red-200' },
}

function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.draft
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[12px] font-semibold border ${cfg.cls}`}>
      {cfg.label}
    </span>
  )
}

export default function InvoiceShow({ invoice }) {
  const { props } = usePage()
  const companyName = props?.auth?.user?.company_name || 'CRM'
  const flash       = props?.flash ?? {}

  const [sendDialog, setSendDialog] = useState(false)
  const { data, setData, post, processing } = useForm({ email: invoice.lead?.primary_email ?? '' })

  const fmt = (n) => Number(n).toLocaleString('en-US', { minimumFractionDigits: 2 })

  const handleDelete = () => {
    if (!confirm(`Delete ${invoice.invoice_number}? This cannot be undone.`)) return
    router.delete(`/invoices/${invoice.id}`, {
      onSuccess: () => toast.success('Invoice deleted'),
      onError:   () => toast.error('Delete failed'),
    })
  }

  const handleSend = (e) => {
    e.preventDefault()
    post(`/invoices/${invoice.id}/send`, {
      onSuccess: () => { toast.success(`Marked as sent to ${data.email}`); setSendDialog(false) },
      onError:   () => toast.error('Failed to update invoice'),
    })
  }

  return (
    <>
      <Head title={invoice.invoice_number} />
      <style>{`
        @media print {
          body * { visibility: hidden !important; }
          #invoice-print-area, #invoice-print-area * { visibility: visible !important; }
          #invoice-print-area { position: fixed; inset: 0; padding: 40px; box-shadow: none !important; border: none !important; }
        }
      `}</style>

      <AppLayout title={invoice.invoice_number}>
        <div className="max-w-3xl mx-auto">
          {/* Toolbar */}
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <Link href="/invoices">
                <Button variant="ghost" size="sm" className="gap-1.5 text-slate-500 -ml-1">
                  <ChevronLeft size={14} /> Invoices
                </Button>
              </Link>
              <span className="text-slate-300">/</span>
              <span className="text-[13px] font-medium text-slate-700">{invoice.invoice_number}</span>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => window.print()} className="gap-1.5">
                <Printer size={13} /> Print / PDF
              </Button>
              {invoice.status !== 'paid' && (
                <Button
                  size="sm"
                  onClick={() => setSendDialog(true)}
                  className="gap-1.5"
                  style={{ background: 'linear-gradient(135deg, rgb(var(--brand2-500)), rgb(var(--brand-600)))' }}
                >
                  <Send size={13} /> {invoice.status === 'sent' ? 'Resend' : 'Send Invoice'}
                </Button>
              )}
              <Button variant="ghost" size="sm" onClick={handleDelete} className="text-slate-400 hover:text-red-500 px-2">
                <Trash2 size={14} />
              </Button>
            </div>
          </div>

          {/* Sent confirmation banner */}
          {invoice.sent_at && (
            <div className="flex items-center gap-2.5 px-4 py-3 mb-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-[12.5px] font-medium">
              <Check size={14} className="shrink-0" />
              Invoice sent to <strong>{invoice.sent_to_email}</strong> on {invoice.sent_at}
            </div>
          )}

          {/* Flash success */}
          {flash.success && (
            <div className="flex items-center gap-2 px-4 py-3 mb-4 rounded-xl bg-brand-50 border border-brand-200 text-brand-700 text-[12.5px] font-medium">
              <Check size={14} className="shrink-0" /> {flash.success}
            </div>
          )}

          {/* Invoice card */}
          <div id="invoice-print-area" className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            {/* Header */}
            <div className="px-8 py-6 border-b border-slate-100" style={{ background: 'linear-gradient(135deg, rgb(var(--brand2-500)) 0%, rgb(var(--brand-600)) 100%)' }}>
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-white/60 text-[10px] font-semibold uppercase tracking-widest mb-0.5">Invoice</p>
                  <p className="text-white text-[22px] font-bold tracking-tight">{invoice.invoice_number}</p>
                  <div className="mt-2">
                    <StatusBadge status={invoice.status} />
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-white font-bold text-[15px]">{companyName}</p>
                </div>
              </div>
            </div>

            <div className="px-8 py-6 space-y-6">
              {/* Meta */}
              <div className="grid grid-cols-3 gap-6 text-[13px]">
                <div>
                  <p className="text-[10.5px] font-semibold uppercase tracking-wider text-slate-400 mb-1">Bill To</p>
                  {invoice.lead ? (
                    <>
                      <p className="font-semibold text-slate-800">{invoice.lead.full_name}</p>
                      {invoice.lead.company && <p className="text-slate-500">{invoice.lead.company}</p>}
                      {invoice.lead.primary_email && (
                        <p className="text-slate-500">{invoice.lead.primary_email}</p>
                      )}
                    </>
                  ) : (
                    <p className="text-slate-400 italic">No lead attached</p>
                  )}
                </div>
                <div>
                  <p className="text-[10.5px] font-semibold uppercase tracking-wider text-slate-400 mb-1">Issue Date</p>
                  <p className="font-medium text-slate-800">{invoice.issue_date}</p>
                </div>
                <div>
                  <p className="text-[10.5px] font-semibold uppercase tracking-wider text-slate-400 mb-1">Due Date</p>
                  <p className="font-medium text-slate-800">{invoice.due_date}</p>
                </div>
              </div>

              {/* Items */}
              <div>
                <table className="w-full text-[13px]">
                  <thead>
                    <tr className="border-b-2 border-slate-200">
                      <th className="text-left pb-2.5 font-semibold text-slate-500 uppercase tracking-wide text-[10.5px]">Description</th>
                      <th className="text-right pb-2.5 font-semibold text-slate-500 uppercase tracking-wide text-[10.5px] w-16">Qty</th>
                      <th className="text-right pb-2.5 font-semibold text-slate-500 uppercase tracking-wide text-[10.5px] w-24">Rate</th>
                      <th className="text-right pb-2.5 font-semibold text-slate-500 uppercase tracking-wide text-[10.5px] w-28">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(invoice.items ?? []).map((item) => (
                      <tr key={item.id} className="border-b border-slate-100">
                        <td className="py-3 pr-4 text-slate-700">{item.description}</td>
                        <td className="py-3 text-right text-slate-600">{item.quantity}</td>
                        <td className="py-3 text-right text-slate-600">${fmt(item.rate)}</td>
                        <td className="py-3 text-right font-semibold text-slate-800">${fmt(item.amount)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Totals */}
              <div className="flex justify-end">
                <div className="w-56 space-y-2 text-[13px]">
                  <div className="flex justify-between text-slate-600">
                    <span>Subtotal</span>
                    <span>${fmt(invoice.subtotal)}</span>
                  </div>
                  {invoice.tax_rate > 0 && (
                    <div className="flex justify-between text-slate-600">
                      <span>Tax ({invoice.tax_rate}%)</span>
                      <span>${fmt(invoice.tax_amount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-bold text-slate-900 text-[15px] pt-2 border-t-2 border-slate-200">
                    <span>Total</span>
                    <span>${fmt(invoice.total)}</span>
                  </div>
                </div>
              </div>

              {/* Notes */}
              {invoice.notes && (
                <div className="pt-2 border-t border-slate-100">
                  <p className="text-[10.5px] font-semibold uppercase tracking-wider text-slate-400 mb-1.5">Notes</p>
                  <p className="text-[13px] text-slate-600 whitespace-pre-wrap">{invoice.notes}</p>
                </div>
              )}

              {/* Lead link */}
              {invoice.lead && (
                <div className="pt-2 border-t border-slate-100 flex items-center gap-2">
                  <Link
                    href={`/leads/${invoice.lead.id}`}
                    className="inline-flex items-center gap-1.5 text-[12px] text-brand-600 hover:text-brand-800 font-medium transition-colors"
                  >
                    <ExternalLink size={12} /> View Lead Profile
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </AppLayout>

      {/* Send dialog */}
      <Dialog open={sendDialog} onOpenChange={setSendDialog}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-[15px]">Send Invoice</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSend} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[12px] font-medium text-slate-600">
                Recipient Email <span className="text-red-500">*</span>
              </label>
              <Input
                type="email"
                value={data.email}
                onChange={e => setData('email', e.target.value)}
                placeholder="recipient@example.com"
                className="h-9 text-[13px]"
                required
                autoFocus
              />
            </div>
            <p className="text-[12px] text-slate-500">
              This will mark the invoice as <strong>Sent</strong> with the recipient email and current timestamp.
            </p>
            <DialogFooter className="gap-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setSendDialog(false)}>Cancel</Button>
              <Button
                type="submit" size="sm" disabled={processing}
                className="gap-1.5" style={{ background: 'linear-gradient(135deg, rgb(var(--brand2-500)), rgb(var(--brand-600)))' }}
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
