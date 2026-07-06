import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/Components/ui/select'
import { cn } from '@/lib/utils'

// Single source of date-range presets — shared by Dashboard and Reports so
// both pages offer identical range filtering and stay visually in sync.
export const RANGE_PRESETS = [
  { value: 'today',      label: 'Today' },
  { value: '7d',         label: 'Last 7 days' },
  { value: '30d',        label: 'Last 30 days' },
  { value: '90d',        label: 'Last 90 days' },
  { value: 'this_month', label: 'This month' },
  { value: 'last_month', label: 'Last month' },
  { value: 'custom',     label: 'Custom range' },
]

export default function RangeSelect({ value, onChange, variant = 'light', className = '' }) {
  const dark = variant === 'dark'
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger
        className={cn(
          'h-8 text-[12.5px] w-[145px] shrink-0',
          dark && 'bg-white/10 border-white/15 text-white [&>span]:text-white [&_svg]:opacity-70 [&_svg]:text-white',
          className,
        )}
      >
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {RANGE_PRESETS.map(p => <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>)}
      </SelectContent>
    </Select>
  )
}

export function CustomRangeInputs({ from, to, onFrom, onTo, dark = false }) {
  const cls = cn(
    'h-8 rounded-lg border px-2 text-[12px] w-full sm:w-auto',
    dark ? 'bg-white/10 border-white/15 text-white [color-scheme:dark]' : 'border-slate-200 text-slate-600',
  )
  return (
    <div className="grid grid-cols-2 gap-1.5 w-full sm:flex sm:items-center sm:w-auto">
      <input type="date" defaultValue={from} onChange={e => onFrom(e.target.value)} className={cls} />
      <input type="date" defaultValue={to} onChange={e => onTo(e.target.value)} className={cls} />
    </div>
  )
}
