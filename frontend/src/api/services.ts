import { apiRequest } from './client'
import type {
  AcademyEvent,
  AttendanceEntry,
  AttendanceSummaryResponse,
  CreateMemberPayload,
  Member,
  MemberListResponse,
  MemberLoginResponse,
  MemberRole,
  Payment,
  Student,
  UpdateMemberPayload,
} from './types'

export function loginMember(payload: { email: string; password: string }) {
  return apiRequest<MemberLoginResponse>('/auth/login', { method: 'POST', body: payload })
}

export function listMembers(params: {
  page: number
  pageSize: number
  search: string
  role: 'All' | MemberRole
}) {
  const q = new URLSearchParams({
    page: String(params.page),
    pageSize: String(params.pageSize),
    search: params.search,
    role: params.role,
  }).toString()
  return apiRequest<MemberListResponse>(`/members?${q}`)
}

export function createMember(payload: CreateMemberPayload) {
  return apiRequest<Member>('/members', { method: 'POST', body: payload })
}

export function updateMember(id: number, payload: UpdateMemberPayload) {
  return apiRequest<Member>(`/members/${id}`, { method: 'PUT', body: payload })
}

export function listStudents() {
  return apiRequest<Student[]>('/students')
}

export function createStudent(payload: Omit<Student, 'id'>) {
  return apiRequest<Student>('/students', { method: 'POST', body: payload })
}

export function updateStudent(id: number, payload: Omit<Student, 'id'>) {
  return apiRequest<Student>(`/students/${id}`, { method: 'PUT', body: payload })
}

export function deleteStudent(id: number) {
  return apiRequest<void>(`/students/${id}`, { method: 'DELETE' })
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
