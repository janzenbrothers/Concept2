import { Pill } from '../components/controls'
import {
  personalRecords,
  rangeTotalMetres,
  weeklyDistance,
  weeklyDistanceMax,
} from '../data/fixtures'
import { fmtLongDistanceWhole } from '../lib/format'
import { useApp } from '../state/context'
import type { RangeId } from '../state/context'

const RANGES: RangeId[] = ['4 weeks', '12 weeks', 'Season']
const MONTHS = ['Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug']

export function ProgressScreen() {
  const { range, setRange, units } = useApp()

  return (
    <div className="screen screen--pad">
      <div className="row-between row-between--end">
        <h3 className="screen__title">Progress</h3>
        <div className="progress__ranges">
          {RANGES.map((id) => (
            <Pill key={id} label={id} active={range === id} onClick={() => setRange(id)} />
          ))}
        </div>
      </div>

      <section className="panel-deep panel--r16 progress__volume">
        <div className="row-between row-between--baseline">
          <div className="kicker kicker--on-deep">Weekly distance</div>
          <div className="progress__total num">{fmtLongDistanceWhole(rangeTotalMetres, units)}</div>
        </div>
        <div className="progress__bars">
          {weeklyDistance.map((value, i) => (
            <div className="bar-col" key={i}>
              <div
                className={'bar bar--r9' + (i === weeklyDistance.length - 1 ? ' bar--accent' : '')}
                style={{ height: Math.round((value / weeklyDistanceMax) * 150) + 'px' }}
              />
              <div className="progress__bar-label">
                {i === weeklyDistance.length - 1 ? 'now' : 'w' + (i + 1)}
              </div>
            </div>
          ))}
        </div>
      </section>

      <div className="progress__body">
        <section className="panel panel--r16 progress__trend">
          <div className="row-between row-between--baseline">
            <h4 className="section-title">Average split trend</h4>
            <div className="progress__trend-note">4.1 s faster than March</div>
          </div>
          <div className="progress__trend-plot">
            <svg viewBox="0 0 640 180" preserveAspectRatio="none" aria-hidden="true">
              <g stroke="color-mix(in srgb, var(--color-text) 10%, transparent)" strokeWidth="1">
                <line x1="0" y1="45" x2="640" y2="45" />
                <line x1="0" y1="90" x2="640" y2="90" />
                <line x1="0" y1="135" x2="640" y2="135" />
              </g>
              <path
                d="M0 42 C 90 58 130 36 210 66 S 350 104 430 96 S 560 128 640 140"
                fill="none"
                stroke="var(--color-accent)"
                strokeWidth="4"
                strokeLinecap="round"
              />
              <path
                d="M0 42 C 90 58 130 36 210 66 S 350 104 430 96 S 560 128 640 140 L640 180 L0 180Z"
                fill="var(--color-accent)"
                opacity="0.12"
              />
            </svg>
          </div>
          <div className="progress__months">
            {MONTHS.map((month) => (
              <div key={month}>{month}</div>
            ))}
          </div>
        </section>

        <section className="panel panel--r16 progress__prs">
          <h4 className="section-title progress__prs-title">Personal records</h4>
          {personalRecords.map((record) => (
            <div className="progress__pr" key={record.name}>
              <div>
                <div className="progress__pr-name">{record.name}</div>
                <div className="progress__pr-when">{record.when}</div>
              </div>
              <div className="progress__pr-value num">{record.value}</div>
            </div>
          ))}
        </section>
      </div>
    </div>
  )
}
