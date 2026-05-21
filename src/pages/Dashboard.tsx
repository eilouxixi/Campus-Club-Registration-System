import { Card, Typography, Row, Col, Statistic } from 'antd'
import { UserOutlined, CalendarOutlined, TeamOutlined } from '@ant-design/icons'
import { useUserStore } from '../store/useUserStore'

const { Title, Text } = Typography

const Dashboard = () => {
  const user = useUserStore(state => state.user)

  return (
    <div style={{ padding: '24px' }}>
      <Title level={2}>欢迎回来！</Title>
      <Text type="secondary" style={{ fontSize: 16 }}>福州大学至诚学院 计算机工程系 社团活动报名系统</Text>

      <Row gutter={[24, 24]} style={{ marginTop: 32 }}>
        <Col xs={24} sm={12} md={8}>
          <Card bordered={false}>
            <Statistic
              title="当前用户"
              value={user?.email || '-'}
              prefix={<UserOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8}>
          <Card bordered={false}>
            <Statistic
              title="用户角色"
              value={user?.role === 'admin' ? '社团管理员' : '学生'}
              prefix={<TeamOutlined />}
              valueStyle={{ color: user?.role === 'admin' ? '#f5222d' : '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8}>
          <Card bordered={false}>
            <Statistic
              title="用户ID"
              value={user?.user_id || '-'}
              prefix={<CalendarOutlined />}
            />
          </Card>
        </Col>
      </Row>

      <Card bordered={false} style={{ marginTop: 24 }}>
        <Title level={4}>系统公告</Title>
        <Text>欢迎使用福州大学至诚学院计算机工程系社团活动报名系统！</Text>
        <div style={{ marginTop: 16 }}>
          <ul style={{ lineHeight: 2 }}>
            <li>学生可以浏览和报名参加社团活动</li>
            <li>社团管理员可以发布和管理活动</li>
            <li>请使用 @qq.com 邮箱注册</li>
          </ul>
        </div>
      </Card>
    </div>
  )
}

export default Dashboard
