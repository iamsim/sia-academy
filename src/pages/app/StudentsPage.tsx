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
import { useMemo, useState } from 'react'

type Student = {
  id: string
  name: string
  age: number
  belt: string
  fatherName: string
  motherName: string
  address: string
  primaryContactNumber: string
}

const initialStudents: Student[] = [
  { id: 'S001', name: 'Aarav Sharma', age: 10, belt: 'Yellow', fatherName: 'Rohit Sharma', motherName: 'Neha Sharma', address: '12 Green Park, East Street', primaryContactNumber: '9876543210' },
  { id: 'S002', name: 'Diya Nair', age: 12, belt: 'Green', fatherName: 'Arun Nair', motherName: 'Meera Nair', address: '22 Lake View, Main Road', primaryContactNumber: '9898981234' },
  { id: 'S003', name: 'Kiran Reddy', age: 15, belt: 'Blue', fatherName: 'Ramesh Reddy', motherName: 'Suma Reddy', address: '7 Lotus Colony, Sector 4', primaryContactNumber: '9988776655' },
  { id: 'S004', name: 'Ananya Iyer', age: 9, belt: 'White', fatherName: 'Vijay Iyer', motherName: 'Lakshmi Iyer', address: '88 Temple Street, South Block', primaryContactNumber: '9876501234' },
  { id: 'S005', name: 'Rahul Singh', age: 14, belt: 'Red', fatherName: 'Manoj Singh', motherName: 'Pooja Singh', address: '3 Park Avenue, West End', primaryContactNumber: '9000012345' },
  { id: 'S006', name: 'Isha Menon', age: 11, belt: 'Yellow', fatherName: 'Rajiv Menon', motherName: 'Deepa Menon', address: '16 Palm Residency, North Lane', primaryContactNumber: '9811122233' },
  { id: 'S007', name: 'Arjun Patel', age: 13, belt: 'Green', fatherName: 'Nitin Patel', motherName: 'Komal Patel', address: '4 Riverfront, Block B', primaryContactNumber: '9822233344' },
  { id: 'S008', name: 'Nisha Kapoor', age: 16, belt: 'Black', fatherName: 'Sanjay Kapoor', motherName: 'Ritu Kapoor', address: '90 City Heights, Tower 2', primaryContactNumber: '9833344455' },
  { id: 'S009', name: 'Veda Joshi', age: 8, belt: 'White', fatherName: 'Amit Joshi', motherName: 'Priya Joshi', address: '11 Sunrise Enclave, Lane 5', primaryContactNumber: '9844455566' },
  { id: 'S010', name: 'Kabir Khan', age: 12, belt: 'Blue', fatherName: 'Imran Khan', motherName: 'Saba Khan', address: '24 Rose Garden, Unit 3', primaryContactNumber: '9855566677' },
  { id: 'S011', name: 'Riya Das', age: 10, belt: 'Yellow', fatherName: 'Subhash Das', motherName: 'Anita Das', address: '17 Hill View, Block C', primaryContactNumber: '9866677788' },
  { id: 'S012', name: 'Yash Verma', age: 15, belt: 'Red', fatherName: 'Alok Verma', motherName: 'Shalini Verma', address: '50 Central Plaza, 1st Cross', primaryContactNumber: '9877788899' },
]

const pageSize = 6

export function StudentsPage() {
  const isMobile = useMediaQuery('(max-width: 48em)')
  const [students, setStudents] = useState<Student[]>(initialStudents)
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

    const maxId = students.reduce((max, student) => {
      const numeric = Number(student.id.replace('S', ''))
      return Number.isNaN(numeric) ? max : Math.max(max, numeric)
    }, 0)
    const nextId = `S${String(maxId + 1).padStart(3, '0')}`

    const nextStudent: Student = {
      id: nextId,
      name: trimmedName,
      age: parsedAge,
      belt: newStudent.belt,
      fatherName: trimmedFather,
      motherName: trimmedMother,
      address: trimmedAddress,
      primaryContactNumber: trimmedContact,
    }

    setStudents((current) => [nextStudent, ...current])
    setCreateModalOpen(false)
    resetNewStudentForm()
    setPage(1)
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
            onChange={(event) =>
              setNewStudent((prev) => ({ ...prev, name: event.currentTarget.value }))
            }
            required
          />
          <TextInput
            label="Age"
            type="number"
            min={1}
            value={String(newStudent.age || '')}
            onChange={(event) =>
              setNewStudent((prev) => ({
                ...prev,
                age: Number(event.currentTarget.value || 0),
              }))
            }
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
            onChange={(event) =>
              setNewStudent((prev) => ({ ...prev, fatherName: event.currentTarget.value }))
            }
            required
          />
          <TextInput
            label="Mother Name"
            value={newStudent.motherName}
            onChange={(event) =>
              setNewStudent((prev) => ({ ...prev, motherName: event.currentTarget.value }))
            }
            required
          />
          <TextInput
            label="Address"
            value={newStudent.address}
            onChange={(event) =>
              setNewStudent((prev) => ({ ...prev, address: event.currentTarget.value }))
            }
            required
          />
          <TextInput
            label="Primary Contact Number"
            value={newStudent.primaryContactNumber}
            onChange={(event) =>
              setNewStudent((prev) => ({
                ...prev,
                primaryContactNumber: event.currentTarget.value,
              }))
            }
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
