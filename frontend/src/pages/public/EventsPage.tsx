import { Badge, Card, Container, Group, SimpleGrid, Stack, Text, Title } from '@mantine/core'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { listEvents } from '@/api/services'
import type { AcademyEvent } from '@/api/types'
import { HeroBackdrop } from '@/components/common/HeroBackdrop'
import { heroOverlays, readableOnPhoto } from '@/constants/hero-overlays'
import { siteImages } from '@/constants/site-images'
import { eventDetailPath } from '@/routes/paths'
import { formatEventTime12h } from '@/utils/format-event-time'

function formatDateShort(date: string) {
  if (!date) return '—'
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(`${date}T00:00:00`))
}

export function EventsPage() {
  const [events, setEvents] = useState<AcademyEvent[]>([])
  const [loading, setLoading] = useState(true)

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

  return (
    <>
      <HeroBackdrop
        imageUrl={siteImages.heroTraining}
        overlayGradient={heroOverlays.eventsHeader}
        py={{ base: 32, sm: 44 }}
        px="md"
      >
        <Container size="lg">
          <Title order={1} mb="xs" style={readableOnPhoto}>
            Events
          </Title>
          <Text c="dark.7" fw={500} style={readableOnPhoto}>
            Tap a card for full details — what to bring, venue notes, and more.
          </Text>
        </Container>
      </HeroBackdrop>
      <Container size="lg" py={{ base: 40, sm: 56 }}>
        <Stack gap="md">
          {loading && (
            <Text c="dimmed" ta="center">
              Loading events…
            </Text>
          )}
          {!loading && events.length === 0 && (
            <Text c="dimmed" ta="center">
              No events available at the moment.
            </Text>
          )}
          {!loading && events.length > 0 && (
            <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="md">
              {events.map((event) => (
                <Card
                  key={event.id}
                  component={Link}
                  to={eventDetailPath(event.id)}
                  withBorder
                  padding="md"
                  radius="md"
                  shadow="sm"
                  style={{
                    textDecoration: 'none',
                    color: 'inherit',
                    transition: 'transform 120ms ease, box-shadow 120ms ease',
                  }}
                >
                  <Stack gap="xs">
                    <Group justify="space-between" align="flex-start" wrap="nowrap" gap="xs">
                      <Title order={4} lineClamp={2}>
                        {event.eventName}
                      </Title>
                      <Badge variant="light" color="siaSky" size="sm" flex="0 0 auto">
                        Event
                      </Badge>
                    </Group>
                    <Text size="sm" c="dimmed" lineClamp={1}>
                      {event.place}
                    </Text>
                    <Text size="sm" fw={600}>
                      {formatDateShort(event.date)} · {formatEventTime12h(event.time)}
                    </Text>
                  </Stack>
                </Card>
              ))}
            </SimpleGrid>
          )}
        </Stack>
      </Container>
    </>
  )
}
