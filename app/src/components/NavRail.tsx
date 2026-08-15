import type { ComponentType } from 'react'
import { HomeIcon, LinkIcon, PlanIcon, RowIcon, TrendIcon, YouIcon } from './icons'
import { useApp } from '../state/context'
import type { ScreenId } from '../state/context'

const ITEMS: { label: string; screen: ScreenId; Icon: ComponentType<{ className?: string }> }[] = [
  { label: 'Home', screen: 'home', Icon: HomeIcon },
  { label: 'Row', screen: 'setup', Icon: RowIcon },
  { label: 'Trend', screen: 'progress', Icon: TrendIcon },
  { label: 'Plan', screen: 'plan', Icon: PlanIcon },
  { label: 'You', screen: 'settings', Icon: YouIcon },
]

export function NavRail() {
  const { screen, go } = useApp()

  return (
    <nav className="rail" aria-label="Main">
      <div className="rail__logo">
        <div className="rail__mark" />
      </div>
      {ITEMS.map(({ label, screen: id, Icon }) => (
        <button
          key={id}
          type="button"
          className={'tap rail__item' + (screen === id ? ' is-active' : '')}
          aria-current={screen === id ? 'page' : undefined}
          onClick={() => go(id)}
        >
          <Icon className="rail__icon" />
          <span className="rail__label">{label}</span>
        </button>
      ))}
      <div className="rail__spacer" />
      <button type="button" className="tap rail__erg" onClick={() => go('pair')}>
        <span className="rail__erg-head">
          <LinkIcon className="rail__erg-icon" />
          <span className="rail__erg-dot" />
        </span>
        <span className="rail__erg-label">Bay 3</span>
      </button>
    </nav>
  )
}
