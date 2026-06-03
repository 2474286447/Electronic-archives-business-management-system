import { PrototypeCard } from '../components/PrototypeCard'

export function UserPage() {
  return (
    <div className="page-stack">
      <div className="page-title"><h1>用户管理</h1></div>
      <PrototypeCard>
        <div className="empty-state">请在权限管理中维护用户。</div>
      </PrototypeCard>
    </div>
  )
}
