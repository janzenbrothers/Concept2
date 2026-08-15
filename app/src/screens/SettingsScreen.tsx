import { Pill, SettingRow } from '../components/controls'
import { profile } from '../data/fixtures'
import { useApp } from '../state/context'
import type { UnitId } from '../state/context'

const UNITS: UnitId[] = ['Metres', 'Miles']

export function SettingsScreen() {
  const {
    autoPause,
    voice,
    strapAlert,
    toggleSetting,
    paceBoat,
    togglePaceBoat,
    units,
    setUnits,
  } = useApp()

  return (
    <div className="screen screen--pad">
      <h3 className="screen__title">Profile &amp; settings</h3>

      <div className="settings__body">
        <section className="panel panel--r16 profile">
          <div className="profile__avatar">{profile.initial}</div>
          <div className="profile__name">{profile.name}</div>
          <div className="profile__meta">{profile.meta}</div>
          <div className="tag-row tag-row--wrap">
            <span className="tag tag-accent">{profile.logged}</span>
            <span className="tag tag-accent-2">{profile.since}</span>
          </div>
          <div className="spacer" />
          <button type="button" className="tap btn-quiet btn-quiet--block">
            Edit profile
          </button>
        </section>

        <div className="settings__list">
          <SettingRow
            name="Auto pause"
            sub="Stop the clock when the handle rests"
            on={autoPause}
            onToggle={() => toggleSetting('autoPause')}
          />
          <SettingRow
            name="Voice calls"
            sub="Split and distance read out every 500 m"
            on={voice}
            onToggle={() => toggleSetting('voice')}
          />
          <SettingRow
            name="Heart rate alerts"
            sub="Warn above 172 bpm"
            on={strapAlert}
            onToggle={() => toggleSetting('strapAlert')}
          />
          <SettingRow
            name="Pace boat by default"
            sub="Every piece starts with a ghost"
            on={paceBoat}
            onToggle={togglePaceBoat}
          />

          <div className="panel panel--r12 setting">
            <div>
              <div className="setting__name">Units</div>
              <div className="setting__sub">Distance and pace display</div>
            </div>
            <div className="settings__units">
              {UNITS.map((unit) => (
                <Pill
                  key={unit}
                  label={unit}
                  active={units === unit}
                  onClick={() => setUnits(unit)}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
