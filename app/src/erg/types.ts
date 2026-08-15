/** The seam between the screens and whatever is producing rowing data.
 *  Today that is the simulator in `simulatedErg.ts`; a real Concept2 PM5 over
 *  Bluetooth implements the same interface and drops straight in. */

export type PieceType = 'Just row' | 'Distance' | 'Time' | 'Intervals'

/** Work or rest — a piece with intervals alternates between the two. */
export type Phase = 'work' | 'rest'

export interface PieceConfig {
  type: PieceType
  /** Metres, used when type is `Distance`. */
  distance: number
  /** Metres in one rep, used when type is `Intervals`. */
  intervalDistance: number
  /** Minutes, used when type is `Time`. */
  minutes: number
  /** Target pace, in seconds per 500 m. */
  targetSplit: number
  /** Whether a heart-rate belt is in use. */
  heartRate: boolean
  /** Reps, used when type is `Intervals`. */
  reps: number
  /** Rest between reps in seconds, used when type is `Intervals`. */
  rest: number
}

/** One completed 500 m — or one completed interval. */
export interface SplitRecord {
  number: number
  distance: number
  /** Seconds this split took. */
  time: number
  /** Average pace across the split, in seconds per 500 m. */
  split: number
  strokeRate: number
  /** Set when the split is a whole interval rather than a 500 m mark. */
  interval?: number
}

/** A point on the pace graph, taken once a second of work. */
export interface PaceSample {
  t: number
  split: number
  strokeRate: number
}

export interface ErgTelemetry {
  /** Seconds of work since the piece started, excluding rest and paused time. */
  elapsed: number
  /** Metres rowed across the whole piece. */
  distance: number
  /** Metres rowed in the current interval; equals `distance` when not doing intervals. */
  intervalDistance: number
  /** Current pace, in seconds per 500 m. */
  split: number
  /** Strokes per minute. */
  strokeRate: number
  watts: number
  /** Beats per minute, or null when no belt is reporting. */
  heartRate: number | null
  strokeCount: number
  phase: Phase
  /** 1-based; always 1 for a piece without intervals. */
  intervalNumber: number
  /** Seconds left in the current rest, 0 while working. */
  restRemaining: number

  /** Force in newtons across the drive of the most recent completed stroke. */
  forceCurve: number[]
  /** The stroke before that, drawn behind for comparison. */
  previousForceCurve: number[]
  /** Metres of chain pulled on the last drive. */
  driveLength: number
  /** Seconds the last drive took. */
  driveTime: number
  peakForce: number
  averageForce: number

  splits: SplitRecord[]
  samples: PaceSample[]
  /** True once the erg has reached the end of the piece on its own. */
  finished: boolean
}

export interface ErgSource {
  readonly id: string
  /** Human-readable name of the monitor, for the pairing screen. */
  readonly label: string
  /** Begin a new piece from zero. */
  start(piece: PieceConfig): void
  pause(): void
  resume(): void
  /** End the piece; the last telemetry stays readable. */
  stop(): void
  /** Returns an unsubscribe function. */
  subscribe(listener: (telemetry: ErgTelemetry) => void): () => void
}

/** The metres a piece is aiming at, or 0 for an open-ended piece. */
export function goalMeters(piece: PieceConfig): number {
  if (piece.type === 'Distance') return piece.distance
  if (piece.type === 'Time') return (piece.minutes * 60 * 500) / piece.targetSplit
  if (piece.type === 'Intervals') return piece.intervalDistance * piece.reps
  return 0
}

/** The metres one rep is aiming at — the whole piece, unless it has intervals. */
export function legMeters(piece: PieceConfig): number {
  return piece.type === 'Intervals' ? piece.intervalDistance : goalMeters(piece)
}

/** The rate a piece is rowed at rises as the target pace gets faster; intervals
 *  sit four strokes above the equivalent steady piece. Used for the rate band
 *  on the live screen. */
export function targetRate(piece: PieceConfig): number {
  const steady = Math.round(46 - piece.targetSplit / 5)
  const rate = piece.type === 'Intervals' ? steady + 4 : steady
  return Math.min(36, Math.max(16, rate))
}

/** Resting readout shown before the handle moves. */
export function idleTelemetry(piece: PieceConfig): ErgTelemetry {
  return {
    elapsed: 0,
    distance: 0,
    intervalDistance: 0,
    split: piece.targetSplit,
    strokeRate: targetRate(piece),
    watts: 2.8 / Math.pow(piece.targetSplit / 500, 3),
    heartRate: piece.heartRate ? 142 : null,
    strokeCount: 0,
    phase: 'work',
    intervalNumber: 1,
    restRemaining: 0,
    forceCurve: [],
    previousForceCurve: [],
    driveLength: 0,
    driveTime: 0,
    peakForce: 0,
    averageForce: 0,
    splits: [],
    samples: [],
    finished: false,
  }
}
