import { cn } from '@/lib/utils'
import { usePage } from '@inertiajs/react'

/**
 * Inline SVG mark — identical to favicon.svg so it's always crisp at any size.
 * Using inline SVG avoids flickers and keeps the gradient self-contained.
 */
export function LogoMark({ size = 32, className = '' }) {
  const { props } = usePage()
  const customLogoUrl = props.custom_logo_url

  if (customLogoUrl) {
    return (
      <img
        src={customLogoUrl}
        width={size}
        height={size}
        className={cn('shrink-0 object-contain rounded-md', className)}
        alt="Logo"
        style={{ width: size, height: size }}
      />
    )
  }

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn('shrink-0', className)}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="lf-mark-bg" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
          <stop stopColor="rgb(var(--brand-600))" />
          <stop offset="1" stopColor="rgb(var(--brand2-600))" />
        </linearGradient>
        <linearGradient id="lf-mark-shine" x1="0" y1="0" x2="0" y2="20" gradientUnits="userSpaceOnUse">
          <stop stopColor="#ffffff" stopOpacity="0.10" />
          <stop offset="1" stopColor="#ffffff" stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* Background pill */}
      <rect width="40" height="40" rx="11" fill="url(#lf-mark-bg)" />

      {/* Inner top-shine for depth */}
      <rect width="40" height="20" rx="11" fill="url(#lf-mark-shine)" />

      {/* Bloom mark — two soft overlapping circles, evoking "Lumenia" (light) and
          two things meeting in one place. Abstract on purpose: reads clean at 16px. */}
      <circle cx="15.5" cy="16" r="9" fill="white" opacity="0.95" />
      <circle cx="25" cy="25" r="7.5" fill="white" opacity="0.5" />
    </svg>
  )
}

/**
 * Full logo: mark + wordmark.
 *
 * Props:
 *   size        — icon size in px (default 32)
 *   showText    — whether to render the wordmark (default true)
 *   text        — wordmark text (default 'Lumenia CRM')
 *   className   — container classes
 *   textClassName — text classes
 *   textColor   — tailwind text color class; defaults to slate-900 for light bg
 */
export default function Logo({
  size = 32,
  showText = true,
  text = 'Lumenia CRM',
  className = '',
  textClassName = '',
  textColor = 'text-slate-900',
}) {
  return (
    <div className={cn('flex items-center gap-2.5', className)}>
      <LogoMark size={size} />
      {showText && (
        <span
          className={cn(
            'font-extrabold tracking-tight leading-none select-none',
            textColor,
            textClassName,
          )}
          style={{ fontSize: Math.round(size * 0.52) }}
        >
          {text}
        </span>
      )}
    </div>
  )
}
