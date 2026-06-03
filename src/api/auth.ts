import http, { getBaseURL } from './http'
import type { ApiResult, UserInfo } from '../types'

interface LoginRequest {
  username: string
  password: string
  encryptedPassword: string
  captcha: string
  uuid: string
  clientType: string
  deviceId: string
}

interface LoginResponse {
  token?: string
  user?: UserInfo
  permissions?: string[]
}

interface UserInfoResponse {
  user?: UserInfo
  permissions?: string[]
  roles?: string[]
  realName?: string
  username?: string
  superAdmin?: number
}

const joinUrl = (base: string, path: string) => `${base.replace(/\/$/, '')}${path}`

export const authApi = {
  login(data: LoginRequest) {
    return http.post('/login', data) as unknown as Promise<ApiResult<LoginResponse>>
  },
  faceLogin(userIdEncrypted: string) {
    return http.post('/auth/electron/faceLogin', { userIdEncrypted }) as unknown as Promise<ApiResult<LoginResponse>>
  },
  getPublicKey() {
    return http.get('/publicKey') as unknown as Promise<ApiResult<{ publicKey?: string } | string>>
  },
  getRsaPublicKey() {
    return http.get('/publicKey') as unknown as Promise<ApiResult<{ publicKey?: string } | string>>
  },
  getCaptchaImageUrl(uuid: string) {
    return joinUrl(getBaseURL(), `/captcha?uuid=${encodeURIComponent(uuid)}`)
  },
  logout() {
    return http.post('/logout') as unknown as Promise<ApiResult>
  },
  getCurrentUserPermissions() {
    return Promise.all([
      http.get('/sys/user/info') as unknown as Promise<ApiResult<UserInfoResponse>>,
      http.get('/sys/menu/permissions') as unknown as Promise<ApiResult<string[]>>
    ]).then(([info, permissions]) => ({
      ...info,
      data: {
        ...(typeof info.data === 'object' && info.data ? info.data : {}),
        user: info.data || info.user || info,
        permissions: permissions.data || permissions.permissions || []
      },
      permissions: permissions.data || permissions.permissions || []
    })) as unknown as Promise<ApiResult<UserInfoResponse>>
  },
  getCurrentUserMenus() {
    return http.get('/sys/menu/nav') as unknown as Promise<ApiResult<unknown[]>>
  },
  getProfile() {
    return http.get('/sys/user/info') as unknown as Promise<ApiResult<UserInfoResponse>>
  }
}

