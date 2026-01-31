export default function PublicLoading() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Title placeholder */}
      <div className="mb-8">
        <div className="h-9 w-64 bg-gray-200 rounded animate-pulse mb-3" />
        <div className="h-5 w-96 bg-gray-100 rounded animate-pulse" />
      </div>

      {/* Content lines placeholder */}
      <div className="space-y-3 mb-10">
        <div className="h-4 w-full bg-gray-100 rounded animate-pulse" />
        <div className="h-4 w-5/6 bg-gray-100 rounded animate-pulse" />
        <div className="h-4 w-4/6 bg-gray-100 rounded animate-pulse" />
        <div className="h-4 w-3/4 bg-gray-100 rounded animate-pulse" />
      </div>

      {/* Card grid placeholder */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div
            key={i}
            className="bg-white rounded-xl border border-gray-200 overflow-hidden"
          >
            <div className="h-44 bg-gray-200 animate-pulse" />
            <div className="p-5">
              <div className="h-5 w-3/4 bg-gray-200 rounded animate-pulse mb-3" />
              <div className="h-4 w-full bg-gray-100 rounded animate-pulse mb-2" />
              <div className="h-4 w-2/3 bg-gray-100 rounded animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
