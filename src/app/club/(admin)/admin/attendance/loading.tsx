export default function AttendanceLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-8 w-48 bg-zinc-200 rounded" />
      <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm p-6">
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4">
              <div className="w-10 h-10 bg-zinc-200 rounded-full" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-32 bg-zinc-200 rounded" />
                <div className="h-3 w-20 bg-zinc-100 rounded" />
              </div>
              <div className="h-6 w-16 bg-zinc-200 rounded" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
