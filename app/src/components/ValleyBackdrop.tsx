/** The flat three-tone river valley behind every light screen: layered blue
 *  ridges, a pale river running to the foreground, brown banks framing the
 *  bottom. Held at 50% so it reads as a backdrop wash under the cards. */
export function ValleyBackdrop() {
  return (
    <svg
      className="backdrop"
      viewBox="0 0 1200 800"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
    >
      <rect width="1200" height="800" fill="#f2e7d4" />
      <g opacity="0.5">
        <path
          d="M0 470 L180 300 L320 410 L470 270 L640 425 L790 305 L960 440 L1080 335 L1200 455 L1200 800 L0 800Z"
          fill="var(--color-accent-2-200)"
        />
        <path
          d="M0 585 L160 470 L300 570 L455 455 L620 595 L770 480 L940 590 L1075 495 L1200 600 L1200 800 L0 800Z"
          fill="var(--color-accent-2-300)"
        />
        <path
          d="M520 570 C 528 650 445 706 392 748 C 352 780 330 786 314 800 L646 800 C 622 782 600 756 592 716 C 580 656 600 620 608 570Z"
          fill="var(--color-accent-2-400)"
        />
        <path d="M0 690 L230 622 L420 700 L470 800 L0 800Z" fill="#e0cbb2" />
        <path d="M1200 678 L975 610 L750 702 L700 800 L1200 800Z" fill="#d3bb9c" />
      </g>
    </svg>
  )
}

/** Contour lines used as a wash inside headers and panels. */
export function TopoLines({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 900 150" preserveAspectRatio="none" aria-hidden="true">
      <g fill="none" stroke="var(--color-ink-light)" strokeWidth="1.6">
        <path d="M-20 118 C 160 64 300 142 470 96 S 760 40 920 92" />
        <path d="M-20 136 C 170 82 310 160 480 114 S 770 58 920 110" />
        <path d="M-20 100 C 150 46 290 124 460 78 S 750 22 920 74" />
        <path d="M-20 82 C 140 30 280 106 450 60 S 740 6 920 56" />
      </g>
    </svg>
  )
}

/** Wake lines for the setup dial panel. */
export function WakeLinesInk({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 600 300" preserveAspectRatio="none" aria-hidden="true">
      <g fill="none" stroke="var(--color-text)" strokeWidth="2">
        <path d="M-10 210 C 120 160 210 246 330 200 S 500 148 610 190" />
        <path d="M-10 238 C 130 188 220 274 340 228 S 510 176 610 218" />
        <path d="M-10 266 C 140 216 230 300 350 256 S 520 204 610 246" />
      </g>
    </svg>
  )
}

/** Wake lines along the foot of the live screen. */
export function WakeLinesLight({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 1200 260" preserveAspectRatio="none" aria-hidden="true">
      <g fill="none" stroke="var(--color-ink-light)" strokeWidth="2">
        <path d="M-20 170 C 180 118 320 196 520 150 S 860 96 1220 146" />
        <path d="M-20 202 C 190 150 330 228 530 182 S 870 128 1220 178" />
        <path d="M-20 234 C 200 182 340 258 540 214 S 880 160 1220 210" />
      </g>
    </svg>
  )
}

/** Concentric sonar rings behind the pairing target. */
export function SonarRings({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 500 500" aria-hidden="true">
      <g fill="none" stroke="var(--color-ink-light)" strokeWidth="2">
        <circle cx="250" cy="250" r="80" />
        <circle cx="250" cy="250" r="130" />
        <circle cx="250" cy="250" r="180" />
        <circle cx="250" cy="250" r="230" />
      </g>
    </svg>
  )
}
