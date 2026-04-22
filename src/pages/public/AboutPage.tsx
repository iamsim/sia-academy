import { Anchor, Card, Container, Image, List, Stack, Text, Title } from '@mantine/core'
import { HeroBackdrop } from '@/components/common/HeroBackdrop'
import { heroOverlays, readableOnPhoto } from '@/constants/hero-overlays'
import { siteImages } from '@/constants/site-images'

const contactInfo = {
  phone: '+91 98765 43210',
  address: 'SIA Academy, Bengaluru, Karnataka',
  mapsUrl: 'https://www.google.com/maps?q=SIA+Academy+Bengaluru',
  mapsEmbedUrl: 'https://maps.google.com/maps?q=SIA+Academy+Bengaluru&z=15&output=embed',
}

export function AboutPage() {
  return (
    <>
      <HeroBackdrop
        imageUrl={siteImages.bgDobok}
        overlayGradient={heroOverlays.aboutHeader}
        py={{ base: 32, sm: 44 }}
        px="md"
      >
        <Container size="md">
          <Title order={1} style={readableOnPhoto}>
            About SIA Academy
          </Title>
        </Container>
      </HeroBackdrop>
      <Container size="md" py={{ base: 40, sm: 56 }}>
        <Stack gap="lg">
          <Text c="dimmed" size="lg">
            SIA Academy is a Taekwondo school focused on technical excellence, athletic development, and the
            traditional values of the martial art. We welcome beginners and experienced athletes alike.
          </Text>
          <Title order={3}>Our mission</Title>
          <Text c="dimmed">
            To help every student build confidence, discipline, and resilience through high-quality coaching and
            a positive training culture.
          </Text>
          <Title order={3}>What we teach</Title>
          <List spacing="xs" c="dimmed">
            <List.Item>Kicks, strikes, blocks, and footwork for self-defence and sport</List.Item>
            <List.Item>Poomsae (patterns) for grading and competition</List.Item>
            <List.Item>Sparring fundamentals and optional competitive tracks</List.Item>
            <List.Item>Strength, mobility, and conditioning tailored to martial artists</List.Item>
          </List>
          <Title order={3}>Coaching team</Title>
          <Text c="dimmed">
            Our instructors hold recognised qualifications and continue their own training. Student safety and
            respectful conduct are non-negotiable on and off the mat.
          </Text>
          <Card withBorder radius="md" p="md">
            <Stack gap="sm">
              <Image
                src="/images/head-coach-naveen.jpg"
                alt="Head Coach Naveen Kumar R"
                height={260}
                fit="cover"
                radius="md"
              />
              <Title order={4}>Naveen Kumar R</Title>
              <Text c="dimmed">Head Coach • Black Belt 2 Dan</Text>
            </Stack>
          </Card>
          <Title order={3}>Contact us</Title>
          <Card withBorder radius="md" p="lg">
            <Stack gap="sm">
              <Text c="dimmed">
                Phone: <Anchor href={`tel:${contactInfo.phone}`}>{contactInfo.phone}</Anchor>
              </Text>
              <Text c="dimmed">Address: {contactInfo.address}</Text>
              <Anchor href={contactInfo.mapsUrl} target="_blank" rel="noreferrer">
                Open in Google Maps
              </Anchor>
              <iframe
                title="SIA Academy location map"
                src={contactInfo.mapsEmbedUrl}
                width="100%"
                height="280"
                style={{ border: 0, borderRadius: 8 }}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </Stack>
          </Card>
        </Stack>
      </Container>
    </>
  )
}
