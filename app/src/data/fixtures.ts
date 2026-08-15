/** Sample content for the eight screens. This is the demo log the design was
 *  drawn against — swap it for the real training history when the log lands. */

export interface RecentPiece {
  day: string
  name: string
  distance: string
  time: string
  split: string
}

export const recentPieces: RecentPiece[] = [
  { day: 'Tue', name: '5,000 m steady', distance: '5,000 m', time: '20:31', split: '2:03.1' },
  { day: 'Mon', name: '8 × 250 sprints', distance: '2,000 m', time: '7:48', split: '1:57.0' },
  { day: 'Sun', name: 'Long paddle', distance: '10,021 m', time: '44:02', split: '2:11.8' },
  { day: 'Fri', name: '2,000 m test', distance: '2,000 m', time: '7:04.2', split: '1:46.0' },
]

/** Bar heights in design px, oldest first, alongside the weekday initial. */
export const weekBars = [
  { height: 46, label: 'F' },
  { height: 22, label: 'S' },
  { height: 104, label: 'S' },
  { height: 38, label: 'M' },
  { height: 62, label: 'T' },
  { height: 8, label: 'W' },
  { height: 30, label: 'T' },
]

export const weekTotals = { distance: '24.6 km', sessions: '5 sessions' }

export const seasonGoal = {
  done: 412,
  target: 1000,
  copy: 'On pace for late October. Four sessions a week keeps you ahead of the water.',
}

/** Kilometres per week for the trend panel; the last entry is the week in progress. */
export const weeklyDistance = [18, 34, 26, 41, 12, 38, 46, 31, 22, 44, 36, 24.6]
export const weeklyDistanceMax = 50
export const rangeTotal = '382 km'

/** Average split, in seconds per 500 m, for each 500 m of the last piece. */
export const splitByFiveHundred = [124, 122.5, 123.4, 125.1, 126.8, 127.2, 126.4, 125, 123.2, 121.6]

export const coachNote =
  'You faded about 1.5 seconds in the middle thousand, then found it again. Next steady piece, try holding rate at 20 the whole way rather than chasing the split.'

export interface PersonalRecord {
  name: string
  when: string
  value: string
}

export const personalRecords: PersonalRecord[] = [
  { name: '2,000 m', when: '8 Aug', value: '7:04.2' },
  { name: '500 m', when: '21 Jul', value: '1:38.4' },
  { name: '5,000 m', when: '2 Aug', value: '19:58' },
  { name: '30 min', when: '14 Jun', value: '7,402 m' },
  { name: '10,000 m', when: '10 Aug', value: '43:11' },
]

export type PlanDayTone = 'done' | 'rest' | 'today' | 'suggested'

export interface PlanDay {
  day: string
  title: string
  sub: string
  tone: PlanDayTone
}

export const planWeek: PlanDay[] = [
  { day: 'Mon', title: 'Sprints', sub: 'done · 2 km', tone: 'done' },
  { day: 'Tue', title: '5 km steady', sub: 'done · 20:31', tone: 'done' },
  { day: 'Wed', title: 'Rest', sub: 'taken', tone: 'rest' },
  { day: 'Thu', title: '40 min steady', sub: 'today', tone: 'today' },
  { day: 'Fri', title: 'Easy 20', sub: 'suggested', tone: 'suggested' },
  { day: 'Sat', title: '6 × 400', sub: 'suggested', tone: 'suggested' },
  { day: 'Sun', title: 'Long paddle', sub: '10 km', tone: 'suggested' },
]

export const suggestion = {
  kicker: 'Suggested today · you rowed hard Tuesday',
  title: '40 min steady · 2:06 split',
  short: 'An easy aerobic paddle to keep the week balanced. Sit at 20 spm and let the legs do the work.',
  long:
    "Tuesday's sprints put you 18% above your usual weekly load, so today stays aerobic. If the legs feel heavy after ten minutes, drop to 2:10 and keep the rate low.",
  minutes: 40,
}

export interface PairedDevice {
  name: string
  meta: string
  state: string
  connected: boolean
}

export const devices: PairedDevice[] = [
  { name: 'PM5 · 430912', meta: 'Bay 3 · signal strong', state: 'Connected', connected: true },
  { name: 'PM5 · 118773', meta: 'Bay 1 · signal fair', state: 'Pair', connected: false },
  { name: 'HR belt · Dana', meta: 'ANT+ · battery 78%', state: 'Paired', connected: false },
]

export const profile = {
  initial: 'D',
  name: 'Dana Holt',
  meta: '72 kg · 34 · lightweight',
  logged: '411 km logged',
  since: 'Since Feb 2025',
}

export const greeting = {
  conditions: 'Friday 14 August · 06:12 · 14°C, still water',
  hello: 'Morning, Dana',
  streak: '11 days',
}
