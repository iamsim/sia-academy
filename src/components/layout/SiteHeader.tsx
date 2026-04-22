import {
  Box,
  Burger,
  Button,
  Divider,
  Drawer,
  Group,
  Stack,
  Text,
  Title,
  UnstyledButton,
} from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import {
  IconCalendarEvent,
  IconHome2,
  IconInfoCircle,
  IconPhoto,
  IconSchool,
} from '@tabler/icons-react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/useAuth'
import { paths } from '@/routes/paths'

const navItems = [
  { to: paths.home, label: 'Home', icon: IconHome2 },
  { to: paths.about, label: 'About Us', icon: IconInfoCircle },
  { to: paths.gallery, label: 'Gallery', icon: IconPhoto },
  { to: paths.events, label: 'Events', icon: IconCalendarEvent },
] as const

function navLinkClass({ isActive }: { isActive: boolean }) {
  return isActive ? 'site-nav-link site-nav-link--active' : 'site-nav-link'
}

export function SiteHeader() {
  const [opened, { toggle, close }] = useDisclosure(false)
  const { isAuthenticated, user, logout } = useAuth()
  const navigate = useNavigate()

  const desktopAuth = isAuthenticated ? (
    <Group gap="sm" wrap="nowrap">
      <Button
        component={Link}
        to={paths.app.attendance}
        variant="light"
        leftSection={<IconSchool size={18} />}
      >
        Member Area
      </Button>
      <Button
        variant="default"
        onClick={() => {
          logout()
          navigate(paths.home)
        }}
      >
        Log out
      </Button>
    </Group>
  ) : (
    <Button
      component={Link}
      to={paths.login}
      variant="gradient"
      gradient={{ from: 'siaSky.5', to: 'siaCoral.5', deg: 125 }}
    >
      Login
    </Button>
  )

  return (
    <>
      <Box
        component="header"
        py="sm"
        px="md"
        style={{ borderBottom: '1px solid var(--mantine-color-gray-2)' }}
      >
        <Group justify="space-between" wrap="nowrap">
          <UnstyledButton component={Link} to={paths.home}>
            <Group gap="xs" wrap="nowrap">
              <Box
                w={40}
                h={40}
                style={{
                  borderRadius: 10,
                  background:
                    'linear-gradient(125deg, var(--mantine-color-siaSky-5), var(--mantine-color-siaCoral-5))',
                }}
              />
              <div>
                <Title order={4} lh={1.1} c="siaSky.8">
                  SIA Academy
                </Title>
                <Text size="xs" c="dimmed" visibleFrom="xs">
                  Taekwondo · Discipline · Excellence
                </Text>
              </div>
            </Group>
          </UnstyledButton>

          <Group gap="lg" visibleFrom="md" wrap="nowrap">
            {navItems.map(({ to, label }) => (
              <NavLink key={to} to={to} className={navLinkClass}>
                {label}
              </NavLink>
            ))}
            {desktopAuth}
          </Group>

          <Group gap="xs" hiddenFrom="md" wrap="nowrap">
            <Burger opened={opened} onClick={toggle} aria-label="Open navigation" />
          </Group>
        </Group>
      </Box>

      <Drawer
        opened={opened}
        onClose={close}
        position="right"
        title="SIA Academy"
        hiddenFrom="md"
        padding="md"
      >
        <Stack gap="md">
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink key={to} to={to} onClick={close} className={navLinkClass}>
              <Group gap="sm" wrap="nowrap">
                <Icon size={20} />
                <Text component="span" fz="md" fw={500}>
                  {label}
                </Text>
              </Group>
            </NavLink>
          ))}
          <Divider />
          {isAuthenticated && user ? (
            <Stack gap="sm">
              <Text size="sm" c="dimmed">
                Signed in as {user.displayName}
              </Text>
              <Button
                component={Link}
                to={paths.app.attendance}
                leftSection={<IconSchool size={18} />}
                onClick={close}
                variant="light"
              >
                Member Area
              </Button>
              <Button
                variant="default"
                onClick={() => {
                  logout()
                  close()
                  navigate(paths.home)
                }}
              >
                Log out
              </Button>
            </Stack>
          ) : (
            <Button
              component={Link}
              to={paths.login}
              variant="gradient"
              gradient={{ from: 'siaSky.5', to: 'siaCoral.5', deg: 125 }}
              onClick={close}
              fullWidth
            >
              Login
            </Button>
          )}
        </Stack>
      </Drawer>
    </>
  )
}
