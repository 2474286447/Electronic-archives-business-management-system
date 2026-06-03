import { Button, Table, Tag } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { PrototypeCard } from '../components/PrototypeCard'

const permissions = ['USER_MANAGE', 'ROLE_MANAGE', 'PERMISSION_MANAGE', 'ARCHIVE_MANAGE', 'RFID_RESOURCE_MANAGE', 'SYSTEM_CONFIG']

interface PermissionRow {
  key: string
  code: string
  scope: string
  status: string
}

const dataSource: PermissionRow[] = permissions.map((permission) => ({
  key: permission,
  code: permission,
  scope: '权限守卫',
  status: '启用'
}))

const columns: ColumnsType<PermissionRow> = [
  {
    title: '权限编码',
    dataIndex: 'code',
    render: (value: string) => <strong>{value}</strong>
  },
  {
    title: '模块范围',
    dataIndex: 'scope'
  },
  {
    title: '状态',
    dataIndex: 'status',
    width: 100,
    render: (value: string) => <Tag color="green">{value}</Tag>
  }
]

export function PermissionPage() {
  return (
    <div className="page-stack">
      <div className="page-title">
        <div>
          <h1>权限管理</h1>
          <p>权限编码、权限判断和受保护路由已接入。</p>
        </div>
      </div>
      <PrototypeCard>
        <div className="table-toolbar">
          <h2>权限编码</h2>
          <Button type="primary">同步权限</Button>
        </div>
        <Table columns={columns} dataSource={dataSource} pagination={false} size="middle" />
      </PrototypeCard>
    </div>
  )
}
