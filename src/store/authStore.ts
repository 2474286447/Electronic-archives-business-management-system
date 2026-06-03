import { create } from 'zustand'
import { authApi } from '../api/auth'
import { isApiSuccess } from '../api/result'
import type { AuthSession, UserInfo } from '../types'
import { authStorage } from '../utils/storage'

interface AuthState {
  token: string
  user: UserInfo | null
  permissions: string[]
  menus: unknown[]
  loadingMenus: boolean
  setSession: (session: AuthSession) => void
  clearAuth: () => void
  loadMenus: (force?: boolean) => Promise<unknown[]>
}

export const useAuthStore = create<AuthState>((set, get) => ({
  token: authStorage.getToken(),
  user: authStorage.getUserInfo(),
  permissions: authStorage.getPermissions(),
  menus: [],
  loadingMenus: false,
  setSession(session) {
    authStorage.setSession(session)
    set({
      token: session.token || '',
      user: session.user || null,
      permissions: session.permissions || []
    })
  },
  clearAuth() {
    authStorage.clearSession()
    set({
      token: '',
      user: null,
      permissions: [],
      menus: [],
      loadingMenus: false
    })
  },
  async loadMenus(force = false) {
    const state = get()
    if (!authStorage.getToken()) {
      set({ menus: [] })
      return []
    }
    if (!force && state.menus.length > 0) return state.menus

    set({ loadingMenus: true })
    try {
      const res = await authApi.getCurrentUserMenus()
      if (isApiSuccess(res)) {
        const data = res.data as any
        const menus = Array.isArray(data) ? data : Array.isArray(data?.list) ? data.list : Array.isArray(res.routers) ? res.routers : []
        set({ menus })
        return menus
      }
    } catch (error) {
      console.warn('加载用户菜单失败:', error)
    } finally {
      set({ loadingMenus: false })
    }
    return get().menus
  }
}))



