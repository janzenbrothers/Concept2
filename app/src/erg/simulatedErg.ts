import { idleTelemetry, type ErgSource, type ErgTelemetry, type PieceConfig } from './types'

const TICK_MS = 250
const TICK_S = TICK_MS / 1000

/** A stand-in for a real PM5: a rower who settles two seconds under target,
 *  breathes a long swell across the piece and a short one across each stroke
 *  cycle. Distance accumulates from the pace actually held, so the pace boat
 *  gap behaves the way it would on the water. */
export class SimulatedErg implements ErgSource {
  readonly id = 'sim'
  readonly label = 'PM5 · 430912'

  private listeners = new Set<(t: ErgTelemetry) => void>()
  private timer: ReturnType<typeof setInterval> | null = null
  private piece: PieceConfig | null = null
  private running = false
  private elapsed = 0
  private distance = 0

  subscribe(listener: (t: ErgTelemetry) => void) {
    this.listeners.add(listener)
    return () => {
      this.listeners.delete(listener)
    }
  }

  start(piece: PieceConfig) {
    this.piece = piece
    this.elapsed = 0
    this.distance = 0
    this.running = true
    this.ensureTimer()
    this.emit()
  }

  pause() {
    this.running = false
  }

  resume() {
    if (!this.piece) return
    this.running = true
    this.ensureTimer()
  }

  stop() {
    this.running = false
    if (this.timer !== null) {
      clearInterval(this.timer)
      this.timer = null
    }
  }

  /** Instantaneous pace, in seconds per 500 m, at a point in the piece. */
  private splitAt(t: number): number {
    const base = this.piece?.targetSplit ?? 126
    return base - 2 + 4.5 * Math.sin(t / 26) + 1.2 * Math.sin(t / 3.1)
  }

  private ensureTimer() {
    if (this.timer !== null) return
    this.timer = setInterval(() => {
      if (!this.running) return
      this.distance += (500 / this.splitAt(this.elapsed)) * TICK_S
      this.elapsed += TICK_S
      this.emit()
    }, TICK_MS)
  }

  private emit() {
    if (!this.piece) return
    const t = this.elapsed
    const split = this.splitAt(t)
    const telemetry: ErgTelemetry = {
      elapsed: t,
      distance: this.distance,
      split,
      strokeRate: 23 + 2 * Math.sin(t / 4),
      watts: 2.8 / Math.pow(split / 500, 3),
      heartRate: this.piece.heartRate ? 142 + 8 * Math.sin(t / 30) : null,
    }
    for (const listener of this.listeners) listener(telemetry)
  }
}

export { idleTelemetry }
