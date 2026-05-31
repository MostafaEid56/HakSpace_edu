export default function LeadsPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Leads Management</h1>
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
        {[1,2,3].map(i => (
          <div key={i} className="p-4 border-b border-zinc-800 flex justify-between items-center">
            <div>
              <h3 className="font-semibold">Lead {i}</h3>
              <p className="text-sm text-zinc-400">+1 (555) 000-000{i}</p>
            </div>
            <span className="px-3 py-1 bg-zinc-800 rounded-full text-xs">NEW</span>
          </div>
        ))}
      </div>
    </div>
  )
}