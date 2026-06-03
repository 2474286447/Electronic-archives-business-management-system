import type { AppRoute } from './types'

export const routes: AppRoute[] = [
  { path: '/dashboard', label: '首页', permission: null, group: '原型导航' },
  { path: '/archive-collect', label: '档案收集中心', permission: null, group: '原型导航' },
  { path: '/archive-arrange', label: '档案整理中心', permission: null, group: '原型导航' },
  { path: '/archive-manage', label: '档案管理中心', permission: null, group: '原型导航' },
  { path: '/archive-research', label: '档案编研中心', permission: null, group: '原型导航' },
  { path: '/archive-use', label: '档案利用中心', permission: null, group: '原型导航' },
  { path: '/warehouse/area', label: '区域管理', permission: null, group: '智能库房管理' },
  { path: '/warehouse/room', label: '库房管理', permission: null, group: '智能库房管理' },
  { path: '/warehouse/map', label: '地图管理', permission: null, group: '智能库房管理' },
  { path: '/warehouse/rack', label: '架体管理', permission: null, group: '智能库房管理' },
  { path: '/warehouse/archive-box', label: '档案盒管理', permission: null, group: '智能库房管理' },
  { path: '/warehouse/rfid-device', label: 'RFID设备管理', permission: null, group: '智能库房管理' },
  { path: '/warehouse/security-device', label: '十防设备管理', permission: null, group: '智能库房管理' },
  { path: '/warehouse/camera-device', label: '监控设备管理', permission: null, group: '智能库房管理' },
  { path: '/user-center', label: '用户中心', permission: null, group: '原型导航' },
  { path: '/system', label: '系统管理', permission: null, group: '原型导航' },
  { path: '/access-management', label: '权限管理', permission: null, group: '系统管理' },
  { path: '/system-settings', label: '系统设置', permission: null, group: '系统管理' },
  { path: '/notice-management', label: '站内通知', permission: null, group: '系统管理' },
  { path: '/log-management', label: '日志管理', permission: null, group: '系统管理' }
]
