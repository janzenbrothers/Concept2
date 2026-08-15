import { Pill, Toggle } from '../components/controls'
import { WakeLinesInk } from '../components/ValleyBackdrop'
import { targetRate, type PieceConfig, type PieceType } from '../erg/types'
import { fmtDistance, fmtInt, fmtSplit, fmtTime } from '../lib/format'
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
  if (piece.type === 'Intervals') return fmtInt(piece.intervalDistance)
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
  if (piece.type === 'Intervals') {
    const work = (piece.intervalDistance / 500) * piece.targetSplit
    const total = piece.reps * work + (piece.reps - 1) * piece.rest
    return `${piece.reps} × ${fmtInt(piece.intervalDistance)} m · about ${fmtTime(total)} including rest`
  }
  return 'Row until you stop'
}

export function SetupScreen() {
  const {
    piece,
    setType,
    stepTarget,
    stepSplit,
    stepReps,
    stepRest,
    paceBoat,
    togglePaceBoat,
    toggleHeartRate,
    startPiece,
    units,
  } = useApp()
  const intervals = piece.type === 'Intervals'

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
              disabled={piece.type === 'Just row'}
              onClick={() => stepTarget(-1)}
            >
              −
            </button>
            <div className="setup__dial-value num">{targetValue(piece)}</div>
            <button
              type="button"
              className="tap round round--lg"
              aria-label="Increase target"
              disabled={piece.type === 'Just row'}
              onClick={() => stepTarget(1)}
            >
              +
            </button>
          </div>
          <div className="setup__dial-hint">{targetHint(piece)}</div>
          {piece.type !== 'Just row' && (
            <div className="setup__dial-foot">
              Target rate {targetRate(piece) - 2}–{targetRate(piece) + 2} spm
              {piece.type !== 'Intervals' && ` · ${fmtDistance(
                piece.type === 'Distance'
                  ? piece.distance
                  : (piece.minutes * 60 * 500) / piece.targetSplit,
                units,
              )}`}
            </div>
          )}
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
              <div className="setup__split-value num">{fmtSplit(piece.targetSplit)}</div>
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

          {intervals ? (
            <div className="panel panel--r14 setup__intervals">
              <div className="kicker">Reps and rest</div>
              <div className="setup__stepper-row">
                <div className="setup__stepper">
                  <button
                    type="button"
                    className="tap round round--sm"
                    aria-label="Fewer reps"
                    onClick={() => stepReps(-1)}
                  >
                    −
                  </button>
                  <div className="setup__stepper-value">
                    <div className="num">{piece.reps}</div>
                    <div className="setup__stepper-label">reps</div>
                  </div>
                  <button
                    type="button"
                    className="tap round round--sm"
                    aria-label="More reps"
                    onClick={() => stepReps(1)}
                  >
                    +
                  </button>
                </div>
                <div className="setup__stepper">
                  <button
                    type="button"
                    className="tap round round--sm"
                    aria-label="Shorter rest"
                    onClick={() => stepRest(-1)}
                  >
                    −
                  </button>
                  <div className="setup__stepper-value">
                    <div className="num">{fmtTime(piece.rest)}</div>
                    <div className="setup__stepper-label">rest</div>
                  </div>
                  <button
                    type="button"
                    className="tap round round--sm"
                    aria-label="Longer rest"
                    onClick={() => stepRest(1)}
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="panel panel--r14 setting">
              <div>
                <div className="setting__name">Pace boat</div>
                <div className="setting__sub">Race a ghost at target split</div>
              </div>
              <Toggle on={paceBoat} label="Pace boat" onClick={togglePaceBoat} />
            </div>
          )}

          <div className="panel panel--r14 setting">
            <div>
              <div className="setting__name">Heart rate belt</div>
              <div className="setting__sub">
                {piece.heartRate ? 'ANT+ chest strap · battery 78%' : 'Not in use'}
              </div>
            </div>
            <Toggle on={piece.heartRate} label="Heart rate belt" onClick={toggleHeartRate} />
          </div>

          {intervals && (
            <div className="panel panel--r14 setting">
              <div>
                <div className="setting__name">Pace boat</div>
                <div className="setting__sub">Race a ghost at target split</div>
              </div>
              <Toggle on={paceBoat} label="Pace boat" onClick={togglePaceBoat} />
            </div>
          )}

          <div className="spacer" />

          <button type="button" className="tap btn-primary-lg" onClick={() => startPiece()}>
            Ready · sit at the catch
          </button>
        </div>
      </div>
    </div>
  )
}
