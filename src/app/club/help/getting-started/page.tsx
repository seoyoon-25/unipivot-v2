import { helpGuides } from '@/data/help-content'
import MarkdownContent from '@/components/club/help/MarkdownContent'
import HelpBreadcrumb from '@/components/club/help/HelpBreadcrumb'

export const metadata = { title: '시작하기 | 도움말 | 유니클럽' }

export default function GettingStartedPage() {
  const guide = helpGuides.find((g) => g.slug === 'getting-started')!

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <HelpBreadcrumb current={guide.title} />
      <MarkdownContent content={guide.content} />
    </div>
  )
}
