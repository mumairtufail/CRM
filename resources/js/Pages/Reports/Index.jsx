import { Head, Link, router } from '@inertiajs/react'
import AppLayout from '@/Components/Layout/AppLayout'
import {
  BarChart, Bar, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from 'recharts'
import {
  Select, SelectTrigger, SelectValue, SelectContent, SelectItem,
} from '@/Components/ui/select'
import {
  BarChart3, Users, Mail, MessageSquare, ChevronLeft, ChevronRight, TrendingUp, Target, Globe, MapPin,
} from 'lucide-react'
import { CONTACT_CHANNELS } from '@/Components/Common/OutreachChannels'
import GlassCard from '@/Components/Common/GlassCard'
import SectionHeader from '@/Components/Common/SectionHeader'
import InlineEmptyState from '@/Components/Common/InlineEmptyState'
import ActivityFeedItem from '@/Components/Common/ActivityFeedItem'
import { AreaTooltip, BarTooltip } from '@/Components/Common/ChartTooltip'
import { CHART_COLORS } from '@/lib/chartPalette'

const RANGE_PRESETS = [
  { value: 'today',      label: 'Today' },
  { value: '7d',         label: 'Last 7 days' },
  { value: '30d',        label: 'Last 30 days' },
  { value: '90d',        label: 'Last 90 days' },
  { value: 'this_month', label: 'This month' },
  { value: 'last_month', label: 'Last month' },
  { value: 'custom',     label: 'Custom range' },
]

const CHANNEL_META = Object.fromEntries(CONTACT_CHANNELS.map(c => [c.key, c]))

function ChipMini({ channel }) {
  const meta = CHANNEL_META[channel]
  if (!meta) return null
  return (
    <span
      title={meta.label}
      className="inline-flex items-center justify-center rounded font-bold w-4 h-4 text-[7px] text-white shrink-0"
      style={{ background: meta.bg }}
    >
      {meta.letter.toUpperCase()}
    </span>
  )
}

export default function ReportsIndex({
  range, agentRows, channelBreakdown, funnel, geo, engagement, leadsTrend,
  activities, filters, filterOptions,
}) {
  const updateQuery = (params) => {
    router.get('/reports', { ...filters, ...params }, { preserveState: true, preserveScroll: true })
  }

  const chipChannels = channelBreakdown.filter(c => c.name !== 'email_sends' && c.name !== 'whatsapp_sends')
  const topCountriesByAgent = geo?.top_countries_by_agent ?? {}

  return (
    <AppLayout title="Reports">
      <Head title="Reports" />

      <div className="space-y-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-[18px] font-bold text-slate-800 tracking-tight leading-none">Reports & Analytics</h2>
            <p className="text-slate-500 mt-1.5 text-[13px]">
              {range.from} to {range.to}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Select
              value={range.key}
              onValueChange={v => {
                if (v === 'custom') {
                  updateQuery({ range: v, from: range.from, to: range.to })
                } else {
                  updateQuery({ range: v, from: undefined, to: undefined })
                }
              }}
            >
              <SelectTrigger className="h-8 text-[13px] w-36"><SelectValue /></SelectTrigger>
              <SelectContent>
                {RANGE_PRESETS.map(p => <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>)}
              </SelectContent>
            </Select>

            {range.key === 'custom' && (
              <div className="grid grid-cols-2 gap-1.5 w-full sm:flex sm:items-center sm:w-auto">
                <input
                  type="date"
                  defaultValue={range.from}
                  onChange={e => updateQuery({ range: 'custom', from: e.target.value, to: filters.to ?? range.to })}
                  className="h-8 rounded-lg border border-slate-200 px-2 text-[12.5px] text-slate-600 w-full sm:w-auto"
                />
                <input
                  type="date"
                  defaultValue={range.to}
                  onChange={e => updateQuery({ range: 'custom', to: e.target.value, from: filters.from ?? range.from })}
                  className="h-8 rounded-lg border border-slate-200 px-2 text-[12.5px] text-slate-600 w-full sm:w-auto"
                />
              </div>
            )}
          </div>
        </div>

        <GlassCard>
          <SectionHeader title="Leads Over Time" icon={TrendingUp} />
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 px-5 pt-4">
            {[
              { label: 'Leads created', value: funnel.total },
              { label: 'Contacted', value: funnel.contacted, sub: `${funnel.contact_rate}% of created` },
              { label: 'Won', value: funnel.won, sub: `${funnel.win_rate_of_closed}% of closed` },
              { label: 'Lost', value: funnel.lost },
            ].map(item => (
              <div key={item.label}>
                <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-slate-400">{item.label}</p>
                <p className="text-[20px] font-bold text-slate-800 leading-none mt-1.5">{item.value}</p>
                {item.sub && <p className="text-[11px] text-slate-400 mt-1">{item.sub}</p>}
              </div>
            ))}
          </div>
          <div className="px-4 py-4" style={{ height: 200 }}>
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <GlassCard className="lg:col-span-2">
            <SectionHeader title="Channel Breakdown" icon={BarChart3} />
            <div className="px-4 py-3" style={{ height: 260 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chipChannels} layout="vertical" margin={{ left: 10, right: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                  <XAxis type="number" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                  <YAxis type="category" dataKey="name" width={80} tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} />
                  <Tooltip content={<BarTooltip />} cursor={{ fill: 'rgb(var(--brand-600) / 0.04)' }} />
                  <Bar dataKey="value" radius={[0, 6, 6, 0]} barSize={14}>
                    {chipChannels.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </GlassCard>

          <div className="flex flex-col gap-4">
            <GlassCard>
              <div className="px-5 py-4 flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600 shrink-0"><Mail size={17} /></div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-slate-400">Emails sent</p>
                  <p className="text-[22px] font-bold text-slate-800 leading-none mt-1">{engagement.email.sent}</p>
                  <p className="text-[10.5px] text-slate-400 mt-1">{engagement.email.open_rate}% opened &middot; {engagement.email.click_rate}% clicked</p>
                </div>
              </div>
            </GlassCard>
            <GlassCard>
              <div className="px-5 py-4 flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600 shrink-0"><MessageSquare size={17} /></div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-slate-400">WhatsApp sent</p>
                  <p className="text-[22px] font-bold text-slate-800 leading-none mt-1">{engagement.whatsapp.sent}</p>
                  <p className="text-[10.5px] text-slate-400 mt-1">{engagement.whatsapp.delivery_rate}% delivered &middot; {engagement.whatsapp.read_rate}% read</p>
                </div>
              </div>
            </GlassCard>
          </div>
        </div>

        <GlassCard>
          <SectionHeader title="Agent Performance" icon={Users} />
          <div className="overflow-x-auto">
            <table className="w-full text-[12.5px] min-w-[720px]">
              <thead>
                <tr className="text-left text-[10.5px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100">
                  <th className="px-5 py-2.5 sticky left-0 bg-white/90 backdrop-blur-sm">Agent</th>
                  <th className="px-3 py-2.5 text-right">Created</th>
                  <th className="px-3 py-2.5 text-right">Assigned</th>
                  <th className="px-3 py-2.5 text-right">Contacted</th>
                  <th className="px-3 py-2.5 text-right">Won</th>
                  <th className="px-3 py-2.5 text-right">Conv. %</th>
                  <th className="px-3 py-2.5 text-right">Emails</th>
                  <th className="px-3 py-2.5 text-right">WhatsApp</th>
                  <th className="px-3 py-2.5 text-right">Avg. Hrs to Contact</th>
                  <th className="px-3 py-2.5">Channels</th>
                </tr>
              </thead>
              <tbody>
                {agentRows.map(row => {
                  const topCountries = topCountriesByAgent[row.id]?.map(c => c.country).join(', ')
                  return (
                    <tr key={row.id} className="border-b border-slate-50 hover:bg-slate-50/60 group">
                      <td className="px-5 py-2.5 font-semibold sticky left-0 bg-white/90 backdrop-blur-sm group-hover:bg-slate-50/90">
                        <Link
                          href={`/leads?assigned_to=${row.id}`}
                          title={topCountries ? `Top territories: ${topCountries}` : undefined}
                          className="text-brand-600 hover:underline"
                        >
                          {row.name}
                        </Link>
                      </td>
                      <td className="px-3 py-2.5 text-slate-600 text-right">{row.leads_created}</td>
                      <td className="px-3 py-2.5 text-slate-600 text-right">{row.leads_assigned}</td>
                      <td className="px-3 py-2.5 text-slate-600 text-right">{row.leads_contacted}</td>
                      <td className="px-3 py-2.5 text-slate-600 text-right">{row.won_count}</td>
                      <td className="px-3 py-2.5 text-slate-600 text-right">{row.conversion_rate}%</td>
                      <td className="px-3 py-2.5 text-slate-600 text-right">{row.emails_sent}</td>
                      <td className="px-3 py-2.5 text-slate-600 text-right">{row.whatsapp_sent}</td>
                      <td className="px-3 py-2.5 text-slate-600 text-right">
                        {row.avg_hours_to_contact != null ? `${row.avg_hours_to_contact}h` : '—'}
                        {row.contact_sample_size > 0 && <span className="text-slate-300 text-[10px] ml-1">(n={row.contact_sample_size})</span>}
                      </td>
                      <td className="px-3 py-2.5">
                        <div className="flex items-center gap-1">
                          {Object.keys(row.channel_counts ?? {}).map(ch => <ChipMini key={ch} channel={ch} />)}
                        </div>
                      </td>
                    </tr>
                  )
                })}
                {agentRows.length === 0 && (
                  <tr><td colSpan={10} className="text-center py-8 text-slate-400">No active agents</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </GlassCard>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <GlassCard>
            <SectionHeader title="Top Countries" icon={Globe} />
            <div className="px-4 py-3" style={{ height: 220 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={geo.by_country} layout="vertical" margin={{ left: 10, right: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                  <XAxis type="number" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} allowDecimals={false} />
                  <YAxis type="category" dataKey="name" width={80} tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} />
                  <Tooltip cursor={{ fill: 'rgb(var(--brand-600) / 0.04)' }} />
                  <Bar dataKey="value" radius={[0, 6, 6, 0]} barSize={12} fill="rgb(var(--brand-600))" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </GlassCard>

          <GlassCard>
            <SectionHeader title="Top Cities" icon={MapPin} />
            <div className="px-5 py-3 space-y-2 max-h-[220px] overflow-y-auto">
              {geo.by_city.length ? geo.by_city.map(c => (
                <div key={c.name} className="flex items-center justify-between text-[12.5px]">
                  <span className="text-slate-600">{c.name}</span>
                  <span className="font-semibold text-slate-800">{c.value}</span>
                </div>
              )) : <p className="text-[12px] text-slate-400 py-4 text-center">No city data in this period</p>}
            </div>
          </GlassCard>
        </div>

        <GlassCard>
          <SectionHeader title="Activity Feed" icon={MessageSquare} />
          <div className="flex flex-wrap items-center gap-2 px-5 pt-3">
            <Select value={filters.user_id ? String(filters.user_id) : 'all'} onValueChange={v => updateQuery({ user_id: v === 'all' ? undefined : v })}>
              <SelectTrigger className="h-7 text-[12px] w-40"><SelectValue placeholder="All agents" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All agents</SelectItem>
                {filterOptions.users.map(u => <SelectItem key={u.id} value={String(u.id)}>{u.name}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={filters.type ?? 'all'} onValueChange={v => updateQuery({ type: v === 'all' ? undefined : v })}>
              <SelectTrigger className="h-7 text-[12px] w-40"><SelectValue placeholder="All types" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All types</SelectItem>
                {filterOptions.types.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <div className="px-4 py-3 space-y-3">
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
            <div className="flex items-center justify-between px-5 py-3 border-t border-slate-100/80">
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
