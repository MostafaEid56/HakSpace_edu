import axios from 'axios'

let API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080'

// Normalize URL to prevent double /api/api pathing
if (API_URL.endsWith('/')) {
  API_URL = API_URL.slice(0, -1)
}
if (API_URL.endsWith('/api')) {
  API_URL = API_URL.slice(0, -4)
}

export const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('hakspace_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config;
  },
  (error) => {
    return Promise.reject(error)
  }
)
