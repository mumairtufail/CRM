import { Link } from '@inertiajs/react'
import { MessageSquare } from 'lucide-react'
import { ACTIVITY_ICONS, ACTIVITY_COLORS } from '@/lib/chartPalette'

// Activity-feed row shared by the Dashboard (owner + agent views) and Reports
// activity feed. `userName` is Reports-only ("by {user.name}").
export default function ActivityFeedItem({ id, type, leadId, leadName, description, createdAt, userName }) {
  const Icon = ACTIVITY_ICONS[type] || MessageSquare
  const colorCls = ACTIVITY_COLORS[type] || ACTIVITY_COLORS.note

  return (
    <div className="flex gap-2.5">
      <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${colorCls}`}>
        <Icon size={11} />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          {leadId && (
            <Link href={`/leads/${leadId}`} className="text-[11px] font-semibold text-brand-600 hover:underline truncate leading-none">
              {leadName}
            </Link>
          )}
          {userName && <span className="text-[10.5px] text-slate-400">by {userName}</span>}
        </div>
        <p className="text-[11px] text-slate-500 leading-snug truncate mt-0.5">{description}</p>
        <p className="text-[10px] text-slate-300 mt-0.5">{createdAt}</p>
      </div>
    </div>
  )
}
