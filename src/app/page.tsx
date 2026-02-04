import type { Metadata } from 'next'
import { getPortalStats } from '@/lib/actions/public'
import PortalPage from '@/components/portal/PortalPage'

export const metadata: Metadata = {
  title: 'UniPivot - 남북청년이 함께 만들어가는 하나된 미래',
  description:
    '유니피벗 포탈 - 유니피벗 홈, 유니클럽, 유니랩, 행복일기. 남북청년이 함께 새로운 한반도를 만들어갑니다.',
  openGraph: {
    title: 'UniPivot Portal',
    description: '남북청년이 함께 만들어가는 하나된 미래',
    url: 'https://bestcome.org',
  },
}

export default async function Page() {
  const stats = await getPortalStats()
  return <PortalPage stats={stats} />
}
