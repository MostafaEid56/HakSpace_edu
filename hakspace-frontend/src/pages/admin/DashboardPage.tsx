import { useQuery } from '@tanstack/react-query'
import { apiClient } from '../../api/client'
import { DollarSign, Users, Award, TrendingUp } from 'lucide-react'
import { useTranslation } from 'react-i18next'

interface DashboardStats {
  totalRevenue: number
  activeStudents: number
  courseCompletions: number
}

const fetchStats = async (): Promise<DashboardStats> => {
  const response = await apiClient.get('/api/admin/dashboard')
  return response.data
}

export default function DashboardPage() {
  const { t } = useTranslation()
  const { data: stats, isLoading, error } = useQuery<DashboardStats>({
    queryKey: ['dashboardStats'],
    queryFn: fetchStats,
  })

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">{t('dashboard.title')}</h1>
        <p className="text-zinc-500 text-sm mt-1">{t('dashboard.subtitle')}</p>
      </div>

      {isLoading && (
        <div className="grid md:grid-cols-3 gap-6 animate-pulse">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 h-36"></div>
          ))}
        </div>
      )}

      {error && (
        <div className="bg-red-950/20 border border-red-900/50 rounded-2xl p-8 text-center max-w-lg">
          <h3 className="text-lg font-bold text-red-400">{t('dashboard.error_title')}</h3>
          <p className="text-zinc-400 text-sm mt-1">{t('dashboard.error_desc')}</p>
        </div>
      )}

      {stats && (
        <>
          <div className="grid md:grid-cols-3 gap-6">
            {/* Revenue Card */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 relative overflow-hidden transition hover:border-zinc-700">
              <div className="absolute top-6 right-6 w-12 h-12 bg-emerald-500/10 text-emerald-500 rounded-xl flex items-center justify-center">
                <DollarSign size={24} />
              </div>
              <p className="text-zinc-400 text-sm font-semibold uppercase tracking-wider">{t('dashboard.total_revenue')}</p>
              <h2 className="text-3xl font-black mt-2 text-white">${stats.totalRevenue.toLocaleString()}</h2>
              <div className="mt-4 flex items-center gap-1.5 text-xs text-emerald-500 font-semibold">
                <TrendingUp size={14} /> {t('dashboard.revenue_growth')}
              </div>
            </div>

            {/* Students Card */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 relative overflow-hidden transition hover:border-zinc-700">
              <div className="absolute top-6 right-6 w-12 h-12 bg-brand-500/10 text-brand-500 rounded-xl flex items-center justify-center">
                <Users size={24} />
              </div>
              <p className="text-zinc-400 text-sm font-semibold uppercase tracking-wider">{t('dashboard.active_students')}</p>
              <h2 className="text-3xl font-black mt-2 text-white">{stats.activeStudents.toLocaleString()}</h2>
              <div className="mt-4 flex items-center gap-1.5 text-xs text-brand-500 font-semibold">
                <TrendingUp size={14} /> {t('dashboard.students_growth')}
              </div>
            </div>

            {/* Completions Card */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 relative overflow-hidden transition hover:border-zinc-700">
              <div className="absolute top-6 right-6 w-12 h-12 bg-blue-500/10 text-blue-400 rounded-xl flex items-center justify-center">
                <Award size={24} />
              </div>
              <p className="text-zinc-400 text-sm font-semibold uppercase tracking-wider">{t('dashboard.course_completions')}</p>
              <h2 className="text-3xl font-black mt-2 text-white">{stats.courseCompletions.toLocaleString()}</h2>
              <div className="mt-4 flex items-center gap-1.5 text-xs text-blue-400 font-semibold">
                <TrendingUp size={14} /> {t('dashboard.completions_growth')}
              </div>
            </div>
          </div>

          {/* Quick Stats Summary or info panel */}
          <div className="bg-zinc-900/50 border border-zinc-850 rounded-2xl p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-1">
              <h3 className="text-lg font-bold">{t('dashboard.system_status')}</h3>
              <p className="text-zinc-400 text-sm leading-relaxed">
                {t('dashboard.system_status_desc')}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 bg-green-500 rounded-full animate-ping"></span>
              <span className="text-xs font-bold uppercase tracking-wider text-green-400">{t('dashboard.connected')}</span>
            </div>
          </div>
        </>
      )}
    </div>
  )
}