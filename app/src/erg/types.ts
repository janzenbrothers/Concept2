/** The seam between the screens and whatever is producing rowing data.
 *  Today that is the simulator in `simulatedErg.ts`; a real Concept2 PM5 over
 *  Bluetooth implements the same interface and drops straight in. */

export type PieceType = 'Just row' | 'Distance' | 'Time' | 'Intervals'

export interface PieceConfig {
  type: PieceType
  /** Metres, used when type is `Distance`. */
  distance: number
  /** Minutes, used when type is `Time`. */
  minutes: number
  /** Target pace, in seconds per 500 m. */
  targetSplit: number
  /** Whether a heart-rate belt is in use. */
  heartRate: boolean
}

export interface ErgTelemetry {
  /** Seconds since the piece started, excluding paused time. */
  elapsed: number
  /** Metres rowed. */
  distance: number
  /** Current pace, in seconds per 500 m. */
  split: number
  /** Strokes per minute. */
  strokeRate: number
  watts: number
  /** Beats per minute, or null when no belt is reporting. */
  heartRate: number | null
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
  return 0
}

/** Resting readout shown before the handle moves. */
export function idleTelemetry(targetSplit: number, heartRate: boolean): ErgTelemetry {
  return {
    elapsed: 0,
    distance: 0,
    split: targetSplit,
    strokeRate: 23,
    watts: 2.8 / Math.pow(targetSplit / 500, 3),
    heartRate: heartRate ? 142 : null,
  }
}
