import { createContext, useContext } from 'react'
import type { ErgTelemetry, PieceConfig, PieceType } from '../erg/types'

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
export type UnitId = 'Metres' | 'Miles'

export interface AppValue {
  screen: ScreenId
  go: (screen: ScreenId) => void

  /** The piece as currently configured on the setup screen. */
  piece: PieceConfig
  /** Metres the piece is aiming at, or 0 when open-ended. */
  goal: number
  paceBoat: boolean

  setType: (type: PieceType) => void
  /** Patch the piece — used by the home screen's quick tiles. */
  configure: (patch: Partial<PieceConfig>) => void
  /** Step the headline target up or down — metres or minutes, per piece type. */
  stepTarget: (direction: 1 | -1) => void
  stepSplit: (direction: 1 | -1) => void
  togglePaceBoat: () => void
  toggleHeartRate: () => void

  /** Live readout from the erg. */
  telemetry: ErgTelemetry
  running: boolean
  /** True once a piece has been started, until it is saved or discarded. */
  started: boolean
  startPiece: (overrides?: Partial<PieceConfig>) => void
  togglePause: () => void
  finish: () => void

  range: RangeId
  setRange: (range: RangeId) => void
  units: UnitId
  setUnits: (units: UnitId) => void
  autoPause: boolean
  voice: boolean
  strapAlert: boolean
  toggleSetting: (key: 'autoPause' | 'voice' | 'strapAlert') => void
}

export const AppContext = createContext<AppValue | null>(null)

export function useApp(): AppValue {
  const value = useContext(AppContext)
  if (!value) throw new Error('useApp must be used inside <AppProvider>')
  return value
}
