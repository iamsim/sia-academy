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
import { createStudent, deleteStudent, listStudents, updateStudent } from '@/api/services'
import type { Student } from '@/api/types'

const pageSize = 6

type StudentFormValues = Omit<Student, 'id'>

function StudentFields({
  value,
  onChange,
}: {
  value: StudentFormValues
  onChange: (patch: Partial<StudentFormValues>) => void
}) {
  return (
    <Stack>
      <TextInput
        label="Name"
        value={value.name}
        onChange={(event) => {
          onChange({ name: event.currentTarget.value })
        }}
        required
      />
      <TextInput
        label="Age"
        type="number"
        min={1}
        value={String(value.age || '')}
        onChange={(event) => {
          onChange({ age: Number(event.currentTarget.value || 0) })
        }}
        required
      />
      <Select
        label="Belt"
        data={['White', 'Yellow', 'Green', 'Blue', 'Red', 'Black']}
        value={value.belt}
        onChange={(v) => onChange({ belt: v ?? 'White' })}
        allowDeselect={false}
      />
      <TextInput
        label="Father Name"
        value={value.fatherName}
        onChange={(event) => {
          onChange({ fatherName: event.currentTarget.value })
        }}
        required
      />
      <TextInput
        label="Mother Name"
        value={value.motherName}
        onChange={(event) => {
          onChange({ motherName: event.currentTarget.value })
        }}
        required
      />
      <TextInput
        label="Address"
        value={value.address}
        onChange={(event) => {
          onChange({ address: event.currentTarget.value })
        }}
        required
      />
      <TextInput
        label="Primary Contact Number"
        value={value.primaryContactNumber}
        onChange={(event) => {
          onChange({ primaryContactNumber: event.currentTarget.value })
        }}
        required
      />
    </Stack>
  )
}

function buildStudentPayload(values: StudentFormValues): Omit<Student, 'id'> | null {
  const trimmedName = values.name.trim()
  const trimmedFather = values.fatherName.trim()
  const trimmedMother = values.motherName.trim()
  const trimmedAddress = values.address.trim()
  const trimmedContact = values.primaryContactNumber.trim()
  const parsedAge = Number(values.age)

  if (
    !trimmedName ||
    !trimmedFather ||
    !trimmedMother ||
    !trimmedAddress ||
    !trimmedContact ||
    Number.isNaN(parsedAge) ||
    parsedAge <= 0
  ) {
    return null
  }

  return {
    name: trimmedName,
    age: parsedAge,
    belt: values.belt,
    fatherName: trimmedFather,
    motherName: trimmedMother,
    address: trimmedAddress,
    primaryContactNumber: trimmedContact,
  }
}

export function StudentsPage() {
  const isMobile = useMediaQuery('(max-width: 48em)')
  const [students, setStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [beltFilter, setBeltFilter] = useState<string | null>('All')
  const [page, setPage] = useState(1)
  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [newStudent, setNewStudent] = useState<StudentFormValues>({
    name: '',
    age: 0,
    belt: 'White',
    fatherName: '',
    motherName: '',
    address: '',
    primaryContactNumber: '',
  })
  const [editStudent, setEditStudent] = useState<Student | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Student | null>(null)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)

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
    const payload = buildStudentPayload(newStudent)
    if (!payload) return

    createStudent(payload)
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

  function handleSaveEdit() {
    if (!editStudent) return
    const { id, ...formValues } = editStudent
    const payload = buildStudentPayload(formValues)
    if (!payload) return

    setSaving(true)
    updateStudent(id, payload)
      .then((updated) => {
        setStudents((current) => current.map((s) => (s.id === updated.id ? updated : s)))
        setEditStudent(null)
      })
      .catch((error) => {
        alert(error instanceof Error ? error.message : 'Failed to update student')
      })
      .finally(() => {
        setSaving(false)
      })
  }

  function handleConfirmDelete() {
    if (!deleteTarget) return
    setDeleting(true)
    deleteStudent(deleteTarget.id)
      .then(() => {
        setStudents((current) => current.filter((s) => s.id !== deleteTarget.id))
        setDeleteTarget(null)
        setPage(1)
      })
      .catch((error) => {
        alert(error instanceof Error ? error.message : 'Failed to delete student')
      })
      .finally(() => {
        setDeleting(false)
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
                    <ActionIcon
                      variant="light"
                      color="siaSky"
                      aria-label="Edit student"
                      onClick={() => setEditStudent({ ...student })}
                    >
                      <IconEdit size={16} />
                    </ActionIcon>
                    <ActionIcon
                      variant="light"
                      color="red"
                      aria-label="Delete student"
                      onClick={() => setDeleteTarget(student)}
                    >
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
          <StudentFields
            value={newStudent}
            onChange={(patch) => {
              setNewStudent((prev) => ({ ...prev, ...patch }))
            }}
          />
          <Group justify="flex-end">
            <Button variant="default" onClick={() => setCreateModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddStudent}>Add Student</Button>
          </Group>
        </Stack>
      </Modal>

      <Modal
        opened={editStudent !== null}
        onClose={() => setEditStudent(null)}
        title="Edit Student"
        centered
        fullScreen={isMobile}
      >
        {editStudent && (
          <Stack>
            <StudentFields
              value={{
                name: editStudent.name,
                age: editStudent.age,
                belt: editStudent.belt,
                fatherName: editStudent.fatherName,
                motherName: editStudent.motherName,
                address: editStudent.address,
                primaryContactNumber: editStudent.primaryContactNumber,
              }}
              onChange={(patch) => {
                setEditStudent((prev) => (prev ? { ...prev, ...patch } : null))
              }}
            />
            <Group justify="flex-end">
              <Button variant="default" onClick={() => setEditStudent(null)}>
                Cancel
              </Button>
              <Button onClick={handleSaveEdit} loading={saving}>
                Save changes
              </Button>
            </Group>
          </Stack>
        )}
      </Modal>

      <Modal
        opened={deleteTarget !== null}
        onClose={() => setDeleteTarget(null)}
        title="Delete student"
        centered
      >
        {deleteTarget && (
          <Stack gap="md">
            <Text size="sm">
              Remove <strong>{deleteTarget.name}</strong> from the roster? Related attendance rows
              will be removed; payments for this student will keep the receipt but lose the student
              link.
            </Text>
            <Group justify="flex-end">
              <Button variant="default" onClick={() => setDeleteTarget(null)}>
                Cancel
              </Button>
              <Button color="red" onClick={handleConfirmDelete} loading={deleting}>
                Delete
              </Button>
            </Group>
          </Stack>
        )}
      </Modal>
    </Card>
  )
}
