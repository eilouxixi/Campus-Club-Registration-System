import { useState } from 'react'
import { Layout, Menu, theme, Button, Popconfirm, message, Typography, Tag } from 'antd'
import { Outlet, useNavigate, useLocation, Navigate } from 'react-router-dom'
import {
  DashboardOutlined,
  HomeOutlined,
  FormOutlined,
  SettingOutlined,
  LogoutOutlined,
  CodeOutlined,
} from '@ant-design/icons'
import { useUserStore } from '../store/useUserStore'

const { Header, Sider, Content } = Layout
const { Title } = Typography

const MainLayout = () => {
  const [collapsed, setCollapsed] = useState(false)
  const {
    token: { colorBgContainer },
  } = theme.useToken()
  const navigate = useNavigate()
  const location = useLocation()
  const user = useUserStore(state => state.user)
  const logout = useUserStore(state => state.logout)

  const menuItems = [
    {
      key: '/dashboard',
      icon: <DashboardOutlined />,
      label: '首页',
    },
    {
      key: '/activities',
      icon: <HomeOutlined />,
      label: '活动列表',
    },
    {
      key: '/my-registrations',
      icon: <FormOutlined />,
      label: '我的报名',
    },
    {
      key: '/admin',
      icon: <SettingOutlined />,
      label: '社团管理后台',
    },
  ]

  const handleMenuClick = ({ key }: { key: string }) => {
    navigate(key)
  }

  const handleLogout = () => {
    localStorage.removeItem('access_token')
    logout()
    message.success('已退出登录')
    navigate('/login')
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={setCollapsed}
        style={{
          background: 'linear-gradient(180deg, #001529 0%, #002766 100%)'
        }}
      >
        <div style={{
          height: 72,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          padding: '12px 0',
          borderBottom: '1px solid rgba(255,255,255,0.1)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <CodeOutlined style={{ fontSize: 28, color: '#69c0ff' }} />
            {!collapsed && (
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontSize: 14, fontWeight: 'bold', color: '#fff' }}>福大至诚</div>
                <div style={{ fontSize: 11, color: '#91d5ff' }}>计算机工程系</div>
              </div>
            )}
          </div>
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
          onClick={handleMenuClick}
          style={{
            background: 'transparent',
            borderRight: 'none'
          }}
        />
      </Sider>
      <Layout>
        <Header style={{
          padding: 0,
          background: '#fff',
          paddingLeft: 24,
          paddingRight: 24,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
          zIndex: 10
        }}>
          <Title level={4} style={{ margin: 0, color: '#001529' }}>
            社团活动报名系统
          </Title>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <span style={{ color: '#666' }}>
              欢迎您，<strong style={{ color: '#1890ff' }}>{user.email}</strong>
              &nbsp;
              <Tag color={user.role === 'admin' ? 'red' : 'blue'}>
                {user.role === 'admin' ? '社团管理员' : '计算机系学生'}
              </Tag>
            </span>
            <Popconfirm
              title="确定要退出登录吗？"
              onConfirm={handleLogout}
              okText="确定"
              cancelText="取消"
            >
              <Button type="text" icon={<LogoutOutlined />} style={{ color: '#666' }}>
                退出登录
              </Button>
            </Popconfirm>
          </div>
        </Header>
        <Content style={{
          margin: '24px 16px',
          padding: 24,
          minHeight: 280,
          background: colorBgContainer,
          borderRadius: 12,
          boxShadow: '0 2px 12px rgba(0,0,0,0.04)'
        }}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  )
}

export default MainLayout
