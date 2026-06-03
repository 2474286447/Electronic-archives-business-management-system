import type { AuthSession, UserInfo } from '../types'

const safeParse = <T>(value: string | null, fallback: T): T => {
  try {
    return value ? JSON.parse(value) : fallback
  } catch {
    return fallback
  }
}

export const authStorage = {
  getToken: () => localStorage.getItem('token') || '',
  isAuthenticated: () => localStorage.getItem('isAuthenticated') === 'true',
  getUserName: () => localStorage.getItem('userName') || '',
  getUserInfo: (): UserInfo | null => safeParse(localStorage.getItem('userInfo'), null),
  getPermissions: (): string[] => safeParse(localStorage.getItem('permissions'), []),
  setSession({ token, user, permissions }: AuthSession) {
    localStorage.setItem('token', token || '')
    localStorage.setItem('isAuthenticated', 'true')
    localStorage.setItem('userName', user?.realName || user?.username || user?.userName || '管理员')
    localStorage.setItem('userInfo', JSON.stringify(user || {}))
    localStorage.setItem('permissions', JSON.stringify(permissions || []))
  },
  clearSession() {
    localStorage.removeItem('token')
    localStorage.removeItem('isAuthenticated')
    localStorage.removeItem('userName')
    localStorage.removeItem('permissions')
    localStorage.removeItem('userInfo')
  }
}
