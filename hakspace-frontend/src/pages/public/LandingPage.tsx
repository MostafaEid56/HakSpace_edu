import { useNavigate } from 'react-router-dom'
export default function LandingPage() {
  const navigate = useNavigate()
  return (
    <div className="py-20 text-center">
      <h1 className="text-5xl font-bold mb-6">Master the Future of Tech</h1>
      <p className="text-xl text-zinc-400 mb-8">Expert-led courses in web dev, data science, and AI.</p>
      <button onClick={() => navigate('/courses')} className="bg-brand-600 px-8 py-4 rounded-xl font-semibold">
        Explore Courses
      </button>
    </div>
  )
}