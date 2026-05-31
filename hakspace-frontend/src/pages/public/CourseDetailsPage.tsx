import { useParams } from 'react-router-dom'
export default function CourseDetailsPage() {
  const { id } = useParams()
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-4">Course {id}</h1>
      <p className="text-zinc-400 mb-6">Full course description goes here.</p>
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
        <h2 className="text-xl font-semibold mb-4">Curriculum</h2>
        <p>Modules loading...</p>
      </div>
    </div>
  )
}