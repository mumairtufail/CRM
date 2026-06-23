import { cn } from '@/lib/utils'

export function LogoMark({ size = 32, className = '' }) {
  return (
    <img
      src="/favicon.svg"
      width={size}
      height={size}
      alt="CRM logo"
      className={className}
      aria-hidden="true"
    />
  )
}

export default function Logo({
  size = 32,
  showText = true,
  text = 'CRM',
  className = '',
  textClassName = '',
}) {
  return (
    <div className={cn('flex items-center gap-2.5', className)}>
      <LogoMark size={size} />
      {showText && (
        <span className={cn('font-bold tracking-tight', textClassName)}>{text}</span>
      )}
    </div>
  )
}
