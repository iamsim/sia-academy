/**
 * Formats stored event time (24h `HH:mm` or `HH:mm:ss`) for display as 12-hour with AM/PM.
 */
export function formatEventTime12h(time: string): string {
  const raw = time.trim()
  if (!raw) return '—'

  const match = /^(\d{1,2}):(\d{2})(?::\d{2})?$/.exec(raw)
  if (!match) return raw

  const h = Number(match[1])
  const m = Number(match[2])
  if (!Number.isFinite(h) || !Number.isFinite(m) || m < 0 || m > 59 || h < 0 || h > 23) {
    return raw
  }

  const period = h >= 12 ? 'PM' : 'AM'
  const hour12 = h % 12 === 0 ? 12 : h % 12
  const mm = String(m).padStart(2, '0')
  return `${hour12}:${mm} ${period}`
}
