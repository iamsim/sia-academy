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
import { useEffect, useState } from 'react'
import {
  getAttendanceByDate,
  getAttendanceSummary,
  saveAttendanceByDate,
} from '@/api/services'
import type { AttendanceEntry, AttendanceStatus, AttendanceSummaryRecord } from '@/api/types'

const attendancePageSize = 10

function formatDateInput(date: Date) {
  return date.toISOString().slice(0, 10)
}

function statusColor(status: AttendanceStatus) {
  if (status === 'Present') return 'teal'
  return 'red'
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

function toCheckboxValue(status: AttendanceStatus) {
  return status !== 'Absent'
}

export function AttendancePage() {
  const isMobile = useMediaQuery('(max-width: 48em)')
  const today = formatDateInput(new Date())
  const monthStart = `${today.slice(0, 8)}01`

  const [fromDate, setFromDate] = useState(monthStart)
  const [toDate, setToDate] = useState(today)
  const [selectedDate, setSelectedDate] = useState(today)
  const [statusModalOpened, setStatusModalOpened] = useState(false)
  const [takeAttendanceModalOpened, setTakeAttendanceModalOpened] = useState(false)
  const [statusEditMode, setStatusEditMode] = useState(false)
  const [page, setPage] = useState(1)
  const [records, setRecords] = useState<AttendanceSummaryRecord[]>([])
  const [todayCount, setTodayCount] = useState(0)
  const [monthCount, setMonthCount] = useState(0)
  const [loadingSummary, setLoadingSummary] = useState(true)
  const [todayDraftEntries, setTodayDraftEntries] = useState<AttendanceEntry[]>([])
  const [selectedEntries, setSelectedEntries] = useState<AttendanceEntry[]>([])
  const [editableEntries, setEditableEntries] = useState<AttendanceEntry[]>([])

  async function refreshSummary() {
    const summary = await getAttendanceSummary({ from: fromDate, to: toDate })
    setRecords(summary.records)
    setTodayCount(summary.todayCount)
    setMonthCount(summary.monthCount)
    setLoadingSummary(false)
  }

  useEffect(() => {
    let active = true
    ;(async () => {
      const summary = await getAttendanceSummary({ from: fromDate, to: toDate })
      if (!active) return
      setRecords(summary.records)
      setTodayCount(summary.todayCount)
      setMonthCount(summary.monthCount)
      setLoadingSummary(false)
    })()
    return () => {
      active = false
    }
  }, [fromDate, toDate])

  const totalPages = Math.max(1, Math.ceil(records.length / attendancePageSize))
  const safePage = Math.min(page, totalPages)
  const paginatedRecords = records.slice(
    (safePage - 1) * attendancePageSize,
    safePage * attendancePageSize,
  )

  return (
    <Stack gap="lg">
      <Title order={3}>Attendance</Title>
      <Group justify="flex-end">
        <Button
          onClick={async () => {
            setSelectedDate(today)
            const response = await getAttendanceByDate(today)
            setTodayDraftEntries(response.entries)
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
            {records.length} day records
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
              {loadingSummary && (
                <Table.Tr>
                  <Table.Td colSpan={4}>Loading attendance...</Table.Td>
                </Table.Tr>
              )}
              {paginatedRecords.map((record) => (
                <Table.Tr
                  key={record.date}
                  onClick={async () => {
                    setSelectedDate(record.date)
                    const response = await getAttendanceByDate(record.date)
                    setSelectedEntries(response.entries)
                    setEditableEntries(response.entries)
                    setStatusEditMode(false)
                    setStatusModalOpened(true)
                  }}
                  style={{ cursor: 'pointer' }}
                >
                  <Table.Td>
                    <Text fw={record.date === selectedDate ? 700 : 500}>{record.date}</Text>
                  </Table.Td>
                  <Table.Td>{formatDateWithDay(record.date).split(',')[0]}</Table.Td>
                  <Table.Td>{record.attendanceCount}</Table.Td>
                  <Table.Td>{record.totalStudents}</Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        </ScrollArea>
        <Group justify="space-between" mt="md" wrap="wrap" gap="sm">
          <Text size="sm" c="dimmed">
            Showing {paginatedRecords.length} of {records.length}
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
              key={entry.studentId}
              checked={toCheckboxValue(entry.status)}
              label={entry.studentName}
              onChange={(event) => {
                const nextStatus: AttendanceStatus = event.currentTarget.checked
                  ? 'Present'
                  : 'Absent'
                const next = todayDraftEntries.map((item) =>
                  item.studentId === entry.studentId
                    ? {
                        ...item,
                        status: nextStatus,
                      }
                    : item,
                )
                setTodayDraftEntries(next)
              }}
            />
          ))}
        </Stack>
        <Group justify="flex-end" mt="md">
          <Button variant="default" onClick={() => setTakeAttendanceModalOpened(false)}>
            Cancel
          </Button>
          <Button
            onClick={async () => {
              await saveAttendanceByDate(today, todayDraftEntries)
              await refreshSummary()
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
                  onClick={async () => {
                    await saveAttendanceByDate(selectedDate, editableEntries)
                    setSelectedEntries(editableEntries)
                    await refreshSummary()
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
                key={`${selectedDate}-${entry.studentId}`}
                checked={toCheckboxValue(entry.status)}
                label={entry.studentName}
                onChange={(event) => {
                  const nextStatus: AttendanceStatus = event.currentTarget.checked
                    ? 'Present'
                    : 'Absent'
                  setEditableEntries((prev) =>
                    prev.map((item) =>
                      item.studentId === entry.studentId ? { ...item, status: nextStatus } : item,
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
                {selectedEntries.map((entry) => (
                  <Table.Tr key={`${selectedDate}-${entry.studentId}`}>
                    <Table.Td>{entry.studentName}</Table.Td>
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
