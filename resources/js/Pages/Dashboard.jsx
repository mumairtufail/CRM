import { Head, Link } from '@inertiajs/react'
import AppLayout from '@/Components/Layout/AppLayout'
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar, Cell,
} from 'recharts'
import {
  Users, TrendingUp, Mail, Target, Clock,
  ArrowRight, Sparkles, Percent, Briefcase,
  MessageSquare, PhoneCall, Send, Star, Tag,
} from 'lucide-react'
import StatusBadge from '@/Components/Common/StatusBadge'
import LeadAvatar from '@/Components/Common/LeadAvatar'
import { usePage } from '@inertiajs/react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

const PIE_COLORS  = ['#7C3AED','#3B82F6','#10B981','#F59E0B','#EF4444','#EC4899','#14B8A6','#F97316']
const SRC_COLORS  = { manual:'#7C3AED', csv:'#3B82F6', google_sheet:'#10B981', claude_ai:'#F59E0B', apollo:'#EF4444', facebook:'#1877F2', instagram:'#E1306C' }
const ACT_ICONS   = { note: MessageSquare, email_sent: Send, call: PhoneCall, status_change: Star, import: Tag }
const ACT_COLORS  = { note:'text-slate-500 bg-slate-100', email_sent:'text-blue-500 bg-blue-50', call:'text-green-500 bg-green-50', status_change:'text-amber-500 bg-amber-50', import:'text-purple-500 bg-purple-50' }

const greeting = () => {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 17) return 'Good afternoon'
  return 'Good evening'
}

const glass = {
  background: 'rgba(255,255,255,0.88)',
  backdropFilter: 'blur(12px)',
  border: '1px solid rgba(255,255,255,0.95)',
  boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 4px 24px rgba(0,0,0,0.04)',
}

function GCard({ children, className = '', style = {}, onClick }) {
  return (
    <div className={`rounded-2xl overflow-hidden ${className} ${onClick ? 'cursor-pointer' : ''}`}
      style={{ ...glass, ...style }} onClick={onClick}>
      {children}
    </div>
  )
}

function SHead({ title, icon: Icon, href, color = 'text-violet-500' }) {
  return (
    <div className="flex items-center justify-between px-5 pt-4 pb-3 border-b border-slate-100/80">
      <div className="flex items-center gap-2">
        {Icon && <Icon size={13} className={color} strokeWidth={2} />}
        <h3 className="text-[11px] font-bold uppercase tracking-[0.12em] text-slate-400">{title}</h3>
      </div>
      {href && (
        <Link href={href} className="flex items-center gap-1 text-[11px] text-violet-500 hover:text-violet-700 font-semibold">
          View all <ArrowRight size={10} />
        </Link>
      )}
    </div>
  )
}

const AreaTip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-xl px-3 py-2 shadow-xl" style={{ background: '#1A1628', border: '1px solid rgba(255,255,255,0.1)' }}>
      <p className="text-[10px] text-white/40 mb-0.5">{label}</p>
      <p className="text-[13px] font-bold text-white">{payload[0].value} leads</p>
    </div>
  )
}

const BarTip = ({ active, payload }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-xl px-3 py-2 shadow-xl" style={{ background: '#1A1628', border: '1px solid rgba(255,255,255,0.1)' }}>
      <p className="text-[11px] font-bold text-white capitalize">{payload[0].payload.name}</p>
      <p className="text-[11px] text-white/60">{payload[0].value} leads</p>
    </div>
  )
}

