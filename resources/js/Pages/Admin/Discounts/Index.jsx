import { Head, router, useForm } from '@inertiajs/react'
import { useState, useEffect } from 'react'
import AdminLayout from '@/Components/Layout/AdminLayout'
import PageHeader from '@/Components/Common/PageHeader'
import DataTable from '@/Components/Common/DataTable'
import { Badge } from '@/Components/ui/badge'
import { Checkbox } from '@/Components/ui/checkbox'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/Components/ui/dialog'
import { Plus, Pencil, Archive } from 'lucide-react'
import { toast } from 'sonner'

function emptyForm() {
  return {
    description: '',
    code: '',
    type: 'percentage',
    amount: '',
    recur: false,
    maximum_recurring_intervals: '',
    usage_limit: '',
    restrict_to: [],
    expires_at: '',
  }
}

function DiscountFormDialog({ open, onOpenChange, priceOptions, editing, onSaved }) {
  const form = useForm(emptyForm())

  useEffect(() => {
    if (!open) { form.reset(); return }
    if (editing) {
      form.setData({
        description: editing.description,
        code: editing.code || '',
        type: editing.type === 'percentage' ? 'percentage' : 'flat',
        amount: editing.type === 'percentage' ? editing.amount : (Number(editing.amount) / 100).toFixed(2),
        recur: editing.recur,
        maximum_recurring_intervals: editing.maximum_recurring_intervals ?? '',
        usage_limit: editing.usage_limit ?? '',
        restrict_to: editing.restrict_to || [],
        expires_at: editing.expires_at || '',
      })
    } else {
      form.setData(emptyForm())
    }
    form.clearErrors()
  }, [editing, open])

  const togglePrice = (id) => {
    const has = form.data.restrict_to.includes(id)
    form.setData('restrict_to', has ? form.data.restrict_to.filter(p => p !== id) : [...form.data.restrict_to, id])
  }

  const submit = () => {
    const options = {
      preserveScroll: true,
      onSuccess: () => { toast.success(editing ? 'Discount updated' : 'Discount created'); onSaved() },
      onError: () => toast.error('Please check the form for errors'),
    }
    if (editing) {
      form.patch(`/admin/discounts/${editing.id}`, options)
    } else {
      form.post('/admin/discounts', options)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{editing ? 'Edit discount' : 'New discount code'}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 max-h-[68vh] overflow-y-auto pr-1">
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Internal description</label>
            <input
              value={form.data.description}
              onChange={e => form.setData('description', e.target.value)}
              placeholder="e.g. Black Friday 2026"
              className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400"
            />
            {form.errors.description && <p className="text-xs text-red-500 mt-1">{form.errors.description}</p>}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Voucher code</label>
            <input
              value={form.data.code}
              onChange={e => form.setData('code', e.target.value.toUpperCase())}
              placeholder="e.g. WELCOME25"
              className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-brand-400"
            />
            {form.errors.code && <p className="text-xs text-red-500 mt-1">{form.errors.code}</p>}
            <p className="text-xs text-slate-400 mt-1">What the customer types at checkout.</p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Type</label>
              <select
                value={form.data.type}
                onChange={e => form.setData('type', e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400"
              >
                <option value="percentage">Percentage off</option>
                <option value="flat">Flat amount off (USD)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                Amount {form.data.type === 'percentage' ? '(%)' : '($)'}
              </label>
              <input
                type="number" min="0" step={form.data.type === 'percentage' ? '1' : '0.01'}
                value={form.data.amount}
                onChange={e => form.setData('amount', e.target.value)}
                placeholder={form.data.type === 'percentage' ? 'e.g. 25' : 'e.g. 10.00'}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400"
              />
              {form.errors.amount && <p className="text-xs text-red-500 mt-1">{form.errors.amount}</p>}
            </div>
          </div>

          <label className="flex items-center gap-2.5 cursor-pointer">
            <Checkbox checked={form.data.recur} onCheckedChange={v => form.setData('recur', !!v)} />
            <span className="text-sm text-slate-700">Apply to renewal payments too (not just the first payment)</span>
          </label>

          {form.data.recur && (
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                Discounted renewals
              </label>
              <input
                type="number" min="1"
                value={form.data.maximum_recurring_intervals}
                onChange={e => form.setData('maximum_recurring_intervals', e.target.value)}
                placeholder="Leave blank to discount every renewal forever"
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400"
              />
              <p className="text-xs text-slate-400 mt-1">e.g. 3 = discounted for the first 3 billing periods, full price after.</p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Usage limit</label>
              <input
                type="number" min="1"
                value={form.data.usage_limit}
                onChange={e => form.setData('usage_limit', e.target.value)}
                placeholder="Unlimited"
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Code expires</label>
              <input
                type="date"
                value={form.data.expires_at}
                onChange={e => form.setData('expires_at', e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400"
              />
            </div>
          </div>
          <p className="text-xs text-slate-400 -mt-2.5">
            Expiry stops new redemptions — it doesn't affect customers who already redeemed it.
          </p>

          {priceOptions.length > 0 && (
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                Limit to specific plans
              </label>
              <p className="text-xs text-slate-400 mb-2">Leave unchecked to allow this code on any plan.</p>
              <div className="space-y-2 rounded-lg border border-slate-200 p-3">
                {priceOptions.map(p => (
                  <label key={p.id} className="flex items-center gap-2.5 cursor-pointer">
                    <Checkbox checked={form.data.restrict_to.includes(p.id)} onCheckedChange={() => togglePrice(p.id)} />
                    <span className="text-sm text-slate-700">{p.label}</span>
                  </label>
                ))}
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <button
            onClick={() => onOpenChange(false)}
            className="px-4 py-2 rounded-lg text-sm font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={submit}
            disabled={form.processing}
            className="px-4 py-2 rounded-lg text-sm font-semibold text-white transition-all hover:opacity-90 disabled:opacity-60"
            style={{ background: 'linear-gradient(135deg,rgb(var(--brand-600)),rgb(var(--brand2-600)))' }}
          >
            {form.processing ? 'Saving…' : editing ? 'Save changes' : 'Create discount'}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function amountLabel(discount) {
  return discount.type === 'percentage'
    ? `${discount.amount}%`
    : `$${(Number(discount.amount) / 100).toFixed(2)}`
}

function recurringLabel(discount) {
  if (!discount.recur) return 'First payment only'
  return discount.maximum_recurring_intervals
    ? `${discount.maximum_recurring_intervals} cycle${discount.maximum_recurring_intervals === 1 ? '' : 's'}`
    : 'Every renewal'
}

const STATUS_VARIANT = { active: 'default', expired: 'secondary', used: 'secondary', archived: 'secondary' }

export default function AdminDiscounts({ discounts, priceOptions }) {
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [archiveTarget, setArchiveTarget] = useState(null)

  const openCreate = () => { setEditing(null); setFormOpen(true) }
  const openEdit = (discount) => { setEditing(discount); setFormOpen(true) }

  const confirmArchive = () => {
    router.delete(`/admin/discounts/${archiveTarget.id}`, {
      preserveScroll: true,
      onSuccess: () => { toast.success('Discount archived'); setArchiveTarget(null) },
      onError: () => toast.error('Could not archive discount'),
    })
  }

  const columns = [
    {
      id: 'code', header: 'Code', size: 140,
      cell: ({ row }) => <code className="text-xs font-mono font-semibold text-slate-800">{row.original.code}</code>,
    },
    {
      id: 'description', header: 'Description', size: 200,
      cell: ({ row }) => <span className="text-sm text-slate-700">{row.original.description}</span>,
    },
    {
      id: 'amount', header: 'Amount', size: 90,
      cell: ({ row }) => <span className="text-sm font-semibold text-slate-800">{amountLabel(row.original)}</span>,
    },
    {
      id: 'recurring', header: 'Applies to', size: 140,
      cell: ({ row }) => <span className="text-xs text-slate-500">{recurringLabel(row.original)}</span>,
    },
    {
      id: 'usage', header: 'Redeemed', size: 100,
      cell: ({ row }) => (
        <span className="text-xs text-slate-500">
          {row.original.times_used}{row.original.usage_limit ? ` / ${row.original.usage_limit}` : ''}
        </span>
      ),
    },
    {
      id: 'status', header: 'Status', size: 100,
      cell: ({ row }) => <Badge variant={STATUS_VARIANT[row.original.status] || 'secondary'} className="capitalize">{row.original.status}</Badge>,
    },
    {
      id: 'expires', header: 'Expires', size: 100,
      cell: ({ row }) => <span className="text-xs text-slate-400">{row.original.expires_at || 'Never'}</span>,
    },
    {
      id: 'actions', header: '', size: 90,
      cell: ({ row }) => (
        <div className="flex gap-1.5">
          <button onClick={() => openEdit(row.original)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-brand-600 hover:bg-brand-50 transition-colors">
            <Pencil size={14} />
          </button>
          {row.original.status === 'active' && (
            <button onClick={() => setArchiveTarget(row.original)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors">
              <Archive size={14} />
            </button>
          )}
        </div>
      ),
    },
  ]

  return (
    <>
      <Head title="Admin · Discounts" />
      <AdminLayout title="Discount Codes">
        <PageHeader
          title="Discount Codes"
          description={`${discounts.length} code${discounts.length === 1 ? '' : 's'} in your Paddle account`}
          action={(
            <button
              onClick={openCreate}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90"
              style={{ background: 'linear-gradient(135deg,rgb(var(--brand-600)),rgb(var(--brand2-600)))' }}
            >
              <Plus size={15} /> New Discount
            </button>
          )}
        />

        <DataTable data={discounts} columns={columns} />

        <DiscountFormDialog
          open={formOpen}
          onOpenChange={setFormOpen}
          priceOptions={priceOptions}
          editing={editing}
          onSaved={() => setFormOpen(false)}
        />

        {archiveTarget && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/40" onClick={() => setArchiveTarget(null)} />
            <div className="relative bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm">
              <div className="w-12 h-12 rounded-2xl bg-red-50 flex items-center justify-center mb-4">
                <Archive className="w-6 h-6 text-red-500" />
              </div>
              <h3 className="font-bold text-slate-900 text-base mb-1">Archive {archiveTarget.code}?</h3>
              <p className="text-slate-500 text-sm mb-5">It'll stop being redeemable. Anyone already using it on an active subscription keeps their discount.</p>
              <div className="flex gap-2">
                <button
                  onClick={() => setArchiveTarget(null)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-sm font-semibold hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmArchive}
                  className="flex-1 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-semibold transition-colors"
                >
                  Archive
                </button>
              </div>
            </div>
          </div>
        )}
      </AdminLayout>
    </>
  )
}
