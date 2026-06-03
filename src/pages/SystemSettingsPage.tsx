import { useEffect, useState } from 'react'
import { ModulePage } from '../components/ModulePage'
import { Button, Form, Input, Tabs, message } from 'antd'
import { AdminListPanel } from '../components/AdminListPanel'
import { systemAdminApi } from '../api/systemAdmin'
import { defaultSystemConfig, normalizeSystemConfigFromApi, systemConfigApi } from '../api/systemConfig'
import type { SystemConfig } from '../types'
import { getApiMessage, isApiSuccess } from '../api/result'
import http from '../api/http'

function SystemConfigForm() {
  const [form] = Form.useForm<SystemConfig>()
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)

  const load = async () => {
    setLoading(true)
    try {
      const res = await systemConfigApi.getAllConfig()
      if (!isApiSuccess(res)) throw new Error(getApiMessage(res, '加载系统配置失败'))
      form.setFieldsValue(normalizeSystemConfigFromApi(res.data || {}))
    } catch (error) {
      form.setFieldsValue(defaultSystemConfig)
      message.warning(error instanceof Error ? error.message : '加载系统配置失败，已显示默认值')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const save = async () => {
    setSaving(true)
    try {
      const values = await form.validateFields()
      const baseInfo = {
        systemMainName: values.platform.systemName,
        systemSubTitle: values.platform.systemSubtitle,
        versionNo: values.platform.version,
        versionInfo: values.platform.copyright
      }
      const loginPage = {
        loginMainTitle: values.login.title,
        loginSubTitle: values.login.subtitle,
        supportEmail: values.login.technicalSupport,
        showVersionInfo: values.login.showCopyright ? 1 : 0,
        showVersionNo: values.login.showVersion ? 1 : 0,
        showSupport: values.login.showTechnicalSupport ? 1 : 0
      }
      const faceAddr = {
        faceIp: values.faceService.ip,
        facePort: values.faceService.port
      }
      await Promise.all([
        http.put('/sys/config-info/base_info', baseInfo),
        http.put('/sys/config-info/login_page', loginPage),
        http.put('/sys/config-info/face_addr', faceAddr)
      ])
      message.success('系统配置已保存')
      window.dispatchEvent(new CustomEvent('system-config-updated', { detail: values }))
    } catch (error) {
      if (!(error as any)?.errorFields) message.error(error instanceof Error ? error.message : '保存系统配置失败')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="admin-panel">
      <div className="admin-panel-head">
        <div>
          <h2>系统展示配置</h2>
          
        </div>
        <Button onClick={load} loading={loading}>刷新</Button>
      </div>
      <Form className="settings-form" form={form} layout="vertical">
        <div className="settings-grid">
          <Form.Item label="系统名称" name={['platform', 'systemName']} rules={[{ required: true, message: '请填写系统名称' }]}><Input /></Form.Item>
          <Form.Item label="系统副标题" name={['platform', 'systemSubtitle']}><Input /></Form.Item>
          <Form.Item label="版本号" name={['platform', 'version']}><Input /></Form.Item>
          <Form.Item label="版权信息" name={['platform', 'copyright']}><Input /></Form.Item>
          <Form.Item label="登录页标题" name={['login', 'title']}><Input /></Form.Item>
          <Form.Item label="登录页副标题" name={['login', 'subtitle']}><Input /></Form.Item>
          <Form.Item label="技术支持" name={['login', 'technicalSupport']}><Input /></Form.Item>
          <Form.Item label="人脸服务 IP" name={['faceService', 'ip']}><Input /></Form.Item>
          <Form.Item label="人脸服务端口" name={['faceService', 'port']}><Input /></Form.Item>
        </div>
        <Button type="primary" loading={saving} onClick={save}>保存配置</Button>
      </Form>
    </div>
  )
}

export function SystemSettingsPage() {
  return (
    <ModulePage title="系统设置">
      <Tabs
        className="admin-tabs"
        items={[
          {
            key: 'params',
            label: '参数管理',
            children: (
              <AdminListPanel
                title="参数管理"
                load={systemAdminApi.params.page}
                detail={systemAdminApi.params.detail}
                save={systemAdminApi.params.save}
                remove={systemAdminApi.params.remove}
                searchFields={[{ name: 'paramCode', label: '参数编码' }]}
                columns={[
                  { title: '参数编码', dataIndex: 'paramCode', width: 220 },
                  { title: '参数值', dataIndex: 'paramValue', width: 240, ellipsis: true },
                  { title: '备注', dataIndex: 'remark', width: 260, ellipsis: true }
                ]}
                formFields={[
                  { name: 'paramCode', label: '参数编码', required: true },
                  { name: 'paramValue', label: '参数值', required: true },
                  { name: 'remark', label: '备注', type: 'textarea' }
                ]}
              />
            )
          },
          {
            key: 'dict-type',
            label: '字典类型',
            children: (
              <AdminListPanel
                title="字典类型"
                load={systemAdminApi.dictType.page}
                detail={systemAdminApi.dictType.detail}
                save={systemAdminApi.dictType.save}
                remove={systemAdminApi.dictType.remove}
                searchFields={[{ name: 'dictType', label: '字典类型' }]}
                columns={[
                  { title: '字典名称', dataIndex: 'dictName', width: 180 },
                  { title: '字典类型', dataIndex: 'dictType', width: 180 },
                  { title: '备注', dataIndex: 'remark', width: 260, ellipsis: true },
                  { title: '创建时间', dataIndex: 'createDate', width: 180 }
                ]}
                formFields={[
                  { name: 'dictName', label: '字典名称', required: true },
                  { name: 'dictType', label: '字典类型', required: true },
                  { name: 'remark', label: '备注', type: 'textarea' }
                ]}
              />
            )
          },
          {
            key: 'dict-data',
            label: '字典数据',
            children: (
              <AdminListPanel
                title="字典数据"
                load={systemAdminApi.dictData.page}
                detail={systemAdminApi.dictData.detail}
                save={systemAdminApi.dictData.save}
                remove={systemAdminApi.dictData.remove}
                searchFields={[{ name: 'dictType', label: '字典类型' }, { name: 'dictLabel', label: '字典标签' }]}
                columns={[
                  { title: '字典标签', dataIndex: 'dictLabel', width: 160 },
                  { title: '字典值', dataIndex: 'dictValue', width: 140 },
                  { title: '字典类型', dataIndex: 'dictType', width: 180 },
                  { title: '排序', dataIndex: 'sort', width: 90 },
                  { title: '备注', dataIndex: 'remark', width: 240, ellipsis: true }
                ]}
                formFields={[
                  { name: 'dictType', label: '字典类型', required: true },
                  { name: 'dictLabel', label: '字典标签', required: true },
                  { name: 'dictValue', label: '字典值', required: true },
                  { name: 'sort', label: '排序', type: 'number' },
                  { name: 'remark', label: '备注', type: 'textarea' }
                ]}
              />
            )
          },
          {
            key: 'online',
            label: '在线用户',
            children: (
              <AdminListPanel
                title="在线用户"
                load={systemAdminApi.online.page}
                searchFields={[{ name: 'username', label: '用户名' }]}
                columns={[
                  { title: '用户名', dataIndex: 'username', width: 150 },
                  { title: '姓名', dataIndex: 'realName', width: 150 },
                  { title: 'IP', dataIndex: 'ip', width: 150 },
                  { title: '登录时间', dataIndex: 'loginDate', width: 180 },
                  { title: 'User Agent', dataIndex: 'userAgent', width: 280, ellipsis: true }
                ]}
                extraActions={(row, reload) => <Button danger size="small" type="link" onClick={() => systemAdminApi.online.logout(row.id).then(() => { message.success('已强制下线'); reload() })}>强制下线</Button>}
              />
            )
          },
          { key: 'display', label: '系统配置', children: <SystemConfigForm /> }
        ]}
      />
    </ModulePage>
  )
}


