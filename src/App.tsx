import { Navigate, Route, Routes } from 'react-router-dom'
import type { ReactNode } from 'react'
import { ProtectedRoute } from './auth/ProtectedRoute'
import { AppShell } from './layouts/AppShell'
import { LoginPage } from './pages/LoginPage'
import { DashboardPage } from './pages/DashboardPage'
import { AccessManagementPage } from './pages/AccessManagementPage'
import { SystemSettingsPage } from './pages/SystemSettingsPage'
import { NoticeManagementPage } from './pages/NoticeManagementPage'
import { LogManagementPage } from './pages/LogManagementPage'
import { WarehouseRackPage } from './pages/WarehouseRackPage'
import { PlaceholderPage } from './pages/PlaceholderPage'
import { routes } from './routes'

const pageByPath: Record<string, ReactNode> = {
  '/dashboard': <DashboardPage />,
  '/access-management': <AccessManagementPage />,
  '/system-settings': <SystemSettingsPage />,
  '/notice-management': <NoticeManagementPage />,
  '/log-management': <LogManagementPage />,
  '/warehouse/rack': <WarehouseRackPage />
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/*"
        element={
          <ProtectedRoute>
            <AppShell />
          </ProtectedRoute>
        }
      >
        {routes.map((route) => (
          <Route
            key={route.path}
            path={route.path.replace(/^\//, '')}
            element={
              <ProtectedRoute permission={route.permission}>
                {pageByPath[route.path] || <PlaceholderPage route={route} />}
              </ProtectedRoute>
            }
          />
        ))}
      </Route>
    </Routes>
  )
}
