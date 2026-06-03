import { PrototypeCard } from '../components/PrototypeCard'

export function RolePage() {
  return (
    <div className="page-stack">
      <div className="page-title"><h1>角色管理</h1></div>
      <PrototypeCard>
        <div className="empty-state">请在权限管理中维护角色。</div>
      </PrototypeCard>
    </div>
  )
}
