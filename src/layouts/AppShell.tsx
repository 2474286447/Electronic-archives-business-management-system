import { useMemo, useState } from 'react'
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import {
  Archive,
  Bell,
  BookOpen,
  Boxes,
  Building2,
  ChevronDown,
  ChevronRight,
  Database,
  FolderInput,
  FolderKanban,
  Grid2X2,
  Home,
  Layers,
  LogOut,
  Map,
  Monitor,
  Radio,
  Search,
  ServerCog,
  Settings,
  Shield,
  Tags,
  Users,
  UserRound
} from 'lucide-react'
import { useAuth } from '../auth/AuthProvider'
import { routes } from '../routes'

interface NavNode {
  label: string
  path?: string
  icon: typeof Home
  defaultOpen?: boolean
  children?: NavNode[]
}

const navTree: NavNode[] = [
  { label: '首页', path: '/dashboard', icon: Home },
  { label: '档案收集中心', path: '/archive-collect', icon: FolderInput },
  { label: '档案整理中心', path: '/archive-arrange', icon: FolderKanban },
  { label: '档案管理中心', path: '/archive-manage', icon: Database },
  { label: '档案编研中心', path: '/archive-research', icon: BookOpen },
  { label: '档案利用中心', path: '/archive-use', icon: Users },
  {
    label: '智能库房管理',
    icon: ServerCog,
    defaultOpen: true,
    children: [
      { label: '区域管理', path: '/warehouse/area', icon: Map },
      { label: '库房管理', path: '/warehouse/room', icon: Building2 },
      { label: '地图管理', path: '/warehouse/map', icon: Map },
      { label: '架体管理', path: '/warehouse/rack', icon: Layers },
      { label: '档案盒管理', path: '/warehouse/archive-box', icon: Boxes },
      { label: 'RFID设备管理', path: '/warehouse/rfid-device', icon: Radio },
      { label: '十防设备管理', path: '/warehouse/security-device', icon: Shield },
      { label: '监控设备管理', path: '/warehouse/camera-device', icon: Monitor }
    ]
  },
  { label: '用户中心', path: '/user-center', icon: Users },
  {
    label: '配置中心',
    icon: Settings,
    defaultOpen: true,
    children: [
      { label: '全宗管理', path: '/config/fonds', icon: Building2 },
      { label: '门类管理', path: '/config/archive-category', icon: Tags }
    ]
  },
  {
    label: '系统管理',
    icon: ServerCog,
    defaultOpen: true,
    children: [
      { label: '权限管理', path: '/access-management', icon: Shield },
      { label: '系统设置', path: '/system-settings', icon: ServerCog },
      { label: '站内通知', path: '/notice-management', icon: Bell },
      { label: '日志管理', path: '/log-management', icon: Archive }
    ]
  }
]

function flattenNav(nodes: NavNode[]): NavNode[] {
  return nodes.flatMap((node) => [node, ...(node.children ? flattenNav(node.children) : [])])
}

function findCurrentRoute(pathname: string) {
  const route = routes.find((item) => pathname === item.path || pathname.endsWith(item.path))
  if (route) return route
  const nav = flattenNav(navTree).find((item) => item.path && (pathname === item.path || pathname.endsWith(item.path)))
  return { label: nav?.label || '首页', path: nav?.path || '/dashboard' }
}

function getBreadcrumb(pathname: string, nodes: NavNode[] = navTree, parents: string[] = []): string[] {
  for (const node of nodes) {
    const current = [...parents, node.label]
    if (node.path && (pathname === node.path || pathname.endsWith(node.path))) return current
    if (node.children?.length) {
      const matched = getBreadcrumb(pathname, node.children, current)
      if (matched.length) return matched
    }
  }
  return []
}

function isNodeActive(node: NavNode, pathname: string) {
  if (node.path && (pathname === node.path || pathname.endsWith(node.path))) return true
  return Boolean(node.children?.some((child) => isNodeActive(child, pathname)))
}

export function AppShell() {
  const navigate = useNavigate()
  const location = useLocation()
  const { clearAuth, user } = useAuth()
  const currentRoute = findCurrentRoute(location.pathname)
  const breadcrumb = getBreadcrumb(location.pathname)
  const breadcrumbItems = breadcrumb.length ? breadcrumb : [currentRoute.label]
  const initialOpen = useMemo(() => {
    const entries = navTree.filter((item) => item.children?.length).map((item) => [item.label, Boolean(item.defaultOpen || isNodeActive(item, location.pathname))])
    return Object.fromEntries(entries) as Record<string, boolean>
  }, [])
  const [openMap, setOpenMap] = useState<Record<string, boolean>>(initialOpen)

  const logout = () => {
    clearAuth()
    navigate('/login', { replace: true })
  }

  const renderNode = (node: NavNode, level = 0) => {
    const Icon = node.icon
    const hasChildren = Boolean(node.children?.length)
    const active = isNodeActive(node, location.pathname)
    const open = openMap[node.label]

    if (hasChildren) {
      return (
        <div className={`nav-branch ${active ? 'active' : ''}`} key={node.label}>
          <button className="nav-item nav-parent" type="button" onClick={() => setOpenMap((current) => ({ ...current, [node.label]: !current[node.label] }))}>
            <Icon size={15} />
            <span>{node.label}</span>
            <ChevronDown className={`nav-arrow ${open ? 'open' : ''}`} size={14} />
          </button>
          {open ? <div className="nav-children">{node.children?.map((child) => renderNode(child, level + 1))}</div> : null}
        </div>
      )
    }

    return (
      <NavLink className={`nav-item ${level > 0 ? 'nav-child' : ''}`} key={node.path || node.label} to={node.path || '/dashboard'}>
        <Icon size={15} />
        <span>{node.label}</span>
        {level === 0 ? <ChevronRight className="nav-arrow" size={13} /> : null}
      </NavLink>
    )
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-mark"><Database size={19} /></div>
          <div>
            <strong>电子档案业务</strong>
            <span>管理系统</span>
          </div>
        </div>
        <nav className="sidebar-nav">{navTree.map((node) => renderNode(node))}</nav>
        <div className="sidebar-footer">
          <span>北京合泰信安信息技术有限公司</span>
          <strong>v2.4.1 · 2026</strong>
        </div>
      </aside>
      <main className="main">
        <header className="topbar">
          <div className="breadcrumb-line">
            <span>当前位置</span>
            {breadcrumbItems.map((item, index) => (
              <span className="breadcrumb-part" key={`${item}-${index}`}>
                <ChevronRight size={14} />
                {index === breadcrumbItems.length - 1 ? <strong>{item}</strong> : <span>{item}</span>}
              </span>
            ))}
          </div>
          <div className="search-box">
            <Search size={17} />
            <input placeholder="搜索档案、库房、设备..." />
          </div>
          <div className="topbar-actions">
            <button className="icon-button notification-button" title="消息"><Bell size={18} /><i>5</i></button>
            <button className="system-switch" type="button"><Grid2X2 size={16} /> 系统切换 <ChevronDown size={14} /></button>
            <div className="user-pill">
              <UserRound size={17} />
              <div>
                <span>{user?.realName || user?.username || user?.userName || '管理员'}</span>
                <small>系统管理员</small>
              </div>
              <ChevronDown size={14} />
            </div>
            <button className="icon-button" title="退出登录" onClick={logout}><LogOut size={18} /></button>
          </div>
        </header>
        <div className="content">
          <Outlet />
        </div>
      </main>
    </div>
  )
}

