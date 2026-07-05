import { Head, Link, useForm } from '@inertiajs/react'
import AppLayout from '@/Components/Layout/AppLayout'
import { ChevronLeft, Briefcase } from 'lucide-react'
import { cn } from '@/lib/utils'

const STATUSES = [
  { value: 'onboarding', label: 'Onboarding', color: 'bg-amber-50 text-amber-700 border-amber-200' },
  { value: 'active',     label: 'Active',     color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  { value: 'inactive',   label: 'Inactive',   color: 'bg-slate-100 text-slate-600 border-slate-200' },
  { value: 'churned',    label: 'Churned',    color: 'bg-red-50 text-red-700 border-red-200' },
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

export default function ClientCreate() {
  const { data, setData, post, processing, errors } = useForm({
    name:       '',
    email:      '',
    phone:      '',
    company:    '',
    job_title:  '',
    status:     'onboarding',
    notes:      '',
    deal_value: '',
    currency:   'USD',
  })

  const submit = (e) => {
    e.preventDefault()
    post('/clients')
  }

  return (
    <>
      <Head title="New Client" />
      <AppLayout title="New Client">

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <Link href="/clients"
            className="flex items-center gap-1.5 h-8 px-3 rounded-xl text-[12.5px] font-medium text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors">
            <ChevronLeft size={13} /> Back
          </Link>
          <div className="w-px h-4 bg-slate-200" />
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg,rgb(var(--brand-600)),rgb(var(--brand2-600)))' }}>
              <Briefcase size={13} className="text-white" />
            </div>
            <h1 className="text-[18px] font-bold text-slate-900">New Client</h1>
          </div>
        </div>

        <form onSubmit={submit}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

            {/* Left — core fields */}
            <div className="lg:col-span-2 space-y-4">
              <div className="rounded-2xl bg-white border border-slate-100 p-5 space-y-4"
                style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
                <p className="text-[10.5px] font-bold uppercase tracking-[0.12em] text-slate-400">Client Information</p>

                <Field label="Full Name *" error={errors.name}>
                  <input
                    value={data.name}
                    onChange={e => setData('name', e.target.value)}
                    placeholder="e.g. Jane Smith"
                    className={cn(inputCls, errors.name && 'border-red-300 focus:ring-red-200')}
                  />
                </Field>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field label="Email" error={errors.email}>
                    <input type="email"
                      value={data.email}
                      onChange={e => setData('email', e.target.value)}
                      placeholder="jane@company.com"
                      className={cn(inputCls, errors.email && 'border-red-300 focus:ring-red-200')}
                    />
                  </Field>
                  <Field label="Phone" error={errors.phone}>
                    <input
                      value={data.phone}
                      onChange={e => setData('phone', e.target.value)}
                      placeholder="+1 555 000 0000"
                      className={inputCls}
                    />
                  </Field>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field label="Company" error={errors.company}>
                    <input
                      value={data.company}
                      onChange={e => setData('company', e.target.value)}
                      placeholder="Acme Corp"
                      className={inputCls}
                    />
                  </Field>
                  <Field label="Job Title" error={errors.job_title}>
                    <input
                      value={data.job_title}
                      onChange={e => setData('job_title', e.target.value)}
                      placeholder="CEO"
                      className={inputCls}
                    />
                  </Field>
                </div>

                <Field label="Notes" error={errors.notes}>
                  <textarea
                    value={data.notes}
                    onChange={e => setData('notes', e.target.value)}
                    placeholder="Any notes about this client…"
                    rows={4}
                    className={cn(inputCls, 'resize-none')}
                  />
                </Field>
              </div>
            </div>

            {/* Right — status + deal */}
            <div className="space-y-4">
              <div className="rounded-2xl bg-white border border-slate-100 p-5 space-y-4"
                style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
                <p className="text-[10.5px] font-bold uppercase tracking-[0.12em] text-slate-400">Status</p>
                <div className="grid grid-cols-2 gap-2">
                  {STATUSES.map(s => (
                    <button key={s.value} type="button"
                      onClick={() => setData('status', s.value)}
                      className={cn(
                        'flex items-center gap-2 px-3 py-2 rounded-xl border text-left text-[12.5px] font-medium transition-all',
                        data.status === s.value
                          ? s.color + ' shadow-sm'
                          : 'border-slate-200 text-slate-500 hover:border-slate-300 hover:bg-slate-50'
                      )}>
                      <span className={cn(
                        'w-2 h-2 rounded-full shrink-0',
                        s.value === 'onboarding' ? 'bg-amber-400' :
                        s.value === 'active'     ? 'bg-emerald-400' :
                        s.value === 'inactive'   ? 'bg-slate-400' : 'bg-red-400'
                      )} />
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl bg-white border border-slate-100 p-5 space-y-4"
                style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
                <p className="text-[10.5px] font-bold uppercase tracking-[0.12em] text-slate-400">Deal Value</p>
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
                    value={data.deal_value}
                    onChange={e => setData('deal_value', e.target.value)}
                    placeholder="0.00"
                    className={cn(inputCls, 'flex-1')}
                  />
                </div>
                {errors.deal_value && <p className="text-[11.5px] text-red-500">{errors.deal_value}</p>}
              </div>

              <button type="submit" disabled={processing}
                className="w-full h-11 rounded-xl text-[13.5px] font-semibold text-white transition-all disabled:opacity-60"
                style={{ background: 'linear-gradient(135deg,rgb(var(--brand-600)),rgb(var(--brand2-600)))' }}>
                {processing ? 'Creating…' : 'Create Client'}
              </button>
            </div>

          </div>
        </form>

      </AppLayout>
    </>
  )
}
