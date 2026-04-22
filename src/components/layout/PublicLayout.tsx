import { Box, Stack } from '@mantine/core'
import { Outlet } from 'react-router-dom'
import { SiteHeader } from '@/components/layout/SiteHeader'

export function PublicLayout() {
  return (
    <Stack gap={0} mih="100vh">
      <SiteHeader />
      <Box component="main" style={{ flex: 1 }}>
        <Outlet />
      </Box>
      <Box component="footer" py="xl" px="md" bg="gray.0" mt="auto">
        <Box maw={1100} mx="auto" ta="center" fz="sm" c="dimmed">
          © {new Date().getFullYear()} SIA Academy. All rights reserved.
        </Box>
      </Box>
    </Stack>
  )
}
