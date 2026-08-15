/** Small shared controls: the choice pill and the on/off switch. Both are
 *  sized for a tablet at arm's length, mounted on the erg. */

export function Pill({
  label,
  active,
  size = 'sm',
  onClick,
}: {
  label: string
  active: boolean
  size?: 'sm' | 'lg'
  onClick: () => void
}) {
  return (
    <button
      type="button"
      className={`tap pill pill--${size}` + (active ? ' is-active' : '')}
      aria-pressed={active}
      onClick={onClick}
    >
      {label}
    </button>
  )
}

export function Toggle({
  on,
  label,
  onClick,
}: {
  on: boolean
  label: string
  onClick: () => void
}) {
  return (
    <button
      type="button"
      className={'tap toggle' + (on ? ' is-on' : '')}
      role="switch"
      aria-checked={on}
      aria-label={label}
      onClick={onClick}
    >
      <span className="toggle__knob" />
    </button>
  )
}

export function SettingRow({
  name,
  sub,
  on,
  onToggle,
}: {
  name: string
  sub: string
  on: boolean
  onToggle: () => void
}) {
  return (
    <div className="panel panel--r12 setting">
      <div>
        <div className="setting__name">{name}</div>
        <div className="setting__sub">{sub}</div>
      </div>
      <Toggle on={on} label={name} onClick={onToggle} />
    </div>
  )
}
