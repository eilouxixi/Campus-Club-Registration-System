import request from '../utils/request'

export interface Activity {
  id: number
  title: string
  description?: string
  locations: { id: number; location_name: string }[]
  start_time: string
  end_time: string
  volunteer_count: number
  max_participants: number
  current_participants: number
  status: 'open' | 'upcoming' | 'ongoing' | 'ended'
  created_by: number
  created_at: string
  is_registered: boolean
  remaining_spots: number
}

export interface Registration {
  id: number
  user_id: number
  activity_id: number
  student_id: string
  class_name: string
  contact: string
  status: 'registered' | 'cancelled'
  registered_at: string
  cancelled_at?: string
}

export interface RegistrationDetail {
  registration_id: number
  user_id: number
  email: string
  student_id: string
  class_name: string
  contact: string
  registered_at: string
}

export interface RegisterData {
  student_id: string
  class_name: string
  contact: string
}

export interface LoginResponse {
  access_token: string
  token_type: string
  user_id: number
  email: string
  role: 'student' | 'admin'
}

export const authApi = {
  register: (data: { email: string; student_id: string; password: string }) =>
    request.post('/api/register', data),
  login: (data: FormData) =>
    request.post<LoginResponse>('/api/login', data),
}

export const activityApi = {
  getList: (params?: { page?: number; page_size?: number; status?: string }) =>
    request.get('/api/activities', { params }),
  getDetail: (id: number) =>
    request.get(`/api/activities/${id}`),
  create: (data: any) =>
    request.post('/api/activities', data),
  register: (activityId: number, data: RegisterData) =>
    request.post(`/api/activities/${activityId}/register`, data),
  cancelRegister: (activityId: number) =>
    request.delete(`/api/activities/${activityId}/register`),
  getMyActivities: () =>
    request.get('/api/my-activities'),
  getActivityRegistrations: (activityId: number) =>
    request.get(`/api/my-activities/${activityId}/registrations`),
}

export const registrationApi = {
  getMyRegistrations: () =>
    request.get('/api/my-registrations'),
}
