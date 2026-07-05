import { Head, Link, useForm } from '@inertiajs/react'
import AppLayout from '@/Components/Layout/AppLayout'
import { ChevronLeft, FolderKanban } from 'lucide-react'
import { cn } from '@/lib/utils'

const STATUSES = [
  { value: 'planning',  label: 'Planning',  color: 'bg-blue-50 text-blue-700 border-blue-200',       dot: 'bg-blue-400' },
  { value: 'active',    label: 'Active',    color: 'bg-emerald-50 text-emerald-700 border-emerald-200', dot: 'bg-emerald-400' },
  { value: 'on_hold',   label: 'On Hold',   color: 'bg-amber-50 text-amber-700 border-amber-200',    dot: 'bg-amber-400' },
  { value: 'completed', label: 'Completed', color: 'bg-brand-50 text-brand-700 border-brand-200', dot: 'bg-brand-400' },
  { value: 'cancelled', label: 'Cancelled', color: 'bg-red-50 text-red-700 border-red-200',          dot: 'bg-red-400' },
]

function Field({ label, error, children }) {
  return (
    <div>
      <label className="block text-[11.5px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">{label}</label>
      {children}
      {error && <p className="mt-1 text-[11.5px] text-red-500">{error}</p>}
    </div>
  )
}

const inputCls = "w-full px-3 py-2.5 rounded-xl border border-slate-200 text-[13px] text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-brand-200 focus:border-brand-400 transition placeholder:text-slate-300"

export default function ProjectCreate({ clients }) {
  const { data, setData, post, processing, errors } = useForm({
    name:        '',
    description: '',
    status:      'planning',
    client_id:   '',
    start_date:  '',
    due_date:    '',
    budget:      '',
    currency:    'USD',
  })

  const submit = (e) => {
    e.preventDefault()
    post('/projects')
  }

  return (
    <>
      <Head title="New Project" />
      <AppLayout title="New Project">

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <Link href="/projects"
            className="flex items-center gap-1.5 h-8 px-3 rounded-xl text-[12.5px] font-medium text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors">
            <ChevronLeft size={13} /> Back
          </Link>
          <div className="w-px h-4 bg-slate-200" />
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg,rgb(var(--brand-600)),rgb(var(--brand2-600)))' }}>
              <FolderKanban size={13} className="text-white" />
            </div>
            <h1 className="text-[18px] font-bold text-slate-900">New Project</h1>
          </div>
        </div>

        <form onSubmit={submit}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

            {/* Left — core fields */}
            <div className="lg:col-span-2 space-y-4">
              <div className="rounded-2xl bg-white border border-slate-100 p-5 space-y-4"
                style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
                <p className="text-[10.5px] font-bold uppercase tracking-[0.12em] text-slate-400">Project Details</p>

                <Field label="Project Name *" error={errors.name}>
                  <input
                    value={data.name}
                    onChange={e => setData('name', e.target.value)}
                    placeholder="e.g. Website Redesign"
                    className={cn(inputCls, errors.name && 'border-red-300 focus:ring-red-200')}
                  />
                </Field>

                <Field label="Description" error={errors.description}>
                  <textarea
                    value={data.description}
                    onChange={e => setData('description', e.target.value)}
                    placeholder="What is this project about?"
                    rows={4}
                    className={cn(inputCls, 'resize-none')}
                  />
                </Field>

                <Field label="Client" error={errors.client_id}>
                  <select
                    value={data.client_id}
                    onChange={e => setData('client_id', e.target.value)}
                    className={inputCls}>
                    <option value="">No client (internal)</option>
                    {clients.map(c => (
                      <option key={c.id} value={c.id}>
                        {c.name}{c.company ? ` — ${c.company}` : ''}
                      </option>
                    ))}
                  </select>
                </Field>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field label="Start Date" error={errors.start_date}>
                    <input type="date"
                      value={data.start_date}
                      onChange={e => setData('start_date', e.target.value)}
                      className={inputCls}
                    />
                  </Field>
                  <Field label="Due Date" error={errors.due_date}>
                    <input type="date"
                      value={data.due_date}
                      onChange={e => setData('due_date', e.target.value)}
                      className={inputCls}
                    />
                  </Field>
                </div>
              </div>
            </div>

            {/* Right — status + budget */}
            <div className="space-y-4">
              <div className="rounded-2xl bg-white border border-slate-100 p-5 space-y-3"
                style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
                <p className="text-[10.5px] font-bold uppercase tracking-[0.12em] text-slate-400">Status</p>
                <div className="space-y-2">
                  {STATUSES.map(s => (
                    <button key={s.value} type="button"
                      onClick={() => setData('status', s.value)}
                      className={cn(
                        'w-full flex items-center gap-2.5 px-3 py-2 rounded-xl border text-left text-[12.5px] font-medium transition-all',
                        data.status === s.value
                          ? s.color + ' shadow-sm'
                          : 'border-slate-200 text-slate-500 hover:border-slate-300 hover:bg-slate-50'
                      )}>
                      <span className={cn('w-2 h-2 rounded-full shrink-0', s.dot)} />
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl bg-white border border-slate-100 p-5 space-y-4"
                style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
                <p className="text-[10.5px] font-bold uppercase tracking-[0.12em] text-slate-400">Budget</p>
                <div className="flex gap-2">
                  <select
                    value={data.currency}
                    onChange={e => setData('currency', e.target.value)}
                    className="h-10 px-2 rounded-xl border border-slate-200 text-[13px] text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-brand-200 focus:border-brand-400 transition">
                    {['USD', 'EUR', 'GBP', 'PKR', 'AED', 'INR', 'CAD', 'AUD'].map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                  <input type="number" min="0" step="0.01"
                    value={data.budget}
                    onChange={e => setData('budget', e.target.value)}
                    placeholder="0.00"
                    className={cn(inputCls, 'flex-1')}
                  />
                </div>
                {errors.budget && <p className="text-[11.5px] text-red-500">{errors.budget}</p>}
              </div>

              <button type="submit" disabled={processing}
                className="w-full h-11 rounded-xl text-[13.5px] font-semibold text-white transition-all disabled:opacity-60"
                style={{ background: 'linear-gradient(135deg,rgb(var(--brand-600)),rgb(var(--brand2-600)))' }}>
                {processing ? 'Creating…' : 'Create Project'}
              </button>
            </div>

          </div>
        </form>

      </AppLayout>
    </>
  )
}
