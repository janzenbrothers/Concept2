import { SonarRings } from '../components/ValleyBackdrop'
import { devices } from '../data/fixtures'
import { useApp } from '../state/context'

export function PairScreen() {
  const { go } = useApp()

  return (
    <div className="screen screen--dark pair">
      <div className="pair__scan">
        <SonarRings className="pair__sonar" />
        <div className="pair__ring" />
        <div className="pair__ring pair__ring--delayed" />
        <div className="pair__target">PM5</div>
        <div className="pair__headline">Looking for your erg</div>
        <div className="pair__hint">Wake the monitor and pull the handle once</div>
      </div>

      <div className="pair__list">
        <h3 className="screen__title">Nearby monitors</h3>
        <div className="pair__list-note">Bluetooth · scanning</div>
        <div className="pair__devices">
          {devices.map((device) => (
            <button
              type="button"
              key={device.name}
              className={'tap pair__device' + (device.connected ? ' is-connected' : '')}
              onClick={() => go('home')}
            >
              <span className="pair__device-main">
                <span className="pair__device-name">{device.name}</span>
                <span className="pair__device-meta">{device.meta}</span>
              </span>
              <span className="pair__device-state">{device.state}</span>
            </button>
          ))}
        </div>
        <div className="spacer" />
        <p className="pair__footnote">
          Once paired, the tablet remembers this erg and reconnects the moment you sit down.
        </p>
        <button type="button" className="tap btn-primary-lg btn-primary-lg--sm" onClick={() => go('home')}>
          Done
        </button>
      </div>
    </div>
  )
}
