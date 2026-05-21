import { Form, Input, Button, Card, Typography, message, Divider } from 'antd'
import { MailOutlined, LockOutlined, CodeOutlined } from '@ant-design/icons'
import { useNavigate, Link } from 'react-router-dom'
import { useState } from 'react'
import { authApi, LoginResponse } from '../api'
import { useUserStore } from '../store/useUserStore'

const { Title, Text } = Typography

const Login = () => {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const setUser = useUserStore(state => state.setUser)

  const onFinish = async (values: { email: string; password: string }) => {
    setLoading(true)
    try {
      const formData = new FormData()
      formData.append('username', values.email)
      formData.append('password', values.password)
      const response = await authApi.login(formData)
      const data = response as unknown as LoginResponse
      localStorage.setItem('access_token', data.access_token)
      setUser({
        user_id: data.user_id,
        email: data.email,
        role: data.role
      }, data.access_token)
      message.success('登录成功')
      navigate('/dashboard')
    } catch (err: any) {
      message.error(err.response?.data?.detail || '登录失败')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      position: 'relative',
      overflow: 'hidden'
    }}>
      <div style={{
        position: 'absolute',
        top: -100,
        left: -100,
        width: 300,
        height: 300,
        background: 'rgba(255, 255, 255, 0.1)',
        borderRadius: '50%',
      }} />
      <div style={{
        position: 'absolute',
        bottom: -150,
        right: -150,
        width: 400,
        height: 400,
        background: 'rgba(255, 255, 255, 0.08)',
        borderRadius: '50%',
      }} />
      <div style={{
        position: 'absolute',
        top: '20%',
        right: '10%',
        width: 80,
        height: 80,
        background: 'rgba(255, 255, 255, 0.05)',
        borderRadius: '50%',
      }} />
      <div style={{
        position: 'absolute',
        bottom: '30%',
        left: '5%',
        width: 120,
        height: 120,
        background: 'rgba(255, 255, 255, 0.06)',
        borderRadius: '50%',
      }} />
      <Card style={{
        width: 420,
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
        borderRadius: 20,
        zIndex: 10,
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(10px)',
      }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 16,
            gap: 12
          }}>
            <CodeOutlined style={{ fontSize: 48, color: '#667eea' }} />
          </div>
          <Title level={2} style={{ marginBottom: 8, color: '#333', fontWeight: 700 }}>
            福州大学至诚学院
          </Title>
          <Title level={4} style={{ marginBottom: 8, color: '#667eea', fontWeight: 600 }}>
            计算机工程系
          </Title>
          <Text type="secondary" style={{ fontSize: 14 }}>社团活动，从这里开始</Text>
          <Divider />
        </div>
        <Form
          name="login"
          onFinish={onFinish}
          autoComplete="off"
          size="large"
        >
          <Form.Item
            name="email"
            rules={[
              { required: true, message: '请输入邮箱!' },
              { type: 'email', message: '请输入有效的邮箱格式!' }
            ]}
          >
            <Input
              prefix={<MailOutlined style={{ color: '#667eea' }} />}
              placeholder="邮箱"
              style={{ borderRadius: 12, height: 48 }}
            />
          </Form.Item>
          <Form.Item
            name="password"
            rules={[{ required: true, message: '请输入密码!' }]}
          >
            <Input.Password
              prefix={<LockOutlined style={{ color: '#667eea' }} />}
              placeholder="密码"
              style={{ borderRadius: 12, height: 48 }}
            />
          </Form.Item>
          <Form.Item style={{ marginTop: 32 }}>
            <Button
              type="primary"
              htmlType="submit"
              block
              size="large"
              loading={loading}
              style={{
                height: 52,
                fontSize: 18,
                fontWeight: 600,
                borderRadius: 12,
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                border: 'none',
                boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)',
              }}
            >
              登 录
            </Button>
          </Form.Item>
          <div style={{ textAlign: 'center', marginTop: 16 }}>
            <Text type="secondary">还没有账号？</Text>
            <Link to="/register" style={{ color: '#667eea', fontWeight: 600, marginLeft: 8 }}>
              立即注册
            </Link>
          </div>
        </Form>
      </Card>
    </div>
  )
}

export default Login
