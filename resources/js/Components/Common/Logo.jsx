import { cn } from '@/lib/utils'

/**
 * The brand mark — a connected-nodes graph on a violet→indigo gradient tile.
 * Matches /public/favicon.svg so the favicon and in-app logo stay identical.
 */
export function LogoMark({ size = 32, className = '', radius = 8 }) {
  // Unique gradient id per render so multiple marks on a page don't clash.
  const gid = `crmGrad-${size}-${radius}`
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
          <stop stopColor="#7C3AED" />
          <stop offset="1" stopColor="#4F46E5" />
        </linearGradient>
      </defs>
      <rect width="32" height="32" rx={radius} fill={`url(#${gid})`} />
      <g stroke="#ffffff" strokeWidth="1.6" strokeLinecap="round" opacity="0.9">
        <line x1="16" y1="11.5" x2="10" y2="20.5" />
        <line x1="16" y1="11.5" x2="22" y2="20.5" />
        <line x1="10" y1="20.5" x2="22" y2="20.5" />
      </g>
      <g fill="#ffffff">
        <circle cx="16" cy="11.5" r="3" />
        <circle cx="10" cy="20.5" r="2.6" />
        <circle cx="22" cy="20.5" r="2.6" />
      </g>
    </svg>
  )
}

/**
 * Full logo: mark + optional wordmark.
 */
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
