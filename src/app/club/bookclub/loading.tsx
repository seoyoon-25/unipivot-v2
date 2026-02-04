export default function BookclubLoading() {
  return (
    <div className="max-w-6xl mx-auto">
      {/* 헤더 */}
      <div className="h-8 w-48 bg-zinc-100 rounded-xl animate-pulse mb-6" />

      {/* 탭 */}
      <div className="flex gap-3 mb-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-10 w-24 bg-zinc-100 rounded-xl animate-pulse" />
        ))}
      </div>

      {/* 책 그리드 */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
          <div key={i} className="club-card overflow-hidden">
            <div className="aspect-[3/4] bg-zinc-100 animate-pulse" />
            <div className="p-4 space-y-2">
              <div className="h-4 bg-zinc-100 rounded-xl animate-pulse" />
              <div className="h-3 w-2/3 bg-zinc-100 rounded-xl animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
