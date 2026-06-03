import { PrototypeCard } from '../components/PrototypeCard'
import type { AppRoute } from '../types'

export function PlaceholderPage({ route }: { route: AppRoute }) {
  return (
    <div className="page-stack">
      <div className="page-title">
        <div>
          <h1>{route.label}</h1>
          <p>当前模块正在建设中。</p>
        </div>
      </div>
      <PrototypeCard>
        <div className="empty-state">
          <strong>{route.path}</strong>
          <span>权限码：{route.permission || '无需权限'}</span>
        </div>
      </PrototypeCard>
    </div>
  )
}
