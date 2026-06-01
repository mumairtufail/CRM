import { cn } from '@/lib/utils'

const priorityConfig = {
  low:    { label: 'Low',    cls: 'bg-gray-100 text-gray-500' },
  medium: { label: 'Medium', cls: 'bg-blue-50 text-blue-600' },
  high:   { label: 'High',   cls: 'bg-red-50 text-red-600' },
}

export default function PriorityBadge({ priority }) {
  const cfg = priorityConfig[priority] ?? priorityConfig.medium
  return (
    <span className={cn('inline-flex items-center text-xs font-medium px-2 py-0.5 rounded-full', cfg.cls)}>
      {cfg.label}
    </span>
  )
}
