import { WakeLinesLight } from '../components/ValleyBackdrop'
import type { PieceConfig } from '../erg/types'
import { fmtInt, fmtSplit, fmtTime } from '../lib/format'
import { useApp } from '../state/context'

function pieceLabel(piece: PieceConfig): string {
  if (piece.type === 'Distance') return (piece.distance / 1000).toFixed(1) + ' km'
  if (piece.type === 'Time') return piece.minutes + ' min steady'
  if (piece.type === 'Intervals') return '4 × 500 m'
  return 'Just row'
}

export function LiveScreen() {
  const { piece, goal, telemetry, running, paceBoat, togglePause, finish } = useApp()
  const { elapsed, distance, split } = telemetry

  // The pace boat holds target split exactly; the gap is metres of open water.
  const boatDistance = elapsed * (500 / piece.targetSplit)
  const progress = goal ? Math.min(1, distance / goal) : Math.min(1, distance / 5000)
  const boat = goal ? Math.min(1, boatDistance / goal) : 0
  const gap = distance - boatDistance
  const delta = split - piece.targetSplit
  const label = pieceLabel(piece)

  const metrics = [
    { label: 'Elapsed', value: fmtTime(elapsed) },
    { label: 'Rate', value: Math.round(telemetry.strokeRate) + ' spm' },
    { label: 'Watts', value: String(Math.round(telemetry.watts)) },
    {
      label: 'Heart rate',
      value: telemetry.heartRate === null ? '—' : String(Math.round(telemetry.heartRate)),
    },
    { label: 'Projected', value: goal ? fmtTime((goal / 500) * split) : '—' },
  ]

  return (
    <div className="screen screen--dark live">
      <WakeLinesLight className="live__wake" />

      <div className="live__top">
        <div className="live__piece">
          <span className="tag tag-on-dark">{label}</span>
          <span className="live__phase">{running ? 'In the body of the piece' : 'Paused'}</span>
        </div>
        <div className="live__link">
          <span className="live__link-dot" />
          PM5 connected
        </div>
      </div>

      <div className="live__heroes">
        <div>
          <div className="live__hero-label">Split · 500 m</div>
          <div className="live__hero">{fmtSplit(split)}</div>
          <div className="live__delta">
            <div className={'live__delta-value' + (delta <= 0 ? ' is-up' : ' is-down')}>
              {(delta <= 0 ? '▼ ' : '▲ ') + Math.abs(delta).toFixed(1) + ' s'}
            </div>
            <div className="live__delta-target">vs target {fmtSplit(piece.targetSplit)}</div>
          </div>
        </div>
        <div className="live__hero-right">
          <div className="live__hero-label">Distance</div>
          <div className="live__hero">{fmtInt(distance)}</div>
          <div className="live__hero-sub">
            metres · {goal ? fmtInt(Math.max(0, goal - distance)) + ' m to go' : 'open piece'}
          </div>
        </div>
      </div>

      <div className="live__progress">
        <div className="live__track">
          <div className="live__fill" style={{ width: (progress * 100).toFixed(1) + '%' }} />
          {paceBoat && (
            <div className="live__boat" style={{ left: (boat * 100).toFixed(1) + '%' }} />
          )}
        </div>
        <div className="live__track-foot">
          <div>{paceBoat ? `Pace boat ${gap >= 0 ? '+' : ''}${fmtInt(gap)} m` : 'No pace boat'}</div>
          <div>{label}</div>
        </div>
      </div>

      <div className="live__metrics">
        {metrics.map((metric) => (
          <div className="live__metric" key={metric.label}>
            <div className="kicker kicker--on-deep">{metric.label}</div>
            <div className="live__metric-value">{metric.value}</div>
          </div>
        ))}
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
