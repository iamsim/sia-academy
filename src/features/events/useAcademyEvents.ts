import { useSyncExternalStore } from 'react'

export type AcademyEvent = {
  id: string
  eventName: string
  place: string
  date: string
  time: string
  description: string
}

const storageKey = 'sia-academy-events'

const defaultEvents: AcademyEvent[] = [
  {
    id: 'E001',
    eventName: 'Spring open day',
    place: 'SIA Academy Main Dojang',
    date: '2026-05-10',
    time: '09:30',
    description: 'Tour the dojang, meet instructors, and attend a beginner-friendly Taekwondo session.',
  },
  {
    id: 'E002',
    eventName: 'Colour belt grading',
    place: 'SIA Academy Hall A',
    date: '2026-05-24',
    time: '10:00',
    description: 'Quarterly grading for eligible students. Please arrive 30 minutes early for check-in.',
  },
  {
    id: 'E003',
    eventName: 'Poomsae workshop',
    place: 'City Sports Complex',
    date: '2026-06-07',
    time: '08:00',
    description: 'Half-day technical workshop focused on poomsae rhythm, precision, and presentation.',
  },
]

function readEvents(): AcademyEvent[] {
  try {
    const raw = localStorage.getItem(storageKey)
    if (!raw) return defaultEvents
    const parsed = JSON.parse(raw) as unknown
    if (!Array.isArray(parsed)) return defaultEvents
    return parsed.filter(
      (event): event is AcademyEvent =>
        Boolean(event) &&
        typeof event === 'object' &&
        'id' in event &&
        'eventName' in event &&
        'place' in event &&
        'date' in event &&
        'time' in event &&
        'description' in event,
    )
  } catch {
    return defaultEvents
  }
}

let eventsMemory: AcademyEvent[] = readEvents()
const listeners = new Set<() => void>()

function emit() {
  listeners.forEach((listener) => listener())
}

function persist(nextEvents: AcademyEvent[]) {
  eventsMemory = nextEvents
  localStorage.setItem(storageKey, JSON.stringify(nextEvents))
  emit()
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

function getSnapshot() {
  return eventsMemory
}

export function addAcademyEvent(
  eventInput: Omit<AcademyEvent, 'id'>,
): AcademyEvent {
  const maxId = eventsMemory.reduce((max, event) => {
    const numeric = Number(event.id.replace('E', ''))
    return Number.isNaN(numeric) ? max : Math.max(max, numeric)
  }, 0)
  const nextEvent: AcademyEvent = {
    ...eventInput,
    id: `E${String(maxId + 1).padStart(3, '0')}`,
  }
  persist([nextEvent, ...eventsMemory])
  return nextEvent
}

export function useAcademyEvents() {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot)
}
