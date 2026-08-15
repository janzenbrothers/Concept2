/** Line icons for the nav rail and the live screen, drawn on a 24-unit grid so
 *  they share a weight with the rest of the interface. A rail is scanned in
 *  peripheral vision while you row, so shape carries the meaning and the label
 *  underneath confirms it. */

type IconProps = { className?: string }

const base = {
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.8,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  'aria-hidden': true,
}

/** A roof over still water. */
export function HomeIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <path d="M3.5 10.5 12 4l8.5 6.5" />
      <path d="M5.5 12v7.5h13V12" />
      <path d="M9 19.5v-4.2h6v4.2" />
    </svg>
  )
}

/** An oar crossing the handle. */
export function RowIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <path d="M4 20 15.5 8.5" />
      <path d="M16.2 3.6a4.6 4.6 0 0 1 4.2 4.2l-3 3-4.2-4.2Z" />
      <path d="M4.2 15.6 8.4 19.8" />
    </svg>
  )
}

/** A split falling across the weeks. */
export function TrendIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <path d="M4 4v16h16" />
      <path d="M7.5 14.5 11 10.5l3 2.5 5.2-6" />
      <path d="M15.6 6.6h3.6v3.6" />
    </svg>
  )
}

/** A week, with today marked. */
export function PlanIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <rect x="3.5" y="5" width="17" height="15" rx="2.4" />
      <path d="M3.5 9.6h17M8.2 3.4v3.4M15.8 3.4v3.4" />
      <path d="M11 13.4h2.2v2.4H11z" fill="currentColor" stroke="none" />
    </svg>
  )
}

/** The rower. */
export function YouIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <circle cx="12" cy="8.2" r="3.6" />
      <path d="M4.8 20a7.4 7.4 0 0 1 14.4 0" />
    </svg>
  )
}

/** Bluetooth, for the erg-status button. */
export function LinkIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <path d="M7.5 8 16 16l-4 4V4l4 4-8.5 8" />
    </svg>
  )
}

export function HeartIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <path d="M12 20s-7-4.4-7-9.2A3.9 3.9 0 0 1 12 8a3.9 3.9 0 0 1 7 2.8C19 15.6 12 20 12 20Z" />
    </svg>
  )
}
