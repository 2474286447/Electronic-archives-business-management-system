import { useEffect, useMemo, useState } from 'react'
import type { Key } from 'react'
import { Button, Descriptions, Form, Input, Modal, Popconfirm, Select, Space, Table, Tag, message } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { Eye, Pencil, Plus, RefreshCcw, Search, Trash2 } from 'lucide-react'
import { ModulePage } from '../components/ModulePage'
import { configCenterApi } from '../api/configCenter'
import { getApiMessage, isApiSuccess } from '../api/result'
import { normalizeList, type AnyRecord } from '../api/systemAdmin'

const statusOptions = [
  { label: '启用', value: 1 },
  { label: '禁用', value: 0 }
]

const fieldLabels: Array<[string, string]> = [
  ['fondsCode', '全宗号'],
  ['fondsName', '全宗名称'],
  ['organizationName', '组织机构'],
  ['organizationCode', '组织机构代码'],
  ['contactPerson', '联系人'],
  ['contactPhone', '联系电话'],
  ['contactEmail', '联系邮箱'],
  ['address', '地址'],
  ['description', '全宗描述'],
  ['remark', '备注'],
  ['createUserName', '创建人'],
  ['createTime', '创建时间'],
  ['updateTime', '更新时间']
]

const normalizeStatus = (value: unknown) => {
  if (value === 0 || value === '0') return 0
  return 1
}

