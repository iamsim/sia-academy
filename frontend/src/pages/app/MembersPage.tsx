import {
  ActionIcon,
  Badge,
  Button,
  Card,
  Group,
  Modal,
  Pagination,
  PasswordInput,
  ScrollArea,
  Select,
  Stack,
  Switch,
  Table,
  Text,
  TextInput,
  Title,
} from '@mantine/core'
import { useDebouncedValue, useMediaQuery } from '@mantine/hooks'
import { IconEdit, IconPlus, IconSearch } from '@tabler/icons-react'
import { useEffect, useState } from 'react'
import { createMember, listMembers, updateMember } from '@/api/services'
import type { CreateMemberPayload, Member, MemberRole, UpdateMemberPayload } from '@/api/types'

const pageSize = 10
const roleFilterOptions = ['All', 'Admin', 'Instructor', 'Member'] as const
const roleFormOptions: MemberRole[] = ['Admin', 'Instructor', 'Member']

type CreateFormState = {
  email: string
  displayName: string
  phone: string
  password: string
  role: MemberRole
  isActive: boolean
}

function emptyCreateForm(): CreateFormState {
  return {
    email: '',
    displayName: '',
    phone: '',
    password: '',
    role: 'Member',
    isActive: true,
  }
}

export function MembersPage() {
  const isMobile = useMediaQuery('(max-width: 48em)')
  const [items, setItems] = useState<Member[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [debouncedSearch] = useDebouncedValue(search, 350)
  const [roleFilter, setRoleFilter] = useState<(typeof roleFilterOptions)[number]>('All')
  const [listVersion, setListVersion] = useState(0)

  const [createOpen, setCreateOpen] = useState(false)
  const [createForm, setCreateForm] = useState<CreateFormState>(emptyCreateForm)
  const [createSubmitting, setCreateSubmitting] = useState(false)
  const [createError, setCreateError] = useState<string | null>(null)

  const [editMember, setEditMember] = useState<Member | null>(null)
  const [editPassword, setEditPassword] = useState('')
  const [editSubmitting, setEditSubmitting] = useState(false)
  const [editError, setEditError] = useState<string | null>(null)

  useEffect(() => {
    let active = true
    ;(async () => {
      await Promise.resolve()
      if (!active) return
      setLoading(true)
      setError(null)
      try {
        const data = await listMembers({
          page,
          pageSize,
          search: debouncedSearch,
          role: roleFilter,
        })
        if (!active) return
        const totalPagesFromApi = Math.max(1, Math.ceil(data.total / pageSize))
        if (page > totalPagesFromApi) {
          setPage(totalPagesFromApi)
          return
        }
        setItems(data.items)
        setTotal(data.total)
      } catch (e) {
        if (!active) return
        setError(e instanceof Error ? e.message : 'Failed to load members')
        setItems([])
        setTotal(0)
      } finally {
        if (active) setLoading(false)
      }
    })()
    return () => {
      active = false
    }
  }, [page, debouncedSearch, roleFilter, listVersion])

  const totalPages = Math.max(1, Math.ceil(total / pageSize))
  const safePage = Math.min(page, totalPages)

  function openCreate() {
    setCreateForm(emptyCreateForm())
    setCreateError(null)
    setCreateOpen(true)
  }

  async function handleCreateSubmit() {
    setCreateError(null)
    const email = createForm.email.trim()
    const displayName = createForm.displayName.trim()
    if (!email || !displayName) {
      setCreateError('Email and display name are required.')
      return
    }
    if (createForm.password.length < 6) {
      setCreateError('Password must be at least 6 characters.')
      return
    }

    const phoneTrim = createForm.phone.trim()
    const payload: CreateMemberPayload = {
      email,
      displayName,
      phone: phoneTrim === '' ? null : phoneTrim,
      role: createForm.role,
      isActive: createForm.isActive,
      password: createForm.password,
    }

    setCreateSubmitting(true)
    try {
      await createMember(payload)
      setCreateOpen(false)
      setCreateForm(emptyCreateForm())
      setPage(1)
      setListVersion((v) => v + 1)
    } catch (e) {
      setCreateError(e instanceof Error ? e.message : 'Failed to create member')
    } finally {
      setCreateSubmitting(false)
    }
  }

  async function handleEditSubmit() {
    if (!editMember) return
    setEditError(null)

    const email = editMember.email.trim()
    const displayName = editMember.displayName.trim()
    if (!email || !displayName) {
      setEditError('Email and display name are required.')
      return
    }
    const trimmedPw = editPassword.trim()
    if (trimmedPw.length > 0 && trimmedPw.length < 6) {
      setEditError('New password must be at least 6 characters, or leave blank to keep the current one.')
      return
    }

    const rawPhone = (editMember.phone ?? '').trim()
    const payload: UpdateMemberPayload = {
      email,
      displayName,
      phone: rawPhone === '' ? null : rawPhone,
      role: editMember.role,
      isActive: editMember.isActive,
      ...(trimmedPw.length > 0 ? { password: trimmedPw } : {}),
    }

    setEditSubmitting(true)
    try {
      await updateMember(editMember.id, payload)
      setEditMember(null)
      setEditPassword('')
      setListVersion((v) => v + 1)
    } catch (e) {
      setEditError(e instanceof Error ? e.message : 'Failed to update member')
    } finally {
      setEditSubmitting(false)
    }
  }

  return (
    <Card withBorder radius="md" p={{ base: 'sm', sm: 'lg' }}>
      <Group justify="space-between" mb="md" wrap="wrap" gap="sm">
        <Title order={3}>Members</Title>
        <Group gap="sm">
          <Text size="sm" c="dimmed">
            {total} total
          </Text>
          <Button leftSection={<IconPlus size={16} />} onClick={openCreate}>
            Add member
          </Button>
        </Group>
      </Group>

      <Group mb="md" grow align="flex-end" wrap="wrap">
        <TextInput
          label="Search"
          placeholder="Email, name, or phone"
          leftSection={<IconSearch size={16} />}
          value={search}
          onChange={(event) => {
            setSearch(event.currentTarget.value)
            setPage(1)
          }}
          w={{ base: '100%', sm: 'auto' }}
        />
        <Select
          label="Role"
          data={[...roleFilterOptions]}
          value={roleFilter}
          onChange={(value) => {
            setRoleFilter((value ?? 'All') as (typeof roleFilterOptions)[number])
            setPage(1)
          }}
          allowDeselect={false}
          w={{ base: '100%', sm: 220 }}
        />
      </Group>

      {error && (
        <Text size="sm" c="red.6" mb="sm">
          {error}
        </Text>
      )}

      <ScrollArea>
        <Table striped highlightOnHover withTableBorder withColumnBorders miw={780}>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Email</Table.Th>
              <Table.Th>Display name</Table.Th>
              <Table.Th>Phone</Table.Th>
              <Table.Th>Role</Table.Th>
              <Table.Th>Status</Table.Th>
              <Table.Th w={80}>Actions</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {loading && (
              <Table.Tr>
                <Table.Td colSpan={6}>Loading members...</Table.Td>
              </Table.Tr>
            )}
            {!loading &&
              items.map((member) => (
                <Table.Tr key={member.id}>
                  <Table.Td>{member.email}</Table.Td>
                  <Table.Td>{member.displayName}</Table.Td>
                  <Table.Td>{member.phone ?? '—'}</Table.Td>
                  <Table.Td>{member.role}</Table.Td>
                  <Table.Td>
                    <Badge color={member.isActive ? 'teal' : 'gray'} variant="light" size="sm">
                      {member.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </Table.Td>
                  <Table.Td>
                    <ActionIcon
                      variant="light"
                      color="siaSky"
                      aria-label="Edit member"
                      onClick={() => {
                        setEditMember({ ...member })
                        setEditPassword('')
                        setEditError(null)
                      }}
                    >
                      <IconEdit size={16} />
                    </ActionIcon>
                  </Table.Td>
                </Table.Tr>
              ))}
            {!loading && items.length === 0 && (
              <Table.Tr>
                <Table.Td colSpan={6}>
                  <Text size="sm" c="dimmed">
                    No members match your filters.
                  </Text>
                </Table.Td>
              </Table.Tr>
            )}
          </Table.Tbody>
        </Table>
      </ScrollArea>

      <Group justify="space-between" mt="md" wrap="wrap" gap="sm">
        <Text size="sm" c="dimmed">
          Page {safePage} of {totalPages}
          {total > 0 ? ` · Showing ${items.length} of ${total}` : null}
        </Text>
        <Pagination
          total={totalPages}
          value={safePage}
          onChange={(p) => {
            setPage(p)
          }}
        />
      </Group>

      <Modal
        opened={createOpen}
        onClose={() => {
          setCreateOpen(false)
          setCreateForm(emptyCreateForm())
          setCreateError(null)
        }}
        title="Add member"
        centered
        fullScreen={isMobile}
      >
        <Stack gap="md">
          <TextInput
            label="Email"
            type="email"
            autoComplete="off"
            value={createForm.email}
            onChange={(e) => setCreateForm((f) => ({ ...f, email: e.currentTarget.value }))}
            required
          />
          <TextInput
            label="Display name"
            value={createForm.displayName}
            onChange={(e) => setCreateForm((f) => ({ ...f, displayName: e.currentTarget.value }))}
            required
          />
          <TextInput
            label="Phone"
            placeholder="Optional"
            value={createForm.phone}
            onChange={(e) => setCreateForm((f) => ({ ...f, phone: e.currentTarget.value }))}
          />
          <Select
            label="Role"
            data={roleFormOptions}
            value={createForm.role}
            onChange={(v) =>
              setCreateForm((f) => ({ ...f, role: (v ?? 'Member') as MemberRole }))
            }
            allowDeselect={false}
          />
          <Switch
            label="Active (can sign in)"
            checked={createForm.isActive}
            onChange={(event) => {
              const checked = (event.currentTarget ?? (event.target as HTMLInputElement)).checked
              setCreateForm((f) => ({ ...f, isActive: checked }))
            }}
          />
          <PasswordInput
            label="Password"
            description="At least 6 characters"
            value={createForm.password}
            onChange={(e) => setCreateForm((f) => ({ ...f, password: e.currentTarget.value }))}
            required
          />
          {createError && (
            <Text size="sm" c="red.6">
              {createError}
            </Text>
          )}
          <Group justify="flex-end">
            <Button variant="default" onClick={() => setCreateOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateSubmit} loading={createSubmitting}>
              Create member
            </Button>
          </Group>
        </Stack>
      </Modal>

      <Modal
        opened={editMember !== null}
        onClose={() => {
          setEditMember(null)
          setEditPassword('')
          setEditError(null)
        }}
        title="Edit member"
        centered
        fullScreen={isMobile}
      >
        {editMember && (
          <Stack gap="md">
            <TextInput
              label="Email"
              type="email"
              value={editMember.email}
              onChange={(e) => setEditMember((m) => (m ? { ...m, email: e.currentTarget.value } : null))}
              required
            />
            <TextInput
              label="Display name"
              value={editMember.displayName}
              onChange={(e) =>
                setEditMember((m) => (m ? { ...m, displayName: e.currentTarget.value } : null))
              }
              required
            />
            <TextInput
              label="Phone"
              placeholder="Optional"
              value={editMember.phone ?? ''}
              onChange={(e) =>
                setEditMember((m) =>
                  m ? { ...m, phone: e.currentTarget.value === '' ? null : e.currentTarget.value } : null,
                )
              }
            />
            <Select
              label="Role"
              data={roleFormOptions}
              value={editMember.role}
              onChange={(v) =>
                setEditMember((m) => (m ? { ...m, role: (v ?? m.role) as MemberRole } : null))
              }
              allowDeselect={false}
            />
            <Switch
              label="Active (can sign in)"
              checked={editMember.isActive}
              onChange={(event) => {
                const checked = (event.currentTarget ?? (event.target as HTMLInputElement)).checked
                setEditMember((m) => (m ? { ...m, isActive: checked } : null))
              }}
            />
            <PasswordInput
              label="New password"
              placeholder="Leave blank to keep current password"
              value={editPassword}
              onChange={(e) => setEditPassword(e.currentTarget.value)}
            />
            {editError && (
              <Text size="sm" c="red.6">
                {editError}
              </Text>
            )}
            <Group justify="flex-end">
              <Button
                variant="default"
                onClick={() => {
                  setEditMember(null)
                  setEditPassword('')
                  setEditError(null)
                }}
              >
                Cancel
              </Button>
              <Button onClick={handleEditSubmit} loading={editSubmitting}>
                Save changes
              </Button>
            </Group>
          </Stack>
        )}
      </Modal>
    </Card>
  )
}
