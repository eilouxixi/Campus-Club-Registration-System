import { Form, Input, Button, Card, Typography, message, Divider } from 'antd'
import { MailOutlined, LockOutlined, CodeOutlined, IdcardOutlined } from '@ant-design/icons'
import { useNavigate, Link } from 'react-router-dom'
import { useState } from 'react'
import { authApi } from '../api'

const { Title, Text } = Typography

const Register = () => {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)

  const onFinish = async (values: { email: string; student_id: string; password: string }) => {
    setLoading(true)
    try {
      await authApi.register(values)
      message.success('注册成功，请登录')
      navigate('/login')
    } catch (err: any) {
      const errorDetail = err.response?.data?.detail
      if (Array.isArray(errorDetail)) {
        message.error(errorDetail[0]?.msg || '注册失败')
      } else {
        message.error(errorDetail || '注册失败')
      }
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
      background: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
      position: 'relative',
      overflow: 'hidden'
    }}>
      <div style={{
        position: 'absolute',
        top: -80,
        right: -80,
        width: 280,
        height: 280,
        background: 'rgba(255, 255, 255, 0.1)',
        borderRadius: '50%',
      }} />
      <div style={{
        position: 'absolute',
        bottom: -120,
        left: -120,
        width: 380,
        height: 380,
        background: 'rgba(255, 255, 255, 0.08)',
        borderRadius: '50%',
      }} />
      <div style={{
        position: 'absolute',
        top: '15%',
        left: '8%',
        width: 60,
        height: 60,
        background: 'rgba(255, 255, 255, 0.06)',
        borderRadius: '50%',
      }} />
      <div style={{
        position: 'absolute',
        bottom: '25%',
        right: '12%',
        width: 100,
        height: 100,
        background: 'rgba(255, 255, 255, 0.07)',
        borderRadius: '50%',
      }} />
      <Card style={{
        width: 480,
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
        borderRadius: 20,
        zIndex: 10,
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(10px)',
      }}>
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 16,
            gap: 12
          }}>
            <CodeOutlined style={{ fontSize: 48, color: '#11998e' }} />
          </div>
          <Title level={2} style={{ marginBottom: 8, color: '#333', fontWeight: 700 }}>
            新用户注册
          </Title>
          <Title level={5} style={{ marginBottom: 8, color: '#11998e', fontWeight: 500 }}>
            福州大学至诚学院 计算机工程系
          </Title>
          <Text type="secondary" style={{ fontSize: 14 }}>Join Us，开启社团之旅</Text>
          <Divider />
        </div>
        <Form
          name="register"
          onFinish={onFinish}
          autoComplete="off"
          size="large"
        >
          <Form.Item
            name="email"
            rules={[
              { required: true, message: '请输入邮箱!' },
              { type: 'email', message: '请输入有效的邮箱格式!' },
              {
                validator: (_, value) => {
                  if (!value || value.endsWith('@qq.com')) {
                    return Promise.resolve()
                  }
                  return Promise.reject('邮箱必须以 @qq.com 结尾')
                }
              }
            ]}
          >
            <Input
              prefix={<MailOutlined style={{ color: '#11998e' }} />}
              placeholder="邮箱（必须以 @qq.com 结尾）"
              style={{ borderRadius: 12, height: 48 }}
            />
          </Form.Item>
          <Form.Item
            name="student_id"
            rules={[
              { required: true, message: '请输入学号!' },
              {
                pattern: /^(212506|212406|212306|212206|212106)\d{3}$/,
                message: '学号必须是9位数字且以212506、212406、212306、212206或212106开头'
              }
            ]}
          >
            <Input
              prefix={<IdcardOutlined style={{ color: '#11998e' }} />}
              placeholder="学号（如：212406001）"
              maxLength={9}
              style={{ borderRadius: 12, height: 48 }}
            />
          </Form.Item>
          <Form.Item
            name="password"
            rules={[
              { required: true, message: '请输入密码!' },
              { min: 6, message: '密码至少6位!' }
            ]}
          >
            <Input.Password
              prefix={<LockOutlined style={{ color: '#11998e' }} />}
              placeholder="密码（至少6位）"
              style={{ borderRadius: 12, height: 48 }}
            />
          </Form.Item>
          <Form.Item
            name="confirmPassword"
            dependencies={['password']}
            rules={[
              { required: true, message: '请确认密码!' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('password') === value) {
                    return Promise.resolve()
                  }
                  return Promise.reject(new Error('两次输入的密码不一致!'))
                },
              }),
            ]}
          >
            <Input.Password
              prefix={<LockOutlined style={{ color: '#11998e' }} />}
              placeholder="确认密码"
              style={{ borderRadius: 12, height: 48 }}
            />
          </Form.Item>
          <Form.Item style={{ marginTop: 28 }}>
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
                background: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
                border: 'none',
                boxShadow: '0 4px 15px rgba(17, 153, 142, 0.4)',
              }}
            >
              注 册
            </Button>
          </Form.Item>
          <div style={{ textAlign: 'center', marginTop: 16 }}>
            <Text type="secondary">已有账号？</Text>
            <Link to="/login" style={{ color: '#11998e', fontWeight: 600, marginLeft: 8 }}>
              立即登录
            </Link>
          </div>
        </Form>
      </Card>
    </div>
  )
}

export default Register
