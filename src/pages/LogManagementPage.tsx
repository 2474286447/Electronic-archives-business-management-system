import { Button, Drawer, Tabs, Tag } from 'antd'
import { ModulePage } from '../components/ModulePage'
import { useState } from 'react'
import { AdminListPanel } from '../components/AdminListPanel'
import { systemAdminApi } from '../api/systemAdmin'

const operationStatus = {
  0: { text: '失败', color: 'red' },
  1: { text: '成功', color: 'green' }
}

const loginStatus = {
  0: { text: '失败', color: 'red' },
  1: { text: '成功', color: 'green' },
  2: { text: '退出', color: 'orange' }
}

export function LogManagementPage() {
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [errorInfo, setErrorInfo] = useState('')

  return (
    <ModulePage title="日志管理">
      <Tabs
        className="admin-tabs"
        items={[
          {
            key: 'operation',
            label: '操作日志',
            children: (
              <AdminListPanel
                title="操作日志"
                load={systemAdminApi.log.operation}
                searchFields={[{ name: 'status', label: '状态', type: 'select', options: [{ label: '失败', value: 0 }, { label: '成功', value: 1 }] }]}
                columns={[
                  { title: '操作人', dataIndex: 'creatorName', width: 140 },
                  { title: '操作', dataIndex: 'operation', width: 180, ellipsis: true },
                  { title: '请求地址', dataIndex: 'requestUri', width: 260, ellipsis: true },
                  { title: '方法', dataIndex: 'requestMethod', width: 100 },
                  { title: '耗时', dataIndex: 'requestTime', width: 100, render: (value) => `${value ?? 0}ms` },
                  { title: '状态', dataIndex: 'status', width: 100, tag: operationStatus },
                  { title: 'IP', dataIndex: 'ip', width: 140 },
                  { title: '创建时间', dataIndex: 'createDate', width: 180 }
                ]}
              />
            )
          },
          {
            key: 'login',
            label: '登录日志',
            children: (
              <AdminListPanel
                title="登录日志"
                load={systemAdminApi.log.login}
                searchFields={[
                  { name: 'creatorName', label: '用户名' },
                  { name: 'status', label: '状态', type: 'select', options: [{ label: '失败', value: 0 }, { label: '成功', value: 1 }, { label: '退出', value: 2 }] }
                ]}
                columns={[
                  { title: '用户名', dataIndex: 'creatorName', width: 150 },
                  { title: '操作', dataIndex: 'operation', width: 120, render: (value) => value === 0 ? '登录' : '退出' },
                  { title: '状态', dataIndex: 'status', width: 100, tag: loginStatus },
                  { title: 'IP', dataIndex: 'ip', width: 150 },
                  { title: 'User Agent', dataIndex: 'userAgent', width: 300, ellipsis: true },
                  { title: '创建时间', dataIndex: 'createDate', width: 180 }
                ]}
              />
            )
          },
          {
            key: 'error',
            label: '异常日志',
            children: (
              <AdminListPanel
                title="异常日志"
                load={systemAdminApi.log.error}
                columns={[
                  { title: '请求地址', dataIndex: 'requestUri', width: 260, ellipsis: true },
                  { title: '方法', dataIndex: 'requestMethod', width: 100 },
                  { title: '请求参数', dataIndex: 'requestParams', width: 220, ellipsis: true },
                  { title: 'IP', dataIndex: 'ip', width: 140 },
                  { title: 'User Agent', dataIndex: 'userAgent', width: 260, ellipsis: true },
                  { title: '创建时间', dataIndex: 'createDate', width: 180 }
                ]}
                extraActions={(row) => <Button size="small" type="link" onClick={() => { setErrorInfo(row.errorInfo || '暂无异常详情'); setDrawerOpen(true) }}>异常详情</Button>}
              />
            )
          }
        ]}
      />
      <Drawer title="异常详情" open={drawerOpen} width={860} onClose={() => setDrawerOpen(false)}>
        <pre className="error-dump">{errorInfo}</pre>
      </Drawer>
    </ModulePage>
  )
}


