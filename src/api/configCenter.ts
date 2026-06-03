import http from './http'
import type { ApiResult } from '../types'
import type { AnyRecord, PageQuery, PageData } from './systemAdmin'

const cleanPayload = (data: AnyRecord) => {
  const next = { ...data }
  Object.keys(next).forEach((key) => {
    if (next[key] === undefined || next[key] === '') delete next[key]
  })
  return next
}

export const configCenterApi = {
  fonds: {
    page: (params?: PageQuery) => http.get('/fonds/page', { params }) as unknown as Promise<ApiResult<PageData>>,
    list: () => http.get('/fonds/list') as unknown as Promise<ApiResult<AnyRecord[]>>,
    detail: (id: string | number) => http.get(`/fonds/${id}`) as unknown as Promise<ApiResult<AnyRecord>>,
    byCode: (fondsCode: string) => http.get(`/fonds/code/${fondsCode}`) as unknown as Promise<ApiResult<AnyRecord>>,
    create: (data: AnyRecord) => http.post('/fonds', cleanPayload(data)) as unknown as Promise<ApiResult>,
    update: (id: string | number, data: AnyRecord) => http.put(`/fonds/${id}`, cleanPayload(data)) as unknown as Promise<ApiResult>,
    remove: (id: string | number) => http.delete(`/fonds/${id}`) as unknown as Promise<ApiResult>,
    batchRemove: (ids: Array<string | number>) => http.delete('/fonds/batch', { data: ids }) as unknown as Promise<ApiResult>
  },
  archiveCategory: {
    tree: () => http.get('/archive-category/tree') as unknown as Promise<ApiResult<AnyRecord[]>>,
    enabledTree: () => http.get('/archive-category/tree/enabled') as unknown as Promise<ApiResult<AnyRecord[]>>,
    list: () => http.get('/archive-category/list') as unknown as Promise<ApiResult<AnyRecord[]>>,
    detail: (id: string | number) => http.get(`/archive-category/${id}`) as unknown as Promise<ApiResult<AnyRecord>>,
    byCode: (categoryCode: string) => http.get(`/archive-category/code/${categoryCode}`) as unknown as Promise<ApiResult<AnyRecord>>,
    create: (data: AnyRecord) => http.post('/archive-category', cleanPayload(data)) as unknown as Promise<ApiResult>,
    update: (id: string | number, data: AnyRecord) => http.put(`/archive-category/${id}`, cleanPayload(data)) as unknown as Promise<ApiResult>,
    remove: (id: string | number) => http.delete(`/archive-category/${id}`) as unknown as Promise<ApiResult>
  }
}
