import { useState } from 'react'
import { ForceCurve } from '../components/charts'
import { ConfirmDialog } from '../components/ConfirmDialog'
import { coachNote, splitByFiveHundred } from '../data/fixtures'
import { distanceParts, fmtClock, fmtSplit, fmtTime } from '../lib/format'
import { useApp } from '../state/context'

/** The workout behind the "recent pieces" rows — what this screen shows when it
 *  is opened as a log entry rather than at the end of a piece you just rowed. */
const SAMPLE = { metres: 5000, seconds: 1231, split: 123.1, rate: 21, heartRate: 148 }

export function SummaryScreen() {
  const { piece, telemetry, started, finishedAt, go, discard, units } = useApp()
  const [confirming, setConfirming] = useState(false)

  // Either this is the piece you just rowed, or it is the logged sample one.
  // Never a mix of the two: real stats over fixture splits reads as a bug.
  const rowed = started && telemetry.elapsed > 0
  const splits = rowed ? telemetry.splits.map((s) => s.split) : splitByFiveHundred
  const metres = rowed ? telemetry.distance : SAMPLE.metres
  const seconds = rowed ? telemetry.elapsed : SAMPLE.seconds
  const dist = distanceParts(Math.max(1, metres), units)
  const marks = rowed
    ? telemetry.splits.map((s) =>
        Math.round(telemetry.splits.slice(0, s.number).reduce((sum, r) => sum + r.distance, 0)),
      )
    : splitByFiveHundred.map((_, i) => (i + 1) * 500)
  const avgSplit = rowed ? (seconds / Math.max(1, metres)) * 500 : SAMPLE.split
  const avgRate =
    rowed && telemetry.splits.length
      ? telemetry.splits.reduce((sum, s) => sum + s.strokeRate, 0) / telemetry.splits.length
      : rowed
        ? telemetry.strokeRate
        : SAMPLE.rate
  const heartRate = rowed ? telemetry.heartRate : SAMPLE.heartRate

  const stats = [
    { label: 'Distance', value: `${dist.value} ${units === 'Miles' ? 'mi' : 'm'}`, deep: true },
    { label: 'Time', value: fmtTime(Math.max(1, seconds)) },
    { label: 'Avg split', value: fmtSplit(avgSplit) },
    { label: 'Avg rate', value: `${Math.round(avgRate)} spm` },
  ]

  return (
    <div className="screen screen--pad">
      <div className="row-between row-between--end">
        <div>
          <div className="eyebrow eyebrow--accent">
            Piece complete · {fmtClock(finishedAt ?? new Date())}
          </div>
          <h2 className="summary__title">Nicely rowed.</h2>
        </div>
        <span className="tag tag-accent-2">Second best 5 km this season</span>
      </div>

      <div className="summary__stats">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className={(stat.deep ? 'panel-deep' : 'panel') + ' panel--r14 summary__stat'}
          >
            <div className={'kicker' + (stat.deep ? ' kicker--on-deep' : '')}>{stat.label}</div>
            <div className="summary__stat-value num">{stat.value}</div>
          </div>
        ))}
      </div>

      <div className="summary__body">
        <section className="panel panel--r16 summary__chart">
          <div className="row-between row-between--baseline">
            <h4 className="section-title">Split by 500 m</h4>
            <div className="screen__note screen__note--sm">Lower is faster</div>
          </div>
          {rowed && splits.length === 0 ? (
            <div className="chart chart--empty">
              The piece ended before the first 500 m closed
            </div>
          ) : (
          <div className="summary__bars">
            {splits.map((value, i) => {
              // Bars fill the plot: the slowest split reaches the top, and the
              // spread between splits is what the eye is meant to read.
              const slowest = Math.max(...splits)
              const quickest = Math.min(...splits)
              const height = 42 + 58 * ((value - quickest) / (slowest - quickest || 1))
              return (
                <div className="bar-col" key={i}>
                  <div className="summary__bar-value num">{fmtSplit(value)}</div>
                  <div
                    className={
                      'bar bar--r10' + (value <= piece.targetSplit ? ' bar--river' : ' bar--sand')
                    }
                    style={{ height: height.toFixed(1) + '%' }}
                  />
                  <div className="summary__bar-label">{marks[i]}</div>
                </div>
              )
            })}
          </div>
          )}
        </section>

        <div className="summary__side">
          {rowed && telemetry.forceCurve.length > 1 && (
            <div className="panel panel--r14 summary__force">
              <div className="kicker">Last stroke</div>
              <ForceCurve
                curve={telemetry.forceCurve}
                previous={telemetry.previousForceCurve}
                driveLength={telemetry.driveLength}
              />
            </div>
          )}
          <div className="panel panel--r14 summary__note summary__note--fill">
            <div className="kicker">Coach note</div>
            <p className="summary__note-copy">{coachNote}</p>
            <div className="tag-row">
              <span className="tag tag-neutral">Cal 412</span>
              <span className="tag tag-neutral">
                Avg HR {heartRate === null ? '—' : Math.round(heartRate)}
              </span>
              <span className="tag tag-neutral">Drag 118</span>
            </div>
          </div>
          <button
            type="button"
            className="tap btn-primary-lg btn-primary-lg--md"
            onClick={() => go('home')}
          >
            Save to log
          </button>
          <button type="button" className="tap btn-quiet" onClick={() => setConfirming(true)}>
            Discard
          </button>
        </div>
      </div>

      {confirming && (
        <ConfirmDialog
          title="Discard this piece?"
          body="It will not be saved to your log, and the splits and force data go with it."
          confirmLabel="Discard"
          cancelLabel="Keep it"
          onConfirm={discard}
          onCancel={() => setConfirming(false)}
        />
      )}
    </div>
  )
}
