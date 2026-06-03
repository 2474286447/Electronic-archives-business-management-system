import { Activity, Archive, Boxes, RadioTower, ShieldCheck, ThermometerSun, Wifi } from 'lucide-react'
import { ModulePage } from '../components/ModulePage'
import { SurfacePanel } from '../components/PrototypeCard'

const stats = [
  { label: '档案总量', value: '12,486', icon: Archive, trend: '较昨日 +186' },
  { label: 'RFID 在线标签', value: '9,842', icon: RadioTower, trend: '在线率 98.7%' },
  { label: '库位占用率', value: '76.4%', icon: Boxes, trend: '剩余 1,204 位' },
  { label: '今日流转任务', value: '26', icon: Activity, trend: '待处理 4 项' }
]

const events = [
  { text: 'RFID 通道门检测到档案入库', level: 'normal', time: '刚刚' },
  { text: 'A-03 密集架完成盘点', level: 'success', time: '2 分钟前' },
  { text: '借阅任务等待审批', level: 'warning', time: '7 分钟前' },
  { text: '标签离线告警已恢复', level: 'success', time: '12 分钟前' }
]

const devices = [
  { label: 'RFID 通道门', value: '6/6', icon: Wifi },
  { label: '温湿度传感', value: '12/12', icon: ThermometerSun },
  { label: '门禁联动', value: '4/4', icon: ShieldCheck }
]

export function DashboardPage() {
  return (
    <ModulePage title="智能库房管理" description="管理库房区域、密集架、RFID 设备与档案盒状态">
      <div className="stats-grid warehouse-stat-grid">
        {stats.map((item) => {
          const Icon = item.icon
          return (
            <SurfacePanel key={item.label} className="warehouse-stat-panel">
              <div className="stat-card warehouse-stat-card">
                <Icon size={22} />
                <span>{item.label}</span>
                <strong>{item.value}</strong>
                <em>{item.trend}</em>
              </div>
            </SurfacePanel>
          )
        })}
      </div>
      <div className="warehouse-control-grid">
        <SurfacePanel title="库区总览" variant="map" className="warehouse-map-panel">
          <div className="warehouse-zone-toolbar">
            <span><i className="normal" />空闲</span>
            <span><i className="busy" />占用</span>
            <span><i className="warning" />告警</span>
          </div>
          <div className="warehouse-map warehouse-map-large">
            {Array.from({ length: 72 }, (_, index) => {
              const className = index % 17 === 0 ? 'warning' : index % 5 === 0 || index % 7 === 0 ? 'busy' : ''
              return <span key={index} className={className}><b>{String.fromCharCode(65 + Math.floor(index / 18))}-{(index % 18) + 1}</b></span>
            })}
          </div>
        </SurfacePanel>
        <div className="warehouse-side-stack">
          <SurfacePanel title="设备在线" variant="command">
            <div className="device-list">
              {devices.map((item) => {
                const Icon = item.icon
                return (
                  <div className="device-row" key={item.label}>
                    <Icon size={18} />
                    <span>{item.label}</span>
                    <strong>{item.value}</strong>
                  </div>
                )
              })}
            </div>
          </SurfacePanel>
          <SurfacePanel title="实时事件" variant="command">
            <div className="event-list warehouse-event-list">
              {events.map((item, index) => (
                <div key={item.text} className={`event-row ${item.level}`}>
                  <i>{index + 1}</i>
                  <span>{item.text}</span>
                  <time>{item.time}</time>
                </div>
              ))}
            </div>
          </SurfacePanel>
        </div>
      </div>
    </ModulePage>
  )
}

