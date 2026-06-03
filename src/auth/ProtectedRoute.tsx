import { Navigate, useLocation } from 'react-router-dom'
import type { WithChildren } from '../types'
import { useAuth } from './AuthProvider'
import { hasPermission } from '../utils/permission'

interface ProtectedRouteProps extends WithChildren {
  permission?: string | null
}

export function ProtectedRoute({ children, permission }: ProtectedRouteProps) {
  const location = useLocation()
  const { isAuthenticated, permissions } = useAuth()

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }

  if (!hasPermission(permission, permissions)) {
    return <Navigate to="/dashboard" replace />
  }

  return children
}
