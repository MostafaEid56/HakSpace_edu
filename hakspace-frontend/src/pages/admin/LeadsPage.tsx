import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '../../api/client'
import { toast } from 'react-toastify'
import { Mail, Phone, MapPin, Calendar, MessageCircle, FileText, CheckCircle2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'

interface Course {
  id: number
  title: string
}

interface CourseGroup {
  id: number
  groupName: string
  schedule: string
}

interface Enrollment {
  id: number
  fullName: string
  phone: string
  email: string
  city: string
  contactMethod: string
  contactTime: string
  notes: string
  status: 'NEW' | 'CONTACTED' | 'ENROLLED' | 'CLOSED'
  course: Course
  group?: CourseGroup
  createdAt: string
}

const fetchLeads = async (): Promise<Enrollment[]> => {
  const response = await apiClient.get('/api/admin/leads')
  return response.data
}

const updateLeadStatus = async ({ id, status }: { id: number; status: string }) => {
  const response = await apiClient.put(`/api/admin/leads/${id}/status`, { status })
  return response.data
}

export default function LeadsPage() {
  const queryClient = useQueryClient()
  const { t } = useTranslation()
  const [activeTab, setActiveTab] = useState<'ALL' | 'NEW' | 'CONTACTED' | 'ENROLLED' | 'CLOSED'>('ALL')

  const { data: leads, isLoading, error } = useQuery<Enrollment[]>({
    queryKey: ['leads'],
    queryFn: fetchLeads,
  })

  const mutation = useMutation({
    mutationFn: updateLeadStatus,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] })
      toast.success(t('leads.update_success'))
    },
    onError: (err: any) => {
      console.error(err)
      toast.error(t('leads.update_error'))
    }
  })

  const handleStatusChange = (id: number, status: string) => {
    mutation.mutate({ id, status })
  }

  const filteredLeads = leads
    ? activeTab === 'ALL'
      ? leads
      : leads.filter(l => l.status === activeTab)
    : []

  const statusColors = {
    NEW: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    CONTACTED: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
    ENROLLED: 'bg-green-500/10 text-green-400 border-green-500/20',
    CLOSED: 'bg-zinc-800 text-zinc-400 border-zinc-700',
  }

  const tabLabels: Record<string, string> = {
    ALL: t('leads.tab_all'),
    NEW: t('leads.tab_new'),
    CONTACTED: t('leads.tab_contacted'),
    ENROLLED: t('leads.tab_enrolled'),
    CLOSED: t('leads.tab_closed'),
  }

  const statusLabels: Record<string, string> = {
    NEW: t('leads.status_new'),
    CONTACTED: t('leads.status_contacted'),
    ENROLLED: t('leads.status_enrolled'),
    CLOSED: t('leads.status_closed'),
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">{t('leads.title')}</h1>
          <p className="text-zinc-500 text-sm mt-1">{t('leads.subtitle')}</p>
        </div>
        
        {/* Tab Filters */}
        <div className="flex bg-zinc-900 border border-zinc-850 p-1 rounded-xl flex-wrap gap-1">
          {(['ALL', 'NEW', 'CONTACTED', 'ENROLLED', 'CLOSED'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg text-xs font-semibold uppercase tracking-wider transition ${
                activeTab === tab
                  ? 'bg-zinc-850 text-white border border-zinc-805/50'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              {tabLabels[tab]}
            </button>
          ))}
        </div>
      </div>

      {isLoading && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-12 text-center animate-pulse">
          <p className="text-zinc-400">{t('leads.loading')}</p>
        </div>
      )}

      {error && (
        <div className="bg-red-950/20 border border-red-900/50 rounded-2xl p-8 text-center max-w-lg">
          <h3 className="text-lg font-bold text-red-400 font-sans">{t('leads.error_title')}</h3>
          <p className="text-zinc-400 text-sm mt-1">{t('leads.error_desc')}</p>
        </div>
      )}

      {leads && filteredLeads.length === 0 && (
        <div className="bg-zinc-900/50 border border-zinc-850 rounded-2xl p-12 text-center">
          <CheckCircle2 className="mx-auto text-zinc-600 mb-3" size={36} />
          <h3 className="text-lg font-bold text-zinc-300">{t('leads.empty_title')}</h3>
          <p className="text-zinc-500 text-sm mt-1">{t('leads.empty_desc')}</p>
        </div>
      )}

      {leads && filteredLeads.length > 0 && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-zinc-800 bg-zinc-950/50 text-zinc-400 text-xs font-bold uppercase tracking-wider">
                  <th className="py-4 px-6">{t('leads.col_applicant')}</th>
                  <th className="py-4 px-6">{t('leads.col_course_group')}</th>
                  <th className="py-4 px-6">{t('leads.col_contact')}</th>
                  <th className="py-4 px-6">{t('leads.notes')}</th>
                  <th className="py-4 px-6">{t('leads.col_status')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800 text-sm">
                {filteredLeads.map((lead) => (
                  <tr key={lead.id} className="hover:bg-zinc-900/40 transition">
                    {/* Info */}
                    <td className="py-4 px-6 space-y-1">
                      <p className="font-bold text-white text-base">{lead.fullName}</p>
                      <div className="flex flex-col gap-1 text-xs text-zinc-400">
                        <span className="flex items-center gap-1.5"><Mail size={12} className="text-brand-500" /> {lead.email}</span>
                        <span className="flex items-center gap-1.5"><Phone size={12} className="text-brand-500" /> {lead.phone}</span>
                        <span className="flex items-center gap-1.5"><MapPin size={12} className="text-brand-500" /> {lead.city}</span>
                      </div>
                    </td>

                    {/* Course & Group */}
                    <td className="py-4 px-6">
                      <span className="font-semibold text-zinc-200">
                        {lead.course ? lead.course.title : t('common.na')}
                      </span>
                      {lead.group && (
                        <div className="mt-1 flex items-center gap-1.5">
                          <span className="text-[10px] bg-brand-500/10 text-brand-400 border border-brand-500/20 px-2 py-0.5 rounded-full font-semibold">
                            {lead.group.groupName}
                          </span>
                          <span className="text-[10px] text-zinc-500">{lead.group.schedule}</span>
                        </div>
                      )}
                      <p className="text-[10px] text-zinc-500 mt-1">
                        {t('leads.registered')}: {new Date(lead.createdAt).toLocaleDateString()}
                      </p>
                    </td>

                    {/* Preference */}
                    <td className="py-4 px-6 space-y-1 text-xs text-zinc-300">
                      <div className="flex items-center gap-1.5">
                        <MessageCircle size={12} className="text-brand-500" />
                        <span>{t('leads.contact_method')}: <strong className="text-white font-bold">{lead.contactMethod}</strong></span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Calendar size={12} className="text-brand-500" />
                        <span>{t('leads.contact_time')}: <strong className="text-white font-bold">{lead.contactTime}</strong></span>
                      </div>
                    </td>

                    {/* Notes */}
                    <td className="py-4 px-6 max-w-xs">
                      {lead.notes ? (
                        <div className="flex items-start gap-1.5 text-zinc-400 text-xs">
                          <FileText size={12} className="text-zinc-500 flex-shrink-0 mt-0.5" />
                          <p className="line-clamp-2 hover:line-clamp-none transition cursor-pointer">{lead.notes}</p>
                        </div>
                      ) : (
                        <span className="text-zinc-600 text-xs italic">{t('common.na')}</span>
                      )}
                    </td>

                    {/* Status */}
                    <td className="py-4 px-6">
                      <select
                        value={lead.status}
                        onChange={(e) => handleStatusChange(lead.id, e.target.value)}
                        className={`px-3 py-1.5 rounded-xl border text-xs font-bold focus:outline-none focus:ring-1 focus:ring-brand-500 text-white ${
                          statusColors[lead.status] || 'bg-zinc-800'
                        }`}
                      >
                        <option value="NEW" className="bg-zinc-950 text-blue-400">{statusLabels.NEW}</option>
                        <option value="CONTACTED" className="bg-zinc-950 text-yellow-400">{statusLabels.CONTACTED}</option>
                        <option value="ENROLLED" className="bg-zinc-950 text-green-400">{statusLabels.ENROLLED}</option>
                        <option value="CLOSED" className="bg-zinc-950 text-zinc-400">{statusLabels.CLOSED}</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}