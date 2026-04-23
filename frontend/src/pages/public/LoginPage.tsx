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
import { loginMember } from '@/api/services'
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
    try {
      const session = await loginMember({ email: email.trim(), password })
      login(session.email, session.displayName)
      navigate(from, { replace: true })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sign in failed.')
    } finally {
      setSubmitting(false)
    }
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
              Sign in with a member account from the database. Seeded demo accounts use password{' '}
              <Text component="span" fw={600}>
                demo123
              </Text>{' '}
              (for example <Text component="span" fw={600}>member@sia.academy</Text> or{' '}
              <Text component="span" fw={600}>admin@sia.academy</Text>). Inactive members cannot sign in.
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
