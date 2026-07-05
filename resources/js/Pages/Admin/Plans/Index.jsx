import { Head, router, useForm } from '@inertiajs/react'
import { useState, useEffect } from 'react'
import AdminLayout from '@/Components/Layout/AdminLayout'
import PageHeader from '@/Components/Common/PageHeader'
import { Card } from '@/Components/ui/card'
import { Switch } from '@/Components/ui/switch'
import { Checkbox } from '@/Components/ui/checkbox'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/Components/ui/dialog'
import { Plus, Check, X, Pencil, Trash2, Users, Star } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import RichEditor from '@/Components/Common/RichEditor'

function emptyForm() {
  return {
    name: '',
    tagline: '',
    description: '',
    price_monthly: '',
    price_monthly_original: '',
    price_yearly: '',
    price_yearly_original: '',
    is_featured: false,
    cta_text: '',
    modules: [],
  }
}

function PlanFormDialog({ open, onOpenChange, modules, editing, onSaved }) {
  const form = useForm(emptyForm())

  // Reset/Set form fields whenever editing target changes or modal opens/closes
  useEffect(() => {
    if (!open) {
      form.reset()
      return
    }
    if (editing) {
      form.setData({
        name: editing.name,
        tagline: editing.tagline || '',
        description: editing.description || '',
        price_monthly: editing.price_monthly ?? '',
        price_monthly_original: editing.price_monthly_original ?? '',
        price_yearly: editing.price_yearly ?? '',
        price_yearly_original: editing.price_yearly_original ?? '',
        is_featured: editing.is_featured,
        cta_text: editing.cta_text || '',
        modules: editing.modules.map(m => m.id),
      })
    } else {
      form.setData(emptyForm())
    }
    form.clearErrors()
  }, [editing, open])

  const toggleModule = (id) => {
    const has = form.data.modules.includes(id)
    form.setData('modules', has ? form.data.modules.filter(m => m !== id) : [...form.data.modules, id])
  }

  const submit = () => {
    const options = {
      preserveScroll: true,
      onSuccess: () => { toast.success(editing ? 'Plan updated' : 'Plan created'); onSaved() },
      onError: () => toast.error('Please check the form for errors'),
    }
    if (editing) {
      form.patch(`/admin/plans/${editing.id}`, options)
    } else {
      form.post('/admin/plans', options)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{editing ? `Edit ${editing.name}` : 'New Plan'}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 max-h-[68vh] overflow-y-auto pr-1">
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Plan name</label>
            <input
              value={form.data.name}
              onChange={e => form.setData('name', e.target.value)}
              placeholder="e.g. Pro"
              className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400"
            />
            {form.errors.name && <p className="text-xs text-red-500 mt-1">{form.errors.name}</p>}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Tagline</label>
            <input
              value={form.data.tagline}
              onChange={e => form.setData('tagline', e.target.value)}
              placeholder="One line describing this plan"
              className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Description (HTML / Features)</label>
            <RichEditor
              value={form.data.description}
              onChange={val => form.setData('description', val)}
              placeholder="Enter plan details or list of features..."
              minHeight={120}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Original Price / mo</label>
              <input
                type="number" min="0" step="0.01"
                value={form.data.price_monthly_original}
                onChange={e => form.setData('price_monthly_original', e.target.value)}
                placeholder="e.g. 49"
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Discount Price / mo</label>
              <input
                type="number" min="0" step="0.01"
                value={form.data.price_monthly}
                onChange={e => form.setData('price_monthly', e.target.value)}
                placeholder="e.g. 29"
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Original Price / yr</label>
              <input
                type="number" min="0" step="0.01"
                value={form.data.price_yearly_original}
                onChange={e => form.setData('price_yearly_original', e.target.value)}
                placeholder="e.g. 490"
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Discount Price / yr</label>
              <input
                type="number" min="0" step="0.01"
                value={form.data.price_yearly}
                onChange={e => form.setData('price_yearly', e.target.value)}
                placeholder="e.g. 290"
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Button text (landing page)</label>
            <input
              value={form.data.cta_text}
              onChange={e => form.setData('cta_text', e.target.value)}
              placeholder="Sign up free"
              className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400"
            />
          </div>

          <label className="flex items-center gap-2.5 cursor-pointer">
            <Checkbox checked={form.data.is_featured} onCheckedChange={v => form.setData('is_featured', !!v)} />
            <span className="text-sm text-slate-700">Highlight as "Most Popular" on the pricing page</span>
          </label>

          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
              Modules included
            </label>
            <p className="text-xs text-slate-400 mb-2">Core CRM (leads, pipeline, invoicing, reports, team) is always included.</p>
            <div className="space-y-2 rounded-lg border border-slate-200 p-3">
              {modules.map(m => (
                <label key={m.id} className="flex items-start gap-2.5 cursor-pointer">
                  <Checkbox
                    checked={form.data.modules.includes(m.id)}
                    onCheckedChange={() => toggleModule(m.id)}
                    className="mt-0.5"
                  />
                  <span className="text-sm text-slate-700">
                    {m.name}
                    {m.description && <span className="block text-xs text-slate-400">{m.description}</span>}
                  </span>
                </label>
              ))}
            </div>
          </div>
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
            {form.processing ? 'Saving…' : editing ? 'Save changes' : 'Create plan'}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function PlanCard({ plan, modules, onEdit, onDelete }) {
  const included = new Set(plan.modules.map(m => m.id))

  const toggleActive = () => {
    router.patch(`/admin/plans/${plan.id}/toggle`, {}, {
      preserveScroll: true,
      onSuccess: () => toast.success(plan.is_active ? 'Plan deactivated' : 'Plan activated'),
      onError: () => toast.error('Could not update plan'),
    })
  }

  return (
    <Card className={cn(
      'relative p-6 flex flex-col rounded-2xl border-slate-100 shadow-sm transition-all',
      plan.is_featured && 'border-brand-300 ring-1 ring-brand-200'
    )}>
      {plan.is_featured && (
        <div className="absolute -top-3 left-6 inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold text-white"
          style={{ background: 'linear-gradient(135deg,rgb(var(--brand-600)),rgb(var(--brand2-600)))' }}>
          <Star size={11} className="fill-white" /> Most Popular
        </div>
      )}

      <div className="flex items-start justify-between mb-1">
        <h3 className="text-lg font-bold text-slate-900">{plan.name}</h3>
        <div className="flex items-center gap-2">
          <span className={cn('text-xs font-semibold', plan.is_active ? 'text-emerald-600' : 'text-slate-400')}>
            {plan.is_active ? 'Active' : 'Inactive'}
          </span>
          <Switch checked={plan.is_active} onCheckedChange={toggleActive} />
        </div>
      </div>

      <p className="text-sm text-slate-500 mb-4 min-h-[36px]">{plan.tagline}</p>

      <div className="mb-4">
        {plan.price_monthly_original && (
          <span className="text-sm line-through text-slate-400 mr-1.5">${Number(plan.price_monthly_original).toFixed(0)}</span>
        )}
        <span className="text-3xl font-black text-slate-900">${Number(plan.price_monthly ?? 0).toFixed(0)}</span>
        <span className="text-sm text-slate-400 font-medium">/mo</span>
      </div>

      <div className="flex-1 space-y-2 mb-5">
        <div className="flex items-center gap-2 text-sm text-slate-600">
          <Check size={14} className="text-emerald-500 shrink-0" />
          Core CRM (leads, pipeline, invoicing, reports, team)
        </div>
        {modules.map(m => (
          <div key={m.id} className={cn('flex items-center gap-2 text-sm', included.has(m.id) ? 'text-slate-600' : 'text-slate-300')}>
            {included.has(m.id)
              ? <Check size={14} className="text-emerald-500 shrink-0" />
              : <X size={14} className="text-slate-300 shrink-0" />}
            {m.name}
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-slate-100">
        <span className="inline-flex items-center gap-1.5 text-xs text-slate-400">
          <Users size={13} /> {plan.organizations_count} workspace{plan.organizations_count === 1 ? '' : 's'}
        </span>
        <div className="flex gap-1.5">
          <button onClick={() => onEdit(plan)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-brand-600 hover:bg-brand-50 transition-colors">
            <Pencil size={14} />
          </button>
          <button
            onClick={() => onDelete(plan)}
            disabled={plan.organizations_count > 0}
            title={plan.organizations_count > 0 ? 'Reassign workspaces before deleting' : 'Delete plan'}
            className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-slate-400"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>
    </Card>
  )
}

export default function AdminPlans({ plans, modules }) {
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)

  const openCreate = () => { setEditing(null); setFormOpen(true) }
  const openEdit = (plan) => { setEditing(plan); setFormOpen(true) }

  const confirmDelete = () => {
    router.delete(`/admin/plans/${deleteTarget.id}`, {
      preserveScroll: true,
      onSuccess: () => { toast.success('Plan deleted'); setDeleteTarget(null) },
      onError: () => toast.error('Could not delete plan'),
    })
  }

  return (
    <>
      <Head title="Admin · Plans" />
      <AdminLayout title="Subscription Plans">
        <PageHeader
          title="Subscription Plans"
          description={`${plans.length} package${plans.length === 1 ? '' : 's'} available for tenants`}
          action={(
            <button
              onClick={openCreate}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90"
              style={{ background: 'linear-gradient(135deg,rgb(var(--brand-600)),rgb(var(--brand2-600)))' }}
            >
              <Plus size={15} /> New Plan
            </button>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {plans.map(plan => (
            <PlanCard key={plan.id} plan={plan} modules={modules} onEdit={openEdit} onDelete={setDeleteTarget} />
          ))}
        </div>

        <PlanFormDialog
          open={formOpen}
          onOpenChange={setFormOpen}
          modules={modules}
          editing={editing}
          onSaved={() => setFormOpen(false)}
        />

        {deleteTarget && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/40" onClick={() => setDeleteTarget(null)} />
            <div className="relative bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm">
              <div className="w-12 h-12 rounded-2xl bg-red-50 flex items-center justify-center mb-4">
                <Trash2 className="w-6 h-6 text-red-500" />
              </div>
              <h3 className="font-bold text-slate-900 text-base mb-1">Delete {deleteTarget.name}?</h3>
              <p className="text-slate-500 text-sm mb-5">This action cannot be undone.</p>
              <div className="flex gap-2">
                <button
                  onClick={() => setDeleteTarget(null)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-sm font-semibold hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  className="flex-1 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-semibold transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </AdminLayout>
    </>
  )
}
