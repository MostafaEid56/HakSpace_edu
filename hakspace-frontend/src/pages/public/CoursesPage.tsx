import { useNavigate } from 'react-router-dom'
export default function CoursesPage() {
  const navigate = useNavigate()
  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold mb-8">Course Catalog</h1>
      <div className="grid md:grid-cols-3 gap-6">
        {[1,2,3].map(i => (
          <div key={i} onClick={() => navigate(`/courses/${i}`)} 
            className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 cursor-pointer hover:border-brand-500">
            <h3 className="text-xl font-semibold mb-2">Course {i}</h3>
            <p className="text-zinc-400 mb-4">Learn modern development practices.</p>
            <div className="flex justify-between items-center">
              <span className="text-2xl font-bold">$99</span>
              <button className="px-4 py-2 bg-brand-600 rounded-lg">Enroll</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}