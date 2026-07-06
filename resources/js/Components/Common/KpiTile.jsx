import { Link } from '@inertiajs/react'
import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'
import { TrendingUp, TrendingDown } from 'lucide-react'

// Same accent palette as StatCard.jsx, kept in sync so Dashboard/Reports read
// as one system even though this tile is a denser, multi-per-row alternative.
const palette = {
  blue:   { icon: 'bg-blue-50 text-blue-600',       accent: '#3B82F6' },
  green:  { icon: 'bg-emerald-50 text-emerald-600', accent: '#10B981' },
  amber:  { icon: 'bg-amber-50 text-amber-600',     accent: '#F59E0B' },
  purple: { icon: 'bg-brand-50 text-brand-600',     accent: 'rgb(var(--brand-600))' },
  red:    { icon: 'bg-red-50 text-red-600',         accent: '#EF4444' },
  teal:   { icon: 'bg-teal-50 text-teal-600',       accent: '#14B8A6' },
}

// Minimal hand-rolled sparkline — no Recharts mount here since a KPI strip
// renders several of these side by side and each ResponsiveContainer/
// ResizeObserver instance would be pure overhead for a ~50x20px trend line.
function Sparkline({ data, color }) {
  if (!data?.length || data.length < 2) return null
  const w = 52, h = 20
  const max = Math.max(...data)
  const min = Math.min(...data)
  const range = max - min || 1
  const step = w / (data.length - 1)
  const points = data.map((v, i) => [i * step, h - ((v - min) / range) * h])
  const line = points.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(' ')
  const area = `0,${h} ${line} ${w},${h}`

  return (
    <svg width={w} height={h} className="shrink-0" aria-hidden="true">
      <polygon points={area} fill={color} opacity={0.1} />
      <polyline points={line} fill="none" stroke={color} strokeWidth={2}
        strokeLinejoin="round" strokeLinecap="round" opacity={0.85} />
    </svg>
  )
}

export default function KpiTile({ title, value, change, icon: Icon, color = 'blue', index = 0, href, sparkline }) {
  const c = palette[color] ?? palette.blue

  const tile = (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
      className={cn(
        'relative flex items-center gap-2.5 rounded-xl px-3 py-2.5 group hover-lift',
        href ? 'cursor-pointer' : 'cursor-default'
      )}
      style={{
        background: 'rgba(255,255,255,0.85)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255,255,255,0.95)',
        boxShadow: '0 1px 2px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.04)',
      }}
    >
      <div className={cn('p-1.5 rounded-lg shrink-0 transition-transform group-hover:scale-110', c.icon)}>
        <Icon size={14} strokeWidth={1.9} />
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-[9.5px] font-semibold uppercase tracking-[0.08em] text-slate-400 truncate leading-none">
          {title}
        </p>
        <div className="flex items-baseline gap-1.5 mt-1">
          <p className="text-[16px] font-bold text-slate-800 leading-none tracking-tight">
            {value ?? '—'}
          </p>
          {change != null && (
            <span className={cn(
              'flex items-center gap-0.5 text-[10px] font-semibold',
              change >= 0 ? 'text-emerald-600' : 'text-red-500'
            )}>
              {change >= 0 ? <TrendingUp size={9} /> : <TrendingDown size={9} />}
              {Math.abs(change)}%
            </span>
          )}
        </div>
      </div>

      {sparkline?.length > 1 && <Sparkline data={sparkline} color={c.accent} />}
    </motion.div>
  )

  return href ? <Link href={href}>{tile}</Link> : tile
}
