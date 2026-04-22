import {
  Button,
  Card,
  Group,
  Modal,
  ScrollArea,
  Stack,
  Table,
  Text,
  TextInput,
  Title,
} from '@mantine/core'
import { useMediaQuery } from '@mantine/hooks'
import { IconPlus } from '@tabler/icons-react'
import { useEffect, useMemo, useState } from 'react'
import { createEvent, listEvents } from '@/api/services'
import type { AcademyEvent } from '@/api/types'

type NewEventInput = {
  eventName: string
  place: string
  date: string
  time: string
  description: string
}

const emptyEvent: NewEventInput = {
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

export function EventsManagementPage() {
  const isMobile = useMediaQuery('(max-width: 48em)')
  const [events, setEvents] = useState<AcademyEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [newEvent, setNewEvent] = useState<NewEventInput>(emptyEvent)

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

  function closeModal() {
    setCreateModalOpen(false)
    setNewEvent(emptyEvent)
  }

  function handleAddEvent() {
    const eventName = newEvent.eventName.trim()
    const place = newEvent.place.trim()
    const description = newEvent.description.trim()
    if (!eventName || !place || !newEvent.date || !newEvent.time || !description) return

    createEvent({
      eventName,
      place,
      date: newEvent.date,
      time: newEvent.time,
      description,
    })
      .then((created) => {
        setEvents((prev) => [created, ...prev])
      })
      .catch((error) => {
        alert(error instanceof Error ? error.message : 'Failed to add event')
      })
    closeModal()
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
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {loading && (
              <Table.Tr>
                <Table.Td colSpan={5}>Loading events...</Table.Td>
              </Table.Tr>
            )}
            {sortedEvents.map((event) => (
              <Table.Tr key={event.id}>
                <Table.Td>{event.eventName}</Table.Td>
                <Table.Td>{event.place}</Table.Td>
                <Table.Td>{formatDateDisplay(event.date)}</Table.Td>
                <Table.Td>{event.time}</Table.Td>
                <Table.Td>{event.description}</Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      </ScrollArea>

      <Modal
        opened={createModalOpen}
        onClose={closeModal}
        title="Add New Event"
        centered
        fullScreen={isMobile}
      >
        <Stack>
          <TextInput
            label="Event name"
            value={newEvent.eventName}
            onChange={(event) => {
              const value = event.currentTarget.value
              setNewEvent((prev) => ({ ...prev, eventName: value }))
            }}
            required
          />
          <TextInput
            label="Place"
            value={newEvent.place}
            onChange={(event) => {
              const value = event.currentTarget.value
              setNewEvent((prev) => ({ ...prev, place: value }))
            }}
            required
          />
          <TextInput
            label="Date"
            type="date"
            value={newEvent.date}
            onChange={(event) => {
              const value = event.currentTarget.value
              setNewEvent((prev) => ({ ...prev, date: value }))
            }}
            required
          />
          <TextInput
            label="Time"
            type="time"
            value={newEvent.time}
            onChange={(event) => {
              const value = event.currentTarget.value
              setNewEvent((prev) => ({ ...prev, time: value }))
            }}
            required
          />
          <TextInput
            label="Description"
            value={newEvent.description}
            onChange={(event) => {
              const value = event.currentTarget.value
              setNewEvent((prev) => ({ ...prev, description: value }))
            }}
            required
          />
          <Group justify="flex-end">
            <Button variant="default" onClick={closeModal}>
              Cancel
            </Button>
            <Button onClick={handleAddEvent}>Add Event</Button>
          </Group>
        </Stack>
      </Modal>
    </Card>
  )
}
