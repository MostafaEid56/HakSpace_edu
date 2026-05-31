export default function DashboardPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Overview</h1>
      <div className="grid md:grid-cols-3 gap-6">
        {[{t:'Revenue',v:'$124,500'},{t:'Students',v:'3,492'},{t:'Completions',v:'845'}].map((c,i) => (
          <div key={i} className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
            <p className="text-zinc-400 mb-2">{c.t}</p>
            <p className="text-2xl font-bold">{c.v}</p>
          </div>
        ))}
      </div>
    </div>
  )
}