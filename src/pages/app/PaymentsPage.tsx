import {
  ActionIcon,
  Badge,
  Card,
  Group,
  Pagination,
  ScrollArea,
  Select,
  Table,
  Text,
  TextInput,
  Title,
} from '@mantine/core'
import { IconFileInvoice, IconSearch } from '@tabler/icons-react'
import { useMemo, useState } from 'react'

type Payment = {
  id: string
  student: string
  paymentMode: 'UPI' | 'Cash' | 'Card' | 'Bank Transfer'
  amount: number
  paymentDate: string
  receipt: string
}

const payments: Payment[] = [
  { id: 'P1001', student: 'Aarav Sharma', paymentMode: 'UPI', amount: 2500, paymentDate: '2026-04-01', receipt: 'RCPT-2026-001' },
  { id: 'P1002', student: 'Diya Nair', paymentMode: 'Cash', amount: 2500, paymentDate: '2026-04-02', receipt: 'RCPT-2026-002' },
  { id: 'P1003', student: 'Kiran Reddy', paymentMode: 'Card', amount: 3000, paymentDate: '2026-04-03', receipt: 'RCPT-2026-003' },
  { id: 'P1004', student: 'Ananya Iyer', paymentMode: 'UPI', amount: 2500, paymentDate: '2026-04-04', receipt: 'RCPT-2026-004' },
  { id: 'P1005', student: 'Rahul Singh', paymentMode: 'Bank Transfer', amount: 3200, paymentDate: '2026-04-05', receipt: 'RCPT-2026-005' },
  { id: 'P1006', student: 'Isha Menon', paymentMode: 'Cash', amount: 2500, paymentDate: '2026-04-06', receipt: 'RCPT-2026-006' },
  { id: 'P1007', student: 'Arjun Patel', paymentMode: 'UPI', amount: 2700, paymentDate: '2026-04-08', receipt: 'RCPT-2026-007' },
  { id: 'P1008', student: 'Nisha Kapoor', paymentMode: 'Card', amount: 3500, paymentDate: '2026-04-10', receipt: 'RCPT-2026-008' },
  { id: 'P1009', student: 'Veda Joshi', paymentMode: 'UPI', amount: 2500, paymentDate: '2026-04-12', receipt: 'RCPT-2026-009' },
  { id: 'P1010', student: 'Kabir Khan', paymentMode: 'Bank Transfer', amount: 2800, paymentDate: '2026-04-14', receipt: 'RCPT-2026-010' },
]

const pageSize = 5

function paymentModeColor(mode: Payment['paymentMode']) {
  switch (mode) {
    case 'UPI':
      return 'siaSky'
    case 'Cash':
      return 'yellow'
    case 'Card':
      return 'grape'
    default:
      return 'teal'
  }
}

export function PaymentsPage() {
  const [search, setSearch] = useState('')
  const [modeFilter, setModeFilter] = useState<string | null>('All')
  const [page, setPage] = useState(1)

  const filteredPayments = useMemo(() => {
    const query = search.trim().toLowerCase()
    return payments.filter((payment) => {
      const matchesMode =
        modeFilter === 'All' || !modeFilter ? true : payment.paymentMode === modeFilter
      const matchesSearch =
        query.length === 0
          ? true
          : [payment.student, payment.receipt, payment.paymentDate]
              .join(' ')
              .toLowerCase()
              .includes(query)

      return matchesMode && matchesSearch
    })
  }, [search, modeFilter])

  const totalPages = Math.max(1, Math.ceil(filteredPayments.length / pageSize))
  const safePage = Math.min(page, totalPages)
  const paginatedPayments = filteredPayments.slice(
    (safePage - 1) * pageSize,
    safePage * pageSize,
  )

  return (
    <Card withBorder radius="md" p={{ base: 'sm', sm: 'lg' }}>
      <Group justify="space-between" mb="md" wrap="wrap" gap="sm">
        <Title order={3}>Payments</Title>
        <Text size="sm" c="dimmed">
          {filteredPayments.length} records
        </Text>
      </Group>

      <Group mb="md" grow align="flex-end" wrap="wrap">
        <TextInput
          label="Search"
          placeholder="Search by student, receipt, date"
          leftSection={<IconSearch size={16} />}
          value={search}
          onChange={(event) => {
            setSearch(event.currentTarget.value)
            setPage(1)
          }}
          w={{ base: '100%', sm: 'auto' }}
        />
        <Select
          label="Payment mode"
          data={['All', 'UPI', 'Cash', 'Card', 'Bank Transfer']}
          value={modeFilter}
          onChange={(value) => {
            setModeFilter(value)
            setPage(1)
          }}
          allowDeselect={false}
          w={{ base: '100%', sm: 240 }}
        />
      </Group>

      <ScrollArea>
        <Table striped highlightOnHover withTableBorder withColumnBorders miw={900}>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Student</Table.Th>
              <Table.Th>Payment Mode</Table.Th>
              <Table.Th>Amount</Table.Th>
              <Table.Th>Payment Date</Table.Th>
              <Table.Th>Receipt</Table.Th>
              <Table.Th>Actions</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {paginatedPayments.map((payment) => (
              <Table.Tr key={payment.id}>
                <Table.Td>{payment.student}</Table.Td>
                <Table.Td>
                  <Badge variant="light" color={paymentModeColor(payment.paymentMode)}>
                    {payment.paymentMode}
                  </Badge>
                </Table.Td>
                <Table.Td>Rs. {payment.amount.toLocaleString('en-IN')}</Table.Td>
                <Table.Td>{payment.paymentDate}</Table.Td>
                <Table.Td>{payment.receipt}</Table.Td>
                <Table.Td>
                  <ActionIcon variant="light" color="siaSky" aria-label="View receipt">
                    <IconFileInvoice size={16} />
                  </ActionIcon>
                </Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      </ScrollArea>

      <Group justify="space-between" mt="md" wrap="wrap" gap="sm">
        <Text size="sm" c="dimmed">
          Showing {paginatedPayments.length} of {filteredPayments.length}
        </Text>
        <Pagination total={totalPages} value={safePage} onChange={setPage} />
      </Group>
    </Card>
  )
}
