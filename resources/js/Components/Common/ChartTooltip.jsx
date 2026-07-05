const tooltipBox = {
  background: 'rgb(var(--brand-ink))',
  border: '1px solid rgba(255,255,255,0.1)',
}

export function AreaTooltip({ active, payload, label, unit = 'leads' }) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-xl px-3 py-2 shadow-xl" style={tooltipBox}>
      <p className="text-[10px] text-white/40 mb-0.5">{label}</p>
      <p className="text-[13px] font-bold text-white">{payload[0].value} {unit}</p>
    </div>
  )
}

export function BarTooltip({ active, payload, unit = 'leads' }) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-xl px-3 py-2 shadow-xl" style={tooltipBox}>
      <p className="text-[11px] font-bold text-white capitalize">{payload[0].payload.name}</p>
      <p className="text-[11px] text-white/60">{payload[0].value} {unit}</p>
    </div>
  )
}
