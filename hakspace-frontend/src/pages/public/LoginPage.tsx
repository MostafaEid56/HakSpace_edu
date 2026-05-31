import { useNavigate } from 'react-router-dom'
export default function LoginPage() {
  const navigate = useNavigate()
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-xl p-8">
        <h2 className="text-2xl font-bold mb-6">Welcome Back</h2>
        <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); navigate('/'); }}>
          <input className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white" placeholder="Email"/>
          <input type="password" className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white" placeholder="Password"/>
          <button type="submit" className="w-full bg-brand-600 py-3 rounded-lg font-semibold">Log In</button>
        </form>
      </div>
    </div>
  )
}