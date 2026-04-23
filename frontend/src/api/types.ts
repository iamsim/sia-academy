export type Student = {
  id: number
  name: string
  age: number
  belt: string
  fatherName: string
  motherName: string
  address: string
  primaryContactNumber: string
}

export type Payment = {
  id: number
  studentId: number | null
  studentName: string | null
  paymentMode: 'UPI' | 'Cash' | 'Card' | 'Bank Transfer'
  amount: number
  paymentDate: string
  receipt: string
}

export type AcademyEvent = {
  id: number
  eventName: string
  place: string
  date: string
  time: string
  description: string
}

export type AttendanceStatus = 'Present' | 'Absent'

export type AttendanceEntry = {
  studentId: number
  studentName: string
  status: AttendanceStatus
}

export type AttendanceSummaryRecord = {
  date: string
  attendanceCount: number
  totalStudents: number
}

export type AttendanceSummaryResponse = {
  todayCount: number
  monthCount: number
  totalStudents: number
  records: AttendanceSummaryRecord[]
}

export type MemberRole = 'Admin' | 'Instructor' | 'Member'

export type Member = {
  id: number
  email: string
  displayName: string
  phone: string | null
  role: MemberRole
  isActive: boolean
}

export type MemberListResponse = {
  items: Member[]
  total: number
  page: number
  pageSize: number
}

export type MemberLoginResponse = {
  email: string
  displayName: string
}

export type CreateMemberPayload = {
  email: string
  displayName: string
  phone: string | null
  role: MemberRole
  isActive: boolean
  password: string
}

export type UpdateMemberPayload = {
  email: string
  displayName: string
  phone: string | null
  role: MemberRole
  isActive: boolean
  /** Omit or leave empty to keep the current password. */
  password?: string
}
