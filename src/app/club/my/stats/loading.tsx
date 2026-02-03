export default function StatsLoading() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <div className="h-8 w-32 bg-gray-200 rounded animate-pulse mb-6" />

      {/* 통계 카드 */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="h-4 w-16 bg-gray-100 rounded animate-pulse mb-2" />
            <div className="h-8 w-12 bg-gray-200 rounded animate-pulse" />
          </div>
        ))}
      </div>

      {/* 차트 영역 */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <div className="h-5 w-28 bg-gray-200 rounded animate-pulse mb-4" />
        <div className="h-64 bg-gray-50 rounded-lg animate-pulse" />
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="h-5 w-28 bg-gray-200 rounded animate-pulse mb-4" />
        <div className="h-64 bg-gray-50 rounded-lg animate-pulse" />
      </div>
    </div>
  )
}
