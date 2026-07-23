import { Head, Link } from '@inertiajs/react'
import AppLayout from '@/Components/Layout/AppLayout'
import { cn } from '@/lib/utils'
import { ChevronLeft, Mail, ShieldCheck, Calendar, Phone, PhoneCall, PhoneMissed, Clock } from 'lucide-react'

function avatarLetter(name) { return (name ?? '?').trim()[0]?.toUpperCase() ?? '?' }

const GRADIENTS = [
  'from-brand-500 to-brand2-500', 'from-emerald-500 to-teal-500',
  'from-blue-500 to-cyan-500', 'from-rose-500 to-pink-500', 'from-amber-500 to-orange-500',
]
function avatarGradient(str) {
  let h = 0
  for (const c of (str ?? '')) h = (h * 31 + c.charCodeAt(0)) & 0xffffffff
  return GRADIENTS[Math.abs(h) % GRADIENTS.length]
}

function formatDuration(secs) {
  const s = Number(secs) || 0
  const mins = Math.floor(s / 60)
  const remaining = Math.floor(s % 60)
  return `${mins}m ${remaining.toString().padStart(2, '0')}s`
}

function StatCard({ label, value, icon: Icon }) {
  return (
    <div className="rounded-2xl bg-white border border-slate-100 p-4" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
      <div className="flex items-center gap-2 text-slate-400">
        <Icon size={13} />
        <p className="text-[10.5px] font-bold uppercase tracking-[0.1em]">{label}</p>
      </div>
      <p className="text-[22px] font-bold text-slate-800 mt-1.5">{value}</p>
    </div>
  )
}

