export default function SearchLoading() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <div className="h-8 w-36 bg-zinc-200 rounded animate-pulse mb-6" />

      {/* 검색바 */}
      <div className="h-12 bg-zinc-100 rounded-xl animate-pulse mb-8" />

      {/* 탭 */}
      <div className="flex gap-4 mb-6 border-b border-zinc-200 pb-2">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-8 w-16 bg-zinc-100 rounded animate-pulse" />
        ))}
      </div>

      {/* 결과 */}
      <div className="space-y-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white rounded-2xl border border-zinc-100 shadow-sm p-4">
            <div className="h-5 w-2/3 bg-zinc-200 rounded animate-pulse mb-2" />
            <div className="h-4 w-full bg-zinc-100 rounded animate-pulse mb-1" />
            <div className="h-3 w-24 bg-zinc-100 rounded animate-pulse" />
          </div>
        ))}
      </div>
    </div>
  )
}
