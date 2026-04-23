import {
  Badge,
  Button,
  Card,
  Container,
  Divider,
  Stack,
  Text,
  Title,
} from '@mantine/core'
import { IconArrowLeft } from '@tabler/icons-react'
import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { getEvent } from '@/api/services'
import type { AcademyEvent } from '@/api/types'
import { HeroBackdrop } from '@/components/common/HeroBackdrop'
import { heroOverlays, readableOnPhoto } from '@/constants/hero-overlays'
import { siteImages } from '@/constants/site-images'
import { paths } from '@/routes/paths'
import { formatEventTime12h } from '@/utils/format-event-time'

function formatDateLong(date: string) {
  if (!date) return '—'
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(`${date}T00:00:00`))
}

export function EventDetailPage() {
  const { eventId } = useParams<{ eventId: string }>()
  const parsedId = useMemo(() => {
    const n = Number(eventId)
    if (!eventId || Number.isNaN(n) || n < 1) return null
    return n
  }, [eventId])

  const [event, setEvent] = useState<AcademyEvent | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let active = true
    ;(async () => {
      await Promise.resolve()
      if (!active) return
      if (parsedId === null) {
        setError('Invalid event link.')
        setEvent(null)
        setLoading(false)
        return
      }
      setError(null)
      setEvent(null)
      setLoading(true)
      try {
        const data = await getEvent(parsedId)
        if (!active) return
        setEvent(data)
      } catch (e) {
        if (!active) return
        setError(e instanceof Error ? e.message : 'Could not load this event.')
        setEvent(null)
      } finally {
        if (active) setLoading(false)
      }
    })()
    return () => {
      active = false
    }
  }, [parsedId])

  if (loading) {
    return (
      <Container size="md" py="xl">
        <Text c="dimmed">Loading event…</Text>
      </Container>
    )
  }

  if (error || !event) {
    return (
      <Container size="md" py="xl">
        <Stack gap="md">
          <Text c="red.6">{error ?? 'Event not found.'}</Text>
          <Button component={Link} to={paths.events} variant="light" leftSection={<IconArrowLeft size={18} />}>
            Back to events
          </Button>
        </Stack>
      </Container>
    )
  }

  return (
    <>
      <HeroBackdrop
        imageUrl={siteImages.heroTraining}
        overlayGradient={heroOverlays.eventsHeader}
        py={{ base: 28, sm: 40 }}
        px="md"
      >
        <Container size="md">
          <Badge variant="light" color="siaSky" mb="xs">
            Event
          </Badge>
          <Title order={1} mb="xs" style={readableOnPhoto}>
            {event.eventName}
          </Title>
          <Text c="dark.7" fw={500} size="lg" style={readableOnPhoto}>
            {formatDateLong(event.date)} · {formatEventTime12h(event.time)}
          </Text>
        </Container>
      </HeroBackdrop>

      <Container size="md" py={{ base: 32, sm: 48 }}>
        <Card withBorder radius="md" padding="lg" shadow="sm">
          <Stack gap="lg">
            <div>
              <Text size="sm" c="dimmed" tt="uppercase" fw={700}>
                Venue
              </Text>
              <Text fz="lg" fw={600}>
                {event.place}
              </Text>
            </div>

            <Divider />

            <div>
              <Text size="sm" c="dimmed" tt="uppercase" fw={700} mb="xs">
                Details
              </Text>
              <Text style={{ whiteSpace: 'pre-wrap' }}>{event.description}</Text>
            </div>

            <Button component={Link} to={paths.events} variant="light" leftSection={<IconArrowLeft size={16} />}>
              Back to all events
            </Button>
          </Stack>
        </Card>
      </Container>
    </>
  )
}
