import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface User {
  user_id: number
  email: string
  role: 'student' | 'admin'
}

interface UserState {
  user: User | null
  accessToken: string | null
  setUser: (user: User, token: string) => void
  logout: () => void
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      setUser: (user, token) => set({ user, accessToken: token }),
      logout: () => set({ user: null, accessToken: null }),
    }),
    {
      name: 'user-storage',
    }
  )
)
