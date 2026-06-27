import { Navigate, useLocation, Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { LayoutDashboard, Users, LogOut, BookOpen } from 'lucide-react'
import logoImg from '../assets/Logo.jpg'

interface AdminLayoutProps {
  children: React.ReactNode
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const { user, logout } = useAuthStore()
  const location = useLocation()
  const navigate = useNavigate()

  // Route Guard: only ADMIN is allowed
  if (!user || user.role !== 'ADMIN') {
    return <Navigate to="/login" replace />
  }

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const navItems = [
    { label: 'Overview', path: '/admin/dashboard', icon: LayoutDashboard },
    { label: 'Courses Management', path: '/admin/courses', icon: BookOpen },
    { label: 'Leads Management', path: '/admin/leads', icon: Users },
  ]

  return (
    <div className="min-h-screen bg-black text-white flex">
      {/* Sidebar */}
      <aside className="w-64 bg-zinc-950 border-r border-zinc-900 flex flex-col justify-between flex-shrink-0">
        <div>
          {/* Logo / Header */}
          <div className="h-20 flex items-center gap-2.5 px-6 border-b border-zinc-900">
            <img src={logoImg} alt="HakSpace" className="h-10 w-auto object-contain rounded-lg" />
            <div>
              <span className="block text-[10px] text-zinc-500 font-bold uppercase tracking-widest mt-0.5">Admin Hub</span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-1.5">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = location.pathname === item.path
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${
                    isActive
                      ? 'bg-brand-600 text-white shadow-lg shadow-brand-900/30'
                      : 'text-zinc-400 hover:bg-zinc-900 hover:text-white'
                  }`}
                >
                  <Icon size={18} />
                  {item.label}
                </Link>
              )
            })}
          </nav>
        </div>

        {/* Footer info & Logout */}
        <div className="p-4 border-t border-zinc-900 space-y-4">
          <div className="flex items-center gap-3 px-2">
            <div className="w-9 h-9 rounded-full bg-zinc-900 flex items-center justify-center font-bold text-brand-500 border border-zinc-800">
              A
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold truncate text-white">{user.email}</p>
              <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Administrator</p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-zinc-900/50 hover:bg-red-950/20 hover:text-red-400 border border-zinc-900 hover:border-red-900/30 text-zinc-400 rounded-xl text-sm font-semibold transition"
          >
            <LogOut size={16} />
            Log Out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto p-8 md:p-12">
        <div className="max-w-6xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  )
}
