import { Head, Link, router } from '@inertiajs/react'
import { useState } from 'react'
import AppLayout from '@/Components/Layout/AppLayout'
import { cn } from '@/lib/utils'
import {
  Briefcase, Search, Users, TrendingUp, UserX, Clock,
  ChevronRight, Building2, Mail, Phone, DollarSign, Plus,
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

// ─── Status config ─────────────────────────────────────────────────────────────

const STATUS_TABS = [
  { key: '',           label: 'All',        countKey: 'all' },
  { key: 'onboarding', label: 'Onboarding', countKey: 'onboarding' },
  { key: 'active',     label: 'Active',     countKey: 'active' },
  { key: 'inactive',   label: 'Inactive',   countKey: 'inactive' },
  { key: 'churned',    label: 'Churned',    countKey: 'churned' },
]

const STATUS_STYLE = {
  onboarding: { dot: 'bg-amber-400',   badge: 'bg-amber-50 text-amber-700 border-amber-200',   label: 'Onboarding' },
  active:     { dot: 'bg-emerald-400', badge: 'bg-emerald-50 text-emerald-700 border-emerald-200', label: 'Active' },
  inactive:   { dot: 'bg-slate-400',   badge: 'bg-slate-100 text-slate-600 border-slate-200',  label: 'Inactive' },
  churned:    { dot: 'bg-red-400',     badge: 'bg-red-50 text-red-700 border-red-200',         label: 'Churned' },
}

function avatarLetter(name) {
  return (name ?? '?').trim()[0]?.toUpperCase() ?? '?'
}

const AVATAR_GRADIENTS = [
  'from-violet-500 to-indigo-500',
  'from-emerald-500 to-teal-500',
  'from-blue-500 to-cyan-500',
  'from-rose-500 to-pink-500',
  'from-amber-500 to-orange-500',
]
function avatarGradient(str) {
  let h = 0
  for (const c of (str ?? '')) h = (h * 31 + c.charCodeAt(0)) & 0xffffffff
  return AVATAR_GRADIENTS[Math.abs(h) % AVATAR_GRADIENTS.length]
}

// ─── Client card ───────────────────────────────────────────────────────────────

function ClientCard({ client }) {
  const st = STATUS_STYLE[client.status] ?? STATUS_STYLE.active
  return (
    <Link href={`/clients/${client.id}`}
      className="group block rounded-2xl bg-white border border-slate-100 hover:border-violet-200 hover:shadow-md transition-all duration-200 overflow-hidden">

      {/* Top stripe */}
      <div className="h-1 w-full" style={{
        background: client.status === 'active'     ? 'linear-gradient(90deg,#10b981,#34d399)' :
                    client.status === 'onboarding' ? 'linear-gradient(90deg,#f59e0b,#fbbf24)' :
                    client.status === 'churned'    ? 'linear-gradient(90deg,#ef4444,#f87171)' :
                                                     'linear-gradient(90deg,#94a3b8,#cbd5e1)',
      }} />

      <div className="p-4">
        {/* Avatar + name row */}
        <div className="flex items-start gap-3 mb-3">
          <div className={cn(
            'w-10 h-10 rounded-xl flex items-center justify-center shrink-0 text-[14px] font-bold text-white bg-gradient-to-br',
            avatarGradient(client.name)
          )}>
            {avatarLetter(client.name)}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[13.5px] font-semibold text-slate-900 truncate group-hover:text-violet-700 transition-colors">
              {client.name}
            </p>
            {client.company && (
              <p className="text-[11.5px] text-slate-400 truncate flex items-center gap-1 mt-0.5">
                <Building2 size={10} /> {client.company}
              </p>
            )}
          </div>
          {/* Status badge */}
          <span className={cn('text-[10.5px] font-semibold px-2 py-0.5 rounded-full border shrink-0', st.badge)}>
            {st.label}
          </span>
        </div>

        {/* Info rows */}
        <div className="space-y-1.5">
          {client.email && (
            <div className="flex items-center gap-1.5 text-[11.5px] text-slate-500">
              <Mail size={11} className="text-slate-400 shrink-0" />
              <span className="truncate">{client.email}</span>
            </div>
          )}
          {client.phone && (
            <div className="flex items-center gap-1.5 text-[11.5px] text-slate-500">
              <Phone size={11} className="text-slate-400 shrink-0" />
              <span className="truncate">{client.phone}</span>
            </div>
          )}
          {client.deal_value && (
            <div className="flex items-center gap-1.5 text-[11.5px] text-slate-500">
              <DollarSign size={11} className="text-slate-400 shrink-0" />
              <span>{client.currency} {Number(client.deal_value).toLocaleString()}</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-50">
          <span className="text-[10.5px] text-slate-400">
            {client.documents_count} doc{client.documents_count !== 1 ? 's' : ''}
          </span>
          {client.converted_at && (
            <span className="text-[10.5px] text-slate-400">
              Client {formatDistanceToNow(new Date(client.converted_at), { addSuffix: true })}
            </span>
          )}
          <ChevronRight size={13} className="text-slate-300 group-hover:text-violet-400 transition-colors" />
        </div>
      </div>
    </Link>
  )
}

// ─── Main page ─────────────────────────────────────────────────────────────────

export default function ClientsIndex({ clients, counts, filters }) {
  const [search, setSearch] = useState(filters?.search ?? '')

  const activeTab = filters?.status ?? ''

  const handleTabChange = (key) => {
    router.get('/clients', { status: key || undefined, search: search || undefined }, { preserveState: true, replace: true })
  }

  const handleSearch = (e) => {
    e.preventDefault()
    router.get('/clients', { status: activeTab || undefined, search: search || undefined }, { preserveState: true, replace: true })
  }

  const items = clients?.data ?? []

  return (
    <>
      <Head title="Clients" />
      <AppLayout title="Clients">

        {/* ── Header ─────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
          <div>
            <h1 className="text-[20px] font-bold text-slate-900">Clients</h1>
            <p className="text-[13px] text-slate-500 mt-0.5">{counts.all} total client{counts.all !== 1 ? 's' : ''}</p>
          </div>
          {/* Actions */}
          <div className="flex items-center gap-2">
          <Link href="/clients/create"
            className="flex items-center gap-1.5 h-9 px-4 rounded-xl text-[13px] font-semibold text-white transition"
            style={{ background: 'linear-gradient(135deg,#7C3AED,#4F46E5)' }}>
            <Plus size={14} strokeWidth={2.5} /> New Client
          </Link>
          {/* Search */}
          <form onSubmit={handleSearch} className="flex items-center gap-2">
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search clients…"
                className="pl-9 pr-4 h-9 w-56 rounded-xl border border-slate-200 text-[13px] text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-violet-300 focus:border-violet-400 transition"
              />
            </div>
            <button type="submit" className="h-9 px-4 rounded-xl text-[13px] font-semibold text-white transition"
              style={{ background: 'linear-gradient(135deg,#7C3AED,#4F46E5)' }}>
              Search
            </button>
          </form>
          </div>
        </div>

        {/* ── Status tabs ────────────────────────────────── */}
        <div className="flex items-center gap-1 mb-5 overflow-x-auto pb-1">
          {STATUS_TABS.map(tab => {
            const count = counts[tab.countKey] ?? 0
            const active = activeTab === tab.key
            return (
              <button key={tab.key} onClick={() => handleTabChange(tab.key)}
                className={cn(
                  'flex items-center gap-1.5 h-8 px-3.5 rounded-xl text-[12.5px] font-medium whitespace-nowrap transition-all',
                  active
                    ? 'bg-violet-600 text-white shadow-sm'
                    : 'bg-white border border-slate-200 text-slate-600 hover:border-violet-300 hover:text-violet-600'
                )}>
                {tab.label}
                {count > 0 && (
                  <span className={cn(
                    'text-[10.5px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center leading-none',
                    active ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
                  )}>{count}</span>
                )}
              </button>
            )
          })}
        </div>

        {/* ── Grid ───────────────────────────────────────── */}
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4"
              style={{ background: 'rgba(124,58,237,0.07)' }}>
              <Briefcase size={24} className="text-violet-400" />
            </div>
            <p className="text-[14px] font-medium text-slate-600 mb-1">No clients yet</p>
            <p className="text-[12.5px] text-slate-400">
              Create a client directly or convert a lead from their detail page.
            </p>
            <div className="flex items-center gap-2 mt-4">
              <Link href="/clients/create"
                className="inline-flex items-center gap-2 h-9 px-5 text-[13px] font-semibold text-white rounded-xl"
                style={{ background: 'linear-gradient(135deg,#7C3AED,#4F46E5)' }}>
                <Plus size={14} /> New Client
              </Link>
              <Link href="/leads"
                className="inline-flex items-center gap-2 h-9 px-5 text-[13px] font-semibold text-slate-600 rounded-xl border border-slate-200 hover:border-violet-300 hover:text-violet-600 bg-white transition">
                Browse Leads
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {items.map(client => (
              <ClientCard key={client.id} client={client} />
            ))}
          </div>
        )}

        {/* ── Pagination ─────────────────────────────────── */}
        {clients?.last_page > 1 && (
          <div className="flex items-center justify-center gap-2 mt-6">
            <button disabled={clients.current_page <= 1}
              onClick={() => router.get('/clients', { ...filters, page: clients.current_page - 1 }, { preserveState: true })}
              className="h-8 px-3 rounded-lg text-[12px] border border-slate-200 text-slate-600 hover:border-violet-300 disabled:opacity-30 disabled:cursor-not-allowed">
              ← Prev
            </button>
            <span className="text-[12px] text-slate-500">{clients.current_page} / {clients.last_page}</span>
            <button disabled={clients.current_page >= clients.last_page}
              onClick={() => router.get('/clients', { ...filters, page: clients.current_page + 1 }, { preserveState: true })}
              className="h-8 px-3 rounded-lg text-[12px] border border-slate-200 text-slate-600 hover:border-violet-300 disabled:opacity-30 disabled:cursor-not-allowed">
              Next →
            </button>
          </div>
        )}

      </AppLayout>
    </>
  )
}
