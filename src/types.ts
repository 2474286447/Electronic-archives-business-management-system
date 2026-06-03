import type { ReactNode } from 'react'

export type PermissionCode = string | null

export interface AppRoute {
  path: string
  label: string
  permission: PermissionCode
  group: string
}

export interface UserInfo {
  id?: string | number
  userId?: string | number
  username?: string
  userName?: string
  realName?: string
  nickName?: string
  [key: string]: unknown
}

export interface AuthSession {
  token?: string
  user?: UserInfo | null
  permissions?: string[]
}

export interface ApiResult<T = unknown> {
  code?: number
  msg?: string
  message?: string
  data?: T
  token?: string
  user?: UserInfo
  permissions?: string[]
  roles?: string[]
  routers?: unknown[]
  [key: string]: unknown
}

export interface SystemConfig {
  platform: {
    systemName: string
    systemSubtitle: string
    version: string
    copyright: string
  }
  login: {
    title: string
    subtitle: string
    showCopyright: boolean
    showVersion: boolean
    showTechnicalSupport: boolean
    technicalSupport: string
  }
  faceService: {
    ip: string
    port: string
  }
}

export interface WithChildren {
  children: ReactNode
}
