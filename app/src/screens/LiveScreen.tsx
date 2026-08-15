import { useRef } from 'react'
import { ForceCurve, PaceGraph, SplitTable } from '../components/charts'
import { HeartIcon } from '../components/icons'
import { WakeLinesLight } from '../components/ValleyBackdrop'
import { targetRate, type PieceConfig } from '../erg/types'
import { distanceParts, fmtDistance, fmtInt, fmtSplit, fmtTime } from '../lib/format'
import { useApp } from '../state/context'
import type { LiveMode } from '../state/context'

const MODES: { id: LiveMode; label: string }[] = [
  { id: 'numbers', label: 'Numbers' },
  { id: 'pace', label: 'Pace' },
  { id: 'splits', label: 'Splits' },
  { id: 'force', label: 'Force' },
]

function pieceLabel(piece: PieceConfig): string {
  if (piece.type === 'Distance') return (piece.distance / 1000).toFixed(1) + ' km'
  if (piece.type === 'Time') return piece.minutes + ' min steady'
  if (piece.type === 'Intervals') return `${piece.reps} × ${fmtInt(piece.intervalDistance)} m`
  return 'Just row'
}

export function LiveScreen() {
  const {
    piece,
    goal,
    leg,
    telemetry,
    running,
    autoPaused,
    heartRateAlert,
    paceBoat,
    togglePause,
    finish,
    liveMode,
    setLiveMode,
    units,
  } = useApp()
  const { elapsed, distance, split, phase } = telemetry
  const intervals = piece.type === 'Intervals'
  const resting = phase === 'rest'

  // The pace boat holds target split exactly; the gap is metres of open water.
  const boatDistance = elapsed * (500 / piece.targetSplit)
  const legDistance = intervals ? telemetry.intervalDistance : distance
  const legGoal = leg || 5000
  const progress = Math.min(1, legDistance / legGoal)
  const boat = goal ? Math.min(1, boatDistance / goal) : 0
  const rawGap = distance - boatDistance
  // Within half a metre the boats are level; "-0 m" is a rounding artefact.
  const gap = Math.abs(rawGap) < 0.5 ? 0 : rawGap
  const delta = split - piece.targetSplit
  const rateTarget = targetRate(piece)
  const rateOff = Math.abs(telemetry.strokeRate - rateTarget) > 2
  const remaining = goal ? Math.max(0, goal - distance) : 0
  const timeRemaining =
    piece.type === 'Time' ? Math.max(0, piece.minutes * 60 - elapsed) : null
  const dist = distanceParts(legDistance, units)

  // Swipe between modes, the way the monitor's own app does.
  const swipe = useRef<number | null>(null)
  const stepMode = (direction: 1 | -1) => {
    const i = MODES.findIndex((m) => m.id === liveMode)
    const next = MODES[(i + direction + MODES.length) % MODES.length]
    setLiveMode(next.id)
  }

  return (
    <div className="screen screen--dark live">
      <WakeLinesLight className="live__wake" />

      <div className="live__top">
        <div className="live__piece">
          <span className="tag tag-on-dark">{pieceLabel(piece)}</span>
          {intervals && (
            <span className="tag tag-on-dark">
              {resting ? 'Rest' : `Interval ${telemetry.intervalNumber} of ${piece.reps}`}
            </span>
          )}
          <span className="live__phase">
            {resting
              ? 'Paddle it out'
              : autoPaused
                ? 'Auto paused · handle at rest'
                : running
                  ? 'In the body of the piece'
                  : 'Paused'}
          </span>
        </div>
        <div className="live__status">
          {heartRateAlert && (
            <span className="live__alert">
              <HeartIcon className="live__alert-icon" />
              {Math.round(telemetry.heartRate ?? 0)} bpm — ease off
            </span>
          )}
          <span className="live__link">
            <span className="live__link-dot" />
            PM5 connected
          </span>
        </div>
      </div>

      <div className="live__modes" role="tablist" aria-label="Live display">
        {MODES.map((mode) => (
          <button
            key={mode.id}
            type="button"
            role="tab"
            aria-selected={liveMode === mode.id}
            className={'tap live__mode' + (liveMode === mode.id ? ' is-active' : '')}
            onClick={() => setLiveMode(mode.id)}
          >
            {mode.label}
          </button>
        ))}
      </div>

      <div
        className="live__stage"
        onPointerDown={(e) => {
          swipe.current = e.clientX
        }}
        onPointerUp={(e) => {
          if (swipe.current === null) return
          const dx = e.clientX - swipe.current
          swipe.current = null
          if (Math.abs(dx) > 60) stepMode(dx < 0 ? 1 : -1)
        }}
        onKeyDown={(e) => {
          if (e.key === 'ArrowRight') stepMode(1)
          if (e.key === 'ArrowLeft') stepMode(-1)
        }}
        tabIndex={0}
      >
        {liveMode === 'numbers' && (
          <div className="numbers">
            {resting ? (
              <div className="numbers__rest">
                <div className="live__hero-label">Rest</div>
                <div className="numbers__rest-clock num">{fmtTime(telemetry.restRemaining)}</div>
                <div className="numbers__rest-next">
                  Interval {Math.min(piece.reps, telemetry.intervalNumber + 1)} of {piece.reps} ·{' '}
                  {fmtInt(piece.intervalDistance)} m at {fmtSplit(piece.targetSplit)}
                </div>
              </div>
            ) : (
              <div className="numbers__heroes">
                <div>
                  <div className="live__hero-label">Split · 500 m</div>
                  <div className="live__hero num">{fmtSplit(split)}</div>
                  <div className="live__delta">
                    <span className={'live__delta-value' + (delta <= 0 ? ' is-up' : ' is-down')}>
                      {(delta <= 0 ? '▼ ' : '▲ ') + Math.abs(delta).toFixed(1) + ' s'}
                    </span>
                    <span className="live__delta-target">
                      vs target {fmtSplit(piece.targetSplit)}
                    </span>
                  </div>
                </div>
                <div className="live__hero-right">
                  <div className="live__hero-label">
                    {intervals ? `Interval ${telemetry.intervalNumber}` : 'Distance'}
                  </div>
                  <div className="live__hero num">{dist.value}</div>
                  <div className="live__hero-sub">
                    {dist.unit}
                    {goal ? ` · ${fmtDistance(remaining, units)} to go` : ' · open piece'}
                  </div>
                </div>
              </div>
            )}

            <div className="numbers__second">
              <div className="second">
                <div className="kicker kicker--on-deep">
                  {timeRemaining === null ? 'Elapsed' : 'Time left'}
                </div>
                <div className="second__value num">
                  {fmtTime(timeRemaining === null ? elapsed : timeRemaining)}
                </div>
                {timeRemaining !== null && (
                  <div className="second__note">{fmtTime(elapsed)} rowed</div>
                )}
              </div>
              <div className={'second' + (rateOff && !resting ? ' is-off' : '')}>
                <div className="kicker kicker--on-deep">Rate</div>
                <div className="second__value num">
                  {resting ? (
                    <span className="second__idle">resting</span>
                  ) : (
                    <>
                      {Math.round(telemetry.strokeRate)}
                      <span className="second__unit"> spm</span>
                    </>
                  )}
                </div>
                <div className="second__note">target {rateTarget - 2}–{rateTarget + 2}</div>
              </div>
              <div className="second">
                <div className="kicker kicker--on-deep">
                  {paceBoat ? 'Pace boat' : 'Projected'}
                </div>
                <div className="second__value num">
                  {paceBoat
                    ? (gap >= 0 ? '+' : '') + fmtInt(gap)
                    : goal
                      ? fmtTime((goal / 500) * split)
                      : '—'}
                  {paceBoat && <span className="second__unit"> m</span>}
                </div>
                <div className="second__note">
                  {paceBoat ? (gap >= 0 ? 'ahead of the ghost' : 'behind the ghost') : 'finish time'}
                </div>
              </div>
            </div>

            <div className="numbers__strip">
              <div className="live__metric">
                <div className="kicker kicker--on-deep">Watts</div>
                <div className="live__metric-value num">{Math.round(telemetry.watts)}</div>
              </div>
              <div className="live__metric">
                <div className="kicker kicker--on-deep">Heart rate</div>
                <div className="live__metric-value num">
                  {telemetry.heartRate === null ? '—' : Math.round(telemetry.heartRate)}
                </div>
              </div>
              <div className="live__metric">
                <div className="kicker kicker--on-deep">Strokes</div>
                <div className="live__metric-value num">{telemetry.strokeCount}</div>
              </div>
              <div className="live__metric">
                <div className="kicker kicker--on-deep">Projected</div>
                <div className="live__metric-value num">
                  {goal ? fmtTime((goal / 500) * split) : '—'}
                </div>
              </div>
            </div>
          </div>
        )}

        {liveMode === 'pace' && (
          <PaceGraph samples={telemetry.samples} targetSplit={piece.targetSplit} />
        )}

        {liveMode === 'splits' && (
          <SplitTable
            splits={telemetry.splits}
            targetSplit={piece.targetSplit}
            intervals={intervals}
          />
        )}

        {liveMode === 'force' && (
          <div className="force">
            <ForceCurve
              curve={telemetry.forceCurve}
              previous={telemetry.previousForceCurve}
              driveLength={telemetry.driveLength}
            />
            <div className="force__metrics">
              <div className="live__metric">
                <div className="kicker kicker--on-deep">Peak force</div>
                <div className="live__metric-value num">
                  {Math.round(telemetry.peakForce)}
                  <span className="second__unit"> N</span>
                </div>
              </div>
              <div className="live__metric">
                <div className="kicker kicker--on-deep">Average force</div>
                <div className="live__metric-value num">
                  {Math.round(telemetry.averageForce)}
                  <span className="second__unit"> N</span>
                </div>
              </div>
              <div className="live__metric">
                <div className="kicker kicker--on-deep">Drive length</div>
                <div className="live__metric-value num">
                  {telemetry.driveLength.toFixed(2)}
                  <span className="second__unit"> m</span>
                </div>
              </div>
              <div className="live__metric">
                <div className="kicker kicker--on-deep">Avg / peak</div>
                <div className="live__metric-value num">
                  {telemetry.peakForce
                    ? (telemetry.averageForce / telemetry.peakForce).toFixed(2)
                    : '—'}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="live__progress">
        <div className="live__track-wrap">
          <div className="live__track">
            <div className="live__fill" style={{ width: (progress * 100).toFixed(1) + '%' }} />
          </div>
          {paceBoat && goal > 0 && (
            <div className="live__boat" style={{ left: (boat * 100).toFixed(1) + '%' }}>
              <span className="live__boat-flag" />
            </div>
          )}
        </div>
        <div className="live__track-foot">
          <span>
            {paceBoat && goal > 0
              ? `Pace boat ${gap >= 0 ? '+' : ''}${fmtInt(gap)} m`
              : 'No pace boat'}
          </span>
          <span>
            {fmtDistance(legDistance, units)}
            {leg ? ` / ${fmtDistance(leg, units)}` : ''}
          </span>
        </div>
      </div>

      <div className="live__actions">
        <button type="button" className="tap live__action" onClick={togglePause}>
          {running ? 'Pause' : 'Resume'}
        </button>
        <button type="button" className="tap live__action live__action--primary" onClick={finish}>
          Finish piece
        </button>
      </div>
    </div>
  )
}
