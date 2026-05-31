import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '../../api/client'
import { toast } from 'react-toastify'
import { Plus, Pencil, Trash2, X, BookOpen, Clock, User, DollarSign, Star, GraduationCap } from 'lucide-react'

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
}

const fetchCourses = async (): Promise<Course[]> => {
  const response = await apiClient.get('/api/admin/courses')
  return response.data
}

export default function AdminCoursesPage() {
  const queryClient = useQueryClient()
  
  // State for Create/Edit Modal
  const [isOpen, setIsOpen] = useState(false)
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null)
  
  // Form Fields State
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [duration, setDuration] = useState('')
  const [instructorName, setInstructorName] = useState('')
  const [price, setPrice] = useState<number>(0)
  const [rating, setRating] = useState<number>(0)
  const [studentCount, setStudentCount] = useState<number>(0)

  // Fetch Courses Query
  const { data: courses, isLoading, error } = useQuery<Course[]>({
    queryKey: ['adminCourses'],
    queryFn: fetchCourses,
  })

  // Add Mutation
  const addMutation = useMutation({
    mutationFn: async (newCourse: Omit<Course, 'id'>) => {
      const response = await apiClient.post('/api/admin/courses', newCourse)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminCourses'] })
      queryClient.invalidateQueries({ queryKey: ['courses'] })
      queryClient.invalidateQueries({ queryKey: ['featuredCourses'] })
      toast.success('Course created successfully!')
      closeModal()
    },
    onError: (err: any) => {
      console.error(err)
      toast.error('Failed to create course.')
    }
  })

  // Update Mutation
  const updateMutation = useMutation({
    mutationFn: async (updatedCourse: Course) => {
      const response = await apiClient.put(`/api/admin/courses/${updatedCourse.id}`, updatedCourse)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminCourses'] })
      queryClient.invalidateQueries({ queryKey: ['courses'] })
      queryClient.invalidateQueries({ queryKey: ['featuredCourses'] })
      toast.success('Course updated successfully!')
      closeModal()
    },
    onError: (err: any) => {
      console.error(err)
      toast.error('Failed to update course.')
    }
  })

  // Delete Mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiClient.delete(`/api/admin/courses/${id}`)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminCourses'] })
      queryClient.invalidateQueries({ queryKey: ['courses'] })
      queryClient.invalidateQueries({ queryKey: ['featuredCourses'] })
      toast.success('Course and all its leads removed successfully!')
    },
    onError: (err: any) => {
      console.error(err)
      toast.error('Failed to delete course.')
    }
  })

  const openModal = (course: Course | null = null) => {
    if (course) {
      setSelectedCourse(course)
      setTitle(course.title)
      setDescription(course.description)
      setImageUrl(course.imageUrl)
      setDuration(course.duration)
      setInstructorName(course.instructorName)
      setPrice(course.price)
      setRating(course.rating)
      setStudentCount(course.studentCount)
    } else {
      setSelectedCourse(null)
      setTitle('')
      setDescription('')
      setImageUrl('https://images.unsplash.com/photo-1517694712202-14dd9538aa97')
      setDuration('12 Weeks')
      setInstructorName('')
      setPrice(199)
      setRating(4.8)
      setStudentCount(120)
    }
    setIsOpen(true)
  }

  const closeModal = () => {
    setIsOpen(false)
    setSelectedCourse(null)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title || !description || !instructorName || !duration) {
      toast.error('Please fill in all required fields.')
      return
    }

    const payload = {
      title,
      description,
      imageUrl,
      duration,
      instructorName,
      price: Number(price),
      rating: Number(rating),
      studentCount: Number(studentCount),
    }

    if (selectedCourse) {
      updateMutation.mutate({ ...payload, id: selectedCourse.id })
    } else {
      addMutation.mutate(payload)
    }
  }

  const handleDelete = (id: number, title: string) => {
    if (confirm(`Are you sure you want to delete "${title}"? This will permanently delete the course and all associated enrollment leads.`)) {
      deleteMutation.mutate(id)
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Courses Management</h1>
          <p className="text-zinc-500 text-sm mt-1">Add, update, or remove courses in your academic directory.</p>
        </div>
        <button 
          onClick={() => openModal()}
          className="flex items-center justify-center gap-2 px-5 py-3 bg-brand-600 hover:bg-brand-500 active:scale-95 text-white rounded-xl text-sm font-bold transition shadow-lg shadow-brand-900/20"
        >
          <Plus size={16} /> Add New Course
        </button>
      </div>

      {isLoading && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-12 text-center animate-pulse">
          <p className="text-zinc-400">Loading course directory...</p>
        </div>
      )}

      {error && (
        <div className="bg-red-950/20 border border-red-900/50 rounded-2xl p-8 text-center max-w-lg">
          <h3 className="text-lg font-bold text-red-400">Error loading courses</h3>
          <p className="text-zinc-400 text-sm mt-1">Please verify administrative authentication and connection.</p>
        </div>
      )}

      {courses && courses.length === 0 && (
        <div className="bg-zinc-900/50 border border-zinc-850 rounded-2xl p-12 text-center">
          <BookOpen className="mx-auto text-zinc-600 mb-3" size={36} />
          <h3 className="text-lg font-bold text-zinc-300">No courses listed</h3>
          <p className="text-zinc-500 text-sm mt-1">Click the "Add New Course" button to create your first educational offering.</p>
        </div>
      )}

      {courses && courses.length > 0 && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-zinc-800 bg-zinc-950/50 text-zinc-400 text-xs font-bold uppercase tracking-wider">
                  <th className="py-4 px-6">Course details</th>
                  <th className="py-4 px-6">Instructor</th>
                  <th className="py-4 px-6">Price</th>
                  <th className="py-4 px-6">Metrics</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800 text-sm">
                {courses.map((course) => (
                  <tr key={course.id} className="hover:bg-zinc-900/40 transition">
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

                    {/* Price */}
                    <td className="py-4 px-6 font-bold text-white text-base">
                      ${course.price.toLocaleString()}
                    </td>

                    {/* Metrics */}
                    <td className="py-4 px-6 text-xs text-zinc-400 space-y-1">
                      <div className="flex items-center gap-1.5">
                        <Star size={12} className="text-yellow-400 fill-yellow-400" />
                        <span>Rating: <strong className="text-white">{course.rating.toFixed(1)}</strong></span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <GraduationCap size={12} className="text-brand-500" />
                        <span>Students: <strong className="text-white">{course.studentCount}</strong></span>
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => openModal(course)}
                          className="p-2 hover:bg-zinc-800 hover:text-brand-400 rounded-lg border border-transparent hover:border-zinc-700 transition"
                          title="Edit Course"
                        >
                          <Pencil size={16} />
                        </button>
                        <button 
                          onClick={() => handleDelete(course.id, course.title)}
                          className="p-2 hover:bg-red-950/20 hover:text-red-400 rounded-lg border border-transparent hover:border-red-900/20 transition"
                          title="Delete Course"
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

      {/* Course Modal */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-2xl bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl flex flex-col relative overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="h-16 flex items-center justify-between px-6 border-b border-zinc-850">
              <h3 className="font-extrabold text-lg text-white">
                {selectedCourse ? 'Edit Course Cohort' : 'Create New Course'}
              </h3>
              <button onClick={closeModal} className="text-zinc-400 hover:text-white transition p-1 hover:bg-zinc-800 rounded-lg">
                <X size={18} />
              </button>
            </div>

            {/* Modal Body Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto max-h-[75vh]">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-zinc-400 mb-1">Course Title *</label>
                  <input 
                    type="text" 
                    required
                    placeholder="e.g. Full Stack Web Development BootCamp" 
                    className="w-full px-3.5 py-2.5 bg-zinc-850 border border-zinc-850 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-brand-500 text-white"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-400 mb-1">Instructor Name *</label>
                  <input 
                    type="text" 
                    required
                    placeholder="e.g. Dr. Adam Smith" 
                    className="w-full px-3.5 py-2.5 bg-zinc-850 border border-zinc-850 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-brand-500 text-white"
                    value={instructorName}
                    onChange={(e) => setInstructorName(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-400 mb-1">Duration *</label>
                  <input 
                    type="text" 
                    required
                    placeholder="e.g. 12 Weeks" 
                    className="w-full px-3.5 py-2.5 bg-zinc-850 border border-zinc-850 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-brand-500 text-white"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-400 mb-1">Tuition Fees ($) *</label>
                  <input 
                    type="number" 
                    required
                    min="0"
                    placeholder="299" 
                    className="w-full px-3.5 py-2.5 bg-zinc-850 border border-zinc-850 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-brand-500 text-white"
                    value={price}
                    onChange={(e) => setPrice(Number(e.target.value))}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-400 mb-1">Image URL</label>
                  <input 
                    type="url" 
                    placeholder="https://unsplash..." 
                    className="w-full px-3.5 py-2.5 bg-zinc-850 border border-zinc-850 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-brand-500 text-white"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-400 mb-1">Initial Rating</label>
                  <input 
                    type="number" 
                    step="0.1" 
                    min="0" 
                    max="5"
                    className="w-full px-3.5 py-2.5 bg-zinc-850 border border-zinc-850 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-brand-500 text-white"
                    value={rating}
                    onChange={(e) => setRating(Number(e.target.value))}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-400 mb-1">Student Count</label>
                  <input 
                    type="number" 
                    min="0"
                    className="w-full px-3.5 py-2.5 bg-zinc-850 border border-zinc-850 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-brand-500 text-white"
                    value={studentCount}
                    onChange={(e) => setStudentCount(Number(e.target.value))}
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-zinc-400 mb-1">Syllabus Overview / Description *</label>
                  <textarea 
                    rows={4}
                    required
                    placeholder="Explain what students will learn, program modules..." 
                    className="w-full px-3.5 py-2.5 bg-zinc-850 border border-zinc-850 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-brand-500 text-white resize-none"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>
              </div>

              {/* Modal Footer Controls */}
              <div className="flex justify-end gap-3 pt-4 border-t border-zinc-850 mt-6">
                <button 
                  type="button" 
                  onClick={closeModal} 
                  className="px-5 py-2.5 bg-zinc-800 hover:bg-zinc-750 text-white font-semibold rounded-xl text-sm transition"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="px-6 py-2.5 bg-brand-600 hover:bg-brand-500 text-white font-bold rounded-xl text-sm transition flex items-center justify-center gap-1.5"
                  disabled={addMutation.isPending || updateMutation.isPending}
                >
                  {(addMutation.isPending || updateMutation.isPending) ? (
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  ) : (
                    'Save Program'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
