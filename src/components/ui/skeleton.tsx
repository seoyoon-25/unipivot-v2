import { cn } from "@/lib/utils"
import { Loader2 } from "lucide-react"

// Spinner component
interface SpinnerProps {
  size?: 'xs' | 'sm' | 'md' | 'lg'
  className?: string
}

const spinnerSizeClasses = {
  xs: 'w-3 h-3',
  sm: 'w-4 h-4',
  md: 'w-6 h-6',
  lg: 'w-8 h-8',
}

function Spinner({ size = 'md', className }: SpinnerProps) {
  return (
    <Loader2
      className={cn('animate-spin text-primary', spinnerSizeClasses[size], className)}
    />
  )
}

// Loading Overlay component
interface LoadingOverlayProps {
  message?: string
}

function LoadingOverlay({ message = '로딩 중...' }: LoadingOverlayProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-4">
        <Spinner size="lg" />
        <p className="text-gray-600 font-medium">{message}</p>
      </div>
    </div>
  )
}

// Skeleton component
function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse rounded-lg bg-gray-200", className)}
      {...props}
    />
  )
}

// Card Skeleton component
function CardSkeleton() {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm">
      <Skeleton className="h-48 mb-4" />
      <Skeleton className="h-4 w-3/4 mb-2" />
      <Skeleton className="h-4 w-1/2" />
    </div>
  )
}

// Table Skeleton component
function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-4">
          <Skeleton className="h-10 w-10 rounded-full" />
          <Skeleton className="h-4 flex-1" />
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-24" />
        </div>
      ))}
    </div>
  )
}

export { Spinner, LoadingOverlay, Skeleton, CardSkeleton, TableSkeleton }
