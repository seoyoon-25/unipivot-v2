export default function ResourcesLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="flex items-center justify-between">
        <div className="h-8 w-40 bg-zinc-200 rounded" />
        <div className="h-10 w-28 bg-zinc-200 rounded" />
      </div>
      <div className="grid gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-white rounded-2xl border border-zinc-100 shadow-sm p-4">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-zinc-200 rounded" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-48 bg-zinc-200 rounded" />
                <div className="h-3 w-32 bg-zinc-100 rounded" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
