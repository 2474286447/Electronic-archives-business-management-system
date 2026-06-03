import http from './http'
import type { ApiResult, SystemConfig } from '../types'

export const defaultSystemConfig: SystemConfig = {
  platform: {
    systemName: '智慧档案',
    systemSubtitle: 'RFID 档案资料管理平台',
    version: 'v2.4.1',
    copyright: '© 2026 北京合泰信安信息技术有限公司'
  },
  login: {
    title: '公安经侦档案资料管理平台',
    subtitle: '智慧档案 · 安全高效 · 精准管理',
    showCopyright: true,
    showVersion: true,
    showTechnicalSupport: true,
    technicalSupport: 'support@archive-system.com'
  },
  faceService: {
    ip: '127.0.0.1',
    port: '7890'
  }
}

interface SystemConfigApiPayload {
  baseInfo?: {
    systemMainName?: string
    systemSubTitle?: string
    versionNo?: string
    versionInfo?: string
  }
  loginPage?: {
    loginMainTitle?: string
    loginSubTitle?: string
    showVersionInfo?: number | string
    showVersionNo?: number | string
    showSupport?: number | string
    supportEmail?: string
  }
  faceAddr?: {
    faceIp?: string
    facePort?: number | string
  }
}

export const normalizeSystemConfigFromApi = (data: SystemConfigApiPayload = {}): SystemConfig => ({
  platform: {
    ...defaultSystemConfig.platform,
    systemName: data.baseInfo?.systemMainName ?? defaultSystemConfig.platform.systemName,
    systemSubtitle: data.baseInfo?.systemSubTitle ?? defaultSystemConfig.platform.systemSubtitle,
    version: data.baseInfo?.versionNo ?? defaultSystemConfig.platform.version,
    copyright: data.baseInfo?.versionInfo ?? defaultSystemConfig.platform.copyright
  },
  login: {
    ...defaultSystemConfig.login,
    title: data.loginPage?.loginMainTitle ?? defaultSystemConfig.login.title,
    subtitle: data.loginPage?.loginSubTitle ?? defaultSystemConfig.login.subtitle,
    showCopyright: Number(data.loginPage?.showVersionInfo ?? 1) === 1,
    showVersion: Number(data.loginPage?.showVersionNo ?? 1) === 1,
    showTechnicalSupport: Number(data.loginPage?.showSupport ?? 1) === 1,
    technicalSupport: data.loginPage?.supportEmail ?? defaultSystemConfig.login.technicalSupport
  },
  faceService: {
    ...defaultSystemConfig.faceService,
    ip: data.faceAddr?.faceIp ?? defaultSystemConfig.faceService.ip,
    port: String(data.faceAddr?.facePort ?? defaultSystemConfig.faceService.port)
  }
})

export const systemConfigApi = {
  getAllConfig() {
    return http.get('/sys/config-info') as unknown as Promise<ApiResult<SystemConfigApiPayload>>
  }
}
