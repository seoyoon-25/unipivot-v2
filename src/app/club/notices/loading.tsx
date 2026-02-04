export default function NoticesLoading() {
  return (
    <div className="max-w-3xl mx-auto">
      <div className="h-7 bg-zinc-100 rounded-xl w-32 mb-6 animate-pulse" />
      <div className="space-y-2">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="club-card p-4 animate-pulse">
            <div className="h-4 bg-zinc-100 rounded-xl w-3/4 mb-2" />
            <div className="flex gap-3">
              <div className="h-3 bg-zinc-100 rounded-xl w-16" />
              <div className="h-3 bg-zinc-100 rounded-xl w-20" />
              <div className="h-3 bg-zinc-100 rounded-xl w-12" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
