import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { apiClient } from '../../api/client'
import { Star, Clock, Users, ArrowRight } from 'lucide-react'

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
  const response = await apiClient.get('/api/courses')
  return response.data
}

export default function CoursesPage() {
  const navigate = useNavigate()

  const { data: courses, isLoading, error } = useQuery<Course[]>({
    queryKey: ['courses'],
    queryFn: fetchCourses,
  })

  return (
    <div className="min-h-screen bg-black text-white px-4 py-16">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
          <div>
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4">
              Explore Our <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-500 to-rose-400">Programs</span>
            </h1>
            <p className="text-zinc-400 text-lg max-w-xl">
              Professional, hands-on, instructor-led training designed to advance your tech career.
            </p>
          </div>
          <button 
            onClick={() => navigate('/')} 
            className="mt-4 md:mt-0 text-sm font-semibold text-zinc-400 hover:text-white transition flex items-center gap-1"
          >
            Back to Home <ArrowRight size={16} />
          </button>
        </div>

        {isLoading && (
          <div className="grid md:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-4 animate-pulse">
                <div className="bg-zinc-800 h-48 rounded-xl w-full"></div>
                <div className="h-6 bg-zinc-800 rounded w-3/4"></div>
                <div className="h-4 bg-zinc-800 rounded w-full"></div>
                <div className="h-4 bg-zinc-800 rounded w-5/6"></div>
                <div className="flex justify-between items-center pt-4">
                  <div className="h-8 bg-zinc-800 rounded w-1/4"></div>
                  <div className="h-10 bg-zinc-800 rounded w-1/3"></div>
                </div>
              </div>
            ))}
          </div>
        )}

        {error && (
          <div className="bg-red-950/20 border border-red-900/50 rounded-2xl p-8 text-center max-w-lg mx-auto">
            <h3 className="text-xl font-bold text-red-400 mb-2">Failed to load courses</h3>
            <p className="text-zinc-400 mb-4">Something went wrong while communicating with the server.</p>
            <button 
              onClick={() => window.location.reload()} 
              className="bg-red-600 hover:bg-red-500 px-6 py-2.5 rounded-xl font-semibold transition"
            >
              Try Again
            </button>
          </div>
        )}

        {courses && courses.length === 0 && (
          <div className="text-center py-20 bg-zinc-900/50 border border-zinc-800 rounded-3xl">
            <h3 className="text-2xl font-bold mb-2">No courses available</h3>
            <p className="text-zinc-400">We are currently updating our syllabus. Please check back later.</p>
          </div>
        )}

        {courses && courses.length > 0 && (
          <div className="grid md:grid-cols-3 gap-8">
            {courses.map((course) => (
              <div 
                key={course.id} 
                onClick={() => navigate(`/courses/${course.id}`)} 
                className="group bg-zinc-900 border border-zinc-800/80 rounded-2xl overflow-hidden cursor-pointer hover:border-brand-500/50 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-2xl hover:shadow-brand-900/10 flex flex-col"
              >
                <div className="relative h-48 overflow-hidden bg-zinc-850">
                  <img 
                    src={course.imageUrl || 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97'} 
                    alt={course.title}
                    className="w-full h-full object-cover transition duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 to-transparent"></div>
                  <div className="absolute bottom-4 left-4 right-4 flex justify-between items-center">
                    <span className="bg-black/60 backdrop-blur-md px-3 py-1 rounded-full text-xs font-semibold text-zinc-300 flex items-center gap-1">
                      <Clock size={12} className="text-brand-500" /> {course.duration}
                    </span>
                    <span className="bg-black/60 backdrop-blur-md px-3 py-1 rounded-full text-xs font-semibold text-zinc-300 flex items-center gap-1">
                      <Star size={12} className="text-yellow-400 fill-yellow-400" /> {course.rating.toFixed(1)}
                    </span>
                  </div>
                </div>

                <div className="p-6 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="text-xl font-bold mb-2 group-hover:text-brand-500 transition line-clamp-1">
                      {course.title}
                    </h3>
                    <p className="text-zinc-400 text-sm mb-4 line-clamp-2">
                      {course.description}
                    </p>
                    <div className="flex items-center gap-2 mb-6">
                      <div className="w-6 h-6 rounded-full bg-brand-500/20 text-brand-500 flex items-center justify-center font-bold text-xs">
                        {course.instructorName.charAt(0)}
                      </div>
                      <span className="text-xs text-zinc-400">By {course.instructorName}</span>
                    </div>
                  </div>

                  <div className="flex justify-between items-center pt-4 border-t border-zinc-800/80">
                    <div className="flex flex-col">
                      <span className="text-zinc-500 text-xs uppercase tracking-wider font-semibold">Price</span>
                      <span className="text-2xl font-bold">${course.price}</span>
                    </div>
                    <button className="px-5 py-2.5 bg-zinc-800 group-hover:bg-brand-600 group-hover:text-white rounded-xl text-sm font-semibold transition-colors duration-300">
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}