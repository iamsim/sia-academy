import { apiRequest } from './client'
import type {
  AcademyEvent,
  AttendanceEntry,
  AttendanceSummaryResponse,
  Payment,
  Student,
} from './types'

export function listStudents() {
  return apiRequest<Student[]>('/students')
}

export function createStudent(payload: Omit<Student, 'id'>) {
  return apiRequest<Student>('/students', { method: 'POST', body: payload })
}

export function listPayments() {
  return apiRequest<Payment[]>('/payments')
}

export function createPayment(payload: {
  studentId: number | null
  paymentMode: Payment['paymentMode']
  amount: number
  paymentDate: string
  receipt: string
}) {
  return apiRequest<Payment>('/payments', { method: 'POST', body: payload })
}

export function listEvents() {
  return apiRequest<AcademyEvent[]>('/events')
}

export function createEvent(payload: Omit<AcademyEvent, 'id'>) {
  return apiRequest<AcademyEvent>('/events', { method: 'POST', body: payload })
}

export function getAttendanceSummary(params: { from: string; to: string }) {
  const query = new URLSearchParams(params).toString()
  return apiRequest<AttendanceSummaryResponse>(`/attendance/summary?${query}`)
}

export function getAttendanceByDate(date: string) {
  return apiRequest<{ date: string; entries: AttendanceEntry[] }>(`/attendance/${date}`)
}

export function saveAttendanceByDate(date: string, entries: AttendanceEntry[]) {
  return apiRequest<{ ok: boolean }>(`/attendance/${date}`, {
    method: 'PUT',
    body: {
      entries: entries.map((entry) => ({
        studentId: entry.studentId,
        status: entry.status,
      })),
    },
  })
}
