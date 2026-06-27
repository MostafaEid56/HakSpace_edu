import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { apiClient } from '../../api/client'
import { useAuthStore } from '../../store/authStore'
import { toast } from 'react-toastify'
import Navbar from '../../components/Navbar'
import logoImg from '../../assets/Logo.jpg'

export default function LoginPage() {
  const navigate = useNavigate()
  const loginStore = useAuthStore((state) => state.login)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password) {
      toast.error('Please enter email and password')
      return
    }

    setLoading(true)
    try {
      const response = await apiClient.post('/api/auth/login', { email, password })
      const { token, user } = response.data
      
      // Save credentials in Zustand + LocalStorage
      loginStore(token, {
        id: user.id,
        role: user.role,
        email: email, // Set email manually since backend doesn't return it in the inner user object
      })

      toast.success('Logged in successfully!')
      
      // Redirect based on role
      if (user.role === 'ADMIN') {
        navigate('/admin/dashboard')
      } else {
        navigate('/')
      }
    } catch (err: any) {
      console.error(err)
      toast.error(err.response?.data?.message || 'Invalid email or password')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-black px-4">
      <Navbar />
      <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-2xl p-8 shadow-2xl transition hover:border-zinc-700">
        <div className="text-center mb-8">
          <img src={logoImg} alt="HakSpace" className="h-14 w-auto object-contain rounded-xl mx-auto mb-4" />
          <h2 className="text-3xl font-extrabold text-white tracking-tight">Welcome Back</h2>
          <p className="text-zinc-400 mt-2">Sign in to manage your HakSpace learning</p>
        </div>
        <form className="space-y-5" onSubmit={handleSubmit}>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-2">Email Address</label>
            <input 
              type="email"
              className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition"
              placeholder="admin@hakspace.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
            />
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-2">Password</label>
            <input 
              type="password" 
              className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition" 
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
            />
          </div>
          <button 
            type="submit" 
            className="w-full bg-brand-600 hover:bg-brand-500 active:scale-95 text-white py-3.5 rounded-xl font-bold transition shadow-lg shadow-brand-900/30 flex justify-center items-center gap-2"
            disabled={loading}
          >
            {loading ? (
              <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            ) : (
              'Log In'
            )}
          </button>
        </form>
      </div>
    </div>
  )
}