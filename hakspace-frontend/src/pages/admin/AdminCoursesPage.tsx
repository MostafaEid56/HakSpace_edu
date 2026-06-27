import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '../../api/client'
import { toast } from 'react-toastify'
import {
  Plus, Pencil, Trash2, X, BookOpen, Clock, User,
  Star, GraduationCap, Users, Calendar, ChevronDown, ChevronUp
} from 'lucide-react'
import { useTranslation } from 'react-i18next'

// ── Types ──────────────────────────────────────────────────────────────────────

interface CourseGroup {
  id?: number
  groupName: string
  maxStudents: number
  currentStudents: number
  remainingSeats: number
  schedule: string
  isAvailable: boolean
}

interface Course {
  id: number
  title: string
  description: string
  imageUrl: string
  duration: string
  instructorName: string
  price: number
  rating: number
  studentCount: number
  groups: CourseGroup[]
}

interface GroupDraft {
  id?: number           // undefined = new group
  groupName: string
  maxStudents: number
  schedule: string
}

const EMPTY_GROUP = (): GroupDraft => ({ groupName: '', maxStudents: 20, schedule: '' })

// ── API helpers ────────────────────────────────────────────────────────────────

const fetchCourses = async (): Promise<Course[]> => {
  const res = await apiClient.get('/api/admin/courses')
  return res.data
}

// ── Main Component ─────────────────────────────────────────────────────────────

