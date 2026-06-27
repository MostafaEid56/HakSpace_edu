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
    // Auth token
    const token = localStorage.getItem('hakspace_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    // Send current UI language so Spring Boot resolves the right message bundle
    const lang = localStorage.getItem('hakspace_lang') || 'ar'
    config.headers['Accept-Language'] = lang
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)
