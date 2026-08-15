import { coachNote, splitByFiveHundred } from '../data/fixtures'
import { fmtInt, fmtSplit, fmtTime } from '../lib/format'
import { useApp } from '../state/context'

export function SummaryScreen() {
  const { piece, telemetry, go } = useApp()

  const stats = [
    { label: 'Distance', value: fmtInt(Math.max(1, telemetry.distance)) + ' m', deep: true },
    { label: 'Time', value: fmtTime(Math.max(1, telemetry.elapsed)) },
    { label: 'Avg split', value: fmtSplit(piece.targetSplit + 0.6) },
    { label: 'Avg rate', value: '21 spm' },
  ]

  return (
    <div className="screen screen--pad">
      <div className="row-between row-between--end">
        <div>
          <div className="eyebrow eyebrow--accent">Piece complete · 06:52</div>
          <h2 className="summary__title">Nicely rowed.</h2>
        </div>
        <span className="tag tag-accent-2">Second best 5 km this season</span>
      </div>

      <div className="summary__stats">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className={
              (stat.deep ? 'panel-deep' : 'panel') + ' panel--r14 summary__stat'
            }
          >
            <div className={'kicker' + (stat.deep ? ' kicker--on-deep' : '')}>{stat.label}</div>
            <div className="summary__stat-value">{stat.value}</div>
          </div>
        ))}
      </div>

      <div className="summary__body">
        <section className="panel panel--r16 summary__chart">
          <div className="row-between row-between--baseline">
            <h4 className="section-title">Split by 500 m</h4>
            <div className="screen__note screen__note--sm">Lower is faster</div>
          </div>
          <div className="summary__bars">
            {splitByFiveHundred.map((value, i) => (
              <div className="bar-col" key={i}>
                <div className="summary__bar-value">{fmtSplit(value)}</div>
                <div
                  className={'bar bar--r10' + (value <= piece.targetSplit ? ' bar--river' : ' bar--sand')}
                  style={{ height: Math.round(30 + (value - 118) * 14) + 'px' }}
                />
                <div className="summary__bar-label">{(i + 1) * 500}</div>
              </div>
            ))}
          </div>
        </section>

        <div className="summary__side">
          <div className="panel panel--r14 summary__note">
            <div className="kicker">Coach note</div>
            <p className="summary__note-copy">{coachNote}</p>
            <div className="tag-row">
              <span className="tag tag-neutral">Cal 412</span>
              <span className="tag tag-neutral">Avg HR 148</span>
              <span className="tag tag-neutral">Drag 118</span>
            </div>
          </div>
          <button type="button" className="tap btn-primary-lg btn-primary-lg--md" onClick={() => go('home')}>
            Save to log
          </button>
          <button type="button" className="tap btn-quiet" onClick={() => go('home')}>
            Discard
          </button>
        </div>
      </div>
    </div>
  )
}
