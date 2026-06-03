import { useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { Button, Form, Input, InputNumber, Modal, Popconfirm, Select, Space, Table, Tag, message } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import type { AnyRecord, PageQuery } from '../api/systemAdmin'
import { getApiMessage, isApiSuccess } from '../api/result'

export interface AdminColumn {
  title: string
  dataIndex: string
  width?: number
  ellipsis?: boolean
  tag?: Record<string | number, { text: string; color: string }>
  render?: (value: any, row: AnyRecord) => ReactNode
}

export interface AdminField {
  name: string
  label: string
  type?: 'text' | 'textarea' | 'number' | 'select' | 'password'
  required?: boolean
  options?: { label: string; value: string | number }[]
  hidden?: boolean
}

interface AdminListPanelProps {
  title: string
  description?: string
  rowKey?: string
  paged?: boolean
  columns: AdminColumn[]
  searchFields?: AdminField[]
  formFields?: AdminField[]
  load: (params: PageQuery) => Promise<any>
  detail?: (id: string | number) => Promise<any>
  save?: (data: AnyRecord) => Promise<any>
  remove?: (id: string | number) => Promise<any>
  extraActions?: (row: AnyRecord, reload: () => void) => ReactNode
  beforeSave?: (data: AnyRecord) => AnyRecord
}

const normalizePage = (payload: any) => {
  const data = payload?.data ?? payload
  const list = Array.isArray(data) ? data : data?.list ?? data?.records ?? data?.rows ?? []
  const total = Array.isArray(data) ? data.length : data?.total ?? data?.totalCount ?? list.length ?? 0
  return { list, total }
}

const renderField = (field: AdminField) => {
  if (field.type === 'textarea') return <Input.TextArea rows={4} />
  if (field.type === 'number') return <InputNumber className="full-control" />
  if (field.type === 'select') return <Select className="full-control" allowClear options={field.options || []} />
  if (field.type === 'password') return <Input.Password />
  return <Input allowClear />
}

export function AdminListPanel({
  title,
  description,
  rowKey = 'id',
  paged = true,
  columns,
  searchFields = [],
  formFields = [],
  load,
  detail,
  save,
  remove,
  extraActions,
  beforeSave
}: AdminListPanelProps) {
  const [queryForm] = Form.useForm()
  const [editForm] = Form.useForm()
  const [rows, setRows] = useState<AnyRecord[]>([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | number | null>(null)
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 })

  const fetchRows = async (page = pagination.current, pageSize = pagination.pageSize) => {
    setLoading(true)
    try {
      const values = queryForm.getFieldsValue()
      const params = { ...values, page: paged ? page : undefined, limit: paged ? pageSize : undefined }
      const res = await load(params)
      if (res?.code !== undefined && !isApiSuccess(res)) {
        throw new Error(getApiMessage(res, '加载数据失败'))
      }
      const { list, total } = normalizePage(res)
      setRows(list)
      setPagination({ current: page, pageSize, total })
    } catch (error) {
      message.error(error instanceof Error ? error.message : '加载数据失败')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchRows(1, pagination.pageSize)
  }, [])

  const tableColumns = useMemo<ColumnsType<AnyRecord>>(() => {
    const base: ColumnsType<AnyRecord> = columns.map((column) => ({
      title: column.title,
      dataIndex: column.dataIndex,
      width: column.width,
      ellipsis: column.ellipsis,
      render: (value: any, row: AnyRecord) => {
        if (column.render) return column.render(value, row)
        if (column.tag) {
          const meta = column.tag[value] || { text: String(value ?? '-'), color: 'default' }
          return <Tag color={meta.color}>{meta.text}</Tag>
        }
        return value ?? '-'
      }
    }))

    if (!save && !remove && !extraActions) return base
    base.push({
      title: '操作',
      key: 'actions',
      fixed: 'right',
      width: 190,
      render: (_: any, row: AnyRecord) => (
        <Space size="small">
          {save ? <Button size="small" type="link" onClick={() => openEdit(row)}>编辑</Button> : null}
          {remove ? (
            <Popconfirm title="确认删除这条数据？" onConfirm={() => handleRemove(row[rowKey])}>
              <Button danger size="small" type="link">删除</Button>
            </Popconfirm>
          ) : null}
          {extraActions?.(row, () => fetchRows())}
        </Space>
      )
    })
    return base
  }, [columns, save, remove, extraActions, rows])

  const openCreate = () => {
    setEditingId(null)
    editForm.resetFields()
    setModalOpen(true)
  }

  const openEdit = async (row: AnyRecord) => {
    const id = row[rowKey]
    setEditingId(id)
    editForm.setFieldsValue(row)
    setModalOpen(true)
    if (detail && id !== undefined && id !== null) {
      try {
        const res = await detail(id)
        if (res?.code !== undefined && !isApiSuccess(res)) throw new Error(getApiMessage(res, '获取详情失败'))
        editForm.setFieldsValue(res.data || row)
      } catch (error) {
        message.error(error instanceof Error ? error.message : '获取详情失败')
      }
    }
  }

  const handleSave = async () => {
    if (!save) return
    setSaving(true)
    try {
      const values = await editForm.validateFields()
      const payload = beforeSave ? beforeSave({ ...values, id: editingId ?? values.id }) : { ...values, id: editingId ?? values.id }
      const res = await save(payload)
      if (res?.code !== undefined && !isApiSuccess(res)) throw new Error(getApiMessage(res, '保存失败'))
      message.success('保存成功')
      setModalOpen(false)
      fetchRows(editingId ? pagination.current : 1, pagination.pageSize)
    } catch (error) {
      if (!(error as any)?.errorFields) {
        message.error(error instanceof Error ? error.message : '保存失败')
      }
    } finally {
      setSaving(false)
    }
  }

  const handleRemove = async (id: string | number) => {
    if (!remove) return
    try {
      const res = await remove(id)
      if (res?.code !== undefined && !isApiSuccess(res)) throw new Error(getApiMessage(res, '删除失败'))
      message.success('删除成功')
      fetchRows()
    } catch (error) {
      message.error(error instanceof Error ? error.message : '删除失败')
    }
  }

  return (
    <div className="admin-panel">
      <div className="admin-panel-head">
        <div>
          <h2>{title}</h2>
          {description ? <p>{description}</p> : null}
        </div>
        <Space>
          <Button onClick={() => fetchRows(1, pagination.pageSize)}>刷新</Button>
          {save ? <Button type="primary" onClick={openCreate}>新增</Button> : null}
        </Space>
      </div>
      {searchFields.length ? (
        <Form className="filter-form" form={queryForm} layout="inline" onFinish={() => fetchRows(1, pagination.pageSize)}>
          {searchFields.map((field) => (
            <Form.Item key={field.name} label={field.label} name={field.name}>
              {renderField(field)}
            </Form.Item>
          ))}
          <Form.Item className="filter-actions-item">
            <Space>
              <Button type="primary" htmlType="submit">查询</Button>
              <Button onClick={() => { queryForm.resetFields(); fetchRows(1, pagination.pageSize) }}>重置</Button>
            </Space>
          </Form.Item>
        </Form>
      ) : null}
      <Table
        columns={tableColumns}
        dataSource={rows}
        loading={loading}
        rowKey={(row) => row[rowKey] ?? row.key ?? JSON.stringify(row)}
        scroll={{ x: 'max-content' }}
        pagination={paged ? {
          current: pagination.current,
          pageSize: pagination.pageSize,
          total: pagination.total,
          showSizeChanger: true,
          showTotal: (total) => `共 ${total} 条`,
          onChange: fetchRows
        } : false}
        size="middle"
      />
      <Modal title={editingId ? `编辑${title}` : `新增${title}`} open={modalOpen} onCancel={() => setModalOpen(false)} onOk={handleSave} confirmLoading={saving} width={680}>
        <Form form={editForm} layout="vertical">
          {formFields.filter((field) => !field.hidden).map((field) => (
            <Form.Item key={field.name} label={field.label} name={field.name} rules={field.required ? [{ required: true, message: `请填写${field.label}` }] : undefined}>
              {renderField(field)}
            </Form.Item>
          ))}
        </Form>
      </Modal>
    </div>
  )
}


