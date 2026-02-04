export default function UniClubLoading() {
  return (
    <div className="animate-pulse bg-zinc-50">
      {/* Hero Skeleton */}
      <div className="bg-gradient-to-br from-blue-600/20 to-indigo-800/20 pt-24 pb-20 md:pt-32 md:pb-28">
        <div className="max-w-6xl mx-auto px-4 lg:px-8">
          <div className="max-w-xl">
            <div className="h-3 w-28 bg-blue-300/20 rounded mb-4" />
            <div className="h-10 w-72 bg-blue-300/20 rounded mb-2" />
            <div className="h-10 w-56 bg-blue-300/20 rounded mb-5" />
            <div className="h-5 w-80 bg-blue-300/20 rounded mb-10" />
            <div className="flex gap-3">
              <div className="h-12 w-36 bg-blue-300/20 rounded-full" />
              <div className="h-12 w-28 bg-blue-300/20 rounded-full" />
            </div>
          </div>
          <div className="flex gap-8 mt-14 pt-8 border-t border-white/10">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i}>
                <div className="h-7 w-16 bg-blue-300/20 rounded mb-1" />
                <div className="h-3 w-14 bg-blue-300/20 rounded" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Menu Skeleton */}
      <div className="py-12 md:py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4 lg:px-8">
          <div className="grid grid-cols-4 gap-2 sm:gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="flex flex-col items-center gap-2.5 p-3">
                <div className="w-14 h-14 rounded-2xl bg-zinc-100" />
                <div className="h-3 w-10 bg-zinc-100 rounded" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Books Skeleton */}
      <div className="py-16 md:py-24">
        <div className="max-w-6xl mx-auto px-4 lg:px-8">
          <div className="h-3 w-24 bg-zinc-200 rounded mb-2" />
          <div className="h-7 w-40 bg-zinc-200 rounded mb-8" />
          <div className="flex gap-5 overflow-hidden">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex-shrink-0 w-[148px]">
                <div className="w-[148px] h-[210px] rounded-xl bg-zinc-100" />
                <div className="h-4 w-24 bg-zinc-100 rounded mt-3" />
                <div className="h-3 w-16 bg-zinc-100 rounded mt-1.5" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Schedule Skeleton */}
      <div className="py-16 md:py-24 bg-white">
        <div className="max-w-6xl mx-auto px-4 lg:px-8">
          <div className="h-3 w-20 bg-zinc-200 rounded mb-2" />
          <div className="h-7 w-36 bg-zinc-200 rounded mb-8" />
          <div className="flex justify-center mb-8">
            <div className="flex gap-1.5 p-1 bg-zinc-100 rounded-2xl">
              {Array.from({ length: 7 }).map((_, i) => (
                <div key={i} className="w-12 h-16 rounded-xl bg-zinc-50" />
              ))}
            </div>
          </div>
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4 p-4 rounded-xl bg-zinc-50">
                <div className="w-16 h-10 bg-zinc-200 rounded" />
                <div className="w-px h-12 bg-zinc-200" />
                <div className="flex-1">
                  <div className="h-4 w-40 bg-zinc-200 rounded mb-2" />
                  <div className="h-3 w-32 bg-zinc-100 rounded" />
                </div>
                <div className="h-9 w-14 bg-zinc-200 rounded-lg" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Events Skeleton */}
      <div className="py-16 md:py-24">
        <div className="max-w-6xl mx-auto px-4 lg:px-8">
          <div className="h-3 w-16 bg-zinc-200 rounded mb-2" />
          <div className="h-7 w-44 bg-zinc-200 rounded mb-8" />
          <div className="flex gap-2 mb-8">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-9 w-20 rounded-full bg-zinc-100" />
            ))}
          </div>
          <div className="max-w-2xl mx-auto rounded-2xl overflow-hidden bg-white">
            <div className="w-full aspect-[16/9] bg-zinc-100" />
            <div className="p-5">
              <div className="h-4 w-full bg-zinc-100 rounded mb-2" />
              <div className="h-3 w-3/4 bg-zinc-100 rounded mb-4" />
              <div className="h-3 w-40 bg-zinc-100 rounded" />
            </div>
          </div>
          <div className="flex justify-center gap-1.5 mt-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className={`rounded-full bg-zinc-200 ${i === 0 ? 'w-6 h-2' : 'w-2 h-2'}`} />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
