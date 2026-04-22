import {
  Button,
  Card,
  Container,
  Grid,
  Group,
  List,
  SimpleGrid,
  Stack,
  Text,
  ThemeIcon,
  Title,
} from '@mantine/core'
import { IconCalendarEvent, IconHeartHandshake, IconTrophy, IconUsers } from '@tabler/icons-react'
import { Link } from 'react-router-dom'
import { HeroBackdrop } from '@/components/common/HeroBackdrop'
import { heroOverlays, readableOnPhoto } from '@/constants/hero-overlays'
import { siteImages } from '@/constants/site-images'
import { paths } from '@/routes/paths'

export function HomePage() {
  return (
    <>
      <HeroBackdrop
        imageUrl={siteImages.heroHome}
        overlayGradient={heroOverlays.homeHero}
        py={{ base: 48, sm: 72 }}
        px="md"
      >
        <Container size="lg">
          <Stack gap="xl" maw={720}>
            <Title order={1} fz={{ base: 34, sm: 48 }} lh={1.15} style={readableOnPhoto}>
              Train with purpose at{' '}
              <Text span inherit c="siaSky.8" fz="inherit" style={readableOnPhoto}>
                SIA Academy
              </Text>
            </Title>
            <Text size="lg" c="dark.7" maw={560} fw={500} style={readableOnPhoto}>
              World Taekwondo–style training for every age: fitness, self-defence, competition pathways,
              and a community built on respect.
            </Text>
            <Group gap="md">
              <Button
                component={Link}
                to={paths.about}
                size="md"
                variant="gradient"
                gradient={{ from: 'siaSky.5', to: 'siaCoral.5', deg: 125 }}
              >
                About the academy
              </Button>
              <Button component={Link} to={paths.events} size="md" variant="light">
                Upcoming events
              </Button>
            </Group>
          </Stack>
        </Container>
      </HeroBackdrop>

      <Container size="lg" py={{ base: 48, sm: 64 }}>
        <Title order={2} ta="center" mb="xl">
          Why families choose SIA
        </Title>
        <SimpleGrid cols={{ base: 1, sm: 2, md: 4 }} spacing="lg">
          {[
            {
              title: 'Certified coaching',
              text: 'Structured progression from white belt to black belt and beyond.',
              icon: IconTrophy,
              color: 'siaSky',
            },
            {
              title: 'All ages welcome',
              text: 'Little Tigers through to adult classes — clear goals for every level.',
              icon: IconUsers,
              color: 'siaCoral',
            },
            {
              title: 'Character first',
              text: 'Courtesy, integrity, perseverance, and indomitable spirit in every class.',
              icon: IconHeartHandshake,
              color: 'siaSky',
            },
            {
              title: 'Events & grading',
              text: 'Regular seminars, belt tests, and friendly in-house competitions.',
              icon: IconCalendarEvent,
              color: 'siaCoral',
            },
          ].map(({ title, text, icon: Icon, color }) => (
            <Card key={title} shadow="sm" padding="lg" radius="md" withBorder>
              <ThemeIcon size={48} radius="md" variant="light" color={color} mb="md">
                <Icon size={28} />
              </ThemeIcon>
              <Text fw={600} mb="xs">
                {title}
              </Text>
              <Text size="sm" c="dimmed">
                {text}
              </Text>
            </Card>
          ))}
        </SimpleGrid>
      </Container>

      <HeroBackdrop
        imageUrl={siteImages.bgCommunity}
        overlayGradient={heroOverlays.homeCta}
        py={{ base: 48, sm: 64 }}
        px="md"
      >
        <Container size="lg">
          <Grid gap="xl" align="center">
            <Grid.Col span={{ base: 12, md: 6 }}>
              <Title order={2} mb="md" style={readableOnPhoto}>
                Ready to step on the mat?
              </Title>
              <Text c="dark.7" mb="lg" fw={500} style={readableOnPhoto}>
                Book a trial class, ask about our timetable, or log in if you are already a member.
              </Text>
              <List spacing="sm" size="sm" c="dark.6" style={readableOnPhoto}>
                <List.Item>Safe, supportive training floor</List.Item>
                <List.Item>Clear curriculum aligned with modern sport Taekwondo</List.Item>
                <List.Item>Pathways for recreation and competition</List.Item>
              </List>
            </Grid.Col>
            <Grid.Col span={{ base: 12, md: 6 }}>
              <Card shadow="md" padding="xl" radius="md" withBorder>
                <Stack gap="md">
                  <Text fw={600}>New students</Text>
                  <Text size="sm" c="dimmed">
                    Visit our Events page for open days and grading dates, or speak to the front desk after class.
                  </Text>
                  <Button component={Link} to={paths.events} variant="filled">
                    View events
                  </Button>
                </Stack>
              </Card>
            </Grid.Col>
          </Grid>
        </Container>
      </HeroBackdrop>
    </>
  )
}
