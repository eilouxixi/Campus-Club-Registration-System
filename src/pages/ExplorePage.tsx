import { useState, useEffect } from 'react'
import { Card, Row, Col, Typography, Button, Tag, Space, message, Modal, Descriptions, Spin, Empty, Progress, Statistic } from 'antd'
import { CalendarOutlined, EnvironmentOutlined, RocketOutlined, SearchOutlined, HeartOutlined, TeamOutlined, ClockCircleOutlined } from '@ant-design/icons'
import request from '../utils/request'

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
  is_registered?: boolean
  remaining_spots?: number
}

const ExplorePage = () => {
  const [activities, setActivities] = useState<Activity[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null)
  const [detailLoading, setDetailLoading] = useState(false)
  const [actionLoading, setActionLoading] = useState<number | null>(null)

  const fetchActivities = async () => {
    setLoading(true)
    try {
      const res = await request.get('/api/activities', { params: { status: 'open' } })
      setActivities(res.data?.list || [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchActivities()
  }, [])

  const handleViewDetail = async (activityId: number) => {
    setDetailLoading(true)
    try {
      const res = await request.get(`/api/activities/${activityId}`)
      setSelectedActivity(res.data)
    } catch (err) {
      console.error(err)
    } finally {
      setDetailLoading(false)
    }
  }

  const handleRegister = async (activityId: number) => {
    setActionLoading(activityId)
    try {
      await request.post(`/api/activities/${activityId}/register`)
      message.success('🎉 报名成功！欢迎参加本次活动')
      setSelectedActivity(null)
      fetchActivities()
    } catch (err: any) {
      message.error(err.response?.data?.detail || '报名失败')
    } finally {
      setActionLoading(null)
    }
  }

  const handleCancelRegister = async (activityId: number) => {
    setActionLoading(activityId)
    try {
      await request.delete(`/api/activities/${activityId}/register`)
      message.success('已取消报名')
      setSelectedActivity(null)
      fetchActivities()
    } catch (err: any) {
      message.error(err.response?.data?.detail || '取消报名失败')
    } finally {
      setActionLoading(null)
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
    return (
      <Tag color={color} style={{ borderRadius: 20, padding: '4px 12px', fontSize: 13 }}>
        {text}
      </Tag>
    )
  }

  const getProgressColor = (percent: number) => {
    if (percent < 50) return '#52c41a'
    if (percent < 90) return '#faad14'
    return '#ff4d4f'
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

  const formatDateShort = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('zh-CN', {
      month: 'short',
      day: 'numeric'
    })
  }

  return (
    <div style={{ padding: 0 }}>
      {/* 顶部统计卡片 */}
      <Row gutter={[24, 24]} style={{ marginBottom: 32 }}>
        <Col xs={24} sm={12} md={6}>
          <Card style={{ borderRadius: 16, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
            <Statistic
              title={<Text style={{ color: 'rgba(255,255,255,0.9)' }}>活动总数</Text>}
              value={activities.length}
              prefix={<TeamOutlined style={{ color: '#fff' }} />}
              valueStyle={{ color: '#fff', fontSize: 32 }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card style={{ borderRadius: 16, background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' }}>
            <Statistic
              title={<Text style={{ color: 'rgba(255,255,255,0.9)' }}>正在报名</Text>}
              value={activities.filter(a => a.status === 'open').length}
              prefix={<RocketOutlined style={{ color: '#fff' }} />}
              valueStyle={{ color: '#fff', fontSize: 32 }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card style={{ borderRadius: 16, background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' }}>
            <Statistic
              title={<Text style={{ color: 'rgba(255,255,255,0.9)' }}>本周新增</Text>}
              value={12}
              prefix={<CalendarOutlined style={{ color: '#fff' }} />}
              valueStyle={{ color: '#fff', fontSize: 32 }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card style={{ borderRadius: 16, background: 'linear-gradient(135deg, #43e97b 0%, #38ef7d 100%)' }}>
            <Statistic
              title={<Text style={{ color: 'rgba(255,255,255,0.9)' }}>参与人数</Text>}
              value={activities.reduce((sum, a) => sum + a.current_participants, 0)}
              prefix={<HeartOutlined style={{ color: '#fff' }} />}
              valueStyle={{ color: '#fff', fontSize: 32 }}
            />
          </Card>
        </Col>
      </Row>

      {/* 活动列表标题 */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
      }}>
        <div>
          <Title level={3} style={{ margin: 0, color: '#1e293b' }}>📅 热门活动</Title>
          <Text type="secondary">发现精彩的校园社团活动</Text>
        </div>
        <Button
          icon={<RocketOutlined />}
          onClick={fetchActivities}
          loading={loading}
          style={{
            borderRadius: 12,
            height: 44,
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: '#fff',
            border: 'none',
          }}
        >
          刷新活动
        </Button>
      </div>

      {/* 活动卡片列表 */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: 80 }}>
          <Spin size="large" />
          <Text type="secondary" style={{ display: 'block', marginTop: 16 }}>加载中...</Text>
        </div>
      ) : activities.length === 0 ? (
        <Card style={{ borderRadius: 16, padding: 60 }}>
          <Empty
            description={
              <Space direction="vertical" size={16}>
                <Text type="secondary" style={{ fontSize: 16 }}>暂无开放报名的活动</Text>
                <Text type="secondary">敬请期待更多精彩活动</Text>
              </Space>
            }
          />
        </Card>
      ) : (
        <Row gutter={[24, 24]}>
          {activities.map(activity => {
            const progressPercent = Math.round((activity.current_participants / activity.volunteer_count) * 100)
            const isFull = activity.current_participants >= activity.volunteer_count

            return (
              <Col xs={24} sm={12} md={8} key={activity.id}>
                <Card
                  hoverable
                  style={{
                    borderRadius: 20,
                    overflow: 'hidden',
                    transition: 'all 0.3s ease',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                  }}
                  bodyStyle={{ padding: 0 }}
                  cover={
                    <div style={{
                      height: 140,
                      background: `linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)`,
                      position: 'relative',
                      overflow: 'hidden',
                    }}>
                      <div style={{
                        position: 'absolute',
                        top: -20,
                        right: -20,
                        width: 100,
                        height: 100,
                        background: 'rgba(255, 255, 255, 0.1)',
                        borderRadius: '50%',
                      }} />
                      <div style={{
                        position: 'absolute',
                        bottom: -30,
                        left: -30,
                        width: 120,
                        height: 120,
                        background: 'rgba(255, 255, 255, 0.08)',
                        borderRadius: '50%',
                      }} />
                      <div style={{
                        position: 'absolute',
                        inset: 0,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#fff',
                      }}>
                        <div style={{ fontSize: 48, marginBottom: 8 }}>
                          {activity.title.includes('志愿') ? '🤝' :
                           activity.title.includes('运动') ? '⚽' :
                           activity.title.includes('音乐') ? '🎵' : '🎯'}
                        </div>
                        {getStatusTag(activity.status)}
                      </div>
                    </div>
                  }
                >
                  <div style={{ padding: 20 }}>
                    <Title level={4} style={{
                      marginBottom: 12,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}>
                      {activity.title}
                    </Title>

                    <Space direction="vertical" size={8} style={{ width: '100%' }}>
                      <Space>
                        <CalendarOutlined style={{ color: '#667eea' }} />
                        <Text type="secondary" style={{ fontSize: 13 }}>
                          {formatDateShort(activity.start_time)}
                        </Text>
                        <ClockCircleOutlined style={{ color: '#667eea', marginLeft: 8 }} />
                        <Text type="secondary" style={{ fontSize: 13 }}>
                          {activity.start_time.split('T')[1]?.substring(0, 5)}
                        </Text>
                      </Space>
                      <Space>
                        <EnvironmentOutlined style={{ color: '#764ba2' }} />
                        <Text type="secondary" style={{ fontSize: 13 }}>
                          {activity.locations?.[0]?.location_name || '待定'}
                        </Text>
                      </Space>
                    </Space>

                    <div style={{ marginTop: 16 }}>
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        marginBottom: 8
                      }}>
                        <Text type="secondary" style={{ fontSize: 12 }}>报名进度</Text>
                        <Text style={{ fontSize: 12, fontWeight: 600, color: getProgressColor(progressPercent) }}>
                          {activity.current_participants}/{activity.volunteer_count} 人
                        </Text>
                      </div>
                      <Progress
                        percent={progressPercent}
                        size="small"
                        strokeColor={getProgressColor(progressPercent)}
                        showInfo={false}
                      />
                    </div>

                    <Button
                      type="primary"
                      block
                      onClick={() => handleViewDetail(activity.id)}
                      style={{
                        marginTop: 16,
                        height: 44,
                        borderRadius: 12,
                        background: isFull ? '#d9d9d9' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        border: 'none',
                        fontWeight: 600,
                      }}
                    >
                      {isFull ? '名额已满' : '查看详情'}
                    </Button>
                  </div>
                </Card>
              </Col>
            )
          })}
        </Row>
      )}

      {/* 活动详情弹窗 */}
      <Modal
        title={null}
        open={!!selectedActivity}
        onCancel={() => setSelectedActivity(null)}
        footer={null}
        width={700}
        bodyStyle={{ padding: 0 }}
        style={{ top: 20 }}
      >
        {detailLoading ? (
          <div style={{ textAlign: 'center', padding: 60 }}>
            <Spin size="large" />
          </div>
        ) : selectedActivity ? (
          <div>
            {/* 弹窗头部 */}
            <div style={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              padding: '32px 24px',
              color: '#fff',
              position: 'relative',
              overflow: 'hidden',
            }}>
              <div style={{
                position: 'absolute',
                top: -40,
                right: -40,
                width: 160,
                height: 160,
                background: 'rgba(255, 255, 255, 0.1)',
                borderRadius: '50%',
              }} />
              <div style={{ position: 'relative', zIndex: 1 }}>
                {getStatusTag(selectedActivity.status)}
                <Title level={2} style={{ color: '#fff', marginTop: 16, marginBottom: 8 }}>
                  {selectedActivity.title}
                </Title>
                <Text style={{ color: 'rgba(255,255,255,0.9)', fontSize: 15 }}>
                  福州大学至诚学院 · 计算机工程系
                </Text>
              </div>
            </div>

            {/* 弹窗内容 */}
            <div style={{ padding: 24 }}>
              <Row gutter={[24, 24]} style={{ marginBottom: 24 }}>
                <Col span={12}>
                  <Card size="small" style={{ borderRadius: 12, background: '#f7f8fa' }}>
                    <Statistic
                      title="开始时间"
                      value={formatDate(selectedActivity.start_time)}
                      valueStyle={{ fontSize: 14 }}
                    />
                  </Card>
                </Col>
                <Col span={12}>
                  <Card size="small" style={{ borderRadius: 12, background: '#f7f8fa' }}>
                    <Statistic
                      title="结束时间"
                      value={formatDate(selectedActivity.end_time)}
                      valueStyle={{ fontSize: 14 }}
                    />
                  </Card>
                </Col>
              </Row>

              <div style={{ marginBottom: 24 }}>
                <Text strong style={{ fontSize: 15, marginBottom: 8, display: 'block' }}>
                  📍 活动地点
                </Text>
                <Space wrap>
                  {selectedActivity.locations?.map((loc, idx) => (
                    <Tag key={idx} color="purple" style={{ borderRadius: 20, padding: '4px 12px' }}>
                      {loc.location_name}
                    </Tag>
                  ))}
                </Space>
              </div>

              <div style={{ marginBottom: 24 }}>
                <Text strong style={{ fontSize: 15, marginBottom: 12, display: 'block' }}>
                  👥 报名情况
                </Text>
                <Progress
                  percent={Math.round((selectedActivity.current_participants / selectedActivity.volunteer_count) * 100)}
                  format={() => `${selectedActivity.current_participants} / ${selectedActivity.volunteer_count} 人`}
                  strokeColor={getProgressColor(Math.round((selectedActivity.current_participants / selectedActivity.volunteer_count) * 100))}
                  style={{ marginBottom: 8 }}
                />
                <Text type="secondary">
                  剩余 {selectedActivity.volunteer_count - selectedActivity.current_participants} 个名额
                </Text>
              </div>

              {selectedActivity.description && (
                <div style={{ marginBottom: 24 }}>
                  <Text strong style={{ fontSize: 15, marginBottom: 8, display: 'block' }}>
                    📝 活动描述
                  </Text>
                  <Paragraph style={{ lineHeight: 1.8, color: '#64748b' }}>
                    {selectedActivity.description}
                  </Paragraph>
                </div>
              )}

              <div style={{ display: 'flex', gap: 12, marginTop: 32 }}>
                <Button
                  type="primary"
                  size="large"
                  loading={actionLoading === selectedActivity.id}
                  onClick={() => handleRegister(selectedActivity.id)}
                  disabled={selectedActivity.current_participants >= selectedActivity.volunteer_count}
                  style={{
                    flex: 1,
                    height: 52,
                    borderRadius: 12,
                    background: selectedActivity.current_participants >= selectedActivity.volunteer_count
                      ? '#d9d9d9'
                      : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    border: 'none',
                    fontWeight: 600,
                    fontSize: 16,
                  }}
                >
                  {selectedActivity.current_participants >= selectedActivity.volunteer_count ? '名额已满' : '立即报名'}
                </Button>
                <Button
                  size="large"
                  onClick={() => setSelectedActivity(null)}
                  style={{
                    height: 52,
                    width: 120,
                    borderRadius: 12,
                  }}
                >
                  关闭
                </Button>
              </div>
            </div>
          </div>
        ) : null}
      </Modal>
    </div>
  )
}

export default ExplorePage
