import { MessageSquare, PhoneCall, Star, Tag, ArrowRightLeft, Trash2, Mail } from 'lucide-react'

// Single source of chart colors — keeps Dashboard, Reports and any future
// analytics views visually in sync and theme-reactive via --brand-* vars.
export const CHART_COLORS = [
  'rgb(var(--brand-600))', '#3B82F6', '#10B981', '#F59E0B',
  '#EF4444', '#EC4899', '#14B8A6', '#F97316',
]

export const SOURCE_COLORS = {
  manual: 'rgb(var(--brand-600))',
  csv: '#3B82F6',
  google_sheet: '#10B981',
  claude_ai: '#F59E0B',
  apollo: '#EF4444',
  facebook: '#1877F2',
  instagram: '#E1306C',
}

export const FUNNEL_ORDER = ['new', 'contacted', 'qualified', 'proposal', 'negotiation', 'won', 'lost']
export const FUNNEL_COLORS = [
  'rgb(var(--brand-600))', 'rgb(var(--brand2-500))', '#3B82F6',
  '#0EA5E9', '#10B981', '#22C55E', '#EF4444',
]

export const ACTIVITY_ICONS = {
  note: MessageSquare,
  email_sent: Mail,
  call: PhoneCall,
  status_change: Star,
  import: Tag,
  reassignment: ArrowRightLeft,
  deletion: Trash2,
  whatsapp: MessageSquare,
}

export const ACTIVITY_COLORS = {
  note: 'text-slate-500 bg-slate-100',
  email_sent: 'text-blue-500 bg-blue-50',
  call: 'text-green-500 bg-green-50',
  status_change: 'text-amber-500 bg-amber-50',
  import: 'text-purple-500 bg-purple-50',
  reassignment: 'text-blue-500 bg-blue-50',
  deletion: 'text-red-500 bg-red-50',
  whatsapp: 'text-emerald-500 bg-emerald-50',
}

// Re-exported so pages don't need a second import for the Mail icon used
// by the Reports engagement cards' default activity fallback.
export const DEFAULT_ACTIVITY_ICON = MessageSquare
export { Mail }
