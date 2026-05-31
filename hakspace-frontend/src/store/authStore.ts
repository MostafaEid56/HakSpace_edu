import { create } from 'zustand'

interface User {
  id: number
  role: 'USER' | 'ADMIN'
  email: string
}

interface AuthState {
  token: string | null
  user: User | null
  login: (token: string, user: User) => void
  logout: () => void
  isAuthenticated: () => boolean
}

export const useAuthStore = create<AuthState>((set, get) => ({
  token: localStorage.getItem('hakspace_token'),
  user: localStorage.getItem('hakspace_user') 
    ? JSON.parse(localStorage.getItem('hakspace_user')!) 
    : null,
  login: (token, user) => {
    localStorage.setItem('hakspace_token', token)
    localStorage.setItem('hakspace_user', JSON.stringify(user))
    set({ token, user })
  },
  logout: () => {
    localStorage.removeItem('hakspace_token')
    localStorage.removeItem('hakspace_user')
    set({ token: null, user: null })
  },
  isAuthenticated: () => !!get().token,
}))
