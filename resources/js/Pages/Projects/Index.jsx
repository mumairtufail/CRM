import { Head, Link, router } from '@inertiajs/react'
import { useState } from 'react'
import AppLayout from '@/Components/Layout/AppLayout'
import { cn } from '@/lib/utils'
import {
  FolderKanban, Search, Plus, ChevronRight, Building2,
  Calendar, DollarSign, CheckSquare, FileText, User,
} from 'lucide-react'
import { formatDistanceToNow, format } from 'date-fns'

// ─── Status config ──────────────────────────────────────────────────────────────

const STATUS_TABS = [
  { key: '',           label: 'All',       countKey: 'all' },
  { key: 'planning',   label: 'Planning',  countKey: 'planning' },
  { key: 'active',     label: 'Active',    countKey: 'active' },
  { key: 'on_hold',    label: 'On Hold',   countKey: 'on_hold' },
  { key: 'completed',  label: 'Completed', countKey: 'completed' },
  { key: 'cancelled',  label: 'Cancelled', countKey: 'cancelled' },
]

const STATUS_STYLE = {
  planning:  { dot: 'bg-blue-400',    badge: 'bg-blue-50 text-blue-700 border-blue-200',       stripe: 'linear-gradient(90deg,#3b82f6,#60a5fa)' },
  active:    { dot: 'bg-emerald-400', badge: 'bg-emerald-50 text-emerald-700 border-emerald-200', stripe: 'linear-gradient(90deg,#10b981,#34d399)' },
  on_hold:   { dot: 'bg-amber-400',   badge: 'bg-amber-50 text-amber-700 border-amber-200',    stripe: 'linear-gradient(90deg,#f59e0b,#fbbf24)' },
  completed: { dot: 'bg-violet-400',  badge: 'bg-violet-50 text-violet-700 border-violet-200', stripe: 'linear-gradient(90deg,#7c3aed,#a78bfa)' },
  cancelled: { dot: 'bg-red-400',     badge: 'bg-red-50 text-red-700 border-red-200',          stripe: 'linear-gradient(90deg,#ef4444,#f87171)' },
}

const STATUS_LABELS = {
  planning: 'Planning', active: 'Active', on_hold: 'On Hold',
  completed: 'Completed', cancelled: 'Cancelled',
}

const AVATAR_GRADIENTS = [
  'from-violet-500 to-indigo-500', 'from-emerald-500 to-teal-500',
  'from-blue-500 to-cyan-500', 'from-rose-500 to-pink-500', 'from-amber-500 to-orange-500',
]
function avatarGradient(str) {
  let h = 0
  for (const c of (str ?? '')) h = (h * 31 + c.charCodeAt(0)) & 0xffffffff
  return AVATAR_GRADIENTS[Math.abs(h) % AVATAR_GRADIENTS.length]
}
function avatarLetter(name) { return (name ?? '?').trim()[0]?.toUpperCase() ?? '?' }

// ─── Project card ───────────────────────────────────────────────────────────────

