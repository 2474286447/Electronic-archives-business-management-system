import http, { getBaseURL } from './http'
import type { ApiResult } from '../types'

export type AnyRecord = Record<string, any>

export interface PageQuery extends AnyRecord {
  page?: number
  limit?: number
  order?: string
  orderField?: string
}

export interface PageData<T = AnyRecord> {
  list?: T[]
  records?: T[]
  total?: number
  [key: string]: any
}

export const normalizeList = <T = AnyRecord>(payload: any): { list: T[]; total: number } => {
  const data = payload?.data ?? payload
  const list = Array.isArray(data) ? data : data?.list ?? data?.records ?? data?.rows ?? []
  const total = Array.isArray(data) ? data.length : data?.total ?? data?.totalCount ?? list.length ?? 0
  return { list, total }
}

const requestList = (url: string, params?: PageQuery) => http.get(url, { params }) as unknown as Promise<ApiResult<PageData>>
const requestDetail = (url: string, id: string | number) => http.get(`${url}/${id}`) as unknown as Promise<ApiResult<AnyRecord>>
const createItem = (url: string, data: AnyRecord) => http.post(url, data) as unknown as Promise<ApiResult>
const updateItem = (url: string, data: AnyRecord) => http.put(url, data) as unknown as Promise<ApiResult>
const deleteItem = (url: string, id: string | number) => http.delete(url, { data: [id] }) as unknown as Promise<ApiResult>
const deletePathItem = (url: string, id: string | number) => http.delete(`${url}/${id}`) as unknown as Promise<ApiResult>

export const systemAdminApi = {
  user: {
    page: (params?: PageQuery) => requestList('/sys/user/page', params),
    detail: (id: string | number) => requestDetail('/sys/user', id),
    save: (data: AnyRecord) => (data.id ? updateItem('/sys/user', data) : createItem('/sys/user', data)),
    remove: (id: string | number) => deleteItem('/sys/user', id),
    resetPassword: (id: string | number) => http.put(`/sys/user/${id}/reset-password`) as unknown as Promise<ApiResult>,
    roles: () => http.get('/sys/role/list') as unknown as Promise<ApiResult<AnyRecord[]>>,
    posts: () => http.get('/sys/post/list') as unknown as Promise<ApiResult<AnyRecord[]>>
  },
  role: {
    page: (params?: PageQuery) => requestList('/sys/role/page', params),
    detail: (id: string | number) => requestDetail('/sys/role', id),
    save: (data: AnyRecord) => (data.id ? updateItem('/sys/role', data) : createItem('/sys/role', data)),
    remove: (id: string | number) => deleteItem('/sys/role', id),
    menuSelect: () => http.get('/sys/menu/select') as unknown as Promise<ApiResult<AnyRecord[]>>
  },
  menu: {
    list: (params?: PageQuery) => requestList('/sys/menu/list', params),
    detail: (id: string | number) => requestDetail('/sys/menu', id),
    save: (data: AnyRecord) => (data.id ? updateItem('/sys/menu', data) : createItem('/sys/menu', data)),
    remove: (id: string | number) => deletePathItem('/sys/menu', id),
    select: () => http.get('/sys/menu/select') as unknown as Promise<ApiResult<AnyRecord[]>>
  },
  dept: {
    list: (params?: PageQuery) => requestList('/sys/dept/list', params),
    detail: (id: string | number) => requestDetail('/sys/dept', id),
    save: (data: AnyRecord) => (data.id ? updateItem('/sys/dept', data) : createItem('/sys/dept', data)),
    remove: (id: string | number) => deletePathItem('/sys/dept', id)
  },
  post: {
    page: (params?: PageQuery) => requestList('/sys/post/page', params),
    detail: (id: string | number) => requestDetail('/sys/post', id),
    save: (data: AnyRecord) => (data.id ? updateItem('/sys/post', data) : createItem('/sys/post', data)),
    remove: (id: string | number) => deleteItem('/sys/post', id)
  },
  params: {
    page: (params?: PageQuery) => requestList('/sys/params/page', params),
    detail: (id: string | number) => requestDetail('/sys/params', id),
    save: (data: AnyRecord) => (data.id ? updateItem('/sys/params', data) : createItem('/sys/params', data)),
    remove: (id: string | number) => deleteItem('/sys/params', id),
    byKey: (key: string) => http.get('/sys/params/key', { params: { key } }) as unknown as Promise<ApiResult<string>>
  },
  dictType: {
    page: (params?: PageQuery) => requestList('/sys/dict/type/page', params),
    detail: (id: string | number) => requestDetail('/sys/dict/type', id),
    save: (data: AnyRecord) => (data.id ? updateItem('/sys/dict/type', data) : createItem('/sys/dict/type', data)),
    remove: (id: string | number) => deleteItem('/sys/dict/type', id)
  },
  dictData: {
    page: (params?: PageQuery) => requestList('/sys/dict/data/page', params),
    detail: (id: string | number) => requestDetail('/sys/dict/data', id),
    save: (data: AnyRecord) => (data.id ? updateItem('/sys/dict/data', data) : createItem('/sys/dict/data', data)),
    remove: (id: string | number) => deleteItem('/sys/dict/data', id)
  },
  online: {
    page: (params?: PageQuery) => requestList('/sys/online/page', params),
    logout: (id: string | number) => http.post(`/sys/online/logout?id=${id}`) as unknown as Promise<ApiResult>
  },
  notice: {
    page: (params?: PageQuery) => requestList('/sys/notice/page', params),
    myPage: (params?: PageQuery) => requestList('/sys/notice/mynotice/page', params),
    userPage: (params?: PageQuery) => requestList('/sys/notice/user/page', params),
    detail: (id: string | number) => requestDetail('/sys/notice', id),
    save: (data: AnyRecord) => (data.id ? updateItem('/sys/notice', data) : createItem('/sys/notice', data)),
    remove: (id: string | number) => deleteItem('/sys/notice', id),
    markRead: (id: string | number) => http.put(`/sys/notice/mynotice/read/${id}`) as unknown as Promise<ApiResult>,
    uploadUrl: () => `${getBaseURL().replace(/\/$/, '')}/sys/oss/upload`
  },
  log: {
    operation: (params?: PageQuery) => requestList('/sys/log/operation/page', params),
    login: (params?: PageQuery) => requestList('/sys/log/login/page', params),
    error: (params?: PageQuery) => requestList('/sys/log/error/page', params)
  }
}
