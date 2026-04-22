import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '@/contexts/useAuth'
import { paths } from '@/routes/paths'

export function ProtectedRoute() {
  const { isAuthenticated } = useAuth()
  const location = useLocation()

  if (!isAuthenticated) {
    return (
      <Navigate to={paths.login} replace state={{ from: location.pathname }} />
    )
  }

  return <Outlet />
}
