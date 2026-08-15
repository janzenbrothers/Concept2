import { createContext, useContext } from 'react'
import type { ErgTelemetry, PieceConfig, PieceType } from '../erg/types'
import type { UnitId } from '../lib/format'

export type ScreenId =
  | 'home'
  | 'setup'
  | 'live'
  | 'summary'
  | 'progress'
  | 'plan'
  | 'pair'
  | 'settings'

export type RangeId = '4 weeks' | '12 weeks' | 'Season'

/** The live screen's display modes, in swipe order. */
export type LiveMode = 'numbers' | 'pace' | 'splits' | 'force'

export type SettingKey = 'autoPause' | 'voice' | 'strapAlert'

export interface AppValue {
  screen: ScreenId
  go: (screen: ScreenId) => void

  /** The piece as currently configured on the setup screen. */
  piece: PieceConfig
  /** Metres the whole piece is aiming at, or 0 when open-ended. */
  goal: number
  /** Metres one rep is aiming at — the whole piece unless it has intervals. */
  leg: number
  paceBoat: boolean

  setType: (type: PieceType) => void
  /** Patch the piece — used by the home screen's quick tiles. */
  configure: (patch: Partial<PieceConfig>) => void
  /** Step the headline target up or down — metres or minutes, per piece type. */
  stepTarget: (direction: 1 | -1) => void
  stepSplit: (direction: 1 | -1) => void
  stepReps: (direction: 1 | -1) => void
  stepRest: (direction: 1 | -1) => void
  togglePaceBoat: () => void
  toggleHeartRate: () => void

  /** Live readout from the erg. */
  telemetry: ErgTelemetry
  running: boolean
  /** True once a piece has been started, until it is saved or discarded. */
  started: boolean
  /** Set when the clock stopped itself because the handle came to rest. */
  autoPaused: boolean
  /** Set while the belt is reading above the alert threshold. */
  heartRateAlert: boolean
  /** When the piece finished, for the summary's timestamp. */
  finishedAt: Date | null
  startPiece: (overrides?: Partial<PieceConfig>) => void
  togglePause: () => void
  finish: () => void
  discard: () => void

  liveMode: LiveMode
  setLiveMode: (mode: LiveMode) => void

  range: RangeId
  setRange: (range: RangeId) => void
  units: UnitId
  setUnits: (units: UnitId) => void
  autoPause: boolean
  voice: boolean
  strapAlert: boolean
  toggleSetting: (key: SettingKey) => void
}

export const AppContext = createContext<AppValue | null>(null)

export function useApp(): AppValue {
  const value = useContext(AppContext)
  if (!value) throw new Error('useApp must be used inside <AppProvider>')
  return value
}
