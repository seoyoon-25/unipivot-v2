export default function AdminLoading() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Header bar skeleton */}
      <div className="mb-8">
        <div className="h-8 w-48 bg-gray-200 rounded animate-pulse mb-2" />
        <div className="h-4 w-72 bg-gray-100 rounded animate-pulse" />
      </div>

      {/* Stat cards - 4 in a row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="bg-white rounded-xl border border-gray-200 p-5"
          >
            <div className="h-4 w-20 bg-gray-100 rounded animate-pulse mb-3" />
            <div className="h-8 w-16 bg-gray-200 rounded animate-pulse" />
          </div>
        ))}
      </div>

      {/* Table skeleton */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {/* Table header */}
        <div className="border-b border-gray-200 px-6 py-4">
          <div className="flex items-center gap-4">
            <div className="h-5 w-32 bg-gray-200 rounded animate-pulse" />
            <div className="h-5 w-24 bg-gray-100 rounded animate-pulse" />
            <div className="h-5 w-28 bg-gray-100 rounded animate-pulse" />
            <div className="h-5 w-20 bg-gray-100 rounded animate-pulse ml-auto" />
          </div>
        </div>

        {/* Table rows */}
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className="border-b border-gray-100 px-6 py-4 flex items-center gap-4"
          >
            <div className="h-4 w-40 bg-gray-200 rounded animate-pulse" />
            <div className="h-4 w-24 bg-gray-100 rounded animate-pulse" />
            <div className="h-4 w-32 bg-gray-100 rounded animate-pulse" />
            <div className="h-4 w-16 bg-gray-100 rounded animate-pulse ml-auto" />
          </div>
        ))}
      </div>
    </div>
  );
}
