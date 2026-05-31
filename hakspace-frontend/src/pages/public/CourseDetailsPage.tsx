import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation } from '@tanstack/react-query'
import { apiClient } from '../../api/client'
import { toast } from 'react-toastify'
import { Star, Clock, BookOpen, User, Check, ArrowLeft, Send, Sparkles } from 'lucide-react'

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

interface EnrollmentInput {
  fullName: string
  phone: string
  email: string
  city: string
  contactMethod: string
  contactTime: string
  notes: string
  course: { id: number }
}

const fetchCourseById = async (id: string): Promise<Course> => {
  const response = await apiClient.get(`/api/courses/${id}`)
  return response.data
}

const submitEnrollment = async (data: EnrollmentInput) => {
  const response = await apiClient.post('/api/courses/enroll', data)
  return response.data
}

export default function CourseDetailsPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [success, setSuccess] = useState(false)

  // Form State
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
      console.error(err)
      toast.error('Failed to submit enrollment request. Please try again.')
    }
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!fullName || !phone || !email || !city) {
      toast.error('Please fill in all required fields.')
      return
    }
    mutation.mutate({
      fullName,
      phone,
      email,
      city,
      contactMethod,
      contactTime,
      notes,
      course: { id: Number(id) }
    })
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <span className="w-12 h-12 border-4 border-brand-500 border-t-transparent rounded-full animate-spin"></span>
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

  return (
    <div className="min-h-screen bg-black text-white px-4 py-12 md:py-20">
      <div className="max-w-7xl mx-auto">
        {/* Back navigation */}
        <button 
          onClick={() => navigate('/courses')} 
          className="mb-8 text-sm font-semibold text-zinc-400 hover:text-white transition flex items-center gap-2 group"
        >
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Back to Catalog
        </button>

        {/* Hero Section */}
        <div className="grid md:grid-cols-3 gap-12 items-start">
          
          {/* Main Details (Left 2 cols) */}
          <div className="md:col-span-2 space-y-8">
            <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight">{course.title}</h1>
            
            <div className="flex flex-wrap gap-4 items-center text-sm text-zinc-400">
              <span className="flex items-center gap-1.5 bg-zinc-900 border border-zinc-800 px-3.5 py-1.5 rounded-full">
                <User size={14} className="text-brand-500" /> Instructor: <strong className="text-white">{course.instructorName}</strong>
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
              <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent"></div>
            </div>

            <div className="space-y-4">
              <h2 className="text-2xl font-bold border-b border-zinc-800 pb-3">Course Overview</h2>
              <p className="text-zinc-300 text-lg leading-relaxed">{course.description}</p>
            </div>

            <div className="space-y-4">
              <h2 className="text-2xl font-bold border-b border-zinc-800 pb-3">What You Will Get</h2>
              <ul className="grid md:grid-cols-2 gap-4">
                {[
                  'Professional certificate of completion',
                  '1-on-1 mentorship sessions',
                  'Lifetime access to online community',
                  'Real-world portfolio projects',
                  'Resume & LinkedIn profile optimization',
                  'Direct job referral network'
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

          {/* Sidebar Form & Price (Right 1 col) */}
          <div className="space-y-6 md:sticky md:top-8">
            <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 shadow-2xl relative overflow-hidden">
              {/* Highlight background element */}
              <div className="absolute -top-10 -right-10 w-32 h-32 bg-brand-500/10 rounded-full blur-2xl"></div>
              
              <div className="mb-6 border-b border-zinc-850 pb-4">
                <span className="text-zinc-400 text-sm font-semibold uppercase tracking-wider">Tuition Fees</span>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-4xl font-extrabold">${course.price}</span>
                  <span className="text-zinc-500 text-xs">One-time payment</span>
                </div>
              </div>

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
                    onClick={() => setSuccess(false)}
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

                  <div>
                    <label className="block text-xs font-semibold text-zinc-400 mb-1">Full Name *</label>
                    <input 
                      type="text" 
                      required
                      placeholder="John Doe" 
                      className="w-full px-3 py-2 bg-zinc-850 border border-zinc-850 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-brand-500"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-zinc-400 mb-1">Phone Number *</label>
                      <input 
                        type="tel" 
                        required
                        placeholder="+1 555-0199" 
                        className="w-full px-3 py-2 bg-zinc-850 border border-zinc-850 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-brand-500"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-zinc-400 mb-1">City *</label>
                      <input 
                        type="text" 
                        required
                        placeholder="New York" 
                        className="w-full px-3 py-2 bg-zinc-850 border border-zinc-850 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-brand-500"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-zinc-400 mb-1">Email Address *</label>
                    <input 
                      type="email" 
                      required
                      placeholder="john@example.com" 
                      className="w-full px-3 py-2 bg-zinc-850 border border-zinc-850 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-brand-500"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-zinc-400 mb-1">Preferred Contact</label>
                      <select 
                        className="w-full px-3 py-2 bg-zinc-850 border border-zinc-850 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-brand-500 text-zinc-300"
                        value={contactMethod}
                        onChange={(e) => setContactMethod(e.target.value)}
                      >
                        <option value="WHATSAPP">WhatsApp</option>
                        <option value="PHONE">Phone Call</option>
                        <option value="EMAIL">Email</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-zinc-400 mb-1">Preferred Time</label>
                      <select 
                        className="w-full px-3 py-2 bg-zinc-850 border border-zinc-850 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-brand-500 text-zinc-300"
                        value={contactTime}
                        onChange={(e) => setContactTime(e.target.value)}
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
                      rows={2}
                      placeholder="Tell us about your background..." 
                      className="w-full px-3 py-2 bg-zinc-850 border border-zinc-850 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-brand-500 text-white resize-none"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                    />
                  </div>

                  <button 
                    type="submit" 
                    className="w-full bg-brand-600 hover:bg-brand-500 active:scale-95 text-white py-3 rounded-xl font-bold transition shadow-lg flex items-center justify-center gap-2 mt-4 text-sm"
                    disabled={mutation.isPending}
                  >
                    {mutation.isPending ? (
                      <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    ) : (
                      <>
                        <Send size={14} /> Submit Application
                      </>
                    )}
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