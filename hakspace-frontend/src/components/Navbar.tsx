import { Link, useNavigate } from 'react-router-dom'
import { ArrowUpRight } from 'lucide-react'
import { useAuthStore } from '../store/authStore'
import logoImg from '../assets/Logo.jpg'

export default function Navbar() {
  const navigate = useNavigate()
  const { user, logout } = useAuthStore()

  return (
    <header className="fixed top-0 inset-x-0 h-20 bg-black/70 backdrop-blur-md border-b border-zinc-900 z-50">
      <div className="max-w-7xl mx-auto h-full px-6 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5">
          <img
            src={logoImg}
            alt="HakSpace Logo"
            className="h-10 w-auto object-contain rounded-lg"
          />
        </Link>

        {/* Navigation */}
        <nav className="flex items-center gap-6">
          <Link
            to="/courses"
            className="text-sm font-semibold text-zinc-400 hover:text-white transition"
          >
            Courses
          </Link>

          {user ? (
            <>
              {user.role === 'ADMIN' && (
                <Link
                  to="/admin/dashboard"
                  className="text-sm font-semibold text-brand-400 hover:text-brand-300 transition flex items-center gap-1"
                >
                  Admin Panel <ArrowUpRight size={14} />
                </Link>
              )}
              <button
                onClick={() => {
                  logout()
                  navigate('/')
                }}
                className="px-4 py-2 border border-zinc-800 hover:border-zinc-700 hover:bg-zinc-900/50 rounded-xl text-sm font-semibold transition"
              >
                Log Out
              </button>
            </>
          ) : (
            <Link
              to="/login"
              className="px-5 py-2.5 bg-brand-600 hover:bg-brand-500 text-white rounded-xl text-sm font-semibold transition shadow-lg shadow-brand-900/20"
            >
              Log In
            </Link>
          )}
        </nav>
      </div>
    </header>
  )
}
