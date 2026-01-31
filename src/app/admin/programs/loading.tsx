export default function ProgramsLoading() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Header skeleton */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="h-8 w-40 bg-gray-200 rounded animate-pulse mb-2" />
          <div className="h-4 w-56 bg-gray-100 rounded animate-pulse" />
        </div>
        <div className="h-10 w-28 bg-gray-200 rounded-lg animate-pulse" />
      </div>

      {/* Filter bar skeleton */}
      <div className="flex items-center gap-3 mb-6">
        <div className="h-10 w-48 bg-gray-100 rounded-lg animate-pulse" />
        <div className="h-10 w-32 bg-gray-100 rounded-lg animate-pulse" />
        <div className="h-10 w-32 bg-gray-100 rounded-lg animate-pulse" />
      </div>

      {/* Program card list skeleton */}
      <div className="space-y-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className="bg-white rounded-xl border border-gray-200 p-5 flex items-start gap-5"
          >
            <div className="h-20 w-20 bg-gray-200 rounded-lg animate-pulse shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="h-5 w-2/3 bg-gray-200 rounded animate-pulse mb-3" />
              <div className="h-4 w-full bg-gray-100 rounded animate-pulse mb-2" />
              <div className="h-4 w-1/2 bg-gray-100 rounded animate-pulse" />
            </div>
            <div className="h-6 w-16 bg-gray-100 rounded-full animate-pulse shrink-0" />
          </div>
        ))}
      </div>
    </div>
  );
}
