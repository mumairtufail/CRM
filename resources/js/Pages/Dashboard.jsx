import { useMemo, useState } from 'react'
import { Head, Link, router } from '@inertiajs/react'
import AppLayout from '@/Components/Layout/AppLayout'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell,
} from 'recharts'
import {
  Users, TrendingUp, Mail, Target, Clock,
  Sparkles, Percent, Briefcase, X, Activity as ActivityIcon, DollarSign,
  ClipboardList,
} from 'lucide-react'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/Components/ui/tabs'
import StatusBadge from '@/Components/Common/StatusBadge'
import LeadAvatar from '@/Components/Common/LeadAvatar'
import KpiTile from '@/Components/Common/KpiTile'
import GlassCard from '@/Components/Common/GlassCard'
import SectionHeader from '@/Components/Common/SectionHeader'
import InlineEmptyState from '@/Components/Common/InlineEmptyState'
import ActivityFeedItem from '@/Components/Common/ActivityFeedItem'
import { AreaTooltip, BarTooltip } from '@/Components/Common/ChartTooltip'
import AgentStatsCards from '@/Components/Dashboard/AgentStatsCards'
import RangeSelect, { CustomRangeInputs } from '@/Components/Common/RangeFilter'
import { SOURCE_COLORS, FUNNEL_ORDER, FUNNEL_COLORS } from '@/lib/chartPalette'
import { usePage } from '@inertiajs/react'
import { motion } from 'framer-motion'

const greeting = () => {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 17) return 'Good afternoon'
  return 'Good evening'
}

