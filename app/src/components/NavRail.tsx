import { useApp } from '../state/context'
import type { ScreenId } from '../state/context'

const ITEMS: { label: string; screen: ScreenId }[] = [
  { label: 'Home', screen: 'home' },
  { label: 'Row', screen: 'setup' },
  { label: 'Trend', screen: 'progress' },
  { label: 'Plan', screen: 'plan' },
  { label: 'You', screen: 'settings' },
]

export function NavRail() {
  const { screen, go } = useApp()

  return (
    <nav className="rail" aria-label="Main">
      <div className="rail__logo">
        <div className="rail__mark" />
      </div>
      {ITEMS.map((item) => (
        <button
          key={item.screen}
          type="button"
          className={'tap rail__item' + (screen === item.screen ? ' is-active' : '')}
          aria-current={screen === item.screen ? 'page' : undefined}
          onClick={() => go(item.screen)}
        >
          {item.label}
        </button>
      ))}
      <div className="rail__spacer" />
      <button type="button" className="tap rail__erg" onClick={() => go('pair')}>
        <span className="rail__erg-dot" />
        <span className="rail__erg-label">Bay 3</span>
      </button>
    </nav>
  )
}
