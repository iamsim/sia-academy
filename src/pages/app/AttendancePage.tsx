import {
  Badge,
  Button,
  Card,
  Checkbox,
  Divider,
  Grid,
  Group,
  Modal,
  Pagination,
  ScrollArea,
  Stack,
  Table,
  Text,
  TextInput,
  Title,
} from '@mantine/core'
import { useMediaQuery } from '@mantine/hooks'
import { useMemo, useState } from 'react'

type AttendanceStatus = 'Present' | 'Absent'

type StudentAttendance = {
  student: string
  status: AttendanceStatus
}

type AttendanceDayRecord = {
  date: string
  entries: StudentAttendance[]
}

const studentNames = [
  'Aarav Sharma',
  'Diya Nair',
  'Kiran Reddy',
  'Ananya Iyer',
  'Rahul Singh',
  'Isha Menon',
  'Arjun Patel',
  'Nisha Kapoor',
  'Veda Joshi',
  'Kabir Khan',
  'Riya Das',
  'Yash Verma',
] as const

function formatDateInput(date: Date) {
  return date.toISOString().slice(0, 10)
}

function statusFor(studentIndex: number, dayIndex: number): AttendanceStatus {
  const score = (studentIndex * 13 + dayIndex * 7) % 10
  if (score <= 8) return 'Present'
  return 'Absent'
}

function generateAttendanceData(days: number): AttendanceDayRecord[] {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const records: AttendanceDayRecord[] = []
  for (let i = 0; i < days; i += 1) {
    const date = new Date(today)
    date.setDate(today.getDate() - i)
    const dateStr = formatDateInput(date)
    records.push({
      date: dateStr,
      entries: studentNames.map((student, idx) => ({
        student,
        status: statusFor(idx, i),
      })),
    })
  }
  return records
}

const attendanceRecords = generateAttendanceData(90)
const attendancePageSize = 10
const submittedAttendanceStoragePrefix = 'sia-academy-attendance-submitted-'
const attendanceDraftStoragePrefix = 'sia-academy-attendance-draft-'

function statusColor(status: AttendanceStatus) {
  if (status === 'Present') return 'teal'
  return 'red'
}

function presentCount(record: AttendanceDayRecord) {
  return record.entries.filter((entry) => entry.status !== 'Absent').length
}

function formatDateWithDay(date: string) {
  const value = new Date(`${date}T00:00:00`)
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: '2-digit',
  }).format(value)
}

function normalizeEntries(entries: StudentAttendance[]) {
  const statusByStudent = new Map(entries.map((entry) => [entry.student, entry.status]))
  return studentNames.map((student) => ({
    student,
    status: statusByStudent.get(student) ?? 'Absent',
  })) satisfies StudentAttendance[]
}

function readStoredEntries(storageKey: string) {
  try {
    const raw = localStorage.getItem(storageKey)
    if (!raw) return null
    const parsed = JSON.parse(raw) as StudentAttendance[]
    if (!Array.isArray(parsed)) return null
    const valid = parsed.filter(
      (item) =>
        item &&
        typeof item === 'object' &&
        typeof item.student === 'string' &&
        (item.status === 'Present' || item.status === 'Absent'),
    )
    if (valid.length === 0) return null
    return normalizeEntries(valid)
  } catch {
    return null
  }
}

