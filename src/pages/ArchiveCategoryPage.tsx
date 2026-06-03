import { useEffect, useMemo, useState } from 'react'
import type { Key } from 'react'
import { Button, Descriptions, Form, Input, InputNumber, Modal, Popconfirm, Select, Space, Table, Tag, Tree, TreeSelect, message } from 'antd'
import type { DataNode } from 'antd/es/tree'
import type { ColumnsType } from 'antd/es/table'
import { Edit3, FolderTree, Plus, RefreshCcw, Trash2 } from 'lucide-react'
import { ModulePage } from '../components/ModulePage'
import { configCenterApi } from '../api/configCenter'
import { getApiMessage, isApiSuccess } from '../api/result'
import type { AnyRecord } from '../api/systemAdmin'

const statusOptions = [
  { label: '启用', value: 1 },
  { label: '禁用', value: 0 }
]

const normalizeStatus = (value: unknown) => (value === 0 || value === '0' ? 0 : 1)

const findInTree = (list: AnyRecord[], id?: string | number | null): AnyRecord | null => {
  if (id == null) return null
  for (const item of list) {
    if (String(item.id) === String(id)) return item
    const found = findInTree(item.children || [], id)
    if (found) return found
  }
  return null
}

const flattenTree = (list: AnyRecord[], level = 1): AnyRecord[] => list.flatMap((item) => [
  { ...item, levelNumber: item.levelNumber || level },
  ...flattenTree(item.children || [], (item.levelNumber || level) + 1)
])

const toTreeData = (list: AnyRecord[], bannedId?: string | number | null): DataNode[] => {
  return list
    .filter((item) => String(item.id) !== String(bannedId ?? ''))
    .map((item) => ({
      key: item.id,
      title: item.categoryName || item.categoryCode || '未命名门类',
      children: toTreeData(item.children || [], bannedId)
    }))
}

const toSelectTree = (list: AnyRecord[], bannedId?: string | number | null): AnyRecord[] => {
  return list
    .filter((item) => String(item.id) !== String(bannedId ?? ''))
    .map((item) => ({
      title: item.categoryName || item.categoryCode || '未命名门类',
      value: item.id,
      children: toSelectTree(item.children || [], bannedId)
    }))
}

