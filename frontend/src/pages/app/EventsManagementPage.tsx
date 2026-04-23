import {
  ActionIcon,
  Button,
  Card,
  Group,
  Modal,
  ScrollArea,
  Stack,
  Table,
  Text,
  Textarea,
  TextInput,
  Title,
} from '@mantine/core'
import { useMediaQuery } from '@mantine/hooks'
import { IconEdit, IconPlus, IconTrash } from '@tabler/icons-react'
import { useEffect, useMemo, useState } from 'react'
import { createEvent, deleteEvent, listEvents, updateEvent } from '@/api/services'
import type { AcademyEvent } from '@/api/types'
import { formatEventTime12h } from '@/utils/format-event-time'

type EventDraft = Omit<AcademyEvent, 'id'>

const emptyDraft: EventDraft = {
  eventName: '',
  place: '',
  date: '',
  time: '',
  description: '',
}

function formatDateDisplay(date: string) {
  if (!date) return '-'
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: '2-digit',
  }).format(new Date(`${date}T00:00:00`))
}

/** `<input type="time">` expects HH:mm */
function timeForInput(time: string) {
  const t = time.trim()
  if (t.length >= 5) return t.slice(0, 5)
  return t
}

function EventFields({
  value,
  onChange,
}: {
  value: EventDraft
  onChange: (patch: Partial<EventDraft>) => void
}) {
  return (
    <Stack>
      <TextInput
        label="Event name"
        value={value.eventName}
        onChange={(e) => onChange({ eventName: e.currentTarget.value })}
        required
      />
      <TextInput
        label="Place"
        value={value.place}
        onChange={(e) => onChange({ place: e.currentTarget.value })}
        required
      />
      <TextInput
        label="Date"
        type="date"
        value={value.date}
        onChange={(e) => onChange({ date: e.currentTarget.value })}
        required
      />
      <TextInput
        label="Time"
        type="time"
        value={timeForInput(value.time)}
        onChange={(e) => onChange({ time: e.currentTarget.value })}
        required
      />
      <Textarea
        label="Description"
        description="What to bring, venue landmarks, schedule notes, etc."
        placeholder="e.g. Bring dobok and water bottle. Venue: main hall, second floor past the reception desk."
        value={value.description}
        onChange={(e) => onChange({ description: e.currentTarget.value })}
        minRows={4}
        autosize
        maxRows={12}
        required
      />
    </Stack>
  )
}

function buildEventPayload(draft: EventDraft): Omit<AcademyEvent, 'id'> | null {
  const eventName = draft.eventName.trim()
  const place = draft.place.trim()
  const description = draft.description.trim()
  const time = draft.time.trim()
  if (!eventName || !place || !draft.date || !time || !description) return null
  return {
    eventName,
    place,
    date: draft.date,
    time,
    description,
  }
}