export function FondsManagementPage() {
  const [queryForm] = Form.useForm()
  const [editForm] = Form.useForm()
  const [rows, setRows] = useState<AnyRecord[]>([])
  const [selectedKeys, setSelectedKeys] = useState<Key[]>([])
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 })
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [viewOpen, setViewOpen] = useState(false)
  const [editing, setEditing] = useState<AnyRecord | null>(null)
  const [viewing, setViewing] = useState<AnyRecord | null>(null)

  const fetchRows = async (page = pagination.current, pageSize = pagination.pageSize) => {
    setLoading(true)
    try {
      const values = queryForm.getFieldsValue()
      const keyword = values.keyword?.trim()
      const params = {
        page,
        limit: pageSize,
        fondsCode: keyword || undefined,
        fondsName: keyword || undefined,
        status: values.status
      }
      const res = await configCenterApi.fonds.page(params)
      if (res?.code !== undefined && !isApiSuccess(res)) throw new Error(getApiMessage(res, '获取全宗列表失败'))
      const { list, total } = normalizeList(res)
      setRows(list)
      setPagination({ current: page, pageSize, total })
    } catch (error) {
      message.error(error instanceof Error ? error.message : '获取全宗列表失败')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchRows(1, pagination.pageSize)
  }, [])

  const openCreate = () => {
    setEditing(null)
    editForm.resetFields()
    editForm.setFieldsValue({ status: 1 })
    setModalOpen(true)
  }

  const openEdit = async (row: AnyRecord) => {
    setEditing(row)
    editForm.setFieldsValue({ ...row, status: normalizeStatus(row.status) })
    setModalOpen(true)
    try {
      const res = await configCenterApi.fonds.detail(row.id)
      if (res?.code !== undefined && !isApiSuccess(res)) throw new Error(getApiMessage(res, '获取全宗详情失败'))
      editForm.setFieldsValue({ ...(res.data || row), status: normalizeStatus(res.data?.status ?? row.status) })
    } catch (error) {
      message.error(error instanceof Error ? error.message : '获取全宗详情失败')
    }
  }

  const openView = async (row: AnyRecord) => {
    setViewing(row)
    setViewOpen(true)
    try {
      const res = await configCenterApi.fonds.detail(row.id)
      if (res?.code !== undefined && !isApiSuccess(res)) throw new Error(getApiMessage(res, '获取全宗详情失败'))
      setViewing(res.data || row)
    } catch (error) {
      message.error(error instanceof Error ? error.message : '获取全宗详情失败')
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const values = await editForm.validateFields()
      const res = editing?.id
        ? await configCenterApi.fonds.update(editing.id, values)
        : await configCenterApi.fonds.create(values)
      if (res?.code !== undefined && !isApiSuccess(res)) throw new Error(getApiMessage(res, '保存全宗失败'))
      message.success('保存成功')
      setModalOpen(false)
      fetchRows(editing?.id ? pagination.current : 1, pagination.pageSize)
    } catch (error) {
      if (!(error as any)?.errorFields) message.error(error instanceof Error ? error.message : '保存全宗失败')
    } finally {
      setSaving(false)
    }
  }

  const handleRemove = async (id: string | number) => {
    const res = await configCenterApi.fonds.remove(id)
    if (res?.code !== undefined && !isApiSuccess(res)) {
      message.error(getApiMessage(res, '删除失败'))
      return
    }
    message.success('删除成功')
    fetchRows()
  }

  const handleBatchRemove = async () => {
    const ids = selectedKeys.map((key) => String(key))
    const res = await configCenterApi.fonds.batchRemove(ids)
    if (res?.code !== undefined && !isApiSuccess(res)) {
      message.error(getApiMessage(res, '批量删除失败'))
      return
    }
    message.success('批量删除成功')
    setSelectedKeys([])
    fetchRows(1, pagination.pageSize)
  }

  const columns = useMemo<ColumnsType<AnyRecord>>(() => [
    { title: '全宗号', dataIndex: 'fondsCode', width: 150, fixed: 'left', render: (value, row) => <Button type="link" size="small" onClick={() => openView(row)}>{value || '-'}</Button> },
    { title: '全宗名称', dataIndex: 'fondsName', width: 190, ellipsis: true },
    { title: '组织机构', dataIndex: 'organizationName', width: 180, ellipsis: true },
    { title: '联系人', dataIndex: 'contactPerson', width: 110 },
    { title: '联系电话', dataIndex: 'contactPhone', width: 140 },
    { title: '状态', dataIndex: 'status', width: 90, render: (value) => normalizeStatus(value) === 1 ? <Tag color="green">启用</Tag> : <Tag color="red">禁用</Tag> },
    { title: '创建时间', dataIndex: 'createTime', width: 170, render: (value) => value || '-' },
    {
      title: '操作',
      key: 'actions',
      fixed: 'right',
      width: 190,
      render: (_, row) => (
        <Space size="small">
          <Button size="small" icon={<Eye size={14} />} onClick={() => openView(row)}>查看</Button>
          <Button size="small" icon={<Pencil size={14} />} onClick={() => openEdit(row)}>编辑</Button>
          <Popconfirm title="确认删除该全宗？" onConfirm={() => handleRemove(row.id)}>
            <Button danger size="small" icon={<Trash2 size={14} />}>删除</Button>
          </Popconfirm>
        </Space>
      )
    }
  ], [pagination.current, pagination.pageSize])

  return (
    <ModulePage title="全宗管理" description="维护档案业务中的全宗基础信息、组织机构与联系人信息">
      <Form className="filter-form" form={queryForm} layout="inline" onFinish={() => fetchRows(1, pagination.pageSize)}>
        <Form.Item label="关键词" name="keyword">
          <Input allowClear placeholder="搜索全宗号、全宗名称" />
        </Form.Item>
        <Form.Item label="状态" name="status">
          <Select allowClear options={statusOptions} placeholder="全部状态" />
        </Form.Item>
        <Form.Item className="filter-actions-item">
          <Space>
            <Button type="primary" icon={<Search size={15} />} htmlType="submit">查询</Button>
            <Button icon={<RefreshCcw size={15} />} onClick={() => { queryForm.resetFields(); fetchRows(1, pagination.pageSize) }}>重置</Button>
          </Space>
        </Form.Item>
      </Form>

      <div className="admin-panel">
        <div className="admin-panel-head">
          <div>
            <h2>全宗列表</h2>
            <p>共 {pagination.total} 条记录</p>
          </div>
          <Space>
            {selectedKeys.length ? (
              <Popconfirm title={`确认删除选中的 ${selectedKeys.length} 个全宗？`} onConfirm={handleBatchRemove}>
                <Button danger icon={<Trash2 size={15} />}>批量删除 ({selectedKeys.length})</Button>
              </Popconfirm>
            ) : null}
            <Button type="primary" icon={<Plus size={15} />} onClick={openCreate}>新增全宗</Button>
          </Space>
        </div>
        <Table
          rowKey="id"
          columns={columns}
          dataSource={rows}
          loading={loading}
          rowSelection={{ selectedRowKeys: selectedKeys, onChange: setSelectedKeys }}
          scroll={{ x: 1250 }}
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: pagination.total,
            showSizeChanger: true,
            showTotal: (total) => `共 ${total} 条`,
            onChange: fetchRows
          }}
        />
      </div>

      <Modal title={editing?.id ? '编辑全宗' : '新增全宗'} open={modalOpen} onCancel={() => setModalOpen(false)} onOk={handleSave} confirmLoading={saving} width={760}>
        <Form className="config-form-grid" form={editForm} layout="vertical">
          <Form.Item label="全宗号" name="fondsCode" rules={[{ required: true, message: '请输入全宗号' }]}>
            <Input placeholder="请输入全宗号" />
          </Form.Item>
          <Form.Item label="全宗名称" name="fondsName" rules={[{ required: true, message: '请输入全宗名称' }]}>
            <Input placeholder="请输入全宗名称" />
          </Form.Item>
          <Form.Item label="组织机构" name="organizationName">
            <Input placeholder="请输入组织机构" />
          </Form.Item>
          <Form.Item label="组织机构代码" name="organizationCode">
            <Input placeholder="请输入组织机构代码" />
          </Form.Item>
          <Form.Item label="联系人" name="contactPerson">
            <Input placeholder="请输入联系人" />
          </Form.Item>
          <Form.Item label="联系电话" name="contactPhone">
            <Input placeholder="请输入联系电话" />
          </Form.Item>
          <Form.Item label="联系邮箱" name="contactEmail">
            <Input placeholder="请输入联系邮箱" />
          </Form.Item>
          <Form.Item label="状态" name="status" rules={[{ required: true, message: '请选择状态' }]}>
            <Select options={statusOptions} />
          </Form.Item>
          <Form.Item className="config-form-span" label="地址" name="address">
            <Input placeholder="请输入地址" />
          </Form.Item>
          <Form.Item className="config-form-span" label="全宗描述" name="description">
            <Input.TextArea rows={3} placeholder="请输入全宗描述" />
          </Form.Item>
          <Form.Item className="config-form-span" label="备注" name="remark">
            <Input.TextArea rows={2} placeholder="请输入备注" />
          </Form.Item>
        </Form>
      </Modal>

      <Modal title="全宗详情" open={viewOpen} onCancel={() => setViewOpen(false)} footer={<Button onClick={() => setViewOpen(false)}>关闭</Button>} width={820}>
        <Descriptions bordered column={2} size="small">
          {fieldLabels.map(([key, label]) => (
            <Descriptions.Item key={key} label={label}>
              {viewing?.[key] || '-'}
            </Descriptions.Item>
          ))}
          <Descriptions.Item label="状态">
            {normalizeStatus(viewing?.status) === 1 ? <Tag color="green">启用</Tag> : <Tag color="red">禁用</Tag>}
          </Descriptions.Item>
        </Descriptions>
      </Modal>
    </ModulePage>
  )
}
