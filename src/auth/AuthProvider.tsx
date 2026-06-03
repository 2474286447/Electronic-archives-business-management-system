import { createContext, useContext, useEffect, useMemo } from 'react'
import type { AuthSession, UserInfo, WithChildren } from '../types'
import { authStorage } from '../utils/storage'
import { useAuthStore } from '../store/authStore'

interface AuthContextValue {
  token: string
  user: UserInfo | null
  permissions: string[]
  menus: unknown[]
  loadingMenus: boolean
  isAuthenticated: boolean
  setSession: (session: AuthSession) => void
  clearAuth: () => void
  loadMenus: (force?: boolean) => Promise<unknown[]>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: WithChildren) {
  const token = useAuthStore((state) => state.token)
  const user = useAuthStore((state) => state.user)
  const permissions = useAuthStore((state) => state.permissions)
  const menus = useAuthStore((state) => state.menus)
  const loadingMenus = useAuthStore((state) => state.loadingMenus)
  const setSession = useAuthStore((state) => state.setSession)
  const clearAuth = useAuthStore((state) => state.clearAuth)
  const loadMenus = useAuthStore((state) => state.loadMenus)
  const isAuthenticated = Boolean(token && authStorage.isAuthenticated())

  useEffect(() => {
    if (isAuthenticated) {
      loadMenus()
    }
  }, [isAuthenticated, loadMenus])

  const value = useMemo<AuthContextValue>(() => ({
    token,
    user,
    permissions,
    menus,
    loadingMenus,
    isAuthenticated,
    setSession,
    clearAuth,
    loadMenus
  }), [token, user, permissions, menus, loadingMenus, isAuthenticated, setSession, clearAuth, loadMenus])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const value = useContext(AuthContext)
  if (!value) throw new Error('useAuth must be used inside AuthProvider')
  return value
}
