export default function ClubLoading() {
  return (
    <div className="max-w-6xl mx-auto space-y-6 md:space-y-8">
      {/* 인사 영역 스켈레톤 */}
      <div>
        <div className="h-8 w-48 bg-zinc-100 rounded-xl animate-pulse mb-2" />
        <div className="h-5 w-32 bg-zinc-100 rounded-xl animate-pulse" />
      </div>

      {/* 통계 카드 스켈레톤 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="club-card p-5 flex flex-col items-center gap-3">
            <div className="w-10 h-10 bg-zinc-100 rounded-xl animate-pulse" />
            <div className="h-8 w-12 bg-zinc-100 rounded-xl animate-pulse" />
            <div className="h-4 w-16 bg-zinc-100 rounded-xl animate-pulse" />
          </div>
        ))}
      </div>

      {/* 빠른 액션 스켈레톤 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="club-card p-4 flex flex-col items-center gap-2">
            <div className="w-12 h-12 bg-zinc-100 rounded-2xl animate-pulse" />
            <div className="h-4 w-16 bg-zinc-100 rounded-xl animate-pulse" />
          </div>
        ))}
      </div>

      {/* 카드 스켈레톤 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[1, 2].map((i) => (
          <div key={i} className="club-card p-5">
            <div className="h-6 w-32 bg-zinc-100 rounded-xl animate-pulse mb-4" />
            <div className="space-y-3">
              {[1, 2].map((j) => (
                <div key={j} className="h-16 bg-zinc-100 rounded-xl animate-pulse" />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
