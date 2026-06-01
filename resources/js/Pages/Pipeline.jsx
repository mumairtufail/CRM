import { Head, Link, router } from '@inertiajs/react'
import { useState, useMemo, useCallback } from 'react'
import AppLayout from '@/Components/Layout/AppLayout'
import PageHeader from '@/Components/Common/PageHeader'
import StatCard from '@/Components/Common/StatCard'
import SearchInput from '@/Components/Common/SearchInput'
import StatusBadge from '@/Components/Common/StatusBadge'
import PriorityBadge from '@/Components/Common/PriorityBadge'
import LeadAvatar from '@/Components/Common/LeadAvatar'
import DataTable from '@/Components/Common/DataTable'
import { Button } from '@/Components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/Components/ui/dropdown-menu'
import {
  DndContext, DragOverlay, PointerSensor,
  useSensor, useSensors, useDroppable, useDraggable,
} from '@dnd-kit/core'
import {
  GripVertical, DollarSign, LayoutGrid, List,
  Users, Trophy, TrendingUp, Percent,
  MoreHorizontal, CalendarClock, ChevronDown, X, Filter,
} from 'lucide-react'
import { cn } from '@/lib/utils'

// ─── constants ───────────────────────────────────────────────────────────────

const STATUS_META = {
  new:          { label: 'New',          dot: 'bg-slate-400',   hex: '#94a3b8' },
  contacted:    { label: 'Contacted',    dot: 'bg-blue-400',    hex: '#60a5fa' },
  qualified:    { label: 'Qualified',    dot: 'bg-indigo-400',  hex: '#818cf8' },
  proposal:     { label: 'Proposal',     dot: 'bg-amber-400',   hex: '#fbbf24' },
  negotiation:  { label: 'Negotiation',  dot: 'bg-orange-400',  hex: '#fb923c' },
  won:          { label: 'Won',          dot: 'bg-emerald-400', hex: '#34d399' },
  lost:         { label: 'Lost',         dot: 'bg-red-400',     hex: '#f87171' },
  unqualified:  { label: 'Unqualified',  dot: 'bg-gray-300',    hex: '#d1d5db' },
}

const STATUSES = Object.keys(STATUS_META)

const PRIORITY_BORDER = {
  high:   'border-l-red-400',
  medium: 'border-l-amber-300',
  low:    'border-l-slate-200',
}

// ─── helpers ─────────────────────────────────────────────────────────────────

function fmt(value) {
  const n = Number(value) || 0
  if (n >= 1_000_000) return '$' + (n / 1_000_000).toFixed(1) + 'M'
  if (n >= 1_000)     return '$' + (n / 1_000).toFixed(1) + 'k'
  return '$' + n.toLocaleString()
}

// ─── sub-components ──────────────────────────────────────────────────────────

