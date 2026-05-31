import { Modal, Form, Input, Button, Space } from 'antd'
import { activityApi } from '../api'

interface RegisterModalProps {
  open: boolean
  activityId: number
  activityTitle: string
  onClose: () => void
  onSuccess: () => void
}

interface RegisterForm {
  student_id: string
  name: string
  contact: string
}

const RegisterModal = ({ open, activityId, activityTitle, onClose, onSuccess }: RegisterModalProps) => {
  const [form] = Form.useForm()

  const handleSubmit = async (values: RegisterForm) => {
    try {
      await activityApi.register(activityId, values)
      form.resetFields()
      onSuccess()
    } catch (err: any) {
      const detail = err.response?.data?.detail
      if (detail === '志愿者名额已满') {
        form.resetFields()
        onClose()
        import('antd').then(({ message }) => {
          message.error('手慢啦，名额已被抢完')
        })
      }
      throw err
    }
  }

  const handleCancel = () => {
    form.resetFields()
    onClose()
  }

  return (
    <Modal
      title={`报名参加 ${activityTitle}`}
      open={open}
      onCancel={handleCancel}
      footer={null}
      width={500}
      destroyOnClose
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
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
          name="name"
          label="姓名"
          rules={[{ required: true, message: '请输入姓名' }]}
        >
          <Input placeholder="请输入你的姓名" style={{ borderRadius: 12 }} />
        </Form.Item>
        <Form.Item
          name="contact"
          label="联系电话"
          rules={[{ required: true, message: '请输入联系电话' }]}
        >
          <Input placeholder="手机号" style={{ borderRadius: 12 }} />
        </Form.Item>
        <Form.Item style={{ marginTop: 32 }}>
          <Space style={{ width: '100%', justifyContent: 'center' }}>
            <Button
              type="primary"
              htmlType="submit"
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
              onClick={handleCancel}
              style={{ height: 48, paddingInline: 48, fontSize: 16, borderRadius: 12 }}
            >
              取消
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </Modal>
  )
}

export default RegisterModal