export default function TeamShow({ member, stats, recentCalls }) {
  return (
    <>
      <Head title={member.name} />
      <AppLayout title={member.name}>

        {/* ── Hero ─────────────────────────────────────────── */}
        <div className="relative overflow-hidden rounded-2xl px-6 py-5 mb-5"
          style={{ background: 'linear-gradient(135deg,#0f172a 0%,#1e293b 60%,#0f172a 100%)', boxShadow: '0 4px 30px rgba(0,0,0,0.15)' }}>
          <div className="absolute top-0 right-0 w-56 h-56 rounded-full pointer-events-none opacity-[0.08]"
            style={{ background: 'radial-gradient(circle,#10b981 0%,transparent 70%)', transform: 'translate(30%,-50%)' }} />

          <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className={cn(
                'w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 text-[20px] font-bold text-white bg-gradient-to-br shadow-lg',
                avatarGradient(member.name)
              )}>
                {avatarLetter(member.name)}
              </div>
              <div className="min-w-0">
                <h2 className="text-[20px] font-bold text-white leading-tight truncate">{member.name}</h2>
                <p className="text-white/40 text-[13px] mt-0.5 flex items-center gap-1.5">
                  <Mail size={12} /> {member.email}
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <span className={cn(
                    'inline-flex items-center gap-1.5 text-[11.5px] font-semibold px-2.5 py-1 rounded-full border',
                    member.is_active ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20' : 'bg-slate-500/10 text-slate-300 border-slate-500/20'
                  )}>
                    <span className={cn('w-1.5 h-1.5 rounded-full', member.is_active ? 'bg-emerald-400' : 'bg-slate-400')} />
                    {member.is_active ? 'Active' : 'Deactivated'}
                  </span>
                  {member.role && (
                    <span className="inline-flex items-center gap-1.5 text-[11.5px] font-semibold px-2.5 py-1 rounded-full border bg-white/10 text-white/70 border-white/10">
                      <ShieldCheck size={11} /> {member.role.name}
                    </span>
                  )}
                  {member.is_owner && (
                    <span className="inline-flex items-center text-[11.5px] font-semibold px-2.5 py-1 rounded-full border bg-amber-500/10 text-amber-300 border-amber-500/20">
                      Owner
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0 flex-wrap">
              <Link href={route('settings.team.index')}
                className="flex items-center gap-1.5 h-8 px-3 rounded-xl text-[12px] font-medium text-white/50 hover:text-white hover:bg-white/10 transition-colors">
                <ChevronLeft size={13} /> Back to team
              </Link>
            </div>
          </div>
        </div>

        {/* ── Main grid ─────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

          {/* ── Left col — info ────────────────────────────── */}
          <div className="space-y-4">
            <div className="rounded-2xl bg-white border border-slate-100 overflow-hidden"
              style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
              <div className="px-4 py-3 border-b border-slate-100">
                <p className="text-[10.5px] font-bold uppercase tracking-[0.12em] text-slate-400">Member Info</p>
              </div>
              <div className="px-3 py-1 divide-y divide-slate-50">
                <div className="flex items-start gap-3 py-2.5">
                  <div className="w-7 h-7 rounded-lg bg-slate-50 flex items-center justify-center shrink-0 mt-0.5">
                    <Mail size={13} className="text-slate-400" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Email</p>
                    <p className="text-[13px] text-slate-700 mt-0.5">{member.email}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 py-2.5">
                  <div className="w-7 h-7 rounded-lg bg-slate-50 flex items-center justify-center shrink-0 mt-0.5">
                    <ShieldCheck size={13} className="text-slate-400" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Role</p>
                    <p className="text-[13px] text-slate-700 mt-0.5">{member.role?.name ?? '—'}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 py-2.5">
                  <div className="w-7 h-7 rounded-lg bg-slate-50 flex items-center justify-center shrink-0 mt-0.5">
                    <Calendar size={13} className="text-slate-400" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Joined</p>
                    <p className="text-[13px] text-slate-700 mt-0.5">{member.created_at}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <StatCard label="Assigned Leads" value={stats.assigned_leads} icon={Phone} />
              <StatCard label="Total Calls" value={stats.total_calls} icon={PhoneCall} />
              <StatCard label="Completed" value={stats.completed_calls} icon={PhoneCall} />
              <StatCard label="Talk Time" value={formatDuration(stats.call_duration)} icon={Clock} />
            </div>
          </div>

          {/* ── Right 2/3 — recent calls ───────────────────── */}
          <div className="lg:col-span-2">
            <div className="rounded-2xl bg-white border border-slate-100 overflow-hidden"
              style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
              <div className="px-4 py-3 border-b border-slate-100">
                <p className="text-[10.5px] font-bold uppercase tracking-[0.12em] text-slate-400">Recent Calls</p>
              </div>

              {recentCalls.length === 0 ? (
                <div className="flex flex-col items-center py-10 text-center">
                  <PhoneMissed size={28} className="text-slate-300 mb-2" />
                  <p className="text-[12.5px] text-slate-400">No calls yet</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider">
                        <th className="py-2.5 px-4">Direction</th>
                        <th className="py-2.5 px-3">From</th>
                        <th className="py-2.5 px-3">To</th>
                        <th className="py-2.5 px-3">Status</th>
                        <th className="py-2.5 px-3">Duration</th>
                        <th className="py-2.5 px-4">Date / Time</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {recentCalls.map(call => (
                        <tr key={call.id} className="hover:bg-slate-50/50">
                          <td className="py-3 px-4">
                            <span className={cn(
                              'px-2 py-0.5 rounded-full font-bold uppercase text-[9px] tracking-wider border',
                              call.direction === 'inbound' ? 'bg-blue-50 text-blue-600 border-blue-100' : 'bg-purple-50 text-purple-600 border-purple-100'
                            )}>
                              {call.direction}
                            </span>
                          </td>
                          <td className="py-3 px-3 font-semibold text-slate-700">{call.from_number}</td>
                          <td className="py-3 px-3 font-semibold text-slate-700">{call.to_number}</td>
                          <td className="py-3 px-3">
                            <span className={cn(
                              'px-2 py-0.5 rounded-full text-[10px] font-medium capitalize',
                              call.status === 'completed' && 'bg-emerald-50 text-emerald-700',
                              call.status === 'voicemail' && 'bg-amber-50 text-amber-700',
                              ['failed', 'busy', 'no-answer'].includes(call.status) && 'bg-red-50 text-red-700'
                            )}>
                              {call.status}
                            </span>
                          </td>
                          <td className="py-3 px-3 font-mono text-slate-500">{formatDuration(call.duration)}</td>
                          <td className="py-3 px-4 text-slate-450">{new Date(call.created_at).toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>

      </AppLayout>
    </>
  )
}
