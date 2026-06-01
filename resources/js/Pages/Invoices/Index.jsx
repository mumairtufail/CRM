import { Head, Link, router } from '@inertiajs/react'
import AppLayout from '@/Components/Layout/AppLayout'
import PageHeader from '@/Components/Common/PageHeader'
import EmptyState from '@/Components/Common/EmptyState'
import { Button } from '@/Components/ui/button'
import { Input } from '@/Components/ui/input'
import {
  FileText, Plus, Search, ChevronLeft, ChevronRight,
  Eye, Trash2, Send,
} from 'lucide-react'
import { useState, useCallback } from 'react'
import { toast } from 'sonner'

const STATUS_CONFIG = {
  draft:   { label: 'Draft',   cls: 'bg-slate-100 text-slate-600 border-slate-200' },
  sent:    { label: 'Sent',    cls: 'bg-blue-50 text-blue-600 border-blue-200' },
  paid:    { label: 'Paid',    cls: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  overdue: { label: 'Overdue', cls: 'bg-red-50 text-red-600 border-red-200' },
}

function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.draft
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold border ${cfg.cls}`}>
      {cfg.label}
    </span>
  )
}

function StatPill({ label, value, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 rounded-lg text-[12px] font-medium transition-all ${
        active
          ? 'bg-violet-600 text-white shadow-sm'
          : 'bg-white text-slate-600 border border-slate-200 hover:border-violet-300 hover:text-violet-600'
      }`}
    >
      {label} <span className={`ml-1 text-[11px] ${active ? 'opacity-75' : 'text-slate-400'}`}>({value})</span>
    </button>
  )
}

export default function InvoicesIndex({ invoices, filters, totals }) {
  const [search, setSearch] = useState(filters?.search ?? '')
  const { data = [], current_page, last_page, total } = invoices

  const applyFilter = useCallback((params) => {
    router.get('/invoices', { ...filters, ...params }, { preserveState: true, replace: true })
  }, [filters])

  const handleSearch = (e) => {
    e.preventDefault()
    applyFilter({ search, page: 1 })
  }

  const handleDelete = (id, number) => {
    if (!confirm(`Delete invoice ${number}? This cannot be undone.`)) return
    router.delete(`/invoices/${id}`, {
      onSuccess: () => toast.success(`Invoice ${number} deleted`),
      onError:   () => toast.error('Failed to delete invoice'),
    })
  }

  const activeStatus = filters?.status ?? ''

  return (
    <>
      <Head title="Invoices" />
      <AppLayout title="Invoices">
        <PageHeader
          title="Invoices"
          description={`${total ?? 0} total invoices`}
          action={
            <Link href="/invoices/create">
              <Button size="sm" className="gap-1.5 h-9">
                <Plus size={14} /> New Invoice
              </Button>
            </Link>
          }
        />

        {/* Status filter pills + search */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-4">
          <div className="flex items-center gap-2 flex-wrap">
            <StatPill label="All"     value={totals?.all ?? 0}     active={!activeStatus}    onClick={() => applyFilter({ status: '', page: 1 })} />
            <StatPill label="Draft"   value={totals?.draft ?? 0}   active={activeStatus === 'draft'}   onClick={() => applyFilter({ status: 'draft', page: 1 })} />
            <StatPill label="Sent"    value={totals?.sent ?? 0}    active={activeStatus === 'sent'}    onClick={() => applyFilter({ status: 'sent', page: 1 })} />
            <StatPill label="Paid"    value={totals?.paid ?? 0}    active={activeStatus === 'paid'}    onClick={() => applyFilter({ status: 'paid', page: 1 })} />
            <StatPill label="Overdue" value={totals?.overdue ?? 0} active={activeStatus === 'overdue'} onClick={() => applyFilter({ status: 'overdue', page: 1 })} />
          </div>
          <form onSubmit={handleSearch} className="sm:ml-auto flex gap-2">
            <div className="relative flex-1 sm:flex-none">
              <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <Input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search invoices…"
                className="pl-8 h-8 text-[13px] w-full sm:w-52"
              />
            </div>
            <Button type="submit" variant="outline" size="sm" className="h-8 shrink-0">Search</Button>
          </form>
        </div>

        {/* Table */}
        {data.length === 0 ? (
          <EmptyState
            icon={FileText}
            title="No invoices yet"
            description="Create your first invoice to get started."
            action={<Link href="/invoices/create"><Button size="sm" className="gap-1.5"><Plus size={13} />New Invoice</Button></Link>}
          />
        ) : (
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
            <table className="w-full text-[13px]">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/60">
                  <th className="text-left px-4 py-3 font-semibold text-slate-500 text-[11.5px] uppercase tracking-wide">Invoice</th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-500 text-[11.5px] uppercase tracking-wide">Lead / Company</th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-500 text-[11.5px] uppercase tracking-wide">Amount</th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-500 text-[11.5px] uppercase tracking-wide">Status</th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-500 text-[11.5px] uppercase tracking-wide">Issue Date</th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-500 text-[11.5px] uppercase tracking-wide">Due Date</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data.map(inv => (
                  <tr key={inv.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-4 py-3">
                      <Link href={`/invoices/${inv.id}`} className="font-semibold text-violet-600 hover:text-violet-800 transition-colors">
                        {inv.invoice_number}
                      </Link>
                      <p className="text-[11px] text-slate-400 mt-0.5">{inv.created_at}</p>
                    </td>
                    <td className="px-4 py-3">
                      {inv.lead ? (
                        <>
                          <p className="font-medium text-slate-800">{inv.lead.full_name}</p>
                          {inv.lead.company && <p className="text-[11.5px] text-slate-500">{inv.lead.company}</p>}
                        </>
                      ) : (
                        <span className="text-slate-400 italic">No lead</span>
                      )}
                    </td>
                    <td className="px-4 py-3 font-semibold text-slate-800">
                      ${Number(inv.total).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={inv.status} />
                    </td>
                    <td className="px-4 py-3 text-slate-500">{inv.issue_date}</td>
                    <td className="px-4 py-3 text-slate-500">{inv.due_date}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity justify-end">
                        <Link href={`/invoices/${inv.id}`}>
                          <button className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors" title="View">
                            <Eye size={14} />
                          </button>
                        </Link>
                        <button
                          onClick={() => handleDelete(inv.id, inv.invoice_number)}
                          className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors"
                          title="Delete"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>

            {/* Pagination */}
            {last_page > 1 && (
              <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100 bg-slate-50/40">
                <p className="text-[12px] text-slate-500">
                  Page {current_page} of {last_page} · {total} invoices
                </p>
                <div className="flex gap-1">
                  <Button
                    variant="outline" size="sm" className="h-7 px-2"
                    disabled={current_page <= 1}
                    onClick={() => applyFilter({ page: current_page - 1 })}
                  >
                    <ChevronLeft size={13} />
                  </Button>
                  <Button
                    variant="outline" size="sm" className="h-7 px-2"
                    disabled={current_page >= last_page}
                    onClick={() => applyFilter({ page: current_page + 1 })}
                  >
                    <ChevronRight size={13} />
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </AppLayout>
    </>
  )
}
