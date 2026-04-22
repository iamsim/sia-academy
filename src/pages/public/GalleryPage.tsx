import { Card, Container, Image, SimpleGrid, Text, Title } from '@mantine/core'
import { HeroBackdrop } from '@/components/common/HeroBackdrop'
import { heroOverlays, readableOnPhoto } from '@/constants/hero-overlays'
import { galleryImageSrc, siteImages } from '@/constants/site-images'

export function GalleryPage() {
  return (
    <>
      <HeroBackdrop
        imageUrl={siteImages.heroTraining}
        overlayGradient={heroOverlays.galleryHeader}
        py={{ base: 36, sm: 48 }}
        px="md"
      >
        <Container size="lg">
          <Title order={1} mb="xs" style={readableOnPhoto}>
            Gallery
          </Title>
          <Text c="dark.7" maw={640} fw={500} style={readableOnPhoto}>
            Moments from classes, gradings, and events. Swap files in <code>public/images</code> anytime for
            your own photography.
          </Text>
        </Container>
      </HeroBackdrop>
      <Container size="lg" py={{ base: 40, sm: 56 }}>
        <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="md">
          {siteImages.gallery.map(({ file, caption }) => (
            <Card key={file} padding="sm" radius="md" withBorder shadow="sm">
              <Card.Section>
                <Image src={galleryImageSrc(file)} alt={caption} height={220} fit="cover" />
              </Card.Section>
              <Text size="sm" mt="sm" fw={500}>
                {caption}
              </Text>
            </Card>
          ))}
        </SimpleGrid>
      </Container>
    </>
  )
}
