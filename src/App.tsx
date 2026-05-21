import { Routes, Route } from 'react-router-dom'
import { ConfigProvider } from 'antd'
import zhCN from 'antd/locale/zh_CN'
import MainLayout from './layouts/MainLayout'
import DashboardLayout from './layouts/DashboardLayout'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Activities from './pages/Activities'
import ActivityDetail from './pages/ActivityDetail'
import MyRegistrations from './pages/MyRegistrations'
import Admin from './pages/Admin'
import ExplorePage from './pages/ExplorePage'
import ManagePage from './pages/ManagePage'

function App() {
  return (
    <ConfigProvider
      locale={zhCN}
      theme={{
        token: {
          colorPrimary: '#3B82F6',
          borderRadius: 8,
          colorBgContainer: '#ffffff',
          colorBgLayout: '#f0f2f5',
          colorText: '#333',
          colorTextHeading: '#333',
          fontWeightStrong: 700,
        },
        components: {
          Button: {
            controlHeight: 40,
          },
          Card: {
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
          },
        },
      }}
    >
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route element={<DashboardLayout />}>
          <Route path="/dashboard" element={<ExplorePage />} />
          <Route path="/dashboard/explore" element={<ExplorePage />} />
          <Route path="/dashboard/manage" element={<ManagePage />} />
        </Route>
        <Route element={<MainLayout />}>
          <Route path="/activities" element={<Activities />} />
          <Route path="/activities/:id" element={<ActivityDetail />} />
          <Route path="/my-registrations" element={<MyRegistrations />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/" element={<Dashboard />} />
        </Route>
      </Routes>
    </ConfigProvider>
  )
}

export default App
