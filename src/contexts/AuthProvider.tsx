import { useCallback, useMemo, useSyncExternalStore, type ReactNode } from 'react'
import { AuthContext, type AuthContextValue, type AuthUser } from '@/contexts/auth-context'

const STORAGE_KEY = 'sia-academy-auth'

function readStoredUser(): AuthUser | null {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as unknown
    if (
      parsed &&
      typeof parsed === 'object' &&
      'email' in parsed &&
      'displayName' in parsed
    ) {
      return parsed as AuthUser
    }
  } catch {
    sessionStorage.removeItem(STORAGE_KEY)
  }
  return null
}

function writeStoredUser(user: AuthUser | null) {
  if (user) sessionStorage.setItem(STORAGE_KEY, JSON.stringify(user))
  else sessionStorage.removeItem(STORAGE_KEY)
}

let memoryUser: AuthUser | null = readStoredUser()
const listeners = new Set<() => void>()

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

function getSnapshot() {
  return memoryUser
}

function setUser(next: AuthUser | null) {
  memoryUser = next
  writeStoredUser(next)
  listeners.forEach((l) => l())
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const user = useSyncExternalStore(subscribe, getSnapshot, getSnapshot)

  const login = useCallback((email: string, displayName: string) => {
    setUser({ email, displayName })
  }, [])

  const logout = useCallback(() => {
    setUser(null)
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      login,
      logout,
    }),
    [user, login, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
