import { Typography, Tabs, Card, Table, Button, Space } from 'antd'

const { Title } = Typography

const Admin = () => {
  const columns = [
    {
      title: '学生姓名',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '学号',
      dataIndex: 'studentId',
      key: 'studentId',
    },
    {
      title: '报名时间',
      dataIndex: 'time',
      key: 'time',
    },
  ]

  const data = [
    {
      key: '1',
      name: '张三',
      studentId: '2023001',
      time: '2026-05-01 10:00',
    },
    {
      key: '2',
      name: '李四',
      studentId: '2023002',
      time: '2026-05-01 11:00',
    },
  ]

  const items = [
    {
      key: '1',
      label: '发布活动',
      children: (
        <Card title="发布新活动">
          <div>发布活动表单占位区域...</div>
          <Button type="primary" style={{ marginTop: 16 }}>发布活动</Button>
        </Card>
      ),
    },
    {
      key: '2',
      label: '查看报名名单',
      children: (
        <div>
          <div style={{ marginBottom: 16 }}>
            <Space>
              <Button>导出名单</Button>
            </Space>
          </div>
          <Table columns={columns} dataSource={data} />
        </div>
      ),
    },
  ]

  return (
    <div>
      <Title level={2}>社团管理后台</Title>
      <Tabs items={items} />
    </div>
  )
}

export default Admin
