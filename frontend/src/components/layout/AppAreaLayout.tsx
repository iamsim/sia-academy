import { Box, Button, Card, Group, Stack, Text, Title } from '@mantine/core'
import {
  IconArrowLeft,
  IconCalendarCheck,
  IconCalendarEvent,
  IconCreditCard,
  IconSchool,
} from '@tabler/icons-react'
import { Link, NavLink, Outlet } from 'react-router-dom'
import { SiteHeader } from '@/components/layout/SiteHeader'
import { paths } from '@/routes/paths'

const appMenuItems = [
  { to: paths.app.attendance, label: 'Attendance', icon: IconCalendarCheck },
  { to: paths.app.students, label: 'Students', icon: IconSchool },
  { to: paths.app.payments, label: 'Payments', icon: IconCreditCard },
  { to: paths.app.events, label: 'Events', icon: IconCalendarEvent },
] as const

function appSideLinkClass({ isActive }: { isActive: boolean }) {
  return isActive ? 'app-side-link app-side-link--active' : 'app-side-link'
}

export function AppAreaLayout() {
  return (
    <Stack gap={0} mih="100vh">
      <SiteHeader />
      <Box
        component="main"
        style={{ flex: 1 }}
        maw={1200}
        w="100%"
        mx="auto"
        px={{ base: 'xs', sm: 'md' }}
        py={{ base: 'md', sm: 'lg' }}
      >
        <Group justify="space-between" mb="lg" wrap="wrap" gap="sm">
          <Title order={2}>Member area</Title>
          <Button
            component={Link}
            to={paths.home}
            variant="subtle"
            leftSection={<IconArrowLeft size={18} />}
          >
            Back to site
          </Button>
        </Group>

        <Box hiddenFrom="md" mb="sm">
          <Card withBorder radius="md" p="xs">
            <Group gap="xs" wrap="wrap">
              {appMenuItems.map(({ to, label, icon: Icon }) => (
                <Button
                  key={to}
                  component={NavLink}
                  to={to}
                  variant="light"
                  leftSection={<Icon size={16} />}
                  size="xs"
                >
                  {label}
                </Button>
              ))}
            </Group>
          </Card>
        </Box>

        <Group align="flex-start" gap="lg" wrap="nowrap" visibleFrom="md">
          <Card withBorder radius="md" p="sm" w={250}>
            <Stack gap={4}>
              <Text size="xs" fw={700} c="dimmed" tt="uppercase" px="xs" py={6}>
                Navigation
              </Text>
              {appMenuItems.map(({ to, label, icon: Icon }) => (
                <NavLink key={to} to={to} className={appSideLinkClass}>
                  <Group gap="sm" wrap="nowrap">
                    <Icon size={18} />
                    <Text component="span" fw={600} size="sm">
                      {label}
                    </Text>
                  </Group>
                </NavLink>
              ))}
            </Stack>
          </Card>
          <Box style={{ flex: 1, minWidth: 0 }}>
            <Outlet />
          </Box>
        </Group>

        <Box hiddenFrom="md">
          <Outlet />
        </Box>
      </Box>
    </Stack>
  )
}
