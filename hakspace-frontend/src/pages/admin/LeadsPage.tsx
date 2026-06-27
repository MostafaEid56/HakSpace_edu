import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '../../api/client'
import { toast } from 'react-toastify'
import { Mail, Phone, MapPin, Calendar, MessageCircle, FileText, CheckCircle2 } from 'lucide-react'

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
  const [activeTab, setActiveTab] = useState<'ALL' | 'NEW' | 'CONTACTED' | 'ENROLLED' | 'CLOSED'>('ALL')

  const { data: leads, isLoading, error } = useQuery<Enrollment[]>({
    queryKey: ['leads'],
    queryFn: fetchLeads,
  })

  const mutation = useMutation({
    mutationFn: updateLeadStatus,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] })
      toast.success('Lead status updated successfully!')
    },
    onError: (err: any) => {
      console.error(err)
      toast.error('Failed to update lead status.')
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

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Leads Management</h1>
          <p className="text-zinc-500 text-sm mt-1">Review and manage interest inquiries from prospective students.</p>
        </div>
        
        {/* Tab Filters */}
        <div className="flex bg-zinc-900 border border-zinc-850 p-1 rounded-xl">
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
              {tab}
            </button>
          ))}
        </div>
      </div>

      {isLoading && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-12 text-center animate-pulse">
          <p className="text-zinc-400">Loading student leads...</p>
        </div>
      )}

      {error && (
        <div className="bg-red-950/20 border border-red-900/50 rounded-2xl p-8 text-center max-w-lg">
          <h3 className="text-lg font-bold text-red-400 font-sans">Error loading leads</h3>
          <p className="text-zinc-400 text-sm mt-1">Make sure you are authenticated as an administrator.</p>
        </div>
      )}

      {leads && filteredLeads.length === 0 && (
        <div className="bg-zinc-900/50 border border-zinc-850 rounded-2xl p-12 text-center">
          <CheckCircle2 className="mx-auto text-zinc-600 mb-3" size={36} />
          <h3 className="text-lg font-bold text-zinc-300">No leads found</h3>
          <p className="text-zinc-500 text-sm mt-1">There are no leads matching the active status filter.</p>
        </div>
      )}

      {leads && filteredLeads.length > 0 && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-zinc-800 bg-zinc-950/50 text-zinc-400 text-xs font-bold uppercase tracking-wider">
                  <th className="py-4 px-6">Student Info</th>
                  <th className="py-4 px-6">Selected Course</th>
                  <th className="py-4 px-6">Preference</th>
                  <th className="py-4 px-6">Notes</th>
                  <th className="py-4 px-6">Status</th>
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
                        {lead.course ? lead.course.title : 'N/A'}
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
                        Registered: {new Date(lead.createdAt).toLocaleDateString()}
                      </p>
                    </td>

                    {/* Preference */}
                    <td className="py-4 px-6 space-y-1 text-xs text-zinc-300">
                      <div className="flex items-center gap-1.5">
                        <MessageCircle size={12} className="text-brand-500" />
                        <span>Method: <strong className="text-white font-bold">{lead.contactMethod}</strong></span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Calendar size={12} className="text-brand-500" />
                        <span>Time: <strong className="text-white font-bold">{lead.contactTime}</strong></span>
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
                        <span className="text-zinc-600 text-xs italic">No additional notes</span>
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
                        <option value="NEW" className="bg-zinc-950 text-blue-400">NEW</option>
                        <option value="CONTACTED" className="bg-zinc-950 text-yellow-400">CONTACTED</option>
                        <option value="ENROLLED" className="bg-zinc-950 text-green-400">ENROLLED</option>
                        <option value="CLOSED" className="bg-zinc-950 text-zinc-400">CLOSED</option>
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