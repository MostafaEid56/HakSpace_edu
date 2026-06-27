import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation } from '@tanstack/react-query'
import { apiClient } from '../../api/client'
import { toast } from 'react-toastify'
import {
  Star, Clock, User, Check, ArrowLeft, Send, Sparkles,
  Users, Calendar, AlertCircle, CheckCircle2
} from 'lucide-react'
import Navbar from '../../components/Navbar'

// ── Types ──────────────────────────────────────────────────────────────────────

interface CourseGroup {
  id: number
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

interface EnrollmentPayload {
  fullName: string
  phone: string
  email: string
  city: string
  contactMethod: string
  contactTime: string
  notes: string
  courseId: number
  groupId?: number
}

// ── API helpers ────────────────────────────────────────────────────────────────

const fetchCourseById = async (id: string): Promise<Course> => {
  const res = await apiClient.get(`/api/courses/${id}`)
  return res.data
}

const submitEnrollment = async (data: EnrollmentPayload) => {
  const res = await apiClient.post('/api/courses/enroll', data)
  return res.data
}

// ── Group Card Component ───────────────────────────────────────────────────────

function GroupCard({
  group,
  selected,
  onSelect,
}: {
  group: CourseGroup
  selected: boolean
  onSelect: () => void
}) {
  const isFull = !group.isAvailable || group.remainingSeats <= 0
  const fillPct = Math.min(100, Math.round((group.currentStudents / group.maxStudents) * 100))

  return (
    <button
      type="button"
      disabled={isFull}
      onClick={onSelect}
      className={`w-full text-left rounded-xl border p-4 transition-all duration-200 relative overflow-hidden
        ${isFull
          ? 'border-zinc-800 bg-zinc-900/30 opacity-60 cursor-not-allowed'
          : selected
            ? 'border-brand-500 bg-brand-500/5 ring-1 ring-brand-500/30 shadow-lg shadow-brand-900/20'
            : 'border-zinc-800 bg-zinc-900/50 hover:border-zinc-700 hover:bg-zinc-900 cursor-pointer'
        }`}
    >
      {/* Full badge */}
      {isFull && (
        <span className="absolute top-3 right-3 text-[10px] font-bold uppercase tracking-wider bg-red-900/30 text-red-400 border border-red-900/40 px-2 py-0.5 rounded-full">
          Full
        </span>
      )}

      {/* Selected checkmark */}
      {selected && !isFull && (
        <span className="absolute top-3 right-3 w-5 h-5 rounded-full bg-brand-500 flex items-center justify-center">
          <Check size={12} className="text-white" strokeWidth={3} />
        </span>
      )}

      <div className="pr-8">
        <p className="font-bold text-white text-sm mb-2">{group.groupName}</p>

        <div className="flex items-center gap-1.5 text-xs text-zinc-400 mb-1">
          <Calendar size={11} className="text-brand-500" />
          <span>{group.schedule}</span>
        </div>

        <div className="flex items-center gap-1.5 text-xs text-zinc-400 mb-3">
          <Users size={11} className="text-brand-500" />
          <span>
            Seats: <strong className="text-white">{group.currentStudents}</strong> / {group.maxStudents}
            {!isFull && (
              <span className="ml-2 text-green-400">· {group.remainingSeats} remaining</span>
            )}
          </span>
        </div>

        {/* Capacity bar */}
        <div className="w-full bg-zinc-800 rounded-full h-1.5 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              fillPct >= 100 ? 'bg-red-500' : fillPct >= 75 ? 'bg-yellow-500' : 'bg-brand-500'
            }`}
            style={{ width: `${fillPct}%` }}
          />
        </div>
      </div>
    </button>
  )
}

// ── Main Component ─────────────────────────────────────────────────────────────

export default function CourseDetailsPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [success, setSuccess] = useState(false)
  const [selectedGroupId, setSelectedGroupId] = useState<number | undefined>(undefined)

  // Form state
  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [city, setCity] = useState('')
  const [contactMethod, setContactMethod] = useState('WHATSAPP')
  const [contactTime, setContactTime] = useState('ANYTIME')
  const [notes, setNotes] = useState('')

  const { data: course, isLoading, error } = useQuery<Course>({
    queryKey: ['course', id],
    queryFn: () => fetchCourseById(id!),
    enabled: !!id,
  })

  const mutation = useMutation({
    mutationFn: submitEnrollment,
    onSuccess: () => {
      setSuccess(true)
      toast.success('Your enrollment request has been submitted!')
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to submit enrollment request. Please try again.')
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!fullName || !phone || !email || !city) {
      toast.error('Please fill in all required fields.')
      return
    }
    // If course has groups, a selection is required
    if (course?.groups && course.groups.length > 0 && !selectedGroupId) {
      toast.error('Please select an available group before submitting.')
      return
    }
    mutation.mutate({
      fullName, phone, email, city,
      contactMethod, contactTime, notes,
      courseId: Number(id),
      groupId: selectedGroupId,
    })
  }

  // ── Loading / Error states ─────────────────────────────────────────────────

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <span className="w-12 h-12 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (error || !course) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center p-4">
        <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-2xl text-center max-w-md">
          <h2 className="text-2xl font-bold text-red-500 mb-2">Course Not Found</h2>
          <p className="text-zinc-400 mb-6">The course you are looking for does not exist or has been removed.</p>
          <button onClick={() => navigate('/courses')} className="bg-brand-600 hover:bg-brand-500 px-6 py-2 rounded-xl transition">
            Go back to catalog
          </button>
        </div>
      </div>
    )
  }

  const availableGroups = course.groups?.filter(g => g.isAvailable) ?? []
  const hasGroups = course.groups && course.groups.length > 0

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 pt-28 pb-16">

        {/* Back navigation */}
        <button
          onClick={() => navigate('/courses')}
          className="mb-8 text-sm font-semibold text-zinc-400 hover:text-white transition flex items-center gap-2 group"
        >
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Back to Catalog
        </button>

        <div className="grid md:grid-cols-3 gap-12 items-start">

          {/* ── Left: Course Details ────────────────────────────────────── */}
          <div className="md:col-span-2 space-y-8">
            <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight">{course.title}</h1>

            <div className="flex flex-wrap gap-4 items-center text-sm text-zinc-400">
              <span className="flex items-center gap-1.5 bg-zinc-900 border border-zinc-800 px-3.5 py-1.5 rounded-full">
                <User size={14} className="text-brand-500" /> Instructor: <strong className="text-white ml-1">{course.instructorName}</strong>
              </span>
              <span className="flex items-center gap-1.5 bg-zinc-900 border border-zinc-800 px-3.5 py-1.5 rounded-full">
                <Clock size={14} className="text-brand-500" /> {course.duration}
              </span>
              <span className="flex items-center gap-1.5 bg-zinc-900 border border-zinc-800 px-3.5 py-1.5 rounded-full">
                <Star size={14} className="text-yellow-400 fill-yellow-400" /> {course.rating.toFixed(1)} / 5.0
              </span>
            </div>

            <div className="relative rounded-3xl overflow-hidden aspect-video max-h-[400px] border border-zinc-800">
              <img
                src={course.imageUrl || 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97'}
                alt={course.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
            </div>

            <div className="space-y-4">
              <h2 className="text-2xl font-bold border-b border-zinc-800 pb-3">Course Overview</h2>
              <p className="text-zinc-300 text-lg leading-relaxed">{course.description}</p>
            </div>

            {/* ── Available Groups (public view) ────────────────────────── */}
            {hasGroups && (
              <div className="space-y-4">
                <h2 className="text-2xl font-bold border-b border-zinc-800 pb-3 flex items-center gap-2">
                  <Users size={22} className="text-brand-500" />
                  Available Groups
                </h2>

                {availableGroups.length === 0 && (
                  <div className="flex items-center gap-3 p-4 bg-red-950/20 border border-red-900/30 rounded-xl">
                    <AlertCircle size={18} className="text-red-400 flex-shrink-0" />
                    <p className="text-sm text-red-300">All groups are currently full. Please check back later or contact us.</p>
                  </div>
                )}

                <div className="grid sm:grid-cols-2 gap-3">
                  {course.groups.map(group => (
                    <GroupCard
                      key={group.id}
                      group={group}
                      selected={selectedGroupId === group.id}
                      onSelect={() => setSelectedGroupId(group.id)}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* What You Get */}
            <div className="space-y-4">
              <h2 className="text-2xl font-bold border-b border-zinc-800 pb-3">What You Will Get</h2>
              <ul className="grid md:grid-cols-2 gap-4">
                {[
                  'Professional certificate of completion',
                  '1-on-1 mentorship sessions',
                  'Lifetime access to online community',
                  'Real-world portfolio projects',
                  'Resume & LinkedIn profile optimization',
                  'Direct job referral network',
                ].map((item, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <span className="w-5 h-5 rounded-full bg-brand-500/10 text-brand-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Check size={12} />
                    </span>
                    <span className="text-zinc-300 text-sm">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* ── Right: Enrollment Sidebar ───────────────────────────────── */}
          <div className="space-y-6 md:sticky md:top-24">
            <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 shadow-2xl relative overflow-hidden">
              <div className="absolute -top-10 -right-10 w-32 h-32 bg-brand-500/10 rounded-full blur-2xl" />

              {/* Price */}
              <div className="mb-6 border-b border-zinc-800 pb-4">
                <span className="text-zinc-400 text-sm font-semibold uppercase tracking-wider">Tuition Fees</span>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-4xl font-extrabold">${course.price}</span>
                  <span className="text-zinc-500 text-xs">One-time payment</span>
                </div>
              </div>

              {/* Selected group indicator */}
              {selectedGroupId && (
                <div className="mb-4 flex items-center gap-2 bg-brand-500/10 border border-brand-500/20 rounded-xl px-3 py-2">
                  <CheckCircle2 size={14} className="text-brand-400 flex-shrink-0" />
                  <span className="text-xs text-brand-300 font-semibold">
                    {course.groups.find(g => g.id === selectedGroupId)?.groupName ?? 'Group'} selected
                  </span>
                </div>
              )}

              {success ? (
                <div className="text-center py-8 space-y-4">
                  <div className="w-16 h-16 bg-green-500/10 text-green-500 rounded-full flex items-center justify-center mx-auto">
                    <Check size={32} />
                  </div>
                  <h3 className="text-xl font-bold">Request Received!</h3>
                  <p className="text-zinc-400 text-sm leading-relaxed">
                    Thank you for your interest! An advisor will reach out to you within 24 hours.
                  </p>
                  <button
                    onClick={() => { setSuccess(false); setSelectedGroupId(undefined) }}
                    className="w-full bg-zinc-800 hover:bg-zinc-700 text-white font-semibold py-2.5 rounded-xl text-sm transition"
                  >
                    Submit another inquiry
                  </button>
                </div>
              ) : (
                <form className="space-y-4" onSubmit={handleSubmit}>
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles size={16} className="text-brand-500" />
                    <h3 className="font-bold text-lg">Apply / Inquiry Form</h3>
                  </div>

                  {/* Group required warning */}
                  {hasGroups && !selectedGroupId && (
                    <div className="flex items-center gap-2 text-xs text-amber-400 bg-amber-900/20 border border-amber-900/30 rounded-lg px-3 py-2">
                      <AlertCircle size={13} className="flex-shrink-0" />
                      Please select a group above before submitting.
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-semibold text-zinc-400 mb-1">Full Name *</label>
                    <input
                      type="text" required placeholder="John Doe"
                      className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-xl text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                      value={fullName} onChange={e => setFullName(e.target.value)}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-zinc-400 mb-1">Phone *</label>
                      <input
                        type="tel" required placeholder="+1 555-0199"
                        className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-xl text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                        value={phone} onChange={e => setPhone(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-zinc-400 mb-1">City *</label>
                      <input
                        type="text" required placeholder="New York"
                        className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-xl text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                        value={city} onChange={e => setCity(e.target.value)}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-zinc-400 mb-1">Email Address *</label>
                    <input
                      type="email" required placeholder="john@example.com"
                      className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-xl text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                      value={email} onChange={e => setEmail(e.target.value)}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-zinc-400 mb-1">Preferred Contact</label>
                      <select
                        className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-xl text-sm text-white focus:outline-none focus:ring-1 focus:ring-brand-500"
                        value={contactMethod} onChange={e => setContactMethod(e.target.value)}
                      >
                        <option value="WHATSAPP">WhatsApp</option>
                        <option value="PHONE">Phone Call</option>
                        <option value="EMAIL">Email</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-zinc-400 mb-1">Preferred Time</label>
                      <select
                        className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-xl text-sm text-white focus:outline-none focus:ring-1 focus:ring-brand-500"
                        value={contactTime} onChange={e => setContactTime(e.target.value)}
                      >
                        <option value="ANYTIME">Anytime</option>
                        <option value="MORNING">Morning</option>
                        <option value="AFTERNOON">Afternoon</option>
                        <option value="EVENING">Evening</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-zinc-400 mb-1">Notes / Questions</label>
                    <textarea
                      rows={2} placeholder="Tell us about your background..."
                      className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-xl text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:ring-1 focus:ring-brand-500 resize-none"
                      value={notes} onChange={e => setNotes(e.target.value)}
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-brand-600 hover:bg-brand-500 active:scale-95 text-white py-3 rounded-xl font-bold transition shadow-lg flex items-center justify-center gap-2 mt-4 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={mutation.isPending || (hasGroups && !selectedGroupId)}
                  >
                    {mutation.isPending
                      ? <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      : <><Send size={14} /> Submit Application</>
                    }
                  </button>
                </form>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}