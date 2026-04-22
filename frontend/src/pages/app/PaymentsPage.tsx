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
import { useEffect, useMemo, useState } from 'react'
import { listPayments } from '@/api/services'
import type { Payment } from '@/api/types'

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
  const [payments, setPayments] = useState<Payment[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [modeFilter, setModeFilter] = useState<string | null>('All')
  const [page, setPage] = useState(1)

  useEffect(() => {
    let active = true
    ;(async () => {
      try {
        const data = await listPayments()
        if (active) setPayments(data)
      } finally {
        if (active) setLoading(false)
      }
    })()
    return () => {
      active = false
    }
  }, [])

  const filteredPayments = useMemo(() => {
    const query = search.trim().toLowerCase()
    return payments.filter((payment) => {
      const matchesMode =
        modeFilter === 'All' || !modeFilter ? true : payment.paymentMode === modeFilter
      const matchesSearch =
        query.length === 0
          ? true
          : [payment.studentName ?? '', payment.receipt, payment.paymentDate]
              .join(' ')
              .toLowerCase()
              .includes(query)

      return matchesMode && matchesSearch
    })
  }, [payments, search, modeFilter])

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
            {loading && (
              <Table.Tr>
                <Table.Td colSpan={6}>Loading payments...</Table.Td>
              </Table.Tr>
            )}
            {paginatedPayments.map((payment) => (
              <Table.Tr key={payment.id}>
                <Table.Td>{payment.studentName ?? '-'}</Table.Td>
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
