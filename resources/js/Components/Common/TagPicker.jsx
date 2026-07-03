import { Label } from '@/Components/ui/label'
import { cn } from '@/lib/utils'

// Toggleable tag chips — same visual pattern as the "Filter by Tag" picker
// used on the campaign recipient selector.
export default function TagPicker({ tags = [], selectedIds = [], onChange, label = 'Tags' }) {
  const toggle = (id) => {
    onChange(selectedIds.includes(id)
      ? selectedIds.filter(i => i !== id)
      : [...selectedIds, id])
  }

  if (!tags.length) {
    return (
      <p className="text-[11.5px] text-slate-400 italic">
        No tags yet — create some from Settings → Tags.
      </p>
    )
  }

  return (
    <div className="space-y-2">
      {label && <Label className="text-[12.5px] font-medium text-slate-700">{label}</Label>}
      <div className="flex flex-wrap gap-1.5">
        {tags.map(t => {
          const active = selectedIds.includes(t.id)
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => toggle(t.id)}
              className={cn(
                'text-[12px] px-3 py-1 rounded-full border font-medium transition-all',
                active
                  ? 'text-white border-transparent'
                  : 'border-slate-200 text-slate-500 hover:text-slate-700'
              )}
              style={active ? { background: t.color, borderColor: t.color } : {}}
            >
              {active && <span className="mr-1">✓</span>}
              {t.name}
            </button>
          )
        })}
      </div>
    </div>
  )
}
