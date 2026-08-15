import {
  goalMeters,
  idleTelemetry,
  legMeters,
  targetRate,
  type ErgSource,
  type ErgTelemetry,
  type PaceSample,
  type Phase,
  type PieceConfig,
  type SplitRecord,
} from './types'

const TICK_MS = 250
const TICK_S = TICK_MS / 1000
const SPLIT_METRES = 500
/** Points sampled across one drive for the force curve. */
const CURVE_POINTS = 28
/** A drive takes about the same time whatever the rate; the recovery absorbs the rest. */
const DRIVE_SECONDS = 0.86

/** A stand-in for a real PM5: a rower who settles two seconds under target,
 *  breathes a long swell across the piece and a short one across each stroke
 *  cycle. Distance accumulates from the pace actually held, so the pace boat
 *  gap behaves the way it would on the water.
 *
 *  It also does the work a monitor does rather than a screen: counting strokes,
 *  shaping a force curve for each one, closing off splits, running the rest
 *  between intervals, and ending the piece when the target is reached. */
export class SimulatedErg implements ErgSource {
  readonly id = 'sim'
  readonly label = 'PM5 · 430912'

  private listeners = new Set<(t: ErgTelemetry) => void>()
  private timer: ReturnType<typeof setInterval> | null = null
  private piece: PieceConfig | null = null
  private running = false
  private finished = false

  private elapsed = 0
  private distance = 0
  private intervalDistance = 0
  private phase: Phase = 'work'
  private intervalNumber = 1
  private restRemaining = 0

  private strokeCount = 0
  private strokeElapsed = 0
  private forceCurve: number[] = []
  private previousForceCurve: number[] = []
  private driveLength = 0
  private peakForce = 0
  private averageForce = 0

  private splits: SplitRecord[] = []
  private samples: PaceSample[] = []
  private splitStartDistance = 0
  private splitStartTime = 0
  private splitRateSum = 0
  private splitRateCount = 0
  private lastSampleSecond = -1

  subscribe(listener: (t: ErgTelemetry) => void) {
    this.listeners.add(listener)
    return () => {
      this.listeners.delete(listener)
    }
  }

  start(piece: PieceConfig) {
    this.piece = piece
    this.running = true
    this.finished = false
    this.elapsed = 0
    this.distance = 0
    this.intervalDistance = 0
    this.phase = 'work'
    this.intervalNumber = 1
    this.restRemaining = 0
    this.strokeCount = 0
    this.strokeElapsed = 0
    this.forceCurve = []
    this.previousForceCurve = []
    this.driveLength = 0
    this.peakForce = 0
    this.averageForce = 0
    this.splits = []
    this.samples = []
    this.splitStartDistance = 0
    this.splitStartTime = 0
    this.splitRateSum = 0
    this.splitRateCount = 0
    this.lastSampleSecond = -1
    this.ensureTimer()
    this.emit()
  }

  pause() {
    this.running = false
  }

