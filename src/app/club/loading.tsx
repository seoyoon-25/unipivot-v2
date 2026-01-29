export default function ClubLoading() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      {/* 인사 영역 스켈레톤 */}
      <div className="mb-6">
        <div className="h-8 w-48 bg-gray-200 rounded animate-pulse mb-2" />
        <div className="h-5 w-32 bg-gray-100 rounded animate-pulse" />
      </div>

      {/* 통계 카드 스켈레톤 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="h-8 w-12 bg-gray-200 rounded animate-pulse mx-auto mb-2" />
            <div className="h-4 w-16 bg-gray-100 rounded animate-pulse mx-auto" />
          </div>
        ))}
      </div>

      {/* 빠른 액션 스켈레톤 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="h-10 w-10 bg-gray-200 rounded-lg animate-pulse mx-auto mb-2" />
            <div className="h-4 w-16 bg-gray-100 rounded animate-pulse mx-auto" />
          </div>
        ))}
      </div>

      {/* 카드 스켈레톤 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[1, 2].map((i) => (
          <div key={i} className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="h-6 w-32 bg-gray-200 rounded animate-pulse mb-4" />
            <div className="space-y-3">
              {[1, 2].map((j) => (
                <div key={j} className="h-16 bg-gray-100 rounded-lg animate-pulse" />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