function StatCard({ title, value, change, icon: Icon, color, href, index }) {
  const palette = {
    blue:   { bar: '#3B82F6', icon: 'bg-blue-50 text-blue-600',       glow: 'rgba(59,130,246,0.08)' },
    green:  { bar: '#10B981', icon: 'bg-emerald-50 text-emerald-600', glow: 'rgba(16,185,129,0.08)' },
    amber:  { bar: '#F59E0B', icon: 'bg-amber-50 text-amber-600',     glow: 'rgba(245,158,11,0.08)' },
    purple: { bar: '#7C3AED', icon: 'bg-violet-50 text-violet-600',   glow: 'rgba(124,58,237,0.08)' },
    teal:   { bar: '#14B8A6', icon: 'bg-teal-50 text-teal-600',       glow: 'rgba(20,184,166,0.08)' },
  }
  const c = palette[color] || palette.blue

  const inner = (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
      className="relative overflow-hidden rounded-2xl p-4 group hover:-translate-y-0.5 transition-transform"
      style={glass}
    >
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
        style={{ background: `radial-gradient(ellipse at 0% 0%, ${c.glow} 0%, transparent 65%)` }} />
      <div className="absolute top-0 left-4 h-[2.5px] w-8 rounded-b-full" style={{ background: c.bar }} />
      <div className="relative flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-slate-400">{title}</p>
          <p className="text-[24px] font-bold text-slate-800 mt-1 leading-none">{value ?? '—'}</p>
          {change != null && (
            <p className={cn('text-[10.5px] font-semibold mt-1.5', change >= 0 ? 'text-emerald-600' : 'text-red-500')}>
              {change >= 0 ? '▲' : '▼'} {Math.abs(change)}% vs last month
            </p>
          )}
        </div>
        <div className={cn('p-2.5 rounded-xl shrink-0 group-hover:scale-110 transition-transform', c.icon)}>
          <Icon size={17} strokeWidth={1.75} />
        </div>
      </div>
    </motion.div>
  )

  return href ? <Link href={href}>{inner}</Link> : inner
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

const FUNNEL_ORDER = ['new','contacted','qualified','proposal','negotiation','won','lost']
const FUNNEL_COLORS = ['#7C3AED','#6366F1','#3B82F6','#0EA5E9','#10B981','#22C55E','#EF4444']

export default function Dashboard({
  stats, leadsOverTime, statusBreakdown, sourceBreakdown,
  recentLeads, topDeals, upcomingFollowUps, recentActivities
}) {
  const { auth } = usePage().props
  const name = auth?.user?.name?.split(' ')[0] ?? ''
  const maxDeal = topDeals?.length ? Math.max(...topDeals.map(d => d.deal_value)) : 1
  const maxStatus = statusBreakdown?.length ? Math.max(...statusBreakdown.map(s => s.value)) : 1

  const orderedStatus = FUNNEL_ORDER
    .map(s => statusBreakdown?.find(b => b.name === s))
    .filter(Boolean)

  return (
    <>
      <Head title="Dashboard" />
      <AppLayout title="Dashboard">

        {/* Welcome banner */}
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="relative overflow-hidden rounded-2xl px-6 py-5 mb-5"
          style={{ background: 'linear-gradient(135deg, #1A1628 0%, #2D1B6B 50%, #1A1628 100%)', boxShadow: '0 4px 30px rgba(124,58,237,0.25)' }}
        >
          <div className="absolute top-0 right-0 w-72 h-72 rounded-full pointer-events-none opacity-[0.15]"
            style={{ background: 'radial-gradient(circle, #7C3AED 0%, transparent 70%)', transform: 'translate(30%,-55%)' }} />
          <div className="absolute -bottom-16 left-1/4 w-48 h-48 rounded-full pointer-events-none opacity-[0.08]"
            style={{ background: 'radial-gradient(circle, #4F46E5 0%, transparent 70%)' }} />
          <div className="relative flex items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <Sparkles size={12} className="text-violet-300" />
                <span className="text-violet-300/80 text-[10.5px] font-bold uppercase tracking-widest">CRM Overview</span>
              </div>
              <h2 className="text-xl font-bold text-white">{greeting()}{name ? `, ${name}` : ''} 👋</h2>
              <p className="text-white/40 text-[12.5px] mt-0.5">Here's your pipeline snapshot for today.</p>
            </div>
            <div className="hidden lg:flex items-center gap-6 shrink-0">
              {[
                { label: 'Total Leads', value: stats?.total_leads ?? 0 },
                { label: 'Pipeline', value: stats?.pipeline_value ? `$${(stats.pipeline_value/1000).toFixed(1)}k` : '$0' },
                { label: 'Conv. Rate', value: `${stats?.conversion_rate ?? 0}%` },
              ].map(item => (
                <div key={item.label} className="text-center">
                  <p className="text-[22px] font-bold text-white leading-none">{item.value}</p>
                  <p className="text-[10px] text-white/35 uppercase tracking-wider mt-0.5">{item.label}</p>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* 5 Stat Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 mb-4">
          <StatCard title="Total Leads"    value={stats?.total_leads ?? 0}     change={stats?.leads_change}  icon={Users}      color="blue"   href="/leads"              index={0} />
          <StatCard title="Won This Month" value={stats?.won_count ?? 0}        change={stats?.won_change}    icon={TrendingUp} color="green"  href="/leads?status=won"   index={1} />
          <StatCard title="Emails Sent"    value={stats?.emails_sent ?? 0}                                    icon={Mail}       color="purple" href="/campaigns"           index={2} />
          <StatCard title="Open Deals"     value={stats?.open_deals ?? 0}                                     icon={Briefcase}  color="teal"   href="/pipeline"            index={3} />
          <StatCard title="Conv. Rate"     value={`${stats?.conversion_rate ?? 0}%`}                          icon={Percent}    color="amber"                              index={4} />
        </div>

        {/* Row 2 — Area chart + Donut */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 mb-3">
          <motion.div className="lg:col-span-2" initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.2, duration:0.35 }}>
            <GCard className="h-full">
              <SHead title="New leads (last 30 days)" />
              <div className="px-4 py-4">
                <ResponsiveContainer width="100%" height={185}>
                  <AreaChart data={leadsOverTime ?? []} margin={{ top:6, right:4, left:-24, bottom:0 }}>
                    <defs>
                      <linearGradient id="ag" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%"   stopColor="#7C3AED" stopOpacity={0.22} />
                        <stop offset="100%" stopColor="#7C3AED" stopOpacity={0}   />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 6" stroke="rgba(0,0,0,0.05)" vertical={false} />
                    <XAxis dataKey="date" tick={{ fontSize:10, fill:'#94A3B8' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize:10, fill:'#94A3B8' }} axisLine={false} tickLine={false} allowDecimals={false} />
                    <Tooltip content={<AreaTip />} cursor={{ stroke:'rgba(124,58,237,0.15)', strokeWidth:1 }} />
                    <Area type="monotone" dataKey="count" stroke="#7C3AED" strokeWidth={2} fill="url(#ag)"
                      dot={false} activeDot={{ r:4, fill:'#7C3AED', stroke:'#fff', strokeWidth:2 }} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </GCard>
          </motion.div>

          <motion.div initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.26, duration:0.35 }}>
            <GCard className="h-full">
              <SHead title="Pipeline funnel" />
              <div className="px-5 py-4 space-y-2.5">
                {orderedStatus.length ? orderedStatus.map((item, i) => (
                  <FunnelBar key={item.name} name={item.name} value={item.value}
                    max={maxStatus} color={FUNNEL_COLORS[i] || '#94a3b8'} />
                )) : (
                  <div className="flex items-center justify-center h-32 text-slate-300 text-[12px]">No data yet</div>
                )}
              </div>
            </GCard>
          </motion.div>
        </div>

        {/* Row 3 — Source chart + Top deals */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 mb-3">
          <motion.div initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.30, duration:0.35 }}>
            <GCard className="h-full">
              <SHead title="Lead sources" />
              <div className="px-3 py-3">
                {sourceBreakdown?.length ? (
                  <ResponsiveContainer width="100%" height={180}>
                    <BarChart data={sourceBreakdown} layout="vertical" margin={{ top:0, right:16, left:4, bottom:0 }}>
                      <XAxis type="number" tick={{ fontSize:9, fill:'#94A3B8' }} axisLine={false} tickLine={false} allowDecimals={false} />
                      <YAxis type="category" dataKey="name" tick={{ fontSize:10, fill:'#64748B' }} axisLine={false} tickLine={false} width={70} />
                      <Tooltip content={<BarTip />} cursor={{ fill:'rgba(124,58,237,0.04)' }} />
                      <Bar dataKey="value" radius={[0,4,4,0]}>
                        {sourceBreakdown.map((entry, i) => (
                          <Cell key={i} fill={SRC_COLORS[entry.name] || PIE_COLORS[i % PIE_COLORS.length]} opacity={0.85} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-40 flex items-center justify-center text-slate-300 text-[12px]">No source data</div>
                )}
              </div>
            </GCard>
          </motion.div>

          <motion.div className="lg:col-span-2" initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.34, duration:0.35 }}>
            <GCard className="h-full">
              <SHead title="Top open deals" icon={Briefcase} href="/leads" iconColor="text-teal-500" />
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
                    {/* Mini progress bar */}
                    <div className="w-20 h-1.5 rounded-full bg-slate-100 overflow-hidden shrink-0">
                      <div className="h-full rounded-full bg-teal-400" style={{ width: `${Math.round((deal.deal_value / maxDeal) * 100)}%` }} />
                    </div>
                    <span className="text-[12px] font-bold text-teal-600 w-20 text-right shrink-0">
                      ${Number(deal.deal_value).toLocaleString()}
                    </span>
                    <StatusBadge status={deal.status} size="sm" />
                  </Link>
                )) : (
                  <div className="flex flex-col items-center justify-center py-8 gap-2">
                    <Briefcase size={22} className="text-slate-200" />
                    <p className="text-[12px] text-slate-400">No deals with value yet</p>
                  </div>
                )}
              </div>
            </GCard>
          </motion.div>
        </div>

        {/* Row 4 — Recent leads + Activity feed + Follow-ups */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
          <motion.div initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.38, duration:0.35 }}>
            <GCard className="h-full">
              <SHead title="Recent leads" icon={Target} href="/leads" iconColor="text-violet-500" />
              <div className="px-3 py-2">
                {recentLeads?.length ? recentLeads.map(lead => (
                  <Link key={lead.id} href={`/leads/${lead.id}`}
                    className="flex items-center justify-between px-2 py-2 rounded-xl hover:bg-violet-50/60 transition-colors group">
                    <div className="flex items-center gap-2.5">
                      <LeadAvatar name={lead.full_name} size="sm" />
                      <div className="min-w-0">
                        <p className="text-[12px] font-semibold text-slate-800 group-hover:text-violet-700 truncate leading-none">{lead.full_name}</p>
                        <p className="text-[10.5px] text-slate-400 mt-0.5 truncate">{lead.company || 'No company'}</p>
                      </div>
                    </div>
                    <StatusBadge status={lead.status} size="sm" />
                  </Link>
                )) : (
                  <div className="flex flex-col items-center justify-center py-8 gap-2">
                    <Users size={22} className="text-slate-200" />
                    <p className="text-[12px] text-slate-400">No leads yet</p>
                  </div>
                )}
              </div>
            </GCard>
          </motion.div>

          <motion.div initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.42, duration:0.35 }}>
            <GCard className="h-full">
              <SHead title="Recent activity" icon={Sparkles} iconColor="text-blue-400" />
              <div className="px-4 py-3 space-y-3">
                {recentActivities?.length ? recentActivities.map(act => {
                  const Ic = ACT_ICONS[act.type] || MessageSquare
                  const cl = ACT_COLORS[act.type] || ACT_COLORS.note
                  return (
                    <div key={act.id} className="flex gap-2.5">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${cl}`}>
                        <Ic size={11} />
                      </div>
                      <div className="min-w-0">
                        {act.lead_id && (
                          <Link href={`/leads/${act.lead_id}`}
                            className="text-[11px] font-semibold text-violet-600 hover:underline truncate block leading-none mb-0.5">
                            {act.lead_name}
                          </Link>
                        )}
                        <p className="text-[11px] text-slate-500 leading-snug truncate">{act.description}</p>
                        <p className="text-[10px] text-slate-300 mt-0.5">{act.created_at}</p>
                      </div>
                    </div>
                  )
                }) : (
                  <div className="flex flex-col items-center justify-center py-6 gap-2">
                    <Sparkles size={20} className="text-slate-200" />
                    <p className="text-[12px] text-slate-400">No activity yet</p>
                  </div>
                )}
              </div>
            </GCard>
          </motion.div>

          <motion.div initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.46, duration:0.35 }}>
            <GCard className="h-full">
              <SHead title="Follow-ups due" icon={Clock} href="/leads" iconColor="text-amber-500" />
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
                )) : (
                  <div className="flex flex-col items-center justify-center py-8 gap-2">
                    <Clock size={22} className="text-slate-200" />
                    <p className="text-[12px] text-slate-400">No follow-ups scheduled</p>
                  </div>
                )}
              </div>
            </GCard>
          </motion.div>
        </div>

      </AppLayout>
    </>
  )
}
