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
