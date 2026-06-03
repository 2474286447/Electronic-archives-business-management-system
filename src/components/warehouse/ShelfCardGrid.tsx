import type { CSSProperties } from 'react'
import { Button, Tag } from 'antd'
import { CircleAlert, CircleCheck, CircleSlash, Edit, Eye, Trash2 } from 'lucide-react'

export type ShelfOnlineStatus = 'online' | 'error' | 'offline'
export type ShelfManageStatus = 'active' | 'disabled'

export interface ShelfCardItem {
  id: string
  name: string
  code: string
  type: string
  warehouse: string
  area: string
  structure: string
  used: number
  capacity: number
  archiveBoxCount: number
  onlineStatus: ShelfOnlineStatus
  manageStatus: ShelfManageStatus
  remark?: string
  ipAddress?: string
  macAddress?: string
}

interface ShelfCardGridProps {
  items: ShelfCardItem[]
  columns?: 3 | 4
  onView?: (item: ShelfCardItem) => void
  onEdit?: (item: ShelfCardItem) => void
  onDelete?: (item: ShelfCardItem) => void
}

const onlineStatusMeta: Record<ShelfOnlineStatus, { label: string; className: string; icon: typeof CircleCheck }> = {
  online: { label: '在线', className: 'success', icon: CircleCheck },
  offline: { label: '离线', className: 'muted', icon: CircleSlash },
  error: { label: '异常', className: 'danger', icon: CircleAlert }
}

const typeColorMap: Record<string, string> = {
  智能密集架: 'blue',
  手摇密集架: 'cyan',
  RFID档案柜: 'purple',
  防潮防磁柜: 'green',
  固定货架: 'default'
}

function canShowOnlineStatus(type: string) {
  return type === '智能密集架' || type === 'RFID档案柜'
}

function ShelfCard({ item, onView, onEdit, onDelete }: { item: ShelfCardItem; onView?: (item: ShelfCardItem) => void; onEdit?: (item: ShelfCardItem) => void; onDelete?: (item: ShelfCardItem) => void }) {
  const usageRate = item.capacity > 0 ? Math.round((item.used / item.capacity) * 100) : 0
  const status = onlineStatusMeta[item.onlineStatus]
  const StatusIcon = status.icon

  return (
    <article className="shelf-card">
      <div className="shelf-card-top">
        <div className="shelf-card-head">
          <div className="shelf-title">
            <strong>{item.name}</strong>
            <span>{item.code}</span>
          </div>
          <div className="shelf-tags">
            <Tag color={typeColorMap[item.type] || 'blue'}>{item.type}</Tag>
            {canShowOnlineStatus(item.type) ? (
              <span className={`shelf-state ${status.className}`}>
                <StatusIcon size={9} />
                {status.label}
              </span>
            ) : null}
          </div>
        </div>

        <div className="shelf-location">
          <span>{item.warehouse}</span>
          <b>›</b>
          <span>{item.area}</span>
        </div>
      </div>

      <div className="shelf-card-body">
        <div className="shelf-structure">{item.structure}</div>
        <div className="shelf-status-line shelf-status-inline">
          {canShowOnlineStatus(item.type) ? (
            <span className={`shelf-state ${status.className}`}>
              <StatusIcon size={11} />
              {status.label}
            </span>
          ) : (
            <span />
          )}
          <i className={item.manageStatus === 'active' ? 'active' : ''}>{item.manageStatus === 'active' ? '启用' : '停用'}</i>
        </div>
        <div className="shelf-usage-label">容量使用</div>
        <div className="shelf-usage">
          <b className={usageRate >= 90 ? 'danger' : ''}>{usageRate}%</b>
          <span>
            <strong>{item.used}</strong>
            <em> / {item.capacity}</em>
          </span>
        </div>
        <div className="shelf-progress" aria-label={`容量使用率 ${usageRate}%`}>
          <span style={{ width: `${usageRate}%` }} className={usageRate >= 90 ? 'danger' : usageRate >= 80 ? 'warning' : ''} />
        </div>
      </div>

      <div className="shelf-actions">
        <Button size="small" icon={<Eye size={13} />} onClick={() => onView?.(item)}>
          查看
        </Button>
        <Button size="small" icon={<Edit size={13} />} onClick={() => onEdit?.(item)}>
          编辑
        </Button>
        <Button size="small" danger icon={<Trash2 size={13} />} onClick={() => onDelete?.(item)}>
          删除
        </Button>
      </div>
    </article>
  )
}

export function ShelfCardGrid({ items, columns = 4, onView, onEdit, onDelete }: ShelfCardGridProps) {
  return (
    <div className="shelf-card-grid" style={{ '--shelf-grid-columns': columns } as CSSProperties}>
      {items.map((item) => (
        <ShelfCard key={item.id} item={item} onView={onView} onEdit={onEdit} onDelete={onDelete} />
      ))}
    </div>
  )
}
