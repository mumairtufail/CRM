import { Head, Link } from '@inertiajs/react'
import AppLayout from '@/Components/Layout/AppLayout'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar, Cell,
} from 'recharts'
import {
  Users, TrendingUp, Mail, Target, Clock,
  Sparkles, Percent, Briefcase,
} from 'lucide-react'
import StatusBadge from '@/Components/Common/StatusBadge'
import LeadAvatar from '@/Components/Common/LeadAvatar'
import StatCard from '@/Components/Common/StatCard'
import GlassCard from '@/Components/Common/GlassCard'
import SectionHeader from '@/Components/Common/SectionHeader'
import InlineEmptyState from '@/Components/Common/InlineEmptyState'
import ActivityFeedItem from '@/Components/Common/ActivityFeedItem'
import { AreaTooltip, BarTooltip } from '@/Components/Common/ChartTooltip'
import AgentStatsCards from '@/Components/Dashboard/AgentStatsCards'
import { CHART_COLORS, SOURCE_COLORS, FUNNEL_ORDER, FUNNEL_COLORS } from '@/lib/chartPalette'
import { usePage } from '@inertiajs/react'
import { motion } from 'framer-motion'

const greeting = () => {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 17) return 'Good afternoon'
  return 'Good evening'
}

function FunnelBar({ name, value, max, color }) {
  const pct = max > 0 ? Math.max(4, Math.round((value / max) * 100)) : 4
  return (
    <div className="flex items-center gap-2.5">
      <span className="text-[10.5px] font-semibold text-slate-500 capitalize w-20 shrink-0 text-right">{name}</span>
      <div className="flex-1 h-2 rounded-full bg-slate-100 overflow-hidden">
        <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: color }} />
      </div>
      <span className="text-[11px] font-bold text-slate-600 w-6 text-right shrink-0">{value}</span>
    </div>
  )
}

function WelcomeBanner({ name, children }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="relative overflow-hidden rounded-2xl px-5 py-5 sm:px-6"
      style={{ background: 'linear-gradient(135deg, rgb(var(--brand-ink)) 0%, rgb(var(--brand-800)) 50%, rgb(var(--brand-ink)) 100%)', boxShadow: '0 4px 30px rgb(var(--brand-600) / 0.25)' }}
    >
      <div className="absolute top-0 right-0 w-72 h-72 rounded-full pointer-events-none opacity-[0.15]"
        style={{ background: 'radial-gradient(circle, rgb(var(--brand-600)) 0%, transparent 70%)', transform: 'translate(30%,-55%)' }} />
      <div className="absolute -bottom-16 left-1/4 w-48 h-48 rounded-full pointer-events-none opacity-[0.08]"
        style={{ background: 'radial-gradient(circle, rgb(var(--brand2-600)) 0%, transparent 70%)' }} />
      <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <Sparkles size={12} className="text-brand-300" />
            <span className="text-brand-300/80 text-[10.5px] font-bold uppercase tracking-widest">CRM Overview</span>
          </div>
          <h2 className="text-lg sm:text-xl font-bold text-white">{greeting()}{name ? `, ${name}` : ''}</h2>
          <p className="text-white/40 text-[12.5px] mt-0.5">Here's your pipeline snapshot for today.</p>
        </div>
        {children}
      </div>
    </motion.div>
  )
}

