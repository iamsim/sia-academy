import { Badge, Card, Container, Grid, Group, Stack, Text, Title } from '@mantine/core'
import { useEffect, useState } from 'react'
import { listEvents } from '@/api/services'
import type { AcademyEvent } from '@/api/types'
import { HeroBackdrop } from '@/components/common/HeroBackdrop'
import { heroOverlays, readableOnPhoto } from '@/constants/hero-overlays'
import { siteImages } from '@/constants/site-images'

function formatDateDisplay(date: string) {
  if (!date) return '-'
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: '2-digit',
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
        <Container size="md">
          <Title order={1} mb="xs" style={readableOnPhoto}>
            Events
          </Title>
          <Text c="dark.7" fw={500} style={readableOnPhoto}>
            Key dates for trials, gradings, and special sessions. Times are announced closer to each event.
          </Text>
        </Container>
      </HeroBackdrop>
      <Container size="md" py={{ base: 40, sm: 56 }}>
        <Stack gap="md">
          {loading && (
            <Card withBorder padding="lg" radius="md" shadow="xs">
              <Text c="dimmed">Loading events...</Text>
            </Card>
          )}
          {events.length === 0 && (
            <Card withBorder padding="lg" radius="md" shadow="xs">
              <Text c="dimmed">No events available at the moment.</Text>
            </Card>
          )}
          {events.map((event) => (
            <Card key={event.id} withBorder padding="lg" radius="md" shadow="xs">
              <Group justify="space-between" align="flex-start" gap="sm">
                <Title order={4}>{event.eventName}</Title>
                <Badge variant="light" color="siaSky">
                  Event
                </Badge>
              </Group>
              <Grid gap="xs" mt="xs">
                <Grid.Col span={{ base: 12, sm: 6 }}>
                  <Text size="sm" c="dimmed">
                    Place
                  </Text>
                  <Text fw={600}>{event.place}</Text>
                </Grid.Col>
                <Grid.Col span={{ base: 12, sm: 3 }}>
                  <Text size="sm" c="dimmed">
                    Date
                  </Text>
                  <Text fw={600}>{formatDateDisplay(event.date)}</Text>
                </Grid.Col>
                <Grid.Col span={{ base: 12, sm: 3 }}>
                  <Text size="sm" c="dimmed">
                    Time
                  </Text>
                  <Text fw={600}>{event.time}</Text>
                </Grid.Col>
              </Grid>
              <Text c="dimmed" mt="sm">
                {event.description}
              </Text>
            </Card>
          ))}
        </Stack>
      </Container>
    </>
  )
}