export function EventsManagementPage() {
  const isMobile = useMediaQuery('(max-width: 48em)')
  const [events, setEvents] = useState<AcademyEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [newEvent, setNewEvent] = useState<EventDraft>(emptyDraft)
  const [editEvent, setEditEvent] = useState<AcademyEvent | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<AcademyEvent | null>(null)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    let active = true
    ;(async () => {
      try {
        const data = await listEvents()
        if (active) setEvents(data)
      } finally {
        if (active) setLoading(false)
      }
    })()
    return () => {
      active = false
    }
  }, [])

  const sortedEvents = useMemo(
    () => [...events].sort((a, b) => a.date.localeCompare(b.date)),
    [events],
  )

  function closeCreateModal() {
    setCreateModalOpen(false)
    setNewEvent(emptyDraft)
  }

  async function handleAddEvent() {
    const payload = buildEventPayload(newEvent)
    if (!payload) return
    try {
      const created = await createEvent(payload)
      setEvents((prev) => [created, ...prev])
      closeCreateModal()
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to add event')
    }
  }

  async function handleSaveEdit() {
    if (!editEvent) return
    const draft: EventDraft = {
      eventName: editEvent.eventName,
      place: editEvent.place,
      date: editEvent.date,
      time: editEvent.time,
      description: editEvent.description,
    }
    const payload = buildEventPayload(draft)
    if (!payload) return
    setSaving(true)
    try {
      const updated = await updateEvent(editEvent.id, payload)
      setEvents((prev) => prev.map((e) => (e.id === updated.id ? updated : e)))
      setEditEvent(null)
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to update event')
    } finally {
      setSaving(false)
    }
  }

  async function handleConfirmDelete() {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      await deleteEvent(deleteTarget.id)
      setEvents((prev) => prev.filter((e) => e.id !== deleteTarget.id))
      setDeleteTarget(null)
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to delete event')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <Card withBorder radius="md" p={{ base: 'sm', sm: 'lg' }}>
      <Group justify="space-between" mb="md" wrap="wrap" gap="sm">
        <Title order={3}>Events</Title>
        <Group gap="sm">
          <Text size="sm" c="dimmed">
            {events.length} events
          </Text>
          <Button leftSection={<IconPlus size={16} />} onClick={() => setCreateModalOpen(true)}>
            Add New Event
          </Button>
        </Group>
      </Group>

      <ScrollArea>
        <Table striped highlightOnHover withTableBorder withColumnBorders miw={950}>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Event name</Table.Th>
              <Table.Th>Place</Table.Th>
              <Table.Th>Date</Table.Th>
              <Table.Th>Time</Table.Th>
              <Table.Th>Description</Table.Th>
              <Table.Th w={100}>Actions</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {loading && (
              <Table.Tr>
                <Table.Td colSpan={6}>Loading events...</Table.Td>
              </Table.Tr>
            )}
            {sortedEvents.map((event) => (
              <Table.Tr key={event.id}>
                <Table.Td>{event.eventName}</Table.Td>
                <Table.Td>{event.place}</Table.Td>
                <Table.Td>{formatDateDisplay(event.date)}</Table.Td>
                <Table.Td>{formatEventTime12h(event.time)}</Table.Td>
                <Table.Td>{event.description}</Table.Td>
                <Table.Td>
                  <Group gap={6} wrap="nowrap">
                    <ActionIcon
                      variant="light"
                      color="siaSky"
                      aria-label="Edit event"
                      onClick={() => setEditEvent({ ...event })}
                    >
                      <IconEdit size={16} />
                    </ActionIcon>
                    <ActionIcon
                      variant="light"
                      color="red"
                      aria-label="Delete event"
                      onClick={() => setDeleteTarget(event)}
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

      <Modal
        opened={createModalOpen}
        onClose={closeCreateModal}
        title="Add New Event"
        centered
        fullScreen={isMobile}
      >
        <Stack>
          <EventFields
            value={newEvent}
            onChange={(patch) => setNewEvent((prev) => ({ ...prev, ...patch }))}
          />
          <Group justify="flex-end">
            <Button variant="default" onClick={closeCreateModal}>
              Cancel
            </Button>
            <Button onClick={handleAddEvent}>Add Event</Button>
          </Group>
        </Stack>
      </Modal>

      <Modal
        opened={editEvent !== null}
        onClose={() => setEditEvent(null)}
        title="Edit Event"
        centered
        fullScreen={isMobile}
      >
        {editEvent && (
          <Stack>
            <EventFields
              value={{
                eventName: editEvent.eventName,
                place: editEvent.place,
                date: editEvent.date,
                time: editEvent.time,
                description: editEvent.description,
              }}
              onChange={(patch) => setEditEvent((prev) => (prev ? { ...prev, ...patch } : null))}
            />
            <Group justify="flex-end">
              <Button variant="default" onClick={() => setEditEvent(null)}>
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
        title="Delete event"
        centered
      >
        {deleteTarget && (
          <Stack gap="md">
            <Text size="sm">
              Delete <strong>{deleteTarget.eventName}</strong> on {formatDateDisplay(deleteTarget.date)} at{' '}
              {formatEventTime12h(deleteTarget.time)}? This cannot be undone.
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
