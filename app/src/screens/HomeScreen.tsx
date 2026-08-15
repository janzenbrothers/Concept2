import { TopoLines } from '../components/ValleyBackdrop'
import {
  greeting,
  recentPieces,
  seasonGoal,
  suggestion,
  weekBars,
  weekTotals,
} from '../data/fixtures'
import { fmtInt } from '../lib/format'
import { useApp } from '../state/context'

const QUICK_TILES = [
  { title: 'Just row', sub: 'Open piece', patch: { type: 'Just row' } as const },
  { title: '2,000 m', sub: 'PR 7:04.2', patch: { type: 'Distance', distance: 2000 } as const },
  { title: '30:00', sub: 'Steady state', patch: { type: 'Time', minutes: 30 } as const },
  { title: '4 × 500', sub: '3:00 rest', patch: { type: 'Intervals' } as const },
]

export function HomeScreen() {
  const { go, configure, startPiece } = useApp()
  const goalPct = Math.round((seasonGoal.done / seasonGoal.target) * 100)

  return (
    <div className="screen">
      <header className="home__header">
        <TopoLines className="home__topo" />
        <div className="home__header-row">
          <div>
            <div className="eyebrow">{greeting.conditions}</div>
            <h2 className="home__greet">{greeting.hello}</h2>
          </div>
          <div className="home__streak">
            <div className="eyebrow eyebrow--tight">Streak</div>
            <div className="home__streak-value">{greeting.streak}</div>
          </div>
        </div>
      </header>

      <div className="home__body">
        <div className="home__left">
          <section className="suggest">
            <div className="suggest__orb" />
            <div className="suggest__main">
              <div className="kicker kicker--on-accent">{suggestion.kicker}</div>
              <div className="suggest__title">{suggestion.title}</div>
              <p className="suggest__copy">{suggestion.short}</p>
            </div>
            <button
              type="button"
              className="tap suggest__start"
              onClick={() => startPiece({ type: 'Time', minutes: suggestion.minutes })}
            >
              Start
            </button>
          </section>

          <div className="quick">
            {QUICK_TILES.map((tile) => (
              <button
                key={tile.title}
                type="button"
                className="tap panel panel--r12 quick__tile"
                onClick={() => {
                  configure(tile.patch)
                  go('setup')
                }}
              >
                <div className="quick__title">{tile.title}</div>
                <div className="quick__sub">{tile.sub}</div>
              </button>
            ))}
          </div>

          <section className="recent">
            <div className="row-between row-between--baseline">
              <h4 className="section-title">Recent pieces</h4>
              <button type="button" className="tap link" onClick={() => go('progress')}>
                All history
              </button>
            </div>
            <div className="panel panel--r14 recent__list">
              {recentPieces.map((piece) => (
                <button
                  key={piece.name}
                  type="button"
                  className="tap recent__row"
                  onClick={() => go('summary')}
                >
                  <span className="recent__day">{piece.day}</span>
                  <span className="recent__name">{piece.name}</span>
                  <span className="recent__num">{piece.distance}</span>
                  <span className="recent__num">{piece.time}</span>
                  <span className="recent__num recent__num--end">{piece.split}</span>
                </button>
              ))}
            </div>
          </section>
        </div>

        <div className="home__right">
          <section className="panel-deep panel--r14 week">
            <div className="kicker kicker--on-deep">Last seven days</div>
            <div className="week__bars">
              {weekBars.map((bar, i) => (
                <div className="bar-col" key={i}>
                  <div
                    className={'bar' + (i === weekBars.length - 1 ? ' bar--accent' : '')}
                    style={{ height: bar.height + 'px' }}
                  />
                  <div className="bar-label">{bar.label}</div>
                </div>
              ))}
            </div>
            <div className="week__foot">
              <div>{weekTotals.distance}</div>
              <div className="week__foot-sub">{weekTotals.sessions}</div>
            </div>
          </section>

          <section className="panel panel--r14 goal">
            <div className="kicker">Season goal</div>
            <div className="goal__value">
              {fmtInt(seasonGoal.done)}
              <span> / {fmtInt(seasonGoal.target)} km</span>
            </div>
            <div className="meter">
              <div className="meter__fill" style={{ width: goalPct + '%' }} />
            </div>
            <p className="goal__copy">{seasonGoal.copy}</p>
            <div className="spacer" />
            <div className="tag-row">
              <span className="tag tag-accent">2k PR · 7:04.2</span>
              <span className="tag tag-accent-2">Longest · 10 km</span>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
