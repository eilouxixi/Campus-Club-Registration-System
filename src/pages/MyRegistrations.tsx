import { Typography, Table, Tag, Spin, Button, message, Popconfirm, Empty, Space } from 'antd'
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { registrationApi } from '../api'
import request from '../utils/request'

const { Title, Text } = Typography

interface RegistrationWithActivity {
  id: number
  user_id: number
  activity_id: number
  student_id: string
  class_name: string
  contact: string
  status: 'registered' | 'cancelled'
  registered_at: string
  cancelled_at?: string
  activity?: {
    id: number
    title: string
    locations: { id: number; location_name: string }[]
    start_time: string
    end_time: string
  }
}

const MyRegistrations = () => {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [registrations, setRegistrations] = useState<RegistrationWithActivity[]>([])

  const fetchRegistrations = async () => {
    setLoading(true)
    try {
      const res = await registrationApi.getMyRegistrations()
      const regsWithActivity = await Promise.all(
        (res.data || []).map(async (reg: RegistrationWithActivity) => {
          try {
            const activityRes = await request.get(`/api/activities/${reg.activity_id}`)
            return { ...reg, activity: activityRes.data }
          } catch {
            return reg
          }
        })
      )
      setRegistrations(regsWithActivity)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchRegistrations()
  }, [])

  const handleCancel = async (registrationId: number) => {
    try {
      await request.delete(`/api/registrations/${registrationId}`)
      message.success('取消报名成功，名额已释放')
      await fetchRegistrations()
    } catch (err: any) {
      message.error(err.response?.data?.detail || '取消报名失败')
    }
  }

  const formatDateTime = (dateStr: string) => {
    const d = new Date(dateStr)
    return `${d.toLocaleDateString('zh-CN')} ${d.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}`
  }

  const columns = [
    {
      title: '活动名称',
      key: 'title',
      render: (_: any, record: RegistrationWithActivity) => (
        <Button type="link" onClick={() => navigate(`/activities/${record.activity_id}`)} style={{ padding: 0 }}>
          {record.activity?.title || `活动 #${record.activity_id}`}
        </Button>
      ),
    },
    {
      title: '活动地点',
      key: 'location',
      render: (_: any, record: RegistrationWithActivity) => (
        <Space>
          {record.activity?.locations?.map((loc, idx) => (
            <Tag key={idx} color="purple" style={{ borderRadius: 12 }}>{loc.location_name}</Tag>
          ))}
        </Space>
      ),
    },
    {
      title: '开始时间',
      dataIndex: ['activity', 'start_time'],
      key: 'start_time',
      render: (time: string) => time ? formatDateTime(time) : '-',
    },
    {
      title: '结束时间',
      dataIndex: ['activity', 'end_time'],
      key: 'end_time',
      render: (time: string) => time ? formatDateTime(time) : '-',
    },
    {
      title: '报名时间',
      dataIndex: 'registered_at',
      key: 'registered_at',
      render: (time: string) => formatDateTime(time),
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: RegistrationWithActivity) =>
        record.status === 'registered' ? (
          <Popconfirm
            title="确定要退出报名吗？"
            description="退出后名额将被释放"
            onConfirm={() => handleCancel(record.id)}
            okText="确定"
            cancelText="取消"
            okButtonProps={{ danger: true }}
          >
            <Button danger type="link">取消报名</Button>
          </Popconfirm>
        ) : (
          <Text type="secondary">已取消</Text>
        ),
    },
  ]

  return (
    <div style={{ minHeight: '100vh', background: '#f0f2f5', padding: 24 }}>
      <Title level={2} style={{ marginBottom: 24, fontWeight: 700 }}>我的报名</Title>

      <Spin spinning={loading}>
        {registrations.length === 0 ? (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={
              <Space direction="vertical" size={4}>
                <Text type="secondary">你还没有报名任何活动</Text>
                <Button type="link" onClick={() => navigate('/dashboard/explore')}>
                  去活动广场看看吧
                </Button>
              </Space>
            }
          />
        ) : (
          <Table
            columns={columns}
            dataSource={registrations}
            rowKey="id"
            pagination={{ pageSize: 10 }}
          />
        )}
      </Spin>
    </div>
  )
}

export default MyRegistrations
