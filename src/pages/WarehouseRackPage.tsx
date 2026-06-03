import { useMemo, useState } from 'react'
import { Button, Descriptions, Form, Input, InputNumber, Modal, Radio, Select, Segmented, Switch, message } from 'antd'
import { Archive, CheckCircle2, CircleAlert, Grid2X2, Grid3X3, Plus, RotateCcw, Search, Server } from 'lucide-react'
import { ModulePage } from '../components/ModulePage'
import { SurfacePanel } from '../components/PrototypeCard'
import { ShelfCardGrid, type ShelfCardItem } from '../components/warehouse/ShelfCardGrid'

type RackFilters = {
  name: string
  code: string
  type?: string
  warehouse?: string
  area?: string
  status?: string
}

const initialShelves: ShelfCardItem[] = [
  { id: 's1', name: 'A区智能密集架-01列', code: 'BJDA-K01-MJA-01', type: '智能密集架', warehouse: '一号综合档案库', area: 'A区', structure: '10列 · 2面 · 5节 · 8层 · 10格', used: 312, capacity: 640, archiveBoxCount: 312, onlineStatus: 'online', manageStatus: 'active', ipAddress: '192.168.1.101', macAddress: 'AA:BB:CC:DD:EE:01' },
  { id: 's2', name: 'A区智能密集架-02列', code: 'BJDA-K01-MJA-02', type: '智能密集架', warehouse: '一号综合档案库', area: 'A区', structure: '10列 · 2面 · 5节 · 8层 · 10格', used: 539, capacity: 640, archiveBoxCount: 539, onlineStatus: 'online', manageStatus: 'active', ipAddress: '192.168.1.102', macAddress: 'AA:BB:CC:DD:EE:02' },
  { id: 's3', name: 'A区智能密集架-03列', code: 'BJDA-K01-MJA-03', type: '智能密集架', warehouse: '一号综合档案库', area: 'A区', structure: '10列 · 2面 · 5节 · 8层 · 10格', used: 178, capacity: 640, archiveBoxCount: 178, onlineStatus: 'error', manageStatus: 'active', ipAddress: '192.168.1.103', macAddress: 'AA:BB:CC:DD:EE:03' },
  { id: 's4', name: 'B区智能密集架-01列', code: 'BJDA-K01-MJB-01', type: '智能密集架', warehouse: '一号综合档案库', area: 'B区', structure: '8列 · 2面 · 5节 · 8层 · 10格', used: 96, capacity: 480, archiveBoxCount: 96, onlineStatus: 'online', manageStatus: 'active' },
  { id: 's5', name: 'B区智能密集架-02列', code: 'BJDA-K01-MJB-02', type: '智能密集架', warehouse: '一号综合档案库', area: 'B区', structure: '8列 · 2面 · 5节 · 8层 · 10格', used: 0, capacity: 480, archiveBoxCount: 0, onlineStatus: 'offline', manageStatus: 'disabled' },
  { id: 's6', name: '二号库手摇密集架-01列', code: 'BJDA-K02-SY-01', type: '手摇密集架', warehouse: '二号档案库', area: '普通区', structure: '10列 · 2面 · 5节 · 10层 · 10格', used: 453, capacity: 1000, archiveBoxCount: 453, onlineStatus: 'online', manageStatus: 'active' },
  { id: 's7', name: '二号库手摇密集架-02列', code: 'BJDA-K02-SY-02', type: '手摇密集架', warehouse: '二号档案库', area: '普通区', structure: '10列 · 2面 · 5节 · 10层 · 10格', used: 280, capacity: 1000, archiveBoxCount: 280, onlineStatus: 'online', manageStatus: 'active' },
  { id: 's8', name: '地下库手摇密集架-01列', code: 'BJDA-B01-SY-01', type: '手摇密集架', warehouse: '地下档案库', area: '密集区', structure: '12列 · 2面 · 6节 · 10层 · 10格', used: 720, capacity: 1440, archiveBoxCount: 720, onlineStatus: 'online', manageStatus: 'active' },
  { id: 's9', name: '查阅区RFID档案柜-主柜01', code: 'BJDA-CY-RFID-01', type: 'RFID档案柜', warehouse: '一号综合档案库', area: '查阅区', structure: '主柜 · 3层4列 · 共11格口 · 1屏幕格', used: 8, capacity: 11, archiveBoxCount: 8, onlineStatus: 'online', manageStatus: 'active' },
  { id: 's10', name: '设备间防潮防磁柜-01', code: 'BJDA-SB-FC-01', type: '防潮防磁柜', warehouse: '一号综合档案库', area: '设备间', structure: '4层 · 4列 · 3格', used: 12, capacity: 48, archiveBoxCount: 12, onlineStatus: 'online', manageStatus: 'active' },
  { id: 's11', name: '查阅大厅防潮防磁柜-02', code: 'BJDA-CY-FC-02', type: '防潮防磁柜', warehouse: '一号综合档案库', area: '查阅大厅', structure: '4层 · 5列 · 2格', used: 28, capacity: 40, archiveBoxCount: 28, onlineStatus: 'online', manageStatus: 'active' },
  { id: 's12', name: '整理区固定货架-01', code: 'BJDA-ZL-GD-01', type: '固定货架', warehouse: '二号档案库', area: '整理区', structure: '6层 · 4列 · 3格', used: 22, capacity: 72, archiveBoxCount: 22, onlineStatus: 'online', manageStatus: 'active' }
]

