import { useState, useEffect } from 'react'
import { Card, Form, Input, DatePicker, InputNumber, Button, Typography, Space, Tag, message, Modal, Spin, Empty, Row, Col, Statistic } from 'antd'
import { PlusOutlined, TeamOutlined, CalendarOutlined, RocketOutlined, MinusCircleOutlined, CheckCircleOutlined, ClockCircleOutlined } from '@ant-design/icons'
import request from '../utils/request'

const { Title, Text } = Typography
const { TextArea } = Input

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
}

interface Registration {
  registration_id: number
  user_id: number
  email: string
  student_id: string
  class_name: string
  contact: string
  registered_at: string
}

const ManagePage = () => {
  const [activities, setActivities] = useState<Activity[]>([])
  const [loading, setLoading] = useState(false)
  const [creating, setCreating] = useState(false)
  const [form] = Form.useForm()
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null)
  const [registrations, setRegistrations] = useState<Registration[]>([])
  const [registrationsLoading, setRegistrationsLoading] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [formExpanded, setFormExpanded] = useState(false)

  const fetchMyActivities = async () => {
    setLoading(true)
    try {
      const res = await request.get('/api/my-activities')
      setActivities(res.data || [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMyActivities()
  }, [])

  const handleCreateActivity = async (values: any) => {
    setCreating(true)
    try {
      // 过滤并处理地点数据
      const locations = values.locations?.filter((loc: string) => loc && loc.trim())
      if (!locations || locations.length === 0) {
        message.error('请至少添加一个活动地点')
        setCreating(false)
        return
      }

      // 处理时间格式，确保是 ISO 格式字符串
      const formatTime = (time: any) => {
        if (!time) return null
        // 如果是 moment 或 dayjs 对象，转换为 ISO 格式
        if (typeof time.toISOString === 'function') {
          return time.toISOString()
        }
        // 如果已经是字符串，直接返回
        if (typeof time === 'string') {
          return time
        }
        return null
      }

      const startTime = formatTime(values.start_time)
      const endTime = formatTime(values.end_time)

      if (!startTime || !endTime) {
        message.error('请选择正确的活动时间')
        setCreating(false)
        return
      }

      const activityData = {
        title: values.title,
        description: values.description || '',
        locations: locations,
        volunteer_count: values.volunteer_count,
        start_time: startTime,
        end_time: endTime,
        max_participants: values.volunteer_count,
      }

      console.log('发送数据:', activityData)

      await request.post('/api/activities', activityData)
      
      message.success({
        content: '🎉 活动发布成功！',
        icon: <CheckCircleOutlined style={{ color: '#52c41a' }} />
      })
      form.resetFields()
      setFormExpanded(false)
      fetchMyActivities()
    } catch (err: any) {
      console.error('创建活动失败:', err)
      message.error({
        content: err.response?.data?.detail || err.message || '发布失败，请重试',
        icon: <ClockCircleOutlined style={{ color: '#ff4d4f' }} />
      })
    } finally {
      setCreating(false)
    }
  }

  const handleViewRegistrations = async (activity: Activity) => {
    setSelectedActivity(activity)
    setRegistrationsLoading(true)
    setModalOpen(true)
    try {
      const res = await request.get(`/api/my-activities/${activity.id}/registrations`)
      setRegistrations(res.data || [])
    } catch (err: any) {
      message.error(err.response?.data?.detail || '获取报名名单失败')
    } finally {
      setRegistrationsLoading(false)
    }
  }

  const getStatusTag = (status: string) => {
    const statusMap: Record<string, { color: string; text: string }> = {
      open: { color: 'success', text: '🔥 报名中' },
      upcoming: { color: 'processing', text: '⏰ 即将开始' },
      ongoing: { color: 'warning', text: '🚀 进行中' },
      ended: { color: 'default', text: '✓ 已结束' },
    }
    const { color, text } = statusMap[status] || { color: 'default', text: status }
    return <Tag color={color} style={{ borderRadius: 20, padding: '4px 12px' }}>{text}</Tag>
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatDateRange = (start: string, end: string) => {
    const s = new Date(start).toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })
    const e = new Date(end).toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })
    return `${s} - ${e}`
  }

  return (
    <div style={{ padding: 0 }}>
      {/* 顶部统计卡片 */}
      <Row gutter={[24, 24]} style={{ marginBottom: 32 }}>
        <Col xs={24} sm={12} md={8}>
          <Card style={{ borderRadius: 16, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
            <Statistic
              title={<Text style={{ color: 'rgba(255,255,255,0.9)' }}>我发布的活动</Text>}
              value={activities.length}
              prefix={<RocketOutlined style={{ color: '#fff' }} />}
              valueStyle={{ color: '#fff', fontSize: 32 }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8}>
          <Card style={{ borderRadius: 16, background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' }}>
            <Statistic
              title={<Text style={{ color: 'rgba(255,255,255,0.9)' }}>正在报名</Text>}
              value={activities.filter(a => a.status === 'open').length}
              prefix={<TeamOutlined style={{ color: '#fff' }} />}
              valueStyle={{ color: '#fff', fontSize: 32 }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8}>
          <Card style={{ borderRadius: 16, background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' }}>
            <Statistic
              title={<Text style={{ color: 'rgba(255,255,255,0.9)' }}>总报名人数</Text>}
              value={activities.reduce((sum, a) => sum + a.current_participants, 0)}
              prefix={<CheckCircleOutlined style={{ color: '#fff' }} />}
              valueStyle={{ color: '#fff', fontSize: 32 }}
            />
          </Card>
        </Col>
      </Row>

      {/* 发布活动表单 */}
      <Card
        title={
          <Space>
            <div style={{
              width: 40,
              height: 40,
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              borderRadius: 10,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)'
            }}>
              <RocketOutlined style={{ fontSize: 20, color: '#fff' }} />
            </div>
            <div>
              <Text strong style={{ fontSize: 16 }}>发布新活动</Text>
              <Text type="secondary" style={{ fontSize: 12, display: 'block' }}>创建精彩的校园社团活动</Text>
            </div>
          </Space>
        }
        extra={
          <Button
            type="primary"
            icon={formExpanded ? <MinusCircleOutlined /> : <PlusOutlined />}
            onClick={() => setFormExpanded(!formExpanded)}
            style={{
              borderRadius: 10,
              background: formExpanded ? '#d9d9d9' : 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              border: 'none',
            }}
          >
            {formExpanded ? '收起表单' : '发布活动'}
          </Button>
        }
        style={{ borderRadius: 20, marginBottom: 24 }}
        bodyStyle={{ padding: formExpanded ? 24 : 0, maxHeight: formExpanded ? 'none' : 0, overflow: 'hidden' }}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleCreateActivity}
          style={{ display: formExpanded ? 'block' : 'none' }}
        >
          <Row gutter={24}>
            <Col span={24}>
              <Form.Item
                name="title"
                label={<Text strong>活动名称</Text>}
                rules={[{ required: true, message: '请输入活动名称' }]}
              >
                <Input 
                  placeholder="请输入活动名称" 
                  style={{ borderRadius: 12, height: 48 }} 
                  size="large"
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={24}>
            <Col span={24}>
              <Form.Item
                name="description"
                label={<Text strong>活动描述</Text>}
              >
                <TextArea 
                  rows={4} 
                  placeholder="请输入活动描述，包括活动内容、参与方式等详细信息" 
                  style={{ borderRadius: 12 }} 
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={24}>
            <Col xs={24} sm={12}>
              <Form.Item
                name="volunteer_count"
                label={<Text strong>志愿者人数</Text>}
                rules={[{ required: true, message: '请输入志愿者人数' }]}
                extra="志愿者人数也是活动的最大参与人数"
              >
                <InputNumber 
                  min={1} 
                  placeholder="志愿者人数" 
                  style={{ borderRadius: 12, width: '100%', height: 48 }} 
                  size="large"
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                name="locations"
                label={<Text strong>活动地点</Text>}
                rules={[{ required: true, message: '请至少添加一个活动地点' }]}
              >
                <Form.List name="locations">
                  {(fields, { add, remove }) => (
                    <>
                      {fields.map(({ key, name, ...restField }) => (
                        <Form.Item
                          {...restField}
                          name={name}
                          rules={[{ required: true, message: '请输入地点' }]}
                          style={{ marginBottom: 8 }}
                        >
                          <Input 
                            placeholder="例：北区体育馆" 
                            style={{ borderRadius: 12 }} 
                            addonAfter={
                              fields.length > 1 ? (
                                <MinusCircleOutlined 
                                  onClick={() => remove(name)} 
                                  style={{ color: '#ff4d4f', cursor: 'pointer' }} 
                                />
                              ) : null
                            }
                          />
                        </Form.Item>
                      ))}
                      <Button 
                        type="dashed" 
                        onClick={() => add()} 
                        block 
                        icon={<PlusOutlined />}
                        style={{ borderRadius: 12, height: 40 }}
                      >
                        添加地点
                      </Button>
                    </>
                  )}
                </Form.List>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={24}>
            <Col xs={24} sm={12}>
              <Form.Item
                name="start_time"
                label={<Text strong>活动开始时间</Text>}
                rules={[{ required: true, message: '请选择开始时间' }]}
              >
                <DatePicker 
                  showTime 
                  style={{ borderRadius: 12, width: '100%', height: 48 }} 
                  size="large"
                  placeholder="选择开始时间"
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                name="end_time"
                label={<Text strong>活动结束时间</Text>}
                rules={[{ required: true, message: '请选择结束时间' }]}
              >
                <DatePicker 
                  showTime 
                  style={{ borderRadius: 12, width: '100%', height: 48 }} 
                  size="large"
                  placeholder="选择结束时间"
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item style={{ marginTop: 24 }}>
            <Button
              type="primary"
              htmlType="submit"
              loading={creating}
              icon={<RocketOutlined />}
              block
              style={{
                height: 52,
                borderRadius: 12,
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                border: 'none',
                fontSize: 16,
                fontWeight: 600,
                boxShadow: '0 4px 15px rgba(16, 185, 129, 0.4)',
              }}
            >
              🚀 发布活动
            </Button>
          </Form.Item>
        </Form>
      </Card>

      {/* 我发布的活动列表 */}
      <Card
        title={
          <Space>
            <div style={{
              width: 40,
              height: 40,
              background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
              borderRadius: 10,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)'
            }}>
              <TeamOutlined style={{ fontSize: 20, color: '#fff' }} />
            </div>
            <div>
              <Text strong style={{ fontSize: 16 }}>我发布的活动</Text>
              <Text type="secondary" style={{ fontSize: 12, display: 'block' }}>查看和管理您的活动</Text>
            </div>
          </Space>
        }
        style={{ borderRadius: 20 }}
      >
        {loading ? (
          <div style={{ textAlign: 'center', padding: 60 }}>
            <Spin size="large" />
            <Text type="secondary" style={{ display: 'block', marginTop: 16 }}>加载中...</Text>
          </div>
        ) : activities.length === 0 ? (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={
              <Space direction="vertical" size={16}>
                <Text type="secondary" style={{ fontSize: 16 }}>暂无发布的活动</Text>
                <Text type="secondary">点击上方按钮发布您的第一个活动</Text>
              </Space>
            }
          />
        ) : (
          <Row gutter={[16, 16]}>
            {activities.map(activity => (
              <Col xs={24} sm={12} md={8} key={activity.id}>
                <Card
                  hoverable
                  style={{ 
                    borderRadius: 16,
                    overflow: 'hidden',
                    transition: 'all 0.3s ease',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                  }}
                  bodyStyle={{ padding: 0 }}
                >
                  <div style={{
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    padding: '20px 16px',
                    color: '#fff',
                    position: 'relative',
                    overflow: 'hidden',
                  }}>
                    <div style={{
                      position: 'absolute',
                      top: -20,
                      right: -20,
                      width: 80,
                      height: 80,
                      background: 'rgba(255, 255, 255, 0.1)',
                      borderRadius: '50%',
                    }} />
                    <Space style={{ width: '100%', justifyContent: 'space-between', position: 'relative', zIndex: 1 }}>
                      {getStatusTag(activity.status)}
                      <Text style={{ fontSize: 12, color: 'rgba(255,255,255,0.8)' }}>
                        {formatDateRange(activity.start_time, activity.end_time)}
                      </Text>
                    </Space>
                    <Title level={4} style={{ color: '#fff', marginTop: 12, marginBottom: 8 }}>
                      {activity.title}
                    </Title>
                  </div>

                  <div style={{ padding: 16 }}>
                    <Space direction="vertical" size={8} style={{ width: '100%' }}>
                      <Space>
                        <CalendarOutlined style={{ color: '#667eea' }} />
                        <Text type="secondary" style={{ fontSize: 13 }}>
                          {formatDate(activity.start_time)} - {formatDate(activity.end_time).split(' ')[1]}
                        </Text>
                      </Space>
                      <Space wrap>
                        {activity.locations?.map((loc, idx) => (
                          <Tag key={idx} color="purple" style={{ borderRadius: 12 }}>
                            📍 {loc.location_name}
                          </Tag>
                        ))}
                      </Space>
                    </Space>

                    <div style={{
                      marginTop: 16,
                      paddingTop: 16,
                      borderTop: '1px solid #f0f0f0',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}>
                      <Space>
                        <CheckCircleOutlined style={{ color: '#10b981' }} />
                        <Text strong style={{ color: '#10b981' }}>
                          {activity.current_participants} / {activity.volunteer_count} 人
                        </Text>
                      </Space>
                      <Button
                        type="primary"
                        ghost
                        onClick={() => handleViewRegistrations(activity)}
                        style={{
                          borderRadius: 10,
                          borderColor: '#667eea',
                          color: '#667eea',
                        }}
                      >
                        查看名单
                      </Button>
                    </div>
                  </div>
                </Card>
              </Col>
            ))}
          </Row>
        )}
      </Card>

      {/* 报名名单弹窗 */}
      <Modal
        title={null}
        open={modalOpen}
        onCancel={() => {
          setModalOpen(false)
          setSelectedActivity(null)
          setRegistrations([])
        }}
        footer={null}
        width={800}
        bodyStyle={{ padding: 0 }}
        style={{ top: 20 }}
      >
        {selectedActivity && (
          <div>
            {/* 弹窗头部 */}
            <div style={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              padding: '24px',
              color: '#fff',
              position: 'relative',
              overflow: 'hidden',
            }}>
              <div style={{
                position: 'absolute',
                top: -30,
                right: -30,
                width: 120,
                height: 120,
                background: 'rgba(255, 255, 255, 0.1)',
                borderRadius: '50%',
              }} />
              <div style={{ position: 'relative', zIndex: 1 }}>
                <Title level={4} style={{ color: '#fff', marginBottom: 8 }}>
                  {selectedActivity.title}
                </Title>
                <Text style={{ color: 'rgba(255,255,255,0.9)' }}>
                  📋 报名名单
                </Text>
              </div>
            </div>

            {/* 统计信息 */}
            <div style={{ padding: 20 }}>
              <Row gutter={16} style={{ marginBottom: 20 }}>
                <Col span={8}>
                  <Statistic
                    title="报名人数"
                    value={registrations.length}
                    suffix={`/ ${selectedActivity.volunteer_count}`}
                    valueStyle={{ color: '#667eea' }}
                  />
                </Col>
                <Col span={8}>
                  <Statistic
                    title="剩余名额"
                    value={selectedActivity.volunteer_count - registrations.length}
                    valueStyle={{ color: '#10b981' }}
                  />
                </Col>
                <Col span={8}>
                  <Statistic
                    title="报名率"
                    value={Math.round((registrations.length / selectedActivity.volunteer_count) * 100)}
                    suffix="%"
                    valueStyle={{ color: '#f59e0b' }}
                  />
                </Col>
              </Row>

              {registrationsLoading ? (
                <div style={{ textAlign: 'center', padding: 40 }}>
                  <Spin size="large" />
                </div>
              ) : registrations.length === 0 ? (
                <Empty description="暂无报名人员" />
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ background: '#f7f8fa' }}>
                        <th style={{ padding: '12px 8px', textAlign: 'left', borderBottom: '2px solid #e8e8e8', fontWeight: 600 }}>学号</th>
                        <th style={{ padding: '12px 8px', textAlign: 'left', borderBottom: '2px solid #e8e8e8', fontWeight: 600 }}>班级</th>
                        <th style={{ padding: '12px 8px', textAlign: 'left', borderBottom: '2px solid #e8e8e8', fontWeight: 600 }}>联系方式</th>
                        <th style={{ padding: '12px 8px', textAlign: 'left', borderBottom: '2px solid #e8e8e8', fontWeight: 600 }}>报名时间</th>
                      </tr>
                    </thead>
                    <tbody>
                      {registrations.map((reg, index) => (
                        <tr key={reg.registration_id} style={{ background: index % 2 === 0 ? '#fff' : '#fafafa' }}>
                          <td style={{ padding: '12px 8px', borderBottom: '1px solid #e8e8e8' }}>
                            <Text code>{reg.student_id}</Text>
                          </td>
                          <td style={{ padding: '12px 8px', borderBottom: '1px solid #e8e8e8' }}>{reg.class_name}</td>
                          <td style={{ padding: '12px 8px', borderBottom: '1px solid #e8e8e8' }}>{reg.contact}</td>
                          <td style={{ padding: '12px 8px', borderBottom: '1px solid #e8e8e8', color: '#64748b', fontSize: 13 }}>
                            {formatDate(reg.registered_at)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}

export default ManagePage
