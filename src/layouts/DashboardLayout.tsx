import { useState } from 'react'
import { Layout, Menu, Button, Input, Badge, Avatar, Dropdown, Card } from 'antd'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import {
  CompassOutlined,
  ProjectOutlined,
  LogoutOutlined,
  BellOutlined,
  SearchOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  UserOutlined,
  SettingOutlined,
} from '@ant-design/icons'
import { useUserStore } from '../store/useUserStore'

const { Sider, Content, Header } = Layout

const DashboardLayout = () => {
  const [collapsed, setCollapsed] = useState(false)
  const [activeTab, setActiveTab] = useState('explore')
  const navigate = useNavigate()
  const location = useLocation()
  const user = useUserStore(state => state.user)
  const logout = useUserStore(state => state.logout)

  const menuItems = [
    {
      key: '/dashboard/explore',
      icon: <CompassOutlined style={{ fontSize: 22 }} />,
      label: '活动广场',
      description: '发现精彩校园活动',
    },
    {
      key: '/dashboard/manage',
      icon: <ProjectOutlined style={{ fontSize: 22 }} />,
      label: '我的发布',
      description: '管理我的社团活动',
    },
  ]

  const handleMenuClick = ({ key }: { key: string }) => {
    navigate(key)
    setActiveTab(key.includes('manage') ? 'manage' : 'explore')
  }

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const userMenuItems = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: '个人中心',
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: '设置',
    },
    {
      type: 'divider',
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: '退出登录',
      danger: true,
    },
  ]

  const getPageTitle = () => {
    if (location.pathname.includes('manage')) {
      return {
        title: '我的发布',
        subtitle: '管理您的社团活动',
        icon: '📋',
        color: '#10b981',
      }
    }
    return {
      title: '活动广场',
      subtitle: '探索校园精彩活动',
      icon: '🎯',
      color: '#3b82f6',
    }
  }

  const pageInfo = getPageTitle()

  return (
    <Layout style={{ minHeight: '100vh', background: '#f0f2f5' }}>
      {/* 侧边栏 */}
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={setCollapsed}
        width={260}
        collapsedWidth={80}
        style={{
          background: 'linear-gradient(180deg, #1e3a5f 0%, #0f2744 100%)',
          boxShadow: '4px 0 20px rgba(0,0,0,0.15)',
          position: 'fixed',
          left: 0,
          top: 0,
          bottom: 0,
          zIndex: 100,
          borderRight: '1px solid rgba(255,255,255,0.1)',
        }}
        trigger={null}
      >
        {/* Logo区域 */}
        <div style={{
          height: 88,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px 16px',
          borderBottom: '1px solid rgba(255,255,255,0.1)',
          background: 'linear-gradient(180deg, rgba(255,255,255,0.05) 0%, transparent 100%)',
          position: 'relative',
          overflow: 'hidden',
        }}>
          {/* 装饰圆圈 */}
          <div style={{
            position: 'absolute',
            top: -30,
            right: -30,
            width: 80,
            height: 80,
            background: 'rgba(59, 130, 246, 0.2)',
            borderRadius: '50%',
          }} />
          <div style={{
            position: 'absolute',
            bottom: -20,
            left: -20,
            width: 60,
            height: 60,
            background: 'rgba(139, 92, 246, 0.15)',
            borderRadius: '50%',
          }} />

          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            zIndex: 1,
          }}>
            <div style={{
              width: 52,
              height: 52,
              background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 50%, #d946ef 100%)',
              borderRadius: 14,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 8px 24px rgba(59, 130, 246, 0.5)',
              animation: 'pulse 3s ease-in-out infinite',
            }}>
              <span style={{ fontSize: 26 }}>🎓</span>
            </div>
            {!collapsed && (
              <div style={{ textAlign: 'left' }}>
                <div style={{
                  fontSize: 18,
                  fontWeight: 'bold',
                  color: '#fff',
                  marginBottom: 4,
                  letterSpacing: 2,
                }}>
                  福大至诚
                </div>
                <div style={{
                  fontSize: 11,
                  color: '#94a3b8',
                  letterSpacing: 1,
                  fontWeight: 500,
                }}>
                  计算机工程系
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 菜单区域 */}
        <div style={{ padding: '20px 12px' }}>
          <Menu
            theme="dark"
            mode="inline"
            selectedKeys={[location.pathname]}
            items={menuItems.map(item => ({
              ...item,
              style: {
                marginBottom: 12,
                borderRadius: 12,
                padding: '12px 16px',
                height: 72,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
              },
            }))}
            onClick={handleMenuClick}
            style={{
              background: 'transparent',
              borderRight: 'none',
            }}
          />
        </div>

        {/* 用户信息区域 */}
        {!collapsed && user && (
          <div style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            padding: '16px',
            borderTop: '1px solid rgba(255,255,255,0.1)',
            background: 'linear-gradient(0deg, rgba(255,255,255,0.05) 0%, transparent 100%)',
          }}>
            <Dropdown menu={{ items: userMenuItems, onClick: ({ key }) => key === 'logout' && handleLogout() }} placement="topRight">
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '12px',
                background: 'rgba(255,255,255,0.05)',
                borderRadius: 12,
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                ':hover': {
                  background: 'rgba(255,255,255,0.1)',
                },
              }}>
                <Avatar
                  size={44}
                  style={{
                    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                    boxShadow: '0 4px 12px rgba(16, 185, 129, 0.4)',
                    fontSize: 18,
                    fontWeight: 'bold',
                  }}
                >
                  {user.email?.charAt(0).toUpperCase()}
                </Avatar>
                <div style={{ flex: 1 }}>
                  <div style={{
                    fontSize: 14,
                    color: '#fff',
                    fontWeight: 600,
                    marginBottom: 2,
                  }}>
                    {user.email?.split('@')[0]}
                  </div>
                  <div style={{
                    fontSize: 11,
                    color: '#94a3b8',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4,
                  }}>
                    <span style={{
                      width: 8,
                      height: 8,
                      background: user.role === 'admin' ? '#f59e0b' : '#10b981',
                      borderRadius: '50%',
                      display: 'inline-block',
                    }} />
                    {user.role === 'admin' ? '社团管理员' : '学生用户'}
                  </div>
                </div>
              </div>
            </Dropdown>
          </div>
        )}

        {/* 折叠按钮 */}
        <Button
          type="text"
          icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
          onClick={() => setCollapsed(!collapsed)}
          style={{
            position: 'absolute',
            bottom: collapsed ? 20 : user ? 120 : 20,
            left: '50%',
            transform: 'translateX(-50%)',
            color: '#fff',
            fontSize: 18,
            width: 44,
            height: 44,
            borderRadius: 10,
            background: 'rgba(255,255,255,0.1)',
            border: '1px solid rgba(255,255,255,0.1)',
            transition: 'all 0.3s ease',
          }}
        />
      </Sider>

      {/* 主内容区域 */}
      <Layout style={{
        marginLeft: collapsed ? 80 : 260,
        transition: 'all 0.3s ease',
        background: '#f0f2f5',
      }}>
        {/* 顶部导航栏 */}
        <Header style={{
          background: '#fff',
          padding: '0 32px',
          boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
          position: 'sticky',
          top: 0,
          zIndex: 50,
          borderBottom: '1px solid rgba(0,0,0,0.06)',
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            height: '100%',
          }}>
            {/* 左侧标题 */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={{
                width: 56,
                height: 56,
                background: `linear-gradient(135deg, ${pageInfo.color} 0%, ${pageInfo.color}99 100%)`,
                borderRadius: 14,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: `0 4px 16px ${pageInfo.color}33`,
              }}>
                <span style={{ fontSize: 28 }}>{pageInfo.icon}</span>
              </div>
              <div>
                <h1 style={{
                  fontSize: 24,
                  fontWeight: 700,
                  color: '#1e293b',
                  margin: 0,
                  lineHeight: 1.2,
                }}>
                  {pageInfo.title}
                </h1>
                <p style={{
                  fontSize: 13,
                  color: '#64748b',
                  margin: '4px 0 0',
                }}>
                  {pageInfo.subtitle}
                </p>
              </div>
            </div>

            {/* 中间搜索框 */}
            <div style={{ flex: 1, maxWidth: 500, margin: '0 48px' }}>
              <Input
                prefix={<SearchOutlined style={{ color: '#94a3b8' }} />}
                placeholder="搜索活动..."
                style={{
                  borderRadius: 12,
                  height: 44,
                  background: '#f7f8fa',
                  border: '1px solid transparent',
                }}
              />
            </div>

            {/* 右侧操作 */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
              <Badge count={3} size="small">
                <Button
                  type="text"
                  icon={<BellOutlined style={{ fontSize: 22, color: '#64748b' }} />}
                  style={{ width: 44, height: 44 }}
                />
              </Badge>
              <div style={{
                width: 48,
                height: 48,
                background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
                borderRadius: 12,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                fontWeight: 'bold',
                fontSize: 18,
                boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)',
              }}>
                🎓
              </div>
            </div>
          </div>
        </Header>

        {/* 内容区域 */}
        <Content style={{
          padding: '32px',
          minHeight: 'calc(100vh - 88px)',
        }}>
          <Outlet />
        </Content>
      </Layout>

      <style>{`
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
      `}</style>
    </Layout>
  )
}

export default DashboardLayout