  resume() {
    if (!this.piece || this.finished) return
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

  private rateAt(t: number): number {
    return targetRate(this.piece!) + 2 * Math.sin(t / 4)
  }

  private ensureTimer() {
    if (this.timer !== null) return
    this.timer = setInterval(() => {
      if (!this.running || this.finished) return
      this.tick()
      this.emit()
    }, TICK_MS)
  }

  private tick() {
    const piece = this.piece
    if (!piece) return

    if (this.phase === 'rest') {
      this.restRemaining = Math.max(0, this.restRemaining - TICK_S)
      if (this.restRemaining === 0) this.beginNextInterval()
      return
    }

    const split = this.splitAt(this.elapsed)
    const rate = this.rateAt(this.elapsed)
    const metres = (SPLIT_METRES / split) * TICK_S

    this.distance += metres
    this.intervalDistance += metres
    this.elapsed += TICK_S
    this.splitRateSum += rate
    this.splitRateCount += 1

    this.advanceStroke(rate, split)

    const second = Math.floor(this.elapsed)
    if (second !== this.lastSampleSecond) {
      this.lastSampleSecond = second
      this.samples.push({ t: this.elapsed, split, strokeRate: rate })
    }

    this.closeSplits()
    this.checkFinish()
  }

  /** Count strokes off the wall clock, and shape a force curve for each one. */
  private advanceStroke(rate: number, split: number) {
    this.strokeElapsed += TICK_S
    const period = 60 / rate
    if (this.strokeElapsed < period) return

    this.strokeElapsed -= period
    this.strokeCount += 1

    // Work done in one stroke, spread over the length of chain pulled.
    const watts = 2.8 / Math.pow(split / 500, 3)
    const work = watts * period
    const wobble = Math.sin(this.strokeCount / 3.7) * 0.04 + Math.sin(this.strokeCount * 2.3) * 0.015
    this.driveLength = 1.33 * (1 + wobble)
    this.averageForce = work / this.driveLength
    // A well-shaped drive averages a little under two thirds of its peak.
    this.peakForce = this.averageForce / (0.62 + wobble * 0.3)

    this.previousForceCurve = this.forceCurve
    this.forceCurve = Array.from({ length: CURVE_POINTS }, (_, i) => {
      const x = i / (CURVE_POINTS - 1)
      const shape = Math.pow(Math.sin(Math.PI * Math.pow(x, 0.8)), 1.25)
      const ripple = 1 + 0.03 * Math.sin(x * 9 + this.strokeCount)
      return this.peakForce * shape * ripple
    })
  }

  /** Close off a split every 500 m, and every interval boundary. */
  private closeSplits() {
    const piece = this.piece!
    const leg = legMeters(piece)
    const isInterval = piece.type === 'Intervals'

    if (isInterval && leg > 0 && this.intervalDistance >= leg) {
      this.pushSplit(this.intervalNumber)
      this.intervalDistance = 0
      const last = this.intervalNumber >= piece.reps
      if (!last) {
        this.phase = 'rest'
        this.restRemaining = piece.rest
      }
      return
    }

    if (!isInterval && this.distance - this.splitStartDistance >= SPLIT_METRES) {
      this.pushSplit()
    }
  }

  private pushSplit(interval?: number) {
    const distance = this.distance - this.splitStartDistance
    const time = this.elapsed - this.splitStartTime
    if (distance <= 0 || time <= 0) return
    this.splits.push({
      number: this.splits.length + 1,
      distance,
      time,
      split: (time / distance) * SPLIT_METRES,
      strokeRate: this.splitRateCount ? this.splitRateSum / this.splitRateCount : 0,
      interval,
    })
    this.splitStartDistance = this.distance
    this.splitStartTime = this.elapsed
    this.splitRateSum = 0
    this.splitRateCount = 0
  }

  private beginNextInterval() {
    this.phase = 'work'
    this.intervalNumber += 1
    this.splitStartDistance = this.distance
    this.splitStartTime = this.elapsed
    this.splitRateSum = 0
    this.splitRateCount = 0
  }

  /** A monitor ends the piece itself when the target is reached. */
  private checkFinish() {
    const piece = this.piece!
    const goal = goalMeters(piece)
    const done =
      piece.type === 'Time'
        ? this.elapsed >= piece.minutes * 60
        : goal > 0 && this.distance >= goal
    if (!done) return
    if (this.splitStartDistance < this.distance) this.pushSplit(piece.type === 'Intervals' ? this.intervalNumber : undefined)
    this.finished = true
    this.running = false
  }

  private emit() {
    if (!this.piece) return
    const t = this.elapsed
    const split = this.splitAt(t)
    const telemetry: ErgTelemetry = {
      elapsed: t,
      distance: this.distance,
      intervalDistance: this.intervalDistance,
      split,
      strokeRate: this.phase === 'rest' ? 0 : this.rateAt(t),
      watts: 2.8 / Math.pow(split / 500, 3),
      heartRate: this.piece.heartRate ? 142 + 8 * Math.sin(t / 30) : null,
      strokeCount: this.strokeCount,
      phase: this.phase,
      intervalNumber: this.intervalNumber,
      restRemaining: this.restRemaining,
      forceCurve: this.forceCurve,
      previousForceCurve: this.previousForceCurve,
      driveLength: this.driveLength,
      driveTime: DRIVE_SECONDS,
      peakForce: this.peakForce,
      averageForce: this.averageForce,
      splits: this.splits,
      samples: this.samples,
      finished: this.finished,
    }
    for (const listener of this.listeners) listener(telemetry)
  }
}

export { idleTelemetry }
