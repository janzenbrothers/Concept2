/** Formatting helpers. Every number that can reach four digits is grouped with
 *  commas — distances, metre counts and goals alike. */

const pad = (n: number) => (n < 10 ? '0' + n : '' + n)

/** A pace, as seconds per 500 m, rendered `m:ss.s` — e.g. 126 -> "2:06.0". */
export function fmtSplit(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const r = seconds - m * 60
  return m + ':' + (r < 10 ? '0' : '') + r.toFixed(1)
}

/** A duration, as seconds, rendered `m:ss` — e.g. 1231 -> "20:31". */
export function fmtTime(seconds: number): string {
  const m = Math.floor(seconds / 60)
  return m + ':' + pad(Math.floor(seconds - m * 60))
}

/** A whole number with thousands separators — e.g. 10021 -> "10,021". */
export function fmtInt(value: number): string {
  return Math.round(value).toLocaleString('en-US')
}

/** Metres, grouped and suffixed — e.g. 5000 -> "5,000 m". */
export function fmtMeters(value: number): string {
  return fmtInt(value) + ' m'
}
