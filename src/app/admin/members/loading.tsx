export default function MembersLoading() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Header skeleton */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="h-8 w-36 bg-gray-200 rounded animate-pulse mb-2" />
          <div className="h-4 w-48 bg-gray-100 rounded animate-pulse" />
        </div>
        <div className="h-10 w-28 bg-gray-200 rounded-lg animate-pulse" />
      </div>

      {/* Search bar skeleton */}
      <div className="mb-6">
        <div className="h-10 w-full max-w-md bg-gray-100 rounded-lg animate-pulse" />
      </div>

      {/* Table skeleton */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {/* Table header */}
        <div className="border-b border-gray-200 px-6 py-3 bg-gray-50">
          <div className="flex items-center gap-6">
            <div className="h-4 w-10 bg-gray-200 rounded animate-pulse" />
            <div className="h-4 w-20 bg-gray-200 rounded animate-pulse" />
            <div className="h-4 w-32 bg-gray-200 rounded animate-pulse" />
            <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
            <div className="h-4 w-20 bg-gray-200 rounded animate-pulse ml-auto" />
          </div>
        </div>

        {/* Table rows */}
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div
            key={i}
            className="border-b border-gray-100 px-6 py-4 flex items-center gap-6"
          >
            <div className="h-9 w-9 bg-gray-200 rounded-full animate-pulse shrink-0" />
            <div className="h-4 w-20 bg-gray-200 rounded animate-pulse" />
            <div className="h-4 w-40 bg-gray-100 rounded animate-pulse" />
            <div className="h-4 w-24 bg-gray-100 rounded animate-pulse" />
            <div className="h-6 w-16 bg-gray-100 rounded-full animate-pulse ml-auto" />
          </div>
        ))}
      </div>
    </div>
  );
}
