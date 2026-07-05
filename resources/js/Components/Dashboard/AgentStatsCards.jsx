import { Users, PhoneCall, Mail, Clock, CheckCircle2 } from 'lucide-react'
import StatCard from '@/Components/Common/StatCard'

const CARDS = [
  { key: 'leads_assigned',  title: 'Leads Assigned',  icon: Users,        color: 'blue',   href: '/leads' },
  { key: 'leads_contacted', title: 'Leads Contacted',  icon: CheckCircle2, color: 'green',  href: '/leads?contacted=yes' },
  { key: 'emails_sent',     title: 'Emails Sent',      icon: Mail,         color: 'purple' },
  { key: 'calls_made',      title: 'Calls Made',       icon: PhoneCall,    color: 'teal' },
  { key: 'follow_ups_due',  title: 'Follow-ups Due',   icon: Clock,        color: 'amber' },
]

/**
 * Own-performance KPI cards for a team member (agent) who lacks
 * dashboard.view_all — scoped entirely to leads assigned to them.
 */
export default function AgentStatsCards({ agentStats }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-4">
      {CARDS.map(({ key, title, icon, color, href }, index) => (
        <StatCard
          key={key}
          title={title}
          value={agentStats?.[key] ?? 0}
          icon={icon}
          color={color}
          href={href}
          index={index}
        />
      ))}
    </div>
  )
}
