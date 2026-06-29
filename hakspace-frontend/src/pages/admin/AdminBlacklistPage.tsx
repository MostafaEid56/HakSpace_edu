import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '../../api/client'
import { toast } from 'react-toastify'
import {
  Plus, X, Search, Ban, UserX, UserCheck, Trash2, Pencil, ShieldOff
} from 'lucide-react'

interface BlacklistEntry {
  id: number
  fullName: string
  phoneNumber: string
  email: string | null
  nationalId: string | null
  reason: string
  blockedAt: string
  blockedBy: string | null
  active: boolean
}

const fetchBlacklist = async (search?: string, status?: string): Promise<BlacklistEntry[]> => {
  const params = new URLSearchParams()
  if (search) params.append('search', search)
  if (status && status !== 'all') params.append('status', status)
  const query = params.toString()
  const res = await apiClient.get(`/api/admin/blacklist${query ? '?' + query : ''}`)
  return res.data
}

export default function AdminBlacklistPage() {
  const { t } = useTranslation()
  const queryClient = useQueryClient()

  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  const [showForm, setShowForm] = useState(false)
  const [fullName, setFullName] = useState('')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [email, setEmail] = useState('')
  const [nationalId, setNationalId] = useState('')
  const [reason, setReason] = useState('')

  const [editReasonId, setEditReasonId] = useState<number | null>(null)
  const [editReasonText, setEditReasonText] = useState('')

  const { data: entries, isLoading, error } = useQuery<BlacklistEntry[]>({
    queryKey: ['blacklist', search, statusFilter],
    queryFn: () => fetchBlacklist(search || undefined, statusFilter !== 'all' ? statusFilter : undefined),
  })

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['blacklist'] })

  const addMutation = useMutation({
    mutationFn: async (payload: object) => {
      const res = await apiClient.post('/api/admin/blacklist', payload)
      return res.data
    },
    onSuccess: () => { invalidate(); toast.success(t('blacklist.added_success')); resetForm() },
    onError: (err: any) => toast.error(err.response?.data?.message || t('blacklist.error_add')),
  })

  const updateReasonMutation = useMutation({
    mutationFn: async ({ id, reason }: { id: number; reason: string }) => {
      const res = await apiClient.put(`/api/admin/blacklist/${id}/reason`, { reason })
      return res.data
    },
    onSuccess: () => { invalidate(); toast.success(t('blacklist.updated_reason')); setEditReasonId(null) },
    onError: (err: any) => toast.error(err.response?.data?.message || t('blacklist.error_update')),
  })

  const deactivateMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await apiClient.put(`/api/admin/blacklist/${id}/deactivate`)
      return res.data
    },
    onSuccess: () => { invalidate(); toast.success(t('blacklist.removed_success')) },
    onError: () => toast.error(t('blacklist.error_remove')),
  })

  const reactivateMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await apiClient.put(`/api/admin/blacklist/${id}/reactivate`)
      return res.data
    },
    onSuccess: () => { invalidate(); toast.success(t('blacklist.reactivated_success')) },
    onError: () => toast.error(t('blacklist.error_reactivate')),
  })

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => apiClient.delete(`/api/admin/blacklist/${id}`),
    onSuccess: () => { invalidate(); toast.success(t('blacklist.deleted_success')) },
    onError: () => toast.error(t('blacklist.error_delete')),
  })

  const resetForm = () => {
    setFullName('')
    setPhoneNumber('')
    setEmail('')
    setNationalId('')
    setReason('')
    setShowForm(false)
  }

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault()
    if (!fullName.trim() || !phoneNumber.trim() || !reason.trim()) {
      toast.error(t('blacklist.validation_required'))
      return
    }
    if (!/^[+\d][\d\s()-]{6,20}$/.test(phoneNumber.trim())) {
      toast.error(t('blacklist.validation_phone'))
      return
    }
    addMutation.mutate({
      fullName: fullName.trim(),
      phoneNumber: phoneNumber.trim(),
      email: email.trim() || null,
      nationalId: nationalId.trim() || null,
      reason: reason.trim(),
    })
  }

  const isPending = addMutation.isPending || updateReasonMutation.isPending

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">{t('blacklist.title')}</h1>
          <p className="text-zinc-500 text-sm mt-1">{t('blacklist.subtitle')}</p>
        </div>
        <button
          onClick={() => { resetForm(); setShowForm(!showForm) }}
          className="flex items-center justify-center gap-2 px-5 py-3 bg-brand-600 hover:bg-brand-500 active:scale-95 text-white rounded-xl text-sm font-bold transition shadow-lg shadow-brand-900/20"
        >
          {showForm ? <X size={16} /> : <Plus size={16} />}
          {showForm ? t('blacklist.cancel') : t('blacklist.add_button')}
        </button>
      </div>

      {/* Add Form */}
      {showForm && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
          <h3 className="font-extrabold text-lg text-white mb-4">{t('blacklist.add_title')}</h3>
          <form onSubmit={handleAdd} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-400 mb-1">{t('blacklist.field_full_name')}</label>
              <input type="text" required placeholder={t('blacklist.field_full_name_placeholder')}
                className="w-full px-3.5 py-2.5 bg-zinc-800 border border-zinc-700 rounded-xl text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                value={fullName} onChange={e => setFullName(e.target.value)} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-zinc-400 mb-1">{t('blacklist.field_phone')}</label>
              <input type="tel" required placeholder={t('blacklist.field_phone_placeholder')}
                className="w-full px-3.5 py-2.5 bg-zinc-800 border border-zinc-700 rounded-xl text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                value={phoneNumber} onChange={e => setPhoneNumber(e.target.value)} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-zinc-400 mb-1">{t('blacklist.field_email')}</label>
              <input type="email" placeholder={t('blacklist.field_email_placeholder')}
                className="w-full px-3.5 py-2.5 bg-zinc-800 border border-zinc-700 rounded-xl text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                value={email} onChange={e => setEmail(e.target.value)} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-zinc-400 mb-1">{t('blacklist.field_national_id')}</label>
              <input type="text" placeholder={t('blacklist.field_national_id_placeholder')}
                className="w-full px-3.5 py-2.5 bg-zinc-800 border border-zinc-700 rounded-xl text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                value={nationalId} onChange={e => setNationalId(e.target.value)} />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-zinc-400 mb-1">{t('blacklist.field_reason')}</label>
              <textarea rows={2} required placeholder={t('blacklist.field_reason_placeholder')}
                className="w-full px-3.5 py-2.5 bg-zinc-800 border border-zinc-700 rounded-xl text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:ring-1 focus:ring-brand-500 resize-none"
                value={reason} onChange={e => setReason(e.target.value)} />
            </div>
            <div className="md:col-span-2 flex justify-end">
              <button type="submit" disabled={isPending}
                className="px-6 py-2.5 bg-brand-600 hover:bg-brand-500 text-white font-bold rounded-xl text-sm transition flex items-center justify-center gap-1.5 min-w-[140px]"
              >
                {isPending
                  ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  : <><Ban size={14} /> {t('blacklist.add_button')}</>
                }
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-grow">
          <Search className="absolute left-3.5 top-3.5 text-zinc-500" size={16} />
          <input type="text" value={search} onChange={e => setSearch(e.target.value)}
            placeholder={t('blacklist.search_placeholder')}
            className="w-full pl-9 pr-4 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:ring-1 focus:ring-brand-500" />
        </div>
        <div className="flex gap-2">
          {['all', 'active', 'inactive'].map(s => (
            <button key={s} onClick={() => setStatusFilter(s)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
                statusFilter === s
                  ? 'bg-brand-600 text-white shadow-lg shadow-brand-900/30'
                  : 'bg-zinc-900 text-zinc-400 hover:bg-zinc-800 border border-zinc-800'
              }`}
            >
              {s === 'all' ? t('blacklist.filter_all') : s === 'active' ? t('blacklist.filter_active') : t('blacklist.filter_removed')}
            </button>
          ))}
        </div>
      </div>

      {/* Loading / Error / Empty */}
      {isLoading && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-12 text-center animate-pulse">
          <p className="text-zinc-400">{t('blacklist.loading')}</p>
        </div>
      )}
      {error && (
        <div className="bg-red-950/20 border border-red-900/50 rounded-2xl p-8 text-center max-w-lg">
          <h3 className="text-lg font-bold text-red-400">{t('blacklist.error_title')}</h3>
          <p className="text-zinc-400 text-sm mt-1">{t('blacklist.error_desc')}</p>
        </div>
      )}
      {entries && entries.length === 0 && (
        <div className="bg-zinc-900/50 border border-zinc-850 rounded-2xl p-12 text-center">
          <ShieldOff className="mx-auto text-zinc-600 mb-3" size={36} />
          <h3 className="text-lg font-bold text-zinc-300">{t('blacklist.no_results')}</h3>
        </div>
      )}

      {/* Table */}
      {entries && entries.length > 0 && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-zinc-800 bg-zinc-950/50 text-zinc-400 text-xs font-bold uppercase tracking-wider">
                  <th className="py-4 px-6">{t('blacklist.table_name')}</th>
                  <th className="py-4 px-6">{t('blacklist.table_phone')}</th>
                  <th className="py-4 px-6">{t('blacklist.table_email')}</th>
                  <th className="py-4 px-6">{t('blacklist.table_reason')}</th>
                  <th className="py-4 px-6">{t('blacklist.table_date_added')}</th>
                  <th className="py-4 px-6">{t('blacklist.table_status')}</th>
                  <th className="py-4 px-6 text-right">{t('blacklist.table_actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800 text-sm">
                {entries.map(entry => (
                  <tr key={entry.id} className="hover:bg-zinc-900/40 transition">
                    <td className="py-4 px-6 font-bold text-white">{entry.fullName}</td>
                    <td className="py-4 px-6 text-zinc-300">{entry.phoneNumber}</td>
                    <td className="py-4 px-6 text-zinc-400">{entry.email || '-'}</td>
                    <td className="py-4 px-6 text-zinc-300 max-w-[200px] truncate">{entry.reason}</td>
                    <td className="py-4 px-6 text-zinc-400 text-xs">
                      {new Date(entry.blockedAt).toLocaleDateString()}
                    </td>
                    <td className="py-4 px-6">
                      <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${
                        entry.active
                          ? 'bg-green-900/30 text-green-400 border border-green-900/30'
                          : 'bg-zinc-800 text-zinc-500 border border-zinc-800'
                      }`}>
                        {entry.active ? t('blacklist.status_active') : t('blacklist.status_inactive')}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-1">
                        {editReasonId === entry.id ? (
                          <div className="flex items-center gap-2">
                            <input type="text" value={editReasonText}
                              onChange={e => setEditReasonText(e.target.value)}
                              className="w-40 px-2 py-1 bg-zinc-800 border border-zinc-700 rounded-lg text-xs text-white focus:outline-none focus:ring-1 focus:ring-brand-500"
                              placeholder={t('blacklist.edit_reason_placeholder')} />
                            <button onClick={() => updateReasonMutation.mutate({ id: entry.id, reason: editReasonText })}
                              className="p-1.5 text-xs bg-brand-600 hover:bg-brand-500 text-white rounded-lg transition">OK</button>
                            <button onClick={() => setEditReasonId(null)}
                              className="p-1.5 text-xs bg-zinc-800 text-zinc-400 rounded-lg transition">X</button>
                          </div>
                        ) : (
                          <button onClick={() => { setEditReasonId(entry.id); setEditReasonText(entry.reason) }}
                            className="p-2 hover:bg-zinc-800 hover:text-brand-400 rounded-lg transition" title={t('blacklist.edit_reason')}>
                            <Pencil size={14} />
                          </button>
                        )}
                        {entry.active ? (
                          <button onClick={() => {
                            if (confirm(t('blacklist.confirm_remove', { name: entry.fullName })))
                              deactivateMutation.mutate(entry.id)
                          }}
                            className="p-2 hover:bg-amber-950/20 hover:text-amber-400 rounded-lg transition" title={t('blacklist.remove')}>
                            <UserX size={14} />
                          </button>
                        ) : (
                          <button onClick={() => reactivateMutation.mutate(entry.id)}
                            className="p-2 hover:bg-green-950/20 hover:text-green-400 rounded-lg transition" title={t('blacklist.reactivate')}>
                            <UserCheck size={14} />
                          </button>
                        )}
                        <button onClick={() => {
                          if (confirm(t('blacklist.confirm_delete', { name: entry.fullName })))
                            deleteMutation.mutate(entry.id)
                        }}
                          className="p-2 hover:bg-red-950/20 hover:text-red-400 rounded-lg transition" title={t('blacklist.delete')}>
                          <Trash2 size={14} />
                        </button>
                      </div>
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
