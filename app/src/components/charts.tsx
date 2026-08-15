import type { PaceSample, SplitRecord } from '../erg/types'
import { fmtSplit, fmtTime } from '../lib/format'

const W = 1000
const H = 300

/** Split against elapsed time, with the target pace as a reference line.
 *  Faster is lower on the monitor and higher on a graph, so the y axis is
 *  inverted the way a rower expects: the line climbs as the piece gets quicker. */
export function PaceGraph({
  samples,
  targetSplit,
}: {
  samples: PaceSample[]
  targetSplit: number
}) {
  if (samples.length < 2) {
    return <div className="chart chart--empty">Pace appears after a few strokes</div>
  }

  const splits = samples.map((s) => s.split)
  const lo = Math.min(targetSplit, ...splits) - 2
  const hi = Math.max(targetSplit, ...splits) + 2
  const span = hi - lo || 1
  const duration = samples[samples.length - 1].t || 1

  const x = (t: number) => (t / duration) * W
  const y = (split: number) => ((split - lo) / span) * H

  const line = samples.map((s, i) => `${i ? 'L' : 'M'}${x(s.t).toFixed(1)} ${y(s.split).toFixed(1)}`).join(' ')
  const area = `${line} L${W} ${H} L0 ${H}Z`
  const targetY = y(targetSplit).toFixed(1)

  const ticks = [lo + span * 0.25, lo + span * 0.5, lo + span * 0.75]

  return (
    <div className="chart">
      <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" className="chart__plot">
        {ticks.map((t) => (
          <line key={t} x1="0" y1={y(t)} x2={W} y2={y(t)} className="chart__grid" />
        ))}
        <path d={area} className="chart__area" />
        <line x1="0" y1={targetY} x2={W} y2={targetY} className="chart__target" />
        <path d={line} className="chart__line" />
      </svg>
      <div className="chart__axis chart__axis--y">
        <span>{fmtSplit(lo)}</span>
        <span>{fmtSplit(hi)}</span>
      </div>
      <div className="chart__axis chart__axis--x">
        <span>0:00</span>
        <span>target {fmtSplit(targetSplit)}</span>
        <span>{fmtTime(duration)}</span>
      </div>
    </div>
  )
}

/** Force against drive length for the last stroke, with the one before it drawn
 *  behind. A smooth curve that maps onto its predecessor is a stroke holding
 *  together; a bump or a shifting peak is not. */
export function ForceCurve({
  curve,
  previous,
  driveLength,
}: {
  curve: number[]
  previous: number[]
  driveLength: number
}) {
  if (curve.length < 2) {
    return <div className="chart chart--empty">Force curve appears after the first stroke</div>
  }

  const peak = Math.max(...curve, ...previous, 1) * 1.08
  const path = (points: number[]) =>
    points
      .map((f, i) => {
        const x = (i / (points.length - 1)) * W
        const y = H - (f / peak) * H
        return `${i ? 'L' : 'M'}${x.toFixed(1)} ${y.toFixed(1)}`
      })
      .join(' ')

  return (
    <div className="chart">
      <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" className="chart__plot">
        <line x1="0" y1={H * 0.25} x2={W} y2={H * 0.25} className="chart__grid" />
        <line x1="0" y1={H * 0.5} x2={W} y2={H * 0.5} className="chart__grid" />
        <line x1="0" y1={H * 0.75} x2={W} y2={H * 0.75} className="chart__grid" />
        <path d={`${path(curve)} L${W} ${H} L0 ${H}Z`} className="chart__area" />
        {previous.length > 1 && <path d={path(previous)} className="chart__line chart__line--ghost" />}
        <path d={path(curve)} className="chart__line" />
      </svg>
      <div className="chart__axis chart__axis--y">
        <span>{Math.round(peak)} N</span>
        <span>0 N</span>
      </div>
      <div className="chart__axis chart__axis--x">
        <span>catch</span>
        <span>drive · {driveLength.toFixed(2)} m</span>
        <span>finish</span>
      </div>
    </div>
  )
}

/** Every split closed so far, newest first — the table ErgData shows mid-piece. */
export function SplitTable({
  splits,
  targetSplit,
  intervals,
}: {
  splits: SplitRecord[]
  targetSplit: number
  intervals: boolean
}) {
  if (splits.length === 0) {
    return (
      <div className="chart chart--empty">
        {intervals ? 'Splits appear as each interval closes' : 'Splits appear every 500 m'}
      </div>
    )
  }

  return (
    <div className="splits">
      <div className="splits__row splits__row--head">
        <span>{intervals ? 'Interval' : 'Split'}</span>
        <span>Distance</span>
        <span>Time</span>
        <span>Split</span>
        <span>Rate</span>
      </div>
      <div className="splits__body">
        {[...splits].reverse().map((split) => (
          <div
            className={'splits__row' + (split.split <= targetSplit ? ' is-under' : '')}
            key={split.number}
          >
            <span className="splits__label">
              {intervals ? `#${split.interval ?? split.number}` : `${split.number * 500} m`}
            </span>
            <span className="num">{Math.round(split.distance).toLocaleString('en-US')} m</span>
            <span className="num">{fmtTime(split.time)}</span>
            <span className="num splits__split">{fmtSplit(split.split)}</span>
            <span className="num">{Math.round(split.strokeRate)}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