const emptyFilters: RackFilters = { name: '', code: '' }
const typeOptions = ['智能密集架', '手摇密集架', 'RFID档案柜', '防潮防磁柜', '固定货架'].map((value) => ({ label: value, value }))

function uniqueOptions(items: ShelfCardItem[], key: keyof ShelfCardItem) {
  return Array.from(new Set(items.map((item) => String(item[key])))).map((value) => ({ label: value, value }))
}

function buildStructure(values: Partial<ShelfCardItem> & Record<string, number | string | undefined>) {
  if (values.type === 'RFID档案柜') return '主柜 · 3层4列 · 共11格口 · 1屏幕格'
  if (values.type === '防潮防磁柜' || values.type === '固定货架') return `${values.layers ?? 4}层 · ${values.columns ?? 4}列 · ${values.slots ?? 3}格`
  return `${values.columns ?? 10}列 · ${values.faces ?? 2}面 · ${values.sections ?? 5}节 · ${values.layers ?? 8}层 · ${values.slots ?? 10}格`
}

export function WarehouseRackPage() {
  const [shelves, setShelves] = useState(initialShelves)
  const [draftFilters, setDraftFilters] = useState<RackFilters>(emptyFilters)
  const [filters, setFilters] = useState<RackFilters>(emptyFilters)
  const [gridColumns, setGridColumns] = useState<3 | 4>(4)
  const [formOpen, setFormOpen] = useState(false)
  const [editingShelf, setEditingShelf] = useState<ShelfCardItem | null>(null)
  const [viewingShelf, setViewingShelf] = useState<ShelfCardItem | null>(null)
  const [deleteShelf, setDeleteShelf] = useState<ShelfCardItem | null>(null)
  const [form] = Form.useForm()

  const filteredShelves = useMemo(() => shelves.filter((item) => {
    const matchName = !filters.name || item.name.includes(filters.name)
    const matchCode = !filters.code || item.code.toLowerCase().includes(filters.code.toLowerCase())
    const matchType = !filters.type || item.type === filters.type
    const matchWarehouse = !filters.warehouse || item.warehouse === filters.warehouse
    const matchArea = !filters.area || item.area === filters.area
    const matchStatus = !filters.status || item.manageStatus === filters.status
    return matchName && matchCode && matchType && matchWarehouse && matchArea && matchStatus
  }), [filters, shelves])

  const stats = [
    { label: '架体总数', value: shelves.length, icon: Server, tone: 'primary' },
    { label: '容量正常', value: shelves.filter((item) => item.used / item.capacity < 0.8).length, icon: CheckCircle2, tone: 'success' },
    { label: '容量接近满载', value: shelves.filter((item) => item.used / item.capacity >= 0.8 && item.used / item.capacity < 1).length, icon: CircleAlert, tone: 'warning' },
    { label: '容量满载', value: shelves.filter((item) => item.used / item.capacity >= 1).length, icon: Archive, tone: 'danger' }
  ]

  const openForm = (shelf?: ShelfCardItem) => {
    setEditingShelf(shelf ?? null)
    setFormOpen(true)
    form.setFieldsValue({
      name: shelf?.name ?? '',
      code: shelf?.code ?? '',
      type: shelf?.type ?? '智能密集架',
      warehouse: shelf?.warehouse ?? '一号综合档案库',
      area: shelf?.area ?? 'A区',
      manageStatus: shelf?.manageStatus ?? 'active',
      ipAddress: shelf?.ipAddress ?? '',
      macAddress: shelf?.macAddress ?? '',
      remark: shelf?.remark ?? '',
      columns: shelf?.type === '防潮防磁柜' || shelf?.type === '固定货架' ? 4 : 10,
      faces: 2,
      sections: 5,
      layers: shelf?.type === '防潮防磁柜' || shelf?.type === '固定货架' ? 4 : 8,
      slots: shelf?.type === '防潮防磁柜' || shelf?.type === '固定货架' ? 3 : 10
    })
  }

  const saveShelf = async () => {
    const values = await form.validateFields()
    const structure = buildStructure(values)
    const capacity = editingShelf?.capacity ?? (values.type === 'RFID档案柜' ? 11 : Number(values.columns || 10) * Number(values.layers || 8) * Number(values.slots || 10) * (values.type === '固定货架' || values.type === '防潮防磁柜' ? 1 : Number(values.faces || 2)))
    const next: ShelfCardItem = {
      id: editingShelf?.id ?? `sh_${Date.now()}`,
      name: values.name,
      code: values.code,
      type: values.type,
      warehouse: values.warehouse,
      area: values.area,
      structure,
      used: editingShelf?.used ?? 0,
      capacity,
      archiveBoxCount: editingShelf?.archiveBoxCount ?? 0,
      onlineStatus: editingShelf?.onlineStatus ?? 'offline',
      manageStatus: values.manageStatus,
      ipAddress: values.ipAddress,
      macAddress: values.macAddress,
      remark: values.remark
    }
    setShelves((current) => editingShelf ? current.map((item) => item.id === editingShelf.id ? next : item) : [...current, next])
    setFormOpen(false)
    setEditingShelf(null)
    form.resetFields()
    message.success('保存成功')
  }

  const confirmDelete = () => {
    if (!deleteShelf) return
    setShelves((current) => current.filter((item) => item.id !== deleteShelf.id))
    setDeleteShelf(null)
    message.success('删除成功')
  }

  const resetFilters = () => {
    setDraftFilters(emptyFilters)
    setFilters(emptyFilters)
  }

  return (
    <ModulePage title="架体管理" description="维护库房内实体存储载体，包括智能密集架、手摇密集架、RFID档案柜、防潮防磁柜、固定货架。">
      <div className="rack-stat-grid">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <SurfacePanel className={`rack-stat-card ${stat.tone}`} key={stat.label}>
              <div><span>{stat.label}</span><strong>{stat.value}</strong></div>
              <Icon size={18} />
            </SurfacePanel>
          )
        })}
      </div>

      <SurfacePanel className="rack-filter-panel">
        <div className="rack-filter-grid">
          <Input placeholder="架体名称" value={draftFilters.name} onChange={(event) => setDraftFilters((current) => ({ ...current, name: event.target.value }))} />
          <Input placeholder="架体编号" value={draftFilters.code} onChange={(event) => setDraftFilters((current) => ({ ...current, code: event.target.value }))} />
          <Select allowClear placeholder="全部类型" value={draftFilters.type} options={typeOptions} onChange={(value) => setDraftFilters((current) => ({ ...current, type: value }))} />
          <Select allowClear placeholder="全部库房" value={draftFilters.warehouse} options={uniqueOptions(shelves, 'warehouse')} onChange={(value) => setDraftFilters((current) => ({ ...current, warehouse: value }))} />
          <Select allowClear placeholder="全部区域" value={draftFilters.area} options={uniqueOptions(shelves, 'area')} onChange={(value) => setDraftFilters((current) => ({ ...current, area: value }))} />
          <Select allowClear placeholder="管理状态" value={draftFilters.status} options={[{ label: '启用', value: 'active' }, { label: '停用', value: 'disabled' }]} onChange={(value) => setDraftFilters((current) => ({ ...current, status: value }))} />
          <div className="rack-filter-actions">
            <Button type="primary" icon={<Search size={14} />} onClick={() => setFilters(draftFilters)}>查询</Button>
            <Button icon={<RotateCcw size={14} />} onClick={resetFilters}>重置</Button>
          </div>
        </div>
      </SurfacePanel>

      <SurfacePanel className="rack-list-panel">
        <div className="rack-list-toolbar">
          <div>
            <Button type="primary" icon={<Plus size={15} />} onClick={() => openForm()}>新增架体</Button>
            <span>共 {filteredShelves.length} 个</span>
          </div>
          <Segmented
            value={gridColumns}
            onChange={(value) => setGridColumns(value as 3 | 4)}
            options={[
              { label: <Grid3X3 size={15} />, value: 3 },
              { label: <Grid2X2 size={15} />, value: 4 }
            ]}
          />
        </div>
        {filteredShelves.length === 0 ? (
          <div className="rack-empty">暂无匹配的架体记录</div>
        ) : (
          <ShelfCardGrid items={filteredShelves} columns={gridColumns} onView={setViewingShelf} onEdit={openForm} onDelete={setDeleteShelf} />
        )}
      </SurfacePanel>

      <Modal className="rack-form-modal" title={editingShelf ? '编辑架体' : '新增架体'} open={formOpen} onCancel={() => { setFormOpen(false); setEditingShelf(null); form.resetFields() }} onOk={saveShelf} okText="保存" cancelText="取消" width={960}>
        <Form form={form} layout="vertical" className="rack-form">
          <div className="rack-form-section">基本信息</div>
          <div className="rack-form-grid">
            <Form.Item label="架体名称" name="name" rules={[{ required: true, message: '请输入架体名称' }]}><Input placeholder="请输入架体名称" /></Form.Item>
            <Form.Item label="架体编号" name="code" rules={[{ required: true, message: '请输入架体编号' }]}><Input placeholder="如：BJDA-K01-MJA-01" /></Form.Item>
            <Form.Item label="架体类型" name="type"><Select options={typeOptions} /></Form.Item>
            <Form.Item label="所属库房" name="warehouse"><Select options={uniqueOptions(shelves, 'warehouse')} /></Form.Item>
            <Form.Item label="所属区域" name="area"><Select options={uniqueOptions(shelves, 'area')} /></Form.Item>
            <Form.Item label="管理状态" name="manageStatus"><Radio.Group options={[{ label: '启用', value: 'active' }, { label: '停用', value: 'disabled' }]} /></Form.Item>
            <Form.Item label="设备IP地址" name="ipAddress"><Input placeholder="如：192.168.1.100" /></Form.Item>
            <Form.Item label="MAC地址" name="macAddress"><Input placeholder="如：AA:BB:CC:DD:EE:FF" /></Form.Item>
            <Form.Item label="备注" name="remark" className="rack-form-span"><Input.TextArea placeholder="可填写备注信息" rows={2} /></Form.Item>
          </div>
          <div className="rack-form-section">规格参数</div>
          <div className="rack-form-grid">
            <Form.Item label="列数" name="columns"><InputNumber min={0} /></Form.Item>
            <Form.Item label="面数" name="faces"><Select options={[{ label: '1面（单面）', value: 1 }, { label: '2面（双面）', value: 2 }]} /></Form.Item>
            <Form.Item label="每面节数" name="sections"><InputNumber min={0} /></Form.Item>
            <Form.Item label="每节层数" name="layers"><InputNumber min={0} /></Form.Item>
            <Form.Item label="每层格数" name="slots"><InputNumber min={0} /></Form.Item>
          </div>
          <div className="rack-control-config">
            <span>控制配置</span>
            <Switch defaultChecked checkedChildren="支持控制" unCheckedChildren="支持控制" />
          </div>
        </Form>
      </Modal>

      <Modal title="架体详情" open={Boolean(viewingShelf)} onCancel={() => setViewingShelf(null)} footer={<Button type="primary" onClick={() => { if (viewingShelf) openForm(viewingShelf); setViewingShelf(null) }}>编辑</Button>} width={720}>
        {viewingShelf ? (
          <Descriptions bordered column={2} size="small">
            <Descriptions.Item label="架体名称">{viewingShelf.name}</Descriptions.Item>
            <Descriptions.Item label="架体编号">{viewingShelf.code}</Descriptions.Item>
            <Descriptions.Item label="架体类型">{viewingShelf.type}</Descriptions.Item>
            <Descriptions.Item label="所属库房">{viewingShelf.warehouse}</Descriptions.Item>
            <Descriptions.Item label="所属区域">{viewingShelf.area}</Descriptions.Item>
            <Descriptions.Item label="规格参数">{viewingShelf.structure}</Descriptions.Item>
            <Descriptions.Item label="容量使用">{viewingShelf.used} / {viewingShelf.capacity}</Descriptions.Item>
            <Descriptions.Item label="管理状态">{viewingShelf.manageStatus === 'active' ? '启用' : '停用'}</Descriptions.Item>
            <Descriptions.Item label="备注" span={2}>{viewingShelf.remark || '——'}</Descriptions.Item>
          </Descriptions>
        ) : null}
      </Modal>

      <Modal title={deleteShelf?.archiveBoxCount ? '无法删除' : '确认删除架体？'} open={Boolean(deleteShelf)} onCancel={() => setDeleteShelf(null)} onOk={deleteShelf?.archiveBoxCount ? () => setDeleteShelf(null) : confirmDelete} okText={deleteShelf?.archiveBoxCount ? '我知道了' : '确认删除'} cancelText="取消" okButtonProps={{ danger: !deleteShelf?.archiveBoxCount }}>
        {deleteShelf?.archiveBoxCount ? '该架体下已存在档案盒，不能删除。' : deleteShelf ? `将删除架体：${deleteShelf.name}（${deleteShelf.code}）。删除后不可恢复，请确认是否继续。` : null}
      </Modal>
    </ModulePage>
  )
}
