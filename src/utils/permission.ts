import { authStorage } from './storage'

export function hasPermission(permissionCode: string | null | undefined, permissions = authStorage.getPermissions()) {
  if (!permissionCode) return true
  if (permissions.includes('*:*:*') || permissions.includes('admin') || permissions.includes('SUPER_ADMIN')) return true
  return permissions.includes(permissionCode)
}

export function hasAnyPermission(permissionCodes: string[] = [], permissions = authStorage.getPermissions()) {
  if (!permissionCodes.length) return true
  return permissionCodes.some((code) => hasPermission(code, permissions))
}

export function hasAllPermissions(permissionCodes: string[] = [], permissions = authStorage.getPermissions()) {
  if (!permissionCodes.length) return true
  return permissionCodes.every((code) => hasPermission(code, permissions))
}
