import { Navigate, Route, Routes } from 'react-router-dom'
import { AppAreaLayout } from '@/components/layout/AppAreaLayout'
import { PublicLayout } from '@/components/layout/PublicLayout'
import { ProtectedRoute } from '@/components/routing/ProtectedRoute'
import { AttendancePage } from '@/pages/app/AttendancePage'
import { EventsManagementPage } from '@/pages/app/EventsManagementPage'
import { MembersPage } from '@/pages/app/MembersPage'
import { PaymentsPage } from '@/pages/app/PaymentsPage'
import { StudentsPage } from '@/pages/app/StudentsPage'
import { AboutPage } from '@/pages/public/AboutPage'
import { EventDetailPage } from '@/pages/public/EventDetailPage'
import { EventsPage } from '@/pages/public/EventsPage'
import { GalleryPage } from '@/pages/public/GalleryPage'
import { HomePage } from '@/pages/public/HomePage'
import { LoginPage } from '@/pages/public/LoginPage'
import { paths } from '@/routes/paths'

export function AppRoutes() {
  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route index element={<HomePage />} />
        <Route path="about" element={<AboutPage />} />
        <Route path="gallery" element={<GalleryPage />} />
        <Route path="events/:eventId" element={<EventDetailPage />} />
        <Route path="events" element={<EventsPage />} />
        <Route path="login" element={<LoginPage />} />
      </Route>

      <Route element={<ProtectedRoute />}>
        <Route path="app" element={<AppAreaLayout />}>
          <Route index element={<Navigate to={paths.app.attendance} replace />} />
          <Route path="attendance" element={<AttendancePage />} />
          <Route path="members" element={<MembersPage />} />
          <Route path="students" element={<StudentsPage />} />
          <Route path="payments" element={<PaymentsPage />} />
          <Route path="events" element={<EventsManagementPage />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to={paths.home} replace />} />
    </Routes>
  )
}
