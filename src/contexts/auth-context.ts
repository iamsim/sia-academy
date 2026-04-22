import { createContext } from 'react'

export type AuthUser = {
  email: string
  displayName: string
}

export type AuthContextValue = {
  user: AuthUser | null
  isAuthenticated: boolean
  login: (email: string, displayName: string) => void
  logout: () => void
}

export const AuthContext = createContext<AuthContextValue | null>(null)
