import { Link } from '@inertiajs/react'
import { Users, PhoneCall, Mail, Clock, CheckCircle2 } from 'lucide-react'
import { motion } from 'framer-motion'

const glass = {
  background: 'rgba(255,255,255,0.88)',
  backdropFilter: 'blur(12px)',
  border: '1px solid rgba(255,255,255,0.95)',
  boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 4px 24px rgba(0,0,0,0.04)',
}

const CARDS = [
  { key: 'leads_assigned',  title: 'Leads Assigned',  icon: Users,       color: 'blue',   href: '/leads' },
  { key: 'leads_contacted', title: 'Leads Contacted',  icon: CheckCircle2, color: 'green',  href: '/leads?contacted=yes' },
  { key: 'emails_sent',     title: 'Emails Sent',      icon: Mail,        color: 'purple' },
  { key: 'calls_made',      title: 'Calls Made',       icon: PhoneCall,   color: 'teal' },
  { key: 'follow_ups_due',  title: 'Follow-ups Due',   icon: Clock,       color: 'amber' },
]

const PALETTE = {
  blue:   { bar: '#3B82F6', icon: 'bg-blue-50 text-blue-600' },
  green:  { bar: '#10B981', icon: 'bg-emerald-50 text-emerald-600' },
  amber:  { bar: '#F59E0B', icon: 'bg-amber-50 text-amber-600' },
  purple: { bar: 'rgb(var(--brand-600))', icon: 'bg-brand-50 text-brand-600' },
  teal:   { bar: '#14B8A6', icon: 'bg-teal-50 text-teal-600' },
}

/**
 * Own-performance KPI cards for a team member (agent) who lacks
 * dashboard.view_all — scoped entirely to leads assigned to them.
 */
export default function AgentStatsCards({ agentStats }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-4">
      {CARDS.map(({ key, title, icon: Icon, color, href }, index) => {
        const c = PALETTE[color]
        const value = agentStats?.[key] ?? 0
        const inner = (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.06, duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
            className="relative overflow-hidden rounded-2xl p-4 group hover:-translate-y-0.5 transition-transform"
            style={glass}
          >
            <div className="absolute top-0 left-4 h-[2.5px] w-8 rounded-b-full" style={{ background: c.bar }} />
            <div className="relative flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-slate-400">{title}</p>
                <p className="text-[24px] font-bold text-slate-800 mt-1 leading-none">{value}</p>
              </div>
              <div className={`p-2.5 rounded-xl shrink-0 group-hover:scale-110 transition-transform ${c.icon}`}>
                <Icon size={17} strokeWidth={1.75} />
              </div>
            </div>
          </motion.div>
        )
        return href ? <Link key={key} href={href}>{inner}</Link> : <div key={key}>{inner}</div>
      })}
    </div>
  )
}
