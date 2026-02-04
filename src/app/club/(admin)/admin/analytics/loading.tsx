export default function AnalyticsLoading() {
  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div className="h-8 w-48 bg-zinc-200 rounded animate-pulse" />
        <div className="h-10 w-40 bg-zinc-200 rounded-lg animate-pulse" />
      </div>

      {/* 통계 카드 */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white rounded-2xl border border-zinc-100 shadow-sm p-5">
            <div className="h-4 w-20 bg-zinc-100 rounded animate-pulse mb-3" />
            <div className="h-8 w-16 bg-zinc-200 rounded animate-pulse mb-2" />
            <div className="h-3 w-24 bg-zinc-100 rounded animate-pulse" />
          </div>
        ))}
      </div>

      {/* 차트 영역 */}
      <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm p-6">
        <div className="h-5 w-32 bg-zinc-200 rounded animate-pulse mb-4" />
        <div className="h-80 bg-zinc-50 rounded-lg animate-pulse" />
      </div>

      {/* 하위 페이지 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="p-6 bg-white rounded-2xl border border-zinc-100 shadow-sm">
            <div className="h-5 w-5 bg-zinc-200 rounded animate-pulse mb-3" />
            <div className="h-5 w-24 bg-zinc-200 rounded animate-pulse mb-2" />
            <div className="h-4 w-32 bg-zinc-100 rounded animate-pulse" />
          </div>
        ))}
      </div>
    </div>
  )
}
