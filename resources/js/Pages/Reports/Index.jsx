import { useMemo, useState } from 'react'
import { Head, Link, router } from '@inertiajs/react'
import AppLayout from '@/Components/Layout/AppLayout'
import {
  BarChart, Bar, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from 'recharts'
import {
  Select, SelectTrigger, SelectValue, SelectContent, SelectItem,
} from '@/Components/ui/select'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/Components/ui/tabs'
import {
  BarChart3, Users, Mail, MessageSquare, ChevronLeft, ChevronRight, TrendingUp,
  Globe, MapPin, X, Percent, UserCheck, Clock, Star, Phone,
} from 'lucide-react'
import { CONTACT_CHANNELS } from '@/Components/Common/OutreachChannels'
import GlassCard from '@/Components/Common/GlassCard'
import SectionHeader from '@/Components/Common/SectionHeader'
import InlineEmptyState from '@/Components/Common/InlineEmptyState'
import ActivityFeedItem from '@/Components/Common/ActivityFeedItem'
import LeadAvatar from '@/Components/Common/LeadAvatar'
import KpiTile from '@/Components/Common/KpiTile'
import { AreaTooltip, BarTooltip } from '@/Components/Common/ChartTooltip'
import RangeSelect, { CustomRangeInputs } from '@/Components/Common/RangeFilter'
import { CHART_COLORS, FUNNEL_COLORS } from '@/lib/chartPalette'

const CHANNEL_META = Object.fromEntries(CONTACT_CHANNELS.map(c => [c.key, c]))

function ChipMini({ channel, dimmed }) {
  const meta = CHANNEL_META[channel]
  if (!meta) return null
  return (
    <span
      title={meta.label}
      className={`inline-flex items-center justify-center rounded font-bold w-4 h-4 text-[7px] text-white shrink-0 transition-opacity ${dimmed ? 'opacity-25' : 'opacity-100'}`}
      style={{ background: meta.bg }}
    >
      {meta.letter.toUpperCase()}
    </span>
  )
}

function RateBar({ label, pct, color }) {
  return (
    <div className="flex items-center gap-2 mt-1.5">
      <div className="flex-1 h-1.5 rounded-full bg-slate-100 overflow-hidden">
        <div className="h-full rounded-full" style={{ width: `${Math.min(100, pct)}%`, background: color }} />
      </div>
      <span className="text-[10px] font-semibold text-slate-500 w-16 shrink-0">{pct}% {label}</span>
    </div>
  )
}

// Connected funnel visual — bar width relative to total leads created, so the
// row reads as a shrinking flow rather than 4 disconnected numbers. The KPI
// strip above already headlines contact/win rates, so this stays focused on
// the underlying volume at each stage.
function FunnelStage({ label, value, pct, note, color }) {
  return (
    <div className="flex-1 min-w-[100px]">
      <div className="h-2 rounded-full bg-slate-100 overflow-hidden mb-1.5">
        <div className="h-full rounded-full transition-all" style={{ width: `${Math.max(3, pct)}%`, background: color }} />
      </div>
      <p className="text-[19px] font-bold text-slate-800 leading-none">{value}</p>
      <p className="text-[10px] text-slate-400 mt-1">{label}{note ? ` · ${note}` : ''}</p>
    </div>
  )
}

export default function ReportsIndex({
  range, agentRows, channelBreakdown, funnel, geo, engagement, summary, leadsTrend,
  activities, filters, filterOptions,
}) {
  const updateQuery = (params) => {
    router.get('/reports', { ...filters, ...params }, { preserveState: true, preserveScroll: true })
  }

  // Client-side cross-filter: click a channel bar and every agent row /
  // channel chip on the page dims to just that channel, instantly, using
  // data already on the page. Distinct from the server-driven filters below
  // (date range, agent, activity type) which need fresh aggregates.
  const [selectedChannel, setSelectedChannel] = useState(null)
  const toggleChannel = (name) => setSelectedChannel(prev => prev === name ? null : name)

  const chipChannels = channelBreakdown.filter(c => c.name !== 'email_sends' && c.name !== 'whatsapp_sends')
  const topCountriesByAgent = geo?.top_countries_by_agent ?? {}

  const rowHasChannel = (row) => Object.keys(row.channel_counts ?? {}).includes(selectedChannel)

  const topPerformerId = useMemo(() => {
    const withWins = agentRows.filter(r => r.won_count > 0)
    if (!withWins.length) return null
    return withWins.reduce((best, r) => r.won_count > best.won_count ? r : best).id
  }, [agentRows])

  return (
    <AppLayout title="Reports">
      <Head title="Reports" />

      <div className="space-y-2.5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-[18px] font-bold text-slate-800 tracking-tight leading-none">Reports & Analytics</h2>
            <p className="text-slate-500 mt-1.5 text-[13px]">
              {range.from} to {range.to}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <RangeSelect
              value={range.key}
              onChange={v => {
                if (v === 'custom') {
                  updateQuery({ range: v, from: range.from, to: range.to })
                } else {
                  updateQuery({ range: v, from: undefined, to: undefined })
                }
              }}
            />
            {range.key === 'custom' && (
              <CustomRangeInputs
                from={range.from}
                to={range.to}
                onFrom={v => updateQuery({ range: 'custom', from: v, to: filters.to ?? range.to })}
                onTo={v => updateQuery({ range: 'custom', to: v, from: filters.from ?? range.from })}
              />
            )}
          </div>
        </div>

        {/* KPI strip */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-8 gap-2.5">
          <KpiTile title="Leads Created" value={summary.leads_created} icon={Users}       color="blue"  index={0}
            sparkline={(leadsTrend ?? []).map(d => d.count)} />
          <KpiTile title="Contact Rate" value={`${summary.contact_rate}%`}  icon={Percent}     color="teal"  index={1} />
          <KpiTile title="Win Rate"     value={`${summary.win_rate}%`}     icon={TrendingUp}  color="green" index={2} />
          <KpiTile title="Emails Sent"  value={summary.emails_sent}        icon={Mail}        color="purple" index={3} href="/campaigns" />
          <KpiTile title="WhatsApp Sent" value={summary.whatsapp_sent}     icon={MessageSquare} color="green" index={4} />
          <KpiTile title="Calls Placed" value={summary.calls_placed}      icon={Phone}       color="amber" index={5} href="/twilio" />
          <KpiTile title="Active Agents" value={summary.active_agents}    icon={UserCheck}   color="blue"  index={6} />
          <KpiTile title="Avg Hrs to Contact" value={summary.org_avg_hours_to_contact != null ? `${summary.org_avg_hours_to_contact}h` : '—'}
            icon={Clock} color="amber" index={7} />
        </div>

        <GlassCard>
          <SectionHeader title="Leads Over Time" icon={TrendingUp} />
          <div className="flex flex-wrap gap-4 px-5 pt-3">
            <FunnelStage label="Created"   value={funnel.total}     pct={100}
              color={FUNNEL_COLORS[0]} />
            <FunnelStage label="Contacted" value={funnel.contacted} pct={funnel.total > 0 ? (funnel.contacted / funnel.total) * 100 : 0}
              note={`${funnel.contact_rate}% of created`} color={FUNNEL_COLORS[1]} />
            <FunnelStage label="Won"       value={funnel.won}       pct={funnel.total > 0 ? (funnel.won / funnel.total) * 100 : 0}
              note={`${funnel.win_rate_of_closed}% of closed`} color={FUNNEL_COLORS[5]} />
            <FunnelStage label="Lost"      value={funnel.lost}      pct={funnel.total > 0 ? (funnel.lost / funnel.total) * 100 : 0}
              color={FUNNEL_COLORS[6]} />
          </div>
          <div className="px-3.5 py-2.5" style={{ height: 160 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={leadsTrend ?? []} margin={{ top: 6, right: 4, left: -24, bottom: 0 }}>
                <defs>
                  <linearGradient id="reportsTrendGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="rgb(var(--brand-600))" stopOpacity={0.22} />
                    <stop offset="100%" stopColor="rgb(var(--brand-600))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 6" stroke="rgba(0,0,0,0.05)" vertical={false} />
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip content={<AreaTooltip />} cursor={{ stroke: 'rgb(var(--brand-600) / 0.15)', strokeWidth: 1 }} />
                <Area type="monotone" dataKey="count" stroke="rgb(var(--brand-600))" strokeWidth={2} fill="url(#reportsTrendGradient)" dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-2.5">
          <GlassCard className="lg:col-span-2">
            <SectionHeader title="Channel Breakdown" icon={BarChart3} />
            {selectedChannel && (
              <div className="flex items-center gap-2 px-4 pt-2">
                <span className="text-[11px] text-slate-400">Highlighting:</span>
                <button
                  onClick={() => setSelectedChannel(null)}
                  className="inline-flex items-center gap-1.5 rounded-full bg-brand-50 text-brand-700 border border-brand-200 pl-2.5 pr-1.5 py-0.5 text-[11px] font-semibold capitalize hover:bg-brand-100 transition-colors"
                >
                  {CHANNEL_META[selectedChannel]?.label ?? selectedChannel}
                  <X size={11} />
                </button>
              </div>
            )}
            <div className="px-3.5 py-2.5" style={{ height: 240 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chipChannels} layout="vertical" margin={{ left: 10, right: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                  <XAxis type="number" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                  <YAxis type="category" dataKey="name" width={80} tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} />
                  <Tooltip content={<BarTooltip />} cursor={{ fill: 'rgb(var(--brand-600) / 0.04)' }} />
                  <Bar dataKey="value" radius={[0, 6, 6, 0]} barSize={14}>
                    {chipChannels.map((entry, i) => (
                      <Cell
                        key={i}
                        fill={CHART_COLORS[i % CHART_COLORS.length]}
                        opacity={!selectedChannel || selectedChannel === entry.name ? 0.85 : 0.25}
                        className="cursor-pointer"
                        onClick={() => toggleChannel(entry.name)}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </GlassCard>

          <GlassCard>
            <SectionHeader title="Engagement" icon={Mail} />
            <div className="grid grid-cols-2 divide-x divide-slate-100" style={{ height: 240 }}>
              <div className="px-3.5 py-3 flex flex-col justify-center min-w-0">
                <div className="flex items-center gap-2 mb-1.5">
                  <div className="p-1.5 rounded-lg bg-blue-50 text-blue-600 shrink-0"><Mail size={14} /></div>
                  <p className="text-[9.5px] font-bold uppercase tracking-[0.08em] text-slate-400 truncate">Emails</p>
                </div>
                <p className="text-[20px] font-bold text-slate-800 leading-none">{engagement.email.sent}</p>
                <RateBar label="opened" pct={engagement.email.open_rate} color="#3B82F6" />
                <RateBar label="clicked" pct={engagement.email.click_rate} color="#93C5FD" />
              </div>
              <div className="px-3.5 py-3 flex flex-col justify-center min-w-0">
                <div className="flex items-center gap-2 mb-1.5">
                  <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600 shrink-0"><MessageSquare size={14} /></div>
                  <p className="text-[9.5px] font-bold uppercase tracking-[0.08em] text-slate-400 truncate">WhatsApp</p>
                </div>
                <p className="text-[20px] font-bold text-slate-800 leading-none">{engagement.whatsapp.sent}</p>
                <RateBar label="delivered" pct={engagement.whatsapp.delivery_rate} color="#10B981" />
                <RateBar label="read" pct={engagement.whatsapp.read_rate} color="#6EE7B7" />
              </div>
            </div>
          </GlassCard>
        </div>

        <GlassCard>
          <SectionHeader title="Agent Performance" icon={Users} />
          <div className="overflow-x-auto">
            <table className="w-full text-[12.5px] min-w-[880px]">
              <thead>
                <tr className="text-left text-[10.5px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100">
                  <th className="px-4 py-2 sticky left-0 bg-white/90 backdrop-blur-sm">Agent</th>
                  <th className="px-3 py-2 text-right">Created</th>
                  <th className="px-3 py-2 text-right">Assigned</th>
                  <th className="px-3 py-2 text-right">Contacted</th>
                  <th className="px-3 py-2 text-right">Won</th>
                  <th className="px-3 py-2 text-right w-28">Conv. %</th>
                  <th className="px-3 py-2 text-right">Emails</th>
                  <th className="px-3 py-2 text-right">WhatsApp</th>
                  <th className="px-3 py-2 text-right">Calls</th>
                  <th className="px-3 py-2 text-right">Call Mins</th>
                  <th className="px-3 py-2 text-right">Avg. Hrs to Contact</th>
                  <th className="px-3 py-2">Channels</th>
                </tr>
              </thead>
              <tbody>
                {agentRows.map(row => {
                  const topCountries = topCountriesByAgent[row.id]?.map(c => c.country).join(', ')
                  const dimmed = selectedChannel && !rowHasChannel(row)
                  const isTop = row.id === topPerformerId
                  return (
                    <tr
                      key={row.id}
                      onClick={() => updateQuery({ user_id: filters.user_id === String(row.id) ? undefined : row.id })}
                      className={`border-b border-slate-50 hover:bg-slate-50/60 group cursor-pointer transition-opacity ${dimmed ? 'opacity-35' : 'opacity-100'} ${String(filters.user_id) === String(row.id) ? 'bg-brand-50/50' : ''}`}
                    >
                      <td className="px-4 py-1.5 font-semibold sticky left-0 bg-white/90 backdrop-blur-sm group-hover:bg-slate-50/90">
                        <Link
                          href={`/leads?assigned_to=${row.id}`}
                          onClick={e => e.stopPropagation()}
                          title={topCountries ? `Top territories: ${topCountries}` : undefined}
                          className="flex items-center gap-2 text-brand-600 hover:underline"
                        >
                          <LeadAvatar name={row.name} size="xs" />
                          <span className="truncate">{row.name}</span>
                          {isTop && <Star size={11} className="text-amber-400 fill-amber-400 shrink-0" />}
                        </Link>
                      </td>
                      <td className="px-3 py-1.5 text-slate-600 text-right">{row.leads_created}</td>
                      <td className="px-3 py-1.5 text-slate-600 text-right">{row.leads_assigned}</td>
                      <td className="px-3 py-1.5 text-slate-600 text-right">{row.leads_contacted}</td>
                      <td className="px-3 py-1.5 text-slate-600 text-right">{row.won_count}</td>
                      <td className="px-3 py-1.5">
                        <div className="flex items-center gap-1.5 justify-end">
                          <div className="w-10 h-1.5 rounded-full bg-slate-100 overflow-hidden shrink-0">
                            <div className="h-full rounded-full bg-emerald-400" style={{ width: `${Math.min(100, row.conversion_rate)}%` }} />
                          </div>
                          <span className="text-slate-600 font-semibold w-8 text-right shrink-0">{row.conversion_rate}%</span>
                        </div>
                      </td>
                      <td className="px-3 py-1.5 text-slate-600 text-right">{row.emails_sent}</td>
                      <td className="px-3 py-1.5 text-slate-600 text-right">{row.whatsapp_sent}</td>
                      <td className="px-3 py-1.5 text-slate-600 text-right">{row.calls_count}</td>
                      <td className="px-3 py-1.5 text-slate-600 text-right">{row.call_minutes}</td>
                      <td className="px-3 py-1.5 text-slate-600 text-right">
                        {row.avg_hours_to_contact != null ? `${row.avg_hours_to_contact}h` : '—'}
                        {row.contact_sample_size > 0 && <span className="text-slate-300 text-[10px] ml-1">(n={row.contact_sample_size})</span>}
                      </td>
                      <td className="px-3 py-1.5">
                        <div className="flex items-center gap-1">
                          {Object.keys(row.channel_counts ?? {}).map(ch => <ChipMini key={ch} channel={ch} />)}
                        </div>
                      </td>
                    </tr>
                  )
                })}
                {agentRows.length === 0 && (
                  <tr><td colSpan={12} className="text-center py-8 text-slate-400">No active agents</td></tr>
                )}
              </tbody>
            </table>
          </div>
          <p className="px-4 py-2 text-[10.5px] text-slate-400 border-t border-slate-100/80">
            Click a row to filter the activity feed below to that agent · click a channel bar above to highlight agents using it
          </p>
        </GlassCard>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-2.5">
          <GlassCard className="lg:col-span-2">
            <Tabs defaultValue="countries">
              <div className="flex items-center justify-between px-4 pt-2.5 pb-2 border-b border-slate-100/80">
                <TabsList className="h-8 bg-slate-100/70 p-0.5">
                  <TabsTrigger value="countries" className="text-[11.5px] px-3 h-7 gap-1.5"><Globe size={12} /> Countries</TabsTrigger>
                  <TabsTrigger value="cities" className="text-[11.5px] px-3 h-7 gap-1.5"><MapPin size={12} /> Cities</TabsTrigger>
                </TabsList>
              </div>
              <TabsContent value="countries" className="mt-0 px-3.5 py-2.5" style={{ height: 190 }}>
                {geo.by_country.length ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={geo.by_country} layout="vertical" margin={{ left: 10, right: 10 }}>
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                      <XAxis type="number" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} allowDecimals={false} />
                      <YAxis type="category" dataKey="name" width={80} tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} />
                      <Tooltip content={<BarTooltip />} cursor={{ fill: 'rgb(var(--brand-600) / 0.04)' }} />
                      <Bar dataKey="value" radius={[0, 6, 6, 0]} barSize={12} fill="rgb(var(--brand-600))" />
                    </BarChart>
                  </ResponsiveContainer>
                ) : <InlineEmptyState icon={Globe} message="No country data in this period" />}
              </TabsContent>
              <TabsContent value="cities" className="mt-0 px-4 py-2.5 space-y-2 overflow-y-auto" style={{ height: 190 }}>
                {geo.by_city.length ? geo.by_city.map(c => (
                  <div key={c.name} className="flex items-center justify-between text-[12.5px]">
                    <span className="text-slate-600">{c.name}</span>
                    <span className="font-semibold text-slate-800">{c.value}</span>
                  </div>
                )) : <InlineEmptyState icon={MapPin} message="No city data in this period" />}
              </TabsContent>
            </Tabs>
          </GlassCard>

          <GlassCard>
            <SectionHeader title="Activity Filters" icon={MessageSquare} />
            <div className="flex flex-wrap items-center gap-2 px-4 py-3">
              <Select value={filters.user_id ? String(filters.user_id) : 'all'} onValueChange={v => updateQuery({ user_id: v === 'all' ? undefined : v })}>
                <SelectTrigger className="h-7 text-[12px] w-full"><SelectValue placeholder="All agents" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All agents</SelectItem>
                  {filterOptions.users.map(u => <SelectItem key={u.id} value={String(u.id)}>{u.name}</SelectItem>)}
                </SelectContent>
              </Select>
              <Select value={filters.type ?? 'all'} onValueChange={v => updateQuery({ type: v === 'all' ? undefined : v })}>
                <SelectTrigger className="h-7 text-[12px] w-full"><SelectValue placeholder="All types" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All types</SelectItem>
                  {filterOptions.types.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                </SelectContent>
              </Select>
              <p className="text-[11px] text-slate-400 leading-snug">
                Filters the activity feed below — click an agent row above for the same effect.
              </p>
            </div>
          </GlassCard>
        </div>

        <GlassCard>
          <SectionHeader title="Activity Feed" icon={MessageSquare} />
          <div className="px-3.5 py-2.5 space-y-2.5">
            {activities.data.length ? activities.data.map(act => (
              <ActivityFeedItem
                key={act.id}
                id={act.id}
                type={act.type}
                leadId={act.lead_id}
                leadName={act.lead?.first_name ? `${act.lead.first_name} ${act.lead.last_name ?? ''}`.trim() : 'Lead'}
                description={act.description}
                createdAt={act.created_at}
                userName={act.user?.name}
              />
            )) : <InlineEmptyState icon={MessageSquare} message="No activity in this period" />}
          </div>

          {(activities.prev_page_url || activities.next_page_url) && (
            <div className="flex items-center justify-between px-4 py-2.5 border-t border-slate-100/80">
              <button
                disabled={!activities.prev_page_url}
                onClick={() => router.visit(activities.prev_page_url, { preserveState: true, preserveScroll: true })}
                className="flex items-center gap-1 text-[12px] font-medium text-slate-500 hover:text-slate-800 disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <ChevronLeft size={14} /> Prev
              </button>
              <span className="text-[11px] text-slate-400">Page {activities.current_page} of {activities.last_page}</span>
              <button
                disabled={!activities.next_page_url}
                onClick={() => router.visit(activities.next_page_url, { preserveState: true, preserveScroll: true })}
                className="flex items-center gap-1 text-[12px] font-medium text-slate-500 hover:text-slate-800 disabled:opacity-30 disabled:cursor-not-allowed"
              >
                Next <ChevronRight size={14} />
              </button>
            </div>
          )}
        </GlassCard>
      </div>
    </AppLayout>
  )
}
