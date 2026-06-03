import { Button, Modal, Tabs, Tag, message } from 'antd'
import { ModulePage } from '../components/ModulePage'
import { AdminListPanel } from '../components/AdminListPanel'
import { systemAdminApi } from '../api/systemAdmin'
import type { AnyRecord } from '../api/systemAdmin'
import { getApiMessage, isApiSuccess } from '../api/result'

const noticeType = {
  0: { text: '通知', color: 'blue' },
  1: { text: '公告', color: 'purple' },
  2: { text: '提醒', color: 'orange' }
}

const noticeStatus = {
  0: { text: '草稿', color: 'default' },
  1: { text: '已发布', color: 'green' }
}

const readStatus = {
  0: { text: '未读', color: 'red' },
  1: { text: '已读', color: 'green' }
}

const viewNotice = async (row: AnyRecord) => {
  try {
    const res = await systemAdminApi.notice.detail(row.id)
    if (!isApiSuccess(res)) throw new Error(getApiMessage(res, '获取通知详情失败'))
    const data = res.data || row
    Modal.info({
      title: data.title || '通知详情',
      width: 760,
      content: <div className="notice-view" dangerouslySetInnerHTML={{ __html: data.content || data.noticeContent || '暂无内容' }} />
    })
  } catch (error) {
    message.error(error instanceof Error ? error.message : '获取通知详情失败')
  }
}

export function NoticeManagementPage() {
  return (
    <ModulePage title="站内通知">
      <Tabs
        className="admin-tabs"
        items={[
          {
            key: 'notice',
            label: '通知管理',
            children: (
              <AdminListPanel
                title="通知管理"
                load={systemAdminApi.notice.page}
                detail={systemAdminApi.notice.detail}
                save={systemAdminApi.notice.save}
                remove={systemAdminApi.notice.remove}
                searchFields={[{ name: 'noticeType', label: '通知类型', type: 'select', options: [{ label: '通知', value: 0 }, { label: '公告', value: 1 }, { label: '提醒', value: 2 }] }]}
                columns={[
                  { title: '标题', dataIndex: 'title', width: 260, ellipsis: true },
                  { title: '类型', dataIndex: 'noticeType', width: 120, tag: noticeType },
                  { title: '发送人', dataIndex: 'senderName', width: 140 },
                  { title: '发送时间', dataIndex: 'senderDate', width: 180 },
                  { title: '状态', dataIndex: 'status', width: 110, tag: noticeStatus }
                ]}
                formFields={[
                  { name: 'title', label: '标题', required: true },
                  { name: 'noticeType', label: '通知类型', type: 'select', required: true, options: [{ label: '通知', value: 0 }, { label: '公告', value: 1 }, { label: '提醒', value: 2 }] },
                  { name: 'status', label: '状态', type: 'select', options: [{ label: '草稿', value: 0 }, { label: '发布', value: 1 }] },
                  { name: 'content', label: '内容', type: 'textarea', required: true },
                  { name: 'receiverType', label: '接收范围', type: 'number' }
                ]}
                extraActions={(row) => <Button size="small" type="link" onClick={() => viewNotice(row)}>查看</Button>}
              />
            )
          },
          {
            key: 'user',
            label: '收件通知',
            children: (
              <AdminListPanel
                title="收件通知"
                load={systemAdminApi.notice.userPage}
                columns={[
                  { title: '标题', dataIndex: 'title', width: 280, ellipsis: true },
                  { title: '类型', dataIndex: 'noticeType', width: 120, tag: noticeType },
                  { title: '发送人', dataIndex: 'senderName', width: 140 },
                  { title: '发送时间', dataIndex: 'senderDate', width: 180 },
                  { title: '阅读状态', dataIndex: 'readStatus', width: 120, tag: readStatus }
                ]}
                extraActions={(row) => <Button size="small" type="link" onClick={() => viewNotice(row)}>查看</Button>}
              />
            )
          },
          {
            key: 'mine',
            label: '我的通知',
            children: (
              <AdminListPanel
                title="我的通知"
                load={systemAdminApi.notice.myPage}
                columns={[
                  { title: '标题', dataIndex: 'title', width: 280, ellipsis: true },
                  { title: '类型', dataIndex: 'noticeType', width: 120, tag: noticeType },
                  { title: '发送人', dataIndex: 'senderName', width: 140 },
                  { title: '发送时间', dataIndex: 'senderDate', width: 180 },
                  { title: '阅读状态', dataIndex: 'readStatus', width: 120, tag: readStatus }
                ]}
                extraActions={(row, reload) => (
                  <>
                    <Button size="small" type="link" onClick={() => viewNotice(row)}>查看</Button>
                    <Button size="small" type="link" onClick={() => systemAdminApi.notice.markRead(row.id).then(() => { message.success('已标记为已读'); reload() })}>已读</Button>
                  </>
                )}
              />
            )
          }
        ]}
      />
    </ModulePage>
  )
}


