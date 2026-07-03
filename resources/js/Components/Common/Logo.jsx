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
          <stop stopColor="#8B5CF6" />
          <stop offset="1" stopColor="#4338CA" />
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

      {/* L-Flow mark — vertical bar, rounded corner, horizontal run, curve up */}
      <path
        d="M 13 8.5 L 13 26.5 Q 13 30 16.5 30 L 25.5 30 Q 31 30 31 24.5 L 31 19.5"
        stroke="white"
        strokeWidth="4.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
        opacity="0.93"
      />

      {/* Arrowhead at the top of the path — indicates upward flow/growth */}
      <path
        d="M 28 22.5 L 31 18 L 34 22.5"
        stroke="white"
        strokeWidth="3.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
        opacity="0.92"
      />
    </svg>
  )
}

/**
 * Full logo: mark + wordmark.
 *
 * Props:
 *   size        — icon size in px (default 32)
 *   showText    — whether to render the wordmark (default true)
 *   text        — wordmark text (default 'LeadFlow')
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