function ProjectCard({ project }) {
  const st = STATUS_STYLE[project.status] ?? STATUS_STYLE.planning

  return (
    <Link href={`/projects/${project.id}`}
      className="group block rounded-2xl bg-white border border-slate-100 hover:border-violet-200 hover:shadow-md transition-all duration-200 overflow-hidden">

      <div className="h-1 w-full" style={{ background: st.stripe }} />

      <div className="p-4">
        {/* Avatar + name */}
        <div className="flex items-start gap-3 mb-3">
          <div className={cn(
            'w-10 h-10 rounded-xl flex items-center justify-center shrink-0 text-[14px] font-bold text-white bg-gradient-to-br',
            avatarGradient(project.name)
          )}>
            {avatarLetter(project.name)}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[13.5px] font-semibold text-slate-900 truncate group-hover:text-violet-700 transition-colors">
              {project.name}
            </p>
            {project.client && (
              <p className="text-[11.5px] text-slate-400 truncate flex items-center gap-1 mt-0.5">
                <Building2 size={10} /> {project.client.name}{project.client.company ? ` · ${project.client.company}` : ''}
              </p>
            )}
          </div>
          <span className={cn('text-[10.5px] font-semibold px-2 py-0.5 rounded-full border shrink-0', st.badge)}>
            {STATUS_LABELS[project.status] ?? project.status}
          </span>
        </div>

        {/* Description */}
        {project.description && (
          <p className="text-[11.5px] text-slate-500 line-clamp-2 mb-3">{project.description}</p>
        )}

        {/* Meta */}
        <div className="space-y-1.5">
          {project.due_date && (
            <div className="flex items-center gap-1.5 text-[11.5px] text-slate-500">
              <Calendar size={11} className="text-slate-400 shrink-0" />
              <span>Due {format(new Date(project.due_date), 'MMM d, yyyy')}</span>
            </div>
          )}
          {project.budget && (
            <div className="flex items-center gap-1.5 text-[11.5px] text-slate-500">
              <DollarSign size={11} className="text-slate-400 shrink-0" />
              <span>{project.currency} {Number(project.budget).toLocaleString()}</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-50">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1 text-[10.5px] text-slate-400">
              <CheckSquare size={10} /> {project.tasks_count} task{project.tasks_count !== 1 ? 's' : ''}
            </span>
            <span className="flex items-center gap-1 text-[10.5px] text-slate-400">
              <FileText size={10} /> {project.documents_count} doc{project.documents_count !== 1 ? 's' : ''}
            </span>
          </div>
          <ChevronRight size={13} className="text-slate-300 group-hover:text-violet-400 transition-colors" />
        </div>
      </div>
    </Link>
  )
}

// ─── Main page ──────────────────────────────────────────────────────────────────

export default function ProjectsIndex({ projects, counts, clients, filters }) {
  const [search, setSearch]     = useState(filters?.search ?? '')
  const [clientId, setClientId] = useState(filters?.client_id ?? '')

  const activeTab = filters?.status ?? ''

  const navigate = (overrides = {}) => {
    router.get('/projects', {
      status:    activeTab || undefined,
      search:    search || undefined,
      client_id: clientId || undefined,
      ...overrides,
    }, { preserveState: true, replace: true })
  }

  const handleSearch = (e) => {
    e.preventDefault()
    navigate()
  }

  const handleTabChange = (key) => navigate({ status: key || undefined })

  const handleClientChange = (e) => {
    const val = e.target.value
    setClientId(val)
    navigate({ client_id: val || undefined })
  }

  const items = projects?.data ?? []

  return (
    <>
      <Head title="Projects" />
      <AppLayout title="Projects">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
          <div>
            <h1 className="text-[20px] font-bold text-slate-900">Projects</h1>
            <p className="text-[13px] text-slate-500 mt-0.5">{counts.all} total project{counts.all !== 1 ? 's' : ''}</p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <Link href="/projects/create"
              className="flex items-center gap-1.5 h-9 px-4 rounded-xl text-[13px] font-semibold text-white transition"
              style={{ background: 'linear-gradient(135deg,#7C3AED,#4F46E5)' }}>
              <Plus size={14} strokeWidth={2.5} /> New Project
            </Link>
            {/* Client filter */}
            {clients.length > 0 && (
              <select value={clientId} onChange={handleClientChange}
                className="h-9 pl-3 pr-8 rounded-xl border border-slate-200 text-[12.5px] text-slate-600 bg-white focus:outline-none focus:ring-2 focus:ring-violet-300 focus:border-violet-400 transition">
                <option value="">All Clients</option>
                {clients.map(c => (
                  <option key={c.id} value={c.id}>{c.name}{c.company ? ` (${c.company})` : ''}</option>
                ))}
              </select>
            )}
            {/* Search */}
            <form onSubmit={handleSearch} className="flex items-center gap-2">
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Search projects…"
                  className="pl-9 pr-4 h-9 w-48 rounded-xl border border-slate-200 text-[13px] text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-violet-300 focus:border-violet-400 transition"
                />
              </div>
              <button type="submit"
                className="h-9 px-4 rounded-xl text-[13px] font-semibold text-white transition"
                style={{ background: 'linear-gradient(135deg,#7C3AED,#4F46E5)' }}>
                Search
              </button>
            </form>
          </div>
        </div>

        {/* Status tabs */}
        <div className="flex items-center gap-1 mb-5 overflow-x-auto pb-1">
          {STATUS_TABS.map(tab => {
            const count  = counts[tab.countKey] ?? 0
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

        {/* Grid */}
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4"
              style={{ background: 'rgba(124,58,237,0.07)' }}>
              <FolderKanban size={24} className="text-violet-400" />
            </div>
            <p className="text-[14px] font-medium text-slate-600 mb-1">No projects yet</p>
            <p className="text-[12.5px] text-slate-400 mb-4">Create your first project to start tracking work.</p>
            <Link href="/projects/create"
              className="inline-flex items-center gap-2 h-9 px-5 text-[13px] font-semibold text-white rounded-xl"
              style={{ background: 'linear-gradient(135deg,#7C3AED,#4F46E5)' }}>
              <Plus size={14} /> New Project
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {items.map(project => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        )}

        {/* Pagination */}
        {projects?.last_page > 1 && (
          <div className="flex items-center justify-center gap-2 mt-6">
            <button disabled={projects.current_page <= 1}
              onClick={() => navigate({ page: projects.current_page - 1 })}
              className="h-8 px-3 rounded-lg text-[12px] border border-slate-200 text-slate-600 hover:border-violet-300 disabled:opacity-30 disabled:cursor-not-allowed">
              ← Prev
            </button>
            <span className="text-[12px] text-slate-500">{projects.current_page} / {projects.last_page}</span>
            <button disabled={projects.current_page >= projects.last_page}
              onClick={() => navigate({ page: projects.current_page + 1 })}
              className="h-8 px-3 rounded-lg text-[12px] border border-slate-200 text-slate-600 hover:border-violet-300 disabled:opacity-30 disabled:cursor-not-allowed">
              Next →
            </button>
          </div>
        )}

      </AppLayout>
    </>
  )
}
