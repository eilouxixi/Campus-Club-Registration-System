import { Typography, Card, Row, Col, Select, Pagination, Tag, Empty, Spin, Space, Divider } from 'antd'
import { CalendarOutlined, EnvironmentOutlined, UserOutlined, CodeOutlined, TrophyOutlined, TeamOutlined, LaptopOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { activityApi } from '../api'

const { Title, Text, Paragraph } = Typography

const Activities = () => {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [activities, setActivities] = useState([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(9)
  const [statusFilter, setStatusFilter] = useState<string | undefined>()

  const fetchActivities = async () => {
    setLoading(true)
    try {
      const res = await activityApi.getList({
        page,
        page_size: pageSize,
        status: statusFilter,
      })
      setActivities(res.data?.list || [])
      setTotal(res.data?.total || 0)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchActivities()
  }, [page, pageSize, statusFilter])

  const getStatusColor = (status: string) => {
    const map: Record<string, string> = {
      open: 'green',
      upcoming: 'blue',
      ongoing: 'orange',
      ended: 'default',
    }
    return map[status] || 'default'
  }

  const getStatusText = (status: string) => {
    const map: Record<string, string> = {
      open: '报名中',
      upcoming: '即将开始',
      ongoing: '进行中',
      ended: '已结束',
    }
    return map[status] || status
  }

  return (
    <div>
      <div style={{ marginBottom: 32, textAlign: 'center' }}>
        <Title level={2} style={{ color: '#001529', marginBottom: 8 }}>
          <CodeOutlined style={{ marginRight: 12, color: '#1890ff' }} />
          计算机工程系 社团活动
        </Title>
        <Paragraph type="secondary" style={{ fontSize: 15 }}>
          福州大学至诚学院 · 精彩活动，等你来参与！
        </Paragraph>
        <Space size="large" style={{ marginTop: 16 }}>
          <Tag icon={<TrophyOutlined />} color="gold" style={{ padding: '4px 16px', fontSize: 14 }}>
            编程竞赛
          </Tag>
          <Tag icon={<LaptopOutlined />} color="blue" style={{ padding: '4px 16px', fontSize: 14 }}>
            技术分享
          </Tag>
          <Tag icon={<TeamOutlined />} color="green" style={{ padding: '4px 16px', fontSize: 14 }}>
            社团团建
          </Tag>
        </Space>
      </div>
      
      <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Select
          placeholder="筛选活动状态"
          allowClear
          style={{ width: 220 }}
          onChange={(val) => {
            setStatusFilter(val)
            setPage(1)
          }}
          options={[
            { label: '全部活动', value: '' },
            { label: '报名中', value: 'open' },
            { label: '即将开始', value: 'upcoming' },
            { label: '进行中', value: 'ongoing' },
            { label: '已结束', value: 'ended' },
          ]}
        />
      </div>
      
      <Spin spinning={loading}>
        {activities.length === 0 ? (
          <Empty 
            description="暂无活动，敬请期待计科系精彩活动！" 
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          />
        ) : (
          <>
            <Row gutter={[20, 20]}>
              {activities.map((activity: any) => (
                <Col xs={24} sm={12} md={8} key={activity.id}>
                  <Card
                    hoverable
                    onClick={() => navigate(`/activities/${activity.id}`)}
                    style={{
                      height: '100%',
                      borderRadius: 12,
                      border: 'none',
                      boxShadow: '0 2px 8px rgba(24, 144, 255, 0.08)',
                      transition: 'all 0.3s ease'
                    }}
                    bodyStyle={{ padding: 20 }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                      <Title level={4} style={{ margin: 0, flex: 1, fontSize: 18 }}>
                        {activity.title}
                      </Title>
                      <Tag color={getStatusColor(activity.status)}>
                        {getStatusText(activity.status)}
                      </Tag>
                    </div>
                    <Divider style={{ margin: '12px 0' }} />
                    <div style={{ marginBottom: 10, display: 'flex', alignItems: 'center' }}>
                      <CalendarOutlined style={{ marginRight: 10, color: '#1890ff' }} />
                      <Text type="secondary">{new Date(activity.start_time).toLocaleString('zh-CN')}</Text>
                    </div>
                    {activity.locations?.[0]?.location_name && (
                      <div style={{ marginBottom: 10, display: 'flex', alignItems: 'center' }}>
                        <EnvironmentOutlined style={{ marginRight: 10, color: '#52c41a' }} />
                        <Text type="secondary">{activity.locations[0].location_name}</Text>
                      </div>
                    )}
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <UserOutlined style={{ marginRight: 10, color: '#722ed1' }} />
                      <Text strong style={{ color: '#1890ff' }}>
                        {activity.current_participants} / {activity.volunteer_count}
                      </Text>
                      <Text type="secondary" style={{ marginLeft: 4 }}>人已报名</Text>
                    </div>
                  </Card>
                </Col>
              ))}
            </Row>
            <div style={{ marginTop: 40, textAlign: 'center' }}>
              <Pagination
                current={page}
                pageSize={pageSize}
                total={total}
                showSizeChanger
                showTotal={(total) => `共 ${total} 个活动`}
                onChange={(p, ps) => {
                  setPage(p)
                  setPageSize(ps)
                }}
              />
            </div>
          </>
        )}
      </Spin>
    </div>
  )
}

export default Activities
