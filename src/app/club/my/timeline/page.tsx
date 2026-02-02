import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth/check-role'
import { getTimeline, type TimelineItemType } from '@/lib/club/timeline-queries'
import Timeline from '@/components/club/timeline/Timeline'
import TimelineFilter from '@/components/club/timeline/TimelineFilter'

export const metadata = { title: '나의 독서 기록 | 유니클럽' }

interface PageProps {
  searchParams: Promise<{ type?: string }>
}

export default async function TimelinePage({ searchParams }: PageProps) {
  const user = await getCurrentUser()
  if (!user) {
    redirect('/login?callbackUrl=' + encodeURIComponent('/club/my/timeline'))
  }

  const { type: rawType } = await searchParams
  const type = (['attendance', 'report', 'quote'].includes(rawType || '')
    ? rawType
    : 'all') as TimelineItemType | 'all'

  const { items, nextCursor } = await getTimeline(user.id, { type })

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">나의 독서 기록</h1>

      <TimelineFilter currentType={type} />

      <Timeline
        initialItems={items.map((item) => ({
          ...item,
          createdAt: item.createdAt.toISOString(),
        }))}
        initialCursor={nextCursor}
        type={type}
      />
    </div>
  )
}
