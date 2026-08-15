import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { SimulatedErg } from '../erg/simulatedErg'
import {
  goalMeters,
  idleTelemetry,
  legMeters,
  type ErgTelemetry,
  type PieceConfig,
  type PieceType,
} from '../erg/types'
import { fmtSplit, type UnitId } from '../lib/format'
import {
  AppContext,
  type AppValue,
  type LiveMode,
  type RangeId,
  type ScreenId,
  type SettingKey,
} from './context'

const INITIAL_PIECE: PieceConfig = {
  type: 'Time',
  distance: 5000,
  intervalDistance: 500,
  minutes: 40,
  targetSplit: 126,
  heartRate: true,
  reps: 4,
  rest: 180,
}

/** Beats per minute above which the belt alert fires. */
const HR_ALERT = 172
/** How long the handle may rest, in erg seconds, before auto pause stops the
 *  clock. Measured on the monitor's own clock rather than the wall clock, so
 *  the two time bases can never disagree. */
const AUTO_PAUSE_SECONDS = 4

export function AppProvider({ children }: { children: ReactNode }) {
  const [screen, setScreen] = useState<ScreenId>('home')
  const [piece, setPiece] = useState<PieceConfig>(INITIAL_PIECE)
  const [paceBoat, setPaceBoat] = useState(true)
  const [range, setRange] = useState<RangeId>('12 weeks')
  const [units, setUnits] = useState<UnitId>('Metres')
  const [autoPause, setAutoPause] = useState(true)
  const [voice, setVoice] = useState(false)
  const [strapAlert, setStrapAlert] = useState(true)
  const [liveMode, setLiveMode] = useState<LiveMode>('numbers')

  const [running, setRunning] = useState(false)
  const [started, setStarted] = useState(false)
  const [autoPaused, setAutoPaused] = useState(false)
  const [finishedAt, setFinishedAt] = useState<Date | null>(null)
  const [telemetry, setTelemetry] = useState<ErgTelemetry>(() => idleTelemetry(INITIAL_PIECE))

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
    setTelemetry(idleTelemetry(piece))
  }, [started, piece])

  const go = useCallback((next: ScreenId) => setScreen(next), [])

  const setType = useCallback((type: PieceType) => setPiece((p) => ({ ...p, type })), [])

  const configure = useCallback(
    (patch: Partial<PieceConfig>) => setPiece((p) => ({ ...p, ...patch })),
    [],
  )

  const stepTarget = useCallback(
    (direction: 1 | -1) =>
      setPiece((p) => {
        if (p.type === 'Time') return { ...p, minutes: Math.max(5, p.minutes + direction * 5) }
        // Intervals step in hundreds, whole pieces in five hundreds.
        if (p.type === 'Intervals') {
          return { ...p, intervalDistance: Math.max(100, p.intervalDistance + direction * 100) }
        }
        return { ...p, distance: Math.max(500, p.distance + direction * 500) }
      }),
    [],
  )

  const stepSplit = useCallback(
    (direction: 1 | -1) =>
      setPiece((p) => ({ ...p, targetSplit: Math.max(60, p.targetSplit + direction) })),
    [],
  )

  const stepReps = useCallback(
    (direction: 1 | -1) =>
      setPiece((p) => ({ ...p, reps: Math.min(20, Math.max(2, p.reps + direction)) })),
    [],
  )

  const stepRest = useCallback(
    (direction: 1 | -1) =>
      setPiece((p) => ({ ...p, rest: Math.min(600, Math.max(30, p.rest + direction * 30)) })),
    [],
  )

  const togglePaceBoat = useCallback(() => setPaceBoat((v) => !v), [])
  const toggleHeartRate = useCallback(
    () => setPiece((p) => ({ ...p, heartRate: !p.heartRate })),
    [],
  )

  const spokenSplits = useRef(0)
  const handleRest = useRef({ count: 0, at: 0 })

  const startPiece = useCallback(
    (overrides?: Partial<PieceConfig>) => {
      const next = overrides ? { ...piece, ...overrides } : piece
      spokenSplits.current = 0
      handleRest.current = { count: 0, at: 0 }
      setPiece(next)
      erg.start(next)
      setStarted(true)
      setRunning(true)
      setAutoPaused(false)
      setFinishedAt(null)
      setLiveMode('numbers')
      setScreen('live')
    },
    [erg, piece],
  )

  const togglePause = useCallback(() => {
    if (running) {
      erg.pause()
      setRunning(false)
    } else {
      erg.resume()
      setRunning(true)
      setAutoPaused(false)
      handleRest.current = { count: telemetry.strokeCount, at: telemetry.elapsed }
    }
  }, [erg, running, telemetry.strokeCount, telemetry.elapsed])

  const finish = useCallback(() => {
    erg.stop()
    setRunning(false)
    setAutoPaused(false)
    setFinishedAt(new Date())
    setScreen('summary')
  }, [erg])

  const discard = useCallback(() => {
    erg.stop()
    setRunning(false)
    setStarted(false)
    setScreen('home')
  }, [erg])

  // The monitor ends the piece itself when the target is reached.
  useEffect(() => {
    if (telemetry.finished && screen === 'live') finish()
  }, [telemetry.finished, screen, finish])

  // Auto pause: the clock stops when the handle has been still for a few
  // seconds. A programmed rest is not the handle going idle — the watch is
  // held open through it, or the first tick of the next interval trips it.
  useEffect(() => {
    if (!running || !autoPause) return
    const watch = handleRest.current
    if (telemetry.phase === 'rest' || telemetry.strokeCount !== watch.count) {
      watch.count = telemetry.strokeCount
      watch.at = telemetry.elapsed
      return
    }
    if (telemetry.elapsed - watch.at > AUTO_PAUSE_SECONDS) {
      erg.pause()
      setRunning(false)
      setAutoPaused(true)
    }
  }, [telemetry.strokeCount, telemetry.elapsed, telemetry.phase, running, autoPause, erg])

  // Voice calls: split and distance read out at every 500 m.
  useEffect(() => {
    if (!voice || !started) return
    const done = telemetry.splits.length
    if (done <= spokenSplits.current) return
    spokenSplits.current = done
    const last = telemetry.splits[done - 1]
    const speech = window.speechSynthesis
    if (!speech) return
    speech.speak(
      new SpeechSynthesisUtterance(
        `${Math.round(telemetry.distance)} metres. Split ${fmtSplit(last.split).replace(':', ' ')}.`,
      ),
    )
  }, [telemetry.splits.length, telemetry.distance, telemetry.splits, voice, started])

  const heartRateAlert =
    strapAlert && telemetry.heartRate !== null && telemetry.heartRate > HR_ALERT

  // Leaving the summary — saved or discarded — clears the piece from the deck.
  useEffect(() => {
    if (started && !running && (screen === 'home' || screen === 'setup')) {
      setStarted(false)
    }
  }, [screen, started, running])

  const toggleSetting = useCallback((key: SettingKey) => {
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
      leg: legMeters(piece),
      paceBoat,
      setType,
      configure,
      stepTarget,
      stepSplit,
      stepReps,
      stepRest,
      togglePaceBoat,
      toggleHeartRate,
      telemetry,
      running,
      started,
      autoPaused,
      heartRateAlert,
      finishedAt,
      startPiece,
      togglePause,
      finish,
      discard,
      liveMode,
      setLiveMode,
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
      stepReps,
      stepRest,
      togglePaceBoat,
      toggleHeartRate,
      telemetry,
      running,
      started,
      autoPaused,
      heartRateAlert,
      finishedAt,
      startPiece,
      togglePause,
      finish,
      discard,
      liveMode,
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
