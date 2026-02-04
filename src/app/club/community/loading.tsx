export default function CommunityLoading() {
  return (
    <div className="max-w-3xl mx-auto">
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-6">
        <div className="h-8 w-32 bg-zinc-100 rounded-xl animate-pulse" />
        <div className="h-11 w-28 bg-zinc-100 rounded-xl animate-pulse" />
      </div>

      {/* 게시글 목록 */}
      <div className="space-y-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="club-card p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-zinc-100 animate-pulse" />
              <div className="space-y-1.5">
                <div className="h-4 w-20 bg-zinc-100 rounded-xl animate-pulse" />
                <div className="h-3 w-16 bg-zinc-100 rounded-xl animate-pulse" />
              </div>
            </div>
            <div className="space-y-2 mb-4">
              <div className="h-5 w-3/4 bg-zinc-100 rounded-xl animate-pulse" />
              <div className="h-4 w-full bg-zinc-100 rounded-xl animate-pulse" />
              <div className="h-4 w-2/3 bg-zinc-100 rounded-xl animate-pulse" />
            </div>
            <div className="flex gap-4">
              <div className="h-4 w-12 bg-zinc-100 rounded-xl animate-pulse" />
              <div className="h-4 w-12 bg-zinc-100 rounded-xl animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