function FollowUpChip({ date }) {
  if (!date) return null
  const d = new Date(date)
  const overdue = d < new Date()
  return (
    <span className={cn(
      'inline-flex items-center gap-0.5 text-[9px] font-semibold px-1.5 py-0.5 rounded-full whitespace-nowrap',
      overdue ? 'bg-red-50 text-red-600' : 'bg-amber-50 text-amber-600'
    )}>
      <CalendarClock size={8} />
      {d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
      {overdue && ' ⚠'}
    </span>
  )
}

function DraggableCard({ lead, onStatusChange }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({ id: String(lead.id) })
  const borderClass = PRIORITY_BORDER[lead.priority] ?? 'border-l-transparent'

  return (
    <div
      ref={setNodeRef}
      className={cn(
        'group bg-white border border-[#e5ddd5] border-l-4 rounded-lg p-3 cursor-default select-none',
        'hover:shadow-md transition-all duration-150',
        borderClass,
        isDragging && 'opacity-40'
      )}
    >
      <div className="flex items-start gap-2">
        <div className="shrink-0 mt-0.5">
          <LeadAvatar name={lead.full_name} url={lead.avatar_url} size="xs" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-1">
            <Link href={`/leads/${lead.id}`} className="min-w-0 flex-1 group/link">
              <p className="text-xs font-semibold text-foreground truncate leading-tight group-hover/link:text-blue-600 transition-colors">
                {lead.full_name}
              </p>
              {lead.company && (
                <p className="text-[10px] text-muted-foreground truncate mt-0.5">{lead.company}</p>
              )}
            </Link>

            <div className="flex items-center gap-0.5 shrink-0 ml-1">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="p-0.5 rounded text-muted-foreground hover:text-foreground opacity-0 group-hover:opacity-100 transition-opacity focus:opacity-100 focus:outline-none">
                    <MoreHorizontal size={12} />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-44">
                  <DropdownMenuLabel className="text-[11px]">Move to stage</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {STATUSES.filter(s => s !== lead.status).map(s => (
                    <DropdownMenuItem
                      key={s}
                      className="text-xs"
                      onClick={() => onStatusChange(String(lead.id), lead.status, s)}
                    >
                      <span className={cn('w-1.5 h-1.5 rounded-full mr-2 shrink-0 inline-block', STATUS_META[s].dot)} />
                      {STATUS_META[s].label}
                    </DropdownMenuItem>
                  ))}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild className="text-xs">
                    <Link href={`/leads/${lead.id}`}>View Profile</Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <button
                {...attributes}
                {...listeners}
                className="p-0.5 text-muted-foreground hover:text-foreground cursor-grab active:cursor-grabbing focus:outline-none"
                title="Drag to move"
              >
                <GripVertical size={12} />
              </button>
            </div>
          </div>

          {lead.primary_email && (
            <p className="text-[10px] text-muted-foreground/70 truncate mt-1">{lead.primary_email}</p>
          )}
        </div>
      </div>

      {(Number(lead.deal_value) > 0 || lead.follow_up_at) && (
        <div className="flex items-center justify-between mt-2 gap-1 flex-wrap">
          {Number(lead.deal_value) > 0 && (
            <div className="flex items-center gap-0.5">
              <DollarSign size={10} className="text-emerald-600 shrink-0" />
              <span className="text-[10px] font-bold text-emerald-700">
                {Number(lead.deal_value).toLocaleString()} {lead.currency}
              </span>
            </div>
          )}
          <FollowUpChip date={lead.follow_up_at} />
        </div>
      )}
    </div>
  )
}

function DroppableColumn({ status, leads, isOver, totalPipelineValue, onStatusChange }) {
  const { setNodeRef } = useDroppable({ id: status })
  const meta = STATUS_META[status]
  const dealTotal = leads.reduce((s, l) => s + (Number(l.deal_value) || 0), 0)
  const pct = totalPipelineValue > 0 ? (dealTotal / totalPipelineValue) * 100 : 0

  return (
    <div className="flex flex-col shrink-0 w-60">
      {/* Column header */}
      <div className="mb-2 px-1">
        <div className="flex items-center gap-2">
          <div className={cn('w-2 h-2 rounded-full shrink-0', meta.dot)} />
          <span className="text-xs font-semibold text-foreground truncate flex-1">{meta.label}</span>
          <span className="text-[10px] font-bold text-muted-foreground bg-[#f0ebe4] px-1.5 py-0.5 rounded-full leading-none">
            {leads.length}
          </span>
        </div>

        {dealTotal > 0 && (
          <div className="mt-1.5">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] font-bold text-emerald-600">{fmt(dealTotal)}</span>
              {pct > 0 && (
                <span className="text-[9px] text-muted-foreground">{Math.round(pct)}% of pipeline</span>
              )}
            </div>
            <div className="h-1 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-700 ease-out"
                style={{ width: `${Math.min(pct, 100)}%`, backgroundColor: meta.hex }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Drop zone */}
      <div
        ref={setNodeRef}
        className={cn(
          'flex-1 min-h-32 rounded-xl p-2 space-y-2 transition-all duration-150',
          !isOver && 'bg-[#f5f0ea]'
        )}
        style={isOver ? {
          backgroundColor: meta.hex + '18',
          border: `2px dashed ${meta.hex}`,
        } : undefined}
      >
        {leads.length === 0 && !isOver && (
          <div className="h-16 flex items-center justify-center rounded-lg border border-dashed border-gray-200">
            <p className="text-[10px] text-muted-foreground">Drop leads here</p>
          </div>
        )}
        {leads.map(lead => (
          <DraggableCard key={lead.id} lead={lead} onStatusChange={onStatusChange} />
        ))}
      </div>
    </div>
  )
}

// ─── main page ───────────────────────────────────────────────────────────────

export default function Pipeline({ columns }) {
  const [localColumns, setLocalColumns] = useState(columns)
  const [activeId, setActiveId]         = useState(null)
  const [overId, setOverId]             = useState(null)
  const [viewMode, setViewMode]         = useState(() => localStorage.getItem('pipeline-view') ?? 'kanban')
  const [search, setSearch]             = useState('')
  const [priorityFilter, setPriority]   = useState('all')
  const [sourceFilter, setSource]       = useState('all')

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  )

  // ── derived data ───────────────────────────────────────────────────────────

  const allLeads = useMemo(
    () => STATUSES.flatMap(st => localColumns[st] ?? []),
    [localColumns]
  )

  const sources = useMemo(() => {
    const set = new Set(allLeads.map(l => l.source).filter(Boolean))
    return Array.from(set).sort()
  }, [allLeads])

  const stats = useMemo(() => {
    const totalLeads    = allLeads.length
    const pipelineValue = allLeads.reduce((s, l) => s + (Number(l.deal_value) || 0), 0)
    const wonValue      = (localColumns.won ?? []).reduce((s, l) => s + (Number(l.deal_value) || 0), 0)
    const wonCount      = localColumns.won?.length ?? 0
    const lostCount     = localColumns.lost?.length ?? 0
    const winRate       = (wonCount + lostCount) > 0
      ? Math.round((wonCount / (wonCount + lostCount)) * 100)
      : 0
    return { totalLeads, pipelineValue, wonValue, winRate }
  }, [allLeads, localColumns])

  // ── filtering ──────────────────────────────────────────────────────────────

  const filterLeads = useCallback((leads) => {
    let result = leads
    if (search) {
      const s = search.toLowerCase()
      result = result.filter(l =>
        l.full_name?.toLowerCase().includes(s) ||
        l.company?.toLowerCase().includes(s)
      )
    }
    if (priorityFilter !== 'all') result = result.filter(l => l.priority === priorityFilter)
    if (sourceFilter  !== 'all') result = result.filter(l => l.source   === sourceFilter)
    return result
  }, [search, priorityFilter, sourceFilter])

  const filteredColumns = useMemo(() => {
    const out = {}
    for (const st of STATUSES) out[st] = filterLeads(localColumns[st] ?? [])
    return out
  }, [localColumns, filterLeads])

  const filteredLeads = useMemo(() => filterLeads(allLeads), [allLeads, filterLeads])

  const hasFilters = search || priorityFilter !== 'all' || sourceFilter !== 'all'

  // ── status change (shared between kanban and table) ────────────────────────

  const handleStatusChange = useCallback((leadId, fromStatus, toStatus) => {
    setLocalColumns(prev => {
      const next = { ...prev }
      const lead = next[fromStatus]?.find(l => String(l.id) === String(leadId))
      if (!lead) return prev
      next[fromStatus] = next[fromStatus].filter(l => String(l.id) !== String(leadId))
      next[toStatus]   = [{ ...lead, status: toStatus }, ...(next[toStatus] ?? [])]
      return next
    })
    router.patch(`/leads/${leadId}/status`, { status: toStatus }, {
      preserveScroll: true,
      preserveState: true,
      onError: () => setLocalColumns(columns),
    })
  }, [columns])

  // ── drag handlers ──────────────────────────────────────────────────────────

  const findLead = (id) => {
    for (const st of STATUSES) {
      const found = localColumns[st]?.find(l => String(l.id) === String(id))
      if (found) return { lead: found, status: st }
    }
    return null
  }

  const activeLead = activeId ? findLead(activeId)?.lead : null

  const handleDragStart = ({ active }) => setActiveId(active.id)
  const handleDragOver  = ({ over })   => setOverId(over?.id ?? null)

  const handleDragEnd = ({ active, over }) => {
    setActiveId(null)
    setOverId(null)
    if (!over) return
    const result = findLead(active.id)
    if (!result) return
    const { status: fromStatus } = result
    const toStatus = over.id
    if (fromStatus === toStatus) return
    handleStatusChange(String(active.id), fromStatus, toStatus)
  }

  const switchView = (mode) => {
    setViewMode(mode)
    localStorage.setItem('pipeline-view', mode)
  }

  // ── table column definitions ───────────────────────────────────────────────

  const tableColumns = useMemo(() => [
    {
      id: 'lead',
      header: 'Lead',
      accessorFn: row => row.full_name,
      size: 220,
      cell: ({ row: { original: l } }) => (
        <Link href={`/leads/${l.id}`} className="flex items-center gap-2.5 group/row">
          <LeadAvatar name={l.full_name} url={l.avatar_url} size="sm" />
          <div className="min-w-0">
            <p className="text-sm font-medium text-gray-900 group-hover/row:text-blue-600 transition-colors truncate">
              {l.full_name}
            </p>
            {l.primary_email && (
              <p className="text-xs text-gray-400 truncate">{l.primary_email}</p>
            )}
          </div>
        </Link>
      ),
    },
    {
      id: 'company',
      header: 'Company',
      accessorFn: row => row.company ?? '',
      size: 150,
      cell: ({ row: { original: l } }) => (
        <span className="text-sm text-gray-600">{l.company || <span className="text-gray-300">—</span>}</span>
      ),
    },
    {
      id: 'status',
      header: 'Status',
      accessorFn: row => row.status,
      size: 140,
      cell: ({ row: { original: l } }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="cursor-pointer focus:outline-none">
              <StatusBadge status={l.status} size="sm" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-44">
            <DropdownMenuLabel className="text-[11px]">Change status</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {STATUSES.map(s => (
              <DropdownMenuItem
                key={s}
                className="text-xs"
                disabled={s === l.status}
                onClick={() => s !== l.status && handleStatusChange(String(l.id), l.status, s)}
              >
                <span className={cn('w-1.5 h-1.5 rounded-full mr-2 shrink-0 inline-block', STATUS_META[s].dot)} />
                {STATUS_META[s].label}
                {s === l.status && <span className="ml-auto text-[10px] text-gray-400">current</span>}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
    {
      id: 'priority',
      header: 'Priority',
      accessorFn: row => row.priority ?? '',
      size: 100,
      cell: ({ row: { original: l } }) => l.priority
        ? <PriorityBadge priority={l.priority} />
        : <span className="text-gray-300 text-xs">—</span>,
    },
    {
      id: 'deal_value',
      header: 'Deal Value',
      accessorFn: row => Number(row.deal_value) || 0,
      size: 120,
      cell: ({ row: { original: l } }) => Number(l.deal_value) > 0
        ? <span className="text-sm font-bold text-emerald-700">{fmt(l.deal_value)}</span>
        : <span className="text-gray-300 text-xs">—</span>,
    },
    {
      id: 'source',
      header: 'Source',
      accessorFn: row => row.source ?? '',
      size: 110,
      cell: ({ row: { original: l } }) => l.source
        ? <span className="text-xs text-gray-500 capitalize">{l.source}</span>
        : <span className="text-gray-300 text-xs">—</span>,
    },
    {
      id: 'follow_up_at',
      header: 'Follow-up',
      accessorFn: row => row.follow_up_at ?? '',
      size: 110,
      cell: ({ row: { original: l } }) => l.follow_up_at
        ? <FollowUpChip date={l.follow_up_at} />
        : <span className="text-gray-300 text-xs">—</span>,
    },
    {
      id: 'actions',
      header: '',
      enableSorting: false,
      size: 60,
      cell: ({ row: { original: l } }) => (
        <Link href={`/leads/${l.id}`} className="text-xs text-blue-500 hover:text-blue-700 font-medium">
          View →
        </Link>
      ),
    },
  ], [handleStatusChange])

  // ── render ─────────────────────────────────────────────────────────────────

  return (
    <>
      <Head title="Pipeline" />
      <AppLayout title="Pipeline">

        {/* Page header */}
        <PageHeader
          title="Pipeline"
          description={`${stats.totalLeads} leads across ${STATUSES.length} stages`}
        />

        {/* Stats row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
          <StatCard title="Total Leads"     value={stats.totalLeads}         icon={Users}     color="blue"   index={0} />
          <StatCard title="Pipeline Value"  value={fmt(stats.pipelineValue)} icon={TrendingUp} color="purple" index={1} />
          <StatCard title="Won Value"       value={fmt(stats.wonValue)}      icon={Trophy}    color="green"  index={2} />
          <StatCard title="Win Rate"        value={`${stats.winRate}%`}      icon={Percent}   color="amber"  index={3} />
        </div>

        {/* Filter + view-toggle bar */}
        <div className="flex items-center gap-2 mb-4 flex-wrap">
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="Search leads..."
            className="w-56"
          />

          {/* Priority pills */}
          <div className="flex items-center bg-white border border-gray-200 rounded-lg p-1 gap-0.5">
            {['all', 'high', 'medium', 'low'].map(p => (
              <button
                key={p}
                onClick={() => setPriority(p)}
                className={cn(
                  'text-xs px-2.5 py-1 rounded-md font-medium capitalize transition-colors',
                  priorityFilter === p
                    ? 'bg-slate-800 text-white shadow-sm'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                )}
              >
                {p === 'all' ? 'All' : p}
              </button>
            ))}
          </div>

          {/* Source filter — only when sources exist */}
          {sources.length > 0 && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="h-9 text-xs gap-1.5">
                  <Filter size={12} />
                  {sourceFilter === 'all' ? 'Source' : <span className="capitalize">{sourceFilter}</span>}
                  <ChevronDown size={11} className="text-gray-400" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-40">
                <DropdownMenuItem className="text-xs" onClick={() => setSource('all')}>
                  All sources
                  {sourceFilter === 'all' && <span className="ml-auto text-[10px] text-blue-500">✓</span>}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                {sources.map(s => (
                  <DropdownMenuItem key={s} className="text-xs capitalize" onClick={() => setSource(s)}>
                    {s}
                    {sourceFilter === s && <span className="ml-auto text-[10px] text-blue-500">✓</span>}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          {/* Clear filters */}
          {hasFilters && (
            <button
              onClick={() => { setSearch(''); setPriority('all'); setSource('all') }}
              className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700 px-2 py-1 rounded-md hover:bg-gray-100 transition-colors"
            >
              <X size={11} />
              Clear
            </button>
          )}

          {/* View toggle — pushed to the right */}
          <div className="ml-auto flex items-center bg-white border border-gray-200 rounded-lg p-1 gap-0.5">
            <button
              onClick={() => switchView('kanban')}
              title="Kanban view"
              className={cn(
                'p-1.5 rounded-md transition-colors',
                viewMode === 'kanban'
                  ? 'bg-slate-800 text-white shadow-sm'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              )}
            >
              <LayoutGrid size={14} />
            </button>
            <button
              onClick={() => switchView('table')}
              title="Table view"
              className={cn(
                'p-1.5 rounded-md transition-colors',
                viewMode === 'table'
                  ? 'bg-slate-800 text-white shadow-sm'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              )}
            >
              <List size={14} />
            </button>
          </div>
        </div>

        {/* ── Kanban view ── */}
        {viewMode === 'kanban' && (
          <DndContext
            sensors={sensors}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDragEnd={handleDragEnd}
          >
            <div className="flex gap-3 overflow-x-auto pb-4 -mx-1 px-1">
              {STATUSES.map(status => (
                <DroppableColumn
                  key={status}
                  status={status}
                  leads={filteredColumns[status] ?? []}
                  isOver={overId === status}
                  totalPipelineValue={stats.pipelineValue}
                  onStatusChange={handleStatusChange}
                />
              ))}
            </div>

            <DragOverlay dropAnimation={{ duration: 180, easing: 'ease' }}>
              {activeLead && (
                <div className={cn(
                  'bg-white border border-[#e5ddd5] border-l-4 rounded-lg p-3 shadow-2xl w-60',
                  PRIORITY_BORDER[activeLead.priority] ?? 'border-l-transparent'
                )}>
                  <div className="flex items-center gap-2">
                    <LeadAvatar name={activeLead.full_name} url={activeLead.avatar_url} size="xs" />
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-foreground truncate">{activeLead.full_name}</p>
                      {activeLead.company && (
                        <p className="text-[10px] text-muted-foreground truncate">{activeLead.company}</p>
                      )}
                    </div>
                  </div>
                  {Number(activeLead.deal_value) > 0 && (
                    <div className="flex items-center gap-0.5 mt-1.5">
                      <DollarSign size={10} className="text-emerald-600" />
                      <span className="text-[10px] font-bold text-emerald-700">
                        {Number(activeLead.deal_value).toLocaleString()}
                      </span>
                    </div>
                  )}
                </div>
              )}
            </DragOverlay>
          </DndContext>
        )}

        {/* ── Table view ── */}
        {viewMode === 'table' && (
          <DataTable
            data={filteredLeads}
            columns={tableColumns}
          />
        )}

      </AppLayout>
    </>
  )
}