export function AttendancePage() {
  const isMobile = useMediaQuery('(max-width: 48em)')
  const today = formatDateInput(new Date())
  const monthStart = `${today.slice(0, 8)}01`
  const todaySubmittedStorageKey = `${submittedAttendanceStoragePrefix}${today}`
  const todayDraftStorageKey = `${attendanceDraftStoragePrefix}${today}`

  const defaultTodayEntries = useMemo(() => {
    return attendanceRecords.find((record) => record.date === today)?.entries ?? []
  }, [today])

  const [fromDate, setFromDate] = useState(monthStart)
  const [toDate, setToDate] = useState(today)
  const [selectedDate, setSelectedDate] = useState(today)
  const [statusModalOpened, setStatusModalOpened] = useState(false)
  const [takeAttendanceModalOpened, setTakeAttendanceModalOpened] = useState(false)
  const [statusEditMode, setStatusEditMode] = useState(false)
  const [page, setPage] = useState(1)
  const [submittedOverrides, setSubmittedOverrides] = useState<
    Record<string, StudentAttendance[]>
  >(() => {
    const todayStored = readStoredEntries(todaySubmittedStorageKey)
    return todayStored ? { [today]: todayStored } : {}
  })
  const [todayDraftEntries, setTodayDraftEntries] = useState<StudentAttendance[]>(() => {
    const draftStored = readStoredEntries(todayDraftStorageKey)
    if (draftStored) return draftStored
    const todayStored = readStoredEntries(todaySubmittedStorageKey)
    if (todayStored) return todayStored
    return normalizeEntries(defaultTodayEntries)
  })
  const [editableEntries, setEditableEntries] = useState<StudentAttendance[]>([])

  const byDate = useMemo(() => {
    return new Map(attendanceRecords.map((record) => [record.date, record]))
  }, [])

  function getSubmittedEntriesForDate(date: string) {
    const fromState = submittedOverrides[date]
    if (fromState) return fromState
    return readStoredEntries(`${submittedAttendanceStoragePrefix}${date}`)
  }

  function persistSubmittedEntriesForDate(date: string, nextEntries: StudentAttendance[]) {
    const normalized = normalizeEntries(nextEntries)
    localStorage.setItem(
      `${submittedAttendanceStoragePrefix}${date}`,
      JSON.stringify(normalized),
    )
    setSubmittedOverrides((prev) => ({ ...prev, [date]: normalized }))
    if (date === today) {
      setTodayDraftEntries(normalized)
      localStorage.setItem(todayDraftStorageKey, JSON.stringify(normalized))
    }
  }

  function getRecordForDate(date: string) {
    const submitted = getSubmittedEntriesForDate(date)
    if (submitted) {
      return { date, entries: submitted } satisfies AttendanceDayRecord
    }
    return byDate.get(date)
  }

  const todayRecord = getRecordForDate(today)
  const todayCount = todayRecord ? presentCount(todayRecord) : 0

  const monthCount = useMemo(() => {
    const currentMonth = today.slice(0, 7)
    const resolveRecord = (date: string) => {
      const submitted = submittedOverrides[date] ?? readStoredEntries(`${submittedAttendanceStoragePrefix}${date}`)
      if (submitted) return { date, entries: submitted } satisfies AttendanceDayRecord
      return byDate.get(date)
    }
    return attendanceRecords
      .map((record) => resolveRecord(record.date) ?? record)
      .filter((record) => record.date.startsWith(currentMonth))
      .reduce((sum, record) => sum + presentCount(record), 0)
  }, [today, submittedOverrides, byDate])

  const filteredRecords = useMemo(() => {
    const resolveRecord = (date: string) => {
      const submitted = submittedOverrides[date] ?? readStoredEntries(`${submittedAttendanceStoragePrefix}${date}`)
      if (submitted) return { date, entries: submitted } satisfies AttendanceDayRecord
      return byDate.get(date)
    }
    return attendanceRecords
      .map((record) => resolveRecord(record.date) ?? record)
      .filter((record) => record.date >= fromDate && record.date <= toDate)
      .sort((a, b) => b.date.localeCompare(a.date))
  }, [fromDate, toDate, submittedOverrides, byDate])

  const totalPages = Math.max(1, Math.ceil(filteredRecords.length / attendancePageSize))
  const safePage = Math.min(page, totalPages)
  const paginatedRecords = filteredRecords.slice(
    (safePage - 1) * attendancePageSize,
    safePage * attendancePageSize,
  )

  const selectedRecord = getRecordForDate(selectedDate)

  return (
    <Stack gap="lg">
      <Title order={3}>Attendance</Title>
      <Group justify="flex-end">
        <Button
          onClick={() => {
            setSelectedDate(today)
            const latestDraft =
              readStoredEntries(todayDraftStorageKey) ??
              getSubmittedEntriesForDate(today) ??
              normalizeEntries(defaultTodayEntries)
            setTodayDraftEntries(latestDraft)
            setTakeAttendanceModalOpened(true)
          }}
        >
          Take Attendance for Today
        </Button>
      </Group>

      <Grid>
        <Grid.Col span={{ base: 12, md: 6 }}>
          <Card withBorder radius="md" p={{ base: 'sm', sm: 'lg' }}>
            <Text size="sm" c="dimmed" mb={4}>
              Today's attendance count
            </Text>
            <Text fw={700} fz={32} lh={1.1}>
              {todayCount}
            </Text>
            <Text size="sm" c="dimmed">
              Date: {formatDateWithDay(today)}
            </Text>
          </Card>
        </Grid.Col>
        <Grid.Col span={{ base: 12, md: 6 }}>
          <Card withBorder radius="md" p={{ base: 'sm', sm: 'lg' }}>
            <Text size="sm" c="dimmed" mb={4}>
              Current month attendance count
            </Text>
            <Text fw={700} fz={32} lh={1.1}>
              {monthCount}
            </Text>
            <Text size="sm" c="dimmed">
              Month: {today.slice(0, 7)}
            </Text>
          </Card>
        </Grid.Col>
      </Grid>

      <Card withBorder radius="md" p={{ base: 'sm', sm: 'lg' }}>
        <Group align="flex-end" gap="md" wrap="wrap" mb="md">
          <TextInput
            label="From date"
            type="date"
            value={fromDate}
            onChange={(event) => {
              setFromDate(event.currentTarget.value)
              setPage(1)
            }}
            w={{ base: '100%', sm: 'auto' }}
          />
          <TextInput
            label="To date"
            type="date"
            value={toDate}
            onChange={(event) => {
              setToDate(event.currentTarget.value)
              setPage(1)
            }}
            w={{ base: '100%', sm: 'auto' }}
          />
          <Text size="sm" c="dimmed" pb={4}>
            {filteredRecords.length} day records
          </Text>
        </Group>

        <ScrollArea>
          <Table striped highlightOnHover withTableBorder withColumnBorders>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Date</Table.Th>
                <Table.Th>Day</Table.Th>
                <Table.Th>Attendance Count</Table.Th>
                <Table.Th>Total Students</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {paginatedRecords.map((record) => (
                <Table.Tr
                  key={record.date}
                  onClick={() => {
                    setSelectedDate(record.date)
                    setEditableEntries(normalizeEntries(record.entries))
                    setStatusEditMode(false)
                    setStatusModalOpened(true)
                  }}
                  style={{ cursor: 'pointer' }}
                >
                  <Table.Td>
                    <Text fw={record.date === selectedDate ? 700 : 500}>{record.date}</Text>
                  </Table.Td>
                  <Table.Td>{formatDateWithDay(record.date).split(',')[0]}</Table.Td>
                  <Table.Td>{presentCount(record)}</Table.Td>
                  <Table.Td>{record.entries.length}</Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        </ScrollArea>
        <Group justify="space-between" mt="md" wrap="wrap" gap="sm">
          <Text size="sm" c="dimmed">
            Showing {paginatedRecords.length} of {filteredRecords.length}
          </Text>
          <Pagination total={totalPages} value={safePage} onChange={setPage} />
        </Group>
      </Card>

      <Modal
        opened={takeAttendanceModalOpened}
        onClose={() => setTakeAttendanceModalOpened(false)}
        size="lg"
        title={`Take Attendance - ${formatDateWithDay(today)}`}
        centered
        fullScreen={isMobile}
      >
        <Text size="sm" c="dimmed" mb="sm">
          Check to mark present, then click submit to mark attendance for today.
        </Text>
        <Divider mb="md" />
        <Stack gap="xs">
          {todayDraftEntries.map((entry) => (
            <Checkbox
              key={entry.student}
              checked={entry.status !== 'Absent'}
              label={entry.student}
              onChange={(event) => {
                const nextStatus: AttendanceStatus = event.currentTarget.checked
                  ? 'Present'
                  : 'Absent'
                const next = todayDraftEntries.map((item) =>
                  item.student === entry.student
                    ? {
                        ...item,
                        status: nextStatus,
                      }
                    : item,
                )
                const normalized = normalizeEntries(next)
                setTodayDraftEntries(normalized)
                localStorage.setItem(todayDraftStorageKey, JSON.stringify(normalized))
              }}
            />
          ))}
        </Stack>
        <Group justify="flex-end" mt="md">
          <Button variant="default" onClick={() => setTakeAttendanceModalOpened(false)}>
            Cancel
          </Button>
          <Button
            onClick={() => {
              persistSubmittedEntriesForDate(today, todayDraftEntries)
              setTakeAttendanceModalOpened(false)
            }}
          >
            Submit Attendance
          </Button>
        </Group>
      </Modal>

      <Modal
        opened={statusModalOpened}
        onClose={() => setStatusModalOpened(false)}
        size="lg"
        title={`Student status for ${formatDateWithDay(selectedDate)}`}
        centered
        fullScreen={isMobile}
      >
        <Group justify="space-between" mb="md">
          <Text size="sm" c="dimmed">
            Attendance detail for selected date
          </Text>
          <Group gap="xs">
            {statusEditMode ? (
              <>
                <Button size="xs" variant="default" onClick={() => setStatusEditMode(false)}>
                  Cancel
                </Button>
                <Button
                  size="xs"
                  onClick={() => {
                    persistSubmittedEntriesForDate(selectedDate, editableEntries)
                    setStatusEditMode(false)
                  }}
                >
                  Save changes
                </Button>
              </>
            ) : (
              <Button size="xs" onClick={() => setStatusEditMode(true)}>
                Edit
              </Button>
            )}
          </Group>
        </Group>

        {statusEditMode ? (
          <Stack gap="xs">
            {editableEntries.map((entry) => (
              <Checkbox
                key={`${selectedDate}-${entry.student}`}
                checked={entry.status !== 'Absent'}
                label={entry.student}
                onChange={(event) => {
                  const nextStatus: AttendanceStatus = event.currentTarget.checked
                    ? 'Present'
                    : 'Absent'
                  setEditableEntries((prev) =>
                    prev.map((item) =>
                      item.student === entry.student ? { ...item, status: nextStatus } : item,
                    ),
                  )
                }}
              />
            ))}
          </Stack>
        ) : (
          <ScrollArea>
            <Table striped highlightOnHover withTableBorder withColumnBorders>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Student</Table.Th>
                  <Table.Th>Status</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {(selectedRecord?.entries ?? []).map((entry) => (
                  <Table.Tr key={`${selectedDate}-${entry.student}`}>
                    <Table.Td>{entry.student}</Table.Td>
                    <Table.Td>
                      <Badge variant="light" color={statusColor(entry.status)}>
                        {entry.status}
                      </Badge>
                    </Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          </ScrollArea>
        )}
      </Modal>
    </Stack>
  )
}
