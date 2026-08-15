/** Formatting helpers. Every number that can reach four digits is grouped with
 *  commas — distances, metre counts and goals alike. */

export type UnitId = 'Metres' | 'Miles'

const METRES_PER_MILE = 1609.344

const pad = (n: number) => (n < 10 ? '0' + n : '' + n)

/** A pace, as seconds per 500 m, rendered `m:ss.s` — e.g. 126 -> "2:06.0". */
export function fmtSplit(seconds: number): string {
  if (!Number.isFinite(seconds)) return '—'
  const m = Math.floor(seconds / 60)
  const r = seconds - m * 60
  return m + ':' + (r < 10 ? '0' : '') + r.toFixed(1)
}

/** A duration, as seconds, rendered `m:ss`. Hours are shown when they turn up. */
export function fmtTime(seconds: number): string {
  if (!Number.isFinite(seconds)) return '—'
  const whole = Math.floor(seconds)
  const h = Math.floor(whole / 3600)
  const m = Math.floor((whole - h * 3600) / 60)
  const s = whole - h * 3600 - m * 60
  return h > 0 ? `${h}:${pad(m)}:${pad(s)}` : `${m}:${pad(s)}`
}

/** A whole number with thousands separators — e.g. 10021 -> "10,021". */
export function fmtInt(value: number): string {
  return Math.round(value).toLocaleString('en-US')
}

/** Time of day as the monitor shows it — e.g. "06:52". */
export function fmtClock(date: Date): string {
  return pad(date.getHours()) + ':' + pad(date.getMinutes())
}

/** e.g. "Friday 14 August". */
export function fmtDate(date: Date): string {
  return date.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })
}

/** The bare distance reading and its unit, kept apart so a screen can size them
 *  separately — the live screen sets the number at 172 px and the unit at 15. */
export function distanceParts(metres: number, units: UnitId): { value: string; unit: string } {
  if (units === 'Miles') {
    const miles = metres / METRES_PER_MILE
    return { value: miles.toFixed(miles < 10 ? 2 : 1), unit: miles === 1 ? 'mile' : 'miles' }
  }
  return { value: fmtInt(metres), unit: 'metres' }
}

/** Distance with its unit attached — e.g. "5,000 m" or "3.11 mi". */
export function fmtDistance(metres: number, units: UnitId): string {
  if (units === 'Miles') {
    const miles = metres / METRES_PER_MILE
    return miles.toFixed(miles < 10 ? 2 : 1) + ' mi'
  }
  return fmtInt(metres) + ' m'
}

/** Long distances, where kilometres read better than five digits of metres. */
export function fmtLongDistance(metres: number, units: UnitId): string {
  if (units === 'Miles') return (metres / METRES_PER_MILE).toFixed(1) + ' mi'
  return (metres / 1000).toFixed(1) + ' km'
}

/** Whole-number long distances, for goals and totals — "412 km" / "256 mi". */
export function fmtLongDistanceWhole(metres: number, units: UnitId): string {
  if (units === 'Miles') return fmtInt(metres / METRES_PER_MILE) + ' mi'
  return fmtInt(metres / 1000) + ' km'
}
