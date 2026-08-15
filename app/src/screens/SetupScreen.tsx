import { Pill, Toggle } from '../components/controls'
import { WakeLinesInk } from '../components/ValleyBackdrop'
import type { PieceConfig, PieceType } from '../erg/types'
import { fmtInt, fmtSplit, fmtTime } from '../lib/format'
import { useApp } from '../state/context'

const TYPES: PieceType[] = ['Just row', 'Distance', 'Time', 'Intervals']

function targetLabel(type: PieceType): string {
  if (type === 'Distance') return 'Distance target'
  if (type === 'Time') return 'Time target'
  if (type === 'Intervals') return 'Interval distance'
  return 'No target'
}

function targetValue(piece: PieceConfig): string {
  if (piece.type === 'Distance') return fmtInt(piece.distance)
  if (piece.type === 'Time') return piece.minutes + ':00'
  if (piece.type === 'Intervals') return '4 × 500'
  return '—'
}

function targetHint(piece: PieceConfig): string {
  if (piece.type === 'Distance') {
    return 'About ' + fmtTime((piece.distance / 500) * piece.targetSplit) + ' at target split'
  }
  if (piece.type === 'Time') {
    const metres = Math.round((piece.minutes * 60 * 500) / piece.targetSplit / 100) * 100
    return 'About ' + fmtInt(metres) + ' m at target split'
  }
  if (piece.type === 'Intervals') return '3:00 rest between each'
  return 'Row until you stop'
}

export function SetupScreen() {
  const {
    piece,
    setType,
    stepTarget,
    stepSplit,
    paceBoat,
    togglePaceBoat,
    toggleHeartRate,
    startPiece,
  } = useApp()

  return (
    <div className="screen screen--pad">
      <div className="row-between row-between--baseline">
        <h3 className="screen__title">Set the piece</h3>
        <div className="screen__note">Drag factor 118 · flywheel warm</div>
      </div>

      <div className="setup__types">
        {TYPES.map((type) => (
          <Pill
            key={type}
            label={type}
            size="lg"
            active={piece.type === type}
            onClick={() => setType(type)}
          />
        ))}
      </div>

      <div className="setup__body">
        <section className="panel panel--r16 setup__dial">
          <WakeLinesInk className="setup__wake" />
          <div className="setup__dial-label">{targetLabel(piece.type)}</div>
          <div className="setup__dial-row">
            <button
              type="button"
              className="tap round round--lg"
              aria-label="Decrease target"
              onClick={() => stepTarget(-1)}
            >
              −
            </button>
            <div className="setup__dial-value">{targetValue(piece)}</div>
            <button
              type="button"
              className="tap round round--lg"
              aria-label="Increase target"
              onClick={() => stepTarget(1)}
            >
              +
            </button>
          </div>
          <div className="setup__dial-hint">{targetHint(piece)}</div>
        </section>

        <div className="setup__side">
          <div className="panel panel--r14 setup__split">
            <div className="kicker">Target split</div>
            <div className="setup__split-row">
              <button
                type="button"
                className="tap round round--sm"
                aria-label="Faster target split"
                onClick={() => stepSplit(-1)}
              >
                −
              </button>
              <div className="setup__split-value">{fmtSplit(piece.targetSplit)}</div>
              <button
                type="button"
                className="tap round round--sm"
                aria-label="Slower target split"
                onClick={() => stepSplit(1)}
              >
                +
              </button>
            </div>
          </div>

          <div className="panel panel--r14 setting">
            <div>
              <div className="setting__name">Pace boat</div>
              <div className="setting__sub">Race a ghost at target split</div>
            </div>
            <Toggle on={paceBoat} label="Pace boat" onClick={togglePaceBoat} />
          </div>

          <div className="panel panel--r14 setting">
            <div>
              <div className="setting__name">Heart rate belt</div>
              <div className="setting__sub">
                {piece.heartRate ? 'ANT+ chest strap · battery 78%' : 'Not in use'}
              </div>
            </div>
            <Toggle on={piece.heartRate} label="Heart rate belt" onClick={toggleHeartRate} />
          </div>

          <div className="spacer" />

          <button type="button" className="tap btn-primary-lg" onClick={() => startPiece()}>
            Ready · sit at the catch
          </button>
        </div>
      </div>
    </div>
  )
}
