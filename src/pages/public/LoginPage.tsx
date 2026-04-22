import {
  Anchor,
  Button,
  Card,
  Container,
  PasswordInput,
  Stack,
  Text,
  TextInput,
  Title,
} from '@mantine/core'
import { type FormEvent, useState } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { HeroBackdrop } from '@/components/common/HeroBackdrop'
import { heroOverlays } from '@/constants/hero-overlays'
import { siteImages } from '@/constants/site-images'
import { useAuth } from '@/contexts/useAuth'
import { paths } from '@/routes/paths'

type LocationState = { from?: string } | undefined

export function LoginPage() {
  const { login, isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = (location.state as LocationState)?.from ?? paths.app.attendance

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  if (isAuthenticated) {
    return <Navigate to={from} replace />
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    if (!email.trim() || !password) {
      setError('Enter email and password.')
      return
    }
    setSubmitting(true)
    await new Promise((r) => setTimeout(r, 400))
    const name = displayName.trim() || email.split('@')[0] || 'Member'
    login(email.trim(), name)
    setSubmitting(false)
    navigate(from, { replace: true })
  }

  return (
    <HeroBackdrop
      imageUrl={siteImages.heroTraining}
      overlayGradient={heroOverlays.login}
      py={{ base: 40, sm: 64 }}
      px="md"
      style={{ minHeight: 'calc(100vh - 200px)' }}
    >
      <Container size={460}>
        <Card shadow="md" padding="xl" radius="md" withBorder>
          <Stack gap="lg">
          <div>
            <Title order={2} mb={6}>
              Member login
            </Title>
            <Text size="sm" c="dimmed">
              This is a frontend placeholder: any email and password will sign you in for demo purposes.
              Replace with your real auth API later.
            </Text>
          </div>
          <form onSubmit={handleSubmit}>
            <Stack gap="md">
              <TextInput
                label="Email"
                placeholder="you@example.com"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.currentTarget.value)}
                required
              />
              <TextInput
                label="Display name (optional)"
                placeholder="How we greet you in the app"
                value={displayName}
                onChange={(e) => setDisplayName(e.currentTarget.value)}
              />
              <PasswordInput
                label="Password"
                placeholder="••••••••"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.currentTarget.value)}
                required
              />
              {error && (
                <Text size="sm" c="red.6">
                  {error}
                </Text>
              )}
              <Button type="submit" loading={submitting} variant="gradient" gradient={{ from: 'siaSky.5', to: 'siaCoral.5', deg: 125 }} fullWidth>
                Sign in
              </Button>
            </Stack>
          </form>
          <Text size="sm" c="dimmed" ta="center">
            <Anchor component={Link} to={paths.home} underline="hover">
              Back to home
            </Anchor>
          </Text>
          </Stack>
        </Card>
      </Container>
    </HeroBackdrop>
  )
}