export default function AdminCoursesPage() {
  const queryClient = useQueryClient()
  const { t } = useTranslation()

  // Modal state
  const [isOpen, setIsOpen] = useState(false)
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null)
  const [expandedGroupIdx, setExpandedGroupIdx] = useState<number | null>(null)

  // Course fields
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [duration, setDuration] = useState('')
  const [instructorName, setInstructorName] = useState('')
  const [price, setPrice] = useState<number>(0)
  const [rating, setRating] = useState<number>(0)
  const [studentCount, setStudentCount] = useState<number>(0)

  // Groups draft list
  const [groups, setGroups] = useState<GroupDraft[]>([])

  // ── Queries & Mutations ────────────────────────────────────────────────────

  const { data: courses, isLoading, error } = useQuery<Course[]>({
    queryKey: ['adminCourses'],
    queryFn: fetchCourses,
  })

  const invalidateAll = () => {
    queryClient.invalidateQueries({ queryKey: ['adminCourses'] })
    queryClient.invalidateQueries({ queryKey: ['courses'] })
    queryClient.invalidateQueries({ queryKey: ['featuredCourses'] })
  }

  const addMutation = useMutation({
    mutationFn: async (payload: object) => {
      const res = await apiClient.post('/api/admin/courses', payload)
      return res.data
    },
    onSuccess: () => { invalidateAll(); toast.success(t('admin_courses.created')); closeModal() },
    onError: (err: any) => toast.error(err.response?.data?.message || t('admin_courses.error_create')),
  })

  const updateMutation = useMutation({
    mutationFn: async ({ id, payload }: { id: number; payload: object }) => {
      const res = await apiClient.put(`/api/admin/courses/${id}`, payload)
      return res.data
    },
    onSuccess: () => { invalidateAll(); toast.success(t('admin_courses.updated')); closeModal() },
    onError: (err: any) => toast.error(err.response?.data?.message || t('admin_courses.error_update')),
  })

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => apiClient.delete(`/api/admin/courses/${id}`),
    onSuccess: () => { invalidateAll(); toast.success(t('admin_courses.deleted')) },
    onError: () => toast.error(t('admin_courses.error_delete')),
  })

  // ── Modal helpers ──────────────────────────────────────────────────────────

  const openModal = (course: Course | null = null) => {
    if (course) {
      setSelectedCourse(course)
      setTitle(course.title)
      setDescription(course.description)
      setImageUrl(course.imageUrl || '')
      setDuration(course.duration)
      setInstructorName(course.instructorName)
      setPrice(course.price)
      setRating(course.rating)
      setStudentCount(course.studentCount)
      setGroups(course.groups.map(g => ({
        id: g.id,
        groupName: g.groupName,
        maxStudents: g.maxStudents,
        schedule: g.schedule,
      })))
    } else {
      setSelectedCourse(null)
      setTitle('')
      setDescription('')
      setImageUrl('https://images.unsplash.com/photo-1517694712202-14dd9538aa97')
      setDuration('12 Weeks')
      setInstructorName('')
      setPrice(199)
      setRating(4.8)
      setStudentCount(0)
      setGroups([])
    }
    setExpandedGroupIdx(null)
    setIsOpen(true)
  }

  const closeModal = () => { setIsOpen(false); setSelectedCourse(null); setGroups([]) }

  // ── Group draft helpers ────────────────────────────────────────────────────

  const addGroup = () => {
    const newIdx = groups.length
    setGroups(prev => [...prev, EMPTY_GROUP()])
    setExpandedGroupIdx(newIdx)
  }

  const removeGroup = (idx: number) => {
    setGroups(prev => prev.filter((_, i) => i !== idx))
    setExpandedGroupIdx(null)
  }

  const updateGroup = (idx: number, field: keyof GroupDraft, value: string | number) => {
    setGroups(prev => prev.map((g, i) => i === idx ? { ...g, [field]: value } : g))
  }

  // ── Form submit ────────────────────────────────────────────────────────────

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title || !description || !instructorName || !duration) {
      toast.error(t('admin_courses.validation_required'))
      return
    }
    for (const g of groups) {
      if (!g.groupName.trim()) { toast.error(t('admin_courses.validation_group_name')); return }
      if (!g.schedule.trim()) { toast.error(t('admin_courses.validation_group_schedule')); return }
      if (g.maxStudents < 1) { toast.error(t('admin_courses.validation_group_students')); return }
    }

    const payload = {
      title, description, imageUrl, duration,
      instructorName, price: Number(price),
      rating: Number(rating), studentCount: Number(studentCount),
      groups,
    }

    if (selectedCourse) {
      updateMutation.mutate({ id: selectedCourse.id, payload })
    } else {
      addMutation.mutate(payload)
    }
  }

  const handleDelete = (id: number, courseTitle: string) => {
    const confirmMessage = t('admin_courses.delete_confirm', { title: courseTitle })
    // If the translation returns the raw string with placeholder (e.g. fallback or not processed by i18next interpolator here, let's manually replace just in case)
    if (confirm(confirmMessage.replace('{{title}}', courseTitle))) {
      deleteMutation.mutate(id)
    }
  }

  const isPending = addMutation.isPending || updateMutation.isPending

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">{t('admin_courses.title')}</h1>
          <p className="text-zinc-500 text-sm mt-1">{t('admin_courses.subtitle')}</p>
        </div>
        <button
          onClick={() => openModal()}
          className="flex items-center justify-center gap-2 px-5 py-3 bg-brand-600 hover:bg-brand-500 active:scale-95 text-white rounded-xl text-sm font-bold transition shadow-lg shadow-brand-900/20"
        >
          <Plus size={16} /> {t('admin_courses.add_button')}
        </button>
      </div>

      {/* Loading / Error / Empty states */}
      {isLoading && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-12 text-center animate-pulse">
          <p className="text-zinc-400">{t('admin_courses.loading')}</p>
        </div>
      )}
      {error && (
        <div className="bg-red-950/20 border border-red-900/50 rounded-2xl p-8 text-center max-w-lg">
          <h3 className="text-lg font-bold text-red-400">{t('admin_courses.error_title')}</h3>
          <p className="text-zinc-400 text-sm mt-1">{t('admin_courses.error_desc')}</p>
        </div>
      )}
      {courses && courses.length === 0 && (
        <div className="bg-zinc-900/50 border border-zinc-850 rounded-2xl p-12 text-center">
          <BookOpen className="mx-auto text-zinc-600 mb-3" size={36} />
          <h3 className="text-lg font-bold text-zinc-300">{t('admin_courses.empty_title')}</h3>
          <p className="text-zinc-500 text-sm mt-1">{t('admin_courses.empty_desc')}</p>
        </div>
      )}

      {/* Courses Table */}
      {courses && courses.length > 0 && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-zinc-800 bg-zinc-950/50 text-zinc-400 text-xs font-bold uppercase tracking-wider">
                  <th className="py-4 px-6">{t('admin_courses.col_details')}</th>
                  <th className="py-4 px-6">{t('admin_courses.col_instructor')}</th>
                  <th className="py-4 px-6">{t('admin_courses.col_price')}</th>
                  <th className="py-4 px-6">{t('admin_courses.col_groups')}</th>
                  <th className="py-4 px-6 text-right">{t('admin_courses.col_actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800 text-sm">
                {courses.map((course) => (
                  <tr key={course.id} className="hover:bg-zinc-900/40 transition align-top">
                    {/* Title & Image */}
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-10 rounded-lg overflow-hidden bg-zinc-800 border border-zinc-800 flex-shrink-0">
                          <img src={course.imageUrl} alt={course.title} className="w-full h-full object-cover" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-white truncate text-base">{course.title}</p>
                          <span className="flex items-center gap-1 text-[10px] text-zinc-400 mt-0.5">
                            <Clock size={10} className="text-brand-500" /> {course.duration}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Instructor */}
                    <td className="py-4 px-6 text-zinc-350">
                      <span className="flex items-center gap-1.5 font-medium">
                        <User size={14} className="text-zinc-500" /> {course.instructorName}
                      </span>
                    </td>

                    {/* Price & Rating */}
                    <td className="py-4 px-6">
                      <p className="font-bold text-white text-base">${course.price.toLocaleString()}</p>
                      <span className="flex items-center gap-1 text-[10px] text-zinc-400 mt-0.5">
                        <Star size={10} className="text-yellow-400 fill-yellow-400" /> {course.rating.toFixed(1)}
                      </span>
                    </td>

                    {/* Groups Summary */}
                    <td className="py-4 px-6 min-w-[220px]">
                      {!course.groups || course.groups.length === 0 ? (
                        <span className="text-zinc-600 text-xs italic">{t('admin_courses.no_groups')}</span>
                      ) : (
                        <div className="space-y-1.5">
                          {course.groups.map(g => (
                            <div key={g.id} className="flex items-center gap-2">
                              <span className={`w-2 h-2 rounded-full flex-shrink-0 ${g.isAvailable ? 'bg-green-500' : 'bg-red-500'}`} />
                              <span className="text-xs text-zinc-300 font-semibold">{g.groupName}</span>
                              <span className="text-[10px] text-zinc-500">{g.currentStudents}/{g.maxStudents}</span>
                              {!g.isAvailable && (
                                <span className="text-[10px] bg-red-900/30 text-red-400 px-1.5 py-0.5 rounded-full border border-red-900/30">{t('admin_courses.full_badge')}</span>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openModal(course)}
                          className="p-2 hover:bg-zinc-800 hover:text-brand-400 rounded-lg border border-transparent hover:border-zinc-700 transition"
                          title={t('admin_courses.edit_tooltip')}
                        >
                          <Pencil size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(course.id, course.title)}
                          className="p-2 hover:bg-red-950/20 hover:text-red-400 rounded-lg border border-transparent hover:border-red-900/20 transition"
                          title={t('admin_courses.delete_tooltip')}
                        >
                          <Trash2 size={16} />
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

      {/* ── Create / Edit Modal ─────────────────────────────────────────────── */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-2xl bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl flex flex-col relative overflow-hidden">
            {/* Modal Header */}
            <div className="h-16 flex items-center justify-between px-6 border-b border-zinc-800 flex-shrink-0">
              <h3 className="font-extrabold text-lg text-white">
                {selectedCourse ? t('admin_courses.modal_edit') : t('admin_courses.modal_create')}
              </h3>
              <button onClick={closeModal} className="text-zinc-400 hover:text-white transition p-1 hover:bg-zinc-800 rounded-lg">
                <X size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSubmit} className="overflow-y-auto max-h-[80vh]">
              <div className="p-6 space-y-4">

                {/* ── Course Info Section ─────────────────────────────────── */}
                <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">{t('admin_courses.section_info')}</p>
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="block text-xs font-semibold text-zinc-400 mb-1">{t('admin_courses.field_title')}</label>
                    <input
                      type="text" required
                      placeholder={t('admin_courses.field_title_placeholder')}
                      className="w-full px-3.5 py-2.5 bg-zinc-800 border border-zinc-700 rounded-xl text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                      value={title} onChange={e => setTitle(e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-zinc-400 mb-1">{t('admin_courses.field_instructor')}</label>
                    <input
                      type="text" required placeholder={t('admin_courses.field_instructor_placeholder')}
                      className="w-full px-3.5 py-2.5 bg-zinc-800 border border-zinc-700 rounded-xl text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                      value={instructorName} onChange={e => setInstructorName(e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-zinc-400 mb-1">{t('admin_courses.field_duration')}</label>
                    <input
                      type="text" required placeholder={t('admin_courses.field_duration_placeholder')}
                      className="w-full px-3.5 py-2.5 bg-zinc-800 border border-zinc-700 rounded-xl text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                      value={duration} onChange={e => setDuration(e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-zinc-400 mb-1">{t('admin_courses.field_price')}</label>
                    <input
                      type="number" required min="0" placeholder="299"
                      className="w-full px-3.5 py-2.5 bg-zinc-800 border border-zinc-700 rounded-xl text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                      value={price} onChange={e => setPrice(Number(e.target.value))}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-zinc-400 mb-1">{t('admin_courses.field_image')}</label>
                    <input
                      type="url" placeholder={t('admin_courses.field_image_placeholder')}
                      className="w-full px-3.5 py-2.5 bg-zinc-800 border border-zinc-700 rounded-xl text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                      value={imageUrl} onChange={e => setImageUrl(e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-zinc-400 mb-1">{t('admin_courses.field_rating')}</label>
                    <input
                      type="number" step="0.1" min="0" max="5"
                      className="w-full px-3.5 py-2.5 bg-zinc-800 border border-zinc-700 rounded-xl text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                      value={rating} onChange={e => setRating(Number(e.target.value))}
                    />
                  </div>

                  <div className="col-span-2">
                    <label className="block text-xs font-semibold text-zinc-400 mb-1">{t('admin_courses.field_description')}</label>
                    <textarea
                      rows={3} required placeholder={t('admin_courses.field_description_placeholder')}
                      className="w-full px-3.5 py-2.5 bg-zinc-800 border border-zinc-700 rounded-xl text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:ring-1 focus:ring-brand-500 resize-none"
                      value={description} onChange={e => setDescription(e.target.value)}
                    />
                  </div>
                </div>

                {/* ── Groups Section ──────────────────────────────────────── */}
                <div className="border-t border-zinc-800 pt-4">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">{t('admin_courses.section_groups')}</p>
                      <p className="text-xs text-zinc-600 mt-0.5">{t('admin_courses.section_groups_desc')}</p>
                    </div>
                    <button
                      type="button"
                      onClick={addGroup}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-800 hover:bg-brand-600 border border-zinc-700 hover:border-brand-500 text-zinc-300 hover:text-white rounded-lg text-xs font-semibold transition"
                    >
                      <Plus size={13} /> {t('admin_courses.add_group')}
                    </button>
                  </div>

                  {groups.length === 0 && (
                    <div className="text-center py-6 border border-dashed border-zinc-800 rounded-xl">
                      <Users size={24} className="mx-auto text-zinc-700 mb-2" />
                      <p className="text-zinc-600 text-xs">{t('admin_courses.no_groups_yet')}</p>
                    </div>
                  )}

                  <div className="space-y-2">
                    {groups.map((g, idx) => (
                      <div key={idx} className="border border-zinc-800 rounded-xl overflow-hidden">
                        {/* Group Header — click to expand/collapse */}
                        <div
                          className="flex items-center justify-between px-4 py-3 bg-zinc-800/60 cursor-pointer hover:bg-zinc-800 transition"
                          onClick={() => setExpandedGroupIdx(expandedGroupIdx === idx ? null : idx)}
                        >
                          <div className="flex items-center gap-2">
                            <span className="w-5 h-5 rounded-full bg-brand-600/20 text-brand-400 text-[10px] font-black flex items-center justify-center">
                              {idx + 1}
                            </span>
                            <span className="text-sm font-semibold text-white">
                              {g.groupName || <span className="text-zinc-500 italic font-normal">{t('admin_courses.group_unnamed')}</span>}
                            </span>
                            {g.schedule && (
                              <span className="hidden sm:flex items-center gap-1 text-[10px] text-zinc-500">
                                <Calendar size={10} /> {g.schedule}
                              </span>
                            )}
                            <span className="text-[10px] text-zinc-600 ml-1">· {t('admin_courses.group_max')}: {g.maxStudents}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={e => { e.stopPropagation(); removeGroup(idx) }}
                              className="p-1 text-zinc-600 hover:text-red-400 transition rounded"
                            >
                              <Trash2 size={13} />
                            </button>
                            {expandedGroupIdx === idx
                              ? <ChevronUp size={14} className="text-zinc-500" />
                              : <ChevronDown size={14} className="text-zinc-500" />}
                          </div>
                        </div>

                        {/* Group Fields — expanded */}
                        {expandedGroupIdx === idx && (
                          <div className="p-4 grid grid-cols-2 gap-3 bg-zinc-900/40">
                            <div>
                              <label className="block text-xs font-semibold text-zinc-400 mb-1">{t('admin_courses.group_field_name')}</label>
                              <input
                                type="text"
                                placeholder={t('admin_courses.group_field_name_placeholder')}
                                className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                                value={g.groupName}
                                onChange={e => updateGroup(idx, 'groupName', e.target.value)}
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-semibold text-zinc-400 mb-1">{t('admin_courses.group_field_max')}</label>
                              <input
                                type="number" min="1"
                                className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                                value={g.maxStudents}
                                onChange={e => updateGroup(idx, 'maxStudents', Number(e.target.value))}
                              />
                            </div>
                            <div className="col-span-2">
                              <label className="block text-xs font-semibold text-zinc-400 mb-1">{t('admin_courses.group_field_schedule')}</label>
                              <input
                                type="text"
                                placeholder={t('admin_courses.group_field_schedule_placeholder')}
                                className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                                value={g.schedule}
                                onChange={e => updateGroup(idx, 'schedule', e.target.value)}
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="flex justify-end gap-3 px-6 py-4 border-t border-zinc-800 bg-zinc-950/30">
                <button
                  type="button" onClick={closeModal}
                  className="px-5 py-2.5 bg-zinc-800 hover:bg-zinc-750 text-white font-semibold rounded-xl text-sm transition"
                >
                  {t('admin_courses.cancel')}
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-brand-600 hover:bg-brand-500 text-white font-bold rounded-xl text-sm transition flex items-center justify-center gap-1.5 min-w-[120px]"
                  disabled={isPending}
                >
                  {isPending
                    ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    : t('admin_courses.save')
                  }
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
