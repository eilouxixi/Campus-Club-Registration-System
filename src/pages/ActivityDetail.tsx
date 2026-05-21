import { Typography, Card, Button, message, Spin, Tag, Space, Progress, Modal, Form, Input } from 'antd'
import { useParams, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { ArrowLeftOutlined, CalendarOutlined, EnvironmentOutlined, TeamOutlined, CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons'
import { activityApi } from '../api'
import { useUserStore } from '../store/useUserStore'

const { Title, Text, Paragraph } = Typography

interface Activity {
  id: number
  title: string
  description?: string
  locations: { id: number; location_name: string }[]
  start_time: string
  end_time: string
  volunteer_count: number
  max_participants: number
  current_participants: number
  status: string
  created_by: number
  created_at: string
  is_registered: boolean
  remaining_spots: number
}

interface RegistrationForm {
  student_id: string
  class_name: string
  contact: string
}

const ActivityDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [activity, setActivity] = useState<Activity | null>(null)
  const [actionLoading, setActionLoading] = useState(false)
  const [registerModalOpen, setRegisterModalOpen] = useState(false)
  const [form] = Form.useForm()
  const user = useUserStore(state => state.user)

  const fetchActivity = async () => {
    if (!id) return
    setLoading(true)
    try {
      const res = await activityApi.getDetail(parseInt(id))
      setActivity(res.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchActivity()
  }, [id])

  const handleRegister = async (values: RegistrationForm) => {
    if (!id) return
    setActionLoading(true)
    try {
      await activityApi.register(parseInt(id), values)
      message.success({
        content: '🎉 报名成功！欢迎参加本次活动',
        icon: <CheckCircleOutlined style={{ color: '#52c41a' }} />
      })
      setRegisterModalOpen(false)
      form.resetFields()
      await fetchActivity()
    } catch (err: any) {
      const detail = err.response?.data?.detail
      if (detail === '志愿者名额已满') {
        form.resetFields()
        setRegisterModalOpen(false)
        message.error('手慢啦，名额已被抢完')
      } else {
        message.error({
          content: detail || '报名失败，请重试',
          icon: <CloseCircleOutlined style={{ color: '#ff4d4f' }} />
        })
      }
    } finally {
      setActionLoading(false)
    }
  }

  const handleCancel = async () => {
    if (!id) return
    setActionLoading(true)
    try {
      await activityApi.cancelRegister(parseInt(id))
      message.success({
        content: '已取消报名',
        icon: <CheckCircleOutlined style={{ color: '#52c41a' }} />
      })
      await fetchActivity()
    } catch (err: any) {
      message.error({
        content: err.response?.data?.detail || '取消报名失败',
        icon: <CloseCircleOutlined style={{ color: '#ff4d4f' }} />
      })
    } finally {
      setActionLoading(false)
    }
  }

  const getStatusTag = (status: string) => {
    const map: Record<string, { color: string; text: string }> = {
      open: { color: 'success', text: '报名中' },
      upcoming: { color: 'processing', text: '即将开始' },
      ongoing: { color: 'warning', text: '进行中' },
      ended: { color: 'default', text: '已结束' },
    }
    return map[status] || { color: 'default', text: status }
  }

  const getProgressColor = (percent: number) => {
    if (percent < 50) return '#52c41a'
    if (percent < 90) return '#faad14'
    return '#ff4d4f'
  }

  const formatDateRange = (start: string, end: string) => {
    const s = new Date(start).toLocaleString('zh-CN')
    const e = new Date(end).toLocaleString('zh-CN').split(' ')[1]
    return `${s.split(' ')[0]} ${s.split(' ')[1]} ~ ${e}`
  }

  const progressPercent = activity
    ? Math.round((activity.current_participants / activity.volunteer_count) * 100)
    : 0

  const isEnded = activity?.status === 'ended'

  return (
    <div style={{ minHeight: '100vh', background: '#f0f2f5', padding: 24 }}>
      <Button
        icon={<ArrowLeftOutlined />}
        onClick={() => navigate(-1)}
        style={{ marginBottom: 24, borderRadius: 8 }}
      >
        返回
      </Button>

      <Spin spinning={loading} tip="加载中...">
        {activity && (
          <div>
            <div style={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              borderRadius: 16,
              padding: '32px 40px',
              marginBottom: 24,
              position: 'relative',
              overflow: 'hidden'
            }}>
              <div style={{
                position: 'absolute',
                top: -30,
                right: -30,
                width: 150,
                height: 150,
                background: 'rgba(255, 255, 255, 0.1)',
                borderRadius: '50%',
              }} />
              <div style={{ position: 'relative', zIndex: 1 }}>
                <Space style={{ marginBottom: 12 }}>
                  <Tag color={getStatusTag(activity.status).color} style={{ borderRadius: 20 }}>
                    {getStatusTag(activity.status).text}
                  </Tag>
                  {activity.is_registered && (
                    <Tag color="blue" style={{ borderRadius: 20 }}>已报名</Tag>
                  )}
                </Space>
                <Title level={1} style={{ color: '#fff', marginBottom: 8, fontWeight: 700, fontSize: 36 }}>
                  {activity.title}
                </Title>
                <Text style={{ color: 'rgba(255,255,255,0.9)', fontSize: 16 }}>
                  福州大学至诚学院 · 计算机工程系
                </Text>
              </div>
            </div>

            <Card style={{ borderRadius: 16, marginBottom: 24 }} bodyStyle={{ padding: 0 }}>
              <div style={{ padding: 24 }}>
                <Space direction="vertical" size={16} style={{ width: '100%' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                    <CalendarOutlined style={{ fontSize: 20, color: '#667eea', marginTop: 4 }} />
                    <div>
                      <Text type="secondary" style={{ fontSize: 12 }}>活动时间</Text>
                      <div style={{ fontWeight: 600, fontSize: 15 }}>
                        {formatDateRange(activity.start_time, activity.end_time)}
                      </div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                    <EnvironmentOutlined style={{ fontSize: 20, color: '#764ba2', marginTop: 4 }} />
                    <div>
                      <Text type="secondary" style={{ fontSize: 12 }}>活动地点</Text>
                      <div style={{ marginTop: 4 }}>
                        {activity.locations?.map((loc, idx) => (
                          <Tag key={idx} color="purple" style={{ borderRadius: 12, marginBottom: 4 }}>{loc.location_name}</Tag>
                        ))}
                      </div>
                    </div>
                  </div>
                </Space>
              </div>

              <div style={{
                borderTop: '1px solid #f0f0f0',
                padding: 24,
                background: '#fafafa'
              }}>
                <Space style={{ width: '100%', justifyContent: 'space-between', marginBottom: 12 }}>
                  <Space>
                    <TeamOutlined style={{ fontSize: 20, color: '#667eea' }} />
                    <Text strong style={{ fontSize: 16 }}>志愿者招募进度</Text>
                  </Space>
                  <Text strong style={{ fontSize: 16 }}>
                    {activity.current_participants} / {activity.volunteer_count} 人
                  </Text>
                </Space>
                <Progress
                  percent={progressPercent}
                  strokeColor={getProgressColor(progressPercent)}
                  trailColor="#f0f0f0"
                />
                <Text type="secondary" style={{ fontSize: 13 }}>
                  剩余 <Text strong style={{ color: getProgressColor(progressPercent) }}>{activity.remaining_spots}</Text> 个名额
                </Text>
              </div>
            </Card>

            {activity.description && (
              <Card title="活动详情" style={{ borderRadius: 16, marginBottom: 24 }}>
                <Paragraph style={{ whiteSpace: 'pre-wrap', lineHeight: 2, fontSize: 15 }}>
                  {activity.description}
                </Paragraph>
              </Card>
            )}

            {!isEnded && (
              <div style={{
                position: 'fixed',
                bottom: 0,
                left: 0,
                right: 0,
                background: '#fff',
                padding: '16px 24px',
                boxShadow: '0 -4px 16px rgba(0,0,0,0.08)',
                display: 'flex',
                justifyContent: 'center',
                gap: 16,
                zIndex: 100
              }}>
                {!user ? (
                  <Button
                    type="primary"
                    size="large"
                    style={{
                      height: 52,
                      paddingInline: 64,
                      fontSize: 16,
                      fontWeight: 600,
                      borderRadius: 12,
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      border: 'none',
                    }}
                    onClick={() => navigate('/login')}
                  >
                    请先登录
                  </Button>
                ) : activity.is_registered ? (
                  <Button
                    danger
                    size="large"
                    onClick={handleCancel}
                    loading={actionLoading}
                    style={{
                      height: 52,
                      paddingInline: 64,
                      fontSize: 16,
                      fontWeight: 600,
                      borderRadius: 12,
                    }}
                  >
                    取消报名
                  </Button>
                ) : activity.remaining_spots <= 0 ? (
                  <Button
                    size="large"
                    disabled
                    style={{
                      height: 52,
                      paddingInline: 64,
                      fontSize: 16,
                      fontWeight: 600,
                      borderRadius: 12,
                    }}
                  >
                    名额已满
                  </Button>
                ) : (
                  <Button
                    type="primary"
                    size="large"
                    onClick={() => setRegisterModalOpen(true)}
                    style={{
                      height: 52,
                      paddingInline: 64,
                      fontSize: 16,
                      fontWeight: 600,
                      borderRadius: 12,
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      border: 'none',
                      boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)',
                    }}
                  >
                    立即报名
                  </Button>
                )}
              </div>
            )}

            <Modal
              title="填写报名信息"
              open={registerModalOpen}
              onCancel={() => setRegisterModalOpen(false)}
              footer={null}
              width={500}
              destroyOnClose
            >
              <Form
                form={form}
                layout="vertical"
                onFinish={handleRegister}
                size="large"
                style={{ marginTop: 24 }}
              >
                <Form.Item
                  name="student_id"
                  label="学号"
                  rules={[
                    { required: true, message: '请输入学号' },
                    { pattern: /^(212506|212406|212306|212206|212106)\d{3}$/, message: '学号必须是9位数字且以212506、212406、212306、212206或212106开头' }
                  ]}
                >
                  <Input placeholder="如：212406001" style={{ borderRadius: 12 }} />
                </Form.Item>
                <Form.Item
                  name="class_name"
                  label="班级"
                  rules={[{ required: true, message: '请输入班级' }]}
                >
                  <Input placeholder="如：计算机2024级1班" style={{ borderRadius: 12 }} />
                </Form.Item>
                <Form.Item
                  name="contact"
                  label="联系方式"
                  rules={[{ required: true, message: '请输入联系方式' }]}
                >
                  <Input placeholder="手机号或QQ号" style={{ borderRadius: 12 }} />
                </Form.Item>
                <Form.Item style={{ marginTop: 32 }}>
                  <Space style={{ width: '100%', justifyContent: 'center' }}>
                    <Button
                      type="primary"
                      htmlType="submit"
                      loading={actionLoading}
                      style={{
                        height: 48,
                        paddingInline: 48,
                        fontSize: 16,
                        fontWeight: 600,
                        borderRadius: 12,
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        border: 'none',
                      }}
                    >
                      确认报名
                    </Button>
                    <Button
                      onClick={() => setRegisterModalOpen(false)}
                      style={{ height: 48, paddingInline: 48, fontSize: 16, borderRadius: 12 }}
                    >
                      取消
                    </Button>
                  </Space>
                </Form.Item>
              </Form>
            </Modal>
          </div>
        )}
      </Spin>
    </div>
  )
}

export default ActivityDetail
