import {
  ActionIcon,
  Button,
  Card,
  Group,
  Modal,
  Pagination,
  ScrollArea,
  Select,
  Stack,
  Table,
  Text,
  TextInput,
  Title,
} from '@mantine/core'
import { useMediaQuery } from '@mantine/hooks'
import { IconEdit, IconPlus, IconSearch, IconTrash } from '@tabler/icons-react'
import { useEffect, useMemo, useState } from 'react'
import { createStudent, listStudents } from '@/api/services'
import type { Student } from '@/api/types'

const pageSize = 6

export function StudentsPage() {
  const isMobile = useMediaQuery('(max-width: 48em)')
  const [students, setStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [beltFilter, setBeltFilter] = useState<string | null>('All')
  const [page, setPage] = useState(1)
  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [newStudent, setNewStudent] = useState<Omit<Student, 'id'>>({
    name: '',
    age: 0,
    belt: 'White',
    fatherName: '',
    motherName: '',
    address: '',
    primaryContactNumber: '',
  })

  useEffect(() => {
    let active = true
    ;(async () => {
      try {
        const data = await listStudents()
        if (active) setStudents(data)
      } finally {
        if (active) setLoading(false)
      }
    })()
    return () => {
      active = false
    }
  }, [])

  const filteredStudents = useMemo(() => {
    const query = search.trim().toLowerCase()
    return students.filter((student) => {
      const matchesBelt = beltFilter === 'All' || !beltFilter ? true : student.belt === beltFilter
      const matchesSearch =
        query.length === 0
          ? true
          : [
              student.name,
              student.fatherName,
              student.motherName,
              student.address,
              student.primaryContactNumber,
            ]
              .join(' ')
              .toLowerCase()
              .includes(query)

      return matchesBelt && matchesSearch
    })
  }, [students, search, beltFilter])

  const totalPages = Math.max(1, Math.ceil(filteredStudents.length / pageSize))
  const safePage = Math.min(page, totalPages)
  const paginatedStudents = filteredStudents.slice(
    (safePage - 1) * pageSize,
    safePage * pageSize,
  )

  function resetNewStudentForm() {
    setNewStudent({
      name: '',
      age: 0,
      belt: 'White',
      fatherName: '',
      motherName: '',
      address: '',
      primaryContactNumber: '',
    })
  }

  function handleAddStudent() {
    const trimmedName = newStudent.name.trim()
    const trimmedFather = newStudent.fatherName.trim()
    const trimmedMother = newStudent.motherName.trim()
    const trimmedAddress = newStudent.address.trim()
    const trimmedContact = newStudent.primaryContactNumber.trim()
    const parsedAge = Number(newStudent.age)

    if (
      !trimmedName ||
      !trimmedFather ||
      !trimmedMother ||
      !trimmedAddress ||
      !trimmedContact ||
      Number.isNaN(parsedAge) ||
      parsedAge <= 0
    ) {
      return
    }

    const nextStudent: Omit<Student, 'id'> = {
      name: trimmedName,
      age: parsedAge,
      belt: newStudent.belt,
      fatherName: trimmedFather,
      motherName: trimmedMother,
      address: trimmedAddress,
      primaryContactNumber: trimmedContact,
    }

    createStudent(nextStudent)
      .then((created) => {
        setStudents((current) => [created, ...current])
        setPage(1)
        setCreateModalOpen(false)
        resetNewStudentForm()
      })
      .catch((error) => {
        alert(error instanceof Error ? error.message : 'Failed to add student')
      })
  }

  return (
    <Card withBorder radius="md" p={{ base: 'sm', sm: 'lg' }}>
      <Group justify="space-between" mb="md" wrap="wrap" gap="sm">
        <Title order={3}>Students</Title>
        <Group gap="sm">
          <Text size="sm" c="dimmed">
            {filteredStudents.length} records
          </Text>
          <Button
            leftSection={<IconPlus size={16} />}
            onClick={() => setCreateModalOpen(true)}
          >
            Add New Student
          </Button>
        </Group>
      </Group>

      <Group mb="md" grow align="flex-end" wrap="wrap">
        <TextInput
          label="Search"
          placeholder="Search by name, parent, address, contact"
          leftSection={<IconSearch size={16} />}
          value={search}
          onChange={(event) => {
            setSearch(event.currentTarget.value)
            setPage(1)
          }}
          w={{ base: '100%', sm: 'auto' }}
        />
        <Select
          label="Belt"
          data={['All', 'White', 'Yellow', 'Green', 'Blue', 'Red', 'Black']}
          value={beltFilter}
          onChange={(value) => {
            setBeltFilter(value)
            setPage(1)
          }}
          allowDeselect={false}
          w={{ base: '100%', sm: 220 }}
        />
      </Group>

      <ScrollArea>
        <Table striped highlightOnHover withTableBorder withColumnBorders miw={1100}>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Name</Table.Th>
              <Table.Th>Age</Table.Th>
              <Table.Th>Belt</Table.Th>
              <Table.Th>Father Name</Table.Th>
              <Table.Th>Mother Name</Table.Th>
              <Table.Th>Address</Table.Th>
              <Table.Th>Primary Contact Number</Table.Th>
              <Table.Th>Actions</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {loading && (
              <Table.Tr>
                <Table.Td colSpan={8}>Loading students...</Table.Td>
              </Table.Tr>
            )}
            {paginatedStudents.map((student) => (
              <Table.Tr key={student.id}>
                <Table.Td>{student.name}</Table.Td>
                <Table.Td>{student.age}</Table.Td>
                <Table.Td>{student.belt}</Table.Td>
                <Table.Td>{student.fatherName}</Table.Td>
                <Table.Td>{student.motherName}</Table.Td>
                <Table.Td>{student.address}</Table.Td>
                <Table.Td>{student.primaryContactNumber}</Table.Td>
                <Table.Td>
                  <Group gap={6} wrap="nowrap">
                    <ActionIcon variant="light" color="siaSky" aria-label="Edit student">
                      <IconEdit size={16} />
                    </ActionIcon>
                    <ActionIcon variant="light" color="red" aria-label="Delete student">
                      <IconTrash size={16} />
                    </ActionIcon>
                  </Group>
                </Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      </ScrollArea>

      <Group justify="space-between" mt="md" wrap="wrap" gap="sm">
        <Text size="sm" c="dimmed">
          Showing {paginatedStudents.length} of {filteredStudents.length}
        </Text>
        <Pagination total={totalPages} value={safePage} onChange={setPage} />
      </Group>

      <Modal
        opened={createModalOpen}
        onClose={() => {
          setCreateModalOpen(false)
          resetNewStudentForm()
        }}
        title="Add New Student"
        centered
        fullScreen={isMobile}
      >
        <Stack>
          <TextInput
            label="Name"
            value={newStudent.name}
            onChange={(event) => {
              const value = event.currentTarget.value
              setNewStudent((prev) => ({ ...prev, name: value }))
            }}
            required
          />
          <TextInput
            label="Age"
            type="number"
            min={1}
            value={String(newStudent.age || '')}
            onChange={(event) => {
              const value = event.currentTarget.value
              setNewStudent((prev) => ({
                ...prev,
                age: Number(value || 0),
              }))
            }}
            required
          />
          <Select
            label="Belt"
            data={['White', 'Yellow', 'Green', 'Blue', 'Red', 'Black']}
            value={newStudent.belt}
            onChange={(value) =>
              setNewStudent((prev) => ({ ...prev, belt: value ?? 'White' }))
            }
            allowDeselect={false}
          />
          <TextInput
            label="Father Name"
            value={newStudent.fatherName}
            onChange={(event) => {
              const value = event.currentTarget.value
              setNewStudent((prev) => ({ ...prev, fatherName: value }))
            }}
            required
          />
          <TextInput
            label="Mother Name"
            value={newStudent.motherName}
            onChange={(event) => {
              const value = event.currentTarget.value
              setNewStudent((prev) => ({ ...prev, motherName: value }))
            }}
            required
          />
          <TextInput
            label="Address"
            value={newStudent.address}
            onChange={(event) => {
              const value = event.currentTarget.value
              setNewStudent((prev) => ({ ...prev, address: value }))
            }}
            required
          />
          <TextInput
            label="Primary Contact Number"
            value={newStudent.primaryContactNumber}
            onChange={(event) => {
              const value = event.currentTarget.value
              setNewStudent((prev) => ({
                ...prev,
                primaryContactNumber: value,
              }))
            }}
            required
          />
          <Group justify="flex-end">
            <Button variant="default" onClick={() => setCreateModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddStudent}>Add Student</Button>
          </Group>
        </Stack>
      </Modal>
    </Card>
  )
}
