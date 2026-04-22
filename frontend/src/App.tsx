import { BrowserRouter } from 'react-router-dom'
import { AppRoutes } from '@/app/AppRoutes'
import { AuthProvider } from '@/contexts/AuthProvider'

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  )
}