export function ArchiveCategoryPage() {
  const [form] = Form.useForm()
  const [tree, setTree] = useState<AnyRecord[]>([])
  const [selected, setSelected] = useState<AnyRecord | null>(null)
  const [expandedKeys, setExpandedKeys] = useState<Key[]>([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<AnyRecord | null>(null)

  const flatRows = useMemo(() => flattenTree(tree), [tree])
  const treeData = useMemo(() => toTreeData(tree), [tree])
  const parentTreeData = useMemo(() => toSelectTree(tree, editing?.id), [tree, editing?.id])
  const selectedChildren = selected?.children || []

  const syncSelection = (nextTree: AnyRecord[]) => {
    if (!nextTree.length) {
      setSelected(null)
      return
    }
    const fresh = selected?.id ? findInTree(nextTree, selected.id) : null
    setSelected(fresh || nextTree[0])
  }

  const loadTree = async () => {
    setLoading(true)
    try {
      const res = await configCenterApi.archiveCategory.tree()
      if (res?.code !== undefined && !isApiSuccess(res)) throw new Error(getApiMessage(res, '获取门类树失败'))
      const data = Array.isArray(res.data) ? res.data : []
      setTree(data)
      setExpandedKeys(data.map((item) => item.id))
      syncSelection(data)
    } catch (error) {
      message.error(error instanceof Error ? error.message : '获取门类树失败')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadTree()
  }, [])

  const computeLevel = (parentId?: string | number | null) => {
    if (!parentId) return 1
    const parent = findInTree(tree, parentId)
    return (parent?.levelNumber || 1) + 1
  }

  const openCreate = (parent?: AnyRecord | null) => {
    const parentId = parent?.id || 0
    setEditing(null)
    form.resetFields()
    form.setFieldsValue({
      parentId,
      categoryCode: '',
      categoryName: '',
      levelNumber: computeLevel(parentId),
      sortOrder: 0,
      status: 1,
      description: '',
      remark: ''
    })
    setModalOpen(true)
  }

  const openEdit = (row: AnyRecord) => {
    setEditing(row)
    form.setFieldsValue({
      categoryCode: row.categoryCode || '',
      categoryName: row.categoryName || '',
      parentId: row.parentId || 0,
      levelNumber: row.levelNumber || computeLevel(row.parentId),
      sortOrder: row.sortOrder ?? 0,
      status: normalizeStatus(row.status),
      description: row.description || '',
      remark: row.remark || ''
    })
    setModalOpen(true)
  }

  const handleParentChange = (parentId?: string | number) => {
    form.setFieldsValue({ parentId: parentId || 0, levelNumber: computeLevel(parentId) })
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const values = await form.validateFields()
      const payload = { ...values, parentId: values.parentId || 0, levelNumber: computeLevel(values.parentId) }
      if (payload.levelNumber > 5) throw new Error('门类层级不能超过 5 级')
      const res = editing?.id
        ? await configCenterApi.archiveCategory.update(editing.id, payload)
        : await configCenterApi.archiveCategory.create(payload)
      if (res?.code !== undefined && !isApiSuccess(res)) throw new Error(getApiMessage(res, '保存门类失败'))
      message.success('保存成功')
      setModalOpen(false)
      loadTree()
    } catch (error) {
      if (!(error as any)?.errorFields) message.error(error instanceof Error ? error.message : '保存门类失败')
    } finally {
      setSaving(false)
    }
  }

  const handleRemove = async (row: AnyRecord) => {
    const res = await configCenterApi.archiveCategory.remove(row.id)
    if (res?.code !== undefined && !isApiSuccess(res)) {
      message.error(getApiMessage(res, '删除门类失败'))
      return
    }
    message.success('删除成功')
    loadTree()
  }

  const columns: ColumnsType<AnyRecord> = [
    { title: '门类代码', dataIndex: 'categoryCode', width: 150, render: (value, row) => <Button type="link" size="small" onClick={() => setSelected(row)}>{value || '-'}</Button> },
    { title: '门类名称', dataIndex: 'categoryName', width: 170 },
    { title: '门类描述', dataIndex: 'description', ellipsis: true },
    { title: '序号', dataIndex: 'sortOrder', width: 90, render: (value) => value ?? 0 },
    { title: '档案数', dataIndex: 'archiveCount', width: 100, render: (value) => value ?? 0 },
    { title: '状态', dataIndex: 'status', width: 90, render: (value) => normalizeStatus(value) === 1 ? <Tag color="green">启用</Tag> : <Tag color="red">禁用</Tag> },
    {
      title: '操作',
      key: 'actions',
      width: 210,
      render: (_, row) => (
        <Space size="small">
          <Button size="small" onClick={() => openCreate(row)} icon={<Plus size={14} />}>下级</Button>
          <Button size="small" onClick={() => openEdit(row)} icon={<Edit3 size={14} />}>编辑</Button>
          <Popconfirm title={`确认删除门类“${row.categoryName || row.categoryCode}”？`} onConfirm={() => handleRemove(row)}>
            <Button danger size="small" icon={<Trash2 size={14} />}>删除</Button>
          </Popconfirm>
        </Space>
      )
    }
  ]

  return (
    <ModulePage title="门类管理" description="维护档案门类树、层级编码、排序与启停状态">
      <div className="category-layout">
        <section className="admin-panel category-tree-panel">
          <div className="admin-panel-head">
            <div>
              <h2>门类树</h2>
              <p>共 {flatRows.length} 个门类</p>
            </div>
            <Space>
              <Button icon={<RefreshCcw size={15} />} onClick={loadTree}>刷新</Button>
              <Button type="primary" icon={<Plus size={15} />} onClick={() => openCreate(null)}>新增</Button>
            </Space>
          </div>
          <Tree
            blockNode
            showLine
            treeData={treeData}
            selectedKeys={selected?.id ? [selected.id] : []}
            expandedKeys={expandedKeys}
            onExpand={setExpandedKeys}
            onSelect={(keys) => setSelected(findInTree(tree, keys[0] as string | number))}
          />
        </section>

        <section className="page-stack">
          <div className="admin-panel">
            <div className="admin-panel-head">
              <div>
                <h2>{selected?.categoryName || '请选择左侧门类'}</h2>
                <p>{selected ? `门类代码：${selected.categoryCode || '-'} | 第 ${selected.levelNumber || 1} 级 | 排序：${selected.sortOrder ?? 0}` : '选择门类后查看详情和下级门类'}</p>
              </div>
              <Space>
                <Button disabled={!selected} icon={<Plus size={15} />} onClick={() => openCreate(selected)}>新增下级</Button>
                <Button disabled={!selected} icon={<Edit3 size={15} />} onClick={() => selected && openEdit(selected)}>编辑</Button>
              </Space>
            </div>
            {selected ? (
              <Descriptions bordered column={3} size="small">
                <Descriptions.Item label="门类代码">{selected.categoryCode || '-'}</Descriptions.Item>
                <Descriptions.Item label="门类名称">{selected.categoryName || '-'}</Descriptions.Item>
                <Descriptions.Item label="门类层级">第 {selected.levelNumber || 1} 级</Descriptions.Item>
                <Descriptions.Item label="排序号">{selected.sortOrder ?? 0}</Descriptions.Item>
                <Descriptions.Item label="档案数量">{selected.archiveCount ?? 0}</Descriptions.Item>
                <Descriptions.Item label="状态">{normalizeStatus(selected.status) === 1 ? <Tag color="green">启用</Tag> : <Tag color="red">禁用</Tag>}</Descriptions.Item>
                <Descriptions.Item label="门类描述" span={3}>{selected.description || '-'}</Descriptions.Item>
              </Descriptions>
            ) : (
              <div className="empty-state"><FolderTree size={32} />请选择左侧门类</div>
            )}
          </div>

          <div className="admin-panel">
            <div className="admin-panel-head">
              <div>
                <h2>下级门类</h2>
                <p>{selected ? `共 ${selectedChildren.length} 条` : '请选择门类后查看'}</p>
              </div>
            </div>
            <Table rowKey="id" columns={columns} dataSource={selected ? selectedChildren : []} pagination={false} scroll={{ x: 980 }} />
          </div>
        </section>
      </div>

      <Modal title={editing?.id ? '编辑门类' : '新增门类'} open={modalOpen} onCancel={() => setModalOpen(false)} onOk={handleSave} confirmLoading={saving} width={760}>
        <Form className="config-form-grid" form={form} layout="vertical">
          <Form.Item label="门类代码" name="categoryCode" rules={[{ required: true, message: '请输入门类代码' }]}>
            <Input placeholder="如：A、A01、A0101" />
          </Form.Item>
          <Form.Item label="门类名称" name="categoryName" rules={[{ required: true, message: '请输入门类名称' }]}>
            <Input placeholder="请输入门类名称" />
          </Form.Item>
          <Form.Item label="父门类" name="parentId">
            <TreeSelect allowClear treeDefaultExpandAll treeData={parentTreeData} placeholder="顶级门类" onChange={handleParentChange} />
          </Form.Item>
          <Form.Item label="门类层级" name="levelNumber">
            <InputNumber className="full-control" disabled min={1} max={5} />
          </Form.Item>
          <Form.Item label="排序号" name="sortOrder">
            <InputNumber className="full-control" min={0} />
          </Form.Item>
          <Form.Item label="状态" name="status" rules={[{ required: true, message: '请选择状态' }]}>
            <Select options={statusOptions} />
          </Form.Item>
          <Form.Item className="config-form-span" label="门类描述" name="description">
            <Input.TextArea rows={3} placeholder="请输入门类描述" />
          </Form.Item>
          <Form.Item className="config-form-span" label="备注" name="remark">
            <Input.TextArea rows={2} placeholder="请输入备注" />
          </Form.Item>
        </Form>
      </Modal>
    </ModulePage>
  )
}