function FunnelBar({ name, value, max, color, active, dimmed, onClick }) {
  const pct = max > 0 ? Math.max(4, Math.round((value / max) * 100)) : 4
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center gap-2.5 w-full text-left rounded-lg -mx-1.5 px-1.5 py-0.5 transition-opacity ${dimmed ? 'opacity-35' : 'opacity-100'} hover:bg-slate-50`}
    >
      <span className={`text-[10.5px] font-semibold capitalize w-20 shrink-0 text-right ${active ? 'text-slate-800' : 'text-slate-500'}`}>{name}</span>
      <div className="flex-1 h-2 rounded-full bg-slate-100 overflow-hidden">
        <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: color, boxShadow: active ? `0 0 0 2px ${color}33` : 'none' }} />
      </div>
      <span className="text-[11px] font-bold text-slate-600 w-6 text-right shrink-0">{value}</span>
    </button>
  )
}

function WelcomeBanner({ name, range, onRangeChange }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="relative overflow-hidden rounded-2xl px-5 py-3.5 sm:px-6"
      style={{ background: 'linear-gradient(135deg, rgb(var(--brand-ink)) 0%, rgb(var(--brand-800)) 50%, rgb(var(--brand-ink)) 100%)', boxShadow: '0 4px 30px rgb(var(--brand-600) / 0.25)' }}
    >
      <div className="absolute top-0 right-0 w-72 h-72 rounded-full pointer-events-none opacity-[0.15]"
        style={{ background: 'radial-gradient(circle, rgb(var(--brand-600)) 0%, transparent 70%)', transform: 'translate(30%,-55%)' }} />
      <div className="absolute -bottom-16 left-1/4 w-48 h-48 rounded-full pointer-events-none opacity-[0.08]"
        style={{ background: 'radial-gradient(circle, rgb(var(--brand2-600)) 0%, transparent 70%)' }} />
      <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Sparkles size={12} className="text-brand-300" />
            <span className="text-brand-300/80 text-[10.5px] font-bold uppercase tracking-widest">CRM Overview</span>
          </div>
          <h2 className="text-lg sm:text-xl font-bold text-white">{greeting()}{name ? `, ${name}` : ''}</h2>
        </div>
        {range && (
          <div className="shrink-0">
            <RangeSelect variant="dark" value={range.key} onChange={v => onRangeChange({ range: v, from: undefined, to: undefined })} />
          </div>
        )}
      </div>
      {range?.key === 'custom' && (
        <div className="relative mt-3">
          <CustomRangeInputs
            dark
            from={range.from}
            to={range.to}
            onFrom={v => onRangeChange({ range: 'custom', from: v })}
            onTo={v => onRangeChange({ range: 'custom', to: v })}
          />
        </div>
      )}
    </motion.div>
  )
}

function AgentDashboard({ agentStats, myLeads, upcomingFollowUps, recentActivities, name }) {
  return (
    <div className="space-y-2.5">
      <WelcomeBanner name={name} />
      <AgentStatsCards agentStats={agentStats} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-2.5">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.35 }}>
          <GlassCard className="h-full">
            <SectionHeader title="My leads" icon={Target} href="/leads" />
            <div className="px-3 py-2">
              {myLeads?.length ? myLeads.map(lead => (
                <Link key={lead.id} href={`/leads/${lead.id}`}
                  className="flex items-center justify-between px-2 py-1.5 rounded-xl hover:bg-brand-50/60 transition-colors group">
                  <div className="flex items-center gap-2.5">
                    <LeadAvatar name={lead.full_name} size="sm" />
                    <div className="min-w-0">
                      <p className="text-[12px] font-semibold text-slate-800 group-hover:text-brand-700 truncate leading-none">{lead.full_name}</p>
                      <p className="text-[10.5px] text-slate-400 mt-0.5 truncate">{lead.company || 'No company'}</p>
                    </div>
                  </div>
                  <StatusBadge status={lead.status} size="sm" />
                </Link>
              )) : <InlineEmptyState icon={Users} message="No leads assigned to you yet" />}
            </div>
          </GlassCard>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.26, duration: 0.35 }}>
          <GlassCard className="h-full">
            <SectionHeader title="Recent activity" icon={Sparkles} iconColor="text-blue-400" />
            <div className="px-4 py-3 space-y-3">
              {recentActivities?.length ? recentActivities.map(act => (
                <ActivityFeedItem key={act.id} id={act.id} type={act.type} leadId={act.lead_id}
                  leadName={act.lead_name} description={act.description} createdAt={act.created_at} />
              )) : <InlineEmptyState icon={Sparkles} message="No activity yet" compact />}
            </div>
          </GlassCard>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.32, duration: 0.35 }}>
          <GlassCard className="h-full">
            <SectionHeader title="Follow-ups due" icon={Clock} href="/leads" iconColor="text-amber-500" />
            <div className="px-3 py-2">
              {upcomingFollowUps?.length ? upcomingFollowUps.map(lead => (
                <Link key={lead.id} href={`/leads/${lead.id}`}
                  className="flex items-center justify-between px-2 py-1.5 rounded-xl hover:bg-amber-50/60 transition-colors group">
                  <div className="flex items-center gap-2.5">
                    <LeadAvatar name={lead.full_name} size="sm" />
                    <div className="min-w-0">
                      <p className="text-[12px] font-semibold text-slate-800 group-hover:text-amber-700 truncate leading-none">{lead.full_name}</p>
                      <p className="text-[10.5px] text-amber-500 font-semibold mt-0.5">{lead.follow_up_at_human}</p>
                    </div>
                  </div>
                  <StatusBadge status={lead.status} size="sm" />
                </Link>
              )) : <InlineEmptyState icon={Clock} message="No follow-ups scheduled" />}
            </div>
          </GlassCard>
        </motion.div>
      </div>
    </div>
  )
}

export default function Dashboard({
  viewType, stats, leadsOverTime, statusBreakdown, sourceBreakdown,
  recentLeads, topDeals, upcomingFollowUps, recentActivities,
  agentStats, myLeads, range,
}) {
  const { auth } = usePage().props
  const name = auth?.user?.name?.split(' ')[0] ?? ''

  // Client-side cross-filter: click a status bar or a source slice and every
  // other card on the page re-slices instantly against the already-loaded
  // data — no round trip. The date `range` filter above is the only thing
  // that goes back to the server (it needs fresh aggregates).
  const [crossFilter, setCrossFilter] = useState(null) // { type: 'status'|'source', value }
  const toggleFilter = (type, value) => {
    setCrossFilter(prev => (prev?.type === type && prev?.value === value) ? null : { type, value })
  }

  const updateRange = (params) => {
    router.get('/dashboard', { ...(range ?? {}), ...params }, { preserveState: true, preserveScroll: true })
  }

  const matches = (item) => !crossFilter
    || (crossFilter.type === 'status' && item.status === crossFilter.value)
    || (crossFilter.type === 'source' && item.source === crossFilter.value)

  const filteredRecentLeads = useMemo(() => recentLeads?.filter(matches), [recentLeads, crossFilter])
  const filteredTopDeals = useMemo(() => topDeals?.filter(matches), [topDeals, crossFilter])

  const maxDeal = topDeals?.length ? Math.max(...topDeals.map(d => d.deal_value)) : 1
  const maxStatus = statusBreakdown?.length ? Math.max(...statusBreakdown.map(s => s.value)) : 1

  const orderedStatus = FUNNEL_ORDER
    .map(s => statusBreakdown?.find(b => b.name === s))
    .filter(Boolean)

  const sourceData = useMemo(() => (sourceBreakdown ?? []).map((s, i) => ({
    ...s,
    color: SOURCE_COLORS[s.name] || FUNNEL_COLORS[i % FUNNEL_COLORS.length],
  })), [sourceBreakdown])
  const sourceTotal = sourceData.reduce((sum, s) => sum + s.value, 0)

  if (viewType === 'agent') {
    return (
      <>
        <Head title="Dashboard" />
        <AppLayout title="Dashboard">
          <AgentDashboard
            agentStats={agentStats} myLeads={myLeads}
            upcomingFollowUps={upcomingFollowUps} recentActivities={recentActivities}
            name={name}
          />
        </AppLayout>
      </>
    )
  }

  return (
    <>
      <Head title="Dashboard" />
      <AppLayout title="Dashboard">
        <div className="space-y-2.5">

          {/* Welcome banner + range filter */}
          <WelcomeBanner name={name} range={range} onRangeChange={updateRange} />

          {/* Active cross-filter indicator */}
          {crossFilter && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="flex items-center gap-2">
              <span className="text-[11px] text-slate-400">Filtered by {crossFilter.type}:</span>
              <button
                onClick={() => setCrossFilter(null)}
                className="inline-flex items-center gap-1.5 rounded-full bg-brand-50 text-brand-700 border border-brand-200 pl-2.5 pr-1.5 py-0.5 text-[11px] font-semibold capitalize hover:bg-brand-100 transition-colors"
              >
                {crossFilter.value}
                <X size={11} />
              </button>
            </motion.div>
          )}

          {/* KPI strip */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-2.5">
            <KpiTile title="Total Leads" value={stats?.total_leads ?? 0}  change={stats?.leads_change}
              icon={Users}      color="blue"   href="/leads"            index={0}
              sparkline={(leadsOverTime ?? []).map(d => d.count)} />
            <KpiTile title="Won"         value={stats?.won_count ?? 0}   change={stats?.won_change}
              icon={TrendingUp} color="green"  href="/leads?status=won" index={1} />
            <KpiTile title="Pipeline"    value={stats?.pipeline_value ? `$${(stats.pipeline_value / 1000).toFixed(1)}k` : '$0'}
              icon={DollarSign} color="purple" href="/pipeline"         index={2} />
            <KpiTile title="Open Deals"  value={stats?.open_deals ?? 0}
              icon={Briefcase}  color="teal"   href="/pipeline"         index={3} />
            <KpiTile title="Emails Sent" value={stats?.emails_sent ?? 0}
              icon={Mail}       color="red"    href="/campaigns"        index={4} />
            <KpiTile title="Conv. Rate"  value={`${stats?.conversion_rate ?? 0}%`}
              icon={Percent}    color="amber"                            index={5} />
            <KpiTile title="Form Visitors" value={stats?.form_visitors ?? 0}
              icon={ClipboardList} color="indigo" href="/forms"         index={6} />
          </div>

          {/* Row 2 — Area chart + Funnel (clickable) */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-2.5">
            <motion.div className="lg:col-span-2" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.35 }}>
              <GlassCard className="h-full">
                <SectionHeader title="New leads" icon={ActivityIcon} />
                <div className="px-3.5 py-2.5">
                  <ResponsiveContainer width="100%" height={150}>
                    <AreaChart data={leadsOverTime ?? []} margin={{ top: 6, right: 4, left: -24, bottom: 0 }}>
                      <defs>
                        <linearGradient id="ag" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="rgb(var(--brand-600))" stopOpacity={0.22} />
                          <stop offset="100%" stopColor="rgb(var(--brand-600))" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 6" stroke="rgba(0,0,0,0.05)" vertical={false} />
                      <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 10, fill: '#94A3B8' }} axisLine={false} tickLine={false} allowDecimals={false} />
                      <Tooltip content={<AreaTooltip />} cursor={{ stroke: 'rgb(var(--brand-600) / 0.15)', strokeWidth: 1 }} />
                      <Area type="monotone" dataKey="count" stroke="rgb(var(--brand-600))" strokeWidth={2} fill="url(#ag)"
                        dot={false} activeDot={{ r: 4, fill: 'rgb(var(--brand-600))', stroke: '#fff', strokeWidth: 2 }} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </GlassCard>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.26, duration: 0.35 }}>
              <GlassCard className="h-full">
                <SectionHeader title="Pipeline funnel" />
                <div className="px-4 py-2.5 space-y-2">
                  {orderedStatus.length ? orderedStatus.map((item, i) => (
                    <FunnelBar key={item.name} name={item.name} value={item.value}
                      max={maxStatus} color={FUNNEL_COLORS[i] || '#94a3b8'}
                      active={crossFilter?.type === 'status' && crossFilter.value === item.name}
                      dimmed={crossFilter?.type === 'status' && crossFilter.value !== item.name}
                      onClick={() => toggleFilter('status', item.name)}
                    />
                  )) : (
                    <div className="flex items-center justify-center h-32 text-slate-300 text-[12px]">No data yet</div>
                  )}
                </div>
              </GlassCard>
            </motion.div>
          </div>

          {/* Row 3 — Source donut + Top deals (both cross-filterable) */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-2.5">
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.30, duration: 0.35 }}>
              <GlassCard className="h-full">
                <SectionHeader title="Lead sources" />
                <div className="px-3 py-2.5">
                  {sourceData.length ? (
                    <div className="flex items-center gap-3">
                      <div style={{ width: 88, height: 88 }} className="shrink-0">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Tooltip content={<BarTooltip />} />
                            <Pie
                              data={sourceData} dataKey="value" nameKey="name"
                              innerRadius={26} outerRadius={42} paddingAngle={2}
                              stroke="none" isAnimationActive={false}
                            >
                              {sourceData.map((entry, i) => (
                                <Cell
                                  key={i}
                                  fill={entry.color}
                                  opacity={!crossFilter || (crossFilter.type === 'source' && crossFilter.value === entry.name) ? 0.9 : 0.25}
                                  className="cursor-pointer"
                                  onClick={() => toggleFilter('source', entry.name)}
                                />
                              ))}
                            </Pie>
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                      <div className="flex-1 min-w-0 space-y-1.5">
                        {sourceData.map(s => (
                          <button
                            key={s.name}
                            onClick={() => toggleFilter('source', s.name)}
                            className={`flex items-center gap-1.5 w-full text-left transition-opacity ${crossFilter?.type === 'source' && crossFilter.value !== s.name ? 'opacity-35' : 'opacity-100'}`}
                          >
                            <span className="w-2 h-2 rounded-full shrink-0" style={{ background: s.color }} />
                            <span className="text-[10.5px] text-slate-500 capitalize truncate flex-1">{s.name}</span>
                            <span className="text-[10.5px] font-bold text-slate-700 shrink-0">{sourceTotal > 0 ? Math.round((s.value / sourceTotal) * 100) : 0}%</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="h-24 flex items-center justify-center text-slate-300 text-[12px]">No source data</div>
                  )}
                </div>
              </GlassCard>
            </motion.div>

            <motion.div className="lg:col-span-2" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.34, duration: 0.35 }}>
              <GlassCard className="h-full">
                <SectionHeader title="Top open deals" icon={Briefcase} href="/leads" iconColor="text-teal-500" />
                <div className="px-3 py-2">
                  {filteredTopDeals?.length ? filteredTopDeals.map((deal, i) => (
                    <Link key={deal.id} href={`/leads/${deal.id}`}
                      className="flex items-center gap-3 px-2 py-2 rounded-xl hover:bg-teal-50/60 transition-colors group">
                      <span className="text-[11px] font-bold text-slate-300 w-4 shrink-0">{i + 1}</span>
                      <LeadAvatar name={deal.full_name} size="sm" />
                      <div className="flex-1 min-w-0">
                        <p className="text-[12.5px] font-semibold text-slate-800 group-hover:text-teal-700 truncate leading-none">{deal.full_name}</p>
                        <p className="text-[11px] text-slate-400 mt-0.5 truncate">{deal.company}</p>
                      </div>
                      <div className="hidden sm:block w-20 h-1.5 rounded-full bg-slate-100 overflow-hidden shrink-0">
                        <div className="h-full rounded-full bg-teal-400" style={{ width: `${Math.round((deal.deal_value / maxDeal) * 100)}%` }} />
                      </div>
                      <span className="text-[12px] font-bold text-teal-600 w-16 sm:w-20 text-right shrink-0">
                        ${Number(deal.deal_value).toLocaleString()}
                      </span>
                      <StatusBadge status={deal.status} size="sm" />
                    </Link>
                  )) : <InlineEmptyState icon={Briefcase} message={crossFilter ? 'No deals match this filter' : 'No deals with value yet'} />}
                </div>
              </GlassCard>
            </motion.div>
          </div>

          {/* Row 4 — Tabbed: Recent leads / Recent activity / Follow-ups (compact) */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.38, duration: 0.35 }}>
            <GlassCard>
              <Tabs defaultValue="leads">
                <div className="flex items-center justify-between px-4 pt-2.5 pb-2 border-b border-slate-100/80">
                  <TabsList className="h-8 bg-slate-100/70 p-0.5">
                    <TabsTrigger value="leads" className="text-[11.5px] px-3 h-7">Recent leads</TabsTrigger>
                    <TabsTrigger value="activity" className="text-[11.5px] px-3 h-7">Activity</TabsTrigger>
                    <TabsTrigger value="followups" className="text-[11.5px] px-3 h-7">Follow-ups</TabsTrigger>
                  </TabsList>
                </div>

                <TabsContent value="leads" className="mt-0 px-3 py-2 max-h-[280px] overflow-y-auto">
                  {filteredRecentLeads?.length ? filteredRecentLeads.map(lead => (
                    <Link key={lead.id} href={`/leads/${lead.id}`}
                      className="flex items-center justify-between px-2 py-1.5 rounded-xl hover:bg-brand-50/60 transition-colors group">
                      <div className="flex items-center gap-2.5">
                        <LeadAvatar name={lead.full_name} size="sm" />
                        <div className="min-w-0">
                          <p className="text-[12px] font-semibold text-slate-800 group-hover:text-brand-700 truncate leading-none">{lead.full_name}</p>
                          <p className="text-[10.5px] text-slate-400 mt-0.5 truncate">{lead.company || 'No company'}</p>
                        </div>
                      </div>
                      <StatusBadge status={lead.status} size="sm" />
                    </Link>
                  )) : <InlineEmptyState icon={Users} message={crossFilter ? 'No leads match this filter' : 'No leads yet'} />}
                </TabsContent>

                <TabsContent value="activity" className="mt-0 px-4 py-3 space-y-3 max-h-[280px] overflow-y-auto">
                  {recentActivities?.length ? recentActivities.map(act => (
                    <ActivityFeedItem key={act.id} id={act.id} type={act.type} leadId={act.lead_id}
                      leadName={act.lead_name} description={act.description} createdAt={act.created_at} />
                  )) : <InlineEmptyState icon={Sparkles} message="No activity yet" compact />}
                </TabsContent>

                <TabsContent value="followups" className="mt-0 px-3 py-2 max-h-[280px] overflow-y-auto">
                  {upcomingFollowUps?.length ? upcomingFollowUps.map(lead => (
                    <Link key={lead.id} href={`/leads/${lead.id}`}
                      className="flex items-center justify-between px-2 py-1.5 rounded-xl hover:bg-amber-50/60 transition-colors group">
                      <div className="flex items-center gap-2.5">
                        <LeadAvatar name={lead.full_name} size="sm" />
                        <div className="min-w-0">
                          <p className="text-[12px] font-semibold text-slate-800 group-hover:text-amber-700 truncate leading-none">{lead.full_name}</p>
                          <p className="text-[10.5px] text-amber-500 font-semibold mt-0.5">{lead.follow_up_at_human}</p>
                        </div>
                      </div>
                      <StatusBadge status={lead.status} size="sm" />
                    </Link>
                  )) : <InlineEmptyState icon={Clock} message="No follow-ups scheduled" />}
                </TabsContent>
              </Tabs>
            </GlassCard>
          </motion.div>

        </div>
      </AppLayout>
    </>
  )
}
