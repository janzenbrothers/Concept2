import { planWeek, suggestion } from '../data/fixtures'
import { useApp } from '../state/context'

export function PlanScreen() {
  const { go, startPiece } = useApp()

  return (
    <div className="screen screen--pad">
      <div className="row-between row-between--end">
        <h3 className="screen__title">Adaptive plan</h3>
        <div className="screen__note">Rebuilt each morning from your last ten pieces</div>
      </div>

      <div className="plan__body">
        <div className="plan__left">
          <section className="plan__today">
            <div className="plan__today-orb" />
            <div className="kicker kicker--on-accent plan__stack">Today</div>
            <div className="plan__today-title plan__stack">{suggestion.title}</div>
            <p className="plan__today-copy plan__stack">{suggestion.long}</p>
            <div className="plan__today-actions plan__stack">
              <button
                type="button"
                className="tap plan__start"
                onClick={() => startPiece({ type: 'Time', minutes: suggestion.minutes })}
              >
                Start
              </button>
              <button type="button" className="tap plan__swap" onClick={() => go('setup')}>
                Swap for something else
              </button>
            </div>
          </section>

          <section className="panel panel--r16 plan__week">
            <h4 className="section-title plan__week-title">This week, as it stands</h4>
            <div className="plan__days">
              {planWeek.map((day) => (
                <div className={`plan__day plan__day--${day.tone}`} key={day.day}>
                  <div className="plan__day-name">{day.day}</div>
                  <div className="plan__day-title">{day.title}</div>
                  <div className="plan__day-sub">{day.sub}</div>
                </div>
              ))}
            </div>
          </section>
        </div>

        <div className="plan__side">
          <section className="panel-deep panel--r14 plan__load">
            <div className="kicker kicker--on-deep">Training load</div>
            <div className="plan__load-value">Slightly high</div>
            <div className="meter meter--on-deep">
              <div className="meter__fill meter__fill--accent" style={{ width: '72%' }} />
            </div>
            <p className="plan__load-copy">
              Two easy days will bring this back to the green band by Sunday.
            </p>
          </section>

          <section className="panel panel--r14 plan__target">
            <div className="kicker">Working toward</div>
            <div className="plan__target-value">Sub 7:00 · 2,000 m</div>
            <p className="plan__target-copy">
              Current best 7:04.2. At your rate of improvement, mid-October is realistic.
            </p>
            <div className="meter meter--wide">
              <div className="meter__fill" style={{ width: '78%' }} />
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
