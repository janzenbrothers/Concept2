import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { SimulatedErg } from '../erg/simulatedErg'
import { goalMeters, idleTelemetry, type ErgTelemetry, type PieceConfig, type PieceType } from '../erg/types'
import { AppContext, type AppValue, type RangeId, type ScreenId, type UnitId } from './context'

const INITIAL_PIECE: PieceConfig = {
  type: 'Time',
  distance: 5000,
  minutes: 40,
  targetSplit: 126,
  heartRate: true,
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [screen, setScreen] = useState<ScreenId>('home')
  const [piece, setPiece] = useState<PieceConfig>(INITIAL_PIECE)
  const [paceBoat, setPaceBoat] = useState(true)
  const [range, setRange] = useState<RangeId>('12 weeks')
  const [units, setUnits] = useState<UnitId>('Metres')
  const [autoPause, setAutoPause] = useState(true)
  const [voice, setVoice] = useState(false)
  const [strapAlert, setStrapAlert] = useState(true)

  const [running, setRunning] = useState(false)
  const [started, setStarted] = useState(false)
  const [telemetry, setTelemetry] = useState<ErgTelemetry>(() =>
    idleTelemetry(INITIAL_PIECE.targetSplit, INITIAL_PIECE.heartRate),
  )

  const ergRef = useRef<SimulatedErg | null>(null)
  if (ergRef.current === null) ergRef.current = new SimulatedErg()
  const erg = ergRef.current

  useEffect(() => {
    const unsubscribe = erg.subscribe(setTelemetry)
    return () => {
      unsubscribe()
      erg.stop()
    }
  }, [erg])

  // Before the handle moves the readout sits at the configured target, so the
  // live screen previews the pace you asked for rather than a stale number.
  useEffect(() => {
    if (started) return
    setTelemetry(idleTelemetry(piece.targetSplit, piece.heartRate))
  }, [started, piece.targetSplit, piece.heartRate])

  const go = useCallback((next: ScreenId) => setScreen(next), [])

  const setType = useCallback((type: PieceType) => setPiece((p) => ({ ...p, type })), [])

  const configure = useCallback(
    (patch: Partial<PieceConfig>) => setPiece((p) => ({ ...p, ...patch })),
    [],
  )

  const stepTarget = useCallback(
    (direction: 1 | -1) =>
      setPiece((p) =>
        p.type === 'Distance'
          ? { ...p, distance: Math.max(500, p.distance + direction * 500) }
          : { ...p, minutes: Math.max(5, p.minutes + direction * 5) },
      ),
    [],
  )

  const stepSplit = useCallback(
    (direction: 1 | -1) =>
      setPiece((p) => ({ ...p, targetSplit: Math.max(60, p.targetSplit + direction) })),
    [],
  )

  const togglePaceBoat = useCallback(() => setPaceBoat((v) => !v), [])
  const toggleHeartRate = useCallback(
    () => setPiece((p) => ({ ...p, heartRate: !p.heartRate })),
    [],
  )

  const startPiece = useCallback(
    (overrides?: Partial<PieceConfig>) => {
      const next = overrides ? { ...piece, ...overrides } : piece
      setPiece(next)
      erg.start(next)
      setStarted(true)
      setRunning(true)
      setScreen('live')
    },
    [erg, piece],
  )

  const togglePause = useCallback(() => {
    if (running) erg.pause()
    else erg.resume()
    setRunning(!running)
  }, [erg, running])

  const finish = useCallback(() => {
    erg.stop()
    setRunning(false)
    setScreen('summary')
  }, [erg])

  // Leaving the summary — saved or discarded — clears the piece from the deck.
  useEffect(() => {
    if (started && !running && (screen === 'home' || screen === 'setup')) {
      setStarted(false)
    }
  }, [screen, started, running])

  const toggleSetting = useCallback((key: 'autoPause' | 'voice' | 'strapAlert') => {
    if (key === 'autoPause') setAutoPause((v) => !v)
    else if (key === 'voice') setVoice((v) => !v)
    else setStrapAlert((v) => !v)
  }, [])

  const value = useMemo<AppValue>(
    () => ({
      screen,
      go,
      piece,
      goal: goalMeters(piece),
      paceBoat,
      setType,
      configure,
      stepTarget,
      stepSplit,
      togglePaceBoat,
      toggleHeartRate,
      telemetry,
      running,
      started,
      startPiece,
      togglePause,
      finish,
      range,
      setRange,
      units,
      setUnits,
      autoPause,
      voice,
      strapAlert,
      toggleSetting,
    }),
    [
      screen,
      go,
      piece,
      paceBoat,
      setType,
      configure,
      stepTarget,
      stepSplit,
      togglePaceBoat,
      toggleHeartRate,
      telemetry,
      running,
      started,
      startPiece,
      togglePause,
      finish,
      range,
      units,
      autoPause,
      voice,
      strapAlert,
      toggleSetting,
    ],
  )

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}
