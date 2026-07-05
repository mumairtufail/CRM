export const glass = {
  background: 'rgba(255,255,255,0.88)',
  backdropFilter: 'blur(12px)',
  border: '1px solid rgba(255,255,255,0.95)',
  boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 4px 24px rgba(0,0,0,0.04)',
}

export default function GlassCard({ children, className = '', style = {}, onClick }) {
  return (
    <div
      className={`rounded-2xl overflow-hidden transition-shadow ${onClick ? 'cursor-pointer hover:shadow-[0_1px_3px_rgba(0,0,0,0.04),0_8px_28px_rgb(var(--brand-600)/0.10)] hover:border-brand-200/60' : ''} ${className}`}
      style={{ ...glass, ...style }}
      onClick={onClick}
    >
      {children}
    </div>
  )
}
