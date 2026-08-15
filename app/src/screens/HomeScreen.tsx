import { useEffect, useState } from 'react'
import { TopoLines } from '../components/ValleyBackdrop'
import {
  greeting,
  recentPieces,
  seasonGoal,
  suggestion,
  weekBars,
  weekTotals,
} from '../data/fixtures'
import { fmtClock, fmtDate, fmtDistance, fmtLongDistance, fmtLongDistanceWhole } from '../lib/format'
import { useApp } from '../state/context'

const QUICK_TILES = [
  { title: 'Just row', sub: 'Open piece', patch: { type: 'Just row' } as const },
  { title: '2,000 m', sub: 'PR 7:04.2', patch: { type: 'Distance', distance: 2000 } as const },
  { title: '30:00', sub: 'Steady state', patch: { type: 'Time', minutes: 30 } as const },
  { title: '4 × 500', sub: '3:00 rest', patch: { type: 'Intervals', intervalDistance: 500, reps: 4, rest: 180 } as const },
]

/** The clock on the wall, not the clock the design was drawn at. */
function useNow(): Date {
  const [now, setNow] = useState(() => new Date())
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 30_000)
    return () => clearInterval(id)
  }, [])
  return now
}

function partOfDay(date: Date): string {
  const h = date.getHours()
  if (h < 12) return 'Morning'
  if (h < 18) return 'Afternoon'
  return 'Evening'
}

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

export function HomeScreen() {
  const { go, configure, startPiece, units } = useApp()
  const now = useNow()
  const goalPct = Math.round((seasonGoal.doneMetres / seasonGoal.targetMetres) * 100)
  // The goal runs to the end of October; the pace cell answers "how much a week".
  const seasonEnd = new Date(now.getFullYear(), 9, 31)
  const weeksLeft = Math.max(1, Math.round((seasonEnd.getTime() - now.getTime()) / 604_800_000))

  return (
    <div className="screen">
      <header className="home__header">
        <TopoLines className="home__topo" />
        <div className="home__header-row">
          <div>
            <div className="eyebrow">
              {fmtDate(now)} · {fmtClock(now)}
            </div>
            <h2 className="home__greet">{partOfDay(now)}, Dana</h2>
          </div>
          <div className="home__streak">
            <div className="eyebrow eyebrow--tight">Streak</div>
            <div className="home__streak-value num">{greeting.streak}</div>
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
              {recentPieces.map((piece) => {
                const when = new Date(now)
                when.setDate(when.getDate() - piece.daysAgo)
                return (
                  <button
                    key={piece.name}
                    type="button"
                    className="tap recent__row"
                    onClick={() => go('summary')}
                  >
                    <span className="recent__day">{DAY_NAMES[when.getDay()]}</span>
                    <span className="recent__name">{piece.name}</span>
                    <span className="recent__num num">{fmtDistance(piece.metres, units)}</span>
                    <span className="recent__num num">{piece.time}</span>
                    <span className="recent__num num recent__num--end">{piece.split}</span>
                  </button>
                )
              })}
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
              <div className="num">{fmtLongDistance(weekTotals.metres, units)}</div>
              <div className="week__foot-sub">{weekTotals.sessions}</div>
            </div>
          </section>

          <section className="panel panel--r14 goal">
            <div className="kicker">Season goal</div>
            <div className="goal__value num">
              {fmtLongDistanceWhole(seasonGoal.doneMetres, units).split(' ')[0]}
              <span> / {fmtLongDistanceWhole(seasonGoal.targetMetres, units)}</span>
            </div>
            <div className="meter">
              <div className="meter__fill" style={{ width: goalPct + '%' }} />
            </div>
            <p className="goal__copy">{seasonGoal.copy}</p>
            <div className="goal__pace">
              <div className="goal__pace-cell">
                <div className="kicker">Still to row</div>
                <div className="goal__pace-value num">
                  {fmtLongDistanceWhole(seasonGoal.targetMetres - seasonGoal.doneMetres, units)}
                </div>
              </div>
              <div className="goal__pace-cell">
                <div className="kicker">Weekly pace</div>
                <div className="goal__pace-value num">
                  {fmtLongDistance(
                    (seasonGoal.targetMetres - seasonGoal.doneMetres) / weeksLeft,
                    units,
                  )}
                </div>
              </div>
            </div>
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