function AgentDashboard({ agentStats, myLeads, upcomingFollowUps, recentActivities, name }) {
  return (
    <div className="space-y-4">
      <WelcomeBanner name={name} />
      <AgentStatsCards agentStats={agentStats} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.35 }}>
          <GlassCard className="h-full">
            <SectionHeader title="My leads" icon={Target} href="/leads" />
            <div className="px-3 py-2">
              {myLeads?.length ? myLeads.map(lead => (
                <Link key={lead.id} href={`/leads/${lead.id}`}
                  className="flex items-center justify-between px-2 py-2 rounded-xl hover:bg-brand-50/60 transition-colors group">
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
                  className="flex items-center justify-between px-2 py-2 rounded-xl hover:bg-amber-50/60 transition-colors group">
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
  agentStats, myLeads,
}) {
  const { auth } = usePage().props
  const name = auth?.user?.name?.split(' ')[0] ?? ''
  const maxDeal = topDeals?.length ? Math.max(...topDeals.map(d => d.deal_value)) : 1
  const maxStatus = statusBreakdown?.length ? Math.max(...statusBreakdown.map(s => s.value)) : 1

  const orderedStatus = FUNNEL_ORDER
    .map(s => statusBreakdown?.find(b => b.name === s))
    .filter(Boolean)

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
        <div className="space-y-4">

          {/* Welcome banner */}
          <WelcomeBanner name={name}>
            <div className="flex items-center gap-4 sm:gap-6 shrink-0">
              {[
                { label: 'Leads', value: stats?.total_leads ?? 0 },
                { label: 'Pipeline', value: stats?.pipeline_value ? `$${(stats.pipeline_value / 1000).toFixed(1)}k` : '$0' },
                { label: 'Conv.', value: `${stats?.conversion_rate ?? 0}%` },
              ].map(item => (
                <div key={item.label} className="text-center">
                  <p className="text-[18px] sm:text-[22px] font-bold text-white leading-none">{item.value}</p>
                  <p className="text-[9px] sm:text-[10px] text-white/35 uppercase tracking-wider mt-0.5">{item.label}</p>
                </div>
              ))}
            </div>
          </WelcomeBanner>

          {/* 5 Stat Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            <StatCard title="Total Leads"    value={stats?.total_leads ?? 0}     change={stats?.leads_change}  icon={Users}      color="blue"   href="/leads"              index={0} />
            <StatCard title="Won This Month" value={stats?.won_count ?? 0}        change={stats?.won_change}    icon={TrendingUp} color="green"  href="/leads?status=won"   index={1} />
            <StatCard title="Emails Sent"    value={stats?.emails_sent ?? 0}                                    icon={Mail}       color="purple" href="/campaigns"           index={2} />
            <StatCard title="Open Deals"     value={stats?.open_deals ?? 0}                                     icon={Briefcase}  color="teal"   href="/pipeline"            index={3} />
            <StatCard title="Conv. Rate"     value={`${stats?.conversion_rate ?? 0}%`}                          icon={Percent}    color="amber"                              index={4} />
          </div>

          {/* Row 2 — Area chart + Funnel */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <motion.div className="lg:col-span-2" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.35 }}>
              <GlassCard className="h-full">
                <SectionHeader title="New leads (last 30 days)" />
                <div className="px-4 py-4">
                  <ResponsiveContainer width="100%" height={185}>
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
                <div className="px-5 py-4 space-y-2.5">
                  {orderedStatus.length ? orderedStatus.map((item, i) => (
                    <FunnelBar key={item.name} name={item.name} value={item.value}
                      max={maxStatus} color={FUNNEL_COLORS[i] || '#94a3b8'} />
                  )) : (
                    <div className="flex items-center justify-center h-32 text-slate-300 text-[12px]">No data yet</div>
                  )}
                </div>
              </GlassCard>
            </motion.div>
          </div>

          {/* Row 3 — Source chart + Top deals */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.30, duration: 0.35 }}>
              <GlassCard className="h-full">
                <SectionHeader title="Lead sources" />
                <div className="px-3 py-3">
                  {sourceBreakdown?.length ? (
                    <ResponsiveContainer width="100%" height={180}>
                      <BarChart data={sourceBreakdown} layout="vertical" margin={{ top: 0, right: 16, left: 4, bottom: 0 }}>
                        <XAxis type="number" tick={{ fontSize: 9, fill: '#94A3B8' }} axisLine={false} tickLine={false} allowDecimals={false} />
                        <YAxis type="category" dataKey="name" tick={{ fontSize: 10, fill: '#64748B' }} axisLine={false} tickLine={false} width={70} />
                        <Tooltip content={<BarTooltip />} cursor={{ fill: 'rgb(var(--brand-600) / 0.04)' }} />
                        <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                          {sourceBreakdown.map((entry, i) => (
                            <Cell key={i} fill={SOURCE_COLORS[entry.name] || CHART_COLORS[i % CHART_COLORS.length]} opacity={0.85} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-40 flex items-center justify-center text-slate-300 text-[12px]">No source data</div>
                  )}
                </div>
              </GlassCard>
            </motion.div>

            <motion.div className="lg:col-span-2" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.34, duration: 0.35 }}>
              <GlassCard className="h-full">
                <SectionHeader title="Top open deals" icon={Briefcase} href="/leads" iconColor="text-teal-500" />
                <div className="px-3 py-2">
                  {topDeals?.length ? topDeals.map((deal, i) => (
                    <Link key={deal.id} href={`/leads/${deal.id}`}
                      className="flex items-center gap-3 px-2 py-2.5 rounded-xl hover:bg-teal-50/60 transition-colors group">
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
                  )) : <InlineEmptyState icon={Briefcase} message="No deals with value yet" />}
                </div>
              </GlassCard>
            </motion.div>
          </div>

          {/* Row 4 — Recent leads + Activity feed + Follow-ups */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.38, duration: 0.35 }}>
              <GlassCard className="h-full">
                <SectionHeader title="Recent leads" icon={Target} href="/leads" />
                <div className="px-3 py-2">
                  {recentLeads?.length ? recentLeads.map(lead => (
                    <Link key={lead.id} href={`/leads/${lead.id}`}
                      className="flex items-center justify-between px-2 py-2 rounded-xl hover:bg-brand-50/60 transition-colors group">
                      <div className="flex items-center gap-2.5">
                        <LeadAvatar name={lead.full_name} size="sm" />
                        <div className="min-w-0">
                          <p className="text-[12px] font-semibold text-slate-800 group-hover:text-brand-700 truncate leading-none">{lead.full_name}</p>
                          <p className="text-[10.5px] text-slate-400 mt-0.5 truncate">{lead.company || 'No company'}</p>
                        </div>
                      </div>
                      <StatusBadge status={lead.status} size="sm" />
                    </Link>
                  )) : <InlineEmptyState icon={Users} message="No leads yet" />}
                </div>
              </GlassCard>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.42, duration: 0.35 }}>
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

            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.46, duration: 0.35 }}>
              <GlassCard className="h-full">
                <SectionHeader title="Follow-ups due" icon={Clock} href="/leads" iconColor="text-amber-500" />
                <div className="px-3 py-2">
                  {upcomingFollowUps?.length ? upcomingFollowUps.map(lead => (
                    <Link key={lead.id} href={`/leads/${lead.id}`}
                      className="flex items-center justify-between px-2 py-2 rounded-xl hover:bg-amber-50/60 transition-colors group">
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
      </AppLayout>
    </>
  )
}
