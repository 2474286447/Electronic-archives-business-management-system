import type { ApiResult } from '../types'

export function isApiSuccess(result?: ApiResult | null) {
  return result?.code === 0 || result?.code === 200 || result?.code === 10051
}

export function getApiMessage(result?: ApiResult | null, fallback = '接口请求失败') {
  return result?.msg || result?.message || fallback
}
