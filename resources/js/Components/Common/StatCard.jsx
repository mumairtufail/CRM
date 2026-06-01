import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'
import { TrendingUp, TrendingDown } from 'lucide-react'

const palette = {
  blue:   { orb: '#3B82F6', icon: 'bg-blue-50 text-blue-600',     bar: '#3B82F6', glow: 'rgba(59,130,246,0.1)' },
  green:  { orb: '#10B981', icon: 'bg-emerald-50 text-emerald-600', bar: '#10B981', glow: 'rgba(16,185,129,0.1)' },
  amber:  { orb: '#F59E0B', icon: 'bg-amber-50 text-amber-600',    bar: '#F59E0B', glow: 'rgba(245,158,11,0.1)' },
  purple: { orb: '#7C3AED', icon: 'bg-violet-50 text-violet-600',  bar: '#7C3AED', glow: 'rgba(124,58,237,0.1)' },
  red:    { orb: '#EF4444', icon: 'bg-red-50 text-red-600',        bar: '#EF4444', glow: 'rgba(239,68,68,0.1)' },
  teal:   { orb: '#14B8A6', icon: 'bg-teal-50 text-teal-600',      bar: '#14B8A6', glow: 'rgba(20,184,166,0.1)' },
}

export default function StatCard({ title, value, change, icon: Icon, color = 'blue', index = 0 }) {
  const c = palette[color] ?? palette.blue

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.07, duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
      className="relative overflow-hidden rounded-2xl p-5 group hover-lift cursor-default"
      style={{
        background: 'rgba(255,255,255,0.85)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255,255,255,0.95)',
        boxShadow: '0 1px 2px rgba(0,0,0,0.04), 0 4px 20px rgba(0,0,0,0.04)',
      }}
    >
      {/* Hover glow */}
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-400 pointer-events-none"
        style={{ background: `radial-gradient(ellipse at 0% 0%, ${c.glow} 0%, transparent 65%)` }}
      />

      {/* Top accent bar */}
      <div
        className="absolute top-0 left-5 h-[2.5px] w-10 rounded-b-full"
        style={{ background: c.bar }}
      />

      <div className="relative flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[10.5px] font-semibold uppercase tracking-[0.1em] text-slate-500">
            {title}
          </p>
          <p className="text-[26px] font-bold text-slate-800 mt-1.5 leading-none tracking-tight">
            {value ?? '—'}
          </p>
          {change != null && (
            <div className={cn(
              'flex items-center gap-1 mt-2 text-[11px] font-semibold',
              change >= 0 ? 'text-emerald-600' : 'text-red-500'
            )}>
              {change >= 0 ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
              <span>{Math.abs(change)}% vs last month</span>
            </div>
          )}
        </div>

        <div className={cn('p-2.5 rounded-xl shrink-0 transition-transform group-hover:scale-110', c.icon)}>
          <Icon size={18} strokeWidth={1.75} />
        </div>
      </div>
    </motion.div>
  )
}
