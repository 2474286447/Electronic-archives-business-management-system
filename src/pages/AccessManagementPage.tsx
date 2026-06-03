import { Button, Tabs, Tag, message } from 'antd'
import { ModulePage } from '../components/ModulePage'
import { AdminListPanel } from '../components/AdminListPanel'
import { systemAdminApi } from '../api/systemAdmin'
import type { AnyRecord } from '../api/systemAdmin'
import { getApiMessage, isApiSuccess } from '../api/result'

const statusTag = {
  0: { text: '禁用', color: 'red' },
  1: { text: '启用', color: 'green' }
}

export function AccessManagementPage() {
  const resetPassword = async (row: AnyRecord, reload: () => void) => {
    try {
      const res = await systemAdminApi.user.resetPassword(row.id)
      if (!isApiSuccess(res)) throw new Error(getApiMessage(res, '重置密码失败'))
      message.success('密码已重置为系统默认密码')
      reload()
    } catch (error) {
      message.error(error instanceof Error ? error.message : '重置密码失败')
    }
  }

  return (
    <ModulePage title="权限管理">
      <Tabs
        className="admin-tabs"
        items={[
          {
            key: 'user',
            label: '用户管理',
            children: (
              <AdminListPanel
                title="用户管理"
                load={systemAdminApi.user.page}
                detail={systemAdminApi.user.detail}
                save={systemAdminApi.user.save}
                remove={systemAdminApi.user.remove}
                searchFields={[
                  { name: 'username', label: '用户名' },
                  { name: 'gender', label: '性别', type: 'select', options: [{ label: '男', value: 0 }, { label: '女', value: 1 }, { label: '未知', value: 2 }] },
                  { name: 'deptId', label: '部门ID' }
                ]}
                columns={[
                  { title: '用户名', dataIndex: 'username', width: 140 },
                  { title: '部门', dataIndex: 'deptName', width: 140 },
                  { title: '邮箱', dataIndex: 'email', width: 180, ellipsis: true },
                  { title: '手机号', dataIndex: 'mobile', width: 130 },
                  { title: '终端配置', dataIndex: 'clientTypes', width: 140, ellipsis: true },
                  { title: '状态', dataIndex: 'status', width: 100, tag: statusTag },
                  { title: '创建时间', dataIndex: 'createDate', width: 180 }
                ]}
                formFields={[
                  { name: 'username', label: '用户名', required: true },
                  { name: 'realName', label: '姓名' },
                  { name: 'password', label: '密码', type: 'password' },
                  { name: 'deptId', label: '部门ID' },
                  { name: 'email', label: '邮箱' },
                  { name: 'mobile', label: '手机号' },
                  { name: 'gender', label: '性别', type: 'select', options: [{ label: '男', value: 0 }, { label: '女', value: 1 }, { label: '未知', value: 2 }] },
                  { name: 'status', label: '状态', type: 'select', options: [{ label: '启用', value: 1 }, { label: '禁用', value: 0 }] },
                  { name: 'clientTypes', label: '终端配置' }
                ]}
                extraActions={(row, reload) => <Button size="small" type="link" onClick={() => resetPassword(row, reload)}>重置密码</Button>}
              />
            )
          },
          {
            key: 'role',
            label: '角色管理',
            children: (
              <AdminListPanel
                title="角色管理"
                load={systemAdminApi.role.page}
                detail={systemAdminApi.role.detail}
                save={systemAdminApi.role.save}
                remove={systemAdminApi.role.remove}
                searchFields={[{ name: 'name', label: '角色名称' }]}
                columns={[
                  { title: '角色名称', dataIndex: 'name', width: 180 },
                  { title: '备注', dataIndex: 'remark', width: 260, ellipsis: true },
                  { title: '创建时间', dataIndex: 'createDate', width: 180 }
                ]}
                formFields={[
                  { name: 'name', label: '角色名称', required: true },
                  { name: 'remark', label: '备注', type: 'textarea' },
                  { name: 'dataScope', label: '数据范围', type: 'number' },
                  { name: 'sort', label: '排序', type: 'number' }
                ]}
              />
            )
          },
          {
            key: 'menu',
            label: '菜单管理',
            children: (
              <AdminListPanel
                title="菜单管理"
                paged={false}
                load={systemAdminApi.menu.list}
                detail={systemAdminApi.menu.detail}
                save={systemAdminApi.menu.save}
                remove={systemAdminApi.menu.remove}
                columns={[
                  { title: '菜单名称', dataIndex: 'name', width: 180 },
                  { title: '类型', dataIndex: 'menuType', width: 100, render: (value) => <Tag color={value === 0 ? 'blue' : 'default'}>{value === 0 ? '菜单' : '按钮'}</Tag> },
                  { title: '地址', dataIndex: 'url', width: 220, ellipsis: true },
                  { title: '权限标识', dataIndex: 'permissions', width: 220, ellipsis: true },
                  { title: '图标', dataIndex: 'icon', width: 120 },
                  { title: '排序', dataIndex: 'sort', width: 90 }
                ]}
                formFields={[
                  { name: 'pid', label: '上级ID' },
                  { name: 'name', label: '菜单名称', required: true },
                  { name: 'menuType', label: '类型', type: 'select', options: [{ label: '菜单', value: 0 }, { label: '按钮', value: 1 }] },
                  { name: 'url', label: '路由地址' },
                  { name: 'permissions', label: '权限标识' },
                  { name: 'icon', label: '图标' },
                  { name: 'sort', label: '排序', type: 'number' }
                ]}
              />
            )
          },
          {
            key: 'dept',
            label: '部门管理',
            children: (
              <AdminListPanel
                title="部门管理"
                paged={false}
                load={systemAdminApi.dept.list}
                detail={systemAdminApi.dept.detail}
                save={systemAdminApi.dept.save}
                remove={systemAdminApi.dept.remove}
                columns={[
                  { title: '部门名称', dataIndex: 'name', width: 180 },
                  { title: '上级ID', dataIndex: 'pid', width: 120 },
                  { title: '负责人', dataIndex: 'leader', width: 120 },
                  { title: '联系电话', dataIndex: 'phone', width: 140 },
                  { title: '排序', dataIndex: 'sort', width: 90 }
                ]}
                formFields={[
                  { name: 'pid', label: '上级ID' },
                  { name: 'name', label: '部门名称', required: true },
                  { name: 'leader', label: '负责人' },
                  { name: 'phone', label: '联系电话' },
                  { name: 'sort', label: '排序', type: 'number' }
                ]}
              />
            )
          },
          {
            key: 'post',
            label: '岗位管理',
            children: (
              <AdminListPanel
                title="岗位管理"
                load={systemAdminApi.post.page}
                detail={systemAdminApi.post.detail}
                save={systemAdminApi.post.save}
                remove={systemAdminApi.post.remove}
                searchFields={[{ name: 'postName', label: '岗位名称' }]}
                columns={[
                  { title: '岗位编码', dataIndex: 'postCode', width: 140 },
                  { title: '岗位名称', dataIndex: 'postName', width: 180 },
                  { title: '排序', dataIndex: 'sort', width: 90 },
                  { title: '状态', dataIndex: 'status', width: 100, tag: statusTag },
                  { title: '备注', dataIndex: 'remark', width: 220, ellipsis: true }
                ]}
                formFields={[
                  { name: 'postCode', label: '岗位编码', required: true },
                  { name: 'postName', label: '岗位名称', required: true },
                  { name: 'sort', label: '排序', type: 'number' },
                  { name: 'status', label: '状态', type: 'select', options: [{ label: '启用', value: 1 }, { label: '禁用', value: 0 }] },
                  { name: 'remark', label: '备注', type: 'textarea' }
                ]}
              />
            )
          }
        ]}
      />
    </ModulePage>
  )
}


