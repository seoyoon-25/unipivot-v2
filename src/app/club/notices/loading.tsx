export default function NoticesLoading() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      <div className="h-7 bg-gray-200 rounded w-32 mb-6 animate-pulse" />
      <div className="space-y-2">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="bg-white rounded-lg border border-gray-100 p-4 animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
            <div className="flex gap-3">
              <div className="h-3 bg-gray-100 rounded w-16" />
              <div className="h-3 bg-gray-100 rounded w-20" />
              <div className="h-3 bg-gray-100 rounded w-12" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
